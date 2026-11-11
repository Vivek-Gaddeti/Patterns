/* Shared shell: icons, storage, progress, spaced revision, nav, search */
(function () {
  const S = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" stroke-linejoin="miter">${p}</svg>`;
  window.ICON = {
    search: S('<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>'),
    sun: S('<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'),
    moon: S('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
    menu: S('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    play: S('<path d="M7 4l13 8-13 8z" fill="currentColor"/>'),
    stop: S('<rect x="6" y="6" width="12" height="12" fill="currentColor"/>'),
    reset: S('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'),
    copy: S('<rect x="9" y="9" width="12" height="12"/><path d="M5 15H3V3h12v2"/>'),
    check: S('<path d="M4 12l5 5L20 6"/>'),
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    left: S('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    ext: S('<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'),
    flame: S('<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-2 2-3 4-3 6-1-1-2-2-2-4-2 2-5 5-5 8a7 7 0 0 0 7 7z"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>'),
    clock: S('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    eye: S('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    lock: S('<rect x="5" y="11" width="14" height="10"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    bolt: S('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    target: S('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    book: S('<path d="M6 3h13v18H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M4 17a2 2 0 0 1 2-2h13"/>'),
    cards: S('<rect x="3" y="7" width="14" height="14"/><path d="M7 3h14v14"/>'),
    flag: S('<path d="M5 21V4h11l-2 4 2 4H5"/>'),
    map: S('<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>'),
    warn: S('<path d="M12 3L2 21h20z"/><path d="M12 10v5M12 18v.5"/>'),
    info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.5"/>'),
    download: S('<path d="M12 3v12M6 10l6 6 6-6M4 21h16"/>'),
    upload: S('<path d="M12 21V9M6 14l6-6 6 6M4 3h16"/>'),
    next: S('<path d="M6 4l10 8-10 8zM19 4v16"/>'),
    prev: S('<path d="M18 4L8 12l10 8zM5 4v16"/>'),
    list: S('<path d="M9 6h12M9 12h12M9 18h12M3 6h2M3 12h2M3 18h2"/>'),
    shuffle: S('<path d="M3 6h4l10 12h4M3 18h4l3-3.6M14 9.6L17 6h4M18 3l3 3-3 3M18 15l3 3-3 3"/>'),
    code: S('<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>'),
    home: S('<path d="M3 11l9-8 9 8v10h-6v-6H9v6H3z"/>'),
    pen: S('<path d="M4 20l4-1L19 8l-3-3L5 16l-1 4z"/><path d="M14 7l3 3"/>')
  };

  /* ---------- storage (may be unavailable: always guarded) ---------- */
  const KEY = "patterns.v2";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { state = {}; }
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  window.Store = {
    get: (k, d) => (k in state ? state[k] : d),
    set(k, v) { if (v === undefined) delete state[k]; else state[k] = v; persist(); },
    all: () => JSON.parse(JSON.stringify(state)),
    replace(obj) { state = obj || {}; persist(); },
    clear() { state = {}; persist(); }
  };

  /* ---------- dates ---------- */
  const DAY = 864e5;
  window.today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
  window.daysFromNow = (d) => d - today();
  const markActive = () => { const a = new Set(Store.get("days", [])); a.add(today()); Store.set("days", [...a].slice(-400)); };
  window.streak = () => {
    const a = new Set(Store.get("days", [])); let n = 0, d = today();
    if (!a.has(d)) d--;
    while (a.has(d)) { n++; d--; }
    return n;
  };

  /* ---------- progress model ---------- */
  // pattern status: 0 not started, 1 learning, 2 learned, 3 needs revision
  window.STATUS = ["Not started", "Learning", "Learned", "Revise"];
  window.STATUS_CLS = ["", "s-learning", "s-learned", "s-revise"];
  window.Progress = {
    status: (id) => Store.get("st:" + id, 0),
    setStatus(id, v) {
      Store.set("st:" + id, v); markActive();
      if (v >= 2 && !Store.get("srs:" + id)) SRS.schedule(id, 1);   // learned -> first review tomorrow
    },
    prob: (pid) => Store.get("p:" + pid, null),                     // {s:"solved"|"attempted", t, note, ms}
    setProb(pid, patch) { Store.set("p:" + pid, Object.assign({}, Store.get("p:" + pid, {}), patch, { t: Date.now() })); markActive(); }
  };

  /* ---------- spaced revision (small SM-2) ---------- */
  window.SRS = {
    get: (id) => Store.get("srs:" + id, null),
    schedule(id, inDays) { const c = this.get(id) || { iv: 1, ease: 2.4 }; c.due = today() + inDays; Store.set("srs:" + id, c); },
    due() { return CATALOG.filter((p) => { const c = this.get(p.id); return c && c.due <= today(); }); },
    upcoming(n) { return CATALOG.filter((p) => { const c = this.get(p.id); return c && c.due > today(); }).sort((a, b) => this.get(a.id).due - this.get(b.id).due).slice(0, n); },
    // grade: 0 again, 1 hard, 2 good, 3 easy
    rate(id, grade) {
      const c = this.get(id) || { iv: 1, ease: 2.4 };
      if (grade === 0) { c.iv = 1; c.ease = Math.max(1.3, c.ease - 0.2); Progress.setStatus(id, 3); }
      else if (grade === 1) { c.iv = Math.max(1, Math.round(c.iv * 1.2)); c.ease = Math.max(1.3, c.ease - 0.15); }
      else if (grade === 2) { c.iv = Math.max(2, Math.round(c.iv * c.ease)); }
      else { c.iv = Math.max(4, Math.round(c.iv * c.ease * 1.3)); c.ease += 0.15; }
      if (grade > 0 && Progress.status(id) === 3) Store.set("st:" + id, 2);
      c.due = today() + c.iv; c.last = today();
      Store.set("srs:" + id, c); markActive();
      return c.iv;
    },
    preview(id) { // what each button would schedule, for the button labels
      const c = this.get(id) || { iv: 1, ease: 2.4 };
      return [1, Math.max(1, Math.round(c.iv * 1.2)), Math.max(2, Math.round(c.iv * c.ease)), Math.max(4, Math.round(c.iv * c.ease * 1.3))];
    }
  };

  /* ---------- sample progress so the design can be judged with data in it ---------- */
  function seedDemo() {
    const t = today();
    [["hashing", 2], ["prefix-sum", 2], ["two-pointers", 1], ["sliding-window-fixed", 2], ["sliding-window-variable", 3], ["kadane", 2], ["binary-search", 2], ["monotonic-stack", 3], ["tree-dfs", 1]]
      .forEach(([id, s]) => (state["st:" + id] = s));
    state["srs:hashing"] = { iv: 3, ease: 2.4, due: t };
    state["srs:sliding-window-variable"] = { iv: 1, ease: 2.1, due: t - 1 };
    state["srs:monotonic-stack"] = { iv: 2, ease: 2.2, due: t };
    state["srs:prefix-sum"] = { iv: 6, ease: 2.5, due: t + 2 };
    state["srs:kadane"] = { iv: 4, ease: 2.4, due: t + 3 };
    state["srs:binary-search"] = { iv: 8, ease: 2.6, due: t + 5 };
    state["srs:sliding-window-fixed"] = { iv: 5, ease: 2.4, due: t + 4 };
    const byPat = (pid) => PROBLEMS.filter((p) => p.pat === pid);
    ["hashing", "prefix-sum", "sliding-window-fixed", "kadane", "binary-search", "two-pointers"].forEach((pid, k) =>
      byPat(pid).slice(0, 2).forEach((p, i) => (state["p:" + p.id] = { s: "solved", t: Date.now() - (k * 2 + i) * DAY / 2 })));
    ["sliding-window-variable", "monotonic-stack"].forEach((pid) => { const p = byPat(pid)[1] || byPat(pid)[0];
      if (p) state["p:" + p.id] = { s: "attempted", t: Date.now() - DAY, note: "Shrunk the window with if instead of while." }; });
    state.days = [t - 6, t - 5, t - 4, t - 2, t - 1, t];
    state.mocks = [{ when: Date.now() - 3 * DAY, score: 2, of: 3, mins: 74, len: 90 }, { when: Date.now() - 7 * DAY, score: 1, of: 3, mins: 90, len: 90 }];
    state.oaDate = t + 12; state.plan = "2w"; state.planStart = t - 2; state.last = "two-pointers"; state.seeded = "demo";
    persist();
  }
  if (Store.get("seeded") === undefined) seedDemo();
  window.isDemo = () => Store.get("seeded") === "demo";
  window.clearDemo = () => { const theme = Store.get("theme"); Store.clear(); Store.set("seeded", "clear"); if (theme) Store.set("theme", theme); };

  /* ---------- theme ---------- */
  const root = document.documentElement;
  if (Store.get("theme")) root.dataset.theme = Store.get("theme");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches);

  /* ---------- touch layout: bigger targets, bottom bar, scratchpads open by default ---------- */
  // Settings can force it "on" or "off"; otherwise it follows the device (a tablet or phone reports a coarse pointer).
  const touchPref = Store.get("touch");
  window.isTouch = touchPref ? touchPref === "on" : matchMedia("(pointer: coarse)").matches;
  root.classList.toggle("touch", window.isTouch);

  /* ---------- helpers ---------- */
  window.groupOf = (id) => GROUPS.find((g) => g.id === id);
  window.patternOf = (id) => CATALOG.find((p) => p.id === id);
  window.patternUrl = (id) => `pattern.html#${id}`;
  window.problemUrl = (p) => `solve.html#${p.id}`;
  window.lcUrl = (n) => `https://leetcode.com/problems/${n}/`;
  /* pattern data files register themselves with PAT(id, data) */
  window.PATTERNS = window.PATTERNS || {};
  window.PAT = (id, data) => { data.id = id; window.PATTERNS[id] = data; };
  const loading = {};
  window.loadPattern = (id) => loading[id] || (loading[id] = new Promise((res) => {
    if (window.PATTERNS[id]) return res(window.PATTERNS[id]);
    const s = document.createElement("script");
    s.src = `data/patterns/${id}.js`;
    s.onload = () => res(window.PATTERNS[id] || null); s.onerror = () => res(null);
    document.head.append(s);
  }));
  window.problemData = async (pid) => {
    const p = PROBLEMS.find((x) => x.id === pid); if (!p) return null;
    const d = await loadPattern(p.pat);
    return d && d.problems.find((x) => x.id === pid);
  };
  window.esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  window.md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\*([^*]+)\*/g, "<i>$1</i>");
  window.toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.append(t); }
    t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800);
  };

  /* ---------- nav + footer ---------- */
  function shell() {
    const page = document.body.dataset.page;
    const links = [["index.html", "Home", "home"], ["learn.html", "Learn", "learn"], ["practice.html", "Practice", "practice"], ["revise.html", "Revise", "revise"], ["mock.html", "Mock OA", "mock"], ["toolkit.html", "Toolkit", "toolkit"]];
    const due = SRS.due().length;
    const nav = document.createElement("header");
    nav.className = "nav";
    nav.innerHTML = `<div class="wrap">
      <a class="logo" href="index.html">PATTERNS<i>.</i></a>
      <nav class="nav-links" id="navLinks">${links.map(([h, t, k]) => `<a href="${h}" class="${page === k ? "on" : ""}">${t}${k === "revise" && due ? ` <span class="tag y" style="margin-left:4px">${due}</span>` : ""}</a>`).join("")}</nav>
      <div class="nav-right">
        <button class="search-btn" id="openFind">${ICON.search}<span>Search patterns, problems</span><kbd>Ctrl K</kbd></button>
        <span class="streak" title="Days in a row you've studied">${ICON.flame}${streak()}<span>&nbsp;day streak</span></span>
        <button class="icon-btn" id="pgBtn" aria-label="Open the Python playground (P)" title="Python playground (P)">${ICON.code}</button>
        <button class="icon-btn" id="themeBtn" aria-label="Toggle theme"></button>
        <a class="icon-btn" href="settings.html" aria-label="Settings">${ICON.gear}</a>
        <button class="icon-btn menu-btn" id="menuBtn" aria-label="Menu">${ICON.menu}</button>
      </div></div>`;
    document.body.prepend(nav);
    const tb = nav.querySelector("#themeBtn");
    const paint = () => (tb.innerHTML = isDark() ? ICON.sun : ICON.moon);
    paint();
    tb.onclick = () => { root.dataset.theme = isDark() ? "light" : "dark"; Store.set("theme", root.dataset.theme); paint(); };
    nav.querySelector("#menuBtn").onclick = () => nav.querySelector("#navLinks").classList.toggle("open");

    // bottom bar: shown by CSS on touch screens only
    const bar = document.createElement("nav");
    bar.className = "bbar"; bar.setAttribute("aria-label", "Pages");
    const bi = { home: "home", learn: "book", practice: "code", revise: "cards", mock: "clock", toolkit: "bolt" };
    bar.innerHTML = links.map(([h, t, k]) => `<a href="${h}" class="${page === k ? "on" : ""}">${ICON[bi[k]]}${t.replace(" OA", "")}${k === "revise" && due ? `<span class="n">${due}</span>` : ""}</a>`).join("");
    document.body.append(bar);

    if (document.body.dataset.nofoot !== undefined) return;
    const foot = document.createElement("footer");
    foot.className = "foot";
    foot.innerHTML = `<div class="wrap"><div><a href="roadmap.html">Roadmap</a><a href="toolkit.html">Python toolkit</a><a href="settings.html">Backup &amp; settings</a></div>
      <div class="mono">${CATALOG.length} patterns · ${PROBLEMS.length} problems · Python runs in your browser</div></div>`;
    document.body.append(foot);
  }

  /* ---------- Ctrl+K: patterns + problems ---------- */
  function finder() {
    const bg = document.createElement("div");
    bg.className = "modal-bg";
    bg.innerHTML = `<div class="modal" role="dialog" aria-label="Search"><input placeholder="Pattern, problem name or LeetCode number…" aria-label="Search"><ul></ul></div>`;
    document.body.append(bg);
    const input = bg.querySelector("input"), ul = bg.querySelector("ul");
    let sel = 0, hits = [];
    const render = () => {
      const q = input.value.trim().toLowerCase();
      const ps = CATALOG.filter((p) => !q || (p.title + " " + p.sub).toLowerCase().includes(q)).slice(0, q ? 6 : 5)
        .map((p) => ({ href: patternUrl(p.id), html: `<span class="sw" style="background:var(--${groupOf(p.group).color})"></span>${p.title}<span class="g">pattern</span>` }));
      const pr = PROBLEMS.filter((p) => q && (p.title.toLowerCase().includes(q) || String(p.lc) === q)).slice(0, 8)
        .map((p) => ({ href: problemUrl(p), html: `<span class="tag ${p.d.toLowerCase()}">${p.d[0]}</span>${p.title}<span class="g">problem</span>` }));
      hits = [...ps, ...pr];
      sel = Math.min(sel, Math.max(hits.length - 1, 0));
      let i = 0;
      const li = (h) => `<li class="${i++ === sel ? "sel" : ""}"><a href="${h.href}">${h.html}</a></li>`;
      ul.innerHTML = (ps.length ? `<li class="h">Patterns</li>` + ps.map(li).join("") : "") + (pr.length ? `<li class="h">Problems</li>` + pr.map(li).join("") : "") ||
        `<li class="h">Nothing matches “${esc(input.value)}”</li>`;
    };
    const open = () => { bg.classList.add("open"); input.value = ""; sel = 0; render(); input.focus(); };
    const close = () => bg.classList.remove("open");
    document.getElementById("openFind").onclick = open;
    bg.onclick = (e) => { if (e.target === bg || e.target.closest("a")) close(); };
    input.oninput = () => { sel = 0; render(); };
    input.onkeydown = (e) => {
      if (e.key === "ArrowDown") { sel = Math.min(sel + 1, hits.length - 1); render(); e.preventDefault(); }
      if (e.key === "ArrowUp") { sel = Math.max(sel - 1, 0); render(); e.preventDefault(); }
      if (e.key === "Enter" && hits[sel]) { location.href = hits[sel].href; close(); }
    };
    addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); bg.classList.contains("open") ? close() : open(); }
      if (e.key === "Escape") close();
    });
  }

  /* ---------- playground: load the editor on demand ---------- */
  window.openPlaygroundLazy = () => {
    if (window.openPlayground) return window.openPlayground();
    const sc = document.createElement("script");
    sc.src = "assets/editor.js";
    sc.onload = () => window.openPlayground();
    document.head.append(sc);
  };
  addEventListener("keydown", (e) => {
    if ((e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = e.target;
      if (t.closest && t.closest("input, textarea, select, [contenteditable], .modal-bg.open")) return;
      if (document.querySelector(".pg-ov:not([hidden]), .modal-bg.open, .modal-card")) return;
      e.preventDefault();
      openPlaygroundLazy();
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    shell(); finder();
    const pb = document.getElementById("pgBtn");
    if (pb) pb.onclick = () => window.openPlaygroundLazy();
  });
})();
