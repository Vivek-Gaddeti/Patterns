PAT("custom-sort", {
  time: "O(n log n)", space: "O(n)",
  lede: "Many OA tasks are “sort these by this rule, then by that rule”. In Python, express the rule as a key: a tuple sorts by its first item, then the second, and a minus sign flips a numeric field to descending. When the rule compares two items directly, use `cmp_to_key`.",
  idea: "`sorted(items, key=lambda x: (primary, secondary, ...))` handles almost every multi-level ordering: tuples compare left to right, `-value` reverses a number, and Python's sort is **stable** (equal keys keep their input order), which some statements rely on. When the order between a and b can't be expressed as a key (like “which concatenation is bigger”), write `cmp(a, b)` returning negative / zero / positive and wrap it with `functools.cmp_to_key`. Sorting is also a tool: merge sort can count inversions while it sorts.",
  analogy: "Sorting a deck by suit and then by rank: you compare suits first, and only look at ranks when the suits match.",
  flavours: [["Need", "Python", "Example"], [
    ["**Several criteria**", "`key=lambda x: (a, b, c)`", "frequency, then value"],
    ["**Descending on one field**", "negate it: `(-count, word)`", "most frequent first, ties alphabetical"],
    ["**Order from a list**", "`rank = {v: i}`; `key=rank.get`", "relative sort, custom alphabet"],
    ["**Pairwise rule**", "`cmp_to_key(cmp)`", "largest number from digits"],
    ["**Stable ordering**", "sort by the less important key first", "keep original order for ties"]]],
  signals: [["“Sort by …, and if equal, by …”", "tuple keys"], ["“In the order given by another list / alphabet”", "rank dictionary"], ["“Arrange to form the largest / smallest …”", "pairwise comparator"], ["Count pairs that are out of order", "merge sort counting"]],
  not: "**Not this pattern** when you only need the top k (→ heap), or values come from a small range (→ counting / bucket sort is O(n)).",
  templates: [
    ["Keys and comparators", "keys.py", `from functools import cmp_to_key
from collections import Counter

nums = [1, 1, 2, 2, 2, 3]
c = Counter(nums)
print(sorted(nums, key=lambda x: (c[x], -x)))         # by frequency asc, then value desc

def cmp(a, b):                                        # "largest number" order
    return -1 if a + b > b + a else (1 if a + b < b + a else 0)
print("".join(sorted(["3", "30", "34", "5", "9"], key=cmp_to_key(cmp))))`, "[3, 1, 1, 2, 2, 2]\n9534330"]
  ],
  examples: [
    { t: "Reorder Data in Log Files", d: "Medium", lc: "reorder-data-in-log-files", f: "Tuple key + stability",
      q: "Letter-logs first, sorted by content then identifier; digit-logs after, in original order.",
      idea: "Key: (0, content, id) for letter-logs and (1,) for digit-logs; stability keeps digit-logs in order.",
      code: `def reorder(logs):
    def key(log):
        ident, rest = log.split(" ", 1)
        return (0, rest, ident) if rest[0].isalpha() else (1,)
    return sorted(logs, key=key)

print(reorder(["d1 8 1 5 1", "l1 art can", "d2 3 6", "l2 own kit dig", "l3 art zero"]))`, out: "['l1 art can', 'l3 art zero', 'l2 own kit dig', 'd1 8 1 5 1', 'd2 3 6']", cx: "O(n log n · L)" },
    { t: "Count of Smaller Numbers After Self", d: "Hard", lc: "count-of-smaller-numbers-after-self", f: "Merge sort counting",
      q: "For each element, how many smaller elements are to its right?",
      idea: "Merge sort indices by value; when taking from the left half, every right-half element already taken is smaller and to its right.",
      code: `def count_smaller(nums):
    res = [0] * len(nums)
    def sort(idx):
        if len(idx) <= 1: return idx
        mid = len(idx) // 2
        left, right = sort(idx[:mid]), sort(idx[mid:])
        out, j = [], 0
        for i in left:
            while j < len(right) and nums[right[j]] < nums[i]:
                out.append(right[j]); j += 1
            res[i] += j
            out.append(i)
        return out + right[j:]
    sort(list(range(len(nums))))
    return res

print(count_smaller([5, 2, 6, 1]))`, out: "[2, 1, 1, 0]", cx: "O(n log n)" }
  ],
  pitfalls: [
    ["Negating a string for descending order", "You can't: sort twice (stable), use `reverse=True` on one pass, or a comparator."],
    ["Comparator that isn't consistent", "cmp(a, b) must be the opposite of cmp(b, a), or the sort is undefined."],
    ["Forgetting ties", "Statements usually specify the tie-break; put it as the next tuple field."],
    ["Leading zeros in “largest number”", "If the result starts with '0', the answer is '0'."]
  ],
  edge: ["All equal keys", "Empty list", "Negative numbers", "Values missing from the order list", "Numbers that are prefixes of each other (3 vs 30)"],
  compare: [
    ["Top-K / Heaps", "top-k", "If you only need the first k after sorting, a heap is O(n log k)."],
    ["Greedy", "greedy", "Many greedy algorithms are “sort by the right key, then sweep”."],
    ["Hashing", "hashing", "Frequency-based orders start with a Counter."]
  ],
  mcq: [
    ["Sort words by count descending, then alphabetically. Which key?", ["(count, word)", "(-count, word)", "(word, -count)", "(-count, -word)"], 1, "Negate the number; strings stay ascending."],
    ["Why use cmp_to_key for “largest number”?", ["It's faster", "The order depends on comparing a+b with b+a, which isn't a per-item key", "Required for strings", "To sort numbers"], 1, "The rule only exists between pairs."]
  ],
  summary: {
    oneLine: "Encode multi-level orders as tuple keys (negate numbers for descending); cmp_to_key for pairwise rules.",
    signals: ["Sort by A, then by B", "Order given by another list", "Arrange for the largest result", "Count inversions"],
    template: `sorted(items, key=lambda x: (-x.count, x.name))
sorted(items, key=cmp_to_key(lambda a, b: ...))`,
    pitfalls: ["Can't negate strings", "Consistent comparators", "State the tie-break"],
    cx: "O(n log n) time · O(n) space",
    drill: { task: "Sort `nums` by how often each value appears (rarer first); for equal frequencies, larger values first.",
      ref: `def freq_sort(nums):
    c = Counter(nums)
    return sorted(nums, key=lambda x: (c[x], -x))`,
      tests: [["[1, 1, 2, 2, 2, 3]", "[3, 1, 1, 2, 2, 2]"], ["[2, 3, 1, 3, 2]", "[1, 3, 3, 2, 2]"], ["[-1, 1, -6, 4, 5, -6, 1, 4, 1]", "[5, -1, 4, 4, -6, -6, 1, 1, 1]"]] }
  },
  problems: [
    { id: "rare-first", title: "Rare Values First", d: "Easy", lc: "sort-array-by-increasing-frequency",
      statement: "Sort `nums` by frequency (values that appear fewer times first). For equal frequencies, put **larger** values first.",
      examples: [["[1, 1, 2, 2, 2, 3]", "[3, 1, 1, 2, 2, 2]", ""], ["[2, 3, 1, 3, 2]", "[1, 3, 3, 2, 2]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Count with a Counter.", "Key: (count, −value)."],
      solution: `def rare_first(nums):
    c = Counter(nums)
    return sorted(nums, key=lambda x: (c[x], -x))`,
      why: "A tuple key encodes both rules at once.", time: "O(n log n)",
      hidden: [["[5]", "[5]"], ["[1, 2, 3]", "[3, 2, 1]"], ["[i % 10 for i in range(100000)]", "sorted([i % 10 for i in range(100000)], key=lambda x: -x)"]] },
    { id: "bits-then-value", title: "Fewest Bits First", d: "Easy", lc: "sort-integers-by-the-number-of-1-bits",
      statement: "Sort `nums` by the number of 1 bits in each value; ties are broken by the value itself (ascending).",
      examples: [["[0, 1, 2, 3, 4, 5, 6, 7, 8]", "[0, 1, 2, 4, 8, 3, 5, 6, 7]", ""], ["[1024, 512, 256, 128]", "[128, 256, 512, 1024]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "0 ≤ nums[i] ≤ 10⁴"],
      hints: ["Key: (bit count, value).", "`bin(x).count('1')` counts bits."],
      solution: `def bits_then_value(nums):
    return sorted(nums, key=lambda x: (bin(x).count("1"), x))`,
      why: "The tuple compares bit counts first and falls back to the value.", time: "O(n log n)",
      hidden: [["[3]", "[3]"], ["[7, 8, 3]", "[8, 3, 7]"], ["list(range(10001))", "sorted(range(10001), key=lambda x: (bin(x).count('1'), x))"]] },
    { id: "follow-the-order", title: "Follow the Order", d: "Easy", lc: "relative-sort-array",
      statement: "Sort `a` so that values appearing in `order` come first, in the same order as in `order`; the remaining values come after, in ascending order. (`order` has distinct values.)",
      examples: [["[2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], [2, 1, 4, 3, 9, 6]", "[2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19]", ""], ["[28, 6, 22, 8, 44, 17], [22, 28, 8, 6]", "[22, 28, 8, 6, 17, 44]", ""]],
      constraints: ["1 ≤ len(a) ≤ 10⁵"],
      hints: ["Map each value in order to its position.", "Key: (position, value), with position = len(order) for values not listed."],
      solution: `def follow_the_order(a, order):
    rank = {v: i for i, v in enumerate(order)}
    return sorted(a, key=lambda x: (rank.get(x, len(order)), x))`,
      why: "Unlisted values share the largest rank and fall back to ascending order.", time: "O(n log n)",
      hidden: [["[3, 1, 2], []", "[1, 2, 3]"], ["[1, 2, 3], [3, 2, 1]", "[3, 2, 1]"], ["list(range(100000)), [99999]", "[99999] + list(range(99999))"]] },
    { id: "biggest-number", title: "Biggest Number", d: "Medium", lc: "largest-number",
      statement: "Arrange the non-negative integers in `nums` so that their concatenation is as large as possible. Return it as a string (without extra leading zeros).",
      examples: [["[10, 2]", "'210'", ""], ["[3, 30, 34, 5, 9]", "'9534330'", ""], ["[0, 0]", "'0'", ""]],
      constraints: ["1 ≤ len(nums) ≤ 100", "0 ≤ nums[i] ≤ 10⁹"],
      hints: ["Compare two numbers a and b by which concatenation is bigger: a+b or b+a.", "Use functools.cmp_to_key with that rule.", "If the result starts with '0', it's all zeros."],
      solution: `def biggest_number(nums):
    s = [str(x) for x in nums]
    def cmp(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0
    s.sort(key=cmp_to_key(cmp))
    res = "".join(s)
    return "0" if res[0] == "0" else res`,
      why: "The pairwise rule is transitive, so sorting by it puts every number in the best possible slot.", time: "O(n log n · L)",
      hidden: [["[1]", "'1'"], ["[121, 12]", "'12121'"], ["[0] * 100", "'0'"]] },
    { id: "log-order", title: "Order the Logs", d: "Medium", lc: "reorder-data-in-log-files",
      statement: "Each log is `'<id> <words...>'`. Letter-logs (words are letters) come before digit-logs (words are digits). Letter-logs are sorted by their words, then by id. Digit-logs keep their original relative order. Return the logs in this order.",
      examples: [["['dig1 8 1 5 1', 'let1 art can', 'dig2 3 6', 'let2 own kit dig', 'let3 art zero']", "['let1 art can', 'let3 art zero', 'let2 own kit dig', 'dig1 8 1 5 1', 'dig2 3 6']", ""], ["['a1 9 2 3 1', 'g1 act car', 'zo4 4 7', 'ab1 off key dog', 'a8 act zoo']", "['g1 act car', 'a8 act zoo', 'ab1 off key dog', 'a1 9 2 3 1', 'zo4 4 7']", ""]],
      constraints: ["1 ≤ len(logs) ≤ 100"],
      hints: ["Split each log into id and the rest.", "Key (0, rest, id) for letter-logs and (1,) for digit-logs.", "Python's sort is stable, so digit-logs keep their order."],
      solution: `def log_order(logs):
    def key(log):
        ident, rest = log.split(" ", 1)
        return (0, rest, ident) if rest[0].isalpha() else (1,)
    return sorted(logs, key=key)`,
      why: "Tuple keys rank the groups and the fields; stability handles the “keep original order” rule for free.", time: "O(n log n · L)",
      hidden: [["['a 1']", "['a 1']"], ["['b x', 'a x']", "['a x', 'b x']"], ["['d' + str(i) + ' 1' for i in range(100)]", "['d' + str(i) + ' 1' for i in range(100)]"]] },
    { id: "letter-frequency", title: "Letters by Frequency", d: "Medium", lc: "sort-characters-by-frequency",
      statement: "Rearrange `s` so that characters appear in order of decreasing frequency, with equal characters grouped together. For equal frequencies, put the character with the **smaller** code point first.",
      examples: [["'tree'", "'eert'", ""], ["'cccaaa'", "'aaaccc'", ""], ["'Aabb'", "'bbAa'", ""]],
      constraints: ["1 ≤ len(s) ≤ 5·10⁵"],
      hints: ["Count characters.", "Sort the distinct characters by (−count, char) and repeat each by its count."],
      solution: `def letter_frequency(s):
    c = Counter(s)
    return "".join(ch * c[ch] for ch in sorted(c, key=lambda ch: (-c[ch], ch)))`,
      why: "Sorting only the distinct characters keeps it fast; joining repeats builds the answer in linear time.", time: "O(n + k log k)",
      hidden: [["'a'", "'a'"], ["'abab'", "'aabb'"], ["'xy' * 100000 + 'x'", "'x' * 100001 + 'y' * 100000"]] },
    { id: "citation-index", title: "Citation Index", d: "Medium", lc: "h-index",
      statement: "`cites[i]` is the number of citations of paper i. Return the largest h such that at least h papers have at least h citations each.",
      examples: [["[3, 0, 6, 1, 5]", "3", ""], ["[1, 3, 1]", "1", ""]],
      constraints: ["1 ≤ len(cites) ≤ 5000"],
      hints: ["Sort citations in descending order.", "h is the number of positions i where cites[i] ≥ i + 1."],
      solution: `def citation_index(cites):
    h = 0
    for i, c in enumerate(sorted(cites, reverse=True)):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h`,
      why: "After sorting descending, the first i + 1 papers all have at least cites[i] citations.", time: "O(n log n)",
      hidden: [["[0]", "0"], ["[100]", "1"], ["[5000] * 5000", "5000"]] },
    { id: "smaller-after", title: "Smaller Ones After", d: "Hard", lc: "count-of-smaller-numbers-after-self",
      statement: "For each position i, count how many elements to the right of i are **strictly smaller** than `nums[i]`. Return the list of counts.",
      examples: [["[5, 2, 6, 1]", "[2, 1, 1, 0]", ""], ["[-1]", "[0]", ""], ["[-1, -1]", "[0, 0]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Brute force is O(n²).", "Merge sort the indices by value.", "While merging, when you take an element from the left half, every right-half element already taken is smaller and was to its right."],
      solution: `def smaller_after(nums):
    res = [0] * len(nums)
    idx = list(range(len(nums)))
    width = 1
    n = len(nums)
    while width < n:
        merged = []
        for start in range(0, n, 2 * width):
            left = idx[start:start + width]
            right = idx[start + width:start + 2 * width]
            j = 0
            for i in left:
                while j < len(right) and nums[right[j]] < nums[i]:
                    merged.append(right[j])
                    j += 1
                res[i] += j
                merged.append(i)
            merged.extend(right[j:])
        idx = merged
        width *= 2
    return res`,
      why: "Each merge counts, for every left element, the right elements that jump ahead of it: exactly the smaller ones after it.", time: "O(n log n)",
      hidden: [["[1, 2, 3]", "[0, 0, 0]"], ["[3, 2, 1]", "[2, 1, 0]"], ["list(range(100000, 0, -1))", "list(range(99999, -1, -1))"]] }
  ]
});
