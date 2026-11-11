PAT("two-strings-dp", {
  time: "O(m·n)", space: "O(m·n) or O(n)",
  lede: "dp[i][j] answers the question for the first i characters of one string and the first j of the other. Compare the last characters: if they match, extend dp[i−1][j−1]; otherwise take the best of dropping a character from either side.",
  idea: "Whenever two sequences are compared with insertions, deletions or skips, the subproblems are **prefix pairs**. Look at `a[i−1]` and `b[j−1]`: matching characters move diagonally; mismatches try `dp[i−1][j]` (drop from a), `dp[i][j−1]` (drop from b) and sometimes `dp[i−1][j−1]` (substitute). Row 0 and column 0 are the “empty string” base cases. Only the previous row is needed, so memory can be O(n).",
  analogy: "Lining up two DNA strands to see how alike they are: at each step you either pair the current letters, or slide one strand past a letter.",
  flavours: [["Problem", "On match", "On mismatch"], [
    ["**Longest common subsequence**", "dp[i−1][j−1] + 1", "max(dp[i−1][j], dp[i][j−1])"],
    ["**Edit distance**", "dp[i−1][j−1]", "1 + min(delete, insert, replace)"],
    ["**Longest common substring**", "dp[i−1][j−1] + 1", "0 (must be contiguous)"],
    ["**Count / match patterns**", "depends", "wildcards, regex, distinct subsequences"]]],
  signals: [["Two strings and “longest common…”, “minimum edits / deletions”", "prefix-pair DP"], ["“Can s3 be formed by interleaving s1 and s2?”", "dp[i][j] over both prefixes"], ["Pattern matching with `*` or `?` or `.`", "wildcard / regex DP"], ["“Number of distinct subsequences of s equal to t”", "counting DP"]],
  not: "**Not this pattern** for exact substring search (→ KMP / hashing), anagram questions (→ counting), or a single string's palindromes (→ interval DP).",
  templates: [
    ["LCS", "lcs.py", `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # row/col 0 = empty prefix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1     # use both characters
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # skip one
    return dp[m][n]

print(lcs("abcde", "ace"), lcs("abc", "def"))`, "3 0"],
    ["Edit distance", "edit.py", `def edit_distance(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))                    # turning "" into b[:j] costs j
    for i in range(1, m + 1):
        cur = [i] + [0] * n                      # turning a[:i] into "" costs i
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j],        # delete a[i-1]
                                 cur[j - 1],     # insert b[j-1]
                                 prev[j - 1])    # replace
        prev = cur
    return prev[n]

print(edit_distance("horse", "ros"), edit_distance("intention", "execution"))`, "3 5"]
  ],
  examples: [
    { t: "Interleaving String", d: "Medium", lc: "interleaving-string", f: "Feasibility",
      q: "Is s3 an interleaving of s1 and s2 (keeping each one's order)?",
      idea: "dp[i][j]: can s3[:i+j] be made from s1[:i] and s2[:j]? The last character came from s1 or s2.",
      code: `def is_interleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3): return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i and s1[i - 1] == s3[i + j - 1] and dp[i - 1][j]: dp[i][j] = True
            if j and s2[j - 1] == s3[i + j - 1] and dp[i][j - 1]: dp[i][j] = True
    return dp[m][n]

print(is_interleave("aabcc", "dbbca", "aadbbcbcac"), is_interleave("aabcc", "dbbca", "aadbbbaccc"))`, out: "True False", cx: "O(m·n)" },
    { t: "Wildcard Matching", d: "Hard", lc: "wildcard-matching", f: "Pattern",
      q: "'?' matches one character, '*' matches any sequence. Does the pattern match the whole string?",
      idea: "dp[i][j] for s[:i], p[:j]. '*' either matches nothing (dp[i][j−1]) or one more character (dp[i−1][j]).",
      code: `def is_match(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] and p[j - 1] == "*"
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 1] or dp[i - 1][j]
            elif p[j - 1] in ("?", s[i - 1]):
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]

print(is_match("adceb", "*a*b"), is_match("acdcb", "a*c?b"))`, out: "True False", cx: "O(m·n)" }
  ],
  pitfalls: [
    ["Off-by-one between dp indices and string indices", "dp[i][j] uses characters a[i−1] and b[j−1]."],
    ["Missing base row / column", "Empty-vs-prefix answers (0, i, j, or True for leading `*`) must be filled first."],
    ["Substring vs subsequence", "Contiguous (substring) resets to 0 on mismatch; subsequence carries the max forward."],
    ["O(m·n) memory on big inputs", "Only the previous row is needed: keep two rows."]
  ],
  edge: ["One or both strings empty", "Identical strings", "No common characters", "Pattern of only `*`", "Repeated characters"],
  compare: [
    ["Grid DP", "grid-dp", "Same table-filling shape; here the grid axes are positions in two strings."],
    ["Interval DP & Palindromes", "interval-dp", "Longest palindromic subsequence is LCS of s and reversed(s), or interval DP on one string."],
    ["String Matching", "string-matching", "Exact matches use KMP; matches with edits or wildcards need DP."]
  ],
  mcq: [
    ["In edit distance, when a[i−1] == b[j−1], dp[i][j] is…", ["dp[i−1][j−1] + 1", "dp[i−1][j−1]", "min of three + 1", "0"], 1, "Matching characters cost nothing."],
    ["Longest common **substring**: on a mismatch dp[i][j] becomes…", ["max(dp[i−1][j], dp[i][j−1])", "0", "dp[i−1][j−1]", "1"], 1, "A substring must be contiguous, so the run breaks."]
  ],
  summary: {
    oneLine: "dp[i][j] over prefixes of both strings; match → diagonal, mismatch → best of dropping one side.",
    signals: ["Longest common subsequence / substring", "Minimum edits / deletions", "Interleaving", "Wildcards and regex"],
    template: `dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
        if a[i-1] == b[j-1]:
            dp[i][j] = dp[i-1][j-1] + 1
        else:
            dp[i][j] = max(dp[i-1][j], dp[i][j-1])`,
    pitfalls: ["dp index i ↔ char i − 1", "Fill base row / column", "Substring resets to 0"],
    cx: "O(m·n) time · O(n) with rolling rows",
    drill: { task: "Return the minimum number of single-character inserts, deletes or replaces to turn `a` into `b`.",
      ref: `def edit_distance(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[n]`,
      tests: [["'horse', 'ros'", "3"], ["'intention', 'execution'", "5"], ["'', 'abc'", "3"]] }
  },
  problems: [
    { id: "hidden-inside", title: "Hidden Inside", d: "Easy", lc: "is-subsequence",
      statement: "Return `True` if `s` is a subsequence of `t`: you can delete some characters of `t` (without reordering) to get `s`.",
      examples: [["'abc', 'ahbgdc'", "True", ""], ["'axc', 'ahbgdc'", "False", ""]],
      constraints: ["0 ≤ len(s) ≤ 100", "0 ≤ len(t) ≤ 10⁴"],
      hints: ["Walk through t; advance in s only when characters match.", "(The DP view: dp[i][j] = is s[:i] a subsequence of t[:j]?)"],
      solution: `def hidden_inside(s, t):
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:
            i += 1
    return i == len(s)`,
      why: "Greedily matching the earliest possible character is always safe for subsequences.", time: "O(len t)",
      hidden: [["'', 'abc'", "True"], ["'abc', ''", "False"], ["'a' * 100, 'ab' * 5000", "True"]] },
    { id: "shared-thread", title: "Shared Thread", d: "Medium", lc: "longest-common-subsequence",
      statement: "Return the length of the longest **subsequence** common to `a` and `b` (characters in order, not necessarily contiguous).",
      examples: [["'abcde', 'ace'", "3", "'ace'"], ["'abc', 'abc'", "3", ""], ["'abc', 'def'", "0", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 1000"],
      hints: ["dp[i][j] = LCS of a[:i] and b[:j].", "Match: dp[i−1][j−1] + 1. Otherwise max(dp[i−1][j], dp[i][j−1]).", "Two rows are enough."],
      solution: `def shared_thread(a, b):
    n = len(b)
    prev = [0] * (n + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (n + 1)
        ai = a[i - 1]
        for j in range(1, n + 1):
            if ai == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = cur[j - 1] if cur[j - 1] > prev[j] else prev[j]
        prev = cur
    return prev[n]`,
      why: "Each prefix pair's answer comes from at most three smaller prefix pairs.", time: "O(m·n)",
      hidden: [["'a', 'a'", "1"], ["'bsbininm', 'jmjkbkjkv'", "1"], ["'ab' * 500, 'ba' * 500", "999"]] },
    { id: "edit-steps", title: "Edit Steps", d: "Medium", lc: "edit-distance",
      statement: "Return the minimum number of operations (insert a character, delete a character, replace a character) to turn `a` into `b`.",
      examples: [["'horse', 'ros'", "3", "horse → rorse → rose → ros"], ["'intention', 'execution'", "5", ""]],
      constraints: ["0 ≤ len(a), len(b) ≤ 500"],
      hints: ["dp[i][j] = edits to turn a[:i] into b[:j].", "Base cases: dp[i][0] = i, dp[0][j] = j.", "Mismatch: 1 + min(delete, insert, replace)."],
      solution: `def edit_steps(a, b):
    m, n = len(a), len(b)
    prev = list(range(n + 1))
    for i in range(1, m + 1):
        cur = [i] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[n]`,
      why: "The last operation is a delete, an insert, a replace or a free match; each reduces to a smaller prefix pair.", time: "O(m·n)",
      hidden: [["'', ''", "0"], ["'abc', ''", "3"], ["'a' * 500, 'b' * 500", "500"]] },
    { id: "trim-to-match", title: "Trim to Match", d: "Medium", lc: "delete-operation-for-two-strings",
      statement: "In one step you delete one character from either string. Return the minimum number of steps to make `a` and `b` equal.",
      examples: [["'sea', 'eat'", "2", "Delete s and t."], ["'leetcode', 'etco'", "4", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 500"],
      hints: ["What's left at the end is a common subsequence.", "Keep the longest one: answer = len(a) + len(b) − 2 · LCS."],
      solution: `def trim_to_match(a, b):
    n = len(b)
    prev = [0] * (n + 1)
    for i in range(1, len(a) + 1):
        cur = [0] * (n + 1)
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur
    return len(a) + len(b) - 2 * prev[n]`,
      why: "Minimising deletions = maximising what you keep, which is the LCS.", time: "O(m·n)",
      hidden: [["'a', 'a'", "0"], ["'a', 'b'", "2"], ["'ab' * 250, 'b' * 250", "250"]] },
    { id: "cheapest-trim", title: "Cheapest Trim", d: "Medium", lc: "minimum-ascii-delete-sum-for-two-strings",
      statement: "Deleting a character costs its ASCII code (`ord`). Return the minimum total cost of deletions from `a` and `b` to make them equal.",
      examples: [["'sea', 'eat'", "231", "Delete 's' (115) and 't' (116)."], ["'delete', 'leet'", "403", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 1000"],
      hints: ["dp[i][j] = cheapest cost to make a[:i] and b[:j] equal.", "Match: dp[i−1][j−1]. Otherwise min(delete a[i−1], delete b[j−1]).", "Base row/column: the cost of deleting a whole prefix."],
      solution: `def cheapest_trim(a, b):
    m, n = len(a), len(b)
    prev = [0] * (n + 1)
    for j in range(1, n + 1):
        prev[j] = prev[j - 1] + ord(b[j - 1])
    for i in range(1, m + 1):
        cur = [prev[0] + ord(a[i - 1])] + [0] * n
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = min(prev[j] + ord(a[i - 1]), cur[j - 1] + ord(b[j - 1]))
        prev = cur
    return prev[n]`,
      why: "Same shape as edit distance with deletions only, weighted by character codes.", time: "O(m·n)",
      hidden: [["'a', 'a'", "0"], ["'a', 'b'", "195"], ["'a' * 1000, 'b' * 1000", "195000"]] },
    { id: "longest-shared-run", title: "Longest Shared Run", d: "Medium", lc: "maximum-length-of-repeated-subarray",
      statement: "Return the length of the longest **contiguous** run of values that appears in both lists `a` and `b`.",
      examples: [["[1, 2, 3, 2, 1], [3, 2, 1, 4, 7]", "3", "[3, 2, 1]"], ["[0, 0, 0], [0, 0]", "2", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 1000"],
      hints: ["dp[i][j] = length of the common run ending at a[i−1] and b[j−1].", "Match: dp[i−1][j−1] + 1. Mismatch: 0.", "Track the maximum."],
      solution: `def longest_shared_run(a, b):
    n = len(b)
    prev = [0] * (n + 1)
    best = 0
    for i in range(1, len(a) + 1):
        cur = [0] * (n + 1)
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
                if cur[j] > best:
                    best = cur[j]
        prev = cur
    return best`,
      why: "A contiguous match can only extend the diagonal run; any mismatch breaks it.", time: "O(m·n)",
      hidden: [["[1], [2]", "0"], ["[1, 2], [1, 2]", "2"], ["list(range(1000)), list(range(500, 1500))", "500"]] },
    { id: "zip-strings", title: "Zip Two Strings", d: "Medium", lc: "interleaving-string",
      statement: "Return `True` if `s3` can be formed by interleaving `s1` and `s2`: using all their characters while keeping each string's own order.",
      examples: [["'aabcc', 'dbbca', 'aadbbcbcac'", "True", ""], ["'aabcc', 'dbbca', 'aadbbbaccc'", "False", ""], ["'', '', ''", "True", ""]],
      constraints: ["0 ≤ len(s1), len(s2) ≤ 100"],
      hints: ["The lengths must add up.", "dp[i][j] = can s3[:i+j] be built from s1[:i] and s2[:j]?", "The last character came from s1 or from s2."],
      solution: `def zip_strings(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for i in range(m + 1):
        for j in range(n + 1):
            if i and dp[i - 1][j] and s1[i - 1] == s3[i + j - 1]:
                dp[i][j] = True
            if j and dp[i][j - 1] and s2[j - 1] == s3[i + j - 1]:
                dp[i][j] = True
    return dp[m][n]`,
      why: "Prefix pairs capture exactly how much of each string has been used.", time: "O(m·n)",
      hidden: [["'a', '', 'a'", "True"], ["'a', 'b', 'ba'", "True"], ["'a' * 100, 'b' * 100, 'ab' * 100", "True"], ["'ab', 'cd', 'acdbx'", "False"]] },
    { id: "count-copies", title: "Count Hidden Copies", d: "Hard", lc: "distinct-subsequences",
      statement: "Return the number of ways to pick a subsequence of `s` that equals `t` (different index choices count separately).",
      examples: [["'rabbbit', 'rabbit'", "3", ""], ["'babgbag', 'bag'", "5", ""]],
      constraints: ["1 ≤ len(s), len(t) ≤ 1000"],
      hints: ["dp[j] = number of ways to form t[:j] from the part of s seen so far.", "For each character of s, go j from len(t) down: if s[i] == t[j−1], dp[j] += dp[j−1].", "dp[0] = 1 (the empty target)."],
      solution: `def count_copies(s, t):
    dp = [1] + [0] * len(t)
    for ch in s:
        for j in range(len(t), 0, -1):
            if t[j - 1] == ch:
                dp[j] += dp[j - 1]
    return dp[-1]`,
      why: "Each character of s can extend every partial match ending just before a matching character of t.", time: "O(m·n)",
      hidden: [["'a', 'b'", "0"], ["'aaa', 'a'", "3"], ["'a' * 30, 'a' * 15", "155117520"]] },
    { id: "star-match", title: "Star Match", d: "Hard", lc: "wildcard-matching",
      statement: "`?` in the pattern matches any one character and `*` matches any sequence (including empty). Return `True` if `p` matches the **whole** of `s`.",
      examples: [["'aa', 'a'", "False", ""], ["'aa', '*'", "True", ""], ["'cb', '?a'", "False", ""], ["'adceb', '*a*b'", "True", ""]],
      constraints: ["0 ≤ len(s), len(p) ≤ 2000"],
      hints: ["dp[i][j] = does p[:j] match s[:i]?", "'*' matches empty (dp[i][j−1]) or one more character (dp[i−1][j]).", "Leading '*'s can match the empty string."],
      solution: `def star_match(s, p):
    m, n = len(s), len(p)
    prev = [False] * (n + 1)
    prev[0] = True
    for j in range(1, n + 1):
        prev[j] = prev[j - 1] and p[j - 1] == "*"
    for i in range(1, m + 1):
        cur = [False] * (n + 1)
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                cur[j] = cur[j - 1] or prev[j]
            elif p[j - 1] == "?" or p[j - 1] == s[i - 1]:
                cur[j] = prev[j - 1]
        prev = cur
    return prev[n]`,
      why: "Each state looks at one character of the string and one of the pattern, with '*' handled by two simple transitions.", time: "O(m·n)",
      hidden: [["'', '***'", "True"], ["'abc', 'a?c'", "True"], ["'a' * 1000, '*' + 'a' * 999 + '*b'", "False"]] },
    { id: "dot-star-match", title: "Dot-Star Match", d: "Hard", lc: "regular-expression-matching",
      statement: "Implement regex matching for the whole string: `.` matches any single character, and `x*` matches zero or more of the character `x` right before it (which may be `.`). Every `*` follows a real character.",
      examples: [["'aa', 'a'", "False", ""], ["'aa', 'a*'", "True", ""], ["'ab', '.*'", "True", ""], ["'aab', 'c*a*b'", "True", ""]],
      constraints: ["1 ≤ len(s) ≤ 20", "1 ≤ len(p) ≤ 30"],
      hints: ["dp[i][j] = does p[:j] match s[:i]?", "If p[j−1] is '*': use zero copies (dp[i][j−2]) or one more copy if p[j−2] matches s[i−1] (dp[i−1][j]).", "Otherwise the characters must match (or '.') and dp[i−1][j−1]."],
      solution: `def dot_star(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 2] or (p[j - 2] in (".", s[i - 1]) and dp[i - 1][j])
            elif p[j - 1] in (".", s[i - 1]):
                dp[i][j] = dp[i - 1][j - 1]
    return dp[m][n]`,
      why: "Treating “x*” as a unit gives two choices: skip it entirely or use it for one more character.", time: "O(m·n)",
      hidden: [["'mississippi', 'mis*is*p*.'", "False"], ["'a', 'ab*'", "True"], ["'aaaaaaaaaaaaaaaaaaab', 'a*a*a*a*a*a*a*a*a*c'", "False"]] }
  ]
});
