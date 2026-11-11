/* Runs a function (or class) from the user's code against test cases, OA-style.
   Judge.run(code, problem, cases, {timeoutMs, onStatus}) -> Promise<{results, stdout, error, tle}>
   problem: { fn, call?, conv? }   call: Python expr using F and args (default "F(*args)")
                                   conv: Python expr using r and args, applied to the result before comparing */
(function () {
  /* Same helpers as LeetCode gives you. Kept in sync with tools/check.py */
  window.PRELUDE = `
import math, heapq, bisect, collections, itertools, functools, string, re, sys
from typing import *
from collections import Counter, defaultdict, deque, OrderedDict
from heapq import heappush, heappop, heapify, heappushpop, nlargest, nsmallest
from bisect import bisect_left, bisect_right, insort
from functools import lru_cache, cache, reduce, cmp_to_key
from itertools import accumulate, combinations, permutations, product, groupby
sys.setrecursionlimit(10**6)
inf = float("inf")

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return "ListNode(" + repr(to_list(self)) + ")"

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
    def __repr__(self):
        return "TreeNode(" + repr(tree_to_list(self)) + ")"

def build_list(vals, pos=-1):
    dummy = tail = ListNode()
    nodes = []
    for v in vals:
        tail.next = ListNode(v)
        tail = tail.next
        nodes.append(tail)
    if pos >= 0 and nodes:
        tail.next = nodes[pos]
    return dummy.next

def to_list(head, limit=10**6):
    out = []
    while head and len(out) < limit:
        out.append(head.val)
        head = head.next
    return out

def build_tree(vals):
    if not vals or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    q, i = deque([root]), 1
    while q and i < len(vals):
        node = q.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i]); q.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i]); q.append(node.right)
        i += 1
    return root

def tree_to_list(root):
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node:
            out.append(node.val); q.append(node.left); q.append(node.right)
        else:
            out.append(None)
    while out and out[-1] is None:
        out.pop()
    return out

def find_node(root, val):
    if not root: return None
    if root.val == val: return root
    return find_node(root.left, val) or find_node(root.right, val)

def run_ops(cls, ops, params):
    obj, out = None, []
    for op, p in zip(ops, params):
        if obj is None:
            obj = cls(*p); out.append(None)
        else:
            out.append(getattr(obj, op)(*p))
    return out
`;

  const harness = (code, P, cases) => `
import json as __json, time as __time, traceback as __tb
__g = dict(globals())
__src = ${JSON.stringify(code)}
__cases = __json.loads(${JSON.stringify(JSON.stringify(cases))})
__res = []
def __where(ex):
    frames = [f for f in __tb.extract_tb(ex.__traceback__) if f.filename == "solution.py"]
    return (" (line %d)" % frames[-1].lineno) if frames else ""
try:
    exec(compile(__src, "solution.py", "exec"), __g)
    __F = __g.get(${JSON.stringify(P.fn)})
    if __F is None:
        print("__RESULTS__" + __json.dumps({"error": "${P.fn} was not found. Keep the name from the starter code."}))
    else:
        for __a, __e in __cases:
            try:
                __g["F"] = __F
                __g["args"] = list(eval("(" + __a + ",)", __g))
                __exp = eval(__e, __g)
                __t = __time.perf_counter()
                __g["r"] = eval(${JSON.stringify(P.call || "F(*args)")}, __g)
                __ms = (__time.perf_counter() - __t) * 1000
                __r = eval(${JSON.stringify(P.conv || "r")}, __g)
                __res.append({"ok": __r == __exp, "got": repr(__r)[:400], "ms": round(__ms, 1)})
            except Exception as __ex:
                __res.append({"ok": False, "got": type(__ex).__name__ + ": " + str(__ex)[:300] + __where(__ex), "ms": 0, "crash": True})
        print("__RESULTS__" + __json.dumps(__res))
except SyntaxError as __ex:
    print("__RESULTS__" + __json.dumps({"error": "SyntaxError on line %s: %s\\n    %s" % (__ex.lineno, __ex.msg, (__ex.text or "").rstrip())}))
except Exception as __ex:
    print("__RESULTS__" + __json.dumps({"error": type(__ex).__name__ + ": " + str(__ex) + __where(__ex)}))
`;

  window.Judge = {
    run(code, P, cases, opt = {}) {
      const timeout = opt.timeoutMs || 8000;
      return new Promise((resolve) => {
        let out = "", started = PyRunner.ready ? Date.now() : null, done = false;
        const finish = (r) => { if (done) return; done = true; clearInterval(tick); resolve(r); };
        const tick = setInterval(() => {
          if (!started && PyRunner.ready) started = Date.now();
          if (opt.onStatus) opt.onStatus(started ? "Running tests…" : "Loading Python (first run only)…");
          if (started && Date.now() - started > timeout) { PyRunner.stop(); finish({ tle: true, stdout: out }); }
        }, 200);
        PyRunner.run(PRELUDE + harness(code, P, cases), (m) => {
          if (m.type === "out") out += m.text;
          if (m.type === "error") finish({ error: m.text, stdout: out });
          if (m.type === "stopped") finish({ tle: true, stdout: out });
          if (m.type === "done") {
            const i = out.lastIndexOf("__RESULTS__");
            if (i < 0) return finish({ error: "No results were produced.", stdout: out });
            const payload = JSON.parse(out.slice(i + 11).split("\n")[0]);
            const stdout = out.slice(0, i);
            if (payload.error) return finish({ error: payload.error, stdout });
            finish({ results: payload, stdout });
          }
        });
      });
    }
  };

  /* --- helpers shared by Solve / Revise --- */
  // split "a, [1, 2], 'x,y'" at top-level commas
  window.splitArgs = (src) => {
    const out = []; let depth = 0, cur = "", q = null;
    for (let i = 0; i < src.length; i++) {
      const c = src[i];
      if (q) { cur += c; if (c === "\\") { cur += src[++i] || ""; continue; } if (c === q) q = null; continue; }
      if (c === "'" || c === '"') { q = c; cur += c; continue; }
      if ("([{".includes(c)) depth++;
      if (")]}".includes(c)) depth--;
      if (c === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  // def line -> {fn, params}; class -> {fn, params: [] }
  window.signature = (solution) => {
    const c = solution.match(/^class\s+(\w+)/m);
    if (c) return { fn: c[1], params: [], isClass: true };
    const m = solution.match(/^def\s+(\w+)\s*\(([^)]*)\)/m);
    if (!m) return { fn: "solve", params: [] };
    return { fn: m[1], params: splitArgs(m[2]).map((p) => p.split(/[:=]/)[0].trim()).filter((p) => p && p !== "self") };
  };
  window.starterOf = (P) => {
    if (P.starter) return P.starter;
    const m = P.solution.match(/^def\s+\w+\s*\([^)]*\)[^:]*:/m);
    return (m ? m[0] : "def solve():") + "\n    # your code here\n    pass\n";
  };
  // pretty "nums = [1, 2], k = 3" for an example
  window.showArgs = (P, argsSrc) => {
    const names = signature(P.solution).params, parts = splitArgs(argsSrc);
    return parts.map((v, i) => {
      const cyc = v.match(/^build_list\((\[.*\]),\s*(-?\d+)\)$/s);
      if (cyc) v = cyc[1] + (+cyc[2] >= 0 ? `  (last node links back to index ${cyc[2]})` : "");
      else v = v.replace(/^build_(list|tree)\((.*)\)$/s, "$2");
      return names[i] && names.length === parts.length ? `${names[i]} = ${v}` : v;
    }).join(", ");
  };
})();
