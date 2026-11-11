PAT("interval-dp", {
  time: "O(n²) – O(n³)", space: "O(n²)",
  lede: "dp[l][r] answers the question for the substring or subarray from l to r. Solve short ranges first, then build longer ones from them: by trimming the ends, or by trying every split point k in between.",
  idea: "Some problems don't shrink from one end; they shrink from **both** ends, or split into a left part and a right part. Then the state is a range `[l, r]`. Two shapes cover most cases: **ends** (`s[l] == s[r]` → use dp[l+1][r−1], else take the better of dropping either end) and **split** (`dp[l][r] = best over k of dp[l][k] + dp[k][r] + cost`). Fill by increasing length so smaller ranges are ready.",
  analogy: "Folding a strip of paper: to know how the whole strip folds, you first work out how every shorter piece folds, then combine pieces.",
  flavours: [["Shape", "Recurrence", "Examples"], [
    ["**Ends**", "match ends → inner range; else drop one end", "longest palindromic subsequence, min insertions"],
    ["**Expand around centre**", "grow from each centre while ends match", "longest palindromic substring, count palindromes"],
    ["**Split point**", "best over k of left + right + cost of merging", "burst balloons, cut a stick, matrix chain"],
    ["**Game**", "my score − opponent's best on the rest", "predict the winner, stone game"]]],
  signals: [["Palindromic substrings / subsequences", "ranges that shrink from both ends"], ["“Burst”, “merge”, “cut” with costs that depend on neighbours", "split-point DP"], ["Two players take from **either end** of a row", "game DP on ranges"], ["n ≤ ~500 and an O(n³) feel", "interval DP is often the intended solution"]],
  not: "**Not this pattern** when the subproblem is a prefix (→ 1-D DP) or two prefixes of two different strings (→ DP on two strings).",
  templates: [
    ["Ends", "palindrome_subseq.py", `def longest_pal_subseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for l in range(n - 1, -1, -1):             # shorter ranges first
        dp[l][l] = 1
        for r in range(l + 1, n):
            if s[l] == s[r]:
                dp[l][r] = dp[l + 1][r - 1] + 2
            else:
                dp[l][r] = max(dp[l + 1][r], dp[l][r - 1])
    return dp[0][n - 1]

print(longest_pal_subseq("bbbab"), longest_pal_subseq("cbbd"))`, "4 2"],
    ["Split point", "burst.py", `def max_coins(nums):                          # burst balloons
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]           # dp[l][r]: best inside (l, r), exclusive
    for length in range(2, n):
        for l in range(n - length):
            r = l + length
            for k in range(l + 1, r):          # k is the LAST balloon burst inside
                dp[l][r] = max(dp[l][r], dp[l][k] + dp[k][r] + a[l] * a[k] * a[r])
    return dp[0][n - 1]

print(max_coins([3, 1, 5, 8]))`, "167"]
  ],
  examples: [
    { t: "Longest Palindromic Substring", d: "Medium", lc: "longest-palindromic-substring", f: "Expand around centre",
      q: "Return the longest palindromic substring.",
      idea: "Every palindrome has a centre (a character or a gap). Expand from all 2n − 1 centres.",
      code: `def longest_pal(s):
    best = ""
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1; r += 1
        if r - l - 1 > len(best):
            best = s[l + 1:r]
    return best

print(longest_pal("babad"), longest_pal("cbbd"))`, out: "bab bb", cx: "O(n²) · O(1)" },
    { t: "Predict the Winner", d: "Medium", lc: "predict-the-winner", f: "Game",
      q: "Two players alternately take a number from either end. Can player 1 end with at least as much?",
      idea: "dp[l][r] = best (my total − opponent's total) on nums[l..r] for the player to move.",
      code: `def predict(nums):
    n = len(nums)
    dp = nums[:]                                  # length-1 ranges
    for length in range(2, n + 1):
        for l in range(n - length + 1):
            r = l + length - 1
            dp[l] = max(nums[l] - dp[l + 1], nums[r] - dp[l])
    return dp[0] >= 0

print(predict([1, 5, 2]), predict([1, 5, 233, 7]))`, out: "False True", cx: "O(n²)" }
  ],
  pitfalls: [
    ["Wrong fill order", "dp[l][r] needs shorter ranges: iterate by length, or l from right to left."],
    ["Burst balloons: choosing the first balloon", "Think of k as the **last** one burst in (l, r); then its neighbours are l and r."],
    ["Off-by-one with inclusive vs exclusive ranges", "Decide whether dp[l][r] includes the ends and stick to it."],
    ["O(n³) on n = 10⁵", "Interval DP is for small n; check the constraints first."]
  ],
  edge: ["Length 1", "All characters equal", "Already a palindrome", "Two elements", "Even vs odd length"],
  compare: [
    ["DP on Two Strings", "two-strings-dp", "Longest palindromic subsequence = LCS(s, reversed s)."],
    ["Two Pointers", "two-pointers", "Checking one palindrome is two pointers; finding the best one is interval DP or centre expansion."],
    ["1-D DP", "dp-1d", "Minimum palindrome cuts combines a 1-D DP over prefixes with a palindrome table."]
  ],
  mcq: [
    ["In burst balloons, why let k be the **last** balloon burst in (l, r)?", ["It's faster", "Then its neighbours at the moment it bursts are exactly l and r", "To sort balloons", "It isn't necessary"], 1, "Choosing the first burst would leave neighbours that depend on later choices."],
    ["How many centres must you expand from to find all palindromic substrings?", ["n", "2n − 1", "n²", "n / 2"], 1, "n characters plus n − 1 gaps between them."]
  ],
  summary: {
    oneLine: "dp[l][r] over ranges, filled by increasing length: shrink both ends or try every split k.",
    signals: ["Palindromic substrings / subsequences", "Burst / merge / cut with neighbour costs", "Take from either end games", "Small n, O(n³) feel"],
    template: `for length in range(2, n + 1):
    for l in range(n - length + 1):
        r = l + length - 1
        dp[l][r] = best over k in (l, r) of
                   dp[l][k] + dp[k][r] + cost(l, k, r)`,
    pitfalls: ["Fill shorter ranges first", "Last-burst trick", "Check n is small"],
    cx: "O(n²)–O(n³) time · O(n²) space",
    drill: { task: "Return the length of the longest palindromic **subsequence** of `s`.",
      ref: `def lps(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for l in range(n - 1, -1, -1):
        dp[l][l] = 1
        for r in range(l + 1, n):
            if s[l] == s[r]:
                dp[l][r] = dp[l + 1][r - 1] + 2
            else:
                dp[l][r] = max(dp[l + 1][r], dp[l][r - 1])
    return dp[0][n - 1]`,
      tests: [["'bbbab'", "4"], ["'cbbd'", "2"], ["'a'", "1"]] }
  },
  problems: [
    { id: "almost-mirror", title: "Almost a Mirror", d: "Easy", lc: "valid-palindrome-ii",
      statement: "Return `True` if `s` can become a palindrome after deleting **at most one** character.",
      examples: [["'aba'", "True", ""], ["'abca'", "True", "Delete 'c' (or 'b')."], ["'abc'", "False", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["Compare from both ends.", "At the first mismatch, try skipping the left character or the right one; check the rest is a palindrome."],
      solution: `def almost_mirror(s):
    def pal(l, r):
        while l < r:
            if s[l] != s[r]:
                return False
            l, r = l + 1, r - 1
        return True
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]:
            return pal(l + 1, r) or pal(l, r - 1)
        l, r = l + 1, r - 1
    return True`,
      why: "Only the first mismatch needs a decision, and each option is checked in linear time.", time: "O(n)",
      hidden: [["'a'", "True"], ["'deeee'", "True"], ["'ab' * 50000", "True"], ["'abcd' * 1000", "False"]] },
    { id: "longest-mirror", title: "Longest Mirror Substring", d: "Medium", lc: "longest-palindromic-substring",
      statement: "Return the longest substring of `s` that is a palindrome. If several have the maximum length, return the **leftmost** one.",
      examples: [["'babad'", "'bab'", "'aba' is equally long but starts later."], ["'cbbd'", "'bb'", ""]],
      constraints: ["1 ≤ len(s) ≤ 1000"],
      hints: ["Every palindrome is centred on a character or between two characters.", "Expand outward from each of the 2n − 1 centres while the ends match.", "Only replace the best on a strictly longer palindrome to keep the leftmost."],
      solution: `def longest_mirror(s):
    best = s[0]
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        if r - l - 1 > len(best):
            best = s[l + 1:r]
    return best`,
      why: "Centre expansion examines every palindrome by its centre in O(n²) total with O(1) memory.", time: "O(n²)",
      hidden: [["'a'", "'a'"], ["'ac'", "'a'"], ["'a' * 1000", "'a' * 1000"], ["'abacdfgdcaba'", "'aba'"]] },
    { id: "mirror-count", title: "Count Mirror Substrings", d: "Medium", lc: "palindromic-substrings",
      statement: "Return how many substrings of `s` are palindromes (substrings at different positions count separately).",
      examples: [["'abc'", "3", ""], ["'aaa'", "6", "a, a, a, aa, aa, aaa"]],
      constraints: ["1 ≤ len(s) ≤ 1000"],
      hints: ["Expand from each centre.", "Every successful expansion step is one more palindrome."],
      solution: `def mirror_count(s):
    total = 0
    for c in range(2 * len(s) - 1):
        l, r = c // 2, (c + 1) // 2
        while l >= 0 and r < len(s) and s[l] == s[r]:
            total += 1
            l -= 1
            r += 1
    return total`,
      why: "Each palindrome is found exactly once, from its own centre.", time: "O(n²)",
      hidden: [["'a'", "1"], ["'abba'", "6"], ["'a' * 1000", "500500"]] },
    { id: "mirror-subseq", title: "Longest Mirror Subsequence", d: "Medium", lc: "longest-palindromic-subsequence",
      statement: "Return the length of the longest **subsequence** of `s` (characters in order, not necessarily contiguous) that reads the same forwards and backwards.",
      examples: [["'bbbab'", "4", "'bbbb'"], ["'cbbd'", "2", ""]],
      constraints: ["1 ≤ len(s) ≤ 1000"],
      hints: ["dp[l][r] = answer for s[l..r].", "Equal ends: dp[l+1][r−1] + 2. Otherwise max(dp[l+1][r], dp[l][r−1]).", "Fill l from right to left."],
      solution: `def mirror_subseq(s):
    n = len(s)
    dp = [0] * n
    for l in range(n - 1, -1, -1):
        new = [0] * n
        new[l] = 1
        for r in range(l + 1, n):
            if s[l] == s[r]:
                new[r] = dp[r - 1] + 2
            else:
                new[r] = max(dp[r], new[r - 1])
        dp = new
    return dp[n - 1]`,
      why: "Only the row for l + 1 is needed to compute row l, so memory drops to O(n).", time: "O(n²)",
      hidden: [["'a'", "1"], ["'abcba'", "5"], ["'ab' * 500", "999"]] },
    { id: "end-picking-game", title: "End-Picking Game", d: "Medium", lc: "predict-the-winner",
      statement: "Two players take turns removing a number from **either end** of `nums`, adding it to their score; both play optimally. Return `True` if the first player's final score is at least the second player's.",
      examples: [["[1, 5, 2]", "False", ""], ["[1, 5, 233, 7]", "True", ""]],
      constraints: ["1 ≤ len(nums) ≤ 1000", "0 ≤ nums[i] ≤ 10⁷"],
      hints: ["dp[l][r] = (score of the player to move) − (score of the other) on nums[l..r].", "dp[l][r] = max(nums[l] − dp[l+1][r], nums[r] − dp[l][r−1]).", "Player 1 wins if dp[0][n−1] ≥ 0."],
      solution: `def end_picking(nums):
    n = len(nums)
    dp = nums[:]
    for length in range(2, n + 1):
        for l in range(n - length + 1):
            r = l + length - 1
            dp[l] = max(nums[l] - dp[l + 1], nums[r] - dp[l])
    return dp[0] >= 0`,
      why: "Storing score differences makes the opponent's best play a simple subtraction.", time: "O(n²)",
      hidden: [["[5]", "True"], ["[1, 1]", "True"], ["[1, 1000, 1] * 333 + [1]", "True"]] },
    { id: "fewest-inserts-mirror", title: "Fewest Inserts to Mirror", d: "Hard", lc: "minimum-insertion-steps-to-make-a-string-palindrome",
      statement: "Return the minimum number of characters to insert anywhere in `s` to make it a palindrome.",
      examples: [["'zzazz'", "0", ""], ["'mbadm'", "2", "'mbdadbm'"], ["'leetcode'", "5", ""]],
      constraints: ["1 ≤ len(s) ≤ 500"],
      hints: ["Characters that are already part of a palindromic subsequence can stay.", "Answer = n − (longest palindromic subsequence)."],
      solution: `def fewest_inserts(s):
    n = len(s)
    dp = [0] * n
    for l in range(n - 1, -1, -1):
        new = [0] * n
        new[l] = 1
        for r in range(l + 1, n):
            if s[l] == s[r]:
                new[r] = dp[r - 1] + 2
            else:
                new[r] = max(dp[r], new[r - 1])
        dp = new
    return n - dp[n - 1]`,
      why: "Every character outside the longest palindromic subsequence needs exactly one mirrored insertion.", time: "O(n²)",
      hidden: [["'a'", "0"], ["'ab'", "1"], ["'abc' * 166", "167"]] },
    { id: "pop-the-bubbles", title: "Pop the Bubbles", d: "Hard", lc: "burst-balloons",
      statement: "Bubbles in a row have values `nums`. Popping bubble i earns `left × nums[i] × right`, where left and right are its current neighbours' values (1 if there's no neighbour). The popped bubble disappears. Return the maximum total you can earn popping them all.",
      examples: [["[3, 1, 5, 8]", "167", "3·1·5 + 3·5·8 + 1·3·8 + 1·8·1"], ["[1, 5]", "10", ""]],
      constraints: ["1 ≤ len(nums) ≤ 300", "0 ≤ nums[i] ≤ 100"],
      hints: ["Pad with 1 at both ends.", "dp[l][r] = best for the bubbles strictly between l and r.", "Choose k as the **last** bubble popped between them: dp[l][k] + dp[k][r] + a[l]·a[k]·a[r]."],
      solution: `def pop_bubbles(nums):
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n):
        for l in range(n - length):
            r = l + length
            best = 0
            for k in range(l + 1, r):
                v = dp[l][k] + dp[k][r] + a[l] * a[k] * a[r]
                if v > best:
                    best = v
            dp[l][r] = best
    return dp[0][n - 1]`,
      why: "Fixing the last bubble in a range splits it into two independent ranges whose neighbours are known.", time: "O(n³)",
      hidden: [["[7]", "7"], ["[0, 0]", "0"], ["[1] * 60", "60"]] },
    { id: "cut-the-rod", title: "Cut the Rod", d: "Hard", lc: "minimum-cost-to-cut-a-stick",
      statement: "A rod of length `n` must be cut at every position in `cuts` (in any order you like). Each cut costs the current length of the piece being cut. Return the minimum total cost.",
      examples: [["7, [1, 3, 4, 5]", "16", ""], ["9, [5, 6, 1, 4, 2]", "22", ""]],
      constraints: ["2 ≤ n ≤ 10⁶", "1 ≤ len(cuts) ≤ 100"],
      hints: ["Sort the cuts and add 0 and n as ends.", "dp[i][j] = cheapest way to make all cuts strictly between ends i and j.", "Try every cut k in between as the first one: dp[i][k] + dp[k][j] + (pos[j] − pos[i])."],
      solution: `def cut_the_rod(n, cuts):
    pos = [0] + sorted(cuts) + [n]
    m = len(pos)
    dp = [[0] * m for _ in range(m)]
    for length in range(2, m):
        for i in range(m - length):
            j = i + length
            dp[i][j] = min(dp[i][k] + dp[k][j] for k in range(i + 1, j)) + pos[j] - pos[i]
    return dp[0][m - 1]`,
      why: "Whichever cut happens first in a segment splits it into two independent segments.", time: "O(c³)",
      hidden: [["2, [1]", "2"], ["10, [5]", "10"], ["1000000, list(range(1, 101))", "1000672"]] }
  ]
});
