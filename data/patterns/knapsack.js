PAT("knapsack", {
  time: "O(n · W)", space: "O(W)",
  lede: "Items with a size (and maybe a value), and a budget W. For each item decide take or skip; dp[w] holds the best answer for budget w. Loop budgets **backwards** for 0/1 (each item once) and **forwards** for unbounded (reuse allowed).",
  idea: "The state needs the item index **and** how much budget is used: dp[i][w]. Since row i only reads row i − 1, keep one array. Iterating w from high to low means `dp[w − size]` still holds the previous row (item not yet used) → 0/1 knapsack. Iterating low to high lets an item be reused → unbounded. Many problems are knapsack in disguise: subset sum, equal partition, target sum with ±, coin change.",
  analogy: "Packing a suitcase with a weight limit: for each item you ask “is it better to pack this and lose that much space, or leave it out?” and you remember the best answer for every possible remaining space.",
  flavours: [["Kind", "Loop over budget", "Examples"], [
    ["**0/1 feasibility**", "backwards, `dp[w] |= dp[w − s]`", "subset sum, equal partition"],
    ["**0/1 best value**", "backwards, `dp[w] = max(dp[w], dp[w − s] + v)`", "classic knapsack, ones and zeroes"],
    ["**Unbounded min / max**", "forwards, `dp[w] = min(dp[w], dp[w − s] + 1)`", "fewest coins, perfect squares"],
    ["**Count combinations**", "items outer, budget forwards", "coin change ways"],
    ["**Count orderings**", "budget outer, items inner", "combination sum IV"]]],
  signals: [["A target sum / capacity / budget", "and items you can take or skip"], ["“Can the array be split into two equal halves?”", "subset sum to total / 2"], ["“Fewest coins”, “number of ways to make amount”", "unbounded knapsack"], ["Assign + or − to every number to hit a target", "subset sum after algebra"]],
  not: "**Not this pattern** when you may take **fractions** of items (→ greedy by value/weight), when the budget is huge (10⁹) but n is tiny (→ meet in the middle / backtracking), or items must stay in order with adjacency rules (→ 1-D DP).",
  templates: [
    ["0/1 subset sum", "subset_sum.py", `def can_make(nums, target):
    dp = [True] + [False] * target         # dp[w]: can some subset sum to w?
    for x in nums:
        for w in range(target, x - 1, -1): # backwards: each number used once
            dp[w] = dp[w] or dp[w - x]
    return dp[target]

print(can_make([3, 34, 4, 12, 5, 2], 9), can_make([3, 34, 4, 12, 5, 2], 30))`, "True False"],
    ["Unbounded min coins", "coins.py", `def fewest_coins(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount              # dp[w]: fewest coins for amount w
    for w in range(1, amount + 1):         # forwards: coins can be reused
        for c in coins:
            if c <= w and dp[w - c] + 1 < dp[w]:
                dp[w] = dp[w - c] + 1
    return dp[amount] if dp[amount] < INF else -1

print(fewest_coins([1, 2, 5], 11), fewest_coins([2], 3))`, "3 -1"]
  ],
  examples: [
    { t: "Partition Equal Subset Sum", d: "Medium", lc: "partition-equal-subset-sum", f: "0/1 feasibility",
      q: "Can the array be split into two subsets with equal sums?",
      idea: "Only if the total is even and some subset sums to total / 2.",
      code: `def can_partition(nums):
    total = sum(nums)
    if total % 2: return False
    half = total // 2
    reach = 1                                # bitset: bit w set = sum w reachable
    for x in nums:
        reach |= reach << x
    return bool(reach >> half & 1)

print(can_partition([1, 5, 11, 5]), can_partition([1, 2, 3, 5]))`, out: "True False", cx: "O(n · total / 64) with a bitset" },
    { t: "Coin Change II", d: "Medium", lc: "coin-change-ii", f: "Count combinations",
      q: "Number of combinations of coins (unlimited) that make the amount.",
      idea: "Coins in the **outer** loop so each combination is counted once, in coin order.",
      code: `def change(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for w in range(c, amount + 1):
            dp[w] += dp[w - c]
    return dp[amount]

print(change(5, [1, 2, 5]))`, out: "4", cx: "O(n · amount)" },
    { t: "Target Sum", d: "Medium", lc: "target-sum", f: "Algebra → subset sum",
      q: "Put + or − before each number. How many ways reach target?",
      idea: "If P is the set with +, then sum(P) = (total + target) / 2. Count subsets with that sum.",
      code: `def find_target_ways(nums, target):
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total: return 0
    goal = (total + target) // 2
    dp = [1] + [0] * goal
    for x in nums:
        for w in range(goal, x - 1, -1):
            dp[w] += dp[w - x]
    return dp[goal]

print(find_target_ways([1, 1, 1, 1, 1], 3))`, out: "5", cx: "O(n · total)" }
  ],
  pitfalls: [
    ["Wrong loop direction", "0/1 must iterate the budget backwards; forwards lets an item be used many times."],
    ["Combinations vs orderings", "Items outer → combinations; budget outer → ordered sequences (counts 1+2 and 2+1 separately)."],
    ["Using 0 instead of infinity for “impossible”", "Min-coin DP needs `inf` so unreachable amounts don't look free."],
    ["Huge budgets", "dp of size 10⁹ won't fit; look for a different angle (n small → backtracking/meet in middle)."]
  ],
  edge: ["Target / amount 0", "No items", "Item bigger than the budget", "Zeros in the input (target sum)", "Impossible target"],
  compare: [
    ["1-D DP", "dp-1d", "1-D DP's state is a position; knapsack adds the remaining budget as a second dimension."],
    ["Backtracking", "backtracking", "Listing all subsets that hit a target is backtracking; counting them or checking existence is knapsack."],
    ["Greedy", "greedy", "Greedy coin change only works for special coin systems; DP works for any."]
  ],
  mcq: [
    ["In 1-array 0/1 knapsack, why loop the budget from high to low?", ["It's faster", "So dp[w − size] still refers to the previous item's row (no reuse)", "To sort items", "It doesn't matter"], 1, "Going upward would let the same item be counted again within one pass."],
    ["Coin change II (count combinations): which loop goes outside?", ["Amount", "Coins", "Either", "Neither"], 1, "Coins outside fixes an order of coins, so each multiset is counted exactly once."]
  ],
  summary: {
    oneLine: "dp[w] = best for budget w; 0/1 loops budget backwards, unbounded forwards.",
    signals: ["Target sum / capacity / budget", "Equal partition, ± target", "Fewest coins / number of ways"],
    template: `dp = [True] + [False] * target
for x in nums:
    for w in range(target, x - 1, -1):   # 0/1: backwards
        dp[w] = dp[w] or dp[w - x]
return dp[target]`,
    pitfalls: ["Loop direction", "Combinations vs orderings", "inf for impossible"],
    cx: "O(n · W) time · O(W) space",
    drill: { task: "Return the fewest coins (unlimited supply of each) that make `amount`, or -1.",
      ref: `def fewest_coins(coins, amount):
    dp = [0] + [inf] * amount
    for w in range(1, amount + 1):
        for c in coins:
            if c <= w and dp[w - c] + 1 < dp[w]:
                dp[w] = dp[w - c] + 1
    return dp[amount] if dp[amount] < inf else -1`,
      tests: [["[1, 2, 5], 11", "3"], ["[2], 3", "-1"], ["[1], 0", "0"]] }
  },
  problems: [
    { id: "exact-bill", title: "Exact Bill", d: "Easy", lc: "partition-equal-subset-sum",
      statement: "You have gift cards with values `cards` (each usable once). Return `True` if some of them add up to exactly `bill`.",
      examples: [["[3, 34, 4, 12, 5, 2], 9", "True", "4 + 5"], ["[3, 34, 4, 12, 5, 2], 30", "False", ""]],
      constraints: ["1 ≤ len(cards) ≤ 100", "1 ≤ cards[i] ≤ 1000", "0 ≤ bill ≤ 10⁴"],
      hints: ["dp[w] = can some subset make w?", "For each card, update w from bill down to the card's value."],
      solution: `def exact_bill(cards, bill):
    dp = [True] + [False] * bill
    for x in cards:
        for w in range(bill, x - 1, -1):
            if dp[w - x]:
                dp[w] = True
    return dp[bill]`,
      why: "Classic 0/1 subset-sum: the backwards loop uses each card at most once.", time: "O(n · bill)",
      hidden: [["[5], 0", "True"], ["[2, 4], 5", "False"], ["[1000] * 100, 10000", "True"]] },
    { id: "fewest-coins", title: "Fewest Coins", d: "Medium", lc: "coin-change",
      statement: "Return the fewest coins needed to make `amount` using unlimited coins of the given values, or -1 if impossible.",
      examples: [["[1, 2, 5], 11", "3", "5 + 5 + 1"], ["[2], 3", "-1", ""], ["[1], 0", "0", ""]],
      constraints: ["1 ≤ len(coins) ≤ 12", "1 ≤ coins[i] ≤ 2³¹ − 1", "0 ≤ amount ≤ 10⁴"],
      hints: ["Greedy (biggest coin first) fails for coins like [1, 3, 4] and amount 6.", "dp[w] = 1 + min(dp[w − c]) over coins c ≤ w.", "Start with dp[0] = 0 and infinity elsewhere."],
      solution: `def fewest_coins(coins, amount):
    dp = [0] + [inf] * amount
    for w in range(1, amount + 1):
        for c in coins:
            if c <= w and dp[w - c] + 1 < dp[w]:
                dp[w] = dp[w - c] + 1
    return dp[amount] if dp[amount] < inf else -1`,
      why: "Each amount's best is one coin plus the best for what remains; amounts are solved smallest first.", time: "O(amount · coins)",
      hidden: [["[1, 3, 4], 6", "2"], ["[2, 5, 10, 1], 27", "4"], ["[3, 7], 10000", "1432"], ["[7], 10000", "-1"]] },
    { id: "coin-combos", title: "Coin Combinations", d: "Medium", lc: "coin-change-ii",
      statement: "Return the number of **combinations** (order doesn't matter) of unlimited coins that make `amount`.",
      examples: [["5, [1, 2, 5]", "4", "5, 2+2+1, 2+1+1+1, 1+1+1+1+1"], ["3, [2]", "0", ""], ["10, [10]", "1", ""]],
      constraints: ["0 ≤ amount ≤ 5000", "1 ≤ len(coins) ≤ 300"],
      hints: ["Put the coins loop **outside** so each multiset is counted once.", "dp[w] += dp[w − c] for w from c to amount."],
      solution: `def coin_combos(amount, coins):
    dp = [1] + [0] * amount
    for c in coins:
        for w in range(c, amount + 1):
            dp[w] += dp[w - c]
    return dp[amount]`,
      why: "Processing coins one at a time builds combinations in a fixed coin order, avoiding duplicates.", time: "O(amount · coins)",
      hidden: [["0, [7]", "1"], ["4, [1, 2, 3]", "4"], ["5000, [1, 2, 5, 10, 20, 50, 100, 200]", "10082315214426"]] },
    { id: "ordered-sums", title: "Ordered Sums", d: "Medium", lc: "combination-sum-iv",
      statement: "Return the number of **ordered** sequences of numbers from `nums` (reuse allowed) that add up to `target`. Different orders count separately.",
      examples: [["[1, 2, 3], 4", "7", "1111, 112, 121, 211, 22, 13, 31"], ["[9], 3", "0", ""]],
      constraints: ["1 ≤ len(nums) ≤ 200", "1 ≤ target ≤ 1000", "values are distinct and positive"],
      hints: ["Now the **target** loop goes outside.", "dp[t] = sum of dp[t − x] over x in nums (the last number in the sequence)."],
      solution: `def ordered_sums(nums, target):
    dp = [1] + [0] * target
    for t in range(1, target + 1):
        for x in nums:
            if x <= t:
                dp[t] += dp[t - x]
    return dp[target]`,
      why: "Conditioning on the last element counts every ordering separately.", time: "O(target · n)",
      hidden: [["[1], 5", "1"], ["[2, 3], 7", "3"], ["[1, 2], 90", "4660046610375530309"]] },
    { id: "even-split", title: "Even Split", d: "Medium", lc: "partition-equal-subset-sum",
      statement: "Return `True` if `nums` can be split into two groups with equal sums.",
      examples: [["[1, 5, 11, 5]", "True", "[1, 5, 5] and [11]"], ["[1, 2, 3, 5]", "False", ""]],
      constraints: ["1 ≤ len(nums) ≤ 200", "1 ≤ nums[i] ≤ 100"],
      hints: ["The total must be even.", "Then ask: can some subset sum to total / 2?"],
      solution: `def even_split(nums):
    total = sum(nums)
    if total % 2:
        return False
    half = total // 2
    dp = [True] + [False] * half
    for x in nums:
        for w in range(half, x - 1, -1):
            if dp[w - x]:
                dp[w] = True
    return dp[half]`,
      why: "One group sums to half the total exactly when the other does; it's subset sum.", time: "O(n · total)",
      hidden: [["[1]", "False"], ["[2, 2]", "True"], ["[100] * 199 + [99]", "False"], ["[1, 2] * 100", "True"]] },
    { id: "plus-minus", title: "Plus or Minus", d: "Medium", lc: "target-sum",
      statement: "Put a `+` or `-` in front of every number in `nums` and add them up. Return how many sign choices give exactly `target`.",
      examples: [["[1, 1, 1, 1, 1], 3", "5", ""], ["[1], 1", "1", ""], ["[0, 1], 1", "2", "+0 and −0 count separately."]],
      constraints: ["1 ≤ len(nums) ≤ 20", "0 ≤ nums[i] ≤ 1000", "−1000 ≤ target ≤ 1000"],
      hints: ["Let P be the numbers with +. Then sum(P) − (total − sum(P)) = target.", "So sum(P) = (total + target) / 2: count subsets with that sum.", "If that isn't a non-negative integer, the answer is 0."],
      solution: `def plus_minus(nums, target):
    total = sum(nums)
    if abs(target) > total or (total + target) % 2:
        return 0
    goal = (total + target) // 2
    dp = [1] + [0] * goal
    for x in nums:
        for w in range(goal, x - 1, -1):
            dp[w] += dp[w - x]
    return dp[goal]`,
      why: "Algebra turns sign choices into a subset-sum count, which 0/1 knapsack handles in O(n · total).", time: "O(n · total)",
      hidden: [["[1], 2", "0"], ["[0, 0, 0], 0", "8"], ["[1] * 20, 0", "184756"]] },
    { id: "bits-budget", title: "Zeros and Ones Budget", d: "Medium", lc: "ones-and-zeroes",
      statement: "Each string in `strs` is made of 0s and 1s. Choose the largest number of strings such that, all together, they use at most `m` zeros and `n` ones.",
      examples: [["['10', '0001', '111001', '1', '0'], 5, 3", "4", "10, 0001, 1, 0"], ["['10', '0', '1'], 1, 1", "2", ""]],
      constraints: ["1 ≤ len(strs) ≤ 600", "1 ≤ m, n ≤ 100"],
      hints: ["Two budgets at once: dp[z][o] = most strings using at most z zeros and o ones.", "0/1 knapsack: loop both budgets backwards for each string."],
      solution: `def bits_budget(strs, m, n):
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for s in strs:
        z, o = s.count("0"), s.count("1")
        for i in range(m, z - 1, -1):
            for j in range(n, o - 1, -1):
                if dp[i - z][j - o] + 1 > dp[i][j]:
                    dp[i][j] = dp[i - z][j - o] + 1
    return dp[m][n]`,
      why: "A knapsack with a two-dimensional budget; backwards loops keep each string to one use.", time: "O(len · m · n)",
      hidden: [["['1'], 1, 0", "0"], ["['0', '0', '1'], 1, 1", "2"], ["['01'] * 600, 100, 100", "100"]] },
    { id: "fewest-squares", title: "Fewest Squares", d: "Medium", lc: "perfect-squares",
      statement: "Return the fewest perfect squares (1, 4, 9, …) that add up to `n`.",
      examples: [["12", "3", "4 + 4 + 4"], ["13", "2", "4 + 9"]],
      constraints: ["1 ≤ n ≤ 10⁴"],
      hints: ["The “coins” are the squares up to n, with unlimited supply.", "dp[w] = 1 + min(dp[w − s]) over squares s ≤ w."],
      solution: `def fewest_squares(n):
    squares = [k * k for k in range(1, int(n ** 0.5) + 1)]
    dp = [0] + [inf] * n
    for w in range(1, n + 1):
        for s in squares:
            if s > w:
                break
            if dp[w - s] + 1 < dp[w]:
                dp[w] = dp[w - s] + 1
    return dp[n]`,
      why: "Unbounded knapsack with square-valued coins; every number is reachable because 1 is a square.", time: "O(n √n)",
      hidden: [["1", "1"], ["7", "4"], ["9999", "4"]] },
    { id: "crushed-stones", title: "Crushed Stones", d: "Medium", lc: "last-stone-weight-ii",
      statement: "Repeatedly smash any two stones x ≤ y: equal ones both vanish, otherwise y becomes y − x. Return the **smallest** possible weight of the last remaining stone (0 if none remain).",
      examples: [["[2, 7, 4, 1, 8, 1]", "1", ""], ["[31, 26, 33, 21, 40]", "5", ""]],
      constraints: ["1 ≤ len(stones) ≤ 30", "1 ≤ stones[i] ≤ 100"],
      hints: ["The final weight is |sum(A) − sum(B)| for some split of the stones into two groups.", "Make one group's sum as close as possible to total / 2: subset sum."],
      solution: `def crushed_stones(stones):
    total = sum(stones)
    half = total // 2
    dp = [True] + [False] * half
    for x in stones:
        for w in range(half, x - 1, -1):
            if dp[w - x]:
                dp[w] = True
    best = max(w for w in range(half + 1) if dp[w])
    return total - 2 * best`,
      why: "Every smashing order corresponds to splitting the stones into + and − groups, so minimise the difference of sums.", time: "O(n · total)",
      hidden: [["[1]", "1"], ["[1, 1]", "0"], ["[100] * 30", "0"], ["[1, 2, 4, 8, 16]", "1"]] },
    { id: "crew-heists", title: "Crew Heists", d: "Hard", lc: "profitable-schemes",
      statement: "A crew of `n` members. Heist i needs `group[i]` members and earns `profit[i]`; each member can join at most one heist. Count the subsets of heists that use at most `n` members and earn at least `min_profit` in total. Return the count modulo 10⁹ + 7.",
      examples: [["5, 3, [2, 2], [2, 3]", "2", "Heist 1 alone, or both heists."], ["10, 5, [2, 3, 5], [6, 7, 8]", "7", ""]],
      constraints: ["1 ≤ n ≤ 100", "0 ≤ min_profit ≤ 100", "1 ≤ number of heists ≤ 100"],
      hints: ["State: members used and profit so far, capped at min_profit (more doesn't matter).", "dp[m][p] = number of ways; 0/1 knapsack over heists, loop members backwards.", "Answer: sum of dp[m][min_profit] over all m ≤ n."],
      solution: `def crew_heists(n, min_profit, group, profit):
    MOD = 10**9 + 7
    dp = [[0] * (min_profit + 1) for _ in range(n + 1)]
    dp[0][0] = 1
    for g, p in zip(group, profit):
        for m in range(n, g - 1, -1):
            for q in range(min_profit, -1, -1):
                nq = min(min_profit, q + p)
                dp[m][nq] = (dp[m][nq] + dp[m - g][q]) % MOD
    return sum(dp[m][min_profit] for m in range(n + 1)) % MOD`,
      why: "Capping profit at min_profit keeps the table small while still counting every qualifying subset once.", time: "O(heists · n · min_profit)",
      hidden: [["1, 1, [1], [1]", "1"], ["1, 1, [2], [5]", "0"], ["100, 0, [1] * 20, [0] * 20", "1048576"]] }
  ]
});
