PAT("prefix-sum", {
  time: "O(n)", space: "O(n)",
  lede: "One pass of running totals turns any range sum into a single subtraction. Add a hash map and you can count subarrays with a given sum in O(n).",
  idea: "Let `pre[i]` be the sum of the first i numbers. Then the sum of `nums[l..r]` is `pre[r + 1] − pre[l]`. Range queries become O(1). Flip it around: a subarray ending here sums to k exactly when an **earlier** prefix equals `current − k`, which a hash map counts instantly.",
  analogy: "Your bank statement shows the balance after every transaction. To know how much you spent between two dates, you don't add up the transactions; you subtract two balances.",
  flavours: [["Flavour", "Store", "Use it for"], [
    ["**Prefix array**", "`pre[i+1] = pre[i] + nums[i]`", "many range-sum queries"],
    ["**Prefix + count map**", "`seen[sum] = how often`", "count subarrays with sum k (negatives OK)"],
    ["**Prefix + first index**", "`first[sum] = earliest i`", "longest subarray with sum k"],
    ["**Prefix mod k**", "`seen[sum % k]`", "subarray sum divisible by k"]]],
  signals: [["Many **range sum** queries on a fixed array", "answer each in O(1)"], ["“Number of subarrays whose sum equals k”", "especially when values can be **negative**"], ["“Sum divisible by k”, “equal number of 0s and 1s”", "transform, then look for equal prefixes"], ["2-D: sum of any rectangle in a grid", "2-D prefix table"]],
  not: "**Not this pattern** when all values are positive and you want the longest/shortest window under a limit: a sliding window is simpler and O(1) space.",
  templates: [
    ["Range queries", "range_sum.py", `def build(nums):
    pre = [0]
    for x in nums:
        pre.append(pre[-1] + x)        # pre[i] = sum of first i numbers
    return pre

def range_sum(pre, l, r):              # sum of nums[l..r], inclusive
    return pre[r + 1] - pre[l]

pre = build([3, -1, 4, 1, 5])
print(range_sum(pre, 1, 3), range_sum(pre, 0, 4))`, "4 12"],
    ["Count subarrays = k", "count_k.py", `def count_sum_k(nums, k):
    seen = {0: 1}                      # the empty prefix
    run = count = 0
    for x in nums:
        run += x
        count += seen.get(run - k, 0)  # earlier prefixes that leave exactly k
        seen[run] = seen.get(run, 0) + 1
    return count

print(count_sum_k([1, 1, 1], 2), count_sum_k([1, -1, 0], 0))`, "2 3"]
  ],
  examples: [
    { t: "Subarray Sum Equals K", d: "Medium", lc: "subarray-sum-equals-k", f: "Prefix + count map",
      q: "Count the contiguous subarrays whose sum equals k. Values can be negative.",
      idea: "A subarray ending at i sums to k when an earlier prefix equals `run − k`. Count prefixes in a dict, seeded with `{0: 1}`.",
      code: `def subarray_sum(nums, k):
    seen, run, count = {0: 1}, 0, 0
    for x in nums:
        run += x
        count += seen.get(run - k, 0)
        seen[run] = seen.get(run, 0) + 1
    return count

print(subarray_sum([1, 2, 3], 3))`, out: "2", cx: "O(n) time · O(n) space" },
    { t: "Find Pivot Index", d: "Easy", lc: "find-pivot-index", f: "Prefix array",
      q: "Return the first index where the sum of everything to its left equals the sum of everything to its right.",
      idea: "Right sum = total − left − nums[i]. One pass with a running left sum.",
      code: `def pivot(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1

print(pivot([1, 7, 3, 6, 5, 6]))`, out: "3", cx: "O(n) time · O(1) space" },
    { t: "Continuous Subarray Sum", d: "Medium", lc: "continuous-subarray-sum", f: "Prefix mod k",
      q: "Is there a subarray of length ≥ 2 whose sum is a multiple of k?",
      idea: "Two prefixes with the same remainder mod k bound a multiple of k. Store the first index of each remainder and check the length.",
      code: `def check(nums, k):
    first = {0: -1}
    run = 0
    for i, x in enumerate(nums):
        run = (run + x) % k
        if run in first:
            if i - first[run] >= 2:
                return True
        else:
            first[run] = i
    return False

print(check([23, 2, 4, 6, 7], 6), check([23, 2, 6, 4, 7], 13))`, out: "True False", cx: "O(n)" },
    { t: "Range Sum Query 2D", d: "Medium", lc: "range-sum-query-2d-immutable", f: "2-D prefix",
      q: "Answer many “sum of the rectangle (r1, c1)–(r2, c2)” queries on a fixed grid.",
      idea: "`P[i][j]` = sum of the top-left i × j block. A rectangle is P(bottom-right) − P(top) − P(left) + P(overlap).",
      code: `def build(g):
    m, n = len(g), len(g[0])
    P = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            P[i + 1][j + 1] = g[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]
    return P

def rect(P, r1, c1, r2, c2):
    return P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1]

P = build([[3, 0, 1], [5, 6, 3], [1, 2, 0]])
print(rect(P, 1, 1, 2, 2), rect(P, 0, 0, 2, 2))`, out: "11 21", cx: "O(mn) build · O(1) per query" }
  ],
  pitfalls: [
    ["Forgetting `seen = {0: 1}`", "Subarrays that start at index 0 are never counted."],
    ["Updating the map before looking up", "With k = 0 every element would match its own prefix."],
    ["Off-by-one in `pre[r + 1] − pre[l]`", "Use a prefix array one longer than the input, with `pre[0] = 0`."],
    ["Using a sliding window with negative numbers", "Shrinking no longer decreases the sum, so the window logic breaks."],
    ["Negative remainders", "In Python `%` is already non-negative for positive k; in other languages fix it with `((x % k) + k) % k`."]
  ],
  edge: ["k = 0", "All negative numbers", "Whole array is the answer", "Single element", "Large sums (Python ints don't overflow, other languages do)"],
  compare: [
    ["Sliding Window", "sliding-window-variable", "Positive numbers + longest/shortest under a limit → window. Negatives or exact-count questions → prefix sums."],
    ["Hashing", "hashing", "Prefix sums *are* a hashing trick, but the key is the running sum, not the element."],
    ["Kadane's Algorithm", "kadane", "Maximum subarray sum is Kadane (best ending here), not prefix sums, though `max(pre[j] − min(pre[i]))` also works."]
  ],
  mcq: [
    ["Values can be negative. Count subarrays with sum exactly k. Best approach?", ["Sliding window", "Prefix sums + hash map", "Sort then two pointers", "Binary search"], 1, "Negative values break the window. A dict of prefix-sum counts finds every matching start in O(1)."],
    ["Why seed the map with `{0: 1}`?", ["To avoid a KeyError", "It represents the empty prefix, so subarrays starting at index 0 are counted", "It makes the sum positive", "It's required by Python"], 1, "A subarray from index 0 to i has sum `run − 0`, which needs the empty prefix in the map."]
  ],
  summary: {
    oneLine: "Running totals turn any range sum into one subtraction; add a dict to count matching subarrays.",
    signals: ["Many range-sum queries", "“Subarray sum equals k” with **negatives**", "Sum divisible by k / equal 0s and 1s", "Rectangle sums in a grid"],
    template: `seen = {0: 1}                 # empty prefix
run = count = 0
for x in nums:
    run += x
    count += seen.get(run - k, 0)
    seen[run] = seen.get(run, 0) + 1`,
    pitfalls: ["Seed with `{0: 1}`", "Look up before you insert", "Window logic fails with negatives"],
    cx: "O(n) time · O(n) space",
    drill: { task: "Count the subarrays of `nums` whose sum is exactly `k` (values may be negative).",
      ref: `def count_k(nums, k):
    seen = {0: 1}
    run = count = 0
    for x in nums:
        run += x
        count += seen.get(run - k, 0)
        seen[run] = seen.get(run, 0) + 1
    return count`,
      tests: [["[1, 1, 1], 2", "2"], ["[1, 2, 3], 3", "2"], ["[1, -1, 0], 0", "3"]] }
  },
  problems: [
    { id: "range-totals", title: "Range Totals", d: "Easy", lc: "range-sum-query-immutable",
      statement: "You get daily sales `sales` and many queries `[l, r]`. For each query return the total of `sales[l..r]` (inclusive). Return the answers as a list.",
      examples: [["[3, -1, 4, 1, 5], [[1, 3], [0, 4], [2, 2]]", "[4, 12, 4]", ""], ["[7], [[0, 0]]", "[7]", ""]],
      constraints: ["1 ≤ len(sales), len(queries) ≤ 10⁵", "−10⁴ ≤ sales[i] ≤ 10⁴"],
      hints: ["Summing each range separately is O(n) per query: too slow for 10⁵ queries.", "Build `pre` where `pre[i]` is the sum of the first i values.", "Each answer is `pre[r + 1] − pre[l]`."],
      solution: `def range_totals(sales, queries):
    pre = [0]
    for x in sales:
        pre.append(pre[-1] + x)
    return [pre[r + 1] - pre[l] for l, r in queries]`,
      why: "One O(n) pass builds the prefix array; then every query is a single subtraction.", time: "O(n + q)",
      hidden: [["[1, 2, 3], [[0, 2], [1, 1]]", "[6, 2]"], ["[-5, 5], [[0, 1]]", "[0]"], ["[1] * 100000, [[0, 99999]] * 100000", "[100000] * 100000"]] },
    { id: "balance-point", title: "Balance Point", d: "Easy", lc: "find-pivot-index",
      statement: "Return the smallest index `i` where the sum of the values strictly left of `i` equals the sum strictly right of `i`. Return `-1` if none exists.",
      examples: [["[1, 7, 3, 6, 5, 6]", "3", "1 + 7 + 3 = 5 + 6 = 11"], ["[1, 2, 3]", "-1", ""], ["[2, 1, -1]", "0", "Left is empty (0); right is 1 + (−1) = 0."]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−1000 ≤ nums[i] ≤ 1000"],
      hints: ["You know the total sum up front.", "Right sum = total − left sum − nums[i]."],
      solution: `def balance_point(nums):
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1`,
      why: "With the total known, a running left sum gives the right sum for free at every index.", time: "O(n)",
      hidden: [["[0]", "0"], ["[1, -1, 1]", "0"], ["[1] * 99999", "49999"]] },
    { id: "all-but-me", title: "Product of All Others", d: "Medium", lc: "product-of-array-except-self",
      statement: "Return a list where position `i` holds the product of every element **except** `nums[i]`. Don't use division.",
      examples: [["[1, 2, 3, 4]", "[24, 12, 8, 6]", ""], ["[-1, 1, 0, -3, 3]", "[0, 0, 9, 0, 0]", ""]],
      constraints: ["2 ≤ len(nums) ≤ 10⁵", "−30 ≤ nums[i] ≤ 30"],
      hints: ["The answer is (product of everything left of i) × (product of everything right of i).", "Build prefix products left to right, then multiply in suffix products right to left."],
      solution: `def all_but_me(nums):
    n = len(nums)
    out = [1] * n
    left = 1
    for i in range(n):
        out[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        out[i] *= right
        right *= nums[i]
    return out`,
      why: "Prefix products from the left and suffix products from the right combine into each answer in two passes.", time: "O(n)",
      hidden: [["[2, 3]", "[3, 2]"], ["[0, 0]", "[0, 0]"], ["[1] * 100000", "[1] * 100000"]] },
    { id: "target-runs", title: "Runs That Hit the Target", d: "Medium", lc: "subarray-sum-equals-k",
      statement: "Daily profit can be negative. Count the contiguous runs of days (subarrays) whose total profit is exactly `k`.",
      examples: [["[1, 1, 1], 2", "2", ""], ["[1, 2, 3], 3", "2", "[1, 2] and [3]"], ["[3, 4, -7, 3, 1, 3, 1, -4], 7", "3", ""]],
      constraints: ["1 ≤ len(profit) ≤ 2·10⁴", "−1000 ≤ profit[i] ≤ 1000", "−10⁷ ≤ k ≤ 10⁷"],
      hints: ["Negative values mean a sliding window won't work.", "A run ending here has sum k when some earlier prefix equals run − k.", "Keep a dict of prefix-sum counts, starting with {0: 1}."],
      solution: `def target_runs(profit, k):
    seen = {0: 1}
    run = count = 0
    for x in profit:
        run += x
        count += seen.get(run - k, 0)
        seen[run] = seen.get(run, 0) + 1
    return count`,
      why: "Every matching earlier prefix marks the start of a run that sums to k; the dict counts them in O(1).", time: "O(n)",
      hidden: [["[0, 0, 0], 0", "6"], ["[-1, -1, 1], 0", "1"], ["[1, -1] * 10000, 0", "100000000"]] },
    { id: "multiple-run", title: "Multiple of K", d: "Medium", lc: "continuous-subarray-sum",
      statement: "Return `True` if `nums` has a contiguous subarray of **length at least 2** whose sum is a multiple of `k` (0 counts as a multiple).",
      examples: [["[23, 2, 4, 6, 7], 6", "True", "[2, 4] sums to 6."], ["[23, 2, 6, 4, 7], 13", "False", ""], ["[5, 0, 0], 3", "True", "[0, 0] sums to 0."]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "0 ≤ nums[i] ≤ 10⁹", "1 ≤ k ≤ 2³¹ − 1"],
      hints: ["Two prefix sums with the same remainder mod k differ by a multiple of k.", "Remember the **first** index where each remainder appears.", "Seed with remainder 0 at index −1."],
      solution: `def multiple_run(nums, k):
    first = {0: -1}
    run = 0
    for i, x in enumerate(nums):
        run = (run + x) % k
        if run in first:
            if i - first[run] >= 2:
                return True
        else:
            first[run] = i
    return False`,
      why: "Equal remainders bracket a subarray whose sum is divisible by k; keeping the earliest index maximises the length.", time: "O(n)",
      hidden: [["[1, 2], 4", "False"], ["[0], 1", "False"], ["[1] * 99999, 100000", "False"], ["[1] * 100000, 99999", "True"]] },
    { id: "balanced-bits", title: "Balanced Bits", d: "Medium", lc: "contiguous-array",
      statement: "`bits` contains only 0s and 1s. Return the length of the longest contiguous subarray with an **equal number** of 0s and 1s.",
      examples: [["[0, 1]", "2", ""], ["[0, 1, 0]", "2", ""], ["[0, 0, 1, 0, 0, 0, 1, 1]", "6", ""]],
      constraints: ["1 ≤ len(bits) ≤ 10⁵"],
      hints: ["Treat 0 as −1. Then a balanced subarray sums to 0.", "Equal prefix sums bracket a zero-sum subarray.", "Store the first index of each prefix sum."],
      solution: `def balanced_bits(bits):
    first = {0: -1}
    run = best = 0
    for i, b in enumerate(bits):
        run += 1 if b else -1
        if run in first:
            best = max(best, i - first[run])
        else:
            first[run] = i
    return best`,
      why: "With 0 → −1 the question becomes “longest zero-sum subarray”, which equal prefixes answer in one pass.", time: "O(n)",
      hidden: [["[1]", "0"], ["[1, 1, 0, 0, 1]", "4"], ["[0, 1] * 50000", "100000"]] },
    { id: "divisible-runs", title: "Divisible Runs", d: "Medium", lc: "subarray-sums-divisible-by-k",
      statement: "Count the non-empty contiguous subarrays whose sum is divisible by `k`. Values may be negative.",
      examples: [["[4, 5, 0, -2, -3, 1], 5", "7", ""], ["[5], 9", "0", ""]],
      constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "−10⁴ ≤ nums[i] ≤ 10⁴", "2 ≤ k ≤ 10⁴"],
      hints: ["Use prefix sums mod k.", "Each earlier prefix with the same remainder gives one subarray.", "Python's `%` is never negative for positive k."],
      solution: `def divisible_runs(nums, k):
    count = [0] * k
    count[0] = 1
    run = total = 0
    for x in nums:
        run = (run + x) % k
        total += count[run]
        count[run] += 1
    return total`,
      why: "Subarrays divisible by k are exactly pairs of prefixes with equal remainders.", time: "O(n + k)",
      hidden: [["[0, 0], 3", "3"], ["[-1, 2, 9], 2", "2"], ["[2] * 30000, 2", "450015000"]] },
    { id: "rect-totals", title: "Rectangle Totals", d: "Medium", lc: "range-sum-query-2d-immutable",
      statement: "Given a grid of numbers and queries `[r1, c1, r2, c2]`, return the sum of each rectangle with top-left `(r1, c1)` and bottom-right `(r2, c2)`, inclusive.",
      examples: [["[[3, 0, 1], [5, 6, 3], [1, 2, 0]], [[1, 1, 2, 2], [0, 0, 2, 2]]", "[11, 21]", ""], ["[[5]], [[0, 0, 0, 0]]", "[5]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 200", "1 ≤ len(queries) ≤ 10⁴"],
      hints: ["Build P where P[i][j] is the sum of the top-left i × j block.", "A rectangle is P[r2+1][c2+1] − P[r1][c2+1] − P[r2+1][c1] + P[r1][c1]."],
      solution: `def rect_totals(grid, queries):
    m, n = len(grid), len(grid[0])
    P = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m):
        for j in range(n):
            P[i + 1][j + 1] = grid[i][j] + P[i][j + 1] + P[i + 1][j] - P[i][j]
    return [P[r2 + 1][c2 + 1] - P[r1][c2 + 1] - P[r2 + 1][c1] + P[r1][c1] for r1, c1, r2, c2 in queries]`,
      why: "Inclusion–exclusion on a 2-D prefix table answers each rectangle in O(1).", time: "O(mn + q)",
      hidden: [["[[1, 2], [3, 4]], [[0, 1, 1, 1]]", "[6]"], ["[[-1, -1]], [[0, 0, 0, 1]]", "[-2]"], ["[[1] * 200 for _ in range(200)], [[0, 0, 199, 199]] * 10000", "[40000] * 10000"]] },
    { id: "target-blocks", title: "Target Blocks", d: "Hard", lc: "number-of-submatrices-that-sum-to-target",
      statement: "Count the non-empty sub-rectangles of `grid` whose values sum to `target`.",
      examples: [["[[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0", "4", "The four corner 1 × 1 cells."], ["[[1, -1], [-1, 1]], 0", "5", ""]],
      constraints: ["1 ≤ rows, cols ≤ 100", "−1000 ≤ grid[i][j] ≤ 1000"],
      hints: ["Fix a pair of rows (top, bottom).", "Collapse the rows between them into one array of column sums.", "Now it's “count subarrays with sum = target” on that array: prefix sums + dict."],
      solution: `def target_blocks(grid, target):
    m, n = len(grid), len(grid[0])
    total = 0
    for top in range(m):
        col = [0] * n
        for bottom in range(top, m):
            for j in range(n):
                col[j] += grid[bottom][j]
            seen, run = {0: 1}, 0
            for v in col:
                run += v
                total += seen.get(run - target, 0)
                seen[run] = seen.get(run, 0) + 1
    return total`,
      why: "Each of the O(m²) row pairs reduces to the 1-D subarray-sum count in O(n), O(m²n) in total.", time: "O(m² · n)",
      hidden: [["[[904]], 0", "0"], ["[[1, 1], [1, 1]], 2", "4"], ["[[0] * 60 for _ in range(60)], 0", "3348900"]] }
  ]
});
