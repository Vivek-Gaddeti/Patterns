/* Scratchpad: a handwriting canvas for stylus, finger or mouse.
   mountScratch(host, { key, height, values, fill }) -> { el, destroy }
     key     where the sketch is saved (one sketch per card / problem / pattern)
     values  optional list drawn as array boxes, so you only draw the pointers
     fill    true = take the height of the parent instead of a fixed height
   openScratchSheet({ key, title, values }) docks a pad beside the page (right side in landscape). */
(function () {
  const LS = "patterns.scratch.v1", KEEP = 80;
  let db = {};
  try { db = JSON.parse(localStorage.getItem(LS) || "{}"); } catch (e) { db = {}; }
  const persist = () => {
    try {
      const keys = Object.keys(db);
      if (keys.length > KEEP) keys.sort((a, b) => (db[a].t || 0) - (db[b].t || 0)).slice(0, keys.length - KEEP).forEach((k) => delete db[k]);
      localStorage.setItem(LS, JSON.stringify(db));
    } catch (e) {}
  };
  const S = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const I = {
    pen: S('<path d="M4 20l4-1L19 8l-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>'),
    erase: S('<path d="M9 20h11"/><path d="M5 15l9-9 5 5-9 9H7l-2-2a2 2 0 0 1 0-3z"/>'),
    undo: S('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'),
    full: S('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'),
    small: S('<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>')
  };
  const TPL = ["none", "array", "grid"], TPL_LABEL = { none: "Boxes off", array: "Array boxes", grid: "Grid" };
  let lastPen = 0;                      // time of the last stylus event anywhere: used to ignore the resting palm

  window.mountScratch = function (host, opt = {}) {
    const key = opt.key || "scratch";
    const st = Object.assign({ s: [], bw: 0, h: opt.height || 320, tpl: opt.values ? "array" : "none" }, db[key] || {});
    let tool = "pen", color = "ink", finger = !!(window.Store && Store.get("padFinger")), undo = [];
    let cur = null, erasing = false, scroll = null, W = 0, H = 0, dpr = 1;

    host.innerHTML = `<div class="sp${opt.fill ? " fill" : ""}">
      <div class="sp-bar" role="toolbar" aria-label="Scratchpad tools">
        <button class="sp-t" data-a="pen" aria-pressed="true" aria-label="Pen">${I.pen}</button>
        <button class="sp-t" data-a="erase" aria-pressed="false" aria-label="Eraser">${I.erase}</button>
        <span class="sp-sep"></span>
        <button class="sp-t" data-c="ink" aria-pressed="true" aria-label="Black ink"><i class="sp-dot"></i></button>
        <button class="sp-t" data-c="red" aria-pressed="false" aria-label="Red ink"><i class="sp-dot"></i></button>
        <button class="sp-t" data-c="blue" aria-pressed="false" aria-label="Blue ink"><i class="sp-dot"></i></button>
        <span class="sp-sep"></span>
        <button class="sp-t txt" data-a="tpl"></button>
        <span class="sp-grow"></span>
        <button class="sp-t" data-a="undo" aria-label="Undo">${I.undo}</button>
        <button class="sp-t txt" data-a="clear">Clear</button>
        <button class="sp-t" data-a="full" aria-label="Full screen">${I.full}</button>
      </div>
      <div class="sp-area"><canvas aria-label="Drawing area"></canvas><div class="sp-hint">Write or draw here</div></div>
      <div class="sp-foot"><span class="sp-status"></span><span class="sp-grow"></span>
        <button class="sp-t txt" data-a="finger" aria-pressed="false">Draw with finger</button>
        <button class="sp-t txt" data-a="more">More space</button></div>
    </div>`;
    const el = host.firstElementChild, area = el.querySelector(".sp-area"), cv = el.querySelector("canvas");
    const ctx = cv.getContext("2d", { desynchronized: true }) || cv.getContext("2d");
    const $ = (a) => el.querySelector(`[data-a="${a}"]`);
    const status = el.querySelector(".sp-status");

    /* ---- colours follow the theme: read them from the page each time we draw ---- */
    let pal = {};
    function palette() {
      const cs = getComputedStyle(el), ink = cs.color;
      const m = ink.match(/[\d.]+/g) || [0, 0, 0], dark = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) > 140;
      pal = { ink, red: dark ? "#FF8A8A" : "#E5484D", blue: dark ? "#8CC4FF" : "#2B7FD9", muted: cs.getPropertyValue("--muted").trim() || "#888" };
      el.querySelectorAll("[data-c]").forEach((b) => (b.firstElementChild.style.background = pal[b.dataset.c]));
    }
    const scale = () => (st.bw ? W / st.bw : 1);

    function resize() {
      const w = area.clientWidth, h = area.clientHeight;
      if (!w || !h) return;
      dpr = window.devicePixelRatio || 1; W = w; H = h;
      if (!st.bw || !st.s.length) st.bw = W;        // an empty pad adopts the current width
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      redraw();
    }
    function drawTpl() {
      if (st.tpl === "none") return;
      const bw = st.bw || W;
      ctx.strokeStyle = pal.muted; ctx.lineWidth = 1.6; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      if (st.tpl === "array") {
        const vals = opt.values || new Array(8).fill(""), n = vals.length;
        const cell = Math.min(56, (bw - 32) / n), x0 = (bw - cell * n) / 2, y0 = 22;
        vals.forEach((v, i) => {
          ctx.strokeRect(x0 + i * cell, y0, cell, cell);
          if (v !== "") { ctx.fillStyle = pal.ink; ctx.font = `700 ${Math.round(cell * 0.36)}px "Space Mono", monospace`; ctx.fillText(v, x0 + i * cell + cell / 2, y0 + cell / 2 + 1); }
          ctx.fillStyle = pal.muted; ctx.font = `12px "Space Mono", monospace`; ctx.fillText(i, x0 + i * cell + cell / 2, y0 + cell + 11);
        });
      } else {
        const n = 5, cell = Math.min(46, (bw - 32) / n), x0 = (bw - cell * n) / 2, y0 = 22;
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) ctx.strokeRect(x0 + c * cell, y0 + r * cell, cell, cell);
      }
    }
    // segment i joins the midpoints around point i-1, so incremental and full redraws look identical
    function seg(p, i, last) {
      const ax = p[(i - 1) * 3], ay = p[(i - 1) * 3 + 1], aw = p[(i - 1) * 3 + 2], bx = p[i * 3], by = p[i * 3 + 1], bw = p[i * 3 + 2];
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const sx = i > 1 ? (p[(i - 2) * 3] + ax) / 2 : ax, sy = i > 1 ? (p[(i - 2) * 3 + 1] + ay) / 2 : ay;
      ctx.lineWidth = (aw + bw) / 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(ax, ay, mx, my);
      if (last) ctx.lineTo(bx, by);
      ctx.stroke();
    }
    function stroke(s, done) {
      const p = s.p, n = p.length / 3;
      ctx.strokeStyle = ctx.fillStyle = pal[s.c] || pal.ink; ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (n === 1) { ctx.beginPath(); ctx.arc(p[0], p[1], p[2] / 2, 0, 7); ctx.fill(); return; }
      for (let i = 1; i < n; i++) seg(p, i, done && i === n - 1);
    }
    function redraw() {
      if (!W) return;
      palette();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      const k = dpr * scale(); ctx.setTransform(k, 0, 0, k, 0, 0);
      drawTpl();
      st.s.forEach((s) => stroke(s, true));
      if (cur) stroke(cur, false);
      el.querySelector(".sp-hint").hidden = st.s.length > 0 || !!cur || st.tpl !== "none";
    }
    const save = () => { st.t = Date.now(); if (st.s.length || db[key]) { db[key] = { s: st.s, bw: st.bw, h: st.h, tpl: st.tpl, t: st.t }; persist(); } };
    const snap = () => { undo.push(st.s.slice()); if (undo.length > 60) undo.shift(); };

    const at = (e) => {
      const r = cv.getBoundingClientRect(), k = scale();
      const pr = e.pointerType === "pen" && e.pressure > 0 ? e.pressure : 0.45;
      const q = (v) => Math.round(v * 10) / 10;
      return [q((e.clientX - r.left) / k), q((e.clientY - r.top) / k), q(1.3 + pr * 3.3)];
    };
    function eraseAt(e) {
      const [x, y] = at(e), rad = 13 / scale();
      const keep = st.s.filter((s) => { for (let i = 0; i < s.p.length; i += 3) if (Math.hypot(s.p[i] - x, s.p[i + 1] - y) < rad) return false; return true; });
      if (keep.length !== st.s.length) { st.s = keep; redraw(); }
    }
    const scroller = () => { let n = el.parentElement; while (n && n !== document.body) { const o = getComputedStyle(n).overflowY; if ((o === "auto" || o === "scroll") && n.scrollHeight > n.clientHeight) return n; n = n.parentElement; } return window; };

    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "pen") lastPen = Date.now();
      if (e.pointerType === "touch") {
        if (cur || erasing || Date.now() - lastPen < 900) return;                 // the palm resting while the stylus writes
        if (!finger) { if (!el.classList.contains("full")) scroll = { y: e.clientY, to: scroller(), id: e.pointerId }; return; }
      }
      if (cur || erasing) return;
      e.preventDefault();
      try { cv.setPointerCapture(e.pointerId); } catch (err) {}
      snap();
      // the eraser end or the side button of a stylus erases without switching tools
      if (tool === "erase" || e.button === 5 || (e.buttons & 32) || (e.pointerType === "pen" && (e.buttons & 2))) { erasing = e.pointerId; eraseAt(e); return; }
      if (e.pointerType === "pen") status.textContent = "Stylus detected. Press harder for thicker lines.";
      cur = { c: color, p: at(e), id: e.pointerId };
      el.querySelector(".sp-hint").hidden = true;
      palette(); const k = dpr * scale(); ctx.setTransform(k, 0, 0, k, 0, 0); stroke(cur, false);
    });
    cv.addEventListener("pointermove", (e) => {
      if (e.pointerType === "pen") lastPen = Date.now();
      if (scroll && e.pointerId === scroll.id) { const d = scroll.y - e.clientY; scroll.y = e.clientY; scroll.to.scrollBy(0, d); return; }
      if (erasing === e.pointerId) { eraseAt(e); return; }
      if (!cur || e.pointerId !== cur.id) return;
      const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
      ctx.strokeStyle = pal[cur.c]; ctx.lineCap = "round"; ctx.lineJoin = "round";
      (evs.length ? evs : [e]).forEach((ev) => {
        const p = at(ev), n = cur.p.length;
        if (Math.abs(p[0] - cur.p[n - 3]) + Math.abs(p[1] - cur.p[n - 2]) < 0.6) return;
        cur.p.push(p[0], p[1], p[2]);
        seg(cur.p, cur.p.length / 3 - 1, false);
      });
    });
    function end(e) {
      if (scroll && e.pointerId === scroll.id) { scroll = null; return; }
      if (erasing === e.pointerId) { erasing = false; if (undo.length && undo[undo.length - 1].length === st.s.length) undo.pop(); save(); return; }
      if (!cur || e.pointerId !== cur.id) return;
      st.s.push({ c: cur.c, p: cur.p }); cur = null;
      redraw(); save();
    }
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    cv.addEventListener("contextmenu", (e) => e.preventDefault());

    /* ---- toolbar ---- */
    const press = (sel, on) => el.querySelectorAll(sel).forEach((b) => b.setAttribute("aria-pressed", String(b === on)));
    const paintTpl = () => { $("tpl").textContent = TPL_LABEL[st.tpl]; $("tpl").setAttribute("aria-pressed", String(st.tpl !== "none")); };
    const paintFinger = () => { $("finger").setAttribute("aria-pressed", String(finger)); status.textContent = finger ? "Finger and stylus both draw." : "The stylus draws. A finger scrolls the page."; };
    function setFull(on) {
      el.classList.toggle("full", on); document.body.classList.toggle("sp-lock", on);
      $("full").innerHTML = on ? I.small : I.full; $("full").setAttribute("aria-label", on ? "Leave full screen" : "Full screen");
      $("more").hidden = on || !!opt.fill;
    }
    el.addEventListener("click", (e) => {
      const b = e.target.closest(".sp-t"); if (!b) return;
      if (b.dataset.c) { color = b.dataset.c; tool = "pen"; press("[data-c]", b); press('[data-a="pen"],[data-a="erase"]', $("pen")); return; }
      const a = b.dataset.a;
      if (a === "pen" || a === "erase") { tool = a; press('[data-a="pen"],[data-a="erase"]', b); }
      else if (a === "tpl") { st.tpl = TPL[(TPL.indexOf(st.tpl) + 1) % TPL.length]; paintTpl(); redraw(); save(); }
      else if (a === "undo") { if (undo.length) { st.s = undo.pop(); redraw(); save(); } }
      else if (a === "clear") { if (st.s.length) { snap(); st.s = []; st.bw = W; redraw(); save(); } }
      else if (a === "full") setFull(!el.classList.contains("full"));
      else if (a === "finger") { finger = !finger; if (window.Store) Store.set("padFinger", finger || undefined); paintFinger(); }
      else if (a === "more") { st.h += 220; area.style.height = st.h + "px"; save(); }
    });
    const onKey = (e) => { if (e.key === "Escape" && el.classList.contains("full")) { e.preventDefault(); setFull(false); } };
    addEventListener("keydown", onKey);

    if (!opt.fill) area.style.height = st.h + "px";
    $("more").hidden = !!opt.fill;
    paintTpl(); paintFinger();
    const ro = window.ResizeObserver ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(area); else addEventListener("resize", resize);
    const mq = matchMedia("(prefers-color-scheme: dark)"); const onTheme = () => redraw();
    mq.addEventListener && mq.addEventListener("change", onTheme);
    const mo = new MutationObserver(onTheme); mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
    resize();

    return { el, destroy() { ro && ro.disconnect(); mo.disconnect(); removeEventListener("keydown", onKey); document.body.classList.remove("sp-lock"); host.innerHTML = ""; } };
  };

  /* pull a short list of numbers out of a problem's first example, for the array boxes */
  window.scratchValues = function (src) {
    const m = /\[\s*(-?\d+(?:\s*,\s*-?\d+){2,11})\s*\]/.exec(String(src || ""));
    return m ? m[1].split(",").map((x) => x.trim()) : null;
  };

  /* a pad docked beside the page: right side in landscape, bottom in portrait */
  let sheet = null;
  window.closeScratchSheet = function () { if (!sheet) return; sheet.pad.destroy(); sheet.el.remove(); sheet = null; document.body.classList.remove("sheet-open"); };
  window.openScratchSheet = function (opt = {}) {
    if (sheet) return closeScratchSheet();
    const el = document.createElement("aside");
    el.className = "sp-sheet"; el.setAttribute("aria-label", "Scratchpad");
    el.innerHTML = `<div class="sp-sheet-h"><b>${opt.title || "Scratchpad"}</b><button class="sp-t" aria-label="Close scratchpad">${I.x}</button></div><div class="sp-sheet-b"></div>`;
    document.body.append(el); document.body.classList.add("sheet-open");
    sheet = { el, pad: mountScratch(el.querySelector(".sp-sheet-b"), { key: opt.key, values: opt.values, fill: true }) };
    el.querySelector(".sp-sheet-h button").onclick = closeScratchSheet;
  };
})();
