PAT("binary-search", {
  time: "O(log n)", space: "O(1)",
  lede: "Keep a range that's guaranteed to contain the answer and cut it in half every step. Works on anything sorted, and on anything where a yes/no question flips exactly once.",
  idea: "Binary search isn't really about finding a value; it's about finding the **boundary** where a condition changes from false to true. Write the condition, keep the invariant (`lo` is never past the answer, `hi` is always a valid candidate), and the loop takes care of itself. Rotated arrays still work: one half around `mid` is always sorted.",
  analogy: "Guessing a number from 1 to 1000 with “higher / lower” answers: ten guesses always suffice because each one halves what's left.",
  flavours: [["Variant", "Condition", "Returns"], [
    ["**Lower bound**", "`a[mid] >= x`", "first index with a[i] ≥ x (insert position)"],
    ["**Upper bound**", "`a[mid] > x`", "first index with a[i] > x"],
    ["**Rotated array**", "which half is sorted?", "target index / minimum"],
    ["**Peak / mountain**", "`a[mid] < a[mid + 1]`", "a local maximum"]]],
  signals: [["The input is **sorted** (or rotated sorted)", "and n is large"], ["“First / last position”, “insert position”, “count of x”", "lower / upper bound"], ["O(log n) is required", "the statement says so"], ["A condition that's false…false, true…true", "monotone predicate"]],
  not: "**Not this pattern** when the data is unsorted and you can't define a monotone condition (→ hashing), or when you're searching for the best **answer value** like a speed or capacity (→ binary search on the answer, the sibling pattern).",
  templates: [
    ["Lower bound", "lower_bound.py", `def lower_bound(a, x):                # first index with a[i] >= x
    lo, hi = 0, len(a)                     # answer is in [lo, hi]
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x:
            lo = mid + 1                   # mid is too small: answer is right of it
        else:
            hi = mid                       # mid might be the answer
    return lo

a = [1, 3, 3, 3, 7]
print(lower_bound(a, 3), lower_bound(a, 4), lower_bound(a, 9))`, "1 4 5"],
    ["Rotated array", "rotated.py", `def search_rotated(a, t):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == t:
            return mid
        if a[lo] <= a[mid]:                # left half is sorted
            if a[lo] <= t < a[mid]: hi = mid - 1
            else: lo = mid + 1
        else:                              # right half is sorted
            if a[mid] < t <= a[hi]: lo = mid + 1
            else: hi = mid - 1
    return -1

print(search_rotated([4, 5, 6, 7, 0, 1, 2], 0), search_rotated([4, 5, 6, 7, 0, 1, 2], 3))`, "4 -1"]
  ],
  examples: [
    { t: "Find First and Last Position", d: "Medium", lc: "find-first-and-last-position-of-element-in-sorted-array", f: "Bounds",
      q: "Return [first, last] index of target in a sorted array, or [−1, −1].",
      idea: "first = lower_bound(t); last = lower_bound(t + 1) − 1. `bisect` does both.",
      code: `from bisect import bisect_left, bisect_right

def search_range(a, t):
    l = bisect_left(a, t)
    if l == len(a) or a[l] != t:
        return [-1, -1]
    return [l, bisect_right(a, t) - 1]

print(search_range([5, 7, 7, 8, 8, 10], 8), search_range([5, 7], 6))`, out: "[3, 4] [-1, -1]", cx: "O(log n)" },
    { t: "Find Minimum in Rotated Sorted Array", d: "Medium", lc: "find-minimum-in-rotated-sorted-array", f: "Rotated",
      q: "Minimum of a rotated sorted array with distinct values.",
      idea: "Compare mid with the right end: if a[mid] > a[hi], the minimum is to the right.",
      code: `def find_min(a):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] > a[hi]: lo = mid + 1
        else: hi = mid
    return a[lo]

print(find_min([3, 4, 5, 1, 2]), find_min([11, 13, 15, 17]))`, out: "1 11", cx: "O(log n)" },
    { t: "Find Peak Element", d: "Medium", lc: "find-peak-element", f: "Peak",
      q: "Return the index of any element greater than its neighbours.",
      idea: "If a[mid] < a[mid + 1], walking uphill to the right must reach a peak.",
      code: `def find_peak(a):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < a[mid + 1]: lo = mid + 1
        else: hi = mid
    return lo

print(find_peak([1, 2, 3, 1]))`, out: "2", cx: "O(log n)" },
    { t: "Median of Two Sorted Arrays", d: "Hard", lc: "median-of-two-sorted-arrays", f: "Partition",
      q: "Median of two sorted arrays in O(log(min(m, n))).",
      idea: "Binary-search how many elements of the shorter array go into the left half; the partition is right when both left maxima ≤ both right minima.",
      code: `def median(A, B):
    if len(A) > len(B): A, B = B, A
    m, n = len(A), len(B)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2; j = half - i
        Al = A[i - 1] if i else float("-inf"); Ar = A[i] if i < m else float("inf")
        Bl = B[j - 1] if j else float("-inf"); Br = B[j] if j < n else float("inf")
        if Al <= Br and Bl <= Ar:
            if (m + n) % 2: return max(Al, Bl)
            return (max(Al, Bl) + min(Ar, Br)) / 2
        if Al > Br: hi = i - 1
        else: lo = i + 1

print(median([1, 3], [2]), median([1, 2], [3, 4]))`, out: "2 2.5", cx: "O(log min(m, n))" }
  ],
  pitfalls: [
    ["Mixing `[lo, hi]` and `[lo, hi)` styles", "Pick one. With `hi = len(a)` use `while lo < hi` and `hi = mid`."],
    ["Infinite loop when `lo = mid`", "With `mid = (lo + hi) // 2`, always move `lo` to `mid + 1`; otherwise round mid up."],
    ["Reading `a[lo]` without checking bounds", "Lower bound can return `len(a)`."],
    ["Rotated array with duplicates", "`a[lo] == a[mid]` makes the sorted half ambiguous; shrink by one and accept O(n) worst case."]
  ],
  edge: ["Empty array", "Target smaller than everything / bigger than everything", "All elements equal", "Array not rotated at all", "Single element"],
  compare: [
    ["Binary Search on the Answer", "binary-search-answer", "Same loop, but the range is possible answers (speeds, capacities) and the condition is “is this feasible?”."],
    ["Two Pointers", "two-pointers", "Pair-sum in a sorted array is O(n) with two pointers vs O(n log n) with binary search per element."],
    ["Matrix Tricks", "matrix", "A fully sorted grid is a 1-D sorted array in disguise; a row-and-column sorted grid uses staircase search."]
  ],
  mcq: [
    ["`bisect_left(a, x)` returns…", ["The last index of x", "The first index i with a[i] ≥ x", "The index of x or −1", "The count of x"], 1, "It's the lower bound: where x would be inserted to keep a sorted, before any equal values."],
    ["In a rotated sorted array, what is always true around mid?", ["Both halves are sorted", "At least one half is sorted", "The minimum is at mid", "Nothing"], 1, "The rotation point is in at most one half, so the other half is sorted."]
  ],
  summary: {
    oneLine: "Find the boundary where a monotone condition flips; halve the range each step.",
    signals: ["Sorted / rotated sorted input", "First / last / insert position", "O(log n) required", "Peak in a mountain"],
    template: `lo, hi = 0, len(a)
while lo < hi:
    mid = (lo + hi) // 2
    if a[mid] < x: lo = mid + 1
    else: hi = mid
return lo        # first index with a[i] >= x`,
    pitfalls: ["One interval style only", "lo = mid + 1 to avoid loops", "lo can equal len(a)"],
    cx: "O(log n) time · O(1) space",
    drill: { task: "Return the first index `i` with `a[i] >= x` in the sorted list `a` (`len(a)` if none). Don't use `bisect`.",
      ref: `def lower_bound(a, x):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if a[mid] < x:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      tests: [["[1, 3, 3, 5], 3", "1"], ["[1, 3, 3, 5], 4", "3"], ["[1, 3], 9", "2"], ["[], 1", "0"]] }
  },
  problems: [
    { id: "page-lookup", title: "Page Lookup", d: "Easy", lc: "binary-search",
      statement: "`pages` is sorted ascending with distinct values. Return the index of `target`, or -1. Use O(log n).",
      examples: [["[-1, 0, 3, 5, 9, 12], 9", "4", ""], ["[-1, 0, 3, 5, 9, 12], 2", "-1", ""]],
      constraints: ["1 ≤ len(pages) ≤ 10⁵"],
      hints: ["Compare with the middle element.", "Discard the half that can't contain target."],
      solution: `def page_lookup(pages, target):
    lo, hi = 0, len(pages) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if pages[mid] == target:
            return mid
        if pages[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
      why: "Each comparison halves the remaining range.", time: "O(log n)",
      hidden: [["[5], 5", "0"], ["[5], 6", "-1"], ["list(range(0, 200000, 2)), 199998", "99999"]] },
    { id: "insert-spot", title: "Where It Fits", d: "Easy", lc: "search-insert-position",
      statement: "`nums` is sorted with distinct values. Return the index of `target` if present, otherwise the index where it would be inserted to keep the list sorted.",
      examples: [["[1, 3, 5, 6], 5", "2", ""], ["[1, 3, 5, 6], 2", "1", ""], ["[1, 3, 5, 6], 7", "4", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["This is the lower bound: first index with nums[i] ≥ target.", "Use hi = len(nums) so 'insert at the end' is possible."],
      solution: `def insert_spot(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      why: "The lower bound is both the position of target and its insertion point.", time: "O(log n)",
      hidden: [["[1], 0", "0"], ["[1], 2", "1"], ["list(range(1, 200000, 2)), 100000", "50000"]] },
    { id: "whole-root", title: "Whole Square Root", d: "Easy", lc: "sqrtx",
      statement: "Return the integer square root of `x`: the largest integer `r` with `r * r <= x`. Don't use `**0.5`, `math.sqrt` or `math.isqrt`.",
      examples: [["4", "2", ""], ["8", "2", "√8 ≈ 2.83"], ["0", "0", ""]],
      constraints: ["0 ≤ x ≤ 2³¹ − 1"],
      hints: ["The condition r*r ≤ x is true, true, …, then false.", "Binary-search the last r for which it's true."],
      solution: `def whole_root(x):
    lo, hi = 0, x
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
      why: "r*r ≤ x is monotone in r, so binary search finds the last r that satisfies it (rounding mid up avoids an infinite loop).", time: "O(log x)",
      hidden: [["1", "1"], ["15", "3"], ["2147483647", "46340"], ["1000000", "1000"]] },
    { id: "first-and-last", title: "First and Last", d: "Medium", lc: "find-first-and-last-position-of-element-in-sorted-array",
      statement: "`nums` is sorted (may contain repeats). Return `[first, last]`: the first and last index of `target`, or `[-1, -1]`. O(log n).",
      examples: [["[5, 7, 7, 8, 8, 10], 8", "[3, 4]", ""], ["[5, 7, 7, 8, 8, 10], 6", "[-1, -1]", ""], ["[], 0", "[-1, -1]", ""]],
      constraints: ["0 ≤ len(nums) ≤ 10⁵"],
      hints: ["first = lower bound of target.", "last = (lower bound of target + 1) − 1.", "Check that nums[first] really is target."],
      solution: `def first_and_last(nums, target):
    def lower(x):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        return lo
    l = lower(target)
    if l == len(nums) or nums[l] != target:
        return [-1, -1]
    return [l, lower(target + 1) - 1]`,
      why: "Two lower-bound searches give the boundaries of target's block.", time: "O(log n)",
      hidden: [["[1], 1", "[0, 0]"], ["[2, 2], 3", "[-1, -1]"], ["[7] * 100000, 7", "[0, 99999]"]] },
    { id: "turned-find", title: "Find in a Turned List", d: "Medium", lc: "search-in-rotated-sorted-array",
      statement: "A sorted list of distinct values was rotated at an unknown point (e.g. `[0,1,2,4,5,6,7]` → `[4,5,6,7,0,1,2]`). Return the index of `target`, or -1, in O(log n).",
      examples: [["[4, 5, 6, 7, 0, 1, 2], 0", "4", ""], ["[4, 5, 6, 7, 0, 1, 2], 3", "-1", ""], ["[1], 0", "-1", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "values are distinct"],
      hints: ["At any mid, one half is sorted.", "If target lies inside the sorted half's range, search there; otherwise search the other half."],
      solution: `def turned_find(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1`,
      why: "The sorted half tells you for sure whether target can be there, so each step discards half.", time: "O(log n)",
      hidden: [["[3, 1], 1", "1"], ["[5, 1, 3], 5", "0"], ["list(range(50000, 100000)) + list(range(50000)), 49999", "99999"]] },
    { id: "turned-min", title: "Smallest in a Turned List", d: "Medium", lc: "find-minimum-in-rotated-sorted-array",
      statement: "Return the minimum of a rotated sorted list of distinct values, in O(log n).",
      examples: [["[3, 4, 5, 1, 2]", "1", ""], ["[4, 5, 6, 7, 0, 1, 2]", "0", ""], ["[11, 13, 15, 17]", "11", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Compare nums[mid] with nums[hi].", "If nums[mid] > nums[hi], the drop (and the minimum) is to the right of mid."],
      solution: `def turned_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]`,
      why: "Comparing with the right end tells you which side the rotation point is on.", time: "O(log n)",
      hidden: [["[1]", "1"], ["[2, 1]", "1"], ["list(range(1, 100000)) + [0]", "0"]] },
    { id: "mountain-top", title: "Mountain Top", d: "Medium", lc: "peak-index-in-a-mountain-array",
      statement: "`h` strictly increases and then strictly decreases (a mountain with at least 3 points). Return the index of the peak in O(log n).",
      examples: [["[0, 1, 0]", "1", ""], ["[0, 2, 1, 0]", "1", ""], ["[0, 10, 5, 2]", "1", ""]],
      constraints: ["3 ≤ len(h) ≤ 10⁵"],
      hints: ["If h[mid] < h[mid + 1] you're on the way up: the peak is to the right.", "Otherwise the peak is at mid or to the left."],
      solution: `def mountain_top(h):
    lo, hi = 0, len(h) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if h[mid] < h[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo`,
      why: "“Am I going uphill?” is true before the peak and false from the peak on: a monotone condition.", time: "O(log n)",
      hidden: [["[1, 3, 2]", "1"], ["[0, 1, 2, 3, 1]", "3"], ["list(range(70000)) + list(range(30000, 0, -1))", "69999"]] },
    { id: "sorted-sheet", title: "Search the Sorted Sheet", d: "Medium", lc: "search-a-2d-matrix",
      statement: "Each row of `sheet` is sorted, and the first value of each row is greater than the last value of the previous row. Return `True` if `target` is present. Aim for O(log(m·n)).",
      examples: [["[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3", "True", ""], ["[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13", "False", ""]],
      constraints: ["1 ≤ m, n ≤ 1000"],
      hints: ["The whole sheet, read row by row, is one sorted list of length m·n.", "Index k maps to row k // n, column k % n."],
      solution: `def sorted_sheet(sheet, target):
    m, n = len(sheet), len(sheet[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = sheet[mid // n][mid % n]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
      why: "Treating the grid as a flat sorted array lets one binary search cover it.", time: "O(log(m·n))",
      hidden: [["[[1]], 1", "True"], ["[[1, 3]], 2", "False"], ["[[r * 1000 + c for c in range(1000)] for r in range(1000)], 999999", "True"]] },
    { id: "middle-of-two", title: "Middle of Two Lists", d: "Hard", lc: "median-of-two-sorted-arrays",
      statement: "Return the median of the combined values of two sorted lists `a` and `b` (as a float when the total length is even). Aim for O(log(min(m, n))).",
      examples: [["[1, 3], [2]", "2", ""], ["[1, 2], [3, 4]", "2.5", ""], ["[], [1]", "1", ""]],
      constraints: ["0 ≤ len(a), len(b) ≤ 10⁵", "len(a) + len(b) ≥ 1"],
      hints: ["Split both lists so the left parts together hold half the values.", "Binary-search how many come from the shorter list.", "The split is right when max(left parts) ≤ min(right parts)."],
      solution: `def middle_of_two(a, b):
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        al = a[i - 1] if i > 0 else float("-inf")
        ar = a[i] if i < m else float("inf")
        bl = b[j - 1] if j > 0 else float("-inf")
        br = b[j] if j < n else float("inf")
        if al <= br and bl <= ar:
            if (m + n) % 2:
                return max(al, bl)
            return (max(al, bl) + min(ar, br)) / 2
        if al > br:
            hi = i - 1
        else:
            lo = i + 1`,
      why: "Only the split position in the shorter list is unknown, and the partition condition is monotone in it.", time: "O(log min(m, n))",
      hidden: [["[2], []", "2"], ["[1, 1], [1, 1]", "1"], ["list(range(0, 200000, 2)), list(range(1, 200000, 2))", "99999.5"]] }
  ]
});
