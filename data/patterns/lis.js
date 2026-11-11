PAT("lis", {
  time: "O(n log n)", space: "O(n)",
  lede: "The longest increasing subsequence. O(n²) DP is easy; the O(n log n) version keeps `tails[k]` = the smallest possible ending value of an increasing run of length k + 1, and binary-searches where each new number fits.",
  idea: "The DP `dp[i] = 1 + max(dp[j] for j < i with a[j] < a[i])` is O(n²). The faster idea: for each length, only the **smallest** tail matters (a smaller tail is easier to extend). `tails` stays sorted, so for each x find the first tail ≥ x with `bisect_left` and replace it (or append if x is bigger than all). The length of `tails` is the answer. Sorting by one key first turns 2-D problems (envelopes, pairs) into an LIS on the other key.",
  analogy: "Patience solitaire: deal cards into piles where each card goes on the leftmost pile whose top is at least as big. The number of piles you end up with is the length of the longest increasing run.",
  flavours: [["Variant", "Trick", "Examples"], [
    ["**Strictly increasing**", "`bisect_left`", "LIS length"],
    ["**Non-decreasing**", "`bisect_right`", "allow equal values"],
    ["**2-D (envelopes)**", "sort by width asc, height **desc**, then LIS on heights", "Russian dolls"],
    ["**Chains with a custom rule**", "O(n²) DP after sorting", "divisible subset, word chains"]]],
  signals: [["“Longest increasing / non-decreasing subsequence”", "classic LIS"], ["Nest boxes / envelopes / dolls", "sort + LIS"], ["Longest chain where each item follows a rule", "sort, then DP over earlier items"], ["“Minimum deletions to make it sorted”", "n − LIS"]],
  not: "**Not this pattern** when the subarray must be contiguous (→ sliding window / Kadane), or when two sequences are compared (→ LCS).",
  templates: [
    ["O(n log n)", "lis.py", `from bisect import bisect_left

def lis_length(nums):
    tails = []                                 # tails[k]: smallest tail of a length-(k+1) run
    for x in nums:
        i = bisect_left(tails, x)              # first tail >= x
        if i == len(tails):
            tails.append(x)                    # x extends the longest run
        else:
            tails[i] = x                       # x is a better (smaller) tail for length i+1
    return len(tails)

print(lis_length([10, 9, 2, 5, 3, 7, 101, 18]), lis_length([7, 7, 7]))`, "4 1"],
    ["O(n²) DP", "lis_dp.py", `def lis_dp(nums):
    dp = [1] * len(nums)                       # dp[i]: LIS ending at i
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp, default=0)

print(lis_dp([0, 1, 0, 3, 2, 3]))`, "4"]
  ],
  examples: [
    { t: "Russian Doll Envelopes", d: "Hard", lc: "russian-doll-envelopes", f: "2-D LIS",
      q: "Max envelopes you can nest (both width and height strictly larger).",
      idea: "Sort by width ascending and, for equal widths, height **descending** (so equal widths can't nest). Then LIS on heights.",
      code: `from bisect import bisect_left

def max_envelopes(env):
    env.sort(key=lambda e: (e[0], -e[1]))
    tails = []
    for _, h in env:
        i = bisect_left(tails, h)
        if i == len(tails): tails.append(h)
        else: tails[i] = h
    return len(tails)

print(max_envelopes([[5, 4], [6, 4], [6, 7], [2, 3]]))`, out: "3", cx: "O(n log n)" },
    { t: "Number of Longest Increasing Subsequences", d: "Medium", lc: "number-of-longest-increasing-subsequence", f: "Count",
      q: "How many LIS of maximum length exist?",
      idea: "Alongside length[i], keep count[i] = number of LIS ending at i; merge counts when lengths tie.",
      code: `def find_number_of_lis(nums):
    n = len(nums)
    length, count = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if length[j] + 1 > length[i]:
                    length[i], count[i] = length[j] + 1, count[j]
                elif length[j] + 1 == length[i]:
                    count[i] += count[j]
    best = max(length)
    return sum(c for l, c in zip(length, count) if l == best)

print(find_number_of_lis([1, 3, 5, 4, 7]), find_number_of_lis([2, 2, 2]))`, out: "2 3", cx: "O(n²)" }
  ],
  pitfalls: [
    ["Thinking `tails` is an actual LIS", "It has the right length but not necessarily a real subsequence."],
    ["bisect_left vs bisect_right", "Strictly increasing → left; non-decreasing → right."],
    ["Envelopes sorted by height ascending on ties", "Then two envelopes of equal width could nest; sort heights descending."],
    ["Using O(n²) on n = 10⁵", "That's 10¹⁰ steps; use the tails method."]
  ],
  edge: ["All equal", "Strictly decreasing", "Already sorted", "Single element", "Negative numbers"],
  compare: [
    ["1-D DP", "dp-1d", "The O(n²) LIS is 1-D DP where each state looks at every earlier one."],
    ["Binary Search", "binary-search", "The tails array stays sorted, which is what makes binary search possible."],
    ["DP on Two Strings", "two-strings-dp", "LCS compares two sequences; LIS of a is LCS(a, sorted unique a), but slower."]
  ],
  mcq: [
    ["What does tails[k] store?", ["The k-th element", "The smallest possible last value of an increasing subsequence of length k + 1", "The count of subsequences", "An actual LIS"], 1, "Keeping the smallest tail for each length makes future extension easiest."],
    ["Envelopes [w, h]: why sort equal widths by height descending?", ["To speed up sorting", "So envelopes with the same width can't form an increasing run in heights", "It doesn't matter", "To find the widest"], 1, "Same-width envelopes can't nest, and descending heights prevent the LIS from chaining them."]
  ],
  summary: {
    oneLine: "tails[k] = smallest tail of an increasing run of length k + 1; bisect each number into it.",
    signals: ["Longest increasing subsequence", "Nesting boxes / envelopes", "Longest chain with an ordering rule", "Min deletions to sort"],
    template: `tails = []
for x in nums:
    i = bisect_left(tails, x)
    if i == len(tails): tails.append(x)
    else: tails[i] = x
return len(tails)`,
    pitfalls: ["tails isn't a real LIS", "left vs right bisect", "Sort ties carefully for 2-D"],
    cx: "O(n log n) time · O(n) space",
    drill: { task: "Return the length of the longest strictly increasing subsequence, in O(n log n).",
      ref: `def lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
      tests: [["[10, 9, 2, 5, 3, 7, 101, 18]", "4"], ["[0, 1, 0, 3, 2, 3]", "4"], ["[7, 7, 7, 7]", "1"]] }
  },
  problems: [
    { id: "rising-picks", title: "Longest Rising Picks", d: "Medium", lc: "longest-increasing-subsequence",
      statement: "Return the length of the longest **strictly increasing** subsequence of `nums` (not necessarily contiguous).",
      examples: [["[10, 9, 2, 5, 3, 7, 101, 18]", "4", "2, 3, 7, 101"], ["[0, 1, 0, 3, 2, 3]", "4", ""], ["[7, 7, 7, 7]", "1", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["O(n²) DP works for small n but not 10⁵.", "Keep tails[k]: the smallest last value of an increasing run of length k + 1.", "Binary-search each number's position in tails."],
      solution: `def rising_picks(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)`,
      why: "tails stays sorted, so each number is placed in O(log n), and its length is the LIS length.", time: "O(n log n)",
      hidden: [["[1]", "1"], ["[5, 4, 3, 2, 1]", "1"], ["list(range(100000))", "100000"], ["[i % 1000 for i in range(100000)]", "1000"]] },
    { id: "rising-triplet", title: "Rising Triplet", d: "Medium", lc: "increasing-triplet-subsequence",
      statement: "Return `True` if there are indices `i < j < k` with `nums[i] < nums[j] < nums[k]`. Aim for O(n) time and O(1) space.",
      examples: [["[1, 2, 3, 4, 5]", "True", ""], ["[5, 4, 3, 2, 1]", "False", ""], ["[2, 1, 5, 0, 4, 6]", "True", "0, 4, 6"]],
      constraints: ["1 ≤ len(nums) ≤ 5·10⁵"],
      hints: ["This is LIS ≥ 3 with a tails array of size 2.", "Keep first (smallest so far) and second (smallest value that has something smaller before it)."],
      solution: `def rising_triplet(nums):
    first = second = inf
    for x in nums:
        if x <= first:
            first = x
        elif x <= second:
            second = x
        else:
            return True
    return False`,
      why: "first and second are tails[0] and tails[1]; anything bigger than both completes a triplet.", time: "O(n)",
      hidden: [["[1, 1, 1]", "False"], ["[20, 100, 10, 12, 5, 13]", "True"], ["list(range(500000, 0, -1))", "False"]] },
    { id: "pair-chain", title: "Longest Pair Chain", d: "Medium", lc: "maximum-length-of-pair-chain",
      statement: "Pair `[a, b]` (a < b) can follow `[c, d]` if `d < a`. Pairs may be used in any order. Return the length of the longest chain.",
      examples: [["[[1, 2], [2, 3], [3, 4]]", "2", "[1, 2] → [3, 4]"], ["[[1, 2], [7, 8], [4, 5]]", "3", ""]],
      constraints: ["1 ≤ len(pairs) ≤ 1000"],
      hints: ["Sort by end.", "Greedily take each pair that starts after the last end (like interval scheduling)."],
      solution: `def pair_chain(pairs):
    end, count = -inf, 0
    for a, b in sorted(pairs, key=lambda p: p[1]):
        if a > end:
            count += 1
            end = b
    return count`,
      why: "Finishing as early as possible leaves the most room, the same exchange argument as interval scheduling.", time: "O(n log n)",
      hidden: [["[[1, 2]]", "1"], ["[[1, 10], [2, 3], [4, 5]]", "2"], ["[[i, i + 1] for i in range(0, 2000, 2)]", "1000"]] },
    { id: "word-ladder-chain", title: "Word Growth Chain", d: "Medium", lc: "longest-string-chain",
      statement: "Word A is a *predecessor* of B if you can insert exactly one letter anywhere in A to get B. Return the length of the longest chain `w1 → w2 → …` where each word is a predecessor of the next, using words from `words`.",
      examples: [["['a', 'b', 'ba', 'bca', 'bda', 'bdca']", "4", "a → ba → bda → bdca"], ["['xbc', 'pcxbcf', 'xb', 'cxbc', 'pcxbc']", "5", ""], ["['abcd', 'dbqca']", "1", ""]],
      constraints: ["1 ≤ len(words) ≤ 1000", "1 ≤ len(words[i]) ≤ 16"],
      hints: ["Sort words by length.", "best[w] = 1 + max(best[w with one letter removed]) over all removal positions."],
      solution: `def word_growth(words):
    best = {}
    for w in sorted(words, key=len):
        best[w] = 1 + max((best.get(w[:i] + w[i + 1:], 0) for i in range(len(w))), default=0)
    return max(best.values())`,
      why: "Processing shorter words first guarantees every predecessor's answer is ready.", time: "O(n · L²)",
      hidden: [["['a']", "1"], ["['a', 'ab', 'abc', 'abcd']", "4"], ["['a' * k for k in range(1, 17)]", "16"]] },
    { id: "divisible-group", title: "Divisible Group", d: "Medium", lc: "largest-divisible-subset",
      statement: "`nums` has distinct positive integers. Return the size of the largest subset in which, for every pair, one divides the other.",
      examples: [["[1, 2, 3]", "2", "{1, 2} or {1, 3}"], ["[1, 2, 4, 8]", "4", ""]],
      constraints: ["1 ≤ len(nums) ≤ 1000", "1 ≤ nums[i] ≤ 2·10⁹"],
      hints: ["Sort ascending: then divisibility is transitive along a chain.", "dp[i] = 1 + max dp[j] for j < i with nums[i] % nums[j] == 0."],
      solution: `def divisible_group(nums):
    a = sorted(nums)
    dp = [1] * len(a)
    for i in range(len(a)):
        for j in range(i):
            if a[i] % a[j] == 0 and dp[j] + 1 > dp[i]:
                dp[i] = dp[j] + 1
    return max(dp)`,
      why: "After sorting, a divisible subset is a chain where each element divides the next: an LIS-style DP.", time: "O(n²)",
      hidden: [["[7]", "1"], ["[3, 4, 16, 8]", "3"], ["[2 ** i for i in range(31)]", "31"]] },
    { id: "count-longest-rises", title: "Count the Longest Rises", d: "Medium", lc: "number-of-longest-increasing-subsequence",
      statement: "Return how many strictly increasing subsequences have the **maximum** possible length.",
      examples: [["[1, 3, 5, 4, 7]", "2", "1,3,4,7 and 1,3,5,7"], ["[2, 2, 2, 2, 2]", "5", ""]],
      constraints: ["1 ≤ len(nums) ≤ 2000"],
      hints: ["For each i keep length[i] and count[i] of the LIS ending at i.", "A longer extension replaces the count; an equal one adds to it."],
      solution: `def count_longest(nums):
    n = len(nums)
    length, count = [1] * n, [1] * n
    for i in range(n):
        for j in range(i):
            if nums[j] < nums[i]:
                if length[j] + 1 > length[i]:
                    length[i] = length[j] + 1
                    count[i] = count[j]
                elif length[j] + 1 == length[i]:
                    count[i] += count[j]
    best = max(length)
    return sum(c for l, c in zip(length, count) if l == best)`,
      why: "Counts flow along the same edges as lengths; summing over endpoints with the best length gives the total.", time: "O(n²)",
      hidden: [["[1]", "1"], ["[1, 2, 4, 3, 5, 4, 7, 2]", "3"], ["list(range(2000))", "1"]] },
    { id: "nesting-boxes", title: "Nesting Boxes", d: "Hard", lc: "russian-doll-envelopes",
      statement: "Box `[w, h]` fits inside another if both its width and height are strictly smaller. Return the maximum number of boxes you can nest one inside another (no rotating).",
      examples: [["[[5, 4], [6, 4], [6, 7], [2, 3]]", "3", "[2,3] → [5,4] → [6,7]"], ["[[1, 1], [1, 1], [1, 1]]", "1", ""]],
      constraints: ["1 ≤ len(boxes) ≤ 10⁵"],
      hints: ["Sort by width ascending.", "For equal widths sort height **descending**, so they can't chain.", "Now find the LIS of heights in O(n log n)."],
      solution: `def nesting_boxes(boxes):
    tails = []
    for _, h in sorted(boxes, key=lambda b: (b[0], -b[1])):
        i = bisect_left(tails, h)
        if i == len(tails):
            tails.append(h)
        else:
            tails[i] = h
    return len(tails)`,
      why: "The sort fixes the width order; the LIS on heights then only picks boxes that grow in both dimensions.", time: "O(n log n)",
      hidden: [["[[1, 2]]", "1"], ["[[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]]", "4"], ["[[i, i] for i in range(100000)]", "100000"]] }
  ]
});
