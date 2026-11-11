PAT("number-theory", {
  time: "varies", space: "O(1) – O(n)",
  lede: "A small toolbox shows up again and again in OAs: gcd and lcm, the sieve of primes, fast modular exponentiation, and arithmetic modulo 10⁹ + 7. Knowing these by heart saves a lot of time.",
  idea: "**gcd(a, b) = gcd(b, a % b)** (Euclid) runs in O(log); lcm(a, b) = a / gcd · b. The **sieve of Eratosthenes** marks multiples of each prime from p² up, giving all primes below n in O(n log log n). **Fast power** squares the base and halves the exponent, so a¹⁰¹⁸ mod m takes about 60 steps (Python's `pow(a, b, m)` does it for you). Counting answers are usually requested **mod 10⁹ + 7**: apply `%` after every addition and multiplication.",
  analogy: "Euclid's algorithm is like tiling a rectangle with the largest squares possible, again and again on the leftover strip; the last square size is the gcd.",
  flavours: [["Tool", "Python", "Cost"], [
    ["**gcd / lcm**", "`math.gcd`, `math.lcm`", "O(log n)"],
    ["**Sieve of primes**", "boolean list, cross out multiples", "O(n log log n)"],
    ["**Fast power mod m**", "`pow(a, b, m)`", "O(log b)"],
    ["**Modular inverse (m prime)**", "`pow(a, m − 2, m)`", "O(log m)"],
    ["**Digit tricks**", "`n % 10`, `n // 10`, digital root", "O(digits)"]]],
  signals: [["“Return the answer modulo 10⁹ + 7”", "modular arithmetic"], ["Primes, divisors, factors", "sieve or trial division up to √n"], ["Huge exponents", "fast power"], ["Repeating cycles, common periods", "gcd / lcm"]],
  not: "**Not this pattern** for counting arrangements (→ combinatorics with nCr), or when the “math” is really a DP recurrence.",
  templates: [
    ["Sieve + gcd + power", "math_tools.py", `import math

def primes_below(n):
    if n < 3:
        return []
    is_p = [True] * n
    is_p[0] = is_p[1] = False
    for p in range(2, math.isqrt(n - 1) + 1):
        if is_p[p]:
            is_p[p * p::p] = [False] * len(range(p * p, n, p))   # cross out multiples
    return [i for i, v in enumerate(is_p) if v]

def fast_pow(a, b, m):                     # same as pow(a, b, m)
    result, a = 1, a % m
    while b:
        if b & 1:
            result = result * a % m
        a = a * a % m
        b >>= 1
    return result

print(primes_below(20), math.gcd(84, 36), fast_pow(2, 10**18, 10**9 + 7) == pow(2, 10**18, 10**9 + 7))`, "[2, 3, 5, 7, 11, 13, 17, 19] 12 True"]
  ],
  examples: [
    { t: "Factorial Trailing Zeroes", d: "Medium", lc: "factorial-trailing-zeroes", f: "Counting factors",
      q: "How many trailing zeros does n! have?",
      idea: "Each zero needs a factor 10 = 2 · 5, and 5s are rarer: count multiples of 5, 25, 125, …",
      code: `def trailing_zeros(n):
    count = 0
    while n:
        n //= 5
        count += n
    return count

print(trailing_zeros(5), trailing_zeros(100))`, out: "1 24", cx: "O(log n)" },
    { t: "Nth Magical Number", d: "Hard", lc: "nth-magical-number", f: "lcm + binary search",
      q: "A positive integer is magical if divisible by a or b. Return the n-th magical number mod 10⁹ + 7.",
      idea: "Count magical numbers ≤ x with inclusion–exclusion: x//a + x//b − x//lcm. Binary-search the smallest x with count ≥ n.",
      code: `import math

def nth_magical(n, a, b):
    l = a * b // math.gcd(a, b)
    lo, hi = 1, n * min(a, b)
    while lo < hi:
        mid = (lo + hi) // 2
        if mid // a + mid // b - mid // l >= n: hi = mid
        else: lo = mid + 1
    return lo % (10**9 + 7)

print(nth_magical(4, 2, 3), nth_magical(1000000000, 40000, 40000))`, out: "6 999720007", cx: "O(log(n · min(a, b)))" }
  ],
  pitfalls: [
    ["Applying `%` only at the end", "Intermediate values can get huge (slow in Python, overflow elsewhere): reduce after each operation."],
    ["Sieve starting at 2p instead of p²", "Smaller multiples were already crossed out by smaller primes."],
    ["Subtraction under a modulus", "`(a − b) % m` is fine in Python (never negative), but add m in other languages."],
    ["Floating-point square roots", "Use `math.isqrt` to avoid off-by-one errors on big numbers."]
  ],
  edge: ["0 and 1 (not prime)", "n = 1 for sieves", "Very large exponents", "Equal a and b in lcm problems", "Negative inputs"],
  compare: [
    ["Counting & nCr mod p", "combinatorics", "Factorials and modular inverses build on fast power."],
    ["Binary Search on the Answer", "binary-search-answer", "“n-th number with a property” is often binary search + a counting formula."],
    ["Bit Manipulation", "bits", "Fast power walks the exponent's bits."]
  ],
  mcq: [
    ["gcd(a, b) equals…", ["gcd(a − 1, b)", "gcd(b, a % b)", "a · b / lcm(a, b) only if a < b", "max(a, b)"], 1, "Euclid's algorithm: any common divisor of a and b also divides a % b."],
    ["Why does the sieve start crossing out at p²?", ["It's faster to type", "Every smaller multiple k·p with k < p has a smaller prime factor and is already crossed out", "p² is prime", "No reason"], 1, "That's what makes the sieve O(n log log n)."]
  ],
  summary: {
    oneLine: "gcd by Euclid, primes by sieve, pow(a, b, m) for big powers, % 10⁹ + 7 after every step.",
    signals: ["Answer mod 10⁹ + 7", "Primes / divisors / factors", "Huge exponents", "Cycles, common periods"],
    template: `def sieve(n):
    is_p = [True] * n
    is_p[0:2] = [False, False]
    for p in range(2, isqrt(n - 1) + 1):
        if is_p[p]:
            is_p[p*p::p] = [False] * len(range(p*p, n, p))
    return [i for i, v in enumerate(is_p) if v]`,
    pitfalls: ["Mod after every step", "Sieve from p²", "Use isqrt"],
    cx: "gcd O(log) · sieve O(n log log n) · pow O(log b)",
    drill: { task: "Return how many primes are strictly less than `n`.",
      ref: `def count_primes(n):
    if n < 3:
        return 0
    is_p = [True] * n
    is_p[0] = is_p[1] = False
    for p in range(2, math.isqrt(n - 1) + 1):
        if is_p[p]:
            is_p[p * p::p] = [False] * len(range(p * p, n, p))
    return sum(is_p)`,
      tests: [["10", "4"], ["0", "0"], ["100", "25"]] }
  },
  problems: [
    { id: "string-gcd", title: "Greatest Common Piece", d: "Easy", lc: "greatest-common-divisor-of-strings",
      statement: "String t *divides* s if s is t repeated some number of times. Return the longest string that divides both `a` and `b` (`''` if none).",
      examples: [["'ABCABC', 'ABC'", "'ABC'", ""], ["'ABABAB', 'ABAB'", "'AB'", ""], ["'LEET', 'CODE'", "''", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 1000"],
      hints: ["If a common divisor exists, a + b == b + a.", "Then its length is gcd(len(a), len(b))."],
      solution: `def string_gcd(a, b):
    if a + b != b + a:
        return ""
    return a[:math.gcd(len(a), len(b))]`,
      why: "Both strings are repetitions of one block exactly when they commute; the longest block length is the gcd of the lengths.", time: "O(m + n)",
      hidden: [["'A', 'A'", "'A'"], ["'AB', 'ABA'", "''"], ["'xy' * 500, 'xy' * 300", "'xy' * 100"]] },
    { id: "plain-check", title: "Only 2, 3 and 5", d: "Easy", lc: "ugly-number",
      statement: "Return `True` if `n` is a positive integer whose only prime factors are 2, 3 and 5 (1 counts).",
      examples: [["6", "True", ""], ["1", "True", ""], ["14", "False", "7 is a factor."]],
      constraints: ["−2³¹ ≤ n ≤ 2³¹ − 1"],
      hints: ["Divide out every 2, 3 and 5.", "What's left must be 1."],
      solution: `def plain_check(n):
    if n <= 0:
        return False
    for p in (2, 3, 5):
        while n % p == 0:
            n //= p
    return n == 1`,
      why: "Removing all allowed factors leaves 1 exactly when no other prime divides n.", time: "O(log n)",
      hidden: [["0", "False"], ["-6", "False"], ["2147483647", "False"], ["1073741824", "True"]] },
    { id: "list-lcm", title: "LCM of a List", d: "Easy", lc: "find-greatest-common-divisor-of-array",
      statement: "Return the least common multiple of all numbers in `nums`.",
      examples: [["[2, 3, 4]", "12", ""], ["[5]", "5", ""]],
      constraints: ["1 ≤ len(nums) ≤ 1000", "1 ≤ nums[i] ≤ 1000"],
      hints: ["lcm(a, b) = a // gcd(a, b) * b.", "Fold it over the list."],
      solution: `def list_lcm(nums):
    res = 1
    for x in nums:
        res = res // math.gcd(res, x) * x
    return res`,
      why: "lcm is associative, so combining one number at a time works; dividing before multiplying keeps numbers smaller.", time: "O(n log V)",
      hidden: [["[6, 4]", "12"], ["[7, 7, 7]", "7"], ["list(range(1, 21))", "232792560"]] },
    { id: "prime-count", title: "Prime Count", d: "Medium", lc: "count-primes",
      statement: "Return the number of prime numbers strictly less than `n`.",
      examples: [["10", "4", "2, 3, 5, 7"], ["0", "0", ""], ["1", "0", ""]],
      constraints: ["0 ≤ n ≤ 5·10⁶"],
      hints: ["Trial division for every number is too slow.", "Sieve of Eratosthenes: for each prime p, cross out p², p² + p, …", "Slice assignment makes the crossing-out fast in Python."],
      solution: `def prime_count(n):
    if n < 3:
        return 0
    is_p = bytearray([1]) * n
    is_p[0] = is_p[1] = 0
    for p in range(2, math.isqrt(n - 1) + 1):
        if is_p[p]:
            is_p[p * p::p] = bytes(len(range(p * p, n, p)))
    return sum(is_p)`,
      why: "Each composite is crossed out by its prime factors, O(n log log n) total; bytearray slices keep it fast.", time: "O(n log log n)",
      hidden: [["2", "0"], ["3", "1"], ["100", "25"], ["5000000", "348513"]] },
    { id: "zero-tail", title: "Zeros at the End", d: "Medium", lc: "factorial-trailing-zeroes",
      statement: "Return the number of trailing zeros in `n!` (n factorial), in O(log n).",
      examples: [["3", "0", "3! = 6"], ["5", "1", "120"], ["25", "6", ""]],
      constraints: ["0 ≤ n ≤ 10⁹"],
      hints: ["Each trailing zero comes from a factor 2 · 5; there are always more 2s.", "Count multiples of 5, then 25, then 125, …"],
      solution: `def zero_tail(n):
    count = 0
    while n:
        n //= 5
        count += n
    return count`,
      why: "n // 5 counts multiples of 5, n // 25 adds the extra 5 in multiples of 25, and so on.", time: "O(log n)",
      hidden: [["0", "0"], ["100", "24"], ["1000000000", "249999998"]] },
    { id: "power-mod", title: "Huge Power Mod", d: "Medium", lc: "powx-n",
      statement: "Return `(base ** exp) % mod` where `exp` can be as large as 10¹⁸. Implement fast exponentiation yourself (don't use the three-argument `pow`).",
      examples: [["2, 10, 1000", "24", "1024 % 1000"], ["3, 0, 7", "1", ""], ["2, 1000000000000000000, 1000000007", "719476260", ""]],
      constraints: ["0 ≤ base ≤ 10⁹", "0 ≤ exp ≤ 10¹⁸", "2 ≤ mod ≤ 10⁹ + 7"],
      hints: ["a^b = (a²)^(b/2) when b is even; multiply in one extra a when b is odd.", "Reduce mod after every multiplication."],
      solution: `def power_mod(base, exp, mod):
    result = 1
    base %= mod
    while exp:
        if exp & 1:
            result = result * base % mod
        base = base * base % mod
        exp >>= 1
    return result`,
      why: "Squaring halves the exponent each step, so 10¹⁸ needs only about 60 iterations.", time: "O(log exp)",
      hidden: [["5, 1, 3", "2"], ["10, 18, 1000000007", "pow(10, 18, 1000000007)"], ["123456789, 10**18 - 1, 998244353", "pow(123456789, 10**18 - 1, 998244353)"]] },
    { id: "long-division", title: "Long Division", d: "Medium", lc: "fraction-to-recurring-decimal",
      statement: "Return `numerator / denominator` as a decimal string. If the fractional part repeats, wrap the repeating part in parentheses.",
      examples: [["1, 2", "'0.5'", ""], ["2, 1", "'2'", ""], ["4, 333", "'0.(012)'", ""], ["-50, 8", "'-6.25'", ""]],
      constraints: ["−2³¹ ≤ numerator, denominator ≤ 2³¹ − 1", "denominator ≠ 0"],
      hints: ["Handle the sign and the integer part first.", "Do long division on the remainder; record where each remainder first appeared.", "A repeated remainder means the digits since then repeat."],
      solution: `def long_division(numerator, denominator):
    if numerator == 0:
        return "0"
    sign = "-" if (numerator < 0) != (denominator < 0) else ""
    n, d = abs(numerator), abs(denominator)
    whole, rem = divmod(n, d)
    if rem == 0:
        return sign + str(whole)
    digits, seen = [], {}
    while rem and rem not in seen:
        seen[rem] = len(digits)
        rem *= 10
        q, rem = divmod(rem, d)
        digits.append(str(q))
    if rem:
        i = seen[rem]
        frac = "".join(digits[:i]) + "(" + "".join(digits[i:]) + ")"
    else:
        frac = "".join(digits)
    return sign + str(whole) + "." + frac`,
      why: "There are fewer than d possible remainders, so a repeat must happen, and it marks the start of the cycle.", time: "O(d)",
      hidden: [["0, 5", "'0'"], ["1, 3", "'0.(3)'"], ["1, 6", "'0.1(6)'"], ["-1, -2147483648", "'0.0000000004656612873077392578125'"]] },
    { id: "nth-multiple", title: "Nth Shared Multiple", d: "Hard", lc: "nth-magical-number",
      statement: "A positive integer is *special* if it's divisible by `a` or by `b`. Return the `n`-th special number modulo 10⁹ + 7.",
      examples: [["1, 2, 3", "2", ""], ["4, 2, 3", "6", "2, 3, 4, 6"]],
      constraints: ["1 ≤ n ≤ 10⁹", "2 ≤ a, b ≤ 4·10⁴"],
      hints: ["Special numbers ≤ x: x//a + x//b − x//lcm(a, b).", "That count only grows with x: binary-search the smallest x with count ≥ n.", "Take the modulo only at the very end."],
      solution: `def nth_multiple(n, a, b):
    l = a * b // math.gcd(a, b)
    lo, hi = 1, n * min(a, b)
    while lo < hi:
        mid = (lo + hi) // 2
        if mid // a + mid // b - mid // l >= n:
            hi = mid
        else:
            lo = mid + 1
    return lo % (10**9 + 7)`,
      why: "Inclusion–exclusion counts special numbers below x in O(1), and binary search finds the n-th in O(log).", time: "O(log(n · min(a, b)))",
      hidden: [["5, 2, 4", "10"], ["3, 6, 4", "8"], ["1000000000, 40000, 40000", "999720007"]] }
  ]
});
