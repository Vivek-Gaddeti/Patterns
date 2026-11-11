PAT("combinatorics", {
  time: "O(n) precompute · O(1) per query", space: "O(n)",
  lede: "Count arrangements with formulas instead of enumerating them. Precompute factorials and inverse factorials mod a prime once, then every nCr is two multiplications.",
  idea: "Choosing r items from n is n! / (r! (n − r)!). Under a prime modulus p (usually 10⁹ + 7) division becomes multiplication by a **modular inverse**: by Fermat, `inv(a) = a^(p−2) mod p`. Precompute `fact[i]` and `inv_fact[i]` up to the largest n you need. Common shapes: grid paths = C(m + n, m), arrangements with repeats = n! / (c₁! c₂! …), pairs from a group of c = c(c − 1)/2, Catalan numbers for nested structures.",
  analogy: "Counting outfits: 3 shirts and 4 trousers make 12 outfits. You multiply instead of laying every outfit on the bed.",
  flavours: [["Count", "Formula", "Examples"], [
    ["**Choose r of n**", "C(n, r) = n! / (r!(n−r)!)", "subsets of a size, grid paths"],
    ["**Arrange with repeats**", "n! / Π cᵢ!", "distinct permutations, anagrams"],
    ["**Pairs in a group**", "c(c − 1) / 2", "equal pairs, handshakes"],
    ["**Independent choices**", "product of options (fast power)", "digit strings with rules"],
    ["**Catalan**", "C(2n, n) / (n + 1)", "BST shapes, valid bracket strings"]]],
  signals: [["“How many ways …?” with a huge answer", "mod 10⁹ + 7"], ["Choosing positions or subsets of a given size", "nCr"], ["Permutations of a multiset", "multinomial"], ["Each position chosen independently", "multiply, use pow"]],
  not: "**Not this pattern** when choices interact in complicated ways (adjacency rules, budgets) → DP, or when you must list the arrangements (→ backtracking).",
  templates: [
    ["Factorials mod p", "ncr.py", `MOD = 10**9 + 7
N = 10**5

fact = [1] * (N + 1)
for i in range(1, N + 1):
    fact[i] = fact[i - 1] * i % MOD
inv_fact = [1] * (N + 1)
inv_fact[N] = pow(fact[N], MOD - 2, MOD)        # Fermat inverse
for i in range(N, 0, -1):
    inv_fact[i - 1] = inv_fact[i] * i % MOD

def C(n, r):
    if r < 0 or r > n:
        return 0
    return fact[n] * inv_fact[r] % MOD * inv_fact[n - r] % MOD

print(C(5, 2), C(100000, 50000))`, "10 149033233"]
  ],
  examples: [
    { t: "Unique Binary Search Trees", d: "Medium", lc: "unique-binary-search-trees", f: "Catalan",
      q: "How many structurally different BSTs hold the values 1..n?",
      idea: "Pick the root i: left has i − 1 values, right has n − i. That's the Catalan recurrence; closed form C(2n, n) / (n + 1).",
      code: `import math

def num_trees(n):
    return math.comb(2 * n, n) // (n + 1)

print(num_trees(3), num_trees(19))`, out: "5 1767263190", cx: "O(n)" },
    { t: "Count Good Numbers", d: "Medium", lc: "count-good-numbers", f: "Independent choices",
      q: "Length-n digit strings with even digits at even indices and prime digits at odd indices, mod 10⁹ + 7.",
      idea: "5 choices at each even index, 4 at each odd one: 5^ceil(n/2) · 4^floor(n/2), using fast power.",
      code: `def good_numbers(n):
    MOD = 10**9 + 7
    return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD

print(good_numbers(1), good_numbers(4), good_numbers(50))`, out: "5 400 564908303", cx: "O(log n)" }
  ],
  pitfalls: [
    ["Dividing under a modulus", "`a / b % MOD` is wrong; multiply by `pow(b, MOD − 2, MOD)`."],
    ["Recomputing factorials per query", "Precompute once up to the maximum n."],
    ["Fermat with a non-prime modulus", "a^(p−2) is the inverse only when p is prime."],
    ["Forgetting C(n, r) = 0 when r > n", "Guard the range before indexing."]
  ],
  edge: ["r = 0 or r = n", "r > n", "n = 0", "All items identical", "Answer exactly divisible by the modulus"],
  compare: [
    ["Number Theory", "number-theory", "Fast power and modular inverses are the building blocks."],
    ["Grid DP", "grid-dp", "Grid paths without obstacles are C(m + n − 2, m − 1); obstacles need DP."],
    ["Backtracking", "backtracking", "Listing permutations is backtracking; counting them is a formula."]
  ],
  mcq: [
    ["Under MOD = 10⁹ + 7, how do you compute a / b?", ["(a // b) % MOD", "a * pow(b, MOD − 2, MOD) % MOD", "a % MOD / b", "Not possible"], 1, "MOD is prime, so b^(MOD−2) is b's inverse (Fermat)."],
    ["Distinct arrangements of 'AABBB'?", ["120", "10", "20", "5"], 1, "5! / (2! · 3!) = 10."]
  ],
  summary: {
    oneLine: "Precompute factorials and inverse factorials mod p; nCr = fact[n]·inv[r]·inv[n−r].",
    signals: ["How many ways, mod 10⁹ + 7", "Choose positions / subsets of a size", "Permutations of a multiset", "Independent choices per position"],
    template: `fact[i] = fact[i-1] * i % MOD
inv_fact[N] = pow(fact[N], MOD - 2, MOD)
inv_fact[i-1] = inv_fact[i] * i % MOD
C(n, r) = fact[n] * inv_fact[r] * inv_fact[n-r] % MOD`,
    pitfalls: ["No plain division mod p", "Precompute once", "Fermat needs a prime"],
    cx: "O(N) precompute · O(1) per nCr",
    drill: { task: "Return C(n, r) modulo 10⁹ + 7 (0 if r > n). Don't use math.comb.",
      ref: `def ncr_mod(n, r):
    MOD = 10**9 + 7
    if r < 0 or r > n:
        return 0
    num = den = 1
    for i in range(r):
        num = num * (n - i) % MOD
        den = den * (i + 1) % MOD
    return num * pow(den, MOD - 2, MOD) % MOD`,
      tests: [["5, 2", "10"], ["3, 5", "0"], ["100000, 50000", "149033233"]] }
  },
  problems: [
    { id: "matching-pairs", title: "Matching Pairs", d: "Easy", lc: "number-of-good-pairs",
      statement: "Return the number of index pairs `i < j` with `nums[i] == nums[j]`.",
      examples: [["[1, 2, 3, 1, 1, 3]", "4", ""], ["[1, 1, 1, 1]", "6", ""], ["[1, 2, 3]", "0", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Count each value.", "A value appearing c times gives c(c − 1)/2 pairs."],
      solution: `def matching_pairs(nums):
    return sum(c * (c - 1) // 2 for c in Counter(nums).values())`,
      why: "Pairs inside each group are counted by a formula instead of a double loop.", time: "O(n)",
      hidden: [["[5]", "0"], ["[2, 2]", "1"], ["[7] * 100000", "4999950000"]] },
    { id: "choose-mod", title: "Choose, Many Times", d: "Medium", lc: "count-ways-to-make-array-with-product",
      statement: "Answer every query `[n, r]` with C(n, r) mod 10⁹ + 7 (0 if r > n). Return the list of answers.",
      examples: [["[[5, 2], [10, 0], [3, 4]]", "[10, 1, 0]", ""], ["[[6, 3]]", "[20]", ""]],
      constraints: ["1 ≤ len(queries) ≤ 10⁵", "0 ≤ n, r ≤ 10⁵"],
      hints: ["Computing each answer from scratch is O(n) per query.", "Precompute factorials and inverse factorials up to the max n once."],
      solution: `def choose_mod(queries):
    MOD = 10**9 + 7
    N = max(n for n, r in queries)
    fact = [1] * (N + 1)
    for i in range(1, N + 1):
        fact[i] = fact[i - 1] * i % MOD
    inv = [1] * (N + 1)
    inv[N] = pow(fact[N], MOD - 2, MOD)
    for i in range(N, 0, -1):
        inv[i - 1] = inv[i] * i % MOD
    return [fact[n] * inv[r] % MOD * inv[n - r] % MOD if 0 <= r <= n else 0 for n, r in queries]`,
      why: "One O(N) precomputation makes every query O(1).", time: "O(N + q)",
      hidden: [["[[0, 0]]", "[1]"], ["[[100000, 50000]]", "[149033233]"], ["[[100000, 1]] * 100000", "[100000] * 100000"]] },
    { id: "lattice-paths", title: "Lattice Paths, Huge Grid", d: "Medium", lc: "unique-paths",
      statement: "Moving only right or down in an `m × n` grid, count the routes from the top-left to the bottom-right modulo 10⁹ + 7.",
      examples: [["3, 7", "28", ""], ["2, 2", "2", ""]],
      constraints: ["1 ≤ m, n ≤ 10⁵"],
      hints: ["Every route is m − 1 downs and n − 1 rights in some order.", "Answer = C(m + n − 2, m − 1) mod p."],
      solution: `def lattice_paths(m, n):
    MOD = 10**9 + 7
    a, b = m + n - 2, m - 1
    num = den = 1
    for i in range(b):
        num = num * (a - i) % MOD
        den = den * (i + 1) % MOD
    return num * pow(den, MOD - 2, MOD) % MOD`,
      why: "Choosing which steps go down determines the route, so it's a single binomial coefficient.", time: "O(m)",
      hidden: [["1, 1", "1"], ["100, 100", "math.comb(198, 99) % (10**9 + 7)"], ["100000, 100000", "math.comb(199998, 99999) % (10**9 + 7)"]] },
    { id: "rule-digits", title: "Digits With Rules", d: "Medium", lc: "count-good-numbers",
      statement: "Count digit strings of length `n` (leading zeros allowed) where even indices hold an even digit (0, 2, 4, 6, 8) and odd indices hold a prime digit (2, 3, 5, 7). Return the count mod 10⁹ + 7.",
      examples: [["1", "5", ""], ["4", "400", ""], ["50", "564908303", ""]],
      constraints: ["1 ≤ n ≤ 10¹⁵"],
      hints: ["Positions are independent: multiply the choices.", "There are ceil(n/2) even indices and floor(n/2) odd ones.", "Use pow(base, exp, mod) for huge n."],
      solution: `def rule_digits(n):
    MOD = 10**9 + 7
    return pow(5, (n + 1) // 2, MOD) * pow(4, n // 2, MOD) % MOD`,
      why: "Independent choices multiply; fast power handles exponents up to 10¹⁵.", time: "O(log n)",
      hidden: [["2", "20"], ["3", "100"], ["10**15", "pow(5, (10**15 + 1) // 2, 10**9 + 7) * pow(4, 10**15 // 2, 10**9 + 7) % (10**9 + 7)"]] },
    { id: "bst-shapes", title: "BST Shapes", d: "Medium", lc: "unique-binary-search-trees",
      statement: "Return how many structurally different binary search trees can store the values `1..n`.",
      examples: [["3", "5", ""], ["1", "1", ""]],
      constraints: ["1 ≤ n ≤ 19"],
      hints: ["Choose the root i: i − 1 values go left, n − i go right.", "shapes(n) = Σ shapes(i − 1) · shapes(n − i): the Catalan numbers."],
      solution: `def bst_shapes(n):
    dp = [1] + [0] * n
    for k in range(1, n + 1):
        dp[k] = sum(dp[i - 1] * dp[k - i] for i in range(1, k + 1))
    return dp[n]`,
      why: "Left and right subtrees are independent once the root is fixed, so their counts multiply.", time: "O(n²)",
      hidden: [["2", "2"], ["4", "14"], ["19", "1767263190"]] },
    { id: "word-arrangements", title: "Distinct Rearrangements", d: "Medium", lc: "count-anagrams",
      statement: "Return the number of **distinct** strings you can make by rearranging the letters of `s`, modulo 10⁹ + 7.",
      examples: [["'aab'", "3", "aab, aba, baa"], ["'abc'", "6", ""], ["'aaaa'", "1", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["n! counts arrangements of distinct letters.", "Divide by c! for each letter that appears c times.", "Division mod p = multiply by the modular inverse."],
      solution: `def word_arrangements(s):
    MOD = 10**9 + 7
    n = len(s)
    fact = [1] * (n + 1)
    for i in range(1, n + 1):
        fact[i] = fact[i - 1] * i % MOD
    res = fact[n]
    for c in Counter(s).values():
        res = res * pow(fact[c], MOD - 2, MOD) % MOD
    return res`,
      why: "The multinomial n! / Π cᵢ! removes swaps of identical letters.", time: "O(n)",
      hidden: [["'a'", "1"], ["'aabb'", "6"], ["'ab' * 50000", "math.comb(100000, 50000) % (10**9 + 7)"]] },
    { id: "sentence-anagrams", title: "Sentence Anagrams", d: "Hard", lc: "count-anagrams",
      statement: "`s` is words separated by single spaces. Another sentence is an anagram of s if each of its words is a rearrangement of the word in the same position. Count the distinct anagram sentences modulo 10⁹ + 7.",
      examples: [["'too hot'", "18", "3 for 'too' × 6 for 'hot'"], ["'aa'", "1", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["Words are independent: multiply their counts.", "Each word contributes len! / Π (letter count)!.", "Precompute factorials once up to the longest word."],
      solution: `def sentence_anagrams(s):
    MOD = 10**9 + 7
    words = s.split()
    N = max(map(len, words))
    fact = [1] * (N + 1)
    for i in range(1, N + 1):
        fact[i] = fact[i - 1] * i % MOD
    res = 1
    for w in words:
        res = res * fact[len(w)] % MOD
        for c in Counter(w).values():
            res = res * pow(fact[c], MOD - 2, MOD) % MOD
    return res`,
      why: "Independent words multiply, and each word's count is its multinomial coefficient.", time: "O(n log MOD)",
      hidden: [["'a b c'", "1"], ["'ab ba'", "4"], ["' '.join(['abc'] * 20000)", "pow(6, 20000, 10**9 + 7)"]] }
  ]
});
