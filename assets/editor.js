/* Code editor + Python runner.
   - mountEditor(host, { code, title, key, expected, bare, onRun, onChange }) -> api
   - Editor(host, { value, onRun, onChange, label }) -> api   (same thing, spec-style names)
   - PyRunner: Pyodide in a Web Worker (Stop always works, even while Python is booting)
   - openPlayground(): full-screen scratch editor                                          */
(function () {
  /* ======================================================================
     1. Python runtime (Web Worker)
     ====================================================================== */
  const PYODIDE_VERSION = "0.27.7";
  // One place to switch to a local copy later: set window.PYODIDE_BASE = "vendor/pyodide/"
  const pyodideBase = () => window.PYODIDE_BASE || `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

  // Python helpers that live inside the worker
  const DRIVER = String.raw`
import sys, time, json, traceback, io, contextlib
_FN = "<your code>"

def _fmt(e):
    if isinstance(e, SyntaxError) and e.filename == _FN:
        text = (e.text or "").rstrip("\n").strip()
        out = ['  File "<your code>", line %s' % e.lineno]
        if text:
            out.append("    " + text)
        out.append("%s: %s" % (type(e).__name__, e.msg))
        return "\n".join(out), e.lineno
    frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == _FN]
    out = ["Traceback (most recent call last):"]
    for f in frames:
        out.append('  File "<your code>", line %d, in %s' % (f.lineno, f.name))
        if f.line:
            out.append("    " + f.line.strip())
    msg = str(e)
    out.append(type(e).__name__ + (": " + msg if msg else ""))
    if isinstance(e, EOFError):
        out.append("(Your code called input() more times than there are input lines.)")
    return "\n".join(out), (frames[-1].lineno if frames else None)

def _run(src):
    g = {"__name__": "__main__"}
    t = time.perf_counter()
    try:
        exec(compile(src, _FN, "exec"), g)
    except SystemExit:
        pass
    except BaseException as e:
        msg, line = _fmt(e)
        return json.dumps({"ok": False, "ms": (time.perf_counter() - t) * 1000, "error": msg, "line": line})
    return json.dumps({"ok": True, "ms": (time.perf_counter() - t) * 1000})

class _Cap(BaseException):
    pass

def _safe(v):
    try:
        r = repr(v)
    except Exception:
        r = "<unprintable>"
    return r if len(r) <= 80 else r[:77] + "..."

def _trace(src, cap):
    steps, buf, g = [], io.StringIO(), {"__name__": "__main__"}
    state = {"capped": False}
    def snap(frame):
        out = {}
        for k, v in list(frame.f_locals.items()):
            if k.startswith("__") or callable(v) or type(v).__name__ == "module":
                continue
            out[k] = _safe(v)
            if len(out) >= 16:
                break
        return out
    def tracer(frame, event, arg):
        if frame.f_code.co_filename != _FN:
            return None
        if event in ("line", "return"):
            if len(steps) >= cap:
                state["capped"] = True
                raise _Cap()
            steps.append({"line": frame.f_lineno, "fn": frame.f_code.co_name, "ev": event,
                          "vars": snap(frame), "out": len(buf.getvalue()),
                          "ret": _safe(arg) if event == "return" and frame.f_code.co_name != "<module>" else None})
        return tracer
    err, line = None, None
    try:
        code = compile(src, _FN, "exec")
        with contextlib.redirect_stdout(buf):
            sys.settrace(tracer)
            try:
                exec(code, g)
            finally:
                sys.settrace(None)
    except _Cap:
        pass
    except SystemExit:
        pass
    except BaseException as e:
        err, line = _fmt(e)
    return json.dumps({"steps": steps, "out": buf.getvalue(), "error": err, "line": line, "capped": state["capped"]})
`;

  const workerSrc = (base) => `
let py = null, runFn = null, traceFn = null;
const ready = (async () => {
  importScripts("${base}pyodide.js");
  py = await loadPyodide({ indexURL: "${base}" });
  py.runPython(${JSON.stringify(DRIVER)});
  runFn = py.globals.get("_run");
  traceFn = py.globals.get("_trace");
  postMessage({ type: "ready" });
})();
ready.catch((e) => postMessage({ type: "booterror", text: String((e && e.message) || e) }));
onmessage = async (e) => {
  const { id, kind, code, stdin, cap } = e.data;
  try { await ready; } catch (err) { return; }
  const lines = (stdin || "").split("\\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  py.setStdin({ stdin: () => (lines.length ? lines.shift() : null) });
  py.setStdout({ batched: (s) => postMessage({ id, type: "out", text: s + "\\n" }) });
  py.setStderr({ batched: (s) => postMessage({ id, type: "err", text: s + "\\n" }) });
  try {
    await py.loadPackagesFromImports(code);
    if (kind === "trace") {
      const r = JSON.parse(traceFn(code, cap || 500));
      postMessage(Object.assign({ id, type: "trace" }, r));
    } else {
      const r = JSON.parse(runFn(code));
      postMessage(r.ok ? { id, type: "done", ms: r.ms } : { id, type: "error", text: r.error, line: r.line, ms: r.ms });
    }
  } catch (err) {
    postMessage({ id, type: "error", text: String((err && err.message) || err) });
  }
};`;

  const LOAD_FAIL = "Could not load Python. Check your internet connection (it downloads once, about 10 MB).";
  let worker = null, ready = false, seq = 0, current = null;
  const readyListeners = new Set();
  const FINAL = new Set(["done", "error", "trace", "stopped"]);

  function boot() {
    const url = URL.createObjectURL(new Blob([workerSrc(pyodideBase())], { type: "text/javascript" }));
    worker = new Worker(url);
    ready = false;
    worker.onmessage = (e) => {
      const m = e.data;
      if (m.type === "ready") { ready = true; readyListeners.forEach((f) => f()); return; }
      if (m.type === "booterror") { if (current) current.on({ id: current.id, type: "error", text: LOAD_FAIL }); worker.terminate(); worker = null; return; }
      if (current && m.id === current.id) current.on(m);
    };
    worker.onerror = () => { if (current) current.on({ id: current.id, type: "error", text: LOAD_FAIL }); };
  }

  window.PyRunner = {
    // on(message): message.type is out | err | done | error | trace | stopped
    run(code, on, opts = {}) {
      if (current) this.stop();              // never let a stuck job block the next one
      if (!worker) boot();
      const id = ++seq;
      current = { id, on: (m) => { on(m); if (FINAL.has(m.type) && current && current.id === id) current = null; } };
      worker.postMessage({ id, kind: opts.trace ? "trace" : "run", code, stdin: opts.stdin || "", cap: opts.cap || 500 });
      return id;
    },
    stop() {
      if (worker) worker.terminate();        // kills infinite loops and an in-progress boot alike
      worker = null; ready = false;
      const c = current; current = null;
      if (c) c.on({ id: c.id, type: "stopped" });
    },
    get ready() { return ready; },
    get busy() { return !!current; },
    onReady(f) { readyListeners.add(f); },
    warm() { if (!worker) boot(); }
  };

  /* ======================================================================
     2. Highlighter
     ====================================================================== */
  const KW = new Set("and as assert async await break class continue def del elif else except finally for from global if import in is lambda match case nonlocal not or pass raise return try while with yield None True False".split(" "));
  const BI = new Set(("print len range enumerate zip sorted reversed min max sum abs list dict set frozenset tuple str int float bool bytes map filter any all isinstance issubclass divmod pow round ord chr iter next super type id hash repr input open object property staticmethod classmethod getattr setattr hasattr callable format bin hex oct " +
    "heapq deque defaultdict Counter OrderedDict bisect_left bisect_right insort heappush heappop heapify heappushpop nlargest nsmallest lru_cache cache reduce cmp_to_key accumulate combinations permutations product groupby math inf " +
    "ValueError KeyError IndexError TypeError Exception StopIteration ZeroDivisionError").split(" "));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const RE = /(#[^\n]*)|((?:\b[rRbBfFuU]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?))|(^[ \t]*@[A-Za-z_][\w.]*)|(\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?j?)\b)|([A-Za-z_]\w*)|([-+*/%=<>!&|^~@]+)/gm;
  function highlight(code) {
    let out = "", last = 0, m, prev = "";
    RE.lastIndex = 0;
    while ((m = RE.exec(code))) {
      if (m[0] === "") { RE.lastIndex++; continue; }
      out += esc(code.slice(last, m.index));
      const t = esc(m[0]);
      if (m[1]) out += `<span class="tk-c">${t}</span>`;
      else if (m[2]) out += `<span class="tk-s">${t}</span>`;
      else if (m[3]) out += `<span class="tk-d">${t}</span>`;
      else if (m[4]) out += `<span class="tk-n">${t}</span>`;
      else if (m[5]) {
        const w = m[5];
        if (prev === "def") out += `<span class="tk-f">${t}</span>`;
        else if (prev === "class") out += `<span class="tk-cl">${t}</span>`;
        else if (KW.has(w)) out += `<span class="tk-k">${t}</span>`;
        else if (w === "self" || w === "cls") out += `<span class="tk-self">${t}</span>`;
        else if (BI.has(w)) out += `<span class="tk-b">${t}</span>`;
        else out += t;
        prev = w;
      } else out += `<span class="tk-o">${t}</span>`;
      last = m.index + m[0].length;
    }
    out += esc(code.slice(last));
    // a trailing space keeps the final empty line the same height as in the textarea
    return out + (code.endsWith("\n") || code === "" ? " " : "") + "\n";
  }
  window.highlightPy = (code) => highlight(code);

  /* ======================================================================
     3. Small icon set (line style, currentColor)
     ====================================================================== */
  const S = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    play: S('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
    stop: S('<rect x="6" y="6" width="12" height="12" fill="currentColor"/>'),
    step: S('<path d="M5 5v14"/><path d="M9 6l10 6-10 6z"/>'),
    reset: S('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    copy: S('<rect x="9" y="9" width="12" height="12" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>'),
    up: S('<path d="M6 15l6-6 6 6"/>'),
    down: S('<path d="M6 9l6 6 6-6"/>'),
    wrap: S('<path d="M3 6h18M3 12h14a3 3 0 0 1 0 6h-4"/><path d="M15 15l-3 3 3 3"/><path d="M3 18h6"/>'),
    keys: S('<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>'),
    tab: S('<path d="M4 12h14"/><path d="M14 7l5 5-5 5"/><path d="M21 5v14"/>'),
    prev: S('<path d="M15 18l-6-6 6-6"/>'),
    next: S('<path d="M9 18l6-6-6-6"/>'),
    input: S('<path d="M4 7h16M4 12h10M4 17h7"/>')
  };

  /* ======================================================================
     4. Editor
     ====================================================================== */
  const PAIRS = { "(": ")", "[": "]", "{": "}", '"': '"', "'": "'" };
  const CLOSERS = new Set([")", "]", "}"]);
  const AFTER_OK = /^$|^[\s)\]}:,;]/;          // auto-close only before these
  const BRACKETS = { "(": ")", "[": "]", "{": "}", ")": "(", "]": "[", "}": "{" };
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || "");
  const store = (k, d) => { try { return (window.Store ? Store.get(k, d) : d); } catch (e) { return d; } };
  const storeSet = (k, v) => { try { window.Store && Store.set(k, v); } catch (e) {} };
  const say = (m) => (window.toast ? toast(m) : null);

  const SHORTCUTS = [
    ["Ctrl+Enter", "Run"], ["Ctrl+/", "Toggle comment"], ["Tab / Shift+Tab", "Indent / outdent"],
    ["Alt+↑ / Alt+↓", "Move line(s)"], ["Shift+Alt+↑ / ↓", "Copy line(s) up / down"], ["Ctrl+Shift+K", "Delete line(s)"],
    ["Shift+Enter", "New line below"], ["Ctrl+Shift+Enter", "New line above"], ["Ctrl+D", "Select word / next match"],
    ["Ctrl+L", "Select line (repeat to extend)"], ["Home", "Smart home"], ["Ctrl+] / Ctrl+[", "Indent / outdent"],
    ["Ctrl+F", "Find"], ["Ctrl+S", "Save now"], ["Alt+Z", "Word wrap"], ["Ctrl+= / Ctrl+-", "Font size"],
    ["Ctrl+Z / Ctrl+Y", "Undo / redo"], ["Esc", "Leave the editor"]
  ];

  window.mountEditor = function (host, opt = {}) {
    const original = String(opt.code ?? "").replace(/\s+$/, "");
    const saveKey = "code:" + (opt.key || "scratch");
    const bare = !!opt.bare;
    let code = store(saveKey, undefined) ?? original;
    host.classList.add("ed");
    if (store("edWrap", false)) host.classList.add("wrap");
    host.style.setProperty("--ed-fs", store("edFs", 13.5) + "px");

    host.innerHTML = `
      <div class="ed-bar">
        <span class="ed-title"><span class="ed-dot"></span>${esc(opt.title || "solution.py")}</span>
        ${bare ? "" : `<button class="btn sm green run" title="Run (Ctrl+Enter)">${I.play}<span>Run</span></button>
        <button class="btn sm step" title="Step through your code line by line">${I.step}<span class="hide-s">Step</span></button>`}
        <button class="ib tabkey ed-tabkey" title="Insert a tab (4 spaces)" aria-label="Insert tab">${I.tab}</button>
        <button class="ib find-btn" title="Find (Ctrl+F)" aria-label="Find">${I.search}</button>
        <button class="ib wrap-btn ${host.classList.contains("wrap") ? "on" : ""}" title="Word wrap (Alt+Z)" aria-label="Toggle word wrap">${I.wrap}</button>
        <button class="ib keys-btn" title="Keyboard shortcuts" aria-label="Keyboard shortcuts">${I.keys}</button>
        <button class="ib reset" title="Reset to the starter code" aria-label="Reset code">${I.reset}</button>
        <button class="ib copy" title="Copy code" aria-label="Copy code">${I.copy}</button>
      </div>
      <div class="ed-keys" hidden>${SHORTCUTS.map(([k, d]) => `<div><kbd>${k}</kbd><span>${d}</span></div>`).join("")}</div>
      <div class="ed-find" hidden>
        <input type="text" placeholder="Find" aria-label="Find in code" spellcheck="false">
        <button class="ib case" title="Match case" aria-label="Match case"><b style="font:700 12px var(--f-mono)">Aa</b></button>
        <span class="cnt">0/0</span>
        <button class="ib fprev" title="Previous (Shift+Enter)" aria-label="Previous match">${I.up}</button>
        <button class="ib fnext" title="Next (Enter)" aria-label="Next match">${I.down}</button>
        <button class="ib fclose" title="Close (Esc)" aria-label="Close find">${I.x}</button>
      </div>
      <div class="ed-scroll"><div class="ed-inner"><div class="ed-body">
        <div class="ed-ov" aria-hidden="true"></div>
        <div class="ed-gutter" aria-hidden="true"></div>
        <pre aria-hidden="true"></pre>
        <textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${esc(opt.ariaLabel || "Python code editor")}"></textarea>
        <div class="ed-mirror" aria-hidden="true"></div>
        <span class="ed-measure" aria-hidden="true">${"x".repeat(50)}</span>
        <div class="ed-probe"></div>
      </div></div></div>
      ${bare ? "" : `
      <div class="ed-stdin" hidden>
        <label>Input for <code>input()</code> — one line per call</label>
        <textarea rows="3" spellcheck="false" aria-label="Program input"></textarea>
      </div>
      <div class="ed-out" hidden>
        <div class="ed-out-head">Output <span class="st"></span><button class="ib stdin-btn" title="Program input" aria-label="Program input" hidden>${I.input}</button><button class="ib clr" title="Clear output" aria-label="Clear output" hidden>${I.x}</button></div>
        <pre class="ed-pre"></pre>
      </div>
      <div class="ed-trace" hidden></div>`}
      ${opt.expected != null ? `<div class="ed-expected">Expected output: <b class="mono">${esc(opt.expected)}</b></div>` : ""}`;

    const $ = (s) => host.querySelector(s);
    const ta = $(".ed-body textarea"), pre = $(".ed-body pre"), gut = $(".ed-gutter"), ov = $(".ed-ov");
    const mirror = $(".ed-mirror"), measure = $(".ed-measure"), probe = $(".ed-probe"), dot = $(".ed-dot");
    const findBar = $(".ed-find"), findIn = findBar.querySelector("input"), findCnt = findBar.querySelector(".cnt");
    ta.value = code;

    /* ---------- measurement ---------- */
    let lh = 22, cw = 8, padT = 14, padL = 52;
    function measureFont() {
      const cs = getComputedStyle(pre);
      lh = parseFloat(cs.lineHeight) || lh;
      padT = parseFloat(cs.paddingTop) || 0;
      padL = parseFloat(cs.paddingLeft) || 0;
      cw = measure.getBoundingClientRect().width / 50 || cw;
    }
    const wrapOn = () => host.classList.contains("wrap");

    /* ---------- painting ---------- */
    let errLine = null, stepLine = null, lineTops = null;
    function paint() {
      const v = ta.value;
      pre.innerHTML = highlight(v);
      const lines = v.split("\n");
      let heights = null;
      if (wrapOn()) {                       // measure wrapped line heights with a hidden mirror
        mirror.style.width = pre.clientWidth + "px";
        mirror.innerHTML = lines.map((l) => `<div>${esc(l) || " "}</div>`).join("");
        heights = [...mirror.children].map((d) => d.getBoundingClientRect().height);
        lineTops = []; let y = padT;
        heights.forEach((h) => { lineTops.push(y); y += h; });
      } else lineTops = null;
      gut.innerHTML = lines.map((_, i) => `<div class="${i + 1 === errLine ? "err" : ""}${i + 1 === stepLine ? " cur" : ""}" style="height:${heights ? heights[i] : lh}px">${i + 1}</div>`).join("");
      dot.classList.toggle("edited", v !== original);
      decorate();
    }
    const topOf = (line) => (lineTops ? lineTops[line] ?? padT + line * lh : padT + line * lh);
    function posOf(i) {
      const v = ta.value;
      let line = 0, ls = 0;
      for (let k = v.indexOf("\n"); k !== -1 && k < i; k = v.indexOf("\n", k + 1)) { line++; ls = k + 1; }
      return { line, col: i - ls };
    }

    /* ---------- decorations: bands, bracket boxes, find hits ---------- */
    let findHits = [], findCur = -1;
    function decorate() {
      let html = "";
      if (errLine) html += `<div class="ed-band err" style="top:${topOf(errLine - 1)}px;height:${lh}px"></div>`;
      if (stepLine) html += `<div class="ed-band cur" style="top:${topOf(stepLine - 1)}px;height:${lh}px"></div>`;
      if (!wrapOn()) {
        const box = (i, cls) => { const p = posOf(i); return `<div class="${cls}" style="left:${padL + p.col * cw}px;top:${padT + p.line * lh}px;width:${cw}px;height:${lh}px"></div>`; };
        const q = findIn.value;
        if (!findBar.hidden && q) findHits.slice(0, 400).forEach((h, k) => {
          const p = posOf(h);
          html += `<div class="ed-hit${k === findCur ? " cur" : ""}" style="left:${padL + p.col * cw}px;top:${padT + p.line * lh}px;width:${q.length * cw}px;height:${lh}px"></div>`;
        });
        const m = matchBracket();
        if (m) html += box(m[0], "ed-box") + box(m[1], "ed-box");
      }
      ov.innerHTML = html;
    }
    // brackets inside strings and comments don't count: blank them out first
    function blanked(v) {
      return v.replace(/#[^\n]*|"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$)|"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/g, (m) => m.replace(/[^\n]/g, " "));
    }
    function matchBracket() {
      if (document.activeElement !== ta || ta.selectionStart !== ta.selectionEnd) return null;
      const s = ta.selectionStart, v = blanked(ta.value);
      let i = BRACKETS[v[s - 1]] ? s - 1 : BRACKETS[v[s]] ? s : -1;
      if (i < 0) return null;
      const ch = v[i], open = "([{".includes(ch), partner = BRACKETS[ch], dir = open ? 1 : -1;
      let depth = 0;
      for (let j = i; j >= 0 && j < v.length; j += dir) {
        if (v[j] === ch) depth++;
        else if (v[j] === partner && --depth === 0) return [i, j];
      }
      return null;
    }

    /* ---------- undoable edits ---------- */
    function edit(start, end, text, selS, selE) {
      if (document.activeElement !== ta) ta.focus({ preventScroll: true });
      ta.setSelectionRange(start, end);
      let ok = false;
      try {
        ok = text ? document.execCommand("insertText", false, text) : (start === end || document.execCommand("delete"));
      } catch (e) { ok = false; }
      if (!ok) {                            // fallback (no native undo, but still correct)
        ta.setRangeText(text, start, end, "end");
        ta.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (selS != null) ta.setSelectionRange(selS, selE ?? selS);
      reveal();
    }
    function reveal(pos = ta.selectionEnd) {
      const p = posOf(pos);
      probe.style.top = topOf(p.line) + "px";
      probe.style.left = (wrapOn() ? padL : padL + p.col * cw) + "px";
      probe.style.height = lh + "px";
      probe.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    const lineStart = (i) => ta.value.lastIndexOf("\n", i - 1) + 1;
    const lineEnd = (i) => { const j = ta.value.indexOf("\n", i); return j < 0 ? ta.value.length : j; };
    // whole lines covering the selection; a selection ending at a line start excludes that line
    function block() {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      const a = lineStart(s);
      const b = e > s && v[e - 1] === "\n" ? e - 1 : lineEnd(e);
      return { a, b, s, e, v };
    }

    /* ---------- line operations ---------- */
    function moveLines(dir) {
      const { a, b, s, e, v } = block(), blk = v.slice(a, b);
      if (dir > 0) {
        if (b >= v.length) return;
        const c = lineEnd(b + 1), nxt = v.slice(b + 1, c);
        edit(a, c, nxt + "\n" + blk, s + nxt.length + 1, e + nxt.length + 1);
      } else {
        if (a === 0) return;
        const p = lineStart(a - 1), prv = v.slice(p, a - 1);
        edit(p, b, blk + "\n" + prv, s - prv.length - 1, e - prv.length - 1);
      }
    }
    function copyLines(dir) {
      const { a, b, s, e, v } = block(), blk = v.slice(a, b);
      if (dir > 0) edit(b, b, "\n" + blk, s + blk.length + 1, e + blk.length + 1);
      else edit(a, a, blk + "\n", s, e);
    }
    function deleteLines() {
      const { a, b, v } = block();
      if (b < v.length) edit(a, b + 1, "", a);
      else if (a > 0) edit(a - 1, b, "", lineStart(a - 1));
      else edit(a, b, "", 0);
    }
    function indentLines(dir) {
      const { a, b, s, e, v } = block(), lines = v.slice(a, b).split("\n"), multi = lines.length > 1;
      let first = 0, total = 0;
      const out = lines.map((ln, i) => {
        if (dir > 0) {
          if (multi && !ln.trim()) return ln;
          if (i === 0) first = 4;
          total += 4;
          return "    " + ln;
        }
        const d = (ln.match(/^ {1,4}/) || [""])[0].length;
        if (i === 0) first = -d;
        total -= d;
        return ln.slice(d);
      });
      if (!total) return;
      const ns = Math.max(a, s + first);
      edit(a, b, out.join("\n"), ns, s === e ? ns : Math.max(ns, e + total));
    }
    function toggleComment() {
      const { a, b, s, e, v } = block(), lines = v.slice(a, b).split("\n");
      const used = lines.filter((l) => l.trim());
      if (!used.length) return;
      const allCommented = used.every((l) => /^\s*#/.test(l));
      let first = 0, total = 0, out;
      if (allCommented) {
        out = lines.map((l, i) => {
          const m = l.match(/^(\s*)# ?/);
          if (!m) return l;
          const d = m[0].length - m[1].length;
          if (i === 0) first = -d;
          total -= d;
          return m[1] + l.slice(m[0].length);
        });
      } else {
        const ind = Math.min(...used.map((l) => l.match(/^\s*/)[0].length));
        out = lines.map((l, i) => {
          if (!l.trim() && lines.length > 1) return l;
          if (i === 0) first = 2;
          total += 2;
          return l.slice(0, ind) + "# " + l.slice(ind);
        });
      }
      const ns = Math.max(a, s + first);
      edit(a, b, out.join("\n"), ns, s === e ? ns : Math.max(ns, e + total));
    }
    function newLine(below) {
      const s = ta.selectionStart, v = ta.value, ls = lineStart(s), le = lineEnd(s), line = v.slice(ls, le);
      let ind = line.match(/^[ \t]*/)[0];
      if (below) {
        if (/[:{([]\s*(#.*)?$/.test(line)) ind += "    ";
        edit(le, le, "\n" + ind, le + 1 + ind.length);
      } else edit(ls, ls, ind + "\n", ls + ind.length);
    }
    function selectWordOrNext() {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      if (s === e) {
        let a = s, b = s;
        while (a > 0 && /\w/.test(v[a - 1])) a--;
        while (b < v.length && /\w/.test(v[b])) b++;
        if (a !== b) ta.setSelectionRange(a, b);
      } else {
        const w = v.slice(s, e);
        let i = v.indexOf(w, e);
        if (i < 0) i = v.indexOf(w);
        if (i >= 0) ta.setSelectionRange(i, i + w.length);
      }
      reveal(); decorate();
    }
    function selectLine() {
      const { a, b, s, e, v } = block();
      const full = e > s && s === a && (e === b + 1 || e === b);
      if (full && b < v.length) ta.setSelectionRange(a, Math.min(lineEnd(b + 1) + 1, v.length));
      else ta.setSelectionRange(a, Math.min(b + 1, v.length));
      reveal();
    }
    function smartHome(shift) {
      const back = ta.selectionDirection === "backward";
      const caret = back ? ta.selectionStart : ta.selectionEnd;
      const anchor = back ? ta.selectionEnd : ta.selectionStart;
      const ls = lineStart(caret), first = ls + ta.value.slice(ls, lineEnd(caret)).match(/^\s*/)[0].length;
      const target = caret === first ? ls : first;
      if (shift) ta.setSelectionRange(Math.min(anchor, target), Math.max(anchor, target), target < anchor ? "backward" : "forward");
      else ta.setSelectionRange(target, target);
      decorate();
    }
    function setFont(delta) {
      const fs = Math.max(10, Math.min(24, store("edFs", 13.5) + delta));
      storeSet("edFs", fs);
      document.querySelectorAll(".ed").forEach((el) => el.style.setProperty("--ed-fs", fs + "px"));
      document.dispatchEvent(new CustomEvent("ed:font"));
      say(`Editor font ${fs}px`);
    }
    function toggleWrap() {
      const on = !wrapOn();
      host.classList.toggle("wrap", on);
      ta.setAttribute("wrap", on ? "soft" : "off");
      $(".wrap-btn").classList.toggle("on", on);
      storeSet("edWrap", on || undefined);
      paint();
      say(on ? "Word wrap on" : "Word wrap off");
    }

    /* ---------- smart typing ---------- */
    function handleChar(ch) {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      if (s !== e) {
        if (!PAIRS[ch]) return false;
        edit(s, e, ch + v.slice(s, e) + PAIRS[ch], s + 1, e + 1);   // wrap and keep the inner text selected
        return true;
      }
      const prev = v[s - 1] || "", next = v[s] || "";
      if (CLOSERS.has(ch) && next === ch) { ta.setSelectionRange(s + 1, s + 1); decorate(); return true; }
      if (ch === '"' || ch === "'") {
        if (next === ch) { ta.setSelectionRange(s + 1, s + 1); decorate(); return true; }   // type over
        if (v.slice(s - 2, s) === ch + ch && v[s - 3] !== ch) { edit(s, s, ch.repeat(4), s + 1); return true; }   // """|"""
        if (prev === "\\") return false;
        if (/\w/.test(prev)) {
          const tok = v.slice(0, s).match(/(\w+)$/)[1];
          if (!/^(?:[rRbBfFuU]|[rR][bBfF]|[bBfF][rR])$/.test(tok)) return false;   // don't, it's -> no pair
        }
        if (/\w/.test(next) || !AFTER_OK.test(next)) return false;
        edit(s, s, ch + ch, s + 1);
        return true;
      }
      if (PAIRS[ch]) {
        if (!AFTER_OK.test(next)) return false;
        edit(s, s, ch + PAIRS[ch], s + 1);
        return true;
      }
      return false;
    }
    function handleEnter() {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      const ls = lineStart(s), line = v.slice(ls, s);
      const ind = line.match(/^[ \t]*/)[0];
      const before = v[s - 1], after = v[e];
      if (s === e && "([{".includes(before) && after === BRACKETS[before]) {
        const inner = ind + "    ";
        edit(s, e, "\n" + inner + "\n" + ind, s + 1 + inner.length);
        return;
      }
      const extra = /[:{([]\s*(#.*)?$/.test(line) ? "    " : "";
      edit(s, e, "\n" + ind + extra, s + 1 + ind.length + extra.length);
    }
    function handleBackspace() {
      const s = ta.selectionStart, e = ta.selectionEnd, v = ta.value;
      if (s !== e || s === 0) return false;
      if (PAIRS[v[s - 1]] && PAIRS[v[s - 1]] === v[s]) { edit(s - 1, s + 1, "", s - 1); return true; }
      const before = v.slice(lineStart(s), s);
      if (before.length && /^ +$/.test(before)) {
        const n = before.length % 4 || 4;
        edit(s - n, s, "", s - n);
        return true;
      }
      return false;
    }

    /* ---------- find bar ---------- */
    let caseOn = false;
    function runFind(fromCaret) {
      const q = findIn.value, v = ta.value;
      findHits = [];
      if (q) {
        const hay = caseOn ? v : v.toLowerCase(), needle = caseOn ? q : q.toLowerCase();
        for (let i = hay.indexOf(needle); i !== -1 && findHits.length < 5000; i = hay.indexOf(needle, i + Math.max(needle.length, 1))) findHits.push(i);
      }
      if (fromCaret) { const c = ta.selectionStart; findCur = findHits.findIndex((h) => h >= c); if (findCur < 0) findCur = findHits.length ? 0 : -1; }
      else if (findCur >= findHits.length) findCur = findHits.length - 1;
      findCnt.textContent = findHits.length ? `${findCur + 1}/${findHits.length}` : "0/0";
      findCnt.classList.toggle("none", !!q && !findHits.length);
      decorate();
    }
    function gotoHit(step) {
      if (!findHits.length) return;
      findCur = (findCur + step + findHits.length) % findHits.length;
      const h = findHits[findCur];
      ta.setSelectionRange(h, h + findIn.value.length);
      findCnt.textContent = `${findCur + 1}/${findHits.length}`;
      reveal(h); decorate();
    }
    function openFind() {
      findBar.hidden = false;
      const sel = ta.value.slice(ta.selectionStart, ta.selectionEnd);
      if (sel && !sel.includes("\n")) findIn.value = sel;
      findIn.focus(); findIn.select();
      runFind(true);
    }
    function closeFind(focusEditor = true) {
      findBar.hidden = true; findHits = [];
      decorate();
      if (focusEditor) { ta.focus(); if (findCur >= 0 && findIn.value) { /* keep the last match selected */ } }
    }
    findIn.addEventListener("input", () => runFind(true));
    findIn.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); gotoHit(e.shiftKey ? -1 : 1); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeFind(); }
    });
    findBar.querySelector(".case").onclick = (e) => { caseOn = !caseOn; e.currentTarget.classList.toggle("on", caseOn); runFind(true); };
    findBar.querySelector(".fprev").onclick = () => gotoHit(-1);
    findBar.querySelector(".fnext").onclick = () => gotoHit(1);
    findBar.querySelector(".fclose").onclick = () => closeFind();

    /* ---------- keyboard ---------- */
    let ctrlLRepeat = false;
    ta.addEventListener("keydown", (e) => {
      const mod = e.ctrlKey || e.metaKey, k = e.key;
      if (k !== "l" && k !== "L") ctrlLRepeat = false;
      // --- Ctrl / Cmd shortcuts ---
      if (mod && !e.altKey) {
        if (k === "Enter") {
          e.preventDefault();
          if (e.shiftKey) newLine(false);
          else if (opt.onRun) opt.onRun(); else if (!bare) run();
          return;
        }
        if (k === "/" || e.code === "Slash") { e.preventDefault(); toggleComment(); return; }
        if ((k === "k" || k === "K") && e.shiftKey) { e.preventDefault(); deleteLines(); return; }
        if ((k === "d" || k === "D") && !e.shiftKey) { e.preventDefault(); selectWordOrNext(); return; }
        if ((k === "l" || k === "L") && !e.shiftKey) { e.preventDefault(); selectLine(); return; }
        if (k === "]") { e.preventDefault(); indentLines(1); return; }
        if (k === "[") { e.preventDefault(); indentLines(-1); return; }
        if ((k === "f" || k === "F") && !e.shiftKey) { e.preventDefault(); openFind(); return; }
        if ((k === "s" || k === "S") && !e.shiftKey) { e.preventDefault(); saveNow(); say("Saved"); return; }
        if (k === "=" || k === "+") { e.preventDefault(); setFont(1); return; }
        if (k === "-" || k === "_") { e.preventDefault(); setFont(-1); return; }
        return;                                         // Ctrl+Z/Y/A/C/V/X/Backspace: native behaviour
      }
      // --- Alt shortcuts ---
      if (e.altKey && !mod) {
        if (k === "ArrowUp" || e.code === "ArrowUp") { e.preventDefault(); e.shiftKey ? copyLines(-1) : moveLines(-1); return; }
        if (k === "ArrowDown" || e.code === "ArrowDown") { e.preventDefault(); e.shiftKey ? copyLines(1) : moveLines(1); return; }
        if (e.code === "KeyZ") { e.preventDefault(); toggleWrap(); return; }
        return;
      }
      if (k === "Escape") {
        if (!findBar.hidden) { e.preventDefault(); closeFind(false); }
        ta.blur();
        return;
      }
      if (k === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart, en = ta.selectionEnd;
        if (s === en && !e.shiftKey) { const col = s - lineStart(s); edit(s, s, " ".repeat(4 - (col % 4))); }
        else indentLines(e.shiftKey ? -1 : 1);
        return;
      }
      if (k === "Enter") {
        e.preventDefault();
        if (e.shiftKey) newLine(true); else handleEnter();
        return;
      }
      if (k === "Backspace") { if (handleBackspace()) e.preventDefault(); return; }
      if (k === "Home" && !e.altKey) { e.preventDefault(); smartHome(e.shiftKey); return; }
      if (k.length === 1 && (PAIRS[k] || CLOSERS.has(k))) {
        if (handleChar(k)) e.preventDefault();
      }
    });
    // phones often send key "Unidentified": handle pairs on beforeinput instead
    ta.addEventListener("beforeinput", (e) => {
      if (e.inputType === "insertText" && e.data && e.data.length === 1 && (PAIRS[e.data] || CLOSERS.has(e.data))) {
        if (handleChar(e.data)) e.preventDefault();
      }
    });

    /* ---------- input / save / selection ---------- */
    let saveTimer = null;
    const saveNow = () => { clearTimeout(saveTimer); storeSet(saveKey, ta.value === original ? undefined : ta.value); };
    ta.addEventListener("input", () => {
      if (errLine) errLine = null;
      if (traceOpen) closeTrace();
      paint();
      if (!findBar.hidden) runFind(false);
      clearTimeout(saveTimer); saveTimer = setTimeout(saveNow, 300);
      if (opt.onChange) opt.onChange(ta.value);
    });
    let raf = 0;
    const redecorate = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(decorate); };
    ["keyup", "click", "focus", "blur", "select"].forEach((ev) => ta.addEventListener(ev, redecorate));
    document.addEventListener("selectionchange", () => { if (document.activeElement === ta) redecorate(); });
    document.addEventListener("ed:font", () => { measureFont(); paint(); });
    window.addEventListener("resize", () => { if (wrapOn()) paint(); });

    /* ---------- toolbar ---------- */
    $(".tabkey").onclick = () => { const s = ta.selectionStart; edit(s, ta.selectionEnd, "    ", s + 4); };
    $(".find-btn").onclick = () => (findBar.hidden ? openFind() : closeFind());
    $(".wrap-btn").onclick = toggleWrap;
    $(".keys-btn").onclick = (e) => { const k = $(".ed-keys"); k.hidden = !k.hidden; e.currentTarget.classList.toggle("on", !k.hidden); };
    $(".reset").onclick = () => { edit(0, ta.value.length, original, original.length); saveNow(); say("Reset to the starter code (Ctrl+Z to undo)"); };
    $(".copy").onclick = () => navigator.clipboard?.writeText(ta.value).then(() => say("Copied"), () => say("Copy failed"));

    /* ---------- run panel ---------- */
    let running = false, traceOpen = false, traceData = null;
    const outBox = $(".ed-out"), outPre = $(".ed-pre"), st = $(".ed-out .st"), clr = $(".clr");
    const stdinBox = $(".ed-stdin"), stdinTa = stdinBox && stdinBox.querySelector("textarea"), runBtn = $(".run"), stepBtn = $(".step"), traceBox = $(".ed-trace");
    const stdinKey = "stdin:" + (opt.key || "scratch");
    if (stdinTa) {
      stdinTa.value = store(stdinKey, "") || "";
      stdinTa.addEventListener("input", () => storeSet(stdinKey, stdinTa.value || undefined));
      if (stdinTa.value || usesInput()) stdinBox.hidden = false;
    }
    function usesInput() { return /(^|[^\w.])input\s*\(/.test(blanked(ta.value)); }
    function setStatus(text, cls = "") { st.className = "st tag " + cls; st.textContent = text; }
    function setRunning(on, which = "run") {
      running = on;
      if (runBtn) {
        runBtn.innerHTML = on && which === "run" ? `${I.stop}<span>Stop</span>` : `${I.play}<span>Run</span>`;
        runBtn.classList.toggle("green", !(on && which === "run"));
        runBtn.classList.toggle("pink", on && which === "run");
      }
      if (stepBtn) {
        stepBtn.innerHTML = on && which === "trace" ? `${I.stop}<span class="hide-s">Stop</span>` : `${I.step}<span class="hide-s">Step</span>`;
        stepBtn.classList.toggle("pink", on && which === "trace");
      }
    }
    function needsInputFirst() {
      if (!stdinBox || !usesInput() || !stdinBox.hidden) return false;
      stdinBox.hidden = false; outBox.hidden = false;
      $(".stdin-btn").hidden = false;
      outPre.innerHTML = `<span class="muted">Your code calls input(). Type the input lines above (one per call), then press Run again.</span>`;
      setStatus("Waiting for input");
      stdinTa.focus();
      return true;
    }
    function startStatus() { setStatus(PyRunner.ready ? "Running…" : "Loading Python (first time only)…"); }
    function showOutput() { outBox.hidden = false; clr.hidden = false; }
    function run() {
      if (running) { PyRunner.stop(); return; }
      if (needsInputFirst()) return;
      closeTrace();
      showOutput(); outPre.textContent = ""; errLine = null; paint();
      startStatus(); setRunning(true, "run");
      const t0 = performance.now();
      PyRunner.run(ta.value, (m) => {
        if (m.type === "out") { outPre.append(m.text); if (PyRunner.ready) setStatus("Running…"); }
        if (m.type === "err") outPre.insertAdjacentHTML("beforeend", `<span class="err">${esc(m.text)}</span>`);
        if (m.type === "error") {
          outPre.insertAdjacentHTML("beforeend", `<div class="ed-errblock">${esc(m.text)}</div>`);
          setStatus("Error", "bad"); setRunning(false);
          if (m.line) { errLine = m.line; paint(); reveal(lineStartOfLine(m.line)); }
        }
        if (m.type === "stopped") { setStatus("Stopped", "bad"); setRunning(false); }
        if (m.type === "done") {
          setRunning(false);
          const ms = m.ms != null ? m.ms : performance.now() - t0;
          if (!outPre.textContent) outPre.innerHTML = `<span class="muted">(no output: add a print() to see results)</span>`;
          if (opt.expected != null) {
            const ok = outPre.textContent.trim() === String(opt.expected).trim();
            setStatus(ok ? `Matches expected · ${fmtMs(ms)}` : `Differs from expected · ${fmtMs(ms)}`, ok ? "ok" : "bad");
          } else setStatus(`Done in ${fmtMs(ms)}`, "ok");
        }
      }, { stdin: stdinTa ? stdinTa.value : "" });
    }
    const fmtMs = (ms) => (ms < 1 ? "<1 ms" : ms < 1000 ? Math.round(ms) + " ms" : (ms / 1000).toFixed(2) + " s");
    const lineStartOfLine = (n) => { let i = 0; for (let k = 1; k < n; k++) { const j = ta.value.indexOf("\n", i); if (j < 0) break; i = j + 1; } return i; };

    /* ---------- step-through ---------- */
    const CAP = 500;
    function trace() {
      if (running) { PyRunner.stop(); return; }
      if (needsInputFirst()) return;
      showOutput(); outPre.textContent = ""; startStatus(); setRunning(true, "trace");
      PyRunner.run(ta.value, (m) => {
        if (m.type === "stopped") { setStatus("Stopped", "bad"); setRunning(false); }
        if (m.type === "error") { outPre.insertAdjacentHTML("beforeend", `<div class="ed-errblock">${esc(m.text)}</div>`); setStatus("Error", "bad"); setRunning(false); if (m.line) { errLine = m.line; paint(); } }
        if (m.type === "trace") {
          setRunning(false);
          traceData = m;
          if (!m.steps.length) {
            setStatus(m.error ? "Error" : "Nothing to step through", m.error ? "bad" : "");
            if (m.error) { outPre.insertAdjacentHTML("beforeend", `<div class="ed-errblock">${esc(m.error)}</div>`); if (m.line) { errLine = m.line; paint(); } }
            return;
          }
          setStatus(`${m.steps.length} steps${m.capped ? " (limit reached)" : ""}`, m.capped ? "" : "ok");
          openTrace();
        }
      }, { trace: true, cap: CAP, stdin: stdinTa ? stdinTa.value : "" });
    }
    function openTrace() {
      traceOpen = true; traceBox.hidden = false;
      const n = traceData.steps.length;
      traceBox.innerHTML = `
        <div class="tr-head"><b>Step-through</b><span class="muted small">Edit the code to leave this mode.</span><span class="grow"></span><button class="ib tr-close" title="Close" aria-label="Close step-through">${I.x}</button></div>
        ${traceData.capped ? `<div class="tr-cap">Showing the first ${CAP} steps only. The step-through stops recording after ${CAP} lines run (loops add up quickly).</div>` : ""}
        <div class="tr-ctl"><button class="btn sm tr-prev" aria-label="Previous step">${I.prev}</button>
          <input type="range" min="0" max="${n - 1}" value="0" aria-label="Step">
          <button class="btn sm tr-next" aria-label="Next step">${I.next}</button><span class="mono small tr-pos"></span></div>
        <div class="tr-grid"><div><div class="lab">Variables</div><table class="tr-vars"></table></div>
          <div><div class="lab">Output so far</div><pre class="tr-out"></pre></div></div>`;
      const slider = traceBox.querySelector("input");
      const show = (k) => {
        k = Math.max(0, Math.min(n - 1, k)); slider.value = k;
        const s = traceData.steps[k];
        traceBox.querySelector(".tr-pos").textContent = `Step ${k + 1} / ${n} · line ${s.line}${s.fn !== "<module>" ? " in " + s.fn + "()" : ""}${s.ev === "return" ? " · returning" : ""}`;
        const vars = Object.entries(s.vars);
        traceBox.querySelector(".tr-vars").innerHTML = (s.ret != null ? `<tr class="ret"><td>return</td><td>${esc(s.ret)}</td></tr>` : "") +
          (vars.length ? vars.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("") : `<tr><td colspan="2" class="muted">(no variables yet)</td></tr>`);
        const out = traceData.out.slice(0, s.out);
        traceBox.querySelector(".tr-out").textContent = out || "(nothing printed yet)";
        if (k === n - 1 && traceData.error) traceBox.querySelector(".tr-out").insertAdjacentHTML("beforeend", `<div class="ed-errblock">${esc(traceData.error)}</div>`);
        stepLine = s.line; paint(); reveal(lineStartOfLine(s.line));
      };
      slider.oninput = () => show(+slider.value);
      traceBox.querySelector(".tr-prev").onclick = () => show(+slider.value - 1);
      traceBox.querySelector(".tr-next").onclick = () => show(+slider.value + 1);
      traceBox.querySelector(".tr-close").onclick = closeTrace;
      outPre.textContent = traceData.out || "";
      if (traceData.error) outPre.insertAdjacentHTML("beforeend", `<div class="ed-errblock">${esc(traceData.error)}</div>`);
      show(0);
    }
    function closeTrace() {
      if (!traceBox) return;
      traceOpen = false; traceBox.hidden = true; traceBox.innerHTML = "";
      if (stepLine) { stepLine = null; paint(); }
    }
    if (!bare) {
      runBtn.onclick = run;
      stepBtn.onclick = trace;
      clr.onclick = () => { outPre.textContent = ""; outBox.hidden = true; clr.hidden = true; closeTrace(); errLine = null; paint(); };
      $(".stdin-btn").onclick = () => { stdinBox.hidden = !stdinBox.hidden; if (!stdinBox.hidden) stdinTa.focus(); };
      if (stdinBox && !stdinBox.hidden) $(".stdin-btn").hidden = false;
    }

    /* ---------- start ---------- */
    measureFont(); paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measureFont(); paint(); });

    return {
      el: host,
      textarea: ta,
      get value() { return ta.value; },
      set value(v) { edit(0, ta.value.length, String(v), String(v).length); saveNow(); },
      replaceAll(v) { edit(0, ta.value.length, String(v), String(v).length); saveNow(); },
      focus: () => ta.focus(),
      run: () => (bare ? opt.onRun && opt.onRun() : run()),
      markError(line) { errLine = line || null; paint(); if (line) reveal(lineStartOfLine(line)); },
      clearError() { errLine = null; paint(); }
    };
  };

  // spec-style alias
  window.Editor = (host, o = {}) => mountEditor(host, { code: o.value, onRun: o.onRun, onChange: o.onChange, title: o.label, key: o.key || o.label, bare: o.bare });

  /* ======================================================================
     5. Playground (full-screen scratch editor)
     ====================================================================== */
  let pg = null, pgApi = null;
  window.openPlayground = function () {
    if (!pg) {
      pg = document.createElement("div");
      pg.className = "pg-ov";
      pg.hidden = true;
      pg.setAttribute("role", "dialog");
      pg.setAttribute("aria-modal", "true");
      pg.setAttribute("aria-label", "Python playground");
      pg.innerHTML = `<div class="pg-box">
        <div class="pg-head"><b>Playground</b><span class="muted small hide-s">Any Python. Ctrl+Enter runs, Esc closes.</span><span class="grow"></span>
          <button class="btn sm pg-clear">Clear code</button><button class="ib pg-close" title="Close (Esc)" aria-label="Close playground">${I.x}</button></div>
        <div class="pg-ed"></div></div>`;
      document.body.append(pg);
      pgApi = mountEditor(pg.querySelector(".pg-ed"), { code: "# Scratch space: write any Python and press Run (Ctrl+Enter)\nnums = [3, 1, 2]\nprint(sorted(nums))\n", title: "playground.py", key: "playground" });
      pg.querySelector(".pg-close").onclick = closePlayground;
      pg.querySelector(".pg-clear").onclick = () => { pgApi.replaceAll(""); pgApi.focus(); };
      pg.addEventListener("mousedown", (e) => { if (e.target === pg) closePlayground(); });
    }
    pg.hidden = false;
    pg.classList.add("open");
    document.body.classList.add("pg-lock");
    setTimeout(() => pgApi.focus(), 30);
  };
  function closePlayground() {
    if (!pg || pg.hidden) return;
    if (pg.contains(document.activeElement)) document.activeElement.blur();
    pg.classList.remove("open");
    pg.hidden = true;
    document.body.classList.remove("pg-lock");
  }
  window.closePlayground = closePlayground;
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && pg && !pg.hidden && !e.defaultPrevented) closePlayground();
  });
})();
