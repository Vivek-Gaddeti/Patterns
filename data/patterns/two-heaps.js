PAT("two-heaps", {
  time: "O(log n) per update", space: "O(n)",
  lede: "Split the data into a smaller half and a larger half: a max-heap for the small half, a min-heap for the large half. Their tops meet in the middle, so the median is always at hand. The same two-heap idea schedules jobs onto free and busy machines.",
  idea: "A median needs the middle of sorted data, but sorting after every insert is O(n log n). Keep **low** (a max-heap of the smaller half) and **high** (a min-heap of the larger half), sized equal or with low one bigger. Insert into the right heap, then rebalance by moving one top across. The median is low's top, or the average of both tops. A second use: one heap of **available** resources and one of **busy** resources ordered by when they free up.",
  analogy: "Two queues facing each other at a ticket counter: the tallest person of the short queue and the shortest person of the tall queue stand face to face, and the median is right between them.",
  flavours: [["Use", "Heap A", "Heap B"], [
    ["**Running median**", "max-heap: smaller half", "min-heap: larger half"],
    ["**Sliding median**", "same, plus lazy deletion of expired values", ""],
    ["**Scheduling**", "free machines (by id / weight)", "busy machines (by finish time)"]]],
  signals: [["“Median” of a stream or after each insert", "two heaps"], ["Median of every window", "two heaps + lazy deletion"], ["Assign jobs to the lowest-numbered free server / room", "free heap + busy heap"], ["“Process in order of availability, then by priority”", "time-ordered events + a heap"]],
  not: "**Not this pattern** for the k-th largest only (→ one heap of size k), or when all data is known up front and you need one median (→ sort or quickselect).",
  templates: [
    ["Running median", "median.py", `import heapq

class Median:
    def __init__(self):
        self.low = []                      # max-heap (negated): smaller half
        self.high = []                     # min-heap: larger half

    def add(self, x):
        heapq.heappush(self.low, -x)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move the biggest small one up
        if len(self.high) > len(self.low):                      # keep low the same size or one bigger
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

m = Median()
out = []
for x in [5, 15, 1, 3]:
    m.add(x)
    out.append(m.median())
print(out)`, "[5, 10.0, 5, 4.0]"]
  ],
  examples: [
    { t: "Find Median from Data Stream", d: "Hard", lc: "find-median-from-data-stream", f: "Running median",
      q: "Support addNum and findMedian efficiently.",
      idea: "Push into low, move low's top to high, rebalance so low has ≥ high's size.",
      code: `import heapq

low, high = [], []
def add(x):
    heapq.heappush(low, -x)
    heapq.heappush(high, -heapq.heappop(low))
    if len(high) > len(low):
        heapq.heappush(low, -heapq.heappop(high))
def median():
    return -low[0] if len(low) > len(high) else (-low[0] + high[0]) / 2

add(1); add(2); print(median()); add(3); print(median())`, out: "1.5\n2", cx: "O(log n) add · O(1) median" },
    { t: "Process Tasks Using Servers", d: "Medium", lc: "process-tasks-using-servers", f: "Free + busy",
      q: "Each task goes to the free server with the smallest (weight, index); if none is free, wait for the earliest one.",
      idea: "free heap: (weight, index). busy heap: (free_time, weight, index). Move finished servers back before each assignment.",
      code: `import heapq

def assign(servers, tasks):
    free = [(w, i) for i, w in enumerate(servers)]
    heapq.heapify(free)
    busy, out, t = [], [], 0
    for j, d in enumerate(tasks):
        t = max(t, j)
        if not free:
            t = max(t, busy[0][0])
        while busy and busy[0][0] <= t:
            _, w, i = heapq.heappop(busy)
            heapq.heappush(free, (w, i))
        w, i = heapq.heappop(free)
        out.append(i)
        heapq.heappush(busy, (t + d, w, i))
    return out

print(assign([3, 3, 2], [1, 2, 3, 2, 1, 2]))`, out: "[2, 2, 0, 2, 1, 2]", cx: "O((n + m) log n)" }
  ],
  pitfalls: [
    ["Forgetting to negate for the max-heap", "Python only has min-heaps: store −x in `low`."],
    ["Letting the halves get unbalanced", "After every insert, sizes must differ by at most one."],
    ["Integer vs float median", "Even counts average two values: use `/ 2` (float) unless the problem says otherwise."],
    ["Sliding windows without deletion", "heapq can't delete from the middle: mark values as removed and drop them when they reach the top."]
  ],
  edge: ["One element", "Two equal elements", "All values the same", "Negative values", "Values arriving in sorted order"],
  compare: [
    ["Top-K Elements", "top-k", "One heap of size k answers k-th largest; the median needs both halves."],
    ["Intervals: Sort + Sweep", "intervals", "Meeting rooms II uses one heap of end times; meeting rooms III adds a heap of free rooms."],
    ["Binary Search", "binary-search", "If all data is known and sorted, the median is just the middle index."]
  ],
  mcq: [
    ["In the two-heap median, `low` should be…", ["A min-heap of the smaller half", "A max-heap of the smaller half", "A max-heap of the larger half", "Sorted list"], 1, "Its top is the largest of the small half: one of the middle values."],
    ["How do you remove an arbitrary value from a heapq heap efficiently?", ["heap.remove(x)", "Mark it as deleted and skip it when it reaches the top (lazy deletion)", "Re-sort the heap", "It's impossible"], 1, "`list.remove` + heapify is O(n); lazy deletion keeps operations O(log n) amortised."]
  ],
  summary: {
    oneLine: "Max-heap for the small half, min-heap for the large half: their tops give the median.",
    signals: ["Median of a stream / after each insert", "Median of every window", "Free vs busy servers / rooms"],
    template: `heappush(low, -x)
heappush(high, -heappop(low))
if len(high) > len(low):
    heappush(low, -heappop(high))
median = -low[0] if len(low) > len(high) \\
         else (-low[0] + high[0]) / 2`,
    pitfalls: ["Negate for the max-heap", "Rebalance after each insert", "Lazy deletion for windows"],
    cx: "O(log n) per insert · O(1) median",
    drill: { task: "Return the median after each insertion of `nums` (floats when the count is even).",
      ref: `def running_medians(nums):
    low, high, out = [], [], []
    for x in nums:
        heappush(low, -x)
        heappush(high, -heappop(low))
        if len(high) > len(low):
            heappush(low, -heappop(high))
        out.append(-low[0] if len(low) > len(high) else (-low[0] + high[0]) / 2)
    return out`,
      tests: [["[5, 15, 1, 3]", "[5, 10.0, 5, 4.0]"], ["[1]", "[1]"], ["[2, 2]", "[2, 2.0]"]] }
  },
  problems: [
    { id: "medians-so-far", title: "Medians So Far", d: "Medium", lc: "find-median-from-data-stream",
      statement: "Numbers arrive one at a time. After each arrival, record the median of everything so far (the average of the two middle values when the count is even). Return the list of medians.",
      examples: [["[5, 15, 1, 3]", "[5, 10.0, 5, 4.0]", ""], ["[2, 2, 2]", "[2, 2.0, 2]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Re-sorting after every arrival is too slow.", "Max-heap for the smaller half, min-heap for the larger half.", "Rebalance so the halves differ in size by at most one."],
      solution: `def medians_so_far(nums):
    low, high, out = [], [], []
    for x in nums:
        heappush(low, -x)
        heappush(high, -heappop(low))
        if len(high) > len(low):
            heappush(low, -heappop(high))
        if len(low) > len(high):
            out.append(-low[0])
        else:
            out.append((-low[0] + high[0]) / 2)
    return out`,
      why: "Each arrival costs O(log n) and the two heap tops are always the middle values.", time: "O(n log n)",
      hidden: [["[7]", "[7]"], ["[1, 2, 3, 4]", "[1, 1.5, 2, 2.5]"], ["list(range(100000))", "[i // 2 if i % 2 == 0 else i / 2 for i in range(100000)]"], ["[3] * 100000", "[3 if i % 2 == 0 else 3.0 for i in range(100000)]"]] },
    { id: "median-tracker", title: "Median Tracker", d: "Hard", lc: "find-median-from-data-stream",
      statement: "Implement `MedianTracker` with `add(num)` and `median()` (a float average when the count is even). The checker runs a list of operations; the constructor and `add` output `None`.",
      examples: [["['MedianTracker', 'add', 'add', 'median', 'add', 'median'], [[], [1], [2], [], [3], []]", "[None, None, None, 1.5, None, 2]", ""], ["['MedianTracker', 'add', 'median'], [[], [-4], []]", "[None, None, -4]", ""]],
      constraints: ["up to 5·10⁴ calls", "median is only called when non-empty"],
      hints: ["Keep two heaps: max-heap low, min-heap high.", "add: push into low, move low's top to high, rebalance.", "median: low's top, or the average of both tops."],
      starter: "class MedianTracker:\n    def __init__(self):\n        pass\n\n    def add(self, num):\n        pass\n\n    def median(self):\n        pass\n",
      solution: `class MedianTracker:
    def __init__(self):
        self.low, self.high = [], []

    def add(self, num):
        heappush(self.low, -num)
        heappush(self.high, -heappop(self.low))
        if len(self.high) > len(self.low):
            heappush(self.low, -heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2`,
      call: "run_ops(F, *args)",
      why: "The halves stay balanced after every add, so the median is read from the tops in O(1).", time: "O(log n) add",
      hidden: [["['MedianTracker', 'add', 'add', 'median'], [[], [5], [5], []]", "[None, None, None, 5.0]"], ["['MedianTracker', 'add', 'add', 'add', 'add', 'median'], [[], [6], [10], [2], [6], []]", "[None, None, None, None, None, 6.0]"], ["['MedianTracker'] + ['add'] * 50000 + ['median'], [[]] + [[i] for i in range(50000)] + [[]]", "[None] * 50001 + [24999.5]"]] },
    { id: "cpu-order", title: "CPU Order", d: "Medium", lc: "single-threaded-cpu",
      statement: "Task i becomes available at time `tasks[i][0]` and needs `tasks[i][1]` time. One CPU: when idle, it picks the available task with the **shortest** processing time (ties: smaller index) and runs it to completion; if nothing is available it waits for the next task. Return the order of task indices.",
      examples: [["[[1, 2], [2, 4], [3, 2], [4, 1]]", "[0, 2, 3, 1]", ""], ["[[7, 10], [7, 12], [7, 5], [7, 4], [7, 2]]", "[4, 3, 2, 0, 1]", ""]],
      constraints: ["1 ≤ len(tasks) ≤ 10⁵", "1 ≤ start, duration ≤ 10⁹"],
      hints: ["Sort tasks by availability time (keeping indices).", "Push every task that's available into a heap keyed by (duration, index).", "If the heap is empty, jump the clock to the next task's start."],
      solution: `def cpu_order(tasks):
    order = sorted(range(len(tasks)), key=lambda i: tasks[i][0])
    heap, out, t, i = [], [], 0, 0
    while len(out) < len(tasks):
        if not heap and t < tasks[order[i]][0]:
            t = tasks[order[i]][0]
        while i < len(order) and tasks[order[i]][0] <= t:
            j = order[i]
            heappush(heap, (tasks[j][1], j))
            i += 1
        d, j = heappop(heap)
        t += d
        out.append(j)
    return out`,
      why: "Tasks enter the heap in time order; the heap always yields the shortest available one.", time: "O(n log n)",
      hidden: [["[[1, 1]]", "[0]"], ["[[5, 2], [1, 3]]", "[1, 0]"], ["[[1, 1] for _ in range(100000)]", "list(range(100000))"]] },
    { id: "server-picker", title: "Server Picker", d: "Medium", lc: "process-tasks-using-servers",
      statement: "`servers[i]` is server i's weight. Task j arrives at second j and needs `tasks[j]` seconds. When a task is assigned, it goes to the free server with the smallest weight (ties: smallest index). If no server is free, the task waits until one frees up (tasks are assigned in order). Return the server index for each task.",
      examples: [["[3, 3, 2], [1, 2, 3, 2, 1, 2]", "[2, 2, 0, 2, 1, 2]", ""], ["[5, 1, 4, 3, 2], [2, 1, 2, 4, 5, 2, 1]", "[1, 4, 1, 4, 1, 3, 2]", ""]],
      constraints: ["1 ≤ len(servers), len(tasks) ≤ 2·10⁵"],
      hints: ["A heap of free servers keyed by (weight, index).", "A heap of busy servers keyed by (free time, weight, index).", "Before each assignment, move every server that has finished back to free; if none is free, jump time to the earliest finish."],
      solution: `def server_picker(servers, tasks):
    free = [(w, i) for i, w in enumerate(servers)]
    heapify(free)
    busy, out, t = [], [], 0
    for j, d in enumerate(tasks):
        t = max(t, j)
        if not free:
            t = max(t, busy[0][0])
        while busy and busy[0][0] <= t:
            _, w, i = heappop(busy)
            heappush(free, (w, i))
        w, i = heappop(free)
        out.append(i)
        heappush(busy, (t + d, w, i))
    return out`,
      why: "Two heaps answer “cheapest free server” and “next server to finish” in O(log n) each.", time: "O((n + m) log n)",
      hidden: [["[1], [1, 1]", "[0, 0]"], ["[2, 1], [5]", "[1]"], ["[1] * 1000, [1000] * 3000", "list(range(1000)) * 3"]] },
    { id: "window-medians", title: "Window Medians", d: "Hard", lc: "sliding-window-median",
      statement: "Return the median of every window of `k` consecutive numbers, as floats.",
      examples: [["[1, 3, -1, -3, 5, 3, 6, 7], 3", "[1.0, -1.0, -1.0, 3.0, 5.0, 6.0]", ""], ["[1, 2, 3, 4, 2, 3, 1, 4, 2], 3", "[2.0, 3.0, 3.0, 3.0, 2.0, 3.0, 2.0]", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵"],
      hints: ["Two heaps, but values must leave the window too.", "Lazy deletion: count values to delete and drop them only when they reach a heap top.", "Track the 'real' size of each half separately from the heap lengths."],
      solution: `def window_medians(nums, k):
    low, high = [], []
    gone = defaultdict(int)
    for x in nums[:k]:
        heappush(low, -x)
    for _ in range(k // 2):
        heappush(high, -heappop(low))
    def med():
        return float(-low[0]) if k % 2 else (-low[0] + high[0]) / 2
    out = [med()]
    for i in range(k, len(nums)):
        x, y = nums[i], nums[i - k]
        balance = 0
        gone[y] += 1
        balance += -1 if y <= -low[0] else 1
        if low and x <= -low[0]:
            heappush(low, -x)
            balance += 1
        else:
            heappush(high, x)
            balance -= 1
        if balance < 0:
            heappush(low, -heappop(high))
        elif balance > 0:
            heappush(high, -heappop(low))
        while low and gone[-low[0]]:
            gone[-low[0]] -= 1
            heappop(low)
        while high and gone[high[0]]:
            gone[high[0]] -= 1
            heappop(high)
        out.append(med())
    return out`,
      why: "Lazy deletion keeps heap operations O(log n); the balance counter keeps the real halves equal even though dead values linger inside.", time: "O(n log n)",
      hidden: [["[5], 1", "[5.0]"], ["[1, 4, 2, 3], 4", "[2.5]"], ["[1, 2] * 50000, 2", "[1.5] * 99999"], ["list(range(10000)), 3", "[float(i) for i in range(1, 9999)]"]] },
    { id: "room-booker", title: "Room Booker", d: "Hard", lc: "meeting-rooms-iii",
      statement: "There are `n` rooms numbered 0..n−1. Meetings `[start, end)` have **distinct** starts and are handled in order of start time. Each meeting takes the lowest-numbered free room; if none is free, it waits for the room that frees up first (ties: lowest number) and keeps its original duration. Return the number of the room that hosted the most meetings (ties: lowest number).",
      examples: [["2, [[0, 10], [1, 5], [2, 7], [3, 4]]", "0", ""], ["3, [[1, 20], [2, 10], [3, 5], [4, 9], [6, 8]]", "1", ""]],
      constraints: ["1 ≤ n ≤ 100", "1 ≤ len(meetings) ≤ 10⁵", "0 ≤ start < end ≤ 5·10⁵"],
      hints: ["Free rooms: a min-heap of room numbers.", "Busy rooms: a min-heap of (end time, room).", "Before each meeting, free every room whose end ≤ start; if none is free, take the earliest-ending busy room and delay the meeting."],
      solution: `def room_booker(n, meetings):
    free = list(range(n))
    busy = []
    count = [0] * n
    for s, e in sorted(meetings):
        while busy and busy[0][0] <= s:
            _, r = heappop(busy)
            heappush(free, r)
        if free:
            r = heappop(free)
            heappush(busy, (e, r))
        else:
            t, r = heappop(busy)
            heappush(busy, (t + e - s, r))
        count[r] += 1
    return count.index(max(count))`,
      why: "Two heaps track free rooms by number and busy rooms by finishing time, so each meeting is placed in O(log n).", time: "O(m log m + m log n)",
      hidden: [["1, [[0, 1], [1, 2]]", "0"], ["2, [[0, 5], [1, 2], [2, 3]]", "1"], ["4, [[i, i + 1000] for i in range(100000)]", "0"]] }
  ]
});
