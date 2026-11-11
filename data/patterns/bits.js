PAT("bits", {
  time: "O(n) or O(bits)", space: "O(1)",
  lede: "Treat integers as rows of bits. A handful of identities — x ^ x = 0, x & (x − 1) drops the lowest set bit, x & −x isolates it — solve “find the odd one out”, counting and masking problems in O(1) extra space.",
  idea: "XOR is the star: it's its own inverse and order doesn't matter, so XOR-ing a list cancels every pair and leaves the unpaired value. Beyond that, think **per bit**: counting how many numbers have bit i set solves “appears three times” problems; shifting and masking reads or builds numbers bit by bit. In Python, integers are unbounded, so mask with `0xFFFFFFFF` when a problem assumes 32-bit behaviour.",
  analogy: "A row of light switches: XOR flips switches, AND checks which are on in both rows, OR turns on anything on in either.",
  flavours: [["Trick", "Code", "Use"], [
    ["**Cancel pairs**", "`x ^ x == 0`, `x ^ 0 == x`", "single number, missing number"],
    ["**Drop lowest set bit**", "`x & (x − 1)`", "count bits, power of two"],
    ["**Lowest set bit**", "`x & -x`", "split into two groups, Fenwick tree"],
    ["**Read / set bit i**", "`(x >> i) & 1`, `x | (1 << i)`", "per-bit counting, masks"],
    ["**32-bit emulation**", "`x & 0xFFFFFFFF`", "Python's unbounded ints"]]],
  signals: [["Every element appears twice (or three times) except one", "XOR / per-bit counts"], ["“Without using + or −”, “without extra space”", "bit operations"], ["Count set bits, powers of two", "x & (x − 1)"], ["Subsets of a small set", "masks (see bitmask DP)"]],
  not: "**Not this pattern** when a hash map is simpler and memory isn't restricted, or the question is really about arithmetic (→ math).",
  templates: [
    ["XOR and friends", "bits.py", `from functools import reduce

def single(nums):                      # every other number appears twice
    return reduce(lambda a, b: a ^ b, nums)

def count_ones(x):
    c = 0
    while x:
        x &= x - 1                     # remove the lowest set bit
        c += 1
    return c

def is_power_of_two(x):
    return x > 0 and x & (x - 1) == 0

print(single([4, 1, 2, 1, 2]), count_ones(11), is_power_of_two(64), is_power_of_two(12))`, "4 3 True False"]
  ],
  examples: [
    { t: "Single Number II", d: "Medium", lc: "single-number-ii", f: "Per-bit counts",
      q: "Every element appears three times except one. Find it in O(1) space.",
      idea: "For each bit, count how many numbers have it set; mod 3 leaves the single number's bit.",
      code: `def single_three(nums):
    res = 0
    for b in range(32):
        cnt = sum((x >> b) & 1 for x in nums)
        if cnt % 3:
            res |= 1 << b
    return res - (1 << 32) if res >= 1 << 31 else res   # back to a signed value

print(single_three([2, 2, 3, 2]), single_three([0, 1, 0, 1, 0, 1, -99]))`, out: "3 -99", cx: "O(32 · n)" },
    { t: "Single Number III", d: "Medium", lc: "single-number-iii", f: "Split by a bit",
      q: "Two elements appear once, the rest twice. Find both.",
      idea: "XOR of all = a ^ b ≠ 0. Pick any set bit of it; it splits the numbers into two groups, each containing one single.",
      code: `def two_singles(nums):
    x = 0
    for v in nums: x ^= v
    low = x & -x
    a = 0
    for v in nums:
        if v & low: a ^= v
    return sorted([a, x ^ a])

print(two_singles([1, 2, 1, 3, 2, 5]))`, out: "[3, 5]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Operator precedence", "`x & 1 == 0` means `x & (1 == 0)`. Bracket bit expressions."],
    ["Negative numbers in Python", "Python ints are unbounded; emulate 32-bit with `& 0xFFFFFFFF` and convert back."],
    ["`x & -x` on 0", "It's 0; handle empty / zero cases first."],
    ["Shifting the wrong way", "`x >> i` reads bit i; `1 << i` builds a mask for bit i."]
  ],
  edge: ["Zero", "Negative numbers", "Maximum 32-bit values", "Single element", "All bits set"],
  compare: [
    ["Hashing", "hashing", "A set finds the odd element too, with O(n) space; XOR does it in O(1)."],
    ["Bitmask DP", "bitmask-dp", "Uses these operations to represent subsets as DP states."],
    ["Trie", "trie", "Maximum XOR problems use a trie of bits from high to low."]
  ],
  mcq: [
    ["What does `x & (x − 1)` do?", ["Doubles x", "Clears the lowest set bit of x", "Isolates the lowest set bit", "Flips all bits"], 1, "x − 1 flips the lowest set bit and the zeros below it; AND keeps everything else."],
    ["Why does XOR-ing all numbers find the one that appears once?", ["XOR sorts them", "a ^ a = 0 and XOR is order-independent, so pairs cancel", "XOR adds them", "It doesn't"], 1, "Everything that appears twice cancels to 0, leaving the single value."]
  ],
  summary: {
    oneLine: "x ^ x = 0, x & (x − 1) drops the lowest bit, x & −x isolates it; count per bit when XOR isn't enough.",
    signals: ["Odd one out (twice / three times)", "No + / − allowed, O(1) space", "Count bits, powers of two", "Small sets as masks"],
    template: `res = 0
for x in nums:
    res ^= x          # pairs cancel
# per bit: (x >> b) & 1
# lowest set bit: x & -x`,
    pitfalls: ["Bracket bit expressions", "32-bit emulation in Python", "Handle zero"],
    cx: "O(n) time · O(1) space",
    drill: { task: "Every number appears twice except one. Return it using O(1) extra space.",
      ref: `def lone(nums):
    x = 0
    for v in nums:
        x ^= v
    return x`,
      tests: [["[2, 2, 1]", "1"], ["[4, 1, 2, 1, 2]", "4"], ["[1]", "1"]] }
  },
  problems: [
    { id: "odd-sock", title: "The Odd Sock", d: "Easy", lc: "single-number",
      statement: "Every sock ID in `socks` appears exactly twice except one. Return the unpaired ID using O(1) extra space.",
      examples: [["[2, 2, 1]", "1", ""], ["[4, 1, 2, 1, 2]", "4", ""]],
      constraints: ["1 ≤ len(socks) ≤ 3·10⁴", "−3·10⁴ ≤ socks[i] ≤ 3·10⁴"],
      hints: ["a ^ a = 0 and a ^ 0 = a.", "XOR everything together."],
      solution: `def odd_sock(socks):
    x = 0
    for s in socks:
        x ^= s
    return x`,
      why: "Pairs cancel under XOR regardless of order, leaving the single value.", time: "O(n)",
      hidden: [["[7]", "7"], ["[-1, -1, -2]", "-2"], ["list(range(15000)) * 2 + [99999]", "99999"]] },
    { id: "lit-bits", title: "Lit Bits", d: "Easy", lc: "number-of-1-bits",
      statement: "Return the number of 1 bits in the binary form of the non-negative integer `n`.",
      examples: [["11", "3", "1011"], ["128", "1", ""], ["2147483645", "30", ""]],
      constraints: ["0 ≤ n ≤ 2³¹ − 1"],
      hints: ["n & (n − 1) removes the lowest 1 bit.", "Count how many times you can do that before n is 0."],
      solution: `def lit_bits(n):
    c = 0
    while n:
        n &= n - 1
        c += 1
    return c`,
      why: "Each iteration removes exactly one set bit, so the loop runs once per 1 bit.", time: "O(set bits)",
      hidden: [["0", "0"], ["1", "1"], ["2147483647", "31"]] },
    { id: "bits-table", title: "Bits Table", d: "Easy", lc: "counting-bits",
      statement: "Return a list where position i (for every i from 0 to n) holds the number of 1 bits in i.",
      examples: [["2", "[0, 1, 1]", ""], ["5", "[0, 1, 1, 2, 1, 2]", ""]],
      constraints: ["0 ≤ n ≤ 10⁵"],
      hints: ["i has the same bits as i >> 1, plus its lowest bit.", "bits[i] = bits[i >> 1] + (i & 1)."],
      solution: `def bits_table(n):
    out = [0] * (n + 1)
    for i in range(1, n + 1):
        out[i] = out[i >> 1] + (i & 1)
    return out`,
      why: "Each entry reuses a smaller one, so the whole table is O(n).", time: "O(n)",
      hidden: [["0", "[0]"], ["8", "[0, 1, 1, 2, 1, 2, 2, 3, 1]"], ["100000", "[bin(i).count('1') for i in range(100001)]"]] },
    { id: "power-of-two-check", title: "Power of Two?", d: "Easy", lc: "power-of-two",
      statement: "Return `True` if `n` is a power of two (1, 2, 4, 8, …).",
      examples: [["1", "True", ""], ["16", "True", ""], ["3", "False", ""], ["0", "False", ""]],
      constraints: ["−2³¹ ≤ n ≤ 2³¹ − 1"],
      hints: ["A power of two has exactly one 1 bit.", "n > 0 and n & (n − 1) == 0."],
      solution: `def power_of_two(n):
    return n > 0 and n & (n - 1) == 0`,
      why: "Clearing the only set bit of a power of two leaves zero.", time: "O(1)",
      hidden: [["-16", "False"], ["1073741824", "True"], ["1073741825", "False"]] },
    { id: "mirror-bits", title: "Mirror the Bits", d: "Easy", lc: "reverse-bits",
      statement: "Treat `n` as a 32-bit unsigned integer and return the integer whose 32 bits are in reverse order.",
      examples: [["43261596", "964176192", ""], ["1", "2147483648", ""]],
      constraints: ["0 ≤ n < 2³²"],
      hints: ["Read n's lowest bit with n & 1.", "Take bits from the right of n and push them onto the right of the result, 32 times."],
      solution: `def mirror_bits(n):
    res = 0
    for _ in range(32):
        res = (res << 1) | (n & 1)
        n >>= 1
    return res`,
      why: "Shifting one bit at a time out of n and into the result reverses their order.", time: "O(32)",
      hidden: [["0", "0"], ["4294967293", "3221225471"], ["2147483648", "1"]] },
    { id: "thrice-but-one", title: "Thrice But One", d: "Medium", lc: "single-number-ii",
      statement: "Every number in `nums` appears exactly **three** times except one, which appears once. Return it with O(1) extra space.",
      examples: [["[2, 2, 3, 2]", "3", ""], ["[0, 1, 0, 1, 0, 1, 99]", "99", ""]],
      constraints: ["1 ≤ len(nums) ≤ 3·10⁴", "−2³¹ ≤ nums[i] ≤ 2³¹ − 1"],
      hints: ["XOR alone doesn't work: triples don't cancel.", "For each of the 32 bits, count how many numbers have it set; mod 3 gives the single number's bit.", "Convert from 32-bit back to a signed Python int."],
      solution: `def thrice_but_one(nums):
    res = 0
    for b in range(32):
        cnt = 0
        for x in nums:
            cnt += (x >> b) & 1
        if cnt % 3:
            res |= 1 << b
    return res - (1 << 32) if res >= (1 << 31) else res`,
      why: "Bit counts from triples are multiples of 3, so the remainder is exactly the single number's bit.", time: "O(32 · n)",
      hidden: [["[-2, -2, 1, 1, 4, 1, 4, 4, -4, -2]", "-4"], ["[5]", "5"], ["list(range(10000)) * 3 + [123456]", "123456"]] },
    { id: "two-loners", title: "Two Loners", d: "Medium", lc: "single-number-iii",
      statement: "Exactly two numbers in `nums` appear once; every other number appears twice. Return the two loners in increasing order, using O(1) extra space.",
      examples: [["[1, 2, 1, 3, 2, 5]", "[3, 5]", ""], ["[-1, 0]", "[-1, 0]", ""]],
      constraints: ["2 ≤ len(nums) ≤ 3·10⁴"],
      hints: ["XOR of everything is a ^ b, which isn't 0.", "Any set bit of a ^ b differs between a and b.", "Split the numbers by that bit and XOR each group."],
      solution: `def two_loners(nums):
    x = 0
    for v in nums:
        x ^= v
    low = x & -x
    a = 0
    for v in nums:
        if v & low:
            a ^= v
    return sorted([a, x ^ a])`,
      why: "The chosen bit separates the two loners into different groups, while pairs stay together and cancel.", time: "O(n)",
      hidden: [["[0, 1]", "[0, 1]"], ["[4, 4, 7, 9]", "[7, 9]"], ["list(range(10000)) * 2 + [-5, 777777]", "[-5, 777777]"]] },
    { id: "add-without-plus", title: "Add Without Plus", d: "Medium", lc: "sum-of-two-integers",
      statement: "Return `a + b` **without** using `+` or `-`. Both are 32-bit signed integers and the result fits in 32 bits.",
      examples: [["1, 2", "3", ""], ["2, 3", "5", ""], ["-2, 3", "1", ""]],
      constraints: ["−1000 ≤ a, b ≤ 1000"],
      hints: ["a ^ b adds without carries; (a & b) << 1 is the carry.", "Repeat until there's no carry.", "Python ints are unbounded: mask with 0xFFFFFFFF and convert back to signed at the end."],
      solution: `def add_without_plus(a, b):
    mask = 0xFFFFFFFF
    a &= mask
    b &= mask
    while b:
        a, b = (a ^ b) & mask, ((a & b) << 1) & mask
    return a if a < 0x80000000 else ~(a ^ mask)`,
      why: "XOR is addition without carry and AND-shift is the carry; with 32-bit masking the loop ends in at most 32 steps.", time: "O(32)",
      hidden: [["0, 0", "0"], ["-1, -1", "-2"], ["-1000, 1000", "0"], ["1000, 1000", "2000"]] },
    { id: "range-and", title: "AND of a Range", d: "Medium", lc: "bitwise-and-of-numbers-range",
      statement: "Return the bitwise AND of every integer from `left` to `right` inclusive.",
      examples: [["5, 7", "4", "101 & 110 & 111"], ["0, 0", "0", ""], ["1, 2147483647", "0", ""]],
      constraints: ["0 ≤ left ≤ right ≤ 2³¹ − 1"],
      hints: ["Any bit that changes somewhere in the range becomes 0.", "The answer is the common binary prefix of left and right.", "Shift both right until they're equal, then shift back."],
      solution: `def range_and(left, right):
    shift = 0
    while left != right:
        left >>= 1
        right >>= 1
        shift += 1
    return left << shift`,
      why: "Only the shared high-bit prefix survives; every lower bit takes both values within the range.", time: "O(32)",
      hidden: [["7, 7", "7"], ["12, 15", "12"], ["1073741824, 2147483647", "1073741824"]] },
    { id: "capped-xor", title: "Best XOR Under a Cap", d: "Hard", lc: "maximum-xor-with-an-element-from-array",
      statement: "For each query `[x, m]`, return the maximum of `x XOR v` over values `v` in `nums` with `v ≤ m`, or -1 if no such value exists.",
      examples: [["[0, 1, 2, 3, 4], [[3, 1], [1, 3], [5, 6]]", "[3, 3, 7]", ""], ["[5, 2, 4, 6, 6, 3], [[12, 4], [8, 1], [6, 3]]", "[15, -1, 5]", ""]],
      constraints: ["1 ≤ len(nums), len(queries) ≤ 10⁵", "0 ≤ values ≤ 10⁹"],
      hints: ["Answer the queries offline, sorted by m.", "Insert nums (sorted) into a bit trie as long as they're ≤ the current m.", "For each query, walk the trie greedily towards the opposite bit."],
      solution: `def capped_xor(nums, queries):
    nums = sorted(nums)
    order = sorted(range(len(queries)), key=lambda q: queries[q][1])
    root = {}
    out = [-1] * len(queries)
    i = 0
    for q in order:
        x, m = queries[q]
        while i < len(nums) and nums[i] <= m:
            node = root
            for b in range(29, -1, -1):
                node = node.setdefault((nums[i] >> b) & 1, {})
            i += 1
        if not root:
            continue
        node, cur = root, 0
        for b in range(29, -1, -1):
            bit = (x >> b) & 1
            if 1 - bit in node:
                cur |= 1 << b
                node = node[1 - bit]
            else:
                node = node[bit]
        out[q] = cur
    return out`,
      why: "Sorting queries by their cap lets the trie grow monotonically; each query is a greedy 30-step walk.", time: "O((n + q) · 30)",
      hidden: [["[7], [[1, 6]]", "[-1]"], ["[7], [[1, 7]]", "[6]"], ["list(range(1, 20001)), [[0, 20000]] * 3", "[20000] * 3"]] }
  ]
});
