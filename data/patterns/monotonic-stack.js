PAT("monotonic-stack", {
  time: "O(n)", space: "O(n)",
  lede: "Keep a stack whose values are always increasing (or always decreasing). When a new element breaks that order, everything it pops has just found its “next greater” (or smaller) element.",
  idea: "For every element you want the first element to its right that's bigger. Brute force scans right for each: O(n²). Instead, keep the indices still **waiting** for an answer on a stack. Their values are decreasing (otherwise they'd already have been answered). A new value x answers every waiting index with a smaller value: pop them all. Each index is pushed and popped once, so it's O(n).",
  analogy: "People standing in a queue facing forward: a short person can't see past a taller one in front. When a taller person joins at the back, everyone shorter in front of them in the line of sight gets “blocked” and drops out.",
  flavours: [["Stack order", "Pops when", "Answers"], [
    ["**Decreasing** values", "new x > top", "next **greater** element (for the popped one)"],
    ["**Increasing** values", "new x < top", "next **smaller** element"],
    ["Store **indices**", "", "distances (days until warmer), widths (histogram)"]]],
  signals: [["“Next greater / next smaller element”", "or previous greater/smaller"], ["“How many days until …”, “stock span”", "distances to the next bigger value"], ["Largest rectangle, area bounded by the smallest bar", "each bar's left and right limits"], ["“Remove k digits to make it smallest”", "keep an increasing stack"]],
  not: "**Not this pattern** when you need the max/min of a **sliding window** (→ monotonic deque), or matching brackets (→ stack for parsing).",
  templates: [
    ["Next greater", "next_greater.py", `def next_greater(a):
    ans = [-1] * len(a)
    stack = []                         # indices; their values are decreasing
    for i, x in enumerate(a):
        while stack and a[stack[-1]] < x:
            ans[stack.pop()] = x       # x is the next greater for that index
        stack.append(i)
    return ans

print(next_greater([2, 1, 2, 4, 3]))`, "[4, 2, 4, -1, -1]"],
    ["Distance to next greater", "days.py", `def days_until_warmer(t):
    ans, stack = [0] * len(t), []
    for i, x in enumerate(t):
        while stack and t[stack[-1]] < x:
            j = stack.pop()
            ans[j] = i - j             # store indices to get distances
        stack.append(i)
    return ans

print(days_until_warmer([73, 74, 75, 71, 69, 72, 76, 73]))`, "[1, 1, 4, 2, 1, 1, 0, 0]"]
  ],
  examples: [
    { t: "Daily Temperatures", d: "Medium", lc: "daily-temperatures", f: "Decreasing",
      q: "For each day, how many days until a warmer temperature (0 if none)?",
      idea: "Indices waiting for a warmer day sit on a decreasing stack; a warmer day pops and answers them.",
      code: `def daily(t):
    ans, st = [0] * len(t), []
    for i, x in enumerate(t):
        while st and t[st[-1]] < x:
            j = st.pop(); ans[j] = i - j
        st.append(i)
    return ans

print(daily([30, 40, 50, 60]))`, out: "[1, 1, 1, 0]", cx: "O(n)" },
    { t: "Next Greater Element II", d: "Medium", lc: "next-greater-element-ii", f: "Circular",
      q: "Circular array: next greater value, wrapping around.",
      idea: "Loop twice over the indices (i % n); only push during the first pass.",
      code: `def next_greater_ring(a):
    n = len(a)
    ans, st = [-1] * n, []
    for i in range(2 * n):
        x = a[i % n]
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        if i < n:
            st.append(i)
    return ans

print(next_greater_ring([1, 2, 1]))`, out: "[2, -1, 2]", cx: "O(n)" },
    { t: "Largest Rectangle in Histogram", d: "Hard", lc: "largest-rectangle-in-histogram", f: "Increasing",
      q: "Largest rectangle that fits under the bars.",
      idea: "Keep bars in increasing height. When a lower bar arrives, each popped bar's rectangle is bounded by the new bar on the right and the new stack top on the left.",
      code: `def largest_rect(h):
    st, best = [], 0
    for i, x in enumerate(h + [0]):            # sentinel 0 flushes the stack
        while st and h[st[-1]] >= x:
            height = h[st.pop()]
            left = st[-1] + 1 if st else 0
            best = max(best, height * (i - left))
        st.append(i)
    return best

print(largest_rect([2, 1, 5, 6, 2, 3]))`, out: "10", cx: "O(n)" },
    { t: "Remove K Digits", d: "Medium", lc: "remove-k-digits", f: "Increasing",
      q: "Remove k digits from the number string to make it as small as possible.",
      idea: "A digit followed by a smaller one should go. Keep an increasing stack, popping while k > 0.",
      code: `def remove_k(num, k):
    st = []
    for d in num:
        while k and st and st[-1] > d:
            st.pop(); k -= 1
        st.append(d)
    st = st[:len(st) - k] if k else st
    return "".join(st).lstrip("0") or "0"

print(remove_k("1432219", 3), remove_k("10200", 1))`, out: "1219 200", cx: "O(n)" }
  ],
  pitfalls: [
    ["Storing values when you need distances", "Push indices; you can always read `a[i]`."],
    ["`<` vs `<=` when popping", "Strict vs non-strict changes how equal values are treated (next greater vs next greater-or-equal)."],
    ["Forgetting leftovers", "Indices still on the stack at the end have no answer: keep their default (−1 or 0), or flush with a sentinel."],
    ["Circular arrays", "Loop to 2n with `i % n`, but push only in the first n steps."]
  ],
  edge: ["Strictly increasing input", "Strictly decreasing input", "All equal values", "Single element", "Leading zeros (remove k digits)"],
  compare: [
    ["Monotonic Deque", "monotonic-deque", "A deque also drops elements from the front when they leave a window: window max/min."],
    ["Stack for Parsing", "stack-parsing", "Bracket matching uses a plain stack; order of values doesn't matter there."],
    ["Two Pointers", "two-pointers", "Trapping rain water can be solved with either; the stack version measures water layer by layer."]
  ],
  mcq: [
    ["For “next greater element”, the stack's values are kept…", ["Increasing from bottom to top", "Decreasing from bottom to top", "Sorted alphabetically", "In input order without popping"], 1, "Anything smaller than a newer element would already have been popped and answered."],
    ["Why is the monotonic stack O(n) despite the inner while loop?", ["The loop runs at most once", "Each index is pushed once and popped at most once", "Python optimises it", "It isn't O(n)"], 1, "Total pops ≤ total pushes = n."]
  ],
  summary: {
    oneLine: "A stack of indices kept increasing/decreasing; popping answers “next greater / smaller”.",
    signals: ["Next greater / smaller element", "Days until warmer, stock span", "Largest rectangle in histogram", "Remove k digits"],
    template: `ans = [-1] * len(a)
stack = []                 # indices, values decreasing
for i, x in enumerate(a):
    while stack and a[stack[-1]] < x:
        ans[stack.pop()] = x
    stack.append(i)`,
    pitfalls: ["Push indices, not values", "Mind < vs <= for equal values", "Circular: loop 2n, push only first n"],
    cx: "O(n) time · O(n) space",
    drill: { task: "For each element, return the next greater value to its right, or -1.",
      ref: `def next_greater(a):
    ans = [-1] * len(a)
    st = []
    for i, x in enumerate(a):
        while st and a[st[-1]] < x:
            ans[st.pop()] = x
        st.append(i)
    return ans`,
      tests: [["[2, 1, 2, 4, 3]", "[4, 2, 4, -1, -1]"], ["[5, 4, 3]", "[-1, -1, -1]"], ["[]", "[]"]] }
  },
  problems: [
    { id: "bigger-later", title: "Bigger Later", d: "Easy", lc: "next-greater-element-i",
      statement: "`big` has distinct values and `small` is a subset of `big`. For each value x in `small`, find x in `big` and return the first value to its **right** in `big` that is greater than x, or -1.",
      examples: [["[4, 1, 2], [1, 3, 4, 2]", "[-1, 3, -1]", ""], ["[2, 4], [1, 2, 3, 4]", "[3, -1]", ""]],
      constraints: ["1 ≤ len(small) ≤ len(big) ≤ 10⁵", "values are distinct"],
      hints: ["Compute the next greater element for every value of `big` once.", "Store the answers in a dict value → next greater."],
      solution: `def bigger_later(small, big):
    nxt, st = {}, []
    for x in big:
        while st and st[-1] < x:
            nxt[st.pop()] = x
        st.append(x)
    return [nxt.get(x, -1) for x in small]`,
      why: "One monotonic pass over `big` answers every value; the dict makes lookups O(1).", time: "O(n)",
      hidden: [["[1], [1]", "[-1]"], ["[3, 1], [1, 2, 3]", "[-1, 2]"], ["list(range(100000)), list(range(100000))", "list(range(1, 100000)) + [-1]"]] },
    { id: "warmer-wait", title: "Wait for Warmth", d: "Medium", lc: "daily-temperatures",
      statement: "For each day in `temps`, return how many days you'd wait for a strictly warmer temperature. Use 0 if no warmer day comes.",
      examples: [["[73, 74, 75, 71, 69, 72, 76, 73]", "[1, 1, 4, 2, 1, 1, 0, 0]", ""], ["[30, 60, 90]", "[1, 1, 0]", ""]],
      constraints: ["1 ≤ len(temps) ≤ 10⁵", "30 ≤ temps[i] ≤ 100"],
      hints: ["Days still waiting for a warmer day form a decreasing stack.", "Store indices so you can compute the wait."],
      solution: `def warmer_wait(temps):
    ans, st = [0] * len(temps), []
    for i, x in enumerate(temps):
        while st and temps[st[-1]] < x:
            j = st.pop()
            ans[j] = i - j
        st.append(i)
    return ans`,
      why: "Each day is pushed once and popped once, exactly when its warmer day arrives.", time: "O(n)",
      hidden: [["[50]", "[0]"], ["[90, 80, 70]", "[0, 0, 0]"], ["list(range(30, 100)) * 1000", "([1] * 69 + [0]) * 1000"]] },
    { id: "ring-bigger", title: "Bigger Around the Ring", d: "Medium", lc: "next-greater-element-ii",
      statement: "`nums` is circular (after the last element comes the first). For each element, return the first greater value found going forward around the ring, or -1.",
      examples: [["[1, 2, 1]", "[2, -1, 2]", ""], ["[1, 2, 3, 4, 3]", "[2, 3, 4, -1, 4]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁴", "−10⁹ ≤ nums[i] ≤ 10⁹"],
      hints: ["Walk the array twice using i % n.", "Push indices only during the first pass."],
      solution: `def ring_bigger(nums):
    n = len(nums)
    ans, st = [-1] * n, []
    for i in range(2 * n):
        x = nums[i % n]
        while st and nums[st[-1]] < x:
            ans[st.pop()] = x
        if i < n:
            st.append(i)
    return ans`,
      why: "The second pass lets elements near the end find answers near the start.", time: "O(n)",
      hidden: [["[5]", "[-1]"], ["[3, 3]", "[-1, -1]"], ["list(range(10000))", "list(range(1, 10000)) + [-1]"]] },
    { id: "price-streak", title: "Price Streak", d: "Medium", lc: "online-stock-span",
      statement: "For each day, the *span* is the number of consecutive days up to and including today whose price was **at most** today's price. Return the span for every day.",
      examples: [["[100, 80, 60, 70, 60, 75, 85]", "[1, 1, 1, 2, 1, 4, 6]", ""], ["[10, 10, 10]", "[1, 2, 3]", ""]],
      constraints: ["1 ≤ len(prices) ≤ 10⁵"],
      hints: ["Looking left, you stop at the previous strictly greater price.", "Keep a decreasing stack of (price, span) and merge the spans you pop."],
      solution: `def price_streak(prices):
    st, out = [], []
    for p in prices:
        span = 1
        while st and st[-1][0] <= p:
            span += st.pop()[1]
        st.append((p, span))
        out.append(span)
    return out`,
      why: "Popped days are covered by today's span, so their spans add up; each day is popped once.", time: "O(n)",
      hidden: [["[5]", "[1]"], ["[1, 2, 3]", "[1, 2, 3]"], ["list(range(100000))", "list(range(1, 100001))"]] },
    { id: "trim-digits", title: "Trim the Number", d: "Medium", lc: "remove-k-digits",
      statement: "`num` is a non-negative integer as a string. Remove exactly `k` digits so the remaining number is as **small** as possible. Return it without leading zeros (`'0'` if nothing is left).",
      examples: [["'1432219', 3", "'1219'", ""], ["'10200', 1", "'200'", ""], ["'10', 2", "'0'", ""]],
      constraints: ["1 ≤ k ≤ len(num) ≤ 10⁵"],
      hints: ["A digit followed by a smaller digit should be removed first.", "Keep an increasing stack, popping while k > 0 and the top is bigger.", "If k is left over, drop digits from the end."],
      solution: `def trim_digits(num, k):
    st = []
    for d in num:
        while k and st and st[-1] > d:
            st.pop()
            k -= 1
        st.append(d)
    if k:
        st = st[:-k]
    return "".join(st).lstrip("0") or "0"`,
      why: "Removing the first digit that's bigger than its successor always lowers the number most; the stack does this greedily.", time: "O(n)",
      hidden: [["'9', 1", "'0'"], ["'112', 1", "'11'"], ["'9' * 50000 + '1' * 50000, 50000", "'1' * 50000"]] },
    { id: "min-sum-all", title: "Sum of Every Minimum", d: "Medium", lc: "sum-of-subarray-minimums",
      statement: "Return the sum of `min(sub)` over **every** contiguous subarray `sub` of `nums`, modulo 10⁹ + 7.",
      examples: [["[3, 1, 2, 4]", "17", "Minimums: 3,1,2,4,1,1,2,1,1,1"], ["[11, 81, 94, 43, 3]", "444", ""]],
      constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "1 ≤ nums[i] ≤ 3·10⁴"],
      hints: ["Count how many subarrays have nums[i] as their minimum.", "That's (distance to previous smaller) × (distance to next smaller-or-equal).", "Find both with monotonic stacks."],
      solution: `def min_sum_all(nums):
    n, MOD = len(nums), 10**9 + 7
    left, right = [0] * n, [0] * n
    st = []
    for i in range(n):
        while st and nums[st[-1]] > nums[i]:
            st.pop()
        left[i] = i - st[-1] if st else i + 1
        st.append(i)
    st = []
    for i in range(n - 1, -1, -1):
        while st and nums[st[-1]] >= nums[i]:
            st.pop()
        right[i] = st[-1] - i if st else n - i
        st.append(i)
    return sum(nums[i] * left[i] * right[i] for i in range(n)) % MOD`,
      why: "Each element's contribution is its value times the number of subarrays where it's the (leftmost) minimum; strict/non-strict comparisons avoid double counting ties.", time: "O(n)",
      hidden: [["[5]", "5"], ["[2, 2]", "6"], ["[1] * 30000", "450015000"]] },
    { id: "biggest-billboard", title: "Biggest Billboard", d: "Hard", lc: "largest-rectangle-in-histogram",
      statement: "Bars of width 1 have heights `h`. Return the area of the largest rectangle that fits entirely under the bars.",
      examples: [["[2, 1, 5, 6, 2, 3]", "10", "Bars 5 and 6, height 5."], ["[2, 4]", "4", ""]],
      constraints: ["1 ≤ len(h) ≤ 10⁵", "0 ≤ h[i] ≤ 10⁴"],
      hints: ["For each bar, the best rectangle of exactly its height spans to the nearest lower bar on each side.", "Keep an increasing stack; when a lower bar arrives, popped bars know their right limit.", "The new top of the stack is the left limit. Add a 0 at the end to flush."],
      solution: `def biggest_billboard(h):
    st, best = [], 0
    for i, x in enumerate(h + [0]):
        while st and h[st[-1]] >= x:
            height = h[st.pop()]
            left = st[-1] + 1 if st else 0
            best = max(best, height * (i - left))
        st.append(i)
    return best`,
      why: "Each bar is popped once, at which point both of its limits are known.", time: "O(n)",
      hidden: [["[0]", "0"], ["[3, 3, 3]", "9"], ["list(range(1, 100001))", "2500050000"], ["[10000] * 100000", "1000000000"]] },
    { id: "biggest-empty-lot", title: "Biggest Empty Lot", d: "Hard", lc: "maximal-rectangle",
      statement: "`grid` is a list of strings of `'0'` and `'1'` (1 = empty land). Return the area of the largest rectangle containing only `'1'`s.",
      examples: [["['10100', '10111', '11111', '10010']", "6", ""], ["['0']", "0", ""], ["['1']", "1", ""]],
      constraints: ["1 ≤ rows, cols ≤ 200"],
      hints: ["Treat each row as the ground of a histogram.", "heights[c] = consecutive 1s ending at this row in column c.", "Run the largest-rectangle-in-histogram stack on each row."],
      solution: `def biggest_empty_lot(grid):
    cols = len(grid[0])
    heights = [0] * cols
    best = 0
    for row in grid:
        for c in range(cols):
            heights[c] = heights[c] + 1 if row[c] == "1" else 0
        st = []
        for i, x in enumerate(heights + [0]):
            while st and heights[st[-1]] >= x:
                height = heights[st.pop()]
                left = st[-1] + 1 if st else 0
                best = max(best, height * (i - left))
            st.append(i)
    return best`,
      why: "Every rectangle has a bottom row; for that row it's a histogram rectangle, which the stack finds in O(cols).", time: "O(rows · cols)",
      hidden: [["['01', '10']", "1"], ["['111', '111']", "6"], ["['1' * 200] * 200", "40000"]] }
  ]
});
