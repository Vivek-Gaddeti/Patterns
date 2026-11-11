"""Runs every code block and every problem solution exactly the way the site's judge does.
Called by tools/build.js with a JSON file of jobs."""
import contextlib
import io
import json
import sys
import time

data = json.load(open(sys.argv[1], encoding="utf-8"))
PRELUDE = data["prelude"]
base = {"__name__": "__main__"}
exec(PRELUDE, base)

fails, slow, n = [], [], 0
for job in data["jobs"]:
    n += 1
    if job["kind"] == "code":
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                exec(compile(job["code"], "block.py", "exec"), {"__name__": "__main__"})
        except Exception as ex:
            fails.append(f"{job['id']}: crashed: {type(ex).__name__}: {ex}")
            continue
        got, exp = buf.getvalue().strip(), (job["expected"] or "").strip()
        if got != exp:
            fails.append(f"{job['id']}: output differs\n      got: {got!r}\n      exp: {exp!r}")
        continue

    g = dict(base)
    try:
        exec(compile(job["solution"], "solution.py", "exec"), g)
        if job.get("starter"):
            compile(job["starter"], "starter.py", "exec")
    except Exception as ex:
        fails.append(f"{job['id']}: solution does not load: {ex}")
        continue
    F = g.get(job["fn"])
    if F is None:
        fails.append(f"{job['id']}: {job['fn']} not defined")
        continue
    t0 = time.perf_counter()
    for i, (a, e) in enumerate(job["cases"]):
        try:
            g["F"], g["args"] = F, list(eval("(" + a + ",)", g))
            exp = eval(e, g)
            g["r"] = eval(job.get("call") or "F(*args)", g)
            r = eval(job.get("conv") or "r", g)
            if r != exp:
                fails.append(f"{job['id']}: case {i + 1} wrong\n      args: {a[:120]}\n      got:  {repr(r)[:160]}\n      exp:  {e[:160]}")
        except Exception as ex:
            fails.append(f"{job['id']}: case {i + 1} crashed: {type(ex).__name__}: {ex}")
    dt = time.perf_counter() - t0
    if dt > 1.0:
        slow.append(f"{job['id']}: {dt:.2f}s in CPython (the browser is ~2-3x slower, limit 6s)")

print(f"checked {n} jobs")
for s in slow:
    print("  SLOW", s)
for f in fails:
    print("  FAIL", f)
sys.exit(1 if fails else 0)
