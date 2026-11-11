PAT("hashing", {
  time: "O(n)", space: "O(n)",
  lede: "Trade memory for speed: remember what you've seen in a dict or set, so every lookup is O(1) instead of another loop.",
  idea: "Most brute-force solutions have an inner loop whose only job is to **search**: “have I seen x?”, “where was the partner?”, “how many times?”. A hash map answers those in O(1), so the inner loop disappears and O(n²) becomes O(n).",
  analogy: "A teacher taking attendance doesn't re-read the whole register for each student who walks in. They tick names on a list they can find instantly.",
  flavours: [["Flavour", "Store", "Use it for"], [
    ["**Seen**", "`set()` of values", "duplicates, first repeat, membership"],
    ["**Index**", "`dict` value → index", "pair / complement lookups (Two Sum)"],
    ["**Count**", "`Counter` value → count", "anagrams, frequencies, “at most k times”"],
    ["**Group**", "`dict` key → list", "group items that share a canonical key"]]],
  signals: [["Find a pair / complement in **unsorted** data", "and you need original positions"], ["“Duplicate”, “first unique”, “how many times”", "counting or membership questions"], ["Group items that are **equivalent**", "anagrams, same pattern, same signature"], ["You're about to nest a loop **just to search**", "replace the inner loop with a lookup"]],
  not: "**Not this pattern** when the data is sorted and you need O(1) extra space (→ two pointers), or the question is about a contiguous range (→ sliding window or prefix sums).",
  templates: [
    ["Index map", "two_sum.py", `def two_sum(nums, target):
    seen = {}                          # value -> index
    for i, x in enumerate(nums):
        need = target - x              # what would complete the pair?
        if need in seen:               # O(1) instead of an inner loop
            return [seen[need], i]
        seen[x] = i                    # record AFTER checking
    return []

print(two_sum([2, 7, 11, 15], 9))`, "[0, 1]"],
    ["Count", "count.py", `from collections import Counter

def first_unique(s):
    count = Counter(s)                 # pass 1: count everything
    for i, ch in enumerate(s):         # pass 2: first with count 1
        if count[ch] == 1:
            return i
    return -1

print(first_unique("leetcode"), first_unique("aabb"))`, "0 -1"],
    ["Group", "group.py", `from collections import defaultdict

def group_by_key(words):
    groups = defaultdict(list)
    for w in words:
        key = "".join(sorted(w))       # canonical form shared by the group
        groups[key].append(w)
    return list(groups.values())

print(group_by_key(["eat", "tea", "tan", "ate", "nat", "bat"]))`, "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]"]
  ],
  examples: [
    { t: "Two Sum", d: "Easy", lc: "two-sum", f: "Index",
      q: "Return the indices of the two numbers that add up to target. The array is unsorted.",
      idea: "For each x, the partner is `target − x`. Look it up in a dict of values already seen.",
      code: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i

print(two_sum([3, 2, 4], 6))`, out: "[1, 2]", cx: "O(n) time · O(n) space" },
    { t: "Group Anagrams", d: "Medium", lc: "group-anagrams", f: "Group",
      q: "Group words that are anagrams of each other.",
      idea: "Anagrams share a canonical key: the sorted letters (or a 26-count tuple). Use key → list.",
      code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        groups[tuple(sorted(w))].append(w)
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`, out: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]", cx: "O(n · k log k)" },
    { t: "Longest Consecutive Sequence", d: "Medium", lc: "longest-consecutive-sequence", f: "Seen",
      q: "Length of the longest run of consecutive integers in an unsorted array, in O(n).",
      idea: "Put everything in a set. Only start counting at a run's first number (x − 1 not in the set), so each number is visited once.",
      code: `def longest_consecutive(nums):
    s, best = set(nums), 0
    for x in s:
        if x - 1 not in s:
            n = 1
            while x + n in s:
                n += 1
            best = max(best, n)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))`, out: "4", cx: "O(n)" },
    { t: "Isomorphic Strings", d: "Easy", lc: "isomorphic-strings", f: "Index",
      q: "Can the characters of s be replaced (one-to-one) to get t?",
      idea: "Two dicts enforce the mapping both ways: s→t and t→s.",
      code: `def is_isomorphic(s, t):
    st, ts = {}, {}
    for a, b in zip(s, t):
        if st.get(a, b) != b or ts.get(b, a) != a:
            return False
        st[a], ts[b] = b, a
    return True

print(is_isomorphic("egg", "add"), is_isomorphic("badc", "baba"))`, out: "True False", cx: "O(n)" }
  ],
  pitfalls: [
    ["Using a **list** for `seen`", "`x in list` is O(n), so the whole thing quietly becomes O(n²)."],
    ["Recording before checking", "In Two Sum, adding x first lets x pair with itself."],
    ["Using a list as a dict key", "Lists aren't hashable. Convert to a tuple (or a string)."],
    ["Forgetting the reverse mapping", "One-to-one questions need two dicts, or a set of used targets."]
  ],
  edge: ["Empty input", "All values equal", "Negative numbers and zero", "Answer uses the same value twice (e.g. 3 + 3)", "Unicode / uppercase letters"],
  compare: [
    ["Two Pointers", "two-pointers", "Sorted input and O(1) space wanted → two pointers. Unsorted and you need indices → hashing."],
    ["Prefix Sum", "prefix-sum", "When the thing you look up is a **running sum** (subarray sum = k), you're doing prefix sums + a hash map."],
    ["Sliding Window", "sliding-window-variable", "A window often keeps a Counter of what's inside it, but the question is about a contiguous range."]
  ],
  mcq: [
    ["Why is `seen = []` with `if x in seen` a problem for n = 10⁵?", ["Lists can't hold numbers", "Each `in` check is O(n), so the loop is O(n²)", "It uses too much memory", "It changes the order"], 1, "Membership in a list scans it. Use a set for O(1) membership."],
    ["Best key for grouping anagrams of lowercase words?", ["The word itself", "`len(word)`", "`tuple(sorted(word))` or a 26-count tuple", "The first letter"], 2, "All anagrams share the same sorted letters / letter counts, and tuples are hashable."]
  ],
  summary: {
    oneLine: "Remember what you've seen in a dict / set so each lookup is O(1).",
    signals: ["Find a pair / complement in **unsorted** data", "Duplicates, first unique, “how many times”", "Group equivalent items (anagrams)", "You're about to nest a loop just to search"],
    template: `seen = {}
for i, x in enumerate(nums):
    if target - x in seen:
        return [seen[target - x], i]
    seen[x] = i          # record AFTER checking`,
    pitfalls: ["`x in list` is O(n): use a set or dict", "Lists can't be dict keys: use a tuple", "Record after checking, or x pairs with itself"],
    cx: "O(n) time · O(n) space",
    drill: { task: "Return the indices `[i, j]` of the two numbers that add up to target (unsorted input, exactly one answer).",
      ref: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i`,
      tests: [["[2, 7, 11, 15], 9", "[0, 1]"], ["[3, 2, 4], 6", "[1, 2]"], ["[3, 3], 6", "[0, 1]"]] }
  },
  problems: [
    { id: "first-repeat", title: "First Repeat", d: "Easy", lc: "contains-duplicate",
      statement: "You're scanning order IDs from left to right. Return the **first ID whose second appearance comes earliest** in the list. If no ID ever repeats, return `-1`.",
      examples: [["[2, 5, 1, 2, 3, 5, 1, 2, 4]", "2", "2 appears again at index 3, before any other ID repeats."], ["[2, 1, 1, 2, 3]", "1", "1 repeats at index 2, earlier than 2 does."], ["[1, 2, 3]", "-1", ""]],
      constraints: ["0 ≤ len(nums) ≤ 10⁵", "−10⁹ ≤ nums[i] ≤ 10⁹"],
      hints: ["You only need to know whether you've seen a value before.", "A set gives an O(1) “seen it?” check.", "Return the moment you meet a value already in the set."],
      solution: `def first_repeat(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return x
        seen.add(x)
    return -1`,
      why: "Scanning once and returning on the first value already in the set gives the earliest second appearance. Each lookup is O(1).", time: "O(n)",
      hidden: [["[]", "-1"], ["[7, 7]", "7"], ["list(range(100000)) + [5]", "5"], ["[-1000000000, 3, -1000000000]", "-1000000000"]] },
    { id: "pair-target", title: "Pair for the Target", d: "Easy", lc: "two-sum",
      statement: "`prices` is **unsorted**. Exactly one pair of different positions `i < j` has `prices[i] + prices[j] == target`. Return `[i, j]`.",
      examples: [["[2, 7, 11, 15], 9", "[0, 1]", ""], ["[3, 2, 4], 6", "[1, 2]", "Not [0, 0]: a position can't be used twice."], ["[3, 3], 6", "[0, 1]", ""]],
      constraints: ["2 ≤ len(prices) ≤ 10⁵", "−10⁹ ≤ prices[i], target ≤ 10⁹"],
      hints: ["For each price x, which value would complete the pair?", "Store each value's index in a dict as you go.", "Check for `target − x` before storing x."],
      solution: `def pair_target(prices, target):
    seen = {}
    for j, x in enumerate(prices):
        if target - x in seen:
            return [seen[target - x], j]
        seen[x] = j`,
      why: "The dict answers “have I seen the partner, and where?” in O(1), replacing the inner loop of the brute force.", time: "O(n)",
      hidden: [["[-3, 4, 3, 90], 0", "[0, 2]"], ["[0, 4, 3, 0], 0", "[0, 3]"], ["list(range(1, 100001)), 199999", "[99998, 99999]"]] },
    { id: "same-letters", title: "Same Letters", d: "Easy", lc: "valid-anagram",
      statement: "Two labels are *scrambles* of each other if they use exactly the same letters the same number of times. Return `True` if `a` and `b` are scrambles.",
      examples: [["'listen', 'silent'", "True", ""], ["'rat', 'car'", "False", ""], ["'aab', 'abb'", "False", "Same letters, different counts."]],
      constraints: ["1 ≤ len(a), len(b) ≤ 10⁵", "lowercase English letters"],
      hints: ["Different lengths can never match.", "Count the letters of each word.", "`Counter(a) == Counter(b)`, or one count array of size 26."],
      solution: `def same_letters(a, b):
    if len(a) != len(b):
        return False
    count = {}
    for ch in a:
        count[ch] = count.get(ch, 0) + 1
    for ch in b:
        if count.get(ch, 0) == 0:
            return False
        count[ch] -= 1
    return True`,
      why: "Counting letters in one pass and un-counting in another checks equal multisets in O(n).", time: "O(n)",
      hidden: [["'a', 'ab'", "False"], ["'abc', 'cba'", "True"], ["'ab' * 50000, 'ba' * 50000", "True"]] },
    { id: "ransom-letters", title: "Cut-out Letters", d: "Easy", lc: "ransom-note",
      statement: "You want to build `note` by cutting letters out of `magazine`. Each magazine letter can be used once. Return `True` if it's possible.",
      examples: [["'aa', 'aab'", "True", ""], ["'aa', 'ab'", "False", "Only one 'a' available."]],
      constraints: ["1 ≤ len(note), len(magazine) ≤ 10⁵", "lowercase letters"],
      hints: ["Count what the magazine offers.", "Spend one count per letter of the note; fail if a count runs out."],
      solution: `from collections import Counter

def can_build(note, magazine):
    have = Counter(magazine)
    for ch in note:
        if have[ch] == 0:
            return False
        have[ch] -= 1
    return True`,
      why: "A Counter of available letters makes each “do I still have one?” check O(1).", time: "O(n + m)",
      hidden: [["'abc', 'cbaxyz'", "True"], ["'z', 'aaaa'", "False"], ["'a' * 50000, 'a' * 49999 + 'b'", "False"]] },
    { id: "word-pattern", title: "Follows the Pattern", d: "Easy", lc: "word-pattern",
      statement: "`pattern` is a string of letters and `s` is words separated by single spaces. Return `True` if there is a **one-to-one** mapping between pattern letters and words so that `s` follows `pattern`.",
      examples: [["'abba', 'dog cat cat dog'", "True", ""], ["'abba', 'dog cat cat fish'", "False", ""], ["'aaaa', 'dog cat cat dog'", "False", ""], ["'ab', 'dog dog'", "False", "Two letters can't map to the same word."]],
      constraints: ["1 ≤ len(pattern) ≤ 300", "1 ≤ number of words ≤ 3000"],
      hints: ["Lengths must match first.", "Keep letter → word and word → letter dicts.", "Any conflict in either direction means False."],
      solution: `def follows(pattern, s):
    words = s.split()
    if len(words) != len(pattern):
        return False
    lw, wl = {}, {}
    for ch, w in zip(pattern, words):
        if lw.get(ch, w) != w or wl.get(w, ch) != ch:
            return False
        lw[ch], wl[w] = w, ch
    return True`,
      why: "Two dicts guarantee the mapping is a bijection: no letter maps to two words and no word to two letters.", time: "O(n)",
      hidden: [["'a', 'x'", "True"], ["'abc', 'x y'", "False"], ["'ab' * 1500, 'up down ' * 1499 + 'up down'", "True"]] },
    { id: "anagram-groups", title: "Anagram Groups", d: "Medium", lc: "group-anagrams",
      statement: "Group the words that are anagrams of each other. Return a list of groups. (The checker sorts the words inside each group and then the groups, so any order is fine.)",
      examples: [["['eat', 'tea', 'tan', 'ate', 'nat', 'bat']", "[['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']]", ""], ["['']", "[['']]", ""]],
      constraints: ["1 ≤ len(words) ≤ 10⁴", "0 ≤ len(words[i]) ≤ 100"],
      hints: ["Anagrams look identical once you sort their letters.", "Use that sorted form as a dict key.", "`defaultdict(list)` collects each group."],
      solution: `from collections import defaultdict

def anagram_groups(words):
    groups = defaultdict(list)
    for w in words:
        groups["".join(sorted(w))].append(w)
    return list(groups.values())`,
      conv: "sorted(sorted(g) for g in r)",
      why: "Every word maps to its canonical key in O(k log k); words sharing a key are anagrams.", time: "O(n · k log k)",
      hidden: [["['a']", "[['a']]"], ["['ab', 'ba', 'abc', 'cab', 'x']", "[['ab', 'ba'], ['abc', 'cab'], ['x']]"], ["['abc', 'bca', 'cab'] * 3000", "[sorted(['abc', 'bca', 'cab'] * 3000)]"]] },
    { id: "longest-streak", title: "Longest Streak", d: "Medium", lc: "longest-consecutive-sequence",
      statement: "`days` lists the day numbers on which you studied (unsorted, may repeat). Return the length of the longest run of **consecutive** day numbers. Aim for O(n), no sorting.",
      examples: [["[100, 4, 200, 1, 3, 2]", "4", "1, 2, 3, 4"], ["[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]", "9", ""]],
      constraints: ["0 ≤ len(days) ≤ 10⁵", "−10⁹ ≤ days[i] ≤ 10⁹"],
      hints: ["Put everything in a set for O(1) membership.", "Only start counting at the beginning of a run: x − 1 is not in the set.", "From a start, walk x+1, x+2, … while present."],
      solution: `def longest_streak(days):
    s, best = set(days), 0
    for x in s:
        if x - 1 not in s:
            n = 1
            while x + n in s:
                n += 1
            best = max(best, n)
    return best`,
      why: "Each run is walked exactly once, from its first number, so the total work is O(n).", time: "O(n)",
      hidden: [["[]", "0"], ["[5, 5, 5]", "1"], ["list(range(100000, 0, -1))", "100000"], ["[1, 3, 5, 2, 4, 10]", "5"]] },
    { id: "pairs-with-gap", title: "Pairs With a Gap", d: "Medium", lc: "k-diff-pairs-in-an-array",
      statement: "Count the number of **unique** value pairs `(a, b)` from `nums` with `b − a == k` (k ≥ 0). Pairs are by value: `(1, 3)` counts once however many 1s and 3s exist. For `k = 0`, a pair needs a value that appears at least twice.",
      examples: [["[3, 1, 4, 1, 5], 2", "2", "(1, 3) and (3, 5)"], ["[1, 2, 3, 4, 5], 1", "4", ""], ["[1, 3, 1, 5, 4], 0", "1", "(1, 1)"]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "0 ≤ k ≤ 10⁷"],
      hints: ["Count each value with a Counter.", "k > 0: for each distinct x, check whether x + k exists.", "k = 0: count values that appear at least twice."],
      solution: `from collections import Counter

def pairs_with_gap(nums, k):
    c = Counter(nums)
    if k == 0:
        return sum(1 for v in c.values() if v > 1)
    return sum(1 for x in c if x + k in c)`,
      why: "Working over distinct values makes each pair count once; the Counter handles the k = 0 special case.", time: "O(n)",
      hidden: [["[1, 1, 1, 1], 0", "1"], ["[1, 2], 5", "0"], ["list(range(100000)), 3", "99997"]] },
    { id: "near-duplicate", title: "Near Duplicate", d: "Hard", lc: "contains-duplicate-iii",
      statement: "Return `True` if there are two different positions `i, j` with `|i − j| ≤ k` and `|nums[i] − nums[j]| ≤ t`.",
      examples: [["[1, 2, 3, 1], 3, 0", "True", ""], ["[1, 5, 9, 1, 5, 9], 2, 3", "False", ""], ["[1, 5, 9], 1, 4", "True", "5 − 1 = 4"]],
      constraints: ["2 ≤ len(nums) ≤ 10⁵", "1 ≤ k ≤ 10⁵", "0 ≤ t ≤ 10⁹"],
      hints: ["Only the last k values matter at any point.", "Put values into buckets of width t + 1: two values in the same bucket are always within t.", "Also check the neighbouring buckets; evict the value that leaves the window."],
      solution: `def near_duplicate(nums, k, t):
    w = t + 1
    buckets = {}
    for i, x in enumerate(nums):
        b = x // w
        if b in buckets:
            return True
        if b - 1 in buckets and x - buckets[b - 1] <= t:
            return True
        if b + 1 in buckets and buckets[b + 1] - x <= t:
            return True
        buckets[b] = x
        if i >= k:
            del buckets[nums[i - k] // w]
    return False`,
      why: "Buckets of width t + 1 hold at most one value from the window (otherwise we'd already have returned), so each step is O(1).", time: "O(n)",
      hidden: [["[1, 3, 6, 2], 1, 2", "True"], ["[-3, 3], 2, 4", "False"], ["list(range(0, 1000000, 10)), 100000, 9", "False"], ["[8, 1, 5, 9], 1, 1", "False"], ["[8, 1, 9], 2, 1", "True"]] }
  ]
});
