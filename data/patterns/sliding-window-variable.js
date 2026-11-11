PAT("sliding-window-variable", {
  time: "O(n)", space: "O(k)",
  lede: "Grow the right edge one step at a time; while the window breaks the rule, shrink the left edge. Each index enters and leaves the window once, so it's O(n).",
  idea: "Checking every subarray is O(n²). But for many rules, if a window is invalid then every bigger window containing it is invalid too (and vice versa). So the left edge **never needs to move back**: expand right, shrink left while invalid, and record the best window as you go.",
  analogy: "A caterpillar crawling along a branch: the head stretches forward, and when the body gets too long or uncomfortable, the tail catches up.",
  flavours: [["Goal", "When to record", "Loop shape"], [
    ["**Longest** valid window", "after shrinking, every step", "expand → while invalid: shrink → record"],
    ["**Shortest** valid window", "inside the shrink loop", "expand → while valid: record, shrink"],
    ["**Count** windows", "add `r − l + 1` each step", "count subarrays ending at r"]]],
  signals: [["Longest / shortest **contiguous** subarray or substring", "with a condition"], ["“At most k distinct”, “without repeating”, “at most k flips”", "a limit you can track incrementally"], ["All numbers **positive** + a sum limit", "the sum only grows as the window grows"], ["“Number of subarrays where …” with a monotone rule", "count r − l + 1 per step"]],
  not: "**Not this pattern** when values can be negative and you need an exact sum (→ prefix sums + hash map), or the window size is fixed (→ fixed window).",
  templates: [
    ["Longest", "longest_window.py", `def longest_at_most_k_distinct(s, k):
    count = {}
    l = best = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1          # expand
        while len(count) > k:                     # shrink WHILE invalid
            count[s[l]] -= 1
            if count[s[l]] == 0:
                del count[s[l]]
            l += 1
        best = max(best, r - l + 1)               # window is valid here
    return best

print(longest_at_most_k_distinct("eceba", 2))`, "3"],
    ["Shortest", "shortest_window.py", `def shortest_sum_at_least(nums, target):
    l = total = 0
    best = float("inf")
    for r, x in enumerate(nums):
        total += x                                # expand
        while total >= target:                    # WHILE valid: record, shrink
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float("inf") else best

print(shortest_sum_at_least([2, 3, 1, 2, 4, 3], 7))`, "2"]
  ],
  examples: [
    { t: "Longest Substring Without Repeating Characters", d: "Medium", lc: "longest-substring-without-repeating-characters", f: "Longest",
      q: "Length of the longest substring with all-distinct characters.",
      idea: "Remember each character's last index. When it repeats inside the window, jump `l` past the previous one.",
      code: `def longest_unique(s):
    last, l, best = {}, 0, 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best

print(longest_unique("abcabcbb"), longest_unique("pwwkew"))`, out: "3 3", cx: "O(n) time · O(alphabet) space" },
    { t: "Minimum Size Subarray Sum", d: "Medium", lc: "minimum-size-subarray-sum", f: "Shortest",
      q: "Shortest subarray with sum ≥ target (all positive).",
      idea: "While the window's sum is enough, record and shrink from the left.",
      code: `def min_len(target, nums):
    l = total = 0
    best = len(nums) + 1
    for r, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, r - l + 1)
            total -= nums[l]; l += 1
    return best if best <= len(nums) else 0

print(min_len(7, [2, 3, 1, 2, 4, 3]))`, out: "2", cx: "O(n)" },
    { t: "Max Consecutive Ones III", d: "Medium", lc: "max-consecutive-ones-iii", f: "Longest",
      q: "Longest run of 1s if you may flip at most k zeros.",
      idea: "The window is valid while it holds at most k zeros.",
      code: `def longest_ones(nums, k):
    l = zeros = best = 0
    for r, x in enumerate(nums):
        zeros += x == 0
        while zeros > k:
            zeros -= nums[l] == 0
            l += 1
        best = max(best, r - l + 1)
    return best

print(longest_ones([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2))`, out: "6", cx: "O(n)" },
    { t: "Longest Repeating Character Replacement", d: "Medium", lc: "longest-repeating-character-replacement", f: "Longest",
      q: "Longest substring you can make all one letter by changing at most k characters.",
      idea: "Valid while `window length − count of its most common letter ≤ k`.",
      code: `def character_replacement(s, k):
    count, l, top, best = {}, 0, 0, 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        top = max(top, count[ch])
        while r - l + 1 - top > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best

print(character_replacement("AABABBA", 1))`, out: "4", cx: "O(n)" },
    { t: "Minimum Window Substring", d: "Hard", lc: "minimum-window-substring", f: "Shortest",
      q: "Smallest substring of s that contains every character of t (with multiplicity).",
      idea: "Track how many required characters are still missing. Once zero, shrink while it stays zero, recording the best.",
      code: `from collections import Counter

def min_window(s, t):
    need, missing = Counter(t), len(t)
    l, best = 0, (0, float("inf"))
    for r, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if r - l < best[1] - best[0]:
                best = (l, r)
            need[s[l]] += 1
            if need[s[l]] > 0:
                missing += 1
            l += 1
    return "" if best[1] == float("inf") else s[best[0]:best[1] + 1]

print(min_window("ADOBECODEBANC", "ABC"))`, out: "BANC", cx: "O(|s| + |t|)" }
  ],
  pitfalls: [
    ["Shrinking with `if` instead of `while`", "One step may not be enough to make the window valid again."],
    ["Recording the shortest window after the loop", "For “shortest”, record **inside** the shrink loop, while it's still valid."],
    ["Using it with negative numbers", "Shrinking might increase the sum, so the logic breaks. Use prefix sums."],
    ["Forgetting to delete zero counts", "`len(count)` then over-counts distinct characters."],
    ["Jumping `l` backwards", "With a last-seen map, only jump if `last[ch] >= l`."]
  ],
  edge: ["Empty string / array", "Whole input is valid", "No valid window at all", "k = 0", "All characters the same"],
  compare: [
    ["Fixed Window", "sliding-window-fixed", "Fixed: size k is given. Variable: the size is what you're optimising."],
    ["Prefix Sum", "prefix-sum", "Exact sum with negatives → prefix sums. Positive values with ≤ / ≥ limits → window."],
    ["Two Pointers", "two-pointers", "Two pointers often only look at the two ends; a window cares about everything between them."]
  ],
  mcq: [
    ["You want the **shortest** subarray with sum ≥ target. Where do you record the answer?", ["After the shrink loop", "Inside the shrink loop, before shrinking", "Only at the end", "Before expanding"], 1, "The window is valid inside the loop; once you shrink past validity it's too late."],
    ["Values can be negative. Longest subarray with sum exactly k?", ["Variable sliding window", "Prefix sums with first-index map", "Fixed window", "Binary search"], 1, "Negative values break the shrink logic; store the first index of each prefix sum instead."]
  ],
  summary: {
    oneLine: "Grow the right edge; while the window breaks the rule, shrink the left edge.",
    signals: ["Longest / shortest **contiguous** range with a condition", "“At most k distinct”, “without repeating”, “k flips”", "All values positive (sums only grow as you extend)"],
    template: `l = best = 0
for r, x in enumerate(a):
    add(x)
    while invalid():
        remove(a[l]); l += 1
    best = max(best, r - l + 1)`,
    pitfalls: ["Shrink with `while`, not `if`", "Shortest window: record inside the loop", "Negative numbers → prefix sums"],
    cx: "O(n) time · O(k) space",
    drill: { task: "Length of the longest substring without repeating characters.",
      ref: `def longest_unique(s):
    last, l, best = {}, 0, 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best`,
      tests: [["'abcabcbb'", "3"], ["'bbbbb'", "1"], ["'pwwkew'", "3"], ["''", "0"]] }
  },
  problems: [
    { id: "rising-run", title: "Longest Rising Run", d: "Easy", lc: "longest-continuous-increasing-subsequence",
      statement: "Return the length of the longest **contiguous** stretch where every value is strictly greater than the one before it.",
      examples: [["[1, 3, 5, 4, 7]", "3", "1, 3, 5"], ["[2, 2, 2]", "1", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["When the rise breaks, the window restarts at the current index.", "Track the current run length and the best."],
      solution: `def rising_run(nums):
    best = cur = 1
    for i in range(1, len(nums)):
        cur = cur + 1 if nums[i] > nums[i - 1] else 1
        best = max(best, cur)
    return best`,
      why: "The left edge jumps to the break point, so one pass measures every maximal rising run.", time: "O(n)",
      hidden: [["[5]", "1"], ["[1, 2, 3, 1, 2, 3, 4]", "4"], ["list(range(100000))", "100000"]] },
    { id: "calm-stretch", title: "Longest Calm Stretch", d: "Medium", lc: "max-consecutive-ones-iii",
      statement: "A server logs a **positive** load value every minute. A stretch of consecutive minutes is *calm* if its total load is at most `k`. Return the length of the longest calm stretch (0 if none).",
      examples: [["[2, 1, 5, 1, 3, 2], 7", "3", "[1, 3, 2] sums to 6. No 4-minute stretch is ≤ 7."], ["[4, 4, 4], 3", "0", "Every single minute is already above 3."], ["[1, 1, 1, 1], 10", "4", ""]],
      constraints: ["1 ≤ len(loads) ≤ 10⁵", "1 ≤ loads[i] ≤ 10⁴", "0 ≤ k ≤ 10⁹"],
      hints: ["“Longest contiguous stretch with a condition” is a strong signal.", "All loads are positive, so adding minutes only increases the sum.", "Expand right; while the sum is over k, shrink from the left; record the length."],
      solution: `def longest_calm(loads, k):
    l = total = best = 0
    for r, x in enumerate(loads):
        total += x
        while total > k:
            total -= loads[l]
            l += 1
        best = max(best, r - l + 1)
    return best`,
      why: "Positive values make the window sum monotonic, so each index enters and leaves the window once.", time: "O(n)",
      hidden: [["[3, 1, 2, 1, 1, 4], 5", "4"], ["[5], 5", "1"], ["[1] * 100000, 50000", "50000"], ["[10000] * 100000, 10**9", "100000"]] },
    { id: "no-repeat-name", title: "No Repeated Letters", d: "Medium", lc: "longest-substring-without-repeating-characters",
      statement: "Return the length of the longest substring of `s` in which no character appears twice.",
      examples: [["'abcabcbb'", "3", "'abc'"], ["'bbbbb'", "1", ""], ["'pwwkew'", "3", "'wke'"]],
      constraints: ["0 ≤ len(s) ≤ 10⁵", "letters, digits, symbols and spaces"],
      hints: ["Keep each character's last index.", "On a repeat inside the window, move `l` just past the previous occurrence.", "Only move `l` forward, never back."],
      solution: `def no_repeat(s):
    last, l, best = {}, 0, 0
    for r, ch in enumerate(s):
        if ch in last and last[ch] >= l:
            l = last[ch] + 1
        last[ch] = r
        best = max(best, r - l + 1)
    return best`,
      why: "Jumping the left edge straight past the earlier duplicate keeps the window valid with O(1) work per step.", time: "O(n)",
      hidden: [["''", "0"], ["' '", "1"], ["'abba'", "2"], ["''.join(chr(33 + i % 90) for i in range(100000))", "90"]] },
    { id: "enough-fuel", title: "Enough Fuel", d: "Medium", lc: "minimum-size-subarray-sum",
      statement: "Fuel stations along a road hold `fuel[i]` litres (all positive). Return the length of the **shortest** contiguous stretch of stations holding at least `need` litres in total, or 0 if impossible.",
      examples: [["7, [2, 3, 1, 2, 4, 3]", "2", "[4, 3]"], ["4, [1, 4, 4]", "1", ""], ["11, [1, 1, 1, 1, 1]", "0", ""]],
      constraints: ["1 ≤ len(fuel) ≤ 10⁵", "1 ≤ fuel[i] ≤ 10⁴", "1 ≤ need ≤ 10⁹"],
      hints: ["Shortest window that satisfies a ≥ condition.", "Record the length inside a `while total >= need` loop, then shrink."],
      solution: `def enough_fuel(need, fuel):
    l = total = 0
    best = len(fuel) + 1
    for r, x in enumerate(fuel):
        total += x
        while total >= need:
            best = min(best, r - l + 1)
            total -= fuel[l]
            l += 1
    return best if best <= len(fuel) else 0`,
      why: "For each right edge, the loop finds the tightest valid left edge; both edges only move forward.", time: "O(n)",
      hidden: [["1, [5]", "1"], ["15, [1, 2, 3, 4, 5]", "5"], ["100000, [1] * 100000", "100000"], ["50, [10] * 99999 + [60]", "1"]] },
    { id: "two-kinds", title: "Two Kinds Only", d: "Medium", lc: "fruit-into-baskets",
      statement: "Walking along a row of trees, `trees[i]` is the fruit type of tree i. You carry two baskets, each holding **one type** (unlimited amount). Pick from a contiguous stretch of trees. Return the most fruit you can pick.",
      examples: [["[1, 2, 1]", "3", ""], ["[0, 1, 2, 2]", "3", "[1, 2, 2]"], ["[1, 2, 3, 2, 2]", "4", ""]],
      constraints: ["1 ≤ len(trees) ≤ 10⁵"],
      hints: ["Longest subarray with at most 2 distinct values.", "Keep counts of types in the window; shrink while there are more than 2."],
      solution: `def two_kinds(trees):
    count, l, best = {}, 0, 0
    for r, t in enumerate(trees):
        count[t] = count.get(t, 0) + 1
        while len(count) > 2:
            count[trees[l]] -= 1
            if count[trees[l]] == 0:
                del count[trees[l]]
            l += 1
        best = max(best, r - l + 1)
    return best`,
      why: "“At most 2 distinct” only gets worse as the window grows, so a shrinking window finds the longest valid stretch.", time: "O(n)",
      hidden: [["[7]", "1"], ["[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]", "5"], ["[1, 2] * 50000", "100000"]] },
    { id: "flip-to-ones", title: "Flip to Ones", d: "Medium", lc: "max-consecutive-ones-iii",
      statement: "`bits` has 0s and 1s. You may turn at most `k` zeros into ones. Return the length of the longest run of consecutive 1s you can make.",
      examples: [["[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2", "6", ""], ["[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3", "10", ""]],
      constraints: ["1 ≤ len(bits) ≤ 10⁵", "0 ≤ k ≤ len(bits)"],
      hints: ["A window is fine while it has at most k zeros.", "Count zeros in the window; shrink while that count exceeds k."],
      solution: `def flip_to_ones(bits, k):
    l = zeros = best = 0
    for r, b in enumerate(bits):
        zeros += b == 0
        while zeros > k:
            zeros -= bits[l] == 0
            l += 1
        best = max(best, r - l + 1)
    return best`,
      why: "The zero count only rises as the window grows, so shrink-while-invalid finds the longest window with ≤ k zeros.", time: "O(n)",
      hidden: [["[0, 0], 0", "0"], ["[1, 1], 0", "2"], ["[0] * 100000, 100000", "100000"], ["[1, 0] * 50000, 1", "3"]] },
    { id: "make-uniform", title: "Make It Uniform", d: "Medium", lc: "longest-repeating-character-replacement",
      statement: "`s` has uppercase letters. You may change at most `k` characters to any other uppercase letter. Return the length of the longest substring that can be made of a single repeated letter.",
      examples: [["'ABAB', 2", "4", ""], ["'AABABBA', 1", "4", "Change the B in 'AABA' to get 'AAAA'."]],
      constraints: ["1 ≤ len(s) ≤ 10⁵", "0 ≤ k ≤ len(s)"],
      hints: ["In a window, the letters you must change = length − count of the most common letter.", "The window is valid while that is ≤ k.", "You can keep the running maximum count without decreasing it."],
      solution: `def make_uniform(s, k):
    count, l, top, best = {}, 0, 0, 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        top = max(top, count[ch])
        while r - l + 1 - top > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
      why: "Only a larger `top` can produce a longer answer, so a stale (too high) top never lets an invalid window beat the true best.", time: "O(n)",
      hidden: [["'A', 0", "1"], ["'ABCDE', 1", "2"], ["'AB' * 50000, 50000", "100000"]] },
    { id: "cheap-products", title: "Cheap Products", d: "Medium", lc: "subarray-product-less-than-k",
      statement: "All prices are positive. Count the contiguous subarrays whose **product** is strictly less than `k`.",
      examples: [["[10, 5, 2, 6], 100", "8", ""], ["[1, 2, 3], 0", "0", ""]],
      constraints: ["1 ≤ len(prices) ≤ 3·10⁴", "1 ≤ prices[i] ≤ 1000", "0 ≤ k ≤ 10⁶"],
      hints: ["Shrink while the product is ≥ k.", "Every subarray ending at r and starting in [l, r] is valid: that's r − l + 1 of them."],
      solution: `def cheap_products(prices, k):
    if k <= 1:
        return 0
    prod, l, count = 1, 0, 0
    for r, x in enumerate(prices):
        prod *= x
        while prod >= k:
            prod //= prices[l]
            l += 1
        count += r - l + 1
    return count`,
      why: "For each right edge the window is the longest valid one, and all its suffixes are valid too: add r − l + 1.", time: "O(n)",
      hidden: [["[1, 1, 1], 2", "6"], ["[5], 5", "0"], ["[1] * 30000, 2", "450015000"]] },
    { id: "cover-all", title: "Cover Every Letter", d: "Hard", lc: "minimum-window-substring",
      statement: "Return the **shortest** substring of `s` that contains every character of `t`, counting repeats (if `t` has two 'a's, so must the substring). If several have the same length, return the leftmost. Return `''` if none exists.",
      examples: [["'ADOBECODEBANC', 'ABC'", "'BANC'", ""], ["'a', 'a'", "'a'", ""], ["'a', 'aa'", "''", ""]],
      constraints: ["1 ≤ len(s), len(t) ≤ 10⁵", "upper and lowercase letters"],
      hints: ["Count what's still missing from t.", "Expand until nothing is missing, then shrink while that stays true, recording the best.", "Keep `missing` as a single number so the check is O(1)."],
      solution: `from collections import Counter

def cover_all(s, t):
    need, missing = Counter(t), len(t)
    l, best = 0, (0, float("inf"))
    for r, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:
            if r - l < best[1] - best[0]:
                best = (l, r)
            need[s[l]] += 1
            if need[s[l]] > 0:
                missing += 1
            l += 1
    return "" if best[1] == float("inf") else s[best[0]:best[1] + 1]`,
      why: "`need` goes negative for surplus letters, so `missing` changes only for letters that matter. Both edges move forward only.", time: "O(|s| + |t|)",
      hidden: [["'ab', 'b'", "'b'"], ["'aa', 'aa'", "'aa'"], ["'a' * 50000 + 'bc' + 'a' * 50000, 'cb'", "'bc'"]] },
    { id: "exactly-k-kinds", title: "Exactly K Kinds", d: "Hard", lc: "subarrays-with-k-different-integers",
      statement: "Count the contiguous subarrays that contain **exactly** `k` distinct values.",
      examples: [["[1, 2, 1, 2, 3], 2", "7", ""], ["[1, 2, 1, 3, 4], 3", "3", ""]],
      constraints: ["1 ≤ len(nums) ≤ 2·10⁴", "1 ≤ k ≤ len(nums)"],
      hints: ["“Exactly k” is hard to window directly; “at most k” is easy.", "exactly(k) = atMost(k) − atMost(k − 1).", "atMost counts r − l + 1 subarrays per right edge."],
      solution: `def exactly_k_kinds(nums, k):
    def at_most(m):
        count, l, total = {}, 0, 0
        for r, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > m:
                count[nums[l]] -= 1
                if count[nums[l]] == 0:
                    del count[nums[l]]
                l += 1
            total += r - l + 1
        return total
    return at_most(k) - at_most(k - 1)`,
      why: "“At most m distinct” is monotone, so it windows cleanly; subtracting two of them leaves exactly k.", time: "O(n)",
      hidden: [["[1], 1", "1"], ["[1, 1, 1], 2", "0"], ["[1, 2] * 10000, 2", "199990000"]] }
  ]
});
