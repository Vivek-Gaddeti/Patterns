PAT("kadane", {
  time: "O(n)", space: "O(1)",
  lede: "For every index, keep the best subarray that ends right there: either extend the previous one or start fresh. The answer is the best of those.",
  idea: "Any subarray ends somewhere. If you know the best sum ending at i − 1, the best ending at i is `max(x, best_prev + x)`: a negative running sum only drags you down, so drop it and restart. This is 1-D DP with O(1) memory.",
  analogy: "Walking a path collecting coins and paying tolls. Whenever your running purse goes negative, you'd be better off pretending you just started walking here.",
  signals: [["“Maximum (or minimum) sum of a **contiguous** subarray”", "classic Kadane"], ["Best single buy/sell, biggest gain over a stretch", "Kadane on differences, or min-so-far"], ["Maximum **product** subarray", "track both max and min ending here"], ["Circular array, or one deletion allowed", "Kadane + a twist"]],
  not: "**Not this pattern** when the subarray must satisfy a size or sum limit (→ sliding window), or elements needn't be contiguous (→ DP / greedy).",
  templates: [
    ["Max subarray", "kadane.py", `def max_subarray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)          # extend, or start fresh at x
        best = max(best, cur)
    return best

print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`, "6"],
    ["Max product", "max_product.py", `def max_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        if x < 0:
            hi, lo = lo, hi            # a negative flips max and min
        hi = max(x, hi * x)
        lo = min(x, lo * x)
        best = max(best, hi)
    return best

print(max_product([2, 3, -2, 4]), max_product([-2, 3, -4]))`, "6 24"]
  ],
  examples: [
    { t: "Maximum Subarray", d: "Medium", lc: "maximum-subarray", f: "Classic",
      q: "Largest sum of any non-empty contiguous subarray.",
      idea: "`cur = max(x, cur + x)`: extend or restart. Track the best.",
      code: `def max_sub(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best

print(max_sub([5, 4, -1, 7, 8]), max_sub([-3, -1, -2]))`, out: "23 -1", cx: "O(n) time · O(1) space" },
    { t: "Best Time to Buy and Sell Stock", d: "Easy", lc: "best-time-to-buy-and-sell-stock", f: "Min so far",
      q: "One buy, then one later sell. Maximum profit (0 if none).",
      idea: "Track the cheapest price so far; profit today = price − cheapest.",
      code: `def max_profit(prices):
    low, best = float("inf"), 0
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best

print(max_profit([7, 1, 5, 3, 6, 4]))`, out: "5", cx: "O(n)" },
    { t: "Maximum Sum Circular Subarray", d: "Medium", lc: "maximum-sum-circular-subarray", f: "Circular",
      q: "Same, but the subarray may wrap around the end.",
      idea: "A wrapping subarray = total − (a minimum middle subarray). Answer = max(normal Kadane, total − min Kadane), unless all numbers are negative.",
      code: `def max_circular(nums):
    cur_max = cur_min = 0
    best, worst, total = nums[0], nums[0], 0
    for x in nums:
        cur_max = max(x, cur_max + x); best = max(best, cur_max)
        cur_min = min(x, cur_min + x); worst = min(worst, cur_min)
        total += x
    return best if best < 0 else max(best, total - worst)

print(max_circular([5, -3, 5]), max_circular([-3, -2, -3]))`, out: "10 -2", cx: "O(n)" },
    { t: "Maximum Product Subarray", d: "Medium", lc: "maximum-product-subarray", f: "Max & min",
      q: "Largest product of a contiguous subarray.",
      idea: "A negative number turns the smallest product into the largest, so track both.",
      code: `def max_prod(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        cand = (x, hi * x, lo * x)
        hi, lo = max(cand), min(cand)
        best = max(best, hi)
    return best

print(max_prod([2, 3, -2, 4]))`, out: "6", cx: "O(n)" }
  ],
  pitfalls: [
    ["Initialising `best = 0`", "If every number is negative the answer is the largest negative, not 0."],
    ["Forgetting the min for products", "Two negatives make a big positive; you need the smallest product too."],
    ["Circular: all negative numbers", "`total − worst` would be 0 (empty subarray). Return the normal Kadane answer instead."],
    ["Thinking it handles non-contiguous picks", "Kadane is only for contiguous subarrays."]
  ],
  edge: ["All negative", "Single element", "Zeros in a product question", "Whole array is the answer", "Prices only fall (profit 0)"],
  compare: [
    ["1-D DP", "dp-1d", "Kadane *is* DP: dp[i] = best ending at i, compressed to one variable."],
    ["Prefix Sum", "prefix-sum", "Max subarray also equals max(pre[j] − min pre[i] for i < j), the same idea seen from prefix sums."],
    ["Sliding Window", "sliding-window-variable", "If the subarray has a length or sum limit, use a window; Kadane has no constraint."]
  ],
  mcq: [
    ["Kadane's update for “best sum ending at i”?", ["cur = cur + x", "cur = max(x, cur + x)", "cur = max(cur, x)", "cur = x"], 1, "Either extend the previous best or start fresh at x."],
    ["Why track the minimum product in Maximum Product Subarray?", ["To handle zeros", "A negative number turns the minimum into the maximum", "To find the answer faster", "It's not needed"], 1, "min × negative can become the new maximum."]
  ],
  summary: {
    oneLine: "Best subarray ending here = max(x, best ending before + x).",
    signals: ["Max / min sum of a contiguous subarray", "One buy + one sell", "Max product subarray (track min too)", "Circular or one-deletion variants"],
    template: `cur = best = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)
    best = max(best, cur)`,
    pitfalls: ["Don't start best at 0", "Products: track max and min", "Circular: handle all-negative"],
    cx: "O(n) time · O(1) space",
    drill: { task: "Return the largest sum of any non-empty contiguous subarray.",
      ref: `def max_sub(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      tests: [["[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "6"], ["[-3, -1, -2]", "-1"], ["[7]", "7"]] }
  },
  problems: [
    { id: "one-trade", title: "One Trade", d: "Easy", lc: "best-time-to-buy-and-sell-stock",
      statement: "`prices[i]` is a share price on day i. Buy once and sell once **on a later day**. Return the maximum profit, or 0 if no profit is possible.",
      examples: [["[7, 1, 5, 3, 6, 4]", "5", "Buy at 1, sell at 6."], ["[7, 6, 4, 3, 1]", "0", ""]],
      constraints: ["1 ≤ len(prices) ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
      hints: ["For each day, what's the best day to have bought before it?", "Keep the minimum price seen so far."],
      solution: `def one_trade(prices):
    low, best = float("inf"), 0
    for p in prices:
        low = min(low, p)
        best = max(best, p - low)
    return best`,
      why: "The best sale on day i uses the cheapest earlier price, tracked in one variable.", time: "O(n)",
      hidden: [["[1]", "0"], ["[2, 4, 1]", "2"], ["list(range(100000, 0, -1))", "0"], ["list(range(100000))", "99999"]] },
    { id: "coldest-stretch", title: "Coldest Stretch", d: "Easy", lc: "maximum-subarray",
      statement: "`temps` holds daily temperature changes. Return the **smallest** possible sum of a non-empty run of consecutive days.",
      examples: [["[3, -4, 2, -3, -1, 7, -5]", "-6", "−4 + 2 − 3 − 1"], ["[2, 3, 1]", "1", ""]],
      constraints: ["1 ≤ len(temps) ≤ 10⁵", "−10⁴ ≤ temps[i] ≤ 10⁴"],
      hints: ["This is Kadane with min instead of max.", "cur = min(x, cur + x)."],
      solution: `def coldest(temps):
    cur = best = temps[0]
    for x in temps[1:]:
        cur = min(x, cur + x)
        best = min(best, cur)
    return best`,
      why: "Mirror image of Kadane: a positive running sum only hurts, so restart when it would.", time: "O(n)",
      hidden: [["[5]", "5"], ["[-1, -1, -1]", "-3"], ["[1, -1] * 50000", "-1"]] },
    { id: "best-stretch", title: "Best Stretch", d: "Medium", lc: "maximum-subarray",
      statement: "Return the largest sum of any non-empty contiguous subarray of `nums`.",
      examples: [["[-2, 1, -3, 4, -1, 2, 1, -5, 4]", "6", "[4, −1, 2, 1]"], ["[1]", "1", ""], ["[5, 4, -1, 7, 8]", "23", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["Think about the best subarray that ends at each index.", "It either extends the previous one or starts fresh.", "Don't initialise the best to 0."],
      solution: `def best_stretch(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best`,
      why: "Kadane: a negative running sum can only lower future sums, so it's dropped.", time: "O(n)",
      hidden: [["[-5, -2, -9]", "-2"], ["[0, 0, 0]", "0"], ["[1] * 100000", "100000"], ["[-1, 3, -1, 3, -1]", "5"]] },
    { id: "biggest-product", title: "Biggest Product", d: "Medium", lc: "maximum-product-subarray",
      statement: "Return the largest product of any non-empty contiguous subarray. Values may be negative or zero.",
      examples: [["[2, 3, -2, 4]", "6", "[2, 3]"], ["[-2, 0, -1]", "0", ""], ["[-2, 3, -4]", "24", ""]],
      constraints: ["1 ≤ len(nums) ≤ 2·10⁴", "−10 ≤ nums[i] ≤ 10", "the answer fits easily in Python ints"],
      hints: ["A negative times the smallest product can become the largest.", "Track the max and min product ending at each index."],
      solution: `def biggest_product(nums):
    hi = lo = best = nums[0]
    for x in nums[1:]:
        cand = (x, hi * x, lo * x)
        hi, lo = max(cand), min(cand)
        best = max(best, hi)
    return best`,
      why: "Keeping both extremes covers sign flips; zeros reset both through the `x` candidate.", time: "O(n)",
      hidden: [["[0]", "0"], ["[-3]", "-3"], ["[-1, -1] * 20 + [0] * 19000", "1"], ["[2, -5, -2, -4, 3]", "24"]] },
    { id: "ring-best", title: "Best Stretch on a Ring", d: "Medium", lc: "maximum-sum-circular-subarray",
      statement: "`nums` is arranged in a circle (the end wraps to the start). Return the largest sum of a non-empty contiguous stretch; each element can be used at most once.",
      examples: [["[1, -2, 3, -2]", "3", ""], ["[5, -3, 5]", "10", "5 + 5, wrapping around."], ["[-3, -2, -3]", "-2", ""]],
      constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "−3·10⁴ ≤ nums[i] ≤ 3·10⁴"],
      hints: ["Either the best stretch doesn't wrap (plain Kadane) or it does.", "A wrapping stretch is the total minus some middle stretch: minimise that middle.", "If all numbers are negative, the wrap formula gives an empty stretch: use plain Kadane."],
      solution: `def ring_best(nums):
    cur_max = cur_min = 0
    best, worst, total = nums[0], nums[0], 0
    for x in nums:
        cur_max = max(x, cur_max + x)
        best = max(best, cur_max)
        cur_min = min(x, cur_min + x)
        worst = min(worst, cur_min)
        total += x
    return best if best < 0 else max(best, total - worst)`,
      why: "The two cases (wrapping or not) are each answered by one Kadane pass, max and min.", time: "O(n)",
      hidden: [["[3, -1, 2, -1]", "4"], ["[-2]", "-2"], ["[1] * 30000", "30000"], ["[10, -100] + [1] * 10 + [-100, 10]", "20"]] },
    { id: "loudest-run", title: "Loudest Run", d: "Medium", lc: "maximum-absolute-sum-of-any-subarray",
      statement: "Return the maximum **absolute value** of the sum of any (possibly empty) contiguous subarray. The empty subarray has sum 0.",
      examples: [["[1, -3, 2, 3, -4]", "5", "[2, 3]"], ["[2, -5, 1, -4, 3, -2]", "8", "[−5, 1, −4] sums to −8."]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["The answer is either the biggest sum or the most negative sum.", "Run Kadane for max and for min at the same time."],
      solution: `def loudest_run(nums):
    hi = lo = best = 0
    for x in nums:
        hi = max(0, hi + x)
        lo = min(0, lo + x)
        best = max(best, hi, -lo)
    return best`,
      why: "|sum| is maximised by the largest or the smallest subarray sum; both come from one Kadane pass.", time: "O(n)",
      hidden: [["[0]", "0"], ["[-7]", "7"], ["[-1] * 100000", "100000"]] },
    { id: "skip-one", title: "Best Stretch, One Skip", d: "Medium", lc: "maximum-subarray-sum-with-one-deletion",
      statement: "Return the largest sum of a non-empty contiguous subarray where you **may delete at most one** element (the result must still be non-empty).",
      examples: [["[1, -2, 0, 3]", "4", "Delete −2: [1, 0, 3]."], ["[1, -2, -2, 3]", "3", ""], ["[-1, -1, -1, -1]", "-1", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["Track two Kadane values: best ending here with no deletion, and with one deletion used.", "With one deletion: either delete the current element (take no-delete from before) or extend a previous one-deletion run."],
      solution: `def skip_one(nums):
    keep = nums[0]
    skip = float("-inf")
    best = nums[0]
    for x in nums[1:]:
        skip = max(skip + x, keep)
        keep = max(keep + x, x)
        best = max(best, keep, skip)
    return best`,
      why: "Two states per index (deleted or not) turn the problem into a two-variable Kadane.", time: "O(n)",
      hidden: [["[5]", "5"], ["[2, 1, -2, -5, -2]", "3"], ["[1] * 50000 + [-100] + [1] * 50000", "100000"]] },
    { id: "best-block", title: "Best Block in a Grid", d: "Hard", lc: "max-sum-of-rectangle-no-larger-than-k",
      statement: "Return the largest sum of any non-empty rectangle (contiguous rows and contiguous columns) in `grid`.",
      examples: [["[[1, -2, -1], [-3, 4, 2], [1, 2, -1]]", "7", "Rows 1–2, cols 1–2: 4 + 2 + 2 − 1."], ["[[-5]]", "-5", ""]],
      constraints: ["1 ≤ rows, cols ≤ 100", "−100 ≤ grid[i][j] ≤ 100"],
      hints: ["Fix a top row and a bottom row.", "Squash the rows between them into one array of column sums.", "Run Kadane on that array."],
      solution: `def best_block(grid):
    m, n = len(grid), len(grid[0])
    best = grid[0][0]
    for top in range(m):
        col = [0] * n
        for bottom in range(top, m):
            for j in range(n):
                col[j] += grid[bottom][j]
            cur = col[0]
            best = max(best, cur)
            for v in col[1:]:
                cur = max(v, cur + v)
                best = max(best, cur)
    return best`,
      why: "O(m²) row pairs, each reduced to a 1-D Kadane in O(n): O(m²n) overall.", time: "O(m² · n)",
      hidden: [["[[1, 2], [3, 4]]", "10"], ["[[-1, -2], [-3, -4]]", "-1"], ["[[1] * 80 for _ in range(80)]", "6400"]] }
  ]
});
