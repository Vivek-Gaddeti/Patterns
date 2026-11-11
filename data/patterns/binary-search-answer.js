PAT("binary-search-answer", {
  time: "O(n log W)", space: "O(1)",
  lede: "When the question is “what's the smallest X that works?” and checking one X is easy, binary-search X itself. Each check is a greedy O(n) pass.",
  idea: "Many optimisation problems are hard to solve directly but easy to **verify**: “can I ship everything in D days with capacity C?” is a simple greedy loop. If C works then every bigger C works too (the answer is monotone), so binary-search the smallest C for which the check is true. Total cost: O(n · log(range of answers)).",
  analogy: "Setting an oven timer by trial: 30 minutes burns it, 10 is raw, try 20, then 15… you're binary-searching the answer, and each guess is just one test bake.",
  signals: [["“Minimum possible maximum” / “maximum possible minimum”", "minimise the largest part, maximise the smallest gap"], ["“Smallest speed / capacity / time such that …”", "a feasibility check you can write"], ["Answers live in a large numeric range", "like 1..10⁹"], ["“Within D days”, “at most k groups”, “at least m bouquets”", "greedy check with a count"]],
  not: "**Not this pattern** when there's no monotone feasibility check (if X works it doesn't imply X + 1 works), or the answer is an index in a sorted array (→ plain binary search).",
  templates: [
    ["Smallest that works", "min_feasible.py", `def smallest_capacity(weights, days):
    def ok(cap):                           # greedy check: how many days needed?
        need, load = 1, 0
        for w in weights:
            if load + w > cap:
                need += 1
                load = 0
            load += w
        return need <= days

    lo, hi = max(weights), sum(weights)    # the answer is somewhere in here
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid                       # works: try smaller
        else:
            lo = mid + 1                   # fails: need bigger
    return lo

print(smallest_capacity([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))`, "15"],
    ["Largest that works", "max_feasible.py", `def largest_min_gap(positions, k):
    positions = sorted(positions)
    def ok(gap):                           # can we place k items at least gap apart?
        count, last = 1, positions[0]
        for p in positions[1:]:
            if p - last >= gap:
                count += 1
                last = p
        return count >= k

    lo, hi = 0, positions[-1] - positions[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2           # round up when moving lo = mid
        if ok(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo

print(largest_min_gap([1, 2, 3, 4, 7], 3))`, "3"]
  ],
  examples: [
    { t: "Koko Eating Bananas", d: "Medium", lc: "koko-eating-bananas", f: "Smallest that works",
      q: "Minimum eating speed k so all piles are finished within h hours (one pile per hour max).",
      idea: "Hours needed at speed k = Σ ceil(pile / k). Monotone in k, so binary-search k.",
      code: `def min_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        if sum((p + k - 1) // k for p in piles) <= h:
            hi = k
        else:
            lo = k + 1
    return lo

print(min_speed([3, 6, 7, 11], 8), min_speed([30, 11, 23, 4, 20], 5))`, out: "4 30", cx: "O(n log max)" },
    { t: "Split Array Largest Sum", d: "Hard", lc: "split-array-largest-sum", f: "Smallest that works",
      q: "Split into k contiguous parts minimising the largest part sum.",
      idea: "For a limit L, greedily count parts; feasible if count ≤ k. Binary-search L in [max, sum].",
      code: `def split_array(nums, k):
    def parts(limit):
        count, cur = 1, 0
        for x in nums:
            if cur + x > limit:
                count += 1; cur = 0
            cur += x
        return count
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts(mid) <= k: hi = mid
        else: lo = mid + 1
    return lo

print(split_array([7, 2, 5, 10, 8], 2))`, out: "18", cx: "O(n log sum)" },
    { t: "Magnetic Force Between Two Balls", d: "Medium", lc: "magnetic-force-between-two-balls", f: "Largest that works",
      q: "Place m balls in baskets to maximise the minimum distance between any two.",
      idea: "For a gap g, greedily place balls left to right; feasible if you can place m. Binary-search the largest g.",
      code: `def max_distance(pos, m):
    pos.sort()
    def ok(g):
        cnt, last = 1, pos[0]
        for p in pos[1:]:
            if p - last >= g:
                cnt += 1; last = p
        return cnt >= m
    lo, hi = 1, pos[-1] - pos[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if ok(mid): lo = mid
        else: hi = mid - 1
    return lo

print(max_distance([1, 2, 3, 4, 7], 3))`, out: "3", cx: "O(n log n + n log range)" }
  ],
  pitfalls: [
    ["Wrong search bounds", "The low end must be a possible answer (e.g. max(weights)), the high end must surely work (e.g. sum)."],
    ["Infinite loop with `lo = mid`", "When the true branch does `lo = mid`, compute `mid = (lo + hi + 1) // 2`."],
    ["A check that isn't monotone", "Make sure “X works ⇒ X + 1 works” (or the reverse) before using this pattern."],
    ["Floating-point ceilings", "Use `(p + k − 1) // k` instead of `math.ceil(p / k)` to stay in integers."]
  ],
  edge: ["Only one item", "k equals the number of items", "k = 1", "All values equal", "Huge values (10⁹)"],
  compare: [
    ["Binary Search", "binary-search", "Same loop, but plain binary search looks for a position in sorted data."],
    ["Greedy", "greedy", "The feasibility check is almost always a simple greedy pass."],
    ["Dynamic Programming", "dp-1d", "Split-array problems also have DP solutions, usually O(n²k): binary search is far faster."]
  ],
  mcq: [
    ["What makes “binary search on the answer” valid?", ["The input is sorted", "Feasibility is monotone: if X works, every larger X works", "The answer is an index", "n is small"], 1, "Monotonicity gives the false…false, true…true shape binary search needs."],
    ["For “ship within D days”, a good search range for capacity is…", ["0 .. D", "max(weights) .. sum(weights)", "1 .. len(weights)", "min(weights) .. max(weights)"], 1, "Capacity below the heaviest package never works; capacity = total always does (one day)."]
  ],
  summary: {
    oneLine: "“Smallest X that works?” + easy check + monotone → binary-search X, check greedily.",
    signals: ["Minimise the maximum / maximise the minimum", "Smallest speed / capacity / days", "Answers in a big numeric range"],
    template: `lo, hi = smallest_possible, surely_works
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid): hi = mid
    else: lo = mid + 1
return lo`,
    pitfalls: ["Bounds must bracket the answer", "Round mid up when lo = mid", "Check must be monotone"],
    cx: "O(n · log(range)) time · O(1) space",
    drill: { task: "Koko eats from piles; at speed k she eats up to k bananas from one pile per hour. Return the minimum k to finish within h hours.",
      ref: `def min_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        if sum((p + k - 1) // k for p in piles) <= h:
            hi = k
        else:
            lo = k + 1
    return lo`,
      tests: [["[3, 6, 7, 11], 8", "4"], ["[30, 11, 23, 4, 20], 5", "30"], ["[30, 11, 23, 4, 20], 6", "23"]] }
  },
  problems: [
    { id: "coin-stairs", title: "Coin Staircase", d: "Easy", lc: "arranging-coins",
      statement: "You build a staircase with `n` coins: row 1 has 1 coin, row 2 has 2 coins, and so on. Return how many **complete** rows you can build.",
      examples: [["5", "2", "1 + 2 = 3, the third row would need 3 more but only 2 remain."], ["8", "3", ""], ["1", "1", ""]],
      constraints: ["1 ≤ n ≤ 2³¹ − 1"],
      hints: ["k complete rows need k(k+1)/2 coins.", "Binary-search the largest k with k(k+1)/2 ≤ n."],
      solution: `def coin_stairs(n):
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * (mid + 1) // 2 <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo`,
      why: "Coins needed grows with k, so the largest feasible k is a binary search away.", time: "O(log n)",
      hidden: [["3", "2"], ["6", "3"], ["2147483647", "65535"]] },
    { id: "snack-speed", title: "Snack Speed", d: "Medium", lc: "koko-eating-bananas",
      statement: "There are snack piles `piles`. At speed `k`, each hour you eat up to `k` snacks from **one** pile (if the pile has fewer, you finish it and wait out the hour). Return the minimum integer `k` to finish everything within `h` hours.",
      examples: [["[3, 6, 7, 11], 8", "4", ""], ["[30, 11, 23, 4, 20], 5", "30", ""], ["[30, 11, 23, 4, 20], 6", "23", ""]],
      constraints: ["1 ≤ len(piles) ≤ 10⁴", "len(piles) ≤ h ≤ 10⁹", "1 ≤ piles[i] ≤ 10⁹"],
      hints: ["Hours needed at speed k is Σ ceil(pile / k).", "Faster never needs more hours: monotone.", "Binary-search k in [1, max(piles)]."],
      solution: `def snack_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        if sum((p + k - 1) // k for p in piles) <= h:
            hi = k
        else:
            lo = k + 1
    return lo`,
      why: "Each check is O(n) and there are O(log max) checks.", time: "O(n log max)",
      hidden: [["[1000000000], 2", "500000000"], ["[312884470], 312884469", "2"], ["[10**9] * 10000, 10**9", "10000"]] },
    { id: "ship-it", title: "Ship It in Time", d: "Medium", lc: "capacity-to-ship-packages-within-d-days",
      statement: "Packages must ship **in the given order**. Each day the ship carries a prefix of the remaining packages, up to its capacity. Return the smallest capacity that ships everything within `days` days.",
      examples: [["[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5", "15", ""], ["[3, 2, 2, 4, 1, 4], 3", "6", ""], ["[1, 2, 3, 1, 1], 4", "3", ""]],
      constraints: ["1 ≤ days ≤ len(weights) ≤ 5·10⁴", "1 ≤ weights[i] ≤ 500"],
      hints: ["Given a capacity, count the days greedily.", "Capacity ranges from max(weights) to sum(weights).", "Binary-search the smallest capacity that needs ≤ days."],
      solution: `def ship_it(weights, days):
    def need(cap):
        d, load = 1, 0
        for w in weights:
            if load + w > cap:
                d += 1
                load = 0
            load += w
        return d
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if need(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      why: "Days needed only falls as capacity rises, so the smallest feasible capacity is found by binary search.", time: "O(n log sum)",
      hidden: [["[5], 1", "5"], ["[1, 1, 1, 1], 4", "1"], ["[500] * 50000, 1", "25000000"], ["[500] * 50000, 50000", "500"]] },
    { id: "gentle-divisor", title: "Gentle Divisor", d: "Medium", lc: "find-the-smallest-divisor-given-a-threshold",
      statement: "Divide every number by a positive integer `d`, rounding **up**, and add the results. Return the smallest `d` for which that sum is at most `threshold`.",
      examples: [["[1, 2, 5, 9], 6", "5", "1+1+1+2 = 5"], ["[44, 22, 33, 11, 1], 5", "44", ""]],
      constraints: ["1 ≤ len(nums) ≤ 5·10⁴", "1 ≤ nums[i] ≤ 10⁶", "len(nums) ≤ threshold ≤ 10⁶"],
      hints: ["A bigger divisor never increases the sum.", "Binary-search d in [1, max(nums)]."],
      solution: `def gentle_divisor(nums, threshold):
    lo, hi = 1, max(nums)
    while lo < hi:
        d = (lo + hi) // 2
        if sum((x + d - 1) // d for x in nums) <= threshold:
            hi = d
        else:
            lo = d + 1
    return lo`,
      why: "The sum is monotone in d, so the smallest valid d is a binary search.", time: "O(n log max)",
      hidden: [["[19], 5", "4"], ["[2, 3, 5, 7, 11], 11", "3"], ["[10**6] * 50000, 50000", "1000000"]] },
    { id: "bloom-day", title: "Bouquet Day", d: "Medium", lc: "minimum-number-of-days-to-make-m-bouquets",
      statement: "Flower i blooms on day `bloom[i]`. A bouquet needs `k` **adjacent** bloomed flowers. Return the earliest day on which you can make `m` bouquets, or -1 if impossible.",
      examples: [["[1, 10, 3, 10, 2], 3, 1", "3", ""], ["[1, 10, 3, 10, 2], 3, 2", "-1", "Needs 6 flowers, only 5 exist."], ["[7, 7, 7, 7, 12, 7, 7], 2, 3", "12", ""]],
      constraints: ["1 ≤ len(bloom) ≤ 10⁵", "1 ≤ bloom[i] ≤ 10⁹", "1 ≤ m, k ≤ 10⁶"],
      hints: ["If m·k > n it's impossible.", "For a day D, count runs of bloomed flowers greedily.", "Binary-search D between min and max bloom day."],
      solution: `def bloom_day(bloom, m, k):
    if m * k > len(bloom):
        return -1
    def bouquets(day):
        made = run = 0
        for b in bloom:
            if b <= day:
                run += 1
                if run == k:
                    made += 1
                    run = 0
            else:
                run = 0
        return made
    lo, hi = min(bloom), max(bloom)
    while lo < hi:
        mid = (lo + hi) // 2
        if bouquets(mid) >= m:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      why: "Waiting longer never reduces the number of bouquets, so the earliest feasible day is a binary search.", time: "O(n log max)",
      hidden: [["[5], 1, 1", "5"], ["[1, 2, 3], 1, 3", "3"], ["list(range(1, 100001)), 1, 100000", "100000"], ["[1] * 100000, 50000, 2", "1"]] },
    { id: "spread-out", title: "Spread Them Out", d: "Medium", lc: "magnetic-force-between-two-balls",
      statement: "Place `m` sensors at some of the given distinct `positions` to make the **minimum distance between any two sensors as large as possible**. Return that largest minimum distance.",
      examples: [["[1, 2, 3, 4, 7], 3", "3", "At 1, 4 and 7."], ["[5, 4, 3, 2, 1, 1000000000], 2", "999999999", ""]],
      constraints: ["2 ≤ m ≤ len(positions) ≤ 10⁵", "1 ≤ positions[i] ≤ 10⁹"],
      hints: ["For a gap g, place greedily from the left whenever the distance is ≥ g.", "If you can place m sensors with gap g, you can with any smaller gap.", "Binary-search the largest feasible g (round mid up)."],
      solution: `def spread_out(positions, m):
    pos = sorted(positions)
    def ok(g):
        count, last = 1, pos[0]
        for p in pos[1:]:
            if p - last >= g:
                count += 1
                last = p
        return count >= m
    lo, hi = 1, pos[-1] - pos[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if ok(mid):
            lo = mid
        else:
            hi = mid - 1
    return lo`,
      why: "Greedy placement is optimal for a fixed gap, and feasibility only gets harder as the gap grows.", time: "O(n log n + n log range)",
      hidden: [["[1, 2], 2", "1"], ["[1, 5, 9], 3", "4"], ["list(range(1, 200001, 2)), 100000", "2"], ["list(range(1, 100001)), 2", "99999"]] },
    { id: "kth-in-table", title: "Kth in a Sorted Table", d: "Medium", lc: "kth-smallest-element-in-a-sorted-matrix",
      statement: "Every row and every column of the `n × n` table is sorted ascending. Return the `k`-th smallest value (counting duplicates).",
      examples: [["[[1, 5, 9], [10, 11, 13], [12, 13, 15]], 8", "13", ""], ["[[-5]], 1", "-5", ""]],
      constraints: ["1 ≤ n ≤ 300", "1 ≤ k ≤ n²", "−10⁹ ≤ values ≤ 10⁹"],
      hints: ["Binary-search the value, not the position.", "Count how many cells are ≤ mid using a staircase walk (O(n)).", "Find the smallest value whose count is ≥ k."],
      solution: `def kth_in_table(table, k):
    n = len(table)
    def count_le(x):
        r, c, cnt = n - 1, 0, 0
        while r >= 0 and c < n:
            if table[r][c] <= x:
                cnt += r + 1
                c += 1
            else:
                r -= 1
        return cnt
    lo, hi = table[0][0], table[-1][-1]
    while lo < hi:
        mid = (lo + hi) // 2
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      why: "“How many values are ≤ x” is monotone in x and costs O(n) per check thanks to the sorted rows and columns.", time: "O(n log range)",
      hidden: [["[[1, 2], [1, 3]], 2", "1"], ["[[1, 2], [3, 4]], 4", "4"], ["[[r + c for c in range(300)] for r in range(300)], 45150", "299"]] },
    { id: "fair-split", title: "Fair Split", d: "Hard", lc: "split-array-largest-sum",
      statement: "Split `nums` (non-negative) into exactly `k` non-empty **contiguous** parts so that the largest part sum is as small as possible. Return that smallest possible largest sum.",
      examples: [["[7, 2, 5, 10, 8], 2", "18", "[7, 2, 5] and [10, 8]"], ["[1, 2, 3, 4, 5], 2", "9", ""], ["[1, 4, 4], 3", "4", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁴", "0 ≤ nums[i] ≤ 10⁶", "1 ≤ k ≤ min(50, len(nums))"],
      hints: ["Guess a limit L for the largest part.", "Greedily form parts without exceeding L and count them.", "If you need ≤ k parts, L is feasible. Binary-search L in [max, sum]."],
      solution: `def fair_split(nums, k):
    def parts(limit):
        count, cur = 1, 0
        for x in nums:
            if cur + x > limit:
                count += 1
                cur = 0
            cur += x
        return count
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      why: "Fewer parts are needed as the limit grows; using ≤ k parts means exactly k is also possible (split further).", time: "O(n log sum)",
      hidden: [["[5], 1", "5"], ["[0, 0, 0], 2", "0"], ["[1000000] * 10000, 50", "200000000"], ["[2, 3, 1, 2, 4, 3], 5", "4"]] },
    { id: "kth-closest-gap", title: "Kth Smallest Gap", d: "Hard", lc: "find-k-th-smallest-pair-distance",
      statement: "The distance of a pair `(i, j)` with `i < j` is `|nums[i] − nums[j]|`. Return the `k`-th smallest distance among all pairs.",
      examples: [["[1, 3, 1], 1", "0", "Pairs: (1,3)=2, (1,1)=0, (3,1)=2"], ["[1, 1, 1], 2", "0", ""], ["[1, 6, 1], 3", "5", ""]],
      constraints: ["2 ≤ len(nums) ≤ 10⁴", "0 ≤ nums[i] ≤ 10⁶", "1 ≤ k ≤ n(n−1)/2"],
      hints: ["Sort the numbers.", "Binary-search the distance d; count pairs with distance ≤ d using two pointers in O(n).", "Find the smallest d whose count is ≥ k."],
      solution: `def kth_closest_gap(nums, k):
    a = sorted(nums)
    def count_le(d):
        cnt, l = 0, 0
        for r in range(len(a)):
            while a[r] - a[l] > d:
                l += 1
            cnt += r - l
        return cnt
    lo, hi = 0, a[-1] - a[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo`,
      why: "Counting pairs within a distance is O(n) with two pointers on sorted data, and that count is monotone in the distance.", time: "O(n log n + n log W)",
      hidden: [["[1, 2], 1", "1"], ["[9, 10, 7, 10, 6, 1, 5, 4, 9, 8], 18", "2"], ["list(range(10000)), 49995000", "9999"]] }
  ]
});
