PAT("monotonic-deque", {
  time: "O(n)", space: "O(k)",
  lede: "A deque of indices kept in decreasing (or increasing) value order. The front is always the current window's maximum (or minimum); old indices drop off the front, dominated ones drop off the back.",
  idea: "For each window you want the max. A heap works in O(n log n). Better: if a newer element is bigger than an older one, the older one can **never** be a window max again (the newer one outlives it), so throw it away from the back. The deque then stays decreasing, its front is the max, and you pop the front when it slides out of the window. Every index enters and leaves once: O(n).",
  analogy: "A queue of job candidates ranked by skill: when a stronger, younger candidate arrives, every weaker, older one behind them in line will never be picked, so they leave. The front of the line is always the best still eligible.",
  signals: [["“Maximum / minimum of every window of size k”", "sliding window max"], ["Longest window where max − min ≤ limit", "two deques"], ["DP where `dp[i]` = best of the last k values + something", "deque-optimised DP"], ["Shortest subarray with sum ≥ k **with negatives**", "deque over prefix sums"]],
  not: "**Not this pattern** when you need next greater/smaller for each element without a window (→ monotonic stack), or window sums/counts (→ plain sliding window).",
  templates: [
    ["Window max", "window_max.py", `from collections import deque

def window_max(a, k):
    dq, out = deque(), []              # indices; values decreasing
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:   # dominated: never the max again
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:             # front slid out of the window
            dq.popleft()
        if i >= k - 1:
            out.append(a[dq[0]])
    return out

print(window_max([1, 3, -1, -3, 5, 3, 6, 7], 3))`, "[3, 3, 5, 5, 6, 7]"],
    ["Deque DP", "deque_dp.py", `from collections import deque

def best_jump_score(nums, k):          # dp[i] = nums[i] + max(dp[i-k..i-1])
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dq = deque([0])
    for i in range(1, len(nums)):
        if dq[0] < i - k:
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[-1]

print(best_jump_score([1, -1, -2, 4, -7, 3], 2))`, "7"]
  ],
  examples: [
    { t: "Sliding Window Maximum", d: "Hard", lc: "sliding-window-maximum", f: "Decreasing deque",
      q: "Return the max of every window of size k.",
      idea: "Front = max. Pop the back while it's ≤ the new value; pop the front when it leaves the window.",
      code: `from collections import deque

def max_sliding(a, k):
    dq, out = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x: dq.pop()
        dq.append(i)
        if dq[0] == i - k: dq.popleft()
        if i >= k - 1: out.append(a[dq[0]])
    return out

print(max_sliding([9, 11], 2), max_sliding([4, 2, 12, 3], 1))`, out: "[11] [4, 2, 12, 3]", cx: "O(n)" },
    { t: "Longest Subarray With Absolute Diff ≤ Limit", d: "Medium", lc: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit", f: "Two deques",
      q: "Longest subarray where max − min ≤ limit.",
      idea: "Variable window; a decreasing deque gives its max and an increasing deque its min.",
      code: `from collections import deque

def longest(nums, limit):
    mx, mn = deque(), deque()
    l = best = 0
    for r, x in enumerate(nums):
        while mx and mx[-1] < x: mx.pop()
        while mn and mn[-1] > x: mn.pop()
        mx.append(x); mn.append(x)
        while mx[0] - mn[0] > limit:
            if mx[0] == nums[l]: mx.popleft()
            if mn[0] == nums[l]: mn.popleft()
            l += 1
        best = max(best, r - l + 1)
    return best

print(longest([8, 2, 4, 7], 4), longest([10, 1, 2, 4, 7, 2], 5))`, out: "2 4", cx: "O(n)" },
    { t: "Jump Game VI", d: "Medium", lc: "jump-game-vi", f: "Deque DP",
      q: "Jump 1..k steps forward each time; maximise the sum of visited values from first to last.",
      idea: "dp[i] = nums[i] + max of the previous k dp values; a deque keeps that max in O(1).",
      code: `from collections import deque

def max_result(nums, k):
    dq = deque([(0, nums[0])])
    for i in range(1, len(nums)):
        while dq[0][0] < i - k: dq.popleft()
        v = nums[i] + dq[0][1]
        while dq and dq[-1][1] <= v: dq.pop()
        dq.append((i, v))
    return dq[-1][1]

print(max_result([10, -5, -2, 4, 0, 3], 3))`, out: "17", cx: "O(n)" }
  ],
  pitfalls: [
    ["Storing values instead of indices", "You need indices to know when the front has left the window."],
    ["Checking expiry with the wrong bound", "Front leaves when `dq[0] <= i − k` (window is i−k+1..i)."],
    ["Using a heap and forgetting stale entries", "A heap needs lazy deletion; the deque handles expiry naturally."],
    ["`<` vs `<=` when popping the back", "Either works for max values; `<=` keeps the deque smaller."]
  ],
  edge: ["k = 1", "k equals the array length", "Decreasing input (deque grows)", "All equal values", "Negative numbers"],
  compare: [
    ["Monotonic Stack", "monotonic-stack", "Same “drop dominated elements” idea, but a stack has no window to expire from the front."],
    ["Fixed Sliding Window", "sliding-window-fixed", "Window sums and counts don't need a deque; max/min do."],
    ["Top-K / Heaps", "top-k", "A heap also gives window max in O(n log n) with lazy deletion; the deque is O(n)."]
  ],
  mcq: [
    ["In a window-max deque, why pop the back while `a[back] <= x`?", ["To keep it sorted alphabetically", "Those elements are older and not bigger, so they can never be a window max again", "To save memory only", "It's required by deque"], 1, "x will stay in every future window those elements are in, and it's at least as big."],
    ["When does the front index leave a size-k window ending at i?", ["dq[0] < i", "dq[0] <= i − k", "dq[0] == i − 1", "Never"], 1, "The window is i−k+1..i, so index i−k (or older) has left."]
  ],
  summary: {
    oneLine: "Deque of indices in decreasing value order: front = window max; drop expired from the front, dominated from the back.",
    signals: ["Max / min of every window", "max − min ≤ limit windows", "DP over the last k states", "Shortest subarray sum ≥ k with negatives"],
    template: `dq = deque()
for i, x in enumerate(a):
    while dq and a[dq[-1]] <= x:
        dq.pop()
    dq.append(i)
    if dq[0] <= i - k:
        dq.popleft()
    if i >= k - 1:
        out.append(a[dq[0]])`,
    pitfalls: ["Store indices", "Expire when dq[0] <= i − k", "Heaps need lazy deletion"],
    cx: "O(n) time · O(k) space",
    drill: { task: "Return the maximum of every window of size `k`.",
      ref: `def window_max(a, k):
    dq, out = deque(), []
    for i, x in enumerate(a):
        while dq and a[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(a[dq[0]])
    return out`,
      tests: [["[1, 3, -1, -3, 5, 3, 6, 7], 3", "[3, 3, 5, 5, 6, 7]"], ["[1], 1", "[1]"], ["[4, 3, 2, 1], 2", "[4, 3, 2]"]] }
  },
  problems: [
    { id: "first-dip", title: "First Dip in Each Window", d: "Easy", lc: "sliding-window-maximum",
      statement: "For every window of `k` consecutive values, return the **first negative** value in that window, or 0 if it has none.",
      examples: [["[-8, 2, 3, -6, 10], 2", "[-8, 0, -6, -6]", ""], ["[12, -1, -7, 8, -15, 30, 16, 28], 3", "[-1, -1, -7, -15, -15, 0]", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵"],
      hints: ["Keep a queue of indices of negative numbers in the window, oldest first.", "Drop the front when it leaves the window; the front is the answer."],
      solution: `from collections import deque

def first_dip(nums, k):
    q, out = deque(), []
    for i, x in enumerate(nums):
        if x < 0:
            q.append(i)
        if q and q[0] <= i - k:
            q.popleft()
        if i >= k - 1:
            out.append(nums[q[0]] if q else 0)
    return out`,
      why: "Negatives enter at the back and leave from the front exactly once, so each window is answered in O(1).", time: "O(n)",
      hidden: [["[1, 2, 3], 1", "[0, 0, 0]"], ["[-1], 1", "[-1]"], ["[-1, 1] * 50000, 2", "[-1] * 99999"]] },
    { id: "window-lows", title: "Window Lows", d: "Medium", lc: "sliding-window-maximum",
      statement: "Return the **minimum** of every window of `k` consecutive values.",
      examples: [["[4, 2, 12, 11, -5], 2", "[2, 2, 11, -5]", ""], ["[1, 3, -1, -3, 5, 3, 6, 7], 3", "[-1, -3, -3, -3, 3, 3]", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵"],
      hints: ["Mirror the window-max deque: keep values increasing.", "Pop the back while it's ≥ the new value; expire the front."],
      solution: `from collections import deque

def window_lows(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] >= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      why: "An increasing deque keeps the window minimum at the front with O(1) amortised work per step.", time: "O(n)",
      hidden: [["[5], 1", "[5]"], ["[3, 2, 1], 3", "[1]"], ["list(range(100000)), 1000", "list(range(99001))"]] },
    { id: "window-peaks", title: "Window Peaks", d: "Hard", lc: "sliding-window-maximum",
      statement: "Return the **maximum** of every window of `k` consecutive values, in O(n).",
      examples: [["[1, 3, -1, -3, 5, 3, 6, 7], 3", "[3, 3, 5, 5, 6, 7]", ""], ["[1], 1", "[1]", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["A newer, bigger value makes older smaller values useless.", "Keep a deque of indices with decreasing values; the front is the max.", "Expire the front when it's out of the window."],
      solution: `from collections import deque

def window_peaks(nums, k):
    dq, out = deque(), []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
      why: "Each index is appended and removed at most once, giving O(n) for all windows.", time: "O(n)",
      hidden: [["[7, 2, 4], 2", "[7, 4]"], ["[1, -1], 1", "[1, -1]"], ["list(range(100000, 0, -1)), 50000", "list(range(100000, 49999, -1))"]] },
    { id: "steady-stretch", title: "Steady Stretch", d: "Medium", lc: "longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit",
      statement: "Return the length of the longest contiguous stretch in which `max − min ≤ limit`.",
      examples: [["[8, 2, 4, 7], 4", "2", ""], ["[10, 1, 2, 4, 7, 2], 5", "4", "[2, 4, 7, 2]"], ["[4, 2, 2, 2, 4, 4, 2, 2], 0", "3", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "0 ≤ limit ≤ 10⁹"],
      hints: ["Variable sliding window: shrink while max − min > limit.", "You need the window's max and min quickly: one decreasing deque and one increasing deque."],
      solution: `from collections import deque

def steady_stretch(nums, limit):
    mx, mn = deque(), deque()
    l = best = 0
    for r, x in enumerate(nums):
        while mx and mx[-1] < x:
            mx.pop()
        while mn and mn[-1] > x:
            mn.pop()
        mx.append(x)
        mn.append(x)
        while mx[0] - mn[0] > limit:
            if mx[0] == nums[l]:
                mx.popleft()
            if mn[0] == nums[l]:
                mn.popleft()
            l += 1
        best = max(best, r - l + 1)
    return best`,
      why: "The two deques give the window's max and min in O(1), so the variable window stays O(n).", time: "O(n)",
      hidden: [["[1], 0", "1"], ["[1, 5, 1, 5], 3", "1"], ["list(range(100000)), 999", "1000"]] },
    { id: "hop-score", title: "Hop Score", d: "Medium", lc: "jump-game-vi",
      statement: "Start on index 0 of `nums`. Each move jumps forward 1 to `k` steps. Your score is the sum of every value you land on, including the first and the last index (you must finish on the last index). Return the maximum score.",
      examples: [["[1, -1, -2, 4, -7, 3], 2", "7", "1 → −1 → 4 → 3"], ["[10, -5, -2, 4, 0, 3], 3", "17", ""]],
      constraints: ["1 ≤ len(nums), k ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["dp[i] = nums[i] + max(dp[i−k..i−1]).", "Computing that max naively is O(k) per index.", "Keep a deque of indices with decreasing dp values."],
      solution: `from collections import deque

def hop_score(nums, k):
    dp = [0] * len(nums)
    dp[0] = nums[0]
    dq = deque([0])
    for i in range(1, len(nums)):
        if dq[0] < i - k:
            dq.popleft()
        dp[i] = nums[i] + dp[dq[0]]
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return dp[-1]`,
      why: "The deque supplies the best of the last k dp values in O(1), turning O(nk) DP into O(n).", time: "O(n)",
      hidden: [["[5], 3", "5"], ["[1, -5, -20, 4, -1, 3, -6, -3], 2", "0"], ["[-1] * 100000, 100000", "-2"]] },
    { id: "short-surplus", title: "Shortest Surplus", d: "Hard", lc: "shortest-subarray-with-sum-at-least-k",
      statement: "Values may be **negative**. Return the length of the shortest non-empty contiguous subarray with sum at least `k`, or -1 if none exists.",
      examples: [["[1], 1", "1", ""], ["[1, 2], 4", "-1", ""], ["[2, -1, 2], 3", "3", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−10⁵ ≤ nums[i] ≤ 10⁵", "1 ≤ k ≤ 10⁹"],
      hints: ["Negatives break the plain sliding window.", "Use prefix sums P: you want the closest j < i with P[i] − P[j] ≥ k.", "Keep a deque of indices with increasing P. Pop the front while it satisfies the condition (record), pop the back while P[back] ≥ P[i]."],
      solution: `from collections import deque

def short_surplus(nums, k):
    P = [0]
    for x in nums:
        P.append(P[-1] + x)
    best = len(nums) + 1
    dq = deque()
    for i, p in enumerate(P):
        while dq and p - P[dq[0]] >= k:
            best = min(best, i - dq.popleft())
        while dq and P[dq[-1]] >= p:
            dq.pop()
        dq.append(i)
    return best if best <= len(nums) else -1`,
      why: "A later, smaller prefix is always a better start than an earlier, larger one, so the deque stays increasing; each front pop is the best possible use of that start.", time: "O(n)",
      hidden: [["[84, -37, 32, 40, 95], 167", "3"], ["[-1, -1], 1", "-1"], ["[1] * 100000, 100000", "100000"], ["[-5] * 50000 + [10] + [-5] * 49999, 10", "1"]] },
    { id: "spaced-picks", title: "Spaced Picks", d: "Hard", lc: "constrained-subsequence-sum",
      statement: "Pick a non-empty subsequence of `nums` such that any two consecutive picks are at most `k` positions apart. Return the maximum possible sum.",
      examples: [["[10, 2, -10, 5, 20], 2", "37", "10, 2, 5, 20"], ["[-1, -2, -3], 1", "-1", ""], ["[10, -2, -10, -5, 20], 2", "23", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["dp[i] = best sum of a valid subsequence ending at i.", "dp[i] = nums[i] + max(0, max(dp[i−k..i−1])).", "A decreasing deque of dp indices gives that max in O(1)."],
      solution: `from collections import deque

def spaced_picks(nums, k):
    dp = nums[:]
    dq = deque()
    for i in range(len(nums)):
        if dq and dq[0] < i - k:
            dq.popleft()
        if dq:
            dp[i] = nums[i] + max(0, dp[dq[0]])
        while dq and dp[dq[-1]] <= dp[i]:
            dq.pop()
        dq.append(i)
    return max(dp)`,
      why: "Taking max(0, …) lets a subsequence start fresh; the deque keeps the window max of dp in O(1).", time: "O(n)",
      hidden: [["[5], 1", "5"], ["[-5, 3], 1", "3"], ["[1] * 100000, 1", "100000"], ["[-1] * 100000, 100000", "-1"]] }
  ]
});
