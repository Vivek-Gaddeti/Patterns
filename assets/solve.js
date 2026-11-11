/* Problem workspace: statement + editor + tests.
   mountSolve(el, id, { mock: bool, onSubmit(passedAll, summary, code) }) -> Promise */
(function () {
  window.mountSolve = async function (host, id, opt = {}) {
    host.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:40px">Loading problem…</div></div>`;
    const P = PROBLEMS.find((p) => p.id === id), S = await problemData(id);
    if (!P || !S) { host.innerHTML = `<div class="wrap"><div class="empty" style="margin-top:40px">Problem not found. <a href="practice.html">Back to practice</a></div></div>`; return; }
    const mock = !!opt.mock, sig = signature(S.solution);
    const judgeSpec = { fn: sig.fn, call: S.call, conv: S.conv };
    const samples = S.examples.map((e) => [e[0], e[1]]);
    const tabs = mock ? [["desc", "Description"], ["scratch", "Scratch"]] : [["desc", "Description"], ["scratch", "Scratch"], ["hints", "Hints"], ["pattern", "Pattern"], ["sol", "Solution"], ["notes", "My notes"]];
    const ex = S.examples.map(([a, o, why], n) => `<h4>Example ${n + 1}</h4><pre class="io"><b>Input:</b>  ${esc(showArgs(S, a))}\n<b>Output:</b> ${esc(o)}${why ? `\n<span class="muted">${esc(why)}</span>` : ""}</pre>`).join("");
    const what = sig.isClass ? `Implement the class <code>${sig.fn}</code>.` : `Write <code>${sig.fn}(${sig.params.join(", ")})</code>.`;

    host.innerHTML = `<div class="vtabs" role="tablist"><button data-v="problem" class="on">Problem</button><button data-v="code">Code</button><button data-v="scratch">Scratch</button></div>
    <div class="split" data-v="problem">
      <section class="left">
        <div class="ptabs">${tabs.map(([k, t], i) => `<button data-t="${k}" class="${i ? "" : "on"}">${t}</button>`).join("")}</div>
        <div class="pbody" data-p="desc">
          <div class="row" style="margin-bottom:6px"><span class="tag ${P.d.toLowerCase()}">${P.d}</span>${!mock && Progress.prob(id)?.s === "solved" ? '<span class="status s-solved">Solved</span>' : ""}</div>
          <h2>${P.title}</h2>
          <p>${md(S.statement)}</p>
          <p class="small muted">${what}</p>
          ${ex}
          ${/build_tree/.test(JSON.stringify(S.examples)) ? `<p class="small muted">Trees are written level by level, with <code>None</code> for a missing child. Your function receives a <code>TreeNode</code> (fields <code>val</code>, <code>left</code>, <code>right</code>).</p>` : ""}
          ${/build_list/.test(JSON.stringify(S.examples)) ? `<p class="small muted">Linked lists are shown as their values in order. Your function receives the head <code>ListNode</code> (fields <code>val</code>, <code>next</code>).</p>` : ""}
          <h4>Constraints</h4><ul>${S.constraints.map((c) => `<li class="mono small">${c}</li>`).join("")}</ul>
          <div class="cx-hint">${ICON.clock}<span>${cxHint(S.constraints)}</span></div>
          ${mock ? "" : nav(P)}
        </div>
        <div class="pbody spane hide" data-p="scratch"><div class="pad-host"></div></div>
        ${mock ? "" : `
        <div class="pbody hide" data-p="hints"><p class="muted small">Open one at a time. Each hint gives away a little more.</p>
          ${S.hints.map((h, i) => `<details class="hint-step"><summary>Hint ${i + 1}</summary><div>${md(h)}</div></details>`).join("")}</div>
        <div class="pbody hide" data-p="pattern"><p>Try to name the pattern yourself first. That's the skill the OA tests.</p>
          <button class="btn" id="revealPat">${ICON.eye} Reveal the pattern</button><div id="patOut" style="margin-top:14px"></div></div>
        <div class="pbody hide" data-p="sol"></div>
        <div class="pbody hide" data-p="notes"><p class="muted small">What tripped you up? This goes into your mistake log on the Practice page.</p>
          <textarea class="input" id="note" style="width:100%;min-height:140px" placeholder="e.g. Used if instead of while to shrink the window."></textarea></div>`}
      </section>
      <section class="right">
        <div class="ed-host"></div>
        <div class="runbar">
          <button class="btn sm" id="run">${ICON.play} Run samples</button>
          <button class="btn sm green" id="submit">${ICON.check} Submit</button>
          <span class="grow"></span>
          ${mock ? "" : `<span class="mono small muted" id="clock" title="Time on this problem">00:00</span>`}
          <span class="muted small kbd-hint">Ctrl+Enter runs samples</span>
        </div>
        <div class="results" id="res"><div class="rh">Results</div><div class="empty" style="margin:14px">Run the sample tests, then Submit to run the hidden tests too.</div></div>
      </section></div>`;

    const $ = (s) => host.querySelector(s);
    const ed = mountEditor($(".ed-host"), { code: starterOf(S), title: "solution.py", key: (mock ? "mock:" : "solve:") + id, bare: true, onRun: () => go(false) });

    let padMounted = false, lastTab = "desc";
    function showTab(t) {
      host.querySelectorAll(".ptabs button").forEach((x) => x.classList.toggle("on", x.dataset.t === t));
      host.querySelectorAll("[data-p]").forEach((p) => p.classList.toggle("hide", p.dataset.p !== t));
      if (t === "sol") drawSol();
      if (t === "scratch" && !padMounted && window.mountScratch) {       // one sketch per problem, with the first example as array boxes
        padMounted = true;
        mountScratch($(".pad-host"), { key: (mock ? "mock:" : "solve:") + id, values: scratchValues(samples[0] && samples[0][0]), fill: true });
      }
      if (t !== "scratch") lastTab = t;
    }
    $(".ptabs").onclick = (e) => { const b = e.target.closest("button"); if (b) showTab(b.dataset.t); };
    // narrow screens: Problem / Code / Scratch replace the stacked layout
    $(".vtabs").onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      host.querySelectorAll(".vtabs button").forEach((x) => x.classList.toggle("on", x === b));
      $(".split").dataset.v = b.dataset.v;
      if (b.dataset.v === "scratch") showTab("scratch");
      if (b.dataset.v === "problem") showTab(lastTab);
    };
    if (!mock) {
      $("#revealPat").onclick = () => { const p = patternOf(P.pat); $("#patOut").innerHTML = `<a class="card" href="${patternUrl(p.id)}"><div class="row"><span class="sw" style="background:var(--${groupOf(p.group).color})"></span><b>${p.title}</b></div><p class="muted small" style="margin:6px 0 0">${p.sub} Open the pattern page →</p></a>`; };
      const note = $("#note"); note.value = Progress.prob(id)?.note || "";
      note.oninput = () => Progress.setProb(id, { note: note.value, s: Progress.prob(id)?.s || "attempted" });
      const t0 = Date.now(), clock = setInterval(() => { const c = $("#clock"); if (!c) return clearInterval(clock); const s = Math.floor((Date.now() - t0) / 1000); c.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }, 1000);
    }
    function drawSol(force) {
      const unlocked = force || Progress.prob(id);
      const box = $('[data-p="sol"]');
      box.innerHTML = unlocked
        ? `<p>${md(S.why)}</p><div class="sol-ed"></div><p class="small muted" style="margin-top:10px">Complexity: <b>${S.time}</b>${S.lc ? ` · <a href="${lcUrl(S.lc)}" target="_blank" rel="noopener">Similar problem on LeetCode ↗</a>` : ""}</p>
           <button class="btn sm" id="useSol" style="margin-top:6px">Copy into my editor</button>`
        : `<div class="empty">Make an attempt first: submit once, or write a note.<br><button class="btn sm" style="margin-top:12px" id="peek">Show it anyway</button></div>`;
      if (unlocked) {
        box.querySelector(".sol-ed").innerHTML = `<pre class="io" style="background:var(--code-bg);color:var(--code-text);white-space:pre;overflow-x:auto">${highlightPy(S.solution)}</pre>`;
        $("#useSol").onclick = () => { if (confirm("Replace your code with the reference solution?")) { ed.value = S.solution + "\n"; } };
      }
      const pk = $("#peek"); if (pk) pk.onclick = () => drawSol(true);
    }

    let busy = false;
    $("#run").onclick = () => go(false);
    $("#submit").onclick = () => go(true);
    async function go(all) {
      if (busy) return; busy = true;
      $("#run").disabled = $("#submit").disabled = true;
      const res = $("#res");
      res.innerHTML = `<div class="rh">${all ? "Submitting" : "Running samples"} <span class="tag" id="rs">Starting…</span></div>`;
      const cases = all ? [...samples, ...S.hidden] : samples;
      const r = await Judge.run(ed.value, judgeSpec, cases, { timeoutMs: 6000, onStatus: (s) => { const x = $("#rs"); if (x) x.textContent = s; } });
      busy = false; $("#run").disabled = $("#submit").disabled = false;
      const out = r.stdout && r.stdout.trim() ? `<div class="rh">Your prints</div><pre style="margin:0;padding:8px 12px;font:12.5px var(--f-mono);white-space:pre-wrap">${esc(r.stdout.trim().slice(0, 3000))}</pre>` : "";
      if (r.tle) { res.innerHTML = `<div class="rh">Result <span class="tag bad">Time limit exceeded</span></div><div class="case fail"><div>TLE</div><div class="io">Your code ran for more than 6 seconds. Check the constraints: you probably need a faster approach than nested loops.</div></div>` + out; return finish(all, false, "TLE"); }
      const lineOf = (t) => { const m = /line (\d+)/.exec(t || ""); return m ? +m[1] : null; };
      const badLine = r.error ? lineOf(r.error) : (r.results || []).map((x) => (x.crash ? lineOf(x.got) : null)).find(Boolean);
      if (badLine) ed.markError(badLine); else ed.clearError();
      if (r.error) { res.innerHTML = `<div class="rh">Result <span class="tag bad">Error</span></div><pre style="margin:0;padding:10px 12px;color:var(--red);font:12.5px var(--f-mono);white-space:pre-wrap">${esc(r.error)}</pre>` + out; return finish(all, false, "Error"); }
      const n = samples.length, pass = r.results.filter((x) => x.ok).length, ok = pass === r.results.length;
      res.innerHTML = `<div class="rh">${all ? "Submission" : "Sample tests"} <span class="tag ${ok ? "ok" : "bad"}">${pass} / ${r.results.length} passed</span>${all && ok ? '<span class="tag ok">Accepted</span>' : ""}</div>` +
        r.results.map((x, i) => i < n
          ? `<div class="case ${x.ok ? "pass" : "fail"}"><div>${x.ok ? "✓" : "✗"} Case ${i + 1}</div><div class="io"><b>input</b>    ${esc(showArgs(S, samples[i][0]))}\n<b>expected</b> ${esc(samples[i][1])}\n<b>got</b>      ${esc(x.got)}  <span class="muted">${x.ms} ms</span></div></div>`
          : `<div class="case ${x.ok ? "pass" : "fail"}"><div>${x.ok ? "✓" : "✗"} Hidden ${i - n + 1}</div><div class="io">${x.ok ? `Passed in ${x.ms} ms` : x.crash ? "Crashed: " + esc(x.got.split(":")[0]) : "Wrong answer (input hidden, like in a real OA)"}</div></div>`).join("") + out;
      finish(all, ok, `${pass}/${r.results.length}`);
    }
    function finish(all, ok, summary) {
      if (!all) return;
      if (!mock) {
        const prev = Progress.prob(id)?.s;
        Progress.setProb(id, { s: ok ? "solved" : prev === "solved" ? "solved" : "attempted" });
        toast(ok ? "Accepted! Marked as solved." : "Not yet. Saved as attempted.");
      }
      if (opt.onSubmit) opt.onSubmit(ok, summary, ed.value);
    }
    PyRunner.warm();
  };

  /* previous / next problem of the same pattern, plus a random unsolved one */
  function nav(P) {
    const same = PROBLEMS.filter((p) => p.pat === P.pat), i = same.indexOf(P);
    const prev = same[i - 1], next = same[i + 1];
    return `<div class="row" style="margin-top:22px;border-top:1px solid var(--line);padding-top:14px">
      ${prev ? `<a class="btn sm" href="solve.html#${prev.id}">← ${prev.title}</a>` : ""}<span class="grow"></span>
      ${next ? `<a class="btn sm" href="solve.html#${next.id}">${next.title} →</a>` : `<a class="btn sm" href="practice.html">Back to practice</a>`}</div>`;
  }

  /* constraint size -> what complexity you can afford */
  function cxHint(cons) {
    const sup = "⁰¹²³⁴⁵⁶⁷⁸⁹";
    const m = (cons[0] || "").match(/10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/), small = (cons[0] || "").match(/≤\s*([\d,]+)\b(?![⁰¹²³⁴⁵⁶⁷⁸⁹·])/);
    let e = m ? +[...m[1]].map((c) => sup.indexOf(c)).join("") : null, label = m ? "10" + m[1] : null;
    if (e == null && small) { const v = +small[1].replace(/,/g, ""); e = Math.log10(v); label = small[1]; }
    if (e == null) return `Check the constraints to pick a target complexity. <a href="toolkit.html#sizes">How?</a>`;
    const rule = e <= 1.3 ? "even O(2ⁿ) or O(n!) is fine" : e <= 2.7 ? "O(n³) is fine" : e <= 3.7 ? "O(n²) is fine" : e <= 6 ? "aim for O(n) or O(n log n); O(n²) will time out" : "you need O(log n) or O(1) per step";
    return `<b>n up to ${label}:</b> ${rule}. <a href="toolkit.html#sizes">Why?</a>`;
  }
})();
