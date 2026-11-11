PAT("dp-1d", {
  time: "O(n)", space: "O(n) or O(1)",
  lede: "Define dp[i] as the answer for the first i items (or ending at i). Write how dp[i] depends on a few earlier values, fill the table left to right, and read the answer at the end.",
  idea: "Plain recursion re-solves the same subproblem again and again, which is exponential. If the answer for i only depends on answers for smaller i, **store** them: top-down with `@lru_cache`, or bottom-up with a list. Four questions get you there: what does `dp[i]` mean? what's the recurrence (what was the last choice)? what are the base cases? where's the answer? Often only the last one or two values matter, so memory drops to O(1).",
  analogy: "Climbing stairs and writing on each step how many ways there are to reach it. To fill in a step, you just look at the numbers on the one or two steps below it.",
  flavours: [["Shape", "Recurrence", "Examples"], [
    ["**Fibonacci-like**", "dp[i] = dp[i−1] + dp[i−2]", "climbing stairs, decode ways"],
    ["**Take or skip**", "dp[i] = max(dp[i−1], dp[i−2] + val[i])", "house robber, delete and earn"],
    ["**Best over earlier j**", "dp[i] = min/max over j < i of dp[j] + cost", "word break, job scheduling"],
    ["**Prefix DP**", "dp[i] = answer for s[:i]", "decode ways, word break"]]],
  signals: [["“Number of ways to …”", "count, often mod 10⁹ + 7"], ["“Maximum / minimum … with choices at each step”", "take or skip, cost of steps"], ["Can't take adjacent items", "house robber shape"], ["Splitting a string / array into valid pieces", "prefix DP"]],
  not: "**Not this pattern** when you must **list** every solution (→ backtracking), when a single greedy choice is provably optimal (→ greedy), or when the state needs two indices (→ 2-D DP: grid, two strings, intervals).",
  templates: [
    ["Bottom-up", "climb.py", `def climb_ways(n):                         # 1 or 2 steps at a time
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2                        # base cases
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]          # last move was 1 step or 2 steps
    return dp[n]

def rob(nums):                                 # O(1) memory version
    take, skip = 0, 0
    for x in nums:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)

print(climb_ways(5), rob([2, 7, 9, 3, 1]))`, "8 12"],
    ["Top-down (memo)", "memo.py", `from functools import lru_cache

def decode_ways(s):                            # '1'..'26' -> letters
    @lru_cache(maxsize=None)
    def go(i):
        if i == len(s):
            return 1
        if s[i] == "0":
            return 0
        ways = go(i + 1)                       # one digit
        if i + 1 < len(s) and int(s[i:i + 2]) <= 26:
            ways += go(i + 2)                  # two digits
        return ways
    return go(0)

print(decode_ways("226"), decode_ways("06"))`, "3 0"]
  ],
  examples: [
    { t: "House Robber II", d: "Medium", lc: "house-robber-ii", f: "Take or skip",
      q: "Houses in a circle; can't rob two neighbours. Max loot.",
      idea: "First and last are neighbours: answer = max(rob without the first house, rob without the last).",
      code: `def rob_line(a):
    take = skip = 0
    for x in a: take, skip = skip + x, max(take, skip)
    return max(take, skip)

def rob_circle(a):
    if len(a) == 1: return a[0]
    return max(rob_line(a[1:]), rob_line(a[:-1]))

print(rob_circle([2, 3, 2]), rob_circle([1, 2, 3, 1]))`, out: "3 4", cx: "O(n)" },
    { t: "Word Break", d: "Medium", lc: "word-break", f: "Prefix DP",
      q: "Can s be split into dictionary words?",
      idea: "dp[i] = True if s[:i] can be split. dp[i] is True if some dp[j] is True and s[j:i] is a word.",
      code: `def word_break(s, words):
    words = set(words)
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        dp[i] = any(dp[j] and s[j:i] in words for j in range(max(0, i - 20), i))
    return dp[-1]

print(word_break("leetcode", ["leet", "code"]), word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]))`, out: "True False", cx: "O(n · L)" },
    { t: "Delete and Earn", d: "Medium", lc: "delete-and-earn", f: "Reduce to robber",
      q: "Taking x earns x but deletes every x − 1 and x + 1. Max points.",
      idea: "Sum points per value; adjacent values can't both be taken — it's house robber over values.",
      code: `from collections import Counter

def delete_and_earn(nums):
    pts = Counter()
    for x in nums: pts[x] += x
    take = skip = 0
    prev = None
    for v in sorted(pts):
        if prev is not None and v == prev + 1:
            take, skip = skip + pts[v], max(take, skip)
        else:
            take, skip = max(take, skip) + pts[v], max(take, skip)
        prev = v
    return max(take, skip)

print(delete_and_earn([2, 2, 3, 3, 3, 4]))`, out: "9", cx: "O(n log n)" }
  ],
  pitfalls: [
    ["Not defining dp[i] precisely", "“Best for the first i items” and “best ending exactly at i” lead to different recurrences."],
    ["Wrong base cases", "Check dp[0] and dp[1] by hand; an empty prefix is usually 1 way (counting) or 0 (sums)."],
    ["Plain recursion without memo", "Exponential time. Add `@lru_cache(maxsize=None)`."],
    ["Forgetting the modulo", "Counting problems often say “mod 10⁹ + 7”; apply it at every addition."]
  ],
  edge: ["n = 0 or 1", "All zeros / negative values", "Leading '0' in decode ways", "Empty dictionary", "Very large n (O(1) memory)"],
  compare: [
    ["Backtracking", "backtracking", "Listing every solution is backtracking; counting them or finding the best is usually DP."],
    ["Greedy", "greedy", "Greedy picks once and never reconsiders; DP keeps the best for every prefix. Try greedy, prove it, else DP."],
    ["Knapsack DP", "knapsack", "When there's a capacity / budget dimension too, the state becomes dp[i][capacity]."]
  ],
  mcq: [
    ["House robber recurrence for best[i] (first i houses):", ["best[i] = best[i−1] + nums[i]", "best[i] = max(best[i−1], best[i−2] + nums[i])", "best[i] = max(nums)", "best[i] = best[i−2]"], 1, "Either skip house i, or rob it and add the best from two houses back."],
    ["What turns exponential recursion into DP?", ["Sorting", "Storing (memoising) answers to repeated subproblems", "Using a heap", "Iterating backwards"], 1, "Each distinct subproblem is solved once."]
  ],
  summary: {
    oneLine: "dp[i] from a few earlier dp values; define the state, recurrence, base cases, answer.",
    signals: ["Number of ways", "Max / min with a choice per step", "No two adjacent picks", "Split a string into valid pieces"],
    template: `dp = [0] * (n + 1)
dp[0] = BASE
for i in range(1, n + 1):
    dp[i] = combine(dp[i - 1], dp[i - 2], ...)
return dp[n]`,
    pitfalls: ["Define dp[i] precisely", "Check base cases", "Memoise recursion", "Apply the modulo"],
    cx: "O(n) time · O(n) or O(1) space",
    drill: { task: "House robber: return the maximum sum of non-adjacent values in `nums`.",
      ref: `def rob(nums):
    take = skip = 0
    for x in nums:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)`,
      tests: [["[1, 2, 3, 1]", "4"], ["[2, 7, 9, 3, 1]", "12"], ["[]", "0"]] }
  },
  problems: [
    { id: "step-ways", title: "Ways Up the Stairs", d: "Easy", lc: "climbing-stairs",
      statement: "You climb `n` stairs taking 1 or 2 steps at a time. Return the number of distinct ways to reach the top.",
      examples: [["2", "2", "1+1, 2"], ["3", "3", "1+1+1, 1+2, 2+1"]],
      constraints: ["1 ≤ n ≤ 90"],
      hints: ["The last move was either 1 step or 2 steps.", "ways(n) = ways(n − 1) + ways(n − 2)."],
      solution: `def step_ways(n):
    a, b = 1, 1
    for _ in range(n):
        a, b = b, a + b
    return a`,
      why: "Each step's count only needs the previous two: Fibonacci with O(1) memory.", time: "O(n)",
      hidden: [["1", "1"], ["5", "8"], ["90", "4660046610375530309"]] },
    { id: "trib-steps", title: "Three-Step Sequence", d: "Easy", lc: "n-th-tribonacci-number",
      statement: "T(0) = 0, T(1) = 1, T(2) = 1, and T(n) = T(n−1) + T(n−2) + T(n−3) for n ≥ 3. Return T(n).",
      examples: [["4", "4", "0, 1, 1, 2, 4"], ["25", "1389537", ""]],
      constraints: ["0 ≤ n ≤ 37"],
      hints: ["Keep the last three values.", "Slide them forward n times."],
      solution: `def trib(n):
    a, b, c = 0, 1, 1
    for _ in range(n):
        a, b, c = b, c, a + b + c
    return a`,
      why: "The recurrence only looks back three terms, so three variables suffice.", time: "O(n)",
      hidden: [["0", "0"], ["2", "1"], ["37", "2082876103"]] },
    { id: "cheap-climb", title: "Cheapest Climb", d: "Easy", lc: "min-cost-climbing-stairs",
      statement: "`cost[i]` is paid when you step on stair i. You may start on stair 0 or 1 and climb 1 or 2 stairs at a time. Return the minimum cost to get past the last stair.",
      examples: [["[10, 15, 20]", "15", "Start on 1, jump to the top."], ["[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]", "6", ""]],
      constraints: ["2 ≤ len(cost) ≤ 1000"],
      hints: ["dp[i] = cost to stand on stair i = cost[i] + min(dp[i−1], dp[i−2]).", "The top is reached from either of the last two stairs."],
      solution: `def cheap_climb(cost):
    a, b = cost[0], cost[1]
    for c in cost[2:]:
        a, b = b, c + min(a, b)
    return min(a, b)`,
      why: "Each stair's best cost depends only on the two below it.", time: "O(n)",
      hidden: [["[0, 0]", "0"], ["[5, 1]", "1"], ["[1] * 1000", "500"]] },
    { id: "street-thief", title: "Street Thief", d: "Medium", lc: "house-robber",
      statement: "Houses along a street hold `money[i]`. Robbing two **adjacent** houses triggers an alarm. Return the most money you can take.",
      examples: [["[1, 2, 3, 1]", "4", "Houses 0 and 2."], ["[2, 7, 9, 3, 1]", "12", "Houses 0, 2 and 4."]],
      constraints: ["1 ≤ len(money) ≤ 10⁵", "0 ≤ money[i] ≤ 400"],
      hints: ["For each house: rob it (plus the best from two back) or skip it (keep the best so far).", "Two running values are enough."],
      solution: `def street_thief(money):
    take = skip = 0
    for x in money:
        take, skip = skip + x, max(take, skip)
    return max(take, skip)`,
      why: "take/skip track the best total when the current house is robbed or not.", time: "O(n)",
      hidden: [["[5]", "5"], ["[2, 1, 1, 2]", "4"], ["[400] * 100000", "20000000"]] },
    { id: "circle-thief", title: "Circle Thief", d: "Medium", lc: "house-robber-ii",
      statement: "Same as Street Thief, but the houses form a **circle**: the first and last houses are neighbours.",
      examples: [["[2, 3, 2]", "3", ""], ["[1, 2, 3, 1]", "4", ""], ["[1, 2, 3]", "3", ""]],
      constraints: ["1 ≤ len(money) ≤ 10⁵"],
      hints: ["You can't take both the first and the last house.", "Solve the straight-line problem twice: without the first house, and without the last.", "Handle a single house separately."],
      solution: `def circle_thief(money):
    def line(a):
        take = skip = 0
        for x in a:
            take, skip = skip + x, max(take, skip)
        return max(take, skip)
    if len(money) == 1:
        return money[0]
    return max(line(money[1:]), line(money[:-1]))`,
      why: "Splitting into two linear cases removes the circular conflict.", time: "O(n)",
      hidden: [["[7]", "7"], ["[1, 1]", "1"], ["[5] * 100001", "250000"]] },
    { id: "decode-count", title: "Count Decodings", d: "Medium", lc: "decode-ways",
      statement: "Letters were encoded as `'A' → '1'`, …, `'Z' → '26'`. Return how many ways the digit string `s` can be decoded. (`'06'` can't be read as 6.)",
      examples: [["'12'", "2", "AB or L"], ["'226'", "3", ""], ["'06'", "0", ""]],
      constraints: ["1 ≤ len(s) ≤ 100", "the answer fits easily in Python ints"],
      hints: ["dp[i] = ways to decode s[:i].", "Add dp[i−1] if s[i−1] isn't '0'.", "Add dp[i−2] if s[i−2:i] is between '10' and '26'."],
      solution: `def decode_count(s):
    prev2, prev1 = 1, 1 if s[0] != "0" else 0
    for i in range(1, len(s)):
        cur = 0
        if s[i] != "0":
            cur += prev1
        if 10 <= int(s[i - 1:i + 1]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1`,
      why: "Each position extends decodings of the previous one or two characters.", time: "O(n)",
      hidden: [["'0'", "0"], ["'10'", "1"], ["'1' * 100", "573147844013817084101"]] },
    { id: "split-words", title: "Split Into Words", d: "Medium", lc: "word-break",
      statement: "Return `True` if `s` can be split into a sequence of one or more words from `words` (words may be reused).",
      examples: [["'leetcode', ['leet', 'code']", "True", ""], ["'applepenapple', ['apple', 'pen']", "True", ""], ["'catsandog', ['cats', 'dog', 'sand', 'and', 'cat']", "False", ""]],
      constraints: ["1 ≤ len(s) ≤ 300", "1 ≤ len(words) ≤ 1000", "1 ≤ len(words[i]) ≤ 20"],
      hints: ["dp[i] = can s[:i] be split?", "dp[i] is True if some earlier dp[j] is True and s[j:i] is a word.", "Only check j within the longest word length."],
      solution: `def split_words(s, words):
    wset = set(words)
    longest = max(map(len, words))
    dp = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - longest), i):
            if dp[j] and s[j:i] in wset:
                dp[i] = True
                break
    return dp[-1]`,
      why: "A split of s[:i] ends with some word s[j:i] whose prefix s[:j] is splittable.", time: "O(n · L)",
      hidden: [["'a', ['a']", "True"], ["'ab', ['a']", "False"], ["'a' * 300 + 'b', ['a', 'aa', 'aaa']", "False"]] },
    { id: "take-and-burn", title: "Take and Burn", d: "Medium", lc: "delete-and-earn",
      statement: "Pick any number x from `nums` to earn x points; every copy of x − 1 and x + 1 is then destroyed (other copies of x stay and can be picked too). Return the maximum points.",
      examples: [["[3, 4, 2]", "6", "Take 4 (burns 3), then 2."], ["[2, 2, 3, 3, 3, 4]", "9", "Take all three 3s."]],
      constraints: ["1 ≤ len(nums) ≤ 2·10⁴", "1 ≤ nums[i] ≤ 10⁴"],
      hints: ["Taking one x makes taking all copies of x free: total[x] = x × count.", "You can't take neighbouring values: it's the street thief problem over values 1..max."],
      solution: `def take_and_burn(nums):
    total = [0] * (max(nums) + 1)
    for x in nums:
        total[x] += x
    take = skip = 0
    for v in total:
        take, skip = skip + v, max(take, skip)
    return max(take, skip)`,
      why: "Values become houses on a street; adjacent values are adjacent houses.", time: "O(n + max)",
      hidden: [["[1]", "1"], ["[1, 1, 1, 2, 4, 5, 5, 5, 6]", "18"], ["[10000] * 20000", "200000000"]] },
    { id: "gig-scheduler", title: "Gig Scheduler", d: "Hard", lc: "maximum-profit-in-job-scheduling",
      statement: "Gig i runs from `start[i]` to `end[i]` and pays `pay[i]`. You can't do two gigs that overlap, but one may start exactly when another ends. Return the maximum total pay.",
      examples: [["[1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]", "120", "Gigs 1–3 and 3–6."], ["[1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]", "150", ""]],
      constraints: ["1 ≤ n ≤ 5·10⁴", "1 ≤ start < end ≤ 10⁹"],
      hints: ["Sort gigs by end time.", "dp[i] = best pay using the first i gigs = max(skip gig i, take it + best before it starts).", "Find “best before it starts” with binary search on end times."],
      solution: `def gig_scheduler(start, end, pay):
    gigs = sorted(zip(end, start, pay))
    ends = [e for e, _, _ in gigs]
    dp = [0] * (len(gigs) + 1)
    for i, (e, s, p) in enumerate(gigs):
        j = bisect_right(ends, s, 0, i)
        dp[i + 1] = max(dp[i], dp[j] + p)
    return dp[-1]`,
      why: "Sorted by end, the gigs compatible with gig i are exactly a prefix, found by binary search.", time: "O(n log n)",
      hidden: [["[1], [2], [5]", "5"], ["[1, 1, 1], [2, 3, 4], [5, 6, 4]", "6"], ["list(range(50000)), list(range(1, 50001)), [1] * 50000", "50000"]] }
  ]
});
