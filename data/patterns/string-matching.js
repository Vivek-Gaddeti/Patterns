PAT("string-matching", {
  time: "O(n + m)", space: "O(m)",
  lede: "Find a pattern inside a text without re-checking characters you've already matched. KMP reuses what the pattern knows about itself; rolling hashes compare whole windows in O(1).",
  idea: "Naive matching restarts from scratch after every mismatch: O(n·m). **KMP** precomputes, for every prefix of the pattern, the longest proper prefix that's also a suffix (the *failure* or *lps* array). After a mismatch you jump to that length instead of restarting, so the text pointer never moves back. **Rabin–Karp** instead hashes each length-m window in O(1) with a rolling hash.",
  analogy: "Reading “ABABAC” while searching for “ABABAB”: when the last letter fails, you already know the text ends in “ABAB”, which is the start of the pattern, so you keep going from there instead of starting over.",
  flavours: [["Tool", "What it gives", "Use it for"], [
    ["**Prefix function (lps)**", "longest border of every prefix", "KMP search, periods, longest prefix = suffix"],
    ["**Rolling hash**", "O(1) hash of any window", "duplicate substrings, many patterns, binary search on length"],
    ["**`s in t` / `t.find(s)`**", "fast C implementation", "fine in an OA unless the task is the algorithm itself"]]],
  signals: [["Find / count a pattern in a long text", "n and m up to 10⁵"], ["“Longest prefix that is also a suffix”, “period”, “repeated unit”", "prefix function"], ["“Duplicate substring”, “appears more than once”", "rolling hash or set of windows"], ["Rotation or palindrome-by-prepending tricks", "match on a combined string"]],
  not: "**Not this pattern** for counting letters or anagram windows (→ sliding window), or for edit-distance-style comparisons (→ DP on two strings).",
  templates: [
    ["KMP", "kmp.py", `def prefix_function(p):
    lps = [0] * len(p)                     # lps[i]: longest border of p[:i+1]
    k = 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]                 # fall back to a shorter border
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps

def kmp_search(text, p):
    lps, k, hits = prefix_function(p), 0, []
    for i, ch in enumerate(text):
        while k and ch != p[k]:
            k = lps[k - 1]
        if ch == p[k]:
            k += 1
        if k == len(p):                    # full match ending at i
            hits.append(i - len(p) + 1)
            k = lps[k - 1]
    return hits

print(prefix_function("ababaca"), kmp_search("abababab", "abab"))`, "[0, 0, 1, 2, 3, 0, 1] [0, 2, 4]"],
    ["Rolling hash", "rolling.py", `def find_all(text, p, B=131, M=(1 << 61) - 1):
    m = len(p)
    if m > len(text): return []
    hp = ht = 0
    for i in range(m):
        hp = (hp * B + ord(p[i])) % M
        ht = (ht * B + ord(text[i])) % M
    top = pow(B, m - 1, M)
    hits = []
    for i in range(len(text) - m + 1):
        if ht == hp and text[i:i + m] == p:      # confirm to rule out collisions
            hits.append(i)
        if i + m < len(text):
            ht = ((ht - ord(text[i]) * top) * B + ord(text[i + m])) % M
    return hits

print(find_all("abracadabra", "abra"))`, "[0, 7]"]
  ],
  examples: [
    { t: "Find the Index of the First Occurrence", d: "Easy", lc: "find-the-index-of-the-first-occurrence-in-a-string", f: "KMP",
      q: "Return the first index of needle in haystack, or −1.",
      idea: "Build lps for the needle, then scan the haystack once.",
      code: `def str_str(h, n):
    lps, k = [0] * len(n), 0
    for i in range(1, len(n)):
        while k and n[i] != n[k]: k = lps[k - 1]
        if n[i] == n[k]: k += 1
        lps[i] = k
    k = 0
    for i, ch in enumerate(h):
        while k and ch != n[k]: k = lps[k - 1]
        if ch == n[k]: k += 1
        if k == len(n): return i - k + 1
    return -1

print(str_str("sadbutsad", "sad"), str_str("leetcode", "leeto"))`, out: "0 -1", cx: "O(n + m)" },
    { t: "Repeated Substring Pattern", d: "Easy", lc: "repeated-substring-pattern", f: "Doubling trick",
      q: "Can s be built by repeating one of its substrings?",
      idea: "s is periodic exactly when it appears inside (s + s) with the first and last characters removed.",
      code: `def repeated(s):
    return s in (s + s)[1:-1]

print(repeated("abab"), repeated("aba"), repeated("abcabcabc"))`, out: "True False True", cx: "O(n)" },
    { t: "Longest Happy Prefix", d: "Hard", lc: "longest-happy-prefix", f: "Prefix function",
      q: "Longest proper prefix of s that is also a suffix.",
      idea: "That's exactly the last value of the prefix function.",
      code: `def happy_prefix(s):
    lps, k = [0] * len(s), 0
    for i in range(1, len(s)):
        while k and s[i] != s[k]: k = lps[k - 1]
        if s[i] == s[k]: k += 1
        lps[i] = k
    return s[:lps[-1]]

print(happy_prefix("level"), happy_prefix("ababab"))`, out: "l abab", cx: "O(n)" }
  ],
  pitfalls: [
    ["Moving the text pointer backwards", "KMP never does; only the pattern index k falls back."],
    ["Using `if` instead of `while` for fallbacks", "You may need several fallbacks in a row."],
    ["Trusting a hash without confirming", "Collisions happen; compare the actual substring when hashes match (or use two moduli)."],
    ["Re-slicing strings in a loop", "`text[i:i+m]` for every i is O(n·m)."]
  ],
  edge: ["Empty pattern", "Pattern longer than text", "Overlapping matches (“aaa” in “aaaa”)", "All characters the same", "Pattern equals text"],
  compare: [
    ["Sliding Window", "sliding-window-fixed", "Anagram (any order) matching uses letter counts in a window; exact-order matching uses KMP / hashing."],
    ["DP on Two Strings", "two-strings-dp", "Edit distance and LCS compare two strings with gaps; matching looks for an exact copy."],
    ["String Building & Parsing", "string-manipulation", "Most OA string tasks are just careful building and splitting; reach for KMP only when n·m is too slow."]
  ],
  mcq: [
    ["What does lps[i] store in KMP?", ["The number of matches so far", "The length of the longest proper prefix of p[:i+1] that is also its suffix", "The next index to compare in the text", "A hash of the prefix"], 1, "That border tells you how much of the pattern is still matched after a mismatch."],
    ["Why confirm a rolling-hash match with a direct comparison?", ["It's faster", "Different strings can share a hash (collision)", "Python requires it", "To find overlapping matches"], 1, "A hash match is only probable equality; confirm (or use double hashing)."]
  ],
  summary: {
    oneLine: "KMP: precompute the pattern's borders so the text pointer never goes back. Rolling hash: O(1) window comparisons.",
    signals: ["Find / count a pattern in a long text", "Longest prefix = suffix, periods, repeats", "Duplicate substrings (hash + binary search)"],
    template: `lps, k = [0] * len(p), 0
for i in range(1, len(p)):
    while k and p[i] != p[k]:
        k = lps[k - 1]
    if p[i] == p[k]:
        k += 1
    lps[i] = k`,
    pitfalls: ["`while` fallbacks, not `if`", "Confirm hash matches", "Don't slice every window"],
    cx: "O(n + m) time · O(m) space",
    drill: { task: "Return the prefix-function (lps) array of `p`: lps[i] is the length of the longest proper prefix of `p[:i+1]` that is also its suffix.",
      ref: `def prefix_function(p):
    lps, k = [0] * len(p), 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    return lps`,
      tests: [["'ababaca'", "[0, 0, 1, 2, 3, 0, 1]"], ["'aaaa'", "[0, 1, 2, 3]"], ["'abcd'", "[0, 0, 0, 0]"]] }
  },
  problems: [
    { id: "first-sighting", title: "First Sighting", d: "Easy", lc: "find-the-index-of-the-first-occurrence-in-a-string",
      statement: "Return the index of the first occurrence of `needle` in `hay`, or `-1` if it doesn't occur. `needle` is non-empty.",
      examples: [["'sadbutsad', 'sad'", "0", ""], ["'leetcode', 'leeto'", "-1", ""], ["'hello', 'll'", "2", ""]],
      constraints: ["1 ≤ len(needle), len(hay) ≤ 10⁵"],
      hints: ["Naive matching can be O(n·m) on inputs like 'aaaa…ab'.", "KMP: build the prefix function of the needle, then scan once."],
      solution: `def first_sighting(hay, needle):
    lps, k = [0] * len(needle), 0
    for i in range(1, len(needle)):
        while k and needle[i] != needle[k]:
            k = lps[k - 1]
        if needle[i] == needle[k]:
            k += 1
        lps[i] = k
    k = 0
    for i, ch in enumerate(hay):
        while k and ch != needle[k]:
            k = lps[k - 1]
        if ch == needle[k]:
            k += 1
        if k == len(needle):
            return i - k + 1
    return -1`,
      why: "The text index only moves forward; mismatches fall back along the needle's borders.", time: "O(n + m)",
      hidden: [["'a', 'a'", "0"], ["'abc', 'abcd'", "-1"], ["'a' * 100000 + 'b', 'a' * 50000 + 'b'", "50000"]] },
    { id: "spin-check", title: "Spin Check", d: "Easy", lc: "rotate-string",
      statement: "Return `True` if `goal` can be obtained by rotating `s` (moving some prefix of `s` to its end).",
      examples: [["'abcde', 'cdeab'", "True", ""], ["'abcde', 'abced'", "False", ""]],
      constraints: ["1 ≤ len(s), len(goal) ≤ 10⁵"],
      hints: ["Every rotation of s appears inside s + s.", "Lengths must match."],
      solution: `def spin_check(s, goal):
    return len(s) == len(goal) and goal in s + s`,
      why: "s + s contains every rotation of s as a substring, so one substring search answers it.", time: "O(n)",
      hidden: [["'a', 'a'", "True"], ["'ab', 'a'", "False"], ["'ab' * 50000, 'ba' * 50000", "True"], ["'a' * 99999 + 'b', 'a' * 100000", "False"]] },
    { id: "repeating-unit", title: "Repeating Unit", d: "Easy", lc: "repeated-substring-pattern",
      statement: "Return `True` if `s` is made of some shorter substring repeated two or more times.",
      examples: [["'abab'", "True", "'ab' × 2"], ["'aba'", "False", ""], ["'abcabcabcabc'", "True", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["If s has period p, then len(s) − lps[-1] is the smallest period.", "s is a repetition iff that period divides len(s) and is shorter than s.", "Or: s appears inside (s + s)[1:-1]."],
      solution: `def repeating_unit(s):
    lps, k = [0] * len(s), 0
    for i in range(1, len(s)):
        while k and s[i] != s[k]:
            k = lps[k - 1]
        if s[i] == s[k]:
            k += 1
        lps[i] = k
    p = len(s) - lps[-1]
    return p < len(s) and len(s) % p == 0`,
      why: "The prefix function gives the smallest period directly.", time: "O(n)",
      hidden: [["'a'", "False"], ["'aa'", "True"], ["'ab' * 50000", "True"], ["'ab' * 49999 + 'a'", "False"]] },
    { id: "count-echoes", title: "Count the Echoes", d: "Medium", lc: "find-the-index-of-the-first-occurrence-in-a-string",
      statement: "Count how many times `p` occurs in `text`, **including overlapping** occurrences.",
      examples: [["'abababab', 'abab'", "3", "At 0, 2 and 4."], ["'aaaa', 'aa'", "3", ""], ["'abc', 'd'", "0", ""]],
      constraints: ["1 ≤ len(p) ≤ len(text) ≤ 2·10⁵"],
      hints: ["`text.count(p)` doesn't count overlaps.", "KMP: after a full match, fall back to lps[k − 1] and keep going."],
      solution: `def count_echoes(text, p):
    lps, k = [0] * len(p), 0
    for i in range(1, len(p)):
        while k and p[i] != p[k]:
            k = lps[k - 1]
        if p[i] == p[k]:
            k += 1
        lps[i] = k
    k = count = 0
    for ch in text:
        while k and ch != p[k]:
            k = lps[k - 1]
        if ch == p[k]:
            k += 1
        if k == len(p):
            count += 1
            k = lps[k - 1]
    return count`,
      why: "Falling back to the border after a match keeps the overlapping part, so every occurrence is found in O(n + m).", time: "O(n + m)",
      hidden: [["'a', 'a'", "1"], ["'aaa', 'aaaa'", "0"], ["'a' * 200000, 'a' * 100000", "100001"]] },
    { id: "double-segments", title: "Twice-Seen Segments", d: "Medium", lc: "repeated-dna-sequences",
      statement: "`dna` contains only the letters A, C, G, T. Return every length-10 substring that occurs **more than once**, sorted alphabetically.",
      examples: [["'AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT'", "['AAAAACCCCC', 'CCCCCAAAAA']", ""], ["'AAAAAAAAAAAAA'", "['AAAAAAAAAA']", ""]],
      constraints: ["1 ≤ len(dna) ≤ 10⁵"],
      hints: ["Slide a window of length 10.", "Keep a set of windows seen once and a set seen twice.", "Rolling hash or 2-bit encoding avoids slicing, but slicing 10 characters is fine here."],
      solution: `def double_segments(dna):
    seen, twice = set(), set()
    for i in range(len(dna) - 9):
        w = dna[i:i + 10]
        if w in seen:
            twice.add(w)
        seen.add(w)
    return sorted(twice)`,
      why: "Each of the n − 9 windows is hashed once; a second sighting puts it in the answer.", time: "O(10 · n)",
      hidden: [["'ACGT'", "[]"], ["'ACGTACGTACGTACGT'", "['ACGTACGTAC', 'CGTACGTACG', 'GTACGTACGT']"], ["'A' * 100000", "['AAAAAAAAAA']"]] },
    { id: "border-word", title: "Longest Border", d: "Hard", lc: "longest-happy-prefix",
      statement: "Return the longest **proper** prefix of `s` that is also a suffix of `s` (it may overlap with itself). Return `''` if none exists.",
      examples: [["'level'", "'l'", ""], ["'ababab'", "'abab'", ""], ["'abc'", "''", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["This is the definition of the prefix function's last value.", "Build lps for s; answer is s[:lps[-1]]."],
      solution: `def border_word(s):
    lps, k = [0] * len(s), 0
    for i in range(1, len(s)):
        while k and s[i] != s[k]:
            k = lps[k - 1]
        if s[i] == s[k]:
            k += 1
        lps[i] = k
    return s[:lps[-1]]`,
      why: "lps[-1] is by definition the longest proper border of the whole string.", time: "O(n)",
      hidden: [["'a'", "''"], ["'aa'", "'a'"], ["'ab' * 50000", "'ab' * 49999"]] },
    { id: "front-mirror", title: "Mirror From the Front", d: "Hard", lc: "shortest-palindrome",
      statement: "You may only add characters to the **front** of `s`. Return the shortest palindrome you can make.",
      examples: [["'aacecaaa'", "'aaacecaaa'", ""], ["'abcd'", "'dcbabcd'", ""]],
      constraints: ["0 ≤ len(s) ≤ 5·10⁴"],
      hints: ["Find the longest prefix of s that is already a palindrome.", "A prefix is a palindrome iff it equals a suffix of reversed(s).", "Prefix function of `s + '#' + reversed(s)`: its last value is that length."],
      solution: `def front_mirror(s):
    t = s + "#" + s[::-1]
    lps, k = [0] * len(t), 0
    for i in range(1, len(t)):
        while k and t[i] != t[k]:
            k = lps[k - 1]
        if t[i] == t[k]:
            k += 1
        lps[i] = k
    keep = lps[-1] if t else 0
    return s[keep:][::-1] + s`,
      why: "The longest palindromic prefix is the longest prefix of s matching a suffix of its reverse, which KMP finds on the combined string.", time: "O(n)",
      hidden: [["''", "''"], ["'a'", "'a'"], ["'a' * 25000 + 'b' + 'a' * 24000", "'a' * 24000 + 'b' + 'a' * 25000 + 'b' + 'a' * 24000"], ["'ab'", "'bab'"]] },
    { id: "longest-echo", title: "Longest Repeated Piece", d: "Hard", lc: "longest-duplicate-substring",
      statement: "Return the longest substring that occurs **at least twice** in `s` (occurrences may overlap). If several have that length, return the one that appears first in `s`. Return `''` if none.",
      examples: [["'banana'", "'ana'", ""], ["'abcd'", "''", ""]],
      constraints: ["2 ≤ len(s) ≤ 3·10⁴", "lowercase letters"],
      hints: ["If a repeated substring of length L exists, one of every length < L exists too: binary search on L.", "Check a length with a rolling hash over all windows.", "Confirm hash collisions by comparing the actual substrings."],
      solution: `def longest_echo(s):
    n, B, M = len(s), 131, (1 << 61) - 1
    def find(L):
        if L == 0:
            return 0
        h, top = 0, pow(B, L - 1, M)
        for i in range(L):
            h = (h * B + ord(s[i])) % M
        seen = {h: [0]}
        for i in range(1, n - L + 1):
            h = ((h - ord(s[i - 1]) * top) * B + ord(s[i + L - 1])) % M
            for j in seen.get(h, []):
                if s[j:j + L] == s[i:i + L]:
                    return j
            seen.setdefault(h, []).append(i)
        return -1
    lo, hi, best = 1, n - 1, (0, 0)
    while lo <= hi:
        mid = (lo + hi) // 2
        j = find(mid)
        if j >= 0:
            best = (j, mid)
            lo = mid + 1
        else:
            hi = mid - 1
    return s[best[0]:best[0] + best[1]]`,
      why: "Binary search over the length needs O(log n) checks, each O(n) with a rolling hash.", time: "O(n log n)",
      hidden: [["'aa'", "'a'"], ["'abcabc'", "'abc'"], ["'ab' * 15000", "'ab' * 14999"]] }
  ]
});
