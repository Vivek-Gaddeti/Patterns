PAT("top-k", {
  time: "O(n log k)", space: "O(k)",
  lede: "To keep the k largest items, hold a min-heap of size k: its top is the smallest of your current top k, so anything bigger replaces it. Python's heapq is a min-heap; negate values for a max-heap.",
  idea: "Sorting everything is O(n log n) when you only care about k items. A **heap** keeps the minimum (or maximum) at the top with O(log size) push and pop. Keep a min-heap of the best k seen so far: when it grows past k, pop the smallest. At the end the heap holds the top k and its top is the k-th largest. When the question repeatedly takes the current max (or min) and puts something back, just use a heap as a priority queue.",
  analogy: "A talent show that only keeps a top-3 board: a new act gets on the board only if it beats the weakest act currently on it, which then drops off.",
  flavours: [["Want", "Heap", "Notes"], [
    ["**k largest / k-th largest**", "min-heap of size k", "pop when size > k"],
    ["**k smallest / closest**", "max-heap of size k (push negatives)", "or `heapq.nsmallest`"],
    ["**Repeatedly take the biggest**", "max-heap of everything", "stones, tasks, greedy simulations"],
    ["**k most frequent**", "Counter + heap (or bucket sort)", "heap of (count, value)"]]],
  signals: [["“k-th largest / smallest”, “top k”, “k closest”", "heap of size k"], ["“Most frequent k”", "Counter + heap"], ["Repeatedly combine / pick the largest or cheapest", "priority queue simulation"], ["A stream where you must keep the best k so far", "heap that survives across calls"]],
  not: "**Not this pattern** when you need the max of a **sliding window** (→ monotonic deque), the running median (→ two heaps) or merging k sorted lists (→ k-way merge, also a heap but a different shape).",
  templates: [
    ["Min-heap of size k", "top_k.py", `import heapq

def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)            # drop the smallest of the top k+1
    return heap[0]                         # smallest of the top k = k-th largest

print(kth_largest([3, 2, 1, 5, 6, 4], 2), kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))`, "5 4"],
    ["Max-heap simulation", "max_heap.py", `import heapq

def last_stone(stones):
    heap = [-s for s in stones]            # negate: heapq is a min-heap
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0

print(last_stone([2, 7, 4, 1, 8, 1]))`, "1"]
  ],
  examples: [
    { t: "Top K Frequent Elements", d: "Medium", lc: "top-k-frequent-elements", f: "Counter + heap",
      q: "Return the k most frequent values.",
      idea: "Count with Counter, then take the k largest counts with a heap (`nlargest`).",
      code: `from collections import Counter
import heapq

def top_k_frequent(nums, k):
    count = Counter(nums)
    return heapq.nlargest(k, count, key=count.get)

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))`, out: "[1, 2]", cx: "O(n log k)" },
    { t: "K Closest Points to Origin", d: "Medium", lc: "k-closest-points-to-origin", f: "Max-heap of size k",
      q: "Return the k points closest to (0, 0).",
      idea: "Max-heap (negated distances) of size k: evict the farthest when it grows past k.",
      code: `import heapq

def k_closest(points, k):
    heap = []
    for x, y in points:
        heapq.heappush(heap, (-(x * x + y * y), x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return sorted([x, y] for _, x, y in heap)

print(k_closest([[3, 3], [5, -1], [-2, 4]], 2))`, out: "[[-2, 4], [3, 3]]", cx: "O(n log k)" },
    { t: "Task Scheduler", d: "Medium", lc: "task-scheduler", f: "Counting",
      q: "Tasks with a cooldown n between equal tasks. Minimum time units including idles.",
      idea: "The most frequent task forms (max − 1) blocks of length n + 1, plus one slot per task tied for the max. The answer is at least the number of tasks.",
      code: `from collections import Counter

def least_interval(tasks, n):
    c = Counter(tasks).values()
    m = max(c)
    ties = sum(1 for v in c if v == m)
    return max(len(tasks), (m - 1) * (n + 1) + ties)

print(least_interval(list("AAABBB"), 2), least_interval(list("AAABBB"), 0))`, out: "8 6", cx: "O(n)" }
  ],
  pitfalls: [
    ["Forgetting heapq is a **min**-heap", "For a max-heap, push negatives (or tuples with negated keys)."],
    ["Heap of size n when k would do", "Sorting or a full heap is O(n log n); size-k is O(n log k)."],
    ["Comparing un-comparable tuples", "If priorities tie, Python compares the next field; add a counter or index as a tiebreaker."],
    ["`heap[0]` on an empty heap", "Check the size first."]
  ],
  edge: ["k = 1", "k = n", "All values equal", "Ties in frequency or distance", "Negative numbers"],
  compare: [
    ["Two Heaps", "two-heaps", "A running median needs one max-heap and one min-heap balanced against each other."],
    ["K-way Merge", "k-way-merge", "A heap of the current head of each sorted list gives the next smallest overall."],
    ["Monotonic Deque", "monotonic-deque", "Window maximum in O(n) without a heap."]
  ],
  mcq: [
    ["To find the k-th **largest**, which heap of size k?", ["Max-heap", "Min-heap", "Either", "No heap"], 1, "The min-heap's top is the smallest of the k largest, i.e. the k-th largest."],
    ["How do you get a max-heap from Python's heapq?", ["heapq.maxheap()", "Push negated values", "Sort descending first", "Use a list"], 1, "Negate on the way in and on the way out."]
  ],
  summary: {
    oneLine: "Keep a heap of size k: min-heap for the k largest, max-heap (negate) for the k smallest.",
    signals: ["k-th largest / top k / k closest", "k most frequent", "Repeatedly take the max / min", "Best k of a stream"],
    template: `heap = []
for x in nums:
    heappush(heap, x)
    if len(heap) > k:
        heappop(heap)
return heap[0]          # k-th largest`,
    pitfalls: ["heapq is a min-heap", "Size k, not n", "Tie-breakers in tuples"],
    cx: "O(n log k) time · O(k) space",
    drill: { task: "Return the k-th largest element of `nums` (not the k-th distinct).",
      ref: `def kth_largest(nums, k):
    heap = []
    for x in nums:
        heappush(heap, x)
        if len(heap) > k:
            heappop(heap)
    return heap[0]`,
      tests: [["[3, 2, 1, 5, 6, 4], 2", "5"], ["[3, 2, 3, 1, 2, 4, 5, 5, 6], 4", "4"], ["[1], 1", "1"]] }
  },
  problems: [
    { id: "smash-rocks", title: "Smash the Rocks", d: "Easy", lc: "last-stone-weight",
      statement: "Each turn, take the two heaviest rocks x ≤ y and smash them: if equal both vanish, otherwise a rock of weight y − x remains. Return the weight of the last rock, or 0 if none remain.",
      examples: [["[2, 7, 4, 1, 8, 1]", "1", ""], ["[1]", "1", ""]],
      constraints: ["1 ≤ len(rocks) ≤ 10⁵", "1 ≤ rocks[i] ≤ 1000"],
      hints: ["You repeatedly need the two largest: a max-heap.", "Python: push negated weights."],
      solution: `def smash_rocks(rocks):
    heap = [-r for r in rocks]
    heapify(heap)
    while len(heap) > 1:
        a = -heappop(heap)
        b = -heappop(heap)
        if a != b:
            heappush(heap, -(a - b))
    return -heap[0] if heap else 0`,
      why: "Each smash is two pops and at most one push, O(log n) each.", time: "O(n log n)",
      hidden: [["[3, 3]", "0"], ["[10, 4, 2, 10]", "2"], ["[1000] * 100000", "0"]] },
    { id: "cheapest-rope-join", title: "Cheapest Rope Join", d: "Easy", lc: "minimum-cost-to-connect-sticks",
      statement: "Joining two ropes of lengths a and b costs a + b and produces a rope of length a + b. Return the minimum total cost to join all ropes into one.",
      examples: [["[2, 4, 3]", "14", "2+3=5 (cost 5), 5+4=9 (cost 9)"], ["[1, 8, 3, 5]", "30", ""], ["[5]", "0", ""]],
      constraints: ["1 ≤ len(ropes) ≤ 10⁵", "1 ≤ ropes[i] ≤ 10⁴"],
      hints: ["Long ropes get counted again in every later join, so join short ones first.", "Always join the two shortest ropes: a min-heap."],
      solution: `def cheapest_join(ropes):
    heap = list(ropes)
    heapify(heap)
    cost = 0
    while len(heap) > 1:
        a = heappop(heap)
        b = heappop(heap)
        cost += a + b
        heappush(heap, a + b)
    return cost`,
      why: "Like Huffman coding: merging the two smallest first minimises how often big lengths are re-counted.", time: "O(n log n)",
      hidden: [["[1, 1]", "2"], ["[1, 2, 3, 4, 5]", "33"], ["[1] * 65536", "1048576"]] },
    { id: "running-kth", title: "Running Kth Best", d: "Easy", lc: "kth-largest-element-in-a-stream",
      statement: "Implement `RunningKth(k, nums)` and `add(val)`: after each `add`, return the k-th largest value seen so far (counting duplicates); if fewer than k values have been seen, return the smallest so far. The checker runs a list of operations; the constructor outputs `None`.",
      examples: [["['RunningKth', 'add', 'add', 'add', 'add', 'add'], [[3, [4, 5, 8, 2]], [3], [5], [10], [9], [4]]", "[None, 4, 5, 5, 8, 8]", ""], ["['RunningKth', 'add', 'add'], [[1, []], [-3], [-2]]", "[None, -3, -2]", ""]],
      constraints: ["1 ≤ k ≤ 10⁴", "up to 10⁴ adds"],
      hints: ["Keep a min-heap of the k largest values seen.", "After pushing, pop if the heap has more than k items; the top is the answer."],
      starter: "class RunningKth:\n    def __init__(self, k, nums):\n        pass\n\n    def add(self, val):\n        pass\n",
      solution: `class RunningKth:
    def __init__(self, k, nums):
        self.k = k
        self.heap = []
        for x in nums:
            self.add(x)

    def add(self, val):
        heappush(self.heap, val)
        if len(self.heap) > self.k:
            heappop(self.heap)
        return self.heap[0]`,
      call: "run_ops(F, *args)",
      why: "The heap never holds more than k values, so each add is O(log k).", time: "O(log k) per add",
      hidden: [["['RunningKth', 'add'], [[1, [5]], [3]]", "[None, 5]"], ["['RunningKth', 'add', 'add'], [[2, [0]], [-1], [1]]", "[None, -1, 0]"], ["['RunningKth'] + ['add'] * 10000, [[100, []]] + [[i] for i in range(10000)]", "[None] + [0] * 99 + list(range(0, 9901))"]] },
    { id: "kth-biggest", title: "Kth Biggest", d: "Medium", lc: "kth-largest-element-in-an-array",
      statement: "Return the `k`-th largest element of `nums` (the k-th in sorted descending order, not the k-th distinct). Try to beat full sorting.",
      examples: [["[3, 2, 1, 5, 6, 4], 2", "5", ""], ["[3, 2, 3, 1, 2, 4, 5, 5, 6], 4", "4", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵"],
      hints: ["Keep only the k largest seen so far.", "A min-heap of size k: its top is the k-th largest."],
      solution: `def kth_biggest(nums, k):
    heap = []
    for x in nums:
        heappush(heap, x)
        if len(heap) > k:
            heappop(heap)
    return heap[0]`,
      why: "The heap stays at size k, so each step is O(log k).", time: "O(n log k)",
      hidden: [["[1], 1", "1"], ["[2, 1], 2", "1"], ["list(range(100000)), 50000", "50000"]] },
    { id: "frequent-k", title: "Most Frequent K", d: "Medium", lc: "top-k-frequent-elements",
      statement: "Return the `k` most frequent values in `nums`, ordered by frequency (highest first); break ties by the **smaller** value first.",
      examples: [["[1, 1, 1, 2, 2, 3], 2", "[1, 2]", ""], ["[4, 4, 1, 1, 2], 2", "[1, 4]", "Tie: 1 before 4."], ["[1], 1", "[1]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "k ≤ number of distinct values"],
      hints: ["Count with a Counter.", "Take the k best by (−count, value): `nsmallest` or a heap."],
      solution: `def frequent_k(nums, k):
    c = Counter(nums)
    return [v for _, v in nsmallest(k, ((-cnt, v) for v, cnt in c.items()))]`,
      why: "Counting is O(n); selecting k keys with a heap is O(d log k).", time: "O(n + d log k)",
      hidden: [["[5, 5, 6], 1", "[5]"], ["[3, 3, 2, 2, 1], 3", "[2, 3, 1]"], ["[i % 1000 for i in range(100000)], 3", "[0, 1, 2]"]] },
    { id: "nearest-stations", title: "Nearest Stations", d: "Medium", lc: "k-closest-points-to-origin",
      statement: "Return the `k` points closest to the origin (Euclidean distance), sorted by distance and, for equal distance, by the point itself (`[x, y]` ascending).",
      examples: [["[[1, 3], [-2, 2]], 1", "[[-2, 2]]", ""], ["[[3, 3], [5, -1], [-2, 4]], 2", "[[3, 3], [-2, 4]]", "Distances² 18 and 20."]],
      constraints: ["1 ≤ k ≤ len(points) ≤ 10⁴"],
      hints: ["Compare squared distances: no square roots needed.", "nsmallest(k, points, key=…) or a max-heap of size k."],
      solution: `def nearest_stations(points, k):
    return [list(p) for p in nsmallest(k, points, key=lambda p: (p[0] * p[0] + p[1] * p[1], p[0], p[1]))]`,
      why: "A size-k heap selects the closest points without sorting everything.", time: "O(n log k)",
      hidden: [["[[0, 1], [1, 0]], 2", "[[0, 1], [1, 0]]"], ["[[2, 2], [1, 1], [3, 3]], 2", "[[1, 1], [2, 2]]"], ["[[i, i] for i in range(10000, 0, -1)], 3", "[[1, 1], [2, 2], [3, 3]]"]] },
    { id: "cooldown-schedule", title: "Cooldown Schedule", d: "Medium", lc: "task-scheduler",
      statement: "A CPU runs one task per time unit, or idles. Two runs of the **same** task must be at least `n` units apart. Return the minimum number of time units to run all `tasks` (letters).",
      examples: [["['A', 'A', 'A', 'B', 'B', 'B'], 2", "8", "A B _ A B _ A B"], ["['A', 'A', 'A', 'B', 'B', 'B'], 0", "6", ""], ["['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'E', 'F', 'G'], 2", "16", ""]],
      constraints: ["1 ≤ len(tasks) ≤ 10⁴", "0 ≤ n ≤ 100"],
      hints: ["The most frequent task dictates the skeleton: (max − 1) gaps of size n.", "Tasks tied for the maximum fill the last row.", "If there are enough other tasks, there's no idling at all: the answer is at least len(tasks)."],
      solution: `def cooldown_schedule(tasks, n):
    counts = Counter(tasks).values()
    m = max(counts)
    ties = sum(1 for c in counts if c == m)
    return max(len(tasks), (m - 1) * (n + 1) + ties)`,
      why: "Either the most frequent task forces idle slots, or the other tasks fill every gap and no idling is needed.", time: "O(n)",
      hidden: [["['A'], 5", "1"], ["['A', 'B', 'A'], 3", "5"], ["['A'] * 10000, 100", "1009900"]] },
    { id: "frequent-words", title: "Most Frequent Words", d: "Medium", lc: "top-k-frequent-words",
      statement: "Return the `k` most frequent words, sorted by frequency (highest first); words with the same frequency are sorted alphabetically.",
      examples: [["['i', 'love', 'leetcode', 'i', 'love', 'coding'], 2", "['i', 'love']", ""], ["['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], 4", "['the', 'is', 'sunny', 'day']", ""]],
      constraints: ["1 ≤ len(words) ≤ 10⁴", "k ≤ number of distinct words"],
      hints: ["Count words.", "Order by (−count, word); take the first k with a heap."],
      solution: `def frequent_words(words, k):
    c = Counter(words)
    return [w for _, w in nsmallest(k, ((-cnt, w) for w, cnt in c.items()))]`,
      why: "The key (−count, word) encodes both ordering rules; a heap picks the top k.", time: "O(n + d log k)",
      hidden: [["['a'], 1", "['a']"], ["['b', 'a', 'b', 'a'], 2", "['a', 'b']"], ["['w' + str(i % 50) for i in range(10000)], 2", "['w0', 'w1']"]] },
    { id: "venture-capital", title: "Venture Capital", d: "Hard", lc: "ipo",
      statement: "You start with capital `w` and may finish at most `k` projects. Project i needs capital `need[i]` to start and adds `profit[i]` to your capital when done (you never lose the needed capital). Return your maximum final capital.",
      examples: [["2, 0, [1, 2, 3], [0, 1, 1]", "4", "Do project 0 (+1), then project 2 (+3)."], ["3, 0, [1, 2, 3], [0, 1, 2]", "6", ""]],
      constraints: ["1 ≤ k ≤ 10⁵", "0 ≤ w ≤ 10⁹", "1 ≤ number of projects ≤ 10⁵"],
      hints: ["At any moment, among affordable projects, the most profitable is always best.", "Sort projects by need; push newly affordable ones into a max-heap of profits.", "Pop the best profit up to k times."],
      solution: `def venture(k, w, profit, need):
    projects = sorted(zip(need, profit))
    heap, i = [], 0
    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heappush(heap, -projects[i][1])
            i += 1
        if not heap:
            break
        w -= heappop(heap)
    return w`,
      why: "Capital only grows, so the set of affordable projects only grows; greedily taking the best available is optimal.", time: "O(n log n)",
      hidden: [["1, 0, [1, 2, 3], [1, 1, 2]", "0"], ["10, 0, [1, 2, 3], [0, 1, 2]", "6"], ["100000, 1, [1] * 100000, [i for i in range(100000)]", "100001"]] }
  ]
});
