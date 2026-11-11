PAT("k-way-merge", {
  time: "O(N log k)", space: "O(k)",
  lede: "To merge k sorted sequences, keep just the **current head** of each in a min-heap. Pop the smallest, then push that sequence's next element. The heap never holds more than k items.",
  idea: "Merging two sorted lists is a simple two-pointer walk. With k lists, comparing all k heads each step is O(k) per element. A min-heap of the k heads finds the smallest in O(log k), so N elements cost O(N log k). The same idea works for any set of sorted **streams**: pairs ordered by sum, multiples of primes, rows of a sorted matrix.",
  analogy: "k checkout queues sorted by arrival time: to serve people in overall arrival order, you only ever look at the person at the front of each queue.",
  signals: [["“Merge k sorted lists / arrays”", "heap of heads"], ["“k-th smallest” across several sorted lists or a sorted matrix", "pop k times"], ["“Smallest range covering one element from each list”", "heap + track the current max"], ["Pairs / sums from sorted arrays in increasing order", "lazy stream of candidates"]],
  not: "**Not this pattern** for merging just two lists (two pointers are simpler), or for the k largest of one unsorted array (→ top-k).",
  templates: [
    ["Heap of heads", "kmerge.py", `import heapq

def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapq.heapify(heap)                    # (value, which list, index in it)
    out = []
    while heap:
        v, i, j = heapq.heappop(heap)
        out.append(v)
        if j + 1 < len(lists[i]):          # push that list's next element
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return out

print(merge_k([[1, 4, 5], [1, 3, 4], [2, 6]]))`, "[1, 1, 2, 3, 4, 4, 5, 6]"]
  ],
  examples: [
    { t: "Merge k Sorted Lists", d: "Hard", lc: "merge-k-sorted-lists", f: "Heap of heads",
      q: "Merge k sorted linked lists into one.",
      idea: "Heap of (value, tie-breaker, node). Pop, append, push node.next.",
      code: `import heapq

class N:
    def __init__(s, v, n=None): s.val, s.next = v, n

def merge(lists):
    heap = [(n.val, i, n) for i, n in enumerate(lists) if n]
    heapq.heapify(heap)
    tail = dummy = N(0)
    while heap:
        v, i, n = heapq.heappop(heap)
        tail.next = n; tail = n
        if n.next: heapq.heappush(heap, (n.next.val, i, n.next))
    return dummy.next

h = merge([N(1, N(4, N(5))), N(1, N(3, N(4))), N(2, N(6))])
out = []
while h: out.append(h.val); h = h.next
print(out)`, out: "[1, 1, 2, 3, 4, 4, 5, 6]", cx: "O(N log k)" },
    { t: "Find K Pairs with Smallest Sums", d: "Medium", lc: "find-k-pairs-with-smallest-sums", f: "Lazy streams",
      q: "Sorted a and b. Return the k pairs (a[i], b[j]) with the smallest sums.",
      idea: "Each i defines a sorted stream a[i]+b[0], a[i]+b[1]… Start with j = 0 for the first k rows and advance j.",
      code: `import heapq

def k_smallest_pairs(a, b, k):
    heap = [(a[i] + b[0], i, 0) for i in range(min(k, len(a)))]
    heapq.heapify(heap)
    out = []
    while heap and len(out) < k:
        _, i, j = heapq.heappop(heap)
        out.append([a[i], b[j]])
        if j + 1 < len(b):
            heapq.heappush(heap, (a[i] + b[j + 1], i, j + 1))
    return out

print(k_smallest_pairs([1, 7, 11], [2, 4, 6], 3))`, out: "[[1, 2], [1, 4], [1, 6]]", cx: "O(k log k)" }
  ],
  pitfalls: [
    ["Pushing un-comparable objects", "Tuples compare element by element; add an index tie-breaker before nodes or lists."],
    ["Pushing everything at once", "That's just sorting: O(N log N). Push only heads, then the next of whatever you popped."],
    ["Forgetting empty lists", "Skip them when building the initial heap."],
    ["Smallest range: forgetting the current max", "The heap gives the min; track the max of the heads separately."]
  ],
  edge: ["Some lists empty", "k = 1", "All lists have one element", "Duplicate values across lists", "Very uneven list lengths"],
  compare: [
    ["Top-K Elements", "top-k", "Top-k selects from one unsorted collection; k-way merge exploits the fact each input is already sorted."],
    ["In-place Reversal & Dummy Nodes", "ll-reversal", "Merging two linked lists is the dummy + tail technique; k lists adds the heap."],
    ["Binary Search on the Answer", "binary-search-answer", "k-th smallest in a sorted matrix can also be binary-searched on the value."]
  ],
  mcq: [
    ["How many elements does the heap hold when merging k lists?", ["N", "At most k", "k²", "log k"], 1, "One current head per list."],
    ["Why add an index to heap tuples like (value, i, node)?", ["For speed", "So ties on value never compare nodes, which aren't comparable", "Required by heapq", "To sort by list"], 1, "Python compares the next tuple field on ties; ints are safe, nodes aren't."]
  ],
  summary: {
    oneLine: "Min-heap of the current head of each sorted list: pop smallest, push its successor.",
    signals: ["Merge k sorted lists / arrays", "k-th smallest across sorted lists", "Smallest range covering all lists", "Smallest pair sums"],
    template: `heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
heapify(heap)
while heap:
    v, i, j = heappop(heap)
    out.append(v)
    if j + 1 < len(lists[i]):
        heappush(heap, (lists[i][j + 1], i, j + 1))`,
    pitfalls: ["Tie-breaker index in tuples", "Push heads only", "Skip empty lists"],
    cx: "O(N log k) time · O(k) space",
    drill: { task: "Merge the sorted lists in `lists` into one sorted list using a heap of heads.",
      ref: `def merge_k(lists):
    heap = [(lst[0], i, 0) for i, lst in enumerate(lists) if lst]
    heapify(heap)
    out = []
    while heap:
        v, i, j = heappop(heap)
        out.append(v)
        if j + 1 < len(lists[i]):
            heappush(heap, (lists[i][j + 1], i, j + 1))
    return out`,
      tests: [["[[1, 4, 5], [1, 3, 4], [2, 6]]", "[1, 1, 2, 3, 4, 4, 5, 6]"], ["[[], [1]]", "[1]"], ["[]", "[]"]] }
  },
  problems: [
    { id: "merge-sorted-feeds", title: "Merge Sorted Feeds", d: "Medium", lc: "merge-k-sorted-lists",
      statement: "Each feed in `feeds` is a sorted list of timestamps. Merge them all into one sorted list.",
      examples: [["[[1, 4, 5], [1, 3, 4], [2, 6]]", "[1, 1, 2, 3, 4, 4, 5, 6]", ""], ["[[], [0]]", "[0]", ""], ["[]", "[]", ""]],
      constraints: ["0 ≤ k ≤ 10⁴", "total elements N ≤ 10⁵"],
      hints: ["Keep the current head of each feed in a min-heap.", "Pop the smallest, then push the next element of the same feed."],
      solution: `def merge_feeds(feeds):
    heap = [(f[0], i, 0) for i, f in enumerate(feeds) if f]
    heapify(heap)
    out = []
    while heap:
        v, i, j = heappop(heap)
        out.append(v)
        if j + 1 < len(feeds[i]):
            heappush(heap, (feeds[i][j + 1], i, j + 1))
    return out`,
      why: "The heap holds at most one element per feed, so each of the N pops costs O(log k).", time: "O(N log k)",
      hidden: [["[[5]]", "[5]"], ["[[1, 2], [1, 2]]", "[1, 1, 2, 2]"], ["[list(range(i, 100000, 100)) for i in range(100)]", "list(range(100000))"]] },
    { id: "merge-k-trains", title: "Merge K Trains", d: "Hard", lc: "merge-k-sorted-lists",
      statement: "`lists` holds the heads of k sorted linked lists. Merge them into one sorted linked list by relinking nodes, and return its head.",
      examples: [["[build_list([1, 4, 5]), build_list([1, 3, 4]), build_list([2, 6])]", "[1, 1, 2, 3, 4, 4, 5, 6]", ""], ["[]", "[]", ""], ["[build_list([])]", "[]", ""]],
      constraints: ["0 ≤ k ≤ 10⁴", "total nodes ≤ 10⁵"],
      hints: ["Heap of (value, index, node) for each non-empty list.", "Pop, attach to the tail, push node.next if it exists.", "The index stops Python from comparing nodes on ties."],
      solution: `def merge_k_trains(lists):
    heap = [(node.val, i, node) for i, node in enumerate(lists) if node]
    heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heappop(heap)
        tail.next = node
        tail = node
        if node.next:
            heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
      conv: "to_list(r)",
      why: "Only the k current heads compete at any time; each node passes through the heap once.", time: "O(N log k)",
      hidden: [["[build_list([2]), build_list([]), build_list([-1])]", "[-1, 2]"], ["[build_list([1, 1]), build_list([1])]", "[1, 1, 1]"], ["[build_list(list(range(i, 50000, 50))) for i in range(50)]", "list(range(50000))"]] },
    { id: "kth-across-lists", title: "Kth Across Lists", d: "Medium", lc: "kth-smallest-element-in-a-sorted-matrix",
      statement: "Each list in `lists` is sorted. Return the `k`-th smallest value among all their elements combined (1-indexed, counting duplicates).",
      examples: [["[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8", "13", ""], ["[[2, 6, 8], [3, 6, 7]], 5", "7", ""]],
      constraints: ["1 ≤ k ≤ total elements ≤ 10⁵"],
      hints: ["Run a k-way merge but stop after k pops.", "The k-th value popped is the answer."],
      solution: `def kth_across(lists, k):
    heap = [(l[0], i, 0) for i, l in enumerate(lists) if l]
    heapify(heap)
    while True:
        v, i, j = heappop(heap)
        k -= 1
        if k == 0:
            return v
        if j + 1 < len(lists[i]):
            heappush(heap, (lists[i][j + 1], i, j + 1))`,
      why: "Values come out of a k-way merge in sorted order, so the k-th pop is the k-th smallest.", time: "O(k log m)",
      hidden: [["[[1]], 1", "1"], ["[[1, 2], [], [3]], 3", "3"], ["[list(range(i, 100000, 1000)) for i in range(1000)], 99999", "99998"]] },
    { id: "cheapest-pairs", title: "Cheapest Pairs", d: "Medium", lc: "find-k-pairs-with-smallest-sums",
      statement: "`a` and `b` are sorted. Return the `k` pairs `[x, y]` (x from a, y from b) with the smallest sums, in increasing order of sum; for equal sums, order by the index in `a`, then the index in `b`.",
      examples: [["[1, 7, 11], [2, 4, 6], 3", "[[1, 2], [1, 4], [1, 6]]", ""], ["[1, 1, 2], [1, 2, 3], 2", "[[1, 1], [1, 1]]", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 10⁵", "1 ≤ k ≤ 10⁴"],
      hints: ["For each i, the pairs (i, 0), (i, 1), … come in increasing sum: a sorted stream.", "Start with (i, 0) for the first k values of i; pop the smallest and push (i, j + 1)."],
      solution: `def cheapest_pairs(a, b, k):
    heap = [(a[i] + b[0], i, 0) for i in range(min(k, len(a)))]
    heapify(heap)
    out = []
    while heap and len(out) < k:
        _, i, j = heappop(heap)
        out.append([a[i], b[j]])
        if j + 1 < len(b):
            heappush(heap, (a[i] + b[j + 1], i, j + 1))
    return out`,
      why: "Each row is a sorted stream; merging the first k rows lazily never touches more than O(k) candidates.", time: "O(k log k)",
      hidden: [["[1, 2], [3], 3", "[[1, 3], [2, 3]]"], ["[1], [1], 1", "[[1, 1]]"], ["list(range(100000)), list(range(100000)), 3", "[[0, 0], [0, 1], [1, 0]]"]] },
    { id: "plain-numbers", title: "Nth Plain Number", d: "Medium", lc: "ugly-number-ii",
      statement: "A *plain* number has no prime factors other than 2, 3 and 5 (1 counts as plain). Return the `n`-th plain number: 1, 2, 3, 4, 5, 6, 8, 9, 10, 12, …",
      examples: [["10", "12", ""], ["1", "1", ""]],
      constraints: ["1 ≤ n ≤ 1690"],
      hints: ["Every plain number is 2×, 3× or 5× a smaller plain number.", "Merge three sorted streams (×2, ×3, ×5) with three pointers, skipping duplicates.", "Or a heap with a seen-set."],
      solution: `def plain_number(n):
    nums = [1]
    i2 = i3 = i5 = 0
    while len(nums) < n:
        nxt = min(nums[i2] * 2, nums[i3] * 3, nums[i5] * 5)
        nums.append(nxt)
        if nxt == nums[i2] * 2:
            i2 += 1
        if nxt == nums[i3] * 3:
            i3 += 1
        if nxt == nums[i5] * 5:
            i5 += 1
    return nums[-1]`,
      why: "It's a 3-way merge of the plain numbers multiplied by 2, 3 and 5; advancing every pointer that produced the minimum removes duplicates.", time: "O(n)",
      hidden: [["7", "8"], ["11", "15"], ["1690", "2123366400"]] },
    { id: "tightest-range", title: "Tightest Range", d: "Hard", lc: "smallest-range-covering-elements-from-k-lists",
      statement: "Each of the k lists is sorted. Find the smallest range `[a, b]` that includes **at least one number from every list**. A range is smaller if `b − a` is smaller, or if equal, if `a` is smaller. Return `[a, b]`.",
      examples: [["[[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]", "[20, 24]", ""], ["[[1, 2, 3], [1, 2, 3], [1, 2, 3]]", "[1, 1]", ""]],
      constraints: ["1 ≤ k ≤ 3500", "1 ≤ list length ≤ 50"],
      hints: ["Hold one element from each list in a min-heap, and track the maximum of them.", "The current range is [heap min, current max].", "To try to shrink it, advance the list that owns the minimum; stop when a list runs out."],
      solution: `def tightest_range(lists):
    heap = [(l[0], i, 0) for i, l in enumerate(lists)]
    heapify(heap)
    hi = max(l[0] for l in lists)
    best = [heap[0][0], hi]
    while True:
        lo, i, j = heappop(heap)
        if hi - lo < best[1] - best[0]:
            best = [lo, hi]
        if j + 1 == len(lists[i]):
            return best
        nxt = lists[i][j + 1]
        hi = max(hi, nxt)
        heappush(heap, (nxt, i, j + 1))`,
      why: "Only increasing the current minimum can shrink the range, so the heap always advances the right list.", time: "O(N log k)",
      hidden: [["[[1]]", "[1, 1]"], ["[[1, 5], [3, 9]]", "[1, 3]"], ["[list(range(i, 5000 + i, 100)) for i in range(50)]", "[0, 49]"]] }
  ]
});
