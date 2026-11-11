PAT("design", {
  time: "O(1) per operation (target)", space: "O(n)",
  lede: "Build a small class whose methods each run in O(1) or O(log n). The trick is almost always to combine two structures: a dict for instant lookup plus something that keeps order (a deque, an OrderedDict, a heap or sorted lists).",
  idea: "Start from the operations and their required speed. A dict gives O(1) lookup by key but no order. An `OrderedDict` (or dict + doubly linked list) gives O(1) “move to the end / pop the oldest” for LRU. A `deque` handles sliding time windows. Per-key sorted lists plus `bisect` answer “latest value at or before time t”. Write down the invariant each structure maintains and update all of them in every method.",
  analogy: "A library: the catalogue (dict) tells you instantly where a book is, while the returns trolley (queue) remembers the order books came back. You need both to answer every question quickly.",
  flavours: [["Requirement", "Structures", "Example"], [
    ["**Evict least recently used**", "OrderedDict (dict + linked list)", "LRU cache"],
    ["**Evict least frequently used**", "dict + per-frequency OrderedDicts + min frequency", "LFU cache"],
    ["**Count events in the last T seconds**", "deque of timestamps", "hit counter, rate limiter"],
    ["**Value at time t**", "dict of sorted (time, value) lists + bisect", "time-based key-value store"],
    ["**Back / forward history**", "list + current index", "browser history"]]],
  signals: [["“Design a class with methods …”", "OA / interview design question"], ["Each operation must be O(1)", "dict + ordered structure"], ["Recency, frequency or time windows", "LRU, LFU, hit counters"], ["Averages / stats over a stream", "deque + running sum"]],
  not: "**Not this pattern** for large-scale system design (databases, services) — these are in-memory data-structure classes.",
  templates: [
    ["LRU cache", "lru.py", `from collections import OrderedDict

class LRU:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()          # oldest first, newest last

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)         # mark as most recently used
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)  # evict least recently used

c = LRU(2)
c.put(1, 1); c.put(2, 2); print(c.get(1)); c.put(3, 3); print(c.get(2), c.get(3))`, "1\n-1 3"]
  ],
  examples: [
    { t: "Time Based Key-Value Store", d: "Medium", lc: "time-based-key-value-store", f: "dict + bisect",
      q: "set(key, value, t) and get(key, t): the value with the largest timestamp ≤ t.",
      idea: "Timestamps arrive increasing, so each key's list stays sorted; bisect finds the right entry.",
      code: `from bisect import bisect_right
from collections import defaultdict

class TimeMap:
    def __init__(self): self.times, self.vals = defaultdict(list), defaultdict(list)
    def set(self, k, v, t): self.times[k].append(t); self.vals[k].append(v)
    def get(self, k, t):
        i = bisect_right(self.times[k], t)
        return self.vals[k][i - 1] if i else ""

m = TimeMap(); m.set("foo", "bar", 1)
print(m.get("foo", 1), m.get("foo", 3), repr(m.get("foo", 0)))`, out: "bar bar ''", cx: "O(log n) get" }
  ],
  pitfalls: [
    ["Updating one structure but not the other", "Every method must keep all structures consistent."],
    ["O(n) operations hiding inside", "`list.remove`, `min(dict.values())` make an O(1) design O(n)."],
    ["Forgetting to refresh recency on `put` of an existing key", "Updating a key also makes it most recently used."],
    ["Capacity 0 or 1", "Check eviction logic on tiny capacities."]
  ],
  edge: ["Capacity 1", "Repeated keys", "Get of a missing key", "Timestamps exactly on the boundary", "Many operations (10⁵)"],
  compare: [
    ["Hashing", "hashing", "Every design starts with a dict for O(1) lookup."],
    ["Top-K / Heaps", "top-k", "Priority-based designs (task schedulers, leaderboards) add a heap."],
    ["Stack for Parsing", "stack-parsing", "Min stack is a small design problem built on a stack of pairs."]
  ],
  mcq: [
    ["Why does LRU need more than a dict?", ["Dicts are slow", "You also need to find and remove the least recently used key in O(1)", "Dicts can't store values", "It doesn't"], 1, "Order of use must be tracked: OrderedDict / linked list."],
    ["In a hit counter for the last 300 seconds, what structure fits?", ["A heap", "A deque of timestamps, popping from the left when they expire", "A sorted list re-sorted each time", "A set"], 1, "Timestamps arrive in order, so expired ones are always at the front."]
  ],
  summary: {
    oneLine: "Combine a dict (lookup) with an ordered structure (OrderedDict, deque, heap, sorted list) and update both every time.",
    signals: ["Design a class with O(1) methods", "Recency / frequency eviction", "Time windows and stream stats", "History navigation"],
    template: `class LRU:
    def __init__(self, cap):
        self.cap, self.d = cap, OrderedDict()
    def get(self, k):
        if k not in self.d: return -1
        self.d.move_to_end(k); return self.d[k]
    def put(self, k, v):
        self.d[k] = v; self.d.move_to_end(k)
        if len(self.d) > self.cap: self.d.popitem(last=False)`,
    pitfalls: ["Keep structures in sync", "No hidden O(n) calls", "Refresh recency on update"],
    cx: "O(1) per operation (O(log n) with bisect / heaps)",
    drill: { task: "Implement `LRU(capacity)` with `get(key)` (-1 if missing) and `put(key, value)`, evicting the least recently used key when over capacity. The checker runs a list of operations.",
      ref: `class LRU:
    def __init__(self, capacity):
        self.cap = capacity
        self.d = OrderedDict()

    def get(self, key):
        if key not in self.d:
            return -1
        self.d.move_to_end(key)
        return self.d[key]

    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)`,
      call: "run_ops(F, *args)",
      tests: [["['LRU', 'put', 'put', 'get', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3]]", "[None, None, None, 1, None, -1, 3]"]] }
  },
  problems: [
    { id: "moving-average", title: "Moving Average", d: "Easy", lc: "moving-average-from-data-stream",
      statement: "Implement `MovingAverage(size)` with `next(val)`: add val to the stream and return the average of the last `size` values (fewer if fewer have arrived). The checker rounds nothing: return a float.",
      examples: [["['MovingAverage', 'next', 'next', 'next', 'next'], [[3], [1], [10], [3], [5]]", "[None, 1.0, 5.5, 4.666666666666667, 6.0]", ""], ["['MovingAverage', 'next'], [[1], [7]]", "[None, 7.0]", ""]],
      constraints: ["1 ≤ size ≤ 1000", "up to 10⁴ calls"],
      hints: ["Keep the window in a deque and a running sum.", "When the window is too big, pop from the left and subtract."],
      starter: "class MovingAverage:\n    def __init__(self, size):\n        pass\n\n    def next(self, val):\n        pass\n",
      solution: `class MovingAverage:
    def __init__(self, size):
        self.size = size
        self.q = deque()
        self.total = 0

    def next(self, val):
        self.q.append(val)
        self.total += val
        if len(self.q) > self.size:
            self.total -= self.q.popleft()
        return self.total / len(self.q)`,
      call: "run_ops(F, *args)",
      why: "A running sum avoids re-adding the window on every call.", time: "O(1) per call",
      hidden: [["['MovingAverage', 'next', 'next'], [[1], [2], [4]]", "[None, 2.0, 4.0]"], ["['MovingAverage', 'next', 'next', 'next'], [[5], [2], [4], [6]]", "[None, 2.0, 3.0, 4.0]"], ["['MovingAverage'] + ['next'] * 10000, [[2]] + [[i] for i in range(10000)]", "[None, 0.0] + [i - 0.5 for i in range(1, 10000)]"]] },
    { id: "pair-finder", title: "Pair Finder", d: "Easy", lc: "two-sum-iii-data-structure-design",
      statement: "Implement `PairFinder` with `add(x)` and `find(target)`: is there a pair of added numbers (two separate additions) summing to target? The checker runs a list of operations; the constructor and `add` output `None`.",
      examples: [["['PairFinder', 'add', 'add', 'add', 'find', 'find'], [[], [1], [3], [5], [4], [7]]", "[None, None, None, None, True, False]", ""], ["['PairFinder', 'add', 'find', 'add', 'find'], [[], [2], [4], [2], [4]]", "[None, None, False, None, True]", ""]],
      constraints: ["up to 10⁴ calls"],
      hints: ["Keep a Counter of added numbers.", "For each distinct x, check whether target − x exists (and appears twice if it equals x)."],
      starter: "class PairFinder:\n    def __init__(self):\n        pass\n\n    def add(self, x):\n        pass\n\n    def find(self, target):\n        pass\n",
      solution: `class PairFinder:
    def __init__(self):
        self.c = Counter()

    def add(self, x):
        self.c[x] += 1

    def find(self, target):
        for x, cnt in self.c.items():
            y = target - x
            if y in self.c and (y != x or cnt > 1):
                return True
        return False`,
      call: "run_ops(F, *args)",
      why: "add is O(1); find scans distinct values with O(1) complement checks.", time: "O(1) add · O(n) find",
      hidden: [["['PairFinder', 'find'], [[], [0]]", "[None, False]"], ["['PairFinder', 'add', 'add', 'find'], [[], [0], [0], [0]]", "[None, None, None, True]"], ["['PairFinder'] + ['add'] * 1000 + ['find'], [[]] + [[i] for i in range(1000)] + [[1997]]", "[None] * 1001 + [True]"]] },
    { id: "recent-cache", title: "Recent-Use Cache", d: "Medium", lc: "lru-cache",
      statement: "Implement `RecentCache(capacity)` with `get(key)` (value or -1) and `put(key, value)`. When putting would exceed capacity, first evict the **least recently used** key (both get and put count as uses). All operations must be O(1). The checker runs a list of operations; the constructor and `put` output `None`.",
      examples: [["['RecentCache', 'put', 'put', 'get', 'put', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]", "[None, None, None, 1, None, -1, None, -1, 3, 4]", ""], ["['RecentCache', 'put', 'put', 'get'], [[1], [2, 1], [2, 2], [2]]", "[None, None, None, 2]", ""]],
      constraints: ["1 ≤ capacity ≤ 3000", "up to 2·10⁵ calls"],
      hints: ["A dict alone can't tell you which key is oldest.", "OrderedDict keeps keys in use order: move_to_end on every use.", "popitem(last=False) removes the least recently used key."],
      starter: "class RecentCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass\n",
      solution: `class RecentCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.d = OrderedDict()

    def get(self, key):
        if key not in self.d:
            return -1
        self.d.move_to_end(key)
        return self.d[key]

    def put(self, key, value):
        self.d[key] = value
        self.d.move_to_end(key)
        if len(self.d) > self.cap:
            self.d.popitem(last=False)`,
      call: "run_ops(F, *args)",
      why: "OrderedDict is a hash map plus a doubly linked list, so lookup, reorder and evict are all O(1).", time: "O(1) per call",
      hidden: [["['RecentCache', 'get'], [[1], [5]]", "[None, -1]"], ["['RecentCache', 'put', 'put', 'put', 'get', 'get'], [[2], [1, 1], [2, 2], [1, 10], [1], [2]]", "[None, None, None, None, 10, 2]"], ["['RecentCache'] + ['put'] * 100000 + ['get', 'get'], [[1000]] + [[i, i] for i in range(100000)] + [[98999], [99000]]", "[None] * 100001 + [-1, 99000]"]] },
    { id: "hit-counter", title: "Hit Counter", d: "Medium", lc: "design-hit-counter",
      statement: "Implement `HitCounter` with `hit(t)` (a hit at second t) and `count(t)` (number of hits in the last 300 seconds, i.e. at times > t − 300). Calls come with non-decreasing t. The checker runs a list of operations; the constructor and `hit` output `None`.",
      examples: [["['HitCounter', 'hit', 'hit', 'hit', 'count', 'hit', 'count', 'count'], [[], [1], [2], [3], [4], [300], [300], [301]]", "[None, None, None, None, 3, None, 4, 3]", ""], ["['HitCounter', 'count'], [[], [5]]", "[None, 0]", ""]],
      constraints: ["1 ≤ t ≤ 2·10⁹", "up to 10⁵ calls"],
      hints: ["Timestamps arrive in order: expired hits are always the oldest.", "Keep a deque; pop from the left while hit ≤ t − 300."],
      starter: "class HitCounter:\n    def __init__(self):\n        pass\n\n    def hit(self, t):\n        pass\n\n    def count(self, t):\n        pass\n",
      solution: `class HitCounter:
    def __init__(self):
        self.q = deque()

    def hit(self, t):
        self.q.append(t)

    def count(self, t):
        while self.q and self.q[0] <= t - 300:
            self.q.popleft()
        return len(self.q)`,
      call: "run_ops(F, *args)",
      why: "Each hit is appended once and removed at most once, so operations are O(1) amortised.", time: "O(1) amortised",
      hidden: [["['HitCounter', 'hit', 'count'], [[], [1], [301]]", "[None, None, 0]"], ["['HitCounter', 'hit', 'hit', 'count'], [[], [5], [5], [304]]", "[None, None, None, 2]"], ["['HitCounter'] + ['hit'] * 100000 + ['count'], [[]] + [[i] for i in range(1, 100001)] + [[100000]]", "[None] * 100001 + [300]"]] },
    { id: "versioned-store", title: "Versioned Store", d: "Medium", lc: "time-based-key-value-store",
      statement: "Implement `VersionedStore` with `set(key, value, t)` and `get(key, t)`: return the value set for key at the largest time ≤ t, or `''` if none. For each key, `set` calls arrive with strictly increasing t. The checker runs a list of operations; the constructor and `set` output `None`.",
      examples: [["['VersionedStore', 'set', 'get', 'get', 'set', 'get', 'get'], [[], ['foo', 'bar', 1], ['foo', 1], ['foo', 3], ['foo', 'bar2', 4], ['foo', 4], ['foo', 5]]", "[None, None, 'bar', 'bar', None, 'bar2', 'bar2']", ""], ["['VersionedStore', 'get'], [[], ['x', 1]]", "[None, '']", ""]],
      constraints: ["up to 2·10⁵ calls", "1 ≤ t ≤ 10⁷"],
      hints: ["Keep, per key, a list of times and a list of values (already sorted).", "bisect_right(times, t) − 1 is the latest version not after t."],
      starter: "class VersionedStore:\n    def __init__(self):\n        pass\n\n    def set(self, key, value, t):\n        pass\n\n    def get(self, key, t):\n        pass\n",
      solution: `class VersionedStore:
    def __init__(self):
        self.times = defaultdict(list)
        self.vals = defaultdict(list)

    def set(self, key, value, t):
        self.times[key].append(t)
        self.vals[key].append(value)

    def get(self, key, t):
        i = bisect_right(self.times[key], t)
        return self.vals[key][i - 1] if i else ""`,
      call: "run_ops(F, *args)",
      why: "Appends keep each key's timeline sorted, so get is one binary search.", time: "O(1) set · O(log n) get",
      hidden: [["['VersionedStore', 'set', 'get'], [[], ['a', 'x', 5], ['a', 4]]", "[None, None, '']"], ["['VersionedStore', 'set', 'set', 'get'], [[], ['a', 'x', 1], ['b', 'y', 2], ['a', 9]]", "[None, None, None, 'x']"], ["['VersionedStore'] + ['set'] * 100000 + ['get'], [[]] + [['k', str(i), i] for i in range(1, 100001)] + [['k', 55555]]", "[None] * 100001 + ['55555']"]] },
    { id: "tab-history", title: "Tab History", d: "Medium", lc: "design-browser-history",
      statement: "Implement `TabHistory(home)` with `visit(url)` (go to url, clearing forward history), `back(steps)` and `forward(steps)` (move up to that many steps, return the current url). The checker runs a list of operations; the constructor and `visit` output `None`.",
      examples: [["['TabHistory', 'visit', 'visit', 'visit', 'back', 'back', 'forward', 'visit', 'forward', 'back', 'back'], [['home'], ['a'], ['b'], ['c'], [1], [1], [1], ['d'], [2], [2], [7]]", "[None, None, None, None, 'b', 'a', 'b', None, 'd', 'a', 'home']", ""], ["['TabHistory', 'back'], [['h'], [3]]", "[None, 'h']", ""]],
      constraints: ["up to 5000 calls"],
      hints: ["Keep a list of pages and the current index.", "visit truncates everything after the current index before appending."],
      starter: "class TabHistory:\n    def __init__(self, home):\n        pass\n\n    def visit(self, url):\n        pass\n\n    def back(self, steps):\n        pass\n\n    def forward(self, steps):\n        pass\n",
      solution: `class TabHistory:
    def __init__(self, home):
        self.pages = [home]
        self.cur = 0

    def visit(self, url):
        del self.pages[self.cur + 1:]
        self.pages.append(url)
        self.cur += 1

    def back(self, steps):
        self.cur = max(0, self.cur - steps)
        return self.pages[self.cur]

    def forward(self, steps):
        self.cur = min(len(self.pages) - 1, self.cur + steps)
        return self.pages[self.cur]`,
      call: "run_ops(F, *args)",
      why: "An index into a list makes back and forward O(1); visit drops the forward part.", time: "O(1) back/forward",
      hidden: [["['TabHistory', 'forward'], [['h'], [1]]", "[None, 'h']"], ["['TabHistory', 'visit', 'back', 'visit', 'forward'], [['h'], ['a'], [1], ['b'], [1]]", "[None, None, 'h', None, 'b']"], ["['TabHistory'] + ['visit'] * 2000 + ['back'], [['h']] + [[str(i)] for i in range(2000)] + [[1000]]", "[None] * 2001 + ['999']"]] },
    { id: "metro-times", title: "Metro Trip Times", d: "Medium", lc: "design-underground-system",
      statement: "Implement `Metro` with `check_in(id, station, t)`, `check_out(id, station, t)` and `average(start, end)`: the average time of all completed trips from start to end. The checker runs a list of operations; the constructor, check-ins and check-outs output `None`.",
      examples: [["['Metro', 'check_in', 'check_out', 'check_in', 'check_out', 'average'], [[], [1, 'A', 3], [1, 'B', 8], [2, 'A', 10], [2, 'B', 22], ['A', 'B']]", "[None, None, None, None, None, 8.5]", ""], ["['Metro', 'check_in', 'check_out', 'average'], [[], [5, 'X', 1], [5, 'Y', 2], ['X', 'Y']]", "[None, None, None, 1.0]", ""]],
      constraints: ["up to 2·10⁴ calls"],
      hints: ["Store each open trip: id → (station, time).", "On check-out, add the duration to a (start, end) → [total, count] record."],
      starter: "class Metro:\n    def __init__(self):\n        pass\n\n    def check_in(self, id, station, t):\n        pass\n\n    def check_out(self, id, station, t):\n        pass\n\n    def average(self, start, end):\n        pass\n",
      solution: `class Metro:
    def __init__(self):
        self.open = {}
        self.stats = defaultdict(lambda: [0, 0])

    def check_in(self, id, station, t):
        self.open[id] = (station, t)

    def check_out(self, id, station, t):
        start, t0 = self.open.pop(id)
        rec = self.stats[(start, station)]
        rec[0] += t - t0
        rec[1] += 1

    def average(self, start, end):
        total, count = self.stats[(start, end)]
        return total / count`,
      call: "run_ops(F, *args)",
      why: "Two dicts: one for trips in progress, one for running totals per route, so every call is O(1).", time: "O(1) per call",
      hidden: [["['Metro', 'check_in', 'check_out', 'check_in', 'check_out', 'average'], [[], [1, 'A', 0], [1, 'B', 4], [1, 'A', 10], [1, 'B', 12], ['A', 'B']]", "[None, None, None, None, None, 3.0]"], ["['Metro', 'check_in', 'check_in', 'check_out', 'check_out', 'average', 'average'], [[], [1, 'A', 0], [2, 'B', 0], [1, 'C', 5], [2, 'C', 7], ['A', 'C'], ['B', 'C']]", "[None, None, None, None, None, 5.0, 7.0]"], ["['Metro'] + ['check_in', 'check_out'] * 5000 + ['average'], [[]] + [x for i in range(5000) for x in ([i, 'S', i], [i, 'E', i + 10])] + [['S', 'E']]", "[None] * 10001 + [10.0]"]] },
    { id: "frequent-cache", title: "Frequent-Use Cache", d: "Hard", lc: "lfu-cache",
      statement: "Implement `FrequentCache(capacity)` with `get(key)` and `put(key, value)` in O(1). When full, evict the key used the **fewest** times; among ties, the least recently used one. A `put` on a new key counts as its first use; `get` and updating `put` add a use. The checker runs a list of operations; the constructor and `put` output `None`.",
      examples: [["['FrequentCache', 'put', 'put', 'get', 'put', 'get', 'get', 'put', 'get', 'get', 'get'], [[2], [1, 1], [2, 2], [1], [3, 3], [2], [3], [4, 4], [1], [3], [4]]", "[None, None, None, 1, None, -1, 3, None, -1, 3, 4]", ""], ["['FrequentCache', 'put', 'get'], [[0], [1, 1], [1]]", "[None, None, -1]", ""]],
      constraints: ["0 ≤ capacity ≤ 10⁴", "up to 2·10⁵ calls"],
      hints: ["Keep key → (value, frequency).", "Keep frequency → OrderedDict of keys (in recency order) and the current minimum frequency.", "On use, move the key from its frequency bucket to the next one; on eviction, pop the oldest key of the minimum bucket."],
      starter: "class FrequentCache:\n    def __init__(self, capacity):\n        pass\n\n    def get(self, key):\n        pass\n\n    def put(self, key, value):\n        pass\n",
      solution: `class FrequentCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.val = {}
        self.freq = {}
        self.buckets = defaultdict(OrderedDict)
        self.min_f = 0

    def _touch(self, key):
        f = self.freq[key]
        del self.buckets[f][key]
        if not self.buckets[f]:
            del self.buckets[f]
            if self.min_f == f:
                self.min_f += 1
        self.freq[key] = f + 1
        self.buckets[f + 1][key] = None

    def get(self, key):
        if key not in self.val:
            return -1
        self._touch(key)
        return self.val[key]

    def put(self, key, value):
        if self.cap == 0:
            return
        if key in self.val:
            self.val[key] = value
            self._touch(key)
            return
        if len(self.val) >= self.cap:
            old, _ = self.buckets[self.min_f].popitem(last=False)
            if not self.buckets[self.min_f]:
                del self.buckets[self.min_f]
            del self.val[old]
            del self.freq[old]
        self.val[key] = value
        self.freq[key] = 1
        self.buckets[1][key] = None
        self.min_f = 1`,
      call: "run_ops(F, *args)",
      why: "Per-frequency ordered buckets plus a tracked minimum make every use and eviction O(1).", time: "O(1) per call",
      hidden: [["['FrequentCache', 'put', 'put', 'get', 'put', 'get', 'get'], [[1], [1, 1], [2, 2], [1], [3, 3], [2], [3]]", "[None, None, None, -1, None, -1, 3]"], ["['FrequentCache', 'put', 'put', 'put', 'get'], [[2], [1, 1], [1, 5], [2, 2], [1]]", "[None, None, None, None, 5]"], ["['FrequentCache'] + ['put'] * 50000 + ['get', 'get'], [[100]] + [[i, i] for i in range(50000)] + [[49999], [0]]", "[None] * 50001 + [49999, -1]"]] }
  ]
});
