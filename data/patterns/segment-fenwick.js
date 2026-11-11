PAT("segment-fenwick", {
  time: "O(log n) per operation", space: "O(n)",
  lede: "When an array keeps changing and you keep asking about ranges (sums, minimums, counts), a prefix-sum array is too slow to rebuild. A Fenwick tree (binary indexed tree) handles point updates and prefix sums in O(log n); a segment tree handles any associative range query (min, max, sum).",
  idea: "Prefix sums give O(1) queries but O(n) updates. A **Fenwick tree** stores partial sums over blocks whose sizes are powers of two, chosen by the lowest set bit (`i & −i`): update walks up `i += i & −i`, query walks down `i −= i & −i`, both O(log n). A **segment tree** stores the answer for every node's range in a binary tree over the array; a query combines O(log n) nodes. Fenwick trees also count “how many earlier values are ≤ x” after compressing values to ranks.",
  analogy: "A company org chart where each manager knows the total sales of their whole team: to change one salesperson's number you update their chain of managers; to get a range total you ask a few managers instead of every salesperson.",
  flavours: [["Structure", "Supports", "Use it for"], [
    ["**Fenwick (BIT)**", "point update, prefix sum", "range sums with updates, counting inversions"],
    ["**Fenwick on ranks**", "add 1 at rank(x), count ≤ rank", "smaller-before / after counts"],
    ["**Segment tree**", "point update, any associative range query", "range min/max/sum, gcd"],
    ["**Sparse table**", "static range min/max in O(1)", "no updates at all"]]],
  signals: [["Many updates **and** many range queries mixed together", "n, q up to 10⁵"], ["“How many earlier / later elements are smaller?”", "Fenwick over compressed values"], ["Range minimum / maximum queries", "segment tree or sparse table"], ["Counting inversions or special pairs", "BIT or merge sort"]],
  not: "**Not this pattern** if there are no updates (→ prefix sums), or all updates come before all queries (→ difference array). In OAs, reach for it only when the constraints force it.",
  templates: [
    ["Fenwick tree", "fenwick.py", `class Fenwick:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 1)             # 1-indexed

    def add(self, i, delta):               # a[i] += delta
        i += 1
        while i <= self.n:
            self.t[i] += delta
            i += i & -i                    # next block that covers i

    def prefix(self, i):                   # sum of a[0..i]
        i += 1
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i                    # previous disjoint block
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - (self.prefix(l - 1) if l else 0)

f = Fenwick(5)
for i, v in enumerate([1, 3, 5, 7, 9]):
    f.add(i, v)
print(f.range_sum(1, 3)); f.add(2, 10); print(f.range_sum(0, 4))`, "15\n35"],
    ["Segment tree (min)", "segtree.py", `class MinTree:
    def __init__(self, a):
        self.n = len(a)
        self.t = [0] * self.n + list(a)    # leaves at n..2n-1
        for i in range(self.n - 1, 0, -1):
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def update(self, i, v):
        i += self.n
        self.t[i] = v
        while i > 1:
            i //= 2
            self.t[i] = min(self.t[2 * i], self.t[2 * i + 1])

    def query(self, l, r):                 # min of a[l..r]
        res = float("inf")
        l += self.n; r += self.n + 1
        while l < r:
            if l & 1: res = min(res, self.t[l]); l += 1
            if r & 1: r -= 1; res = min(res, self.t[r])
            l //= 2; r //= 2
        return res

st = MinTree([5, 2, 8, 6, 3])
print(st.query(0, 4), st.query(2, 3)); st.update(1, 9); print(st.query(0, 2))`, "2 6\n5"]
  ],
  examples: [
    { t: "Count Inversions", d: "Medium", lc: "count-of-smaller-numbers-after-self", f: "Fenwick on ranks",
      q: "Count pairs i < j with a[i] > a[j].",
      idea: "Scan left to right; before adding a[j], count how many earlier values are greater: (seen so far) − (seen ≤ a[j]).",
      code: `def inversions(a):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
    n = len(ranks); t = [0] * (n + 1)
    total = 0
    for seen, x in enumerate(a):
        r = ranks[x]; i = r; le = 0
        while i > 0: le += t[i]; i -= i & -i
        total += seen - le
        i = r
        while i <= n: t[i] += 1; i += i & -i
    return total

print(inversions([2, 4, 1, 3, 5]), inversions([5, 4, 3, 2, 1]))`, out: "3 10", cx: "O(n log n)" }
  ],
  pitfalls: [
    ["Off-by-one with 1-indexing", "Fenwick trees are 1-indexed internally; shift by one in add / prefix."],
    ["Forgetting to compress values", "Values up to 10⁹ need ranks before you can index a tree with them."],
    ["Using a tree when prefix sums suffice", "No updates? A prefix array is simpler and faster."],
    ["Recursive segment trees in Python", "Iterative (bottom-up) versions are much faster for 10⁵ operations."]
  ],
  edge: ["Single element", "Query range of length 1", "Update to the same value", "All values equal", "Negative values"],
  compare: [
    ["Prefix Sum", "prefix-sum", "Static data: prefix sums give O(1) queries with no tree."],
    ["Line Sweep & Difference Array", "line-sweep", "All updates first, reads at the end: a difference array is enough."],
    ["Custom Sorting (merge sort)", "custom-sort", "Inversion counting also works by counting during merge sort."]
  ],
  mcq: [
    ["What does `i & −i` give in a Fenwick tree?", ["i squared", "The lowest set bit of i: the size of the block node i covers", "The parent's value", "Nothing useful"], 1, "It decides which ranges a node is responsible for."],
    ["Updates and range-sum queries are mixed, n = q = 10⁵. Best choice?", ["Recompute prefix sums each time", "Fenwick or segment tree", "Sort", "Two pointers"], 1, "Both operations become O(log n)."]
  ],
  summary: {
    oneLine: "Fenwick: add / prefix in O(log n) via i ± (i & −i). Segment tree: any associative range query with updates.",
    signals: ["Updates and range queries interleaved", "Count smaller earlier / later", "Range min / max with updates", "Inversions"],
    template: `def add(i, d):
    i += 1
    while i <= n: t[i] += d; i += i & -i
def prefix(i):
    i += 1; s = 0
    while i: s += t[i]; i -= i & -i
    return s`,
    pitfalls: ["1-indexing", "Compress values", "Prefix sums if static", "Iterative trees in Python"],
    cx: "O(log n) per operation · O(n) space",
    drill: { task: "Count the pairs i < j with a[i] > a[j] (inversions) in O(n log n).",
      ref: `def inversions(a):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
    n = len(ranks)
    t = [0] * (n + 1)
    total = 0
    for seen, x in enumerate(a):
        i = r = ranks[x]
        le = 0
        while i > 0:
            le += t[i]
            i -= i & -i
        total += seen - le
        i = r
        while i <= n:
            t[i] += 1
            i += i & -i
    return total`,
      tests: [["[2, 4, 1, 3, 5]", "3"], ["[1, 2, 3]", "0"], ["[3, 3, 1]", "2"]] }
  },
  problems: [
    { id: "live-totals", title: "Live Range Totals", d: "Medium", lc: "range-sum-query-mutable",
      statement: "Implement `LiveTotals(nums)` with `update(i, val)` (set nums[i] = val) and `total(l, r)` (sum of nums[l..r]). Both must be fast for 10⁵ mixed calls. The checker runs a list of operations; the constructor and `update` output `None`.",
      examples: [["['LiveTotals', 'total', 'update', 'total'], [[[1, 3, 5]], [0, 2], [1, 2], [0, 2]]", "[None, 9, None, 8]", ""], ["['LiveTotals', 'update', 'total'], [[[0, 0]], [0, 5], [0, 1]]", "[None, None, 5]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "up to 3·10⁴ calls"],
      hints: ["Rebuilding prefix sums on every update is O(n).", "A Fenwick tree stores block sums: add and prefix are O(log n).", "update(i, val) = add(i, val − current value)."],
      starter: "class LiveTotals:\n    def __init__(self, nums):\n        pass\n\n    def update(self, i, val):\n        pass\n\n    def total(self, l, r):\n        pass\n",
      solution: `class LiveTotals:
    def __init__(self, nums):
        self.n = len(nums)
        self.a = [0] * self.n
        self.t = [0] * (self.n + 1)
        for i, v in enumerate(nums):
            self.update(i, v)

    def _add(self, i, d):
        i += 1
        while i <= self.n:
            self.t[i] += d
            i += i & -i

    def _prefix(self, i):
        i += 1
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s

    def update(self, i, val):
        self._add(i, val - self.a[i])
        self.a[i] = val

    def total(self, l, r):
        return self._prefix(r) - (self._prefix(l - 1) if l else 0)`,
      call: "run_ops(F, *args)",
      why: "Both operations touch O(log n) Fenwick nodes.", time: "O(log n) per call",
      hidden: [["['LiveTotals', 'total'], [[[7]], [0, 0]]", "[None, 7]"], ["['LiveTotals', 'update', 'update', 'total'], [[[1, 2, 3]], [0, 0], [2, 0], [0, 2]]", "[None, None, None, 2]"], ["['LiveTotals'] + ['update', 'total'] * 15000, [[[0] * 30000]] + [x for i in range(15000) for x in ([i, 1], [0, 29999])]", "[None] + [x for i in range(15000) for x in (None, i + 1)]"]] },
    { id: "out-of-order", title: "Out-of-Order Pairs", d: "Medium", lc: "count-of-smaller-numbers-after-self",
      statement: "Return the number of pairs `i < j` with `a[i] > a[j]`.",
      examples: [["[2, 4, 1, 3, 5]", "3", "(2,1), (4,1), (4,3)"], ["[5, 4, 3, 2, 1]", "10", ""], ["[1, 1, 1]", "0", ""]],
      constraints: ["1 ≤ len(a) ≤ 10⁵", "−10⁹ ≤ a[i] ≤ 10⁹"],
      hints: ["O(n²) is too slow for 10⁵.", "Compress values to ranks 1..k.", "Scan left to right with a Fenwick tree counting how many earlier values are ≤ the current one."],
      solution: `def out_of_order(a):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(a)))}
    n = len(ranks)
    t = [0] * (n + 1)
    total = 0
    for seen, x in enumerate(a):
        i = r = ranks[x]
        le = 0
        while i > 0:
            le += t[i]
            i -= i & -i
        total += seen - le
        i = r
        while i <= n:
            t[i] += 1
            i += i & -i
    return total`,
      why: "Earlier values greater than x = (how many came before) − (how many of those are ≤ x), each found in O(log n).", time: "O(n log n)",
      hidden: [["[1]", "0"], ["[2, 1, 2, 1]", "3"], ["list(range(100000, 0, -1))", "4999950000"]] },
    { id: "range-lows", title: "Range Lows", d: "Medium", lc: "range-sum-query-mutable",
      statement: "Answer each query `[l, r]` with the minimum of `a[l..r]`. The array doesn't change. Return the list of answers.",
      examples: [["[5, 2, 8, 6, 3], [[0, 4], [2, 3], [4, 4]]", "[2, 6, 3]", ""], ["[1], [[0, 0]]", "[1]", ""]],
      constraints: ["1 ≤ len(a), len(queries) ≤ 10⁵"],
      hints: ["Scanning each range is O(n) per query.", "Sparse table: mn[k][i] = min of a[i .. i + 2ᵏ − 1].", "A query covers [l, r] with two overlapping blocks of size 2ᵏ, k = floor(log2(length))."],
      solution: `def range_lows(a, queries):
    n = len(a)
    mn = [a[:]]
    k = 1
    while (1 << k) <= n:
        prev = mn[-1]
        half = 1 << (k - 1)
        mn.append([min(prev[i], prev[i + half]) for i in range(n - (1 << k) + 1)])
        k += 1
    out = []
    for l, r in queries:
        j = (r - l + 1).bit_length() - 1
        out.append(min(mn[j][l], mn[j][r - (1 << j) + 1]))
    return out`,
      why: "Min is idempotent, so two overlapping power-of-two blocks answer any range in O(1) after O(n log n) setup.", time: "O(n log n + q)",
      hidden: [["[3, 1], [[0, 1], [0, 0]]", "[1, 3]"], ["[4, 4, 4], [[0, 2]]", "[4]"], ["list(range(100000, 0, -1)), [[0, 99999], [0, 0]] * 50000", "[1, 100000] * 50000"]] },
    { id: "boost-and-peek", title: "Boost and Peek", d: "Medium", lc: "range-addition",
      statement: "Implement `Booster(n)` over an array of n zeros with `boost(l, r, v)` (add v to every index l..r) and `peek(i)` (current value at i), both in O(log n). The checker runs a list of operations; the constructor and `boost` output `None`.",
      examples: [["['Booster', 'boost', 'peek', 'peek', 'boost', 'peek'], [[5], [1, 3, 2], [0], [2], [2, 4, 5], [3]]", "[None, None, 0, 2, None, 7]", ""], ["['Booster', 'peek'], [[1], [0]]", "[None, 0]", ""]],
      constraints: ["1 ≤ n ≤ 10⁵", "up to 10⁵ calls"],
      hints: ["Think of a difference array: +v at l, −v at r + 1.", "A point's value is the prefix sum of the difference array.", "Store the difference array in a Fenwick tree."],
      starter: "class Booster:\n    def __init__(self, n):\n        pass\n\n    def boost(self, l, r, v):\n        pass\n\n    def peek(self, i):\n        pass\n",
      solution: `class Booster:
    def __init__(self, n):
        self.n = n
        self.t = [0] * (n + 2)

    def _add(self, i, d):
        i += 1
        while i <= self.n + 1:
            self.t[i] += d
            i += i & -i

    def boost(self, l, r, v):
        self._add(l, v)
        self._add(r + 1, -v)

    def peek(self, i):
        i += 1
        s = 0
        while i > 0:
            s += self.t[i]
            i -= i & -i
        return s`,
      call: "run_ops(F, *args)",
      why: "Range add on the values = two point updates on the difference array; a point read = a prefix sum.", time: "O(log n) per call",
      hidden: [["['Booster', 'boost', 'peek'], [[3], [0, 2, 4], [1]]", "[None, None, 4]"], ["['Booster', 'boost', 'boost', 'peek'], [[3], [0, 0, 1], [0, 2, 1], [0]]", "[None, None, None, 2]"], ["['Booster'] + ['boost'] * 50000 + ['peek'], [[100000]] + [[0, 99999, 1]] * 50000 + [[99999]]", "[None] * 50001 + [50000]"]] },
    { id: "double-drop-pairs", title: "Double-Drop Pairs", d: "Hard", lc: "reverse-pairs",
      statement: "Count the pairs `i < j` with `nums[i] > 2 * nums[j]`.",
      examples: [["[1, 3, 2, 3, 1]", "2", ""], ["[2, 4, 3, 5, 1]", "3", ""]],
      constraints: ["1 ≤ len(nums) ≤ 5·10⁴", "−2³¹ ≤ nums[i] ≤ 2³¹ − 1"],
      hints: ["Scan from the left; for each nums[j], count earlier values > 2·nums[j].", "Compress all values and all doubled values together into ranks.", "A Fenwick tree counts earlier values ≤ 2·nums[j]; subtract from how many came before."],
      solution: `def double_drop_pairs(nums):
    vals = sorted(set(nums) | {2 * x for x in nums})
    rank = {v: i + 1 for i, v in enumerate(vals)}
    n = len(vals)
    t = [0] * (n + 1)
    total = 0
    for seen, x in enumerate(nums):
        i = rank[2 * x]
        le = 0
        while i > 0:
            le += t[i]
            i -= i & -i
        total += seen - le
        i = rank[x]
        while i <= n:
            t[i] += 1
            i += i & -i
    return total`,
      why: "Compressing both x and 2x lets one Fenwick tree answer “how many earlier values are ≤ 2x” in O(log n).", time: "O(n log n)",
      hidden: [["[1]", "0"], ["[5, 1]", "1"], ["list(range(50000, 0, -1))", "624975000"]] }
  ]
});
