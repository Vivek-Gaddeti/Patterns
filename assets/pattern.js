/* Renders one pattern page from window.PATTERNS[id] */
(function () {
  const id = decodeURIComponent(location.hash.slice(1)) || "two-pointers";
  addEventListener("hashchange", () => location.reload());
  const enc = (o) => JSON.stringify(o).replace(/&/g, "&amp;").replace(/'/g, "&#39;");
  const lcUrl = (s) => `https://leetcode.com/problems/${s}/`;

  document.addEventListener("DOMContentLoaded", () => (READY.has(id) ? loadPattern(id) : Promise.resolve(null)).then(render));

  function render(data) {
    const meta = patternOf(id);
    const main = document.getElementById("main");
    if (!meta) { main.innerHTML = `<div class="empty" style="margin-top:40px">Pattern not found. <a href="learn.html">Back to all patterns</a></div>`; return; }
    const g = groupOf(meta.group);
    document.title = `${meta.title} — Patterns`;
    Store.set("last", id);
    if (Progress.status(id) === 0) Progress.setStatus(id, 1);
    drawSide();

    // touch screens: a Sketch button docks a scratchpad beside the page (kept per pattern)
    if (window.openScratchSheet && !document.querySelector(".fab")) {
      const fab = document.createElement("button");
      fab.className = "fab"; fab.innerHTML = `${ICON.pen} Sketch`;
      const a = data && data.viz && data.viz[1] && Array.isArray(data.viz[1].a) ? data.viz[1].a.map(String) : null;
      fab.onclick = () => openScratchSheet({ key: "pat:" + id, title: meta.title + " scratchpad", values: a });
      document.body.append(fab);
    }

    const st = Progress.status(id), c = SRS.get(id);
    const head = `<div class="crumb"><a href="learn.html">Learn</a> / ${g.name}</div>
      <div class="phd"><div>
        <h1><span class="sw" style="background:var(--${g.color})"></span>${meta.title}</h1>
        <p class="lede">${md(data ? data.lede : meta.sub)}</p>
        <div class="row"><span class="tag">Time ${data ? data.time : meta.cx}</span>${data ? `<span class="tag">Space ${data.space}</span>` : ""}<span class="tag">OA frequency: ${FREQ[meta.freq]}</span>
          <span class="tag">${c ? (c.due <= today() ? "Revision due today" : `Next revision in ${daysFromNow(c.due)}d`) : "Not scheduled for revision"}</span></div>
      </div>
      <div class="act"><span class="lab">Your status</span>
        <div class="seg" id="seg">${[1, 2, 3].map((v) => `<button data-v="${v}" class="${st === v ? "on" : ""}">${STATUS[v]}</button>`).join("")}</div>
        <div class="row"><button class="btn sm side-btn" id="sideBtn">${ICON.menu} Patterns</button><a class="btn sm" href="revise.html#card=${id}">${ICON.cards} Revision card</a></div>
      </div></div>`;

    if (!data) { main.innerHTML = head + soon(meta) + prevNext(meta); wireHead(); return; }

    const tabs = data.templates, exs = data.examples, probs = PROBLEMS.filter((p) => p.pat === id);
    const flav = data.flavours;
    const solved = (p) => Progress.prob(p.id)?.s === "solved";
    main.innerHTML = head + `
      <nav class="secbar" id="secbar">${[["overview", "Overview"], ["examples", "Examples"], ["pitfalls", "Pitfalls"], ["compare", "Compare"], ["practice", `Practice (${probs.length})`], ["notes", "Notes"]].map(([h, t]) => `<a href="#${h}" data-t="${h}">${t}</a>`).join("")}</nav>

      <section class="psec" id="overview" style="padding-top:18px"><div class="ov">
        <div>
          <p>${md(data.idea)}</p>
          <div class="lab" style="margin:14px 0 4px">Recognise it when</div>
          <ul class="sig">${data.signals.map(([a, b]) => `<li><div>${md(a)} <span>${md(b || "")}</span></div></li>`).join("")}</ul>
          <div class="callout warn">${ICON.warn}<p>${md(data.not)}</p></div>
          ${data.analogy ? `<div class="analogy"><b>Analogy</b>${md(data.analogy)}</div>` : ""}
          ${flav ? `<div class="tscroll"><table class="flav"><thead><tr>${flav[0].map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${flav[1].map((r) => `<tr>${r.map((x) => `<td>${md(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>` : ""}
        </div>
        <div>
          ${tabs.length > 1 ? `<div class="tabs" id="tpl">${tabs.map(([t], i) => `<button class="${i ? "" : "on"}" data-i="${i}">${t}</button>`).join("")}</div>` : `<div class="lab" style="margin-bottom:6px">Template</div>`}
          <div id="tplPanes">${tabs.map(([t, file, code, out], i) => `<div ${i ? "hidden" : ""} data-ed='${enc({ code, expected: out, title: file, key: id + ":tpl:" + i })}'></div>`).join("")}</div>
          ${data.viz && VIZ[data.viz[0]] ? `<details class="viz-toggle"><summary>${ICON.play} See it step by step</summary><div data-viz="${data.viz[0]}" data-cfg='${JSON.stringify(data.viz[1])}'></div></details>` : ""}
        </div>
      </div></section>

      <section class="psec" id="examples"><h2>Worked examples <span class="muted">${exs.length} problems · edit and run any of them</span></h2>
        ${exs.map((x, i) => `<details class="ex ${i >= 3 ? "extra hide" : ""}" ${i === 0 ? "open" : ""}><summary>
          <span class="tag ${x.d.toLowerCase()}">${x.d}</span><h3>${x.t}</h3>${x.f ? `<span class="tag">${x.f}</span>` : ""}<span class="chev">+</span></summary>
          <div class="ex-body"><div class="q">${md(x.q)}</div><div class="idea">${md(x.idea)}</div>
            <div data-ed='${enc({ code: x.code, expected: x.out, title: "example.py", key: id + ":ex:" + i })}'></div>
            <div class="ex-foot"><span class="tag">${x.cx}</span>${x.lc ? `<a class="small muted" href="${lcUrl(x.lc)}" target="_blank" rel="noopener">Also on LeetCode ↗</a>` : ""}</div></div></details>`).join("")}
        ${exs.length > 3 ? `<button class="btn more" id="moreEx">Show ${exs.length - 3} more examples</button>` : ""}
      </section>

      <section class="psec" id="pitfalls"><h2>Pitfalls</h2>
        <div class="grid g2"><div class="card"><ul class="pits">${data.pitfalls.map(([a, b]) => `<li><div><b>${md(a)}</b><span>${md(b)}</span></div></li>`).join("")}</ul></div>
          <div class="card edge"><div class="lab" style="margin-bottom:6px">Edge cases to test</div>${data.edge.map((t, i) => `<label><input type="checkbox" class="cb" data-ck="${id}:${i}">${md(t)}</label>`).join("")}</div></div>
      </section>

      <section class="psec" id="compare"><h2>Don't confuse it with</h2>
        <div class="grid g3 cmp">${data.compare.map(([t, pid, s]) => `<a class="card" href="${patternUrl(pid)}"><h4>vs ${t}${ICON.arrow}</h4><p>${md(s)}</p></a>`).join("")}</div>
      </section>

      <section class="psec" id="practice"><h2>Practice <span class="muted" id="pracCount"></span></h2>
        <div class="row" style="margin-bottom:10px"><div class="seg" id="pf">${["All", "Easy", "Medium", "Hard"].map((t, i) => `<button class="${i ? "" : "on"}" data-f="${t}">${t}</button>`).join("")}</div>
          <span class="grow"></span><a class="btn sm" href="practice.html">${ICON.shuffle} Mixed practice (pattern hidden)</a></div>
        <div class="tscroll"><table class="tbl prac"><thead><tr><th></th><th>Problem</th><th>Level</th><th></th></tr></thead><tbody>
          ${probs.map((p) => `<tr data-slug="${p.id}" data-d="${p.d}" class="${solved(p) ? "done" : ""}"><td><span class="st-icon ${Progress.prob(p.id)?.s || ""}" title="${Progress.prob(p.id)?.s || "not tried"}"></span></td>
            <td><a class="pname" href="solve.html#${p.id}">${p.title}</a></td><td><span class="tag ${p.d.toLowerCase()}">${p.d}</span></td>
            <td style="text-align:right"><a class="btn sm ${solved(p) ? "" : "yellow"}" href="solve.html#${p.id}">${solved(p) ? "Review" : "Solve"}</a></td></tr>`).join("")}
        </tbody></table></div>
        <div class="lab" style="margin:22px 0 10px">Quick check</div>
        ${data.mcq.map((m) => `<div class="card mcq"><div class="q">${md(m[0])}</div><div class="answers">${m[1].map((t, i) => `<button class="opt" data-i="${i}" data-c="${m[2]}">${md(t)}</button>`).join("")}</div><div class="why">${md(m[3])}</div></div>`).join("")}
      </section>

      <section class="psec notes" id="notes"><h2>Your notes <span class="muted" id="noteSaved"></span></h2>
        <textarea class="input" id="noteTa" placeholder="The pattern in your own words, mistakes you made, tricks to remember. Saved in this browser."></textarea>
      </section>` + prevNext(meta);

    wireHead();
    hydrate();
  }

  function wireHead() {
    document.getElementById("seg").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      Progress.setStatus(id, +b.dataset.v);
      document.querySelectorAll("#seg button").forEach((x) => x.classList.toggle("on", x === b));
      drawSide();
      toast(+b.dataset.v === 2 ? "Learned. First revision is scheduled for tomorrow." : "Marked as " + b.textContent.toLowerCase());
    };
    document.getElementById("sideBtn").onclick = () => document.getElementById("side").classList.toggle("open");
  }

  function hydrate() {
    document.querySelectorAll("[data-ed]").forEach((el) => mountEditor(el, JSON.parse(el.dataset.ed)));
    const tpl = document.getElementById("tpl"), panes = document.getElementById("tplPanes").children;
    if (tpl) tpl.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; tpl.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); [...panes].forEach((p, i) => (p.hidden = i !== +b.dataset.i)); };
    document.querySelectorAll("[data-viz]").forEach((el) => VIZ[el.dataset.viz](el, JSON.parse(el.dataset.cfg)));
    const more = document.getElementById("moreEx");
    if (more) more.onclick = () => { document.querySelectorAll(".ex.extra").forEach((x) => x.classList.remove("hide")); more.remove(); };
    document.querySelectorAll("[data-ck]").forEach((cb) => { cb.checked = Store.get("ck:" + cb.dataset.ck, false); cb.onchange = () => Store.set("ck:" + cb.dataset.ck, cb.checked || undefined); });

    const rows = [...document.querySelectorAll(".prac tbody tr")];
    document.getElementById("pracCount").textContent = `${rows.filter((r) => Progress.prob(r.dataset.slug)?.s === "solved").length} / ${rows.length} solved`;
    const pf = document.getElementById("pf");
    pf.onclick = (e) => { const b = e.target.closest("button"); if (!b) return; pf.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); rows.forEach((tr) => (tr.hidden = b.dataset.f !== "All" && tr.dataset.d !== b.dataset.f)); };

    document.querySelectorAll(".mcq").forEach((m) => (m.onclick = (e) => {
      const b = e.target.closest(".opt"); if (!b || m.dataset.done) return; m.dataset.done = 1;
      b.classList.add(+b.dataset.i === +b.dataset.c ? "right" : "wrong");
      m.querySelectorAll(".opt")[+b.dataset.c].classList.add("right"); m.querySelector(".why").classList.add("show");
    }));

    const ta = document.getElementById("noteTa"), saved = document.getElementById("noteSaved");
    ta.value = Store.get("note:" + id, ""); let h;
    ta.oninput = () => { clearTimeout(h); h = setTimeout(() => { Store.set("note:" + id, ta.value || undefined); saved.textContent = "· saved"; }, 400); };

    // section bar: in-page links must not reload the pattern, and highlight the current section
    const bar = document.getElementById("secbar"), links = [...bar.querySelectorAll("a")];
    bar.onclick = (e) => { const a = e.target.closest("a"); if (!a) return; e.preventDefault(); document.getElementById(a.dataset.t).scrollIntoView({ behavior: "smooth" }); };
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.dataset.t === en.target.id)); }), { rootMargin: "-25% 0px -65% 0px" });
    document.querySelectorAll(".psec").forEach((s) => io.observe(s));
    PyRunner.warm();
  }

  function drawSide() {
    document.getElementById("side").innerHTML = `<span class="lab">All patterns</span>` + GROUPS.map((g) => {
      const ps = CATALOG.filter((p) => p.group === g.id);
      return `<details ${ps.some((p) => p.id === id) ? "open" : ""}><summary><span class="sw" style="background:var(--${g.color})"></span>${g.name}</summary><ul>
        ${ps.map((p) => `<li><a href="${patternUrl(p.id)}" class="${p.id === id ? "on" : ""}">${p.title}<span class="d s${Progress.status(p.id)}"></span></a></li>`).join("")}</ul></details>`;
    }).join("");
  }
  function prevNext(meta) {
    const i = CATALOG.indexOf(meta), p = CATALOG[i - 1], n = CATALOG[i + 1];
    return `<nav class="pn">${p ? `<a class="card" href="${patternUrl(p.id)}"><span>← Previous</span><b>${p.title}</b></a>` : "<span></span>"}${n ? `<a class="card nx" href="${patternUrl(n.id)}"><span>Next →</span><b>${n.title}</b></a>` : ""}</nav>`;
  }
  function soon(meta) {
    return `<div class="card" style="margin-top:10px;background:var(--bg-2)"><span class="tag y">Draft</span><h3 style="margin:10px 0 6px;font-size:19px">This page is being written</h3>
      <p class="muted">It will follow the same layout as <a href="${patternUrl("two-pointers")}">Two Pointers</a>: recognition signals and a runnable template on the first screen, worked examples, pitfalls, comparisons, ${meta.n} practice problems and a revision card.</p>
      <div class="row"><a class="btn sm" href="practice.html">Practice mixed problems</a><a class="btn sm" href="learn.html">All patterns</a></div></div>`;
  }

  /* ---------- visualisers ---------- */
  const VIZ = {
    pairSum(el, cfg) {
      let a = cfg.a.slice(), target = cfg.target, steps = [], k = 0, timer = null;
      function build() {
        steps = []; let l = 0, r = a.length - 1;
        steps.push({ l, r, say: `<b>l</b> starts at the smallest value, <b>r</b> at the largest. Target: <span class="eq">${target}</span>` });
        while (l < r) {
          const s = a[l] + a[r];
          if (s === target) { steps.push({ l, r, found: true, say: `<span class="eq">${a[l]} + ${a[r]} = ${s}</span> Found it: indices (${l}, ${r}).` }); return; }
          if (s < target) { steps.push({ l, r, say: `<span class="eq">${a[l]} + ${a[r]} = ${s}</span> too small, so move <b>l</b> right.` }); l++; }
          else { steps.push({ l, r, say: `<span class="eq">${a[l]} + ${a[r]} = ${s}</span> too big, so move <b>r</b> left.` }); r--; }
        }
        steps.push({ l, r, none: true, say: `The pointers met. No pair adds up to ${target}.` });
      }
      el.innerHTML = `<div class="viz-stage"><div class="cells"></div><div class="viz-say"></div></div>
        <div class="viz-ctl"><button class="btn sm" data-a="reset">${ICON.reset}</button><button class="btn sm" data-a="prev">${ICON.prev}</button>
          <button class="btn sm yellow" data-a="play">${ICON.play} Play</button><button class="btn sm" data-a="next">${ICON.next}</button>
          <span class="mono small stepn"></span><label class="mono small">target <input class="input" type="number" value="${target}"></label></div>`;
      const cells = el.querySelector(".cells"), say = el.querySelector(".viz-say"), stepn = el.querySelector(".stepn"), playBtn = el.querySelector('[data-a="play"]');
      function paint() {
        const s = steps[k];
        cells.innerHTML = a.map((v, i) => {
          const cls = [i === s.l && "l", i === s.r && "r", s.found && (i === s.l || i === s.r) && "found", (i < s.l || i > s.r) && "out"].filter(Boolean).join(" ");
          return `<div class="cell ${cls}"><div class="v">${v}</div><div class="ix">${i}</div><div class="ptr">${[i === s.l && "<span>l</span>", i === s.r && "<span>r</span>"].filter(Boolean).join(" ")}</div></div>`;
        }).join("");
        say.innerHTML = s.say; stepn.textContent = `${k + 1}/${steps.length}`;
      }
      const stop = () => { clearInterval(timer); timer = null; playBtn.innerHTML = `${ICON.play} Play`; };
      el.querySelector(".viz-ctl").onclick = (e) => {
        const b = e.target.closest("[data-a]"); if (!b) return;
        const act = b.dataset.a;
        if (act === "next") { stop(); k = Math.min(k + 1, steps.length - 1); }
        if (act === "prev") { stop(); k = Math.max(k - 1, 0); }
        if (act === "reset") { stop(); k = 0; }
        if (act === "play") { if (timer) stop(); else { if (k === steps.length - 1) k = 0; playBtn.innerHTML = `${ICON.stop} Pause`; timer = setInterval(() => { if (k >= steps.length - 1) return stop(); k++; paint(); }, 1000); } }
        paint();
      };
      el.querySelector("input").oninput = (e) => { const v = parseInt(e.target.value, 10); if (!isNaN(v)) { stop(); target = v; k = 0; build(); paint(); } };
      build(); paint();
    }
  };
})();
