PAT("sliding-window-fixed", {
  time: "O(n)", space: "O(1) or O(k)",
  lede: "A window of exactly k elements slides one step at a time. Instead of recomputing it, add the element that enters and remove the one that leaves.",
  idea: "Recomputing the sum (or counts) of every length-k window costs O(k) each, O(nk) total. Neighbouring windows share k − 1 elements, so update in O(1): **add `a[i]`, remove `a[i − k]`**. Record the answer once the window is full.",
  analogy: "A train window shows k houses. As the train moves one house forward, one new house appears on the right and one disappears on the left. You don't re-count everything you can see.",
  signals: [["“Every subarray / substring of **length k**”", "the window size is given"], ["Max / min / average of k consecutive items", "running sum"], ["“Contains an anagram / permutation of p”", "window of size len(p) with letter counts"], ["Something must hold for **each** k-length block", "count how many windows satisfy it"]],
  not: "**Not this pattern** when the window size isn't fixed and you're asked for the longest / shortest range (→ variable sliding window), or for max/min **per window** in O(1) (→ monotonic deque).",
  templates: [
    ["Running sum", "fixed_window.py", `def max_window_sum(a, k):
    s = sum(a[:k])                     # first full window
    best = s
    for i in range(k, len(a)):
        s += a[i] - a[i - k]           # add the new one, drop the old one
        best = max(best, s)
    return best

print(max_window_sum([1, 12, -5, -6, 50, 3], 4))`, "51"],
    ["Counts in window", "window_counts.py", `from collections import Counter

def anagram_starts(s, p):
    k, need = len(p), Counter(p)
    have, out = Counter(), []
    for i, ch in enumerate(s):
        have[ch] += 1                  # enters
        if i >= k:
            old = s[i - k]             # leaves
            have[old] -= 1
            if have[old] == 0:
                del have[old]
        if have == need:
            out.append(i - k + 1)
    return out

print(anagram_starts("cbaebabacd", "abc"))`, "[0, 6]"]
  ],
  examples: [
    { t: "Maximum Average Subarray I", d: "Easy", lc: "maximum-average-subarray-i", f: "Running sum",
      q: "Find the maximum average of any k consecutive numbers.",
      idea: "Max average = max sum ÷ k. Keep a running window sum.",
      code: `def max_average(nums, k):
    s = best = sum(nums[:k])
    for i in range(k, len(nums)):
        s += nums[i] - nums[i - k]
        best = max(best, s)
    return best / k

print(max_average([1, 12, -5, -6, 50, 3], 4))`, out: "12.75", cx: "O(n) time · O(1) space" },
    { t: "Find All Anagrams in a String", d: "Medium", lc: "find-all-anagrams-in-a-string", f: "Counts",
      q: "Return every start index where a permutation of p appears in s.",
      idea: "A window of size len(p) with letter counts; compare counts after each slide.",
      code: `def find_anagrams(s, p):
    k = len(p)
    need, have = [0] * 26, [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    out = []
    for i, ch in enumerate(s):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(s[i - k]) - 97] -= 1
        if have == need:
            out.append(i - k + 1)
    return out

print(find_anagrams("abab", "ab"))`, out: "[0, 1, 2]", cx: "O(26 · n)" },
    { t: "Maximum Vowels in a Substring", d: "Medium", lc: "maximum-number-of-vowels-in-a-substring-of-given-length", f: "Running count",
      q: "Most vowels in any substring of length k.",
      idea: "Same running-sum idea, counting vowels.",
      code: `def max_vowels(s, k):
    v = set("aeiou")
    cur = best = sum(ch in v for ch in s[:k])
    for i in range(k, len(s)):
        cur += (s[i] in v) - (s[i - k] in v)
        best = max(best, cur)
    return best

print(max_vowels("abciiidef", 3))`, out: "3", cx: "O(n)" },
    { t: "Contains Duplicate II", d: "Easy", lc: "contains-duplicate-ii", f: "Set window",
      q: "Are there two equal values at most k positions apart?",
      idea: "Keep a set of the last k values; evict the one that falls out.",
      code: `def near_dup(nums, k):
    window = set()
    for i, x in enumerate(nums):
        if x in window:
            return True
        window.add(x)
        if len(window) > k:
            window.remove(nums[i - k])
    return False

print(near_dup([1, 2, 3, 1], 3), near_dup([1, 2, 3, 1, 2, 3], 2))`, out: "True False", cx: "O(n) time · O(k) space" }
  ],
  pitfalls: [
    ["Recomputing `sum(a[i:i+k])` each step", "That's O(k) per window, O(nk) total: TLE for big inputs."],
    ["Recording before the window is full", "Only compare once `i ≥ k − 1`."],
    ["Off-by-one when removing", "The element leaving is `a[i − k]` (when the new one is `a[i]`)."],
    ["Counter keys with zero counts", "`Counter` equality ignores zeros only in Python 3.10+; delete zero keys to be safe."]
  ],
  edge: ["k equals the array length", "k = 1", "All negative values", "Fewer than k elements", "Characters outside a–z"],
  compare: [
    ["Variable Sliding Window", "sliding-window-variable", "Fixed: the size k is given. Variable: you grow and shrink to find the longest/shortest valid range."],
    ["Prefix Sum", "prefix-sum", "Window sums are also `pre[i+1] − pre[i+1−k]`, but the running sum needs no extra array."],
    ["Monotonic Deque", "monotonic-deque", "Max/min **of each** window needs a deque; a sum or count just needs a running total."]
  ],
  mcq: [
    ["Window sum update when the window moves from [i−k, i−1] to [i−k+1, i]?", ["s += a[i]", "s += a[i] − a[i − k]", "s = sum(a[i−k+1:i+1])", "s −= a[i − k + 1]"], 1, "Add the element entering (a[i]) and subtract the one leaving (a[i − k])."],
    ["“Does s contain any permutation of p?” Which window?", ["Variable, shrink while invalid", "Fixed, size len(p), with letter counts", "Two pointers from both ends", "Prefix sums"], 1, "A permutation of p has exactly len(p) letters, so the window size is fixed."]
  ],
  summary: {
    oneLine: "Window of exactly k: add the element entering, remove the one leaving.",
    signals: ["“Every subarray of length k”", "Max / min / average of k in a row", "Anagram / permutation of p inside s"],
    template: `s = sum(a[:k]); best = s
for i in range(k, len(a)):
    s += a[i] - a[i - k]
    best = max(best, s)`,
    pitfalls: ["Don't recompute each window", "Record only once the window is full", "The leaving element is a[i − k]"],
    cx: "O(n) time · O(1) space (O(k) with counts)",
    drill: { task: "Return the maximum sum of any `k` consecutive elements.",
      ref: `def max_window(a, k):
    s = best = sum(a[:k])
    for i in range(k, len(a)):
        s += a[i] - a[i - k]
        best = max(best, s)
    return best`,
      tests: [["[1, 12, -5, -6, 50, 3], 4", "51"], ["[5], 1", "5"], ["[-1, -2, -3], 2", "-3"]] }
  },
  problems: [
    { id: "best-k-days", title: "Best K Days", d: "Easy", lc: "maximum-average-subarray-i",
      statement: "`sales[i]` is the profit on day i (can be negative). Return the maximum total profit over any `k` **consecutive** days.",
      examples: [["[1, 12, -5, -6, 50, 3], 4", "51", "12 − 5 − 6 + 50"], ["[5], 1", "5", ""]],
      constraints: ["1 ≤ k ≤ len(sales) ≤ 10⁵", "−10⁴ ≤ sales[i] ≤ 10⁴"],
      hints: ["Recomputing each window is O(k).", "Slide: add the new day, subtract the day that left."],
      solution: `def best_k_days(sales, k):
    s = best = sum(sales[:k])
    for i in range(k, len(sales)):
        s += sales[i] - sales[i - k]
        best = max(best, s)
    return best`,
      why: "Each slide updates the window sum in O(1), so all n − k + 1 windows cost O(n).", time: "O(n)",
      hidden: [["[-1, -2, -3], 2", "-3"], ["[3, 3, 3], 3", "9"], ["list(range(100000)), 50000", "sum(range(50000, 100000))"]] },
    { id: "repeat-within-k", title: "Repeat Within K", d: "Easy", lc: "contains-duplicate-ii",
      statement: "Return `True` if some value appears twice at positions `i ≠ j` with `|i − j| ≤ k`.",
      examples: [["[1, 2, 3, 1], 3", "True", ""], ["[1, 0, 1, 1], 1", "True", ""], ["[1, 2, 3, 1, 2, 3], 2", "False", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
      hints: ["Only the previous k values can pair with the current one.", "Keep them in a set; drop the one that falls out of range."],
      solution: `def repeat_within_k(nums, k):
    window = set()
    for i, x in enumerate(nums):
        if x in window:
            return True
        window.add(x)
        if i >= k:
            window.discard(nums[i - k])
    return False`,
      why: "The set always holds exactly the last k values, so each membership check covers every allowed partner.", time: "O(n)",
      hidden: [["[1, 1], 0", "False"], ["[99, 99], 2", "True"], ["list(range(100000)) + [0], 99999", "False"], ["list(range(100000)) + [1], 99999", "True"]] },
    { id: "most-vowels", title: "Most Vowels", d: "Medium", lc: "maximum-number-of-vowels-in-a-substring-of-given-length",
      statement: "Return the maximum number of vowels (`a e i o u`) in any substring of `s` with length exactly `k`.",
      examples: [["'abciiidef', 3", "3", "'iii'"], ["'leetcode', 3", "2", ""], ["'rhythms', 4", "0", ""]],
      constraints: ["1 ≤ k ≤ len(s) ≤ 10⁵", "lowercase letters"],
      hints: ["Count vowels in the first window.", "Each slide changes the count by (new is vowel) − (old is vowel)."],
      solution: `def most_vowels(s, k):
    v = set("aeiou")
    cur = best = sum(ch in v for ch in s[:k])
    for i in range(k, len(s)):
        cur += (s[i] in v) - (s[i - k] in v)
        best = max(best, cur)
    return best`,
      why: "A running vowel count updated per slide covers every length-k substring in O(n).", time: "O(n)",
      hidden: [["'a', 1", "1"], ["'xyz', 2", "0"], ["'ab' * 50000, 1000", "500"]] },
    { id: "hidden-shuffle", title: "Hidden Shuffle", d: "Medium", lc: "permutation-in-string",
      statement: "Return `True` if some substring of `text` is a rearrangement (permutation) of `word`.",
      examples: [["'ab', 'eidbaooo'", "True", "'ba' is inside."], ["'ab', 'eidboaoo'", "False", ""]],
      constraints: ["1 ≤ len(word), len(text) ≤ 10⁴", "lowercase letters"],
      hints: ["A permutation has exactly len(word) letters: fixed window.", "Compare 26-letter counts of the window and the word."],
      solution: `def hidden_shuffle(word, text):
    k = len(word)
    if k > len(text):
        return False
    need, have = [0] * 26, [0] * 26
    for ch in word:
        need[ord(ch) - 97] += 1
    for i, ch in enumerate(text):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if have == need:
            return True
    return False`,
      why: "Sliding a length-k window with letter counts checks every candidate substring in O(26 · n).", time: "O(n)",
      hidden: [["'abc', 'ab'", "False"], ["'a', 'a'", "True"], ["'z' * 5000, 'a' * 5000 + 'z' * 5000", "True"]] },
    { id: "all-shuffles", title: "Every Shuffle Position", d: "Medium", lc: "find-all-anagrams-in-a-string",
      statement: "Return all start indices `i` (ascending) such that `text[i : i + len(word)]` is a rearrangement of `word`.",
      examples: [["'cbaebabacd', 'abc'", "[0, 6]", ""], ["'abab', 'ab'", "[0, 1, 2]", ""]],
      constraints: ["1 ≤ len(text), len(word) ≤ 3·10⁴", "lowercase letters"],
      hints: ["Fixed window of size len(word).", "Keep letter counts for the window and compare after each slide."],
      solution: `def all_shuffles(text, word):
    k = len(word)
    need, have = [0] * 26, [0] * 26
    for ch in word:
        need[ord(ch) - 97] += 1
    out = []
    for i, ch in enumerate(text):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(text[i - k]) - 97] -= 1
        if i >= k - 1 and have == need:
            out.append(i - k + 1)
    return out`,
      why: "Each window differs from the last by one letter in and one letter out, so counts update in O(1).", time: "O(26 · n)",
      hidden: [["'a', 'ab'", "[]"], ["'aaaa', 'aa'", "[0, 1, 2]"], ["'ab' * 15000, 'ba'", "list(range(29999))"]] },
    { id: "calm-shopkeeper", title: "Calm Shopkeeper", d: "Medium", lc: "grumpy-bookstore-owner",
      statement: "`customers[i]` people visit in minute i. When `grumpy[i] == 1` the owner is grumpy and those customers leave unhappy; otherwise they're happy. Once per day the owner can stay calm for `k` consecutive minutes (grumpy counts as 0 then). Return the maximum number of happy customers.",
      examples: [["[1, 0, 1, 2, 1, 1, 7, 5], [0, 1, 0, 1, 0, 1, 0, 1], 3", "16", "Calm during the last 3 minutes."], ["[1], [0], 1", "1", ""]],
      constraints: ["1 ≤ k ≤ n ≤ 2·10⁴", "0 ≤ customers[i] ≤ 1000", "grumpy[i] is 0 or 1"],
      hints: ["Customers in non-grumpy minutes are always happy.", "The calm window only rescues customers in grumpy minutes inside it.", "Slide a k-window over `customers[i] * grumpy[i]` and take the best extra."],
      solution: `def calm_shopkeeper(customers, grumpy, k):
    base = sum(c for c, g in zip(customers, grumpy) if g == 0)
    extra = best = sum(customers[i] * grumpy[i] for i in range(k))
    for i in range(k, len(customers)):
        extra += customers[i] * grumpy[i] - customers[i - k] * grumpy[i - k]
        best = max(best, extra)
    return base + best`,
      why: "Split the answer into always-happy customers plus the best fixed window of rescuable ones.", time: "O(n)",
      hidden: [["[4, 10, 10], [1, 1, 0], 2", "24"], ["[2, 2], [1, 1], 1", "2"], ["[1] * 20000, [1, 0] * 10000, 2", "10001"]] },
    { id: "gather-ones", title: "Gather the Ones", d: "Medium", lc: "minimum-swaps-to-group-all-1s-together",
      statement: "`bits` is a list of 0s and 1s. In one swap you may exchange any two elements. Return the minimum number of swaps needed to put **all the 1s next to each other** somewhere in the list.",
      examples: [["[1, 0, 1, 0, 1]", "1", "Swap to get [0, 1, 1, 1, 0]"], ["[0, 0, 0, 1, 0]", "0", ""], ["[1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1]", "3", ""]],
      constraints: ["1 ≤ len(bits) ≤ 10⁵"],
      hints: ["If there are m ones, the final block has length m.", "For a window of length m, the swaps needed = number of 0s inside it.", "Slide a window of size m and find the fewest zeros."],
      solution: `def gather_ones(bits):
    m = sum(bits)
    if m == 0:
        return 0
    ones = best = sum(bits[:m])
    for i in range(m, len(bits)):
        ones += bits[i] - bits[i - m]
        best = max(best, ones)
    return m - best`,
      why: "Every 0 inside the target block needs exactly one swap with a 1 outside it, so minimise zeros over all windows of size m.", time: "O(n)",
      hidden: [["[0]", "0"], ["[1, 1, 1]", "0"], ["[1, 0] * 50000", "25000"]] },
    { id: "word-chain-spots", title: "Word Chain Spots", d: "Hard", lc: "substring-with-concatenation-of-all-words",
      statement: "All strings in `words` have the same length. Return every start index (ascending) in `text` where some ordering of **all** the words, concatenated without gaps, appears. Each word is used exactly as many times as it appears in `words`.",
      examples: [["'barfoothefoobarman', ['foo', 'bar']", "[0, 9]", "'barfoo' and 'foobar'"], ["'wordgoodgoodgoodbestword', ['word', 'good', 'best', 'word']", "[]", ""], ["'barfoofoobarthefoobarman', ['bar', 'foo', 'the']", "[6, 9, 12]", ""]],
      constraints: ["1 ≤ len(text) ≤ 10⁴", "1 ≤ len(words) ≤ 5000", "1 ≤ len(words[i]) ≤ 30"],
      hints: ["The match has a fixed total length: len(words) × w.", "Run w separate scans, one for each start offset mod w, stepping word by word.", "Keep a Counter of words in the window; shrink from the left when a word appears too often."],
      solution: `from collections import Counter

def word_chain_spots(text, words):
    w, n = len(words[0]), len(words)
    need = Counter(words)
    out = []
    for off in range(w):
        have = Counter()
        left = off
        used = 0
        for right in range(off, len(text) - w + 1, w):
            word = text[right:right + w]
            if word not in need:
                have.clear(); used = 0; left = right + w
                continue
            have[word] += 1; used += 1
            while have[word] > need[word]:
                have[text[left:left + w]] -= 1; used -= 1; left += w
            if used == n:
                out.append(left)
                have[text[left:left + w]] -= 1; used -= 1; left += w
    return sorted(out)`,
      why: "Stepping one word at a time for each offset makes every word enter and leave the window once, O(len(text) · w) overall.", time: "O(n · w)",
      hidden: [["'aaa', ['a', 'a']", "[0, 1]"], ["'abc', ['d']", "[]"], ["'ab' * 5000, ['ab', 'ab']", "list(range(0, 9997, 2))"]] }
  ]
});
