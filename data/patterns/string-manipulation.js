PAT("string-manipulation", {
  time: "O(n)", space: "O(n)",
  lede: "A large share of OA questions are “do exactly what the statement says” with strings: split, scan, count, rebuild. The skill is clean, bug-free code, not a clever algorithm.",
  idea: "Python strings are **immutable**: `s += c` in a loop copies the whole string each time, so it can quietly become O(n²). Build pieces in a **list** and `\"\".join()` once. Scan with an index when you need lookahead (runs, numbers, tokens). Lean on the standard library: `split`, `join`, `isdigit`, `isalpha`, `zip`, `ord`/`chr`.",
  analogy: "Assembling a sentence from fridge magnets: you collect the magnets you need first and stick them up in one go, instead of re-printing the whole sentence after every letter.",
  flavours: [["Task", "Tool", "Watch out for"], [
    ["**Split and rebuild**", "`s.split()`, `\" \".join(...)`", "multiple spaces, leading/trailing spaces"],
    ["**Run-length / grouping**", "index scan with an inner `while`", "the last run, single characters"],
    ["**Digit arithmetic**", "walk from the right with a carry", "different lengths, a final carry"],
    ["**Validation / parsing**", "split on a separator, check each part", "empty parts, leading zeros, ranges"],
    ["**Character maps**", "`ord(c) - ord('a')`, tables of values", "upper vs lower case"]]],
  signals: [["“Return the formatted / encoded / decoded string”", "implementation, not algorithms"], ["“Without using int()” / big numbers as strings", "digit-by-digit with a carry"], ["“Is this a valid …?”", "split and check each rule"], ["Words, spaces, punctuation", "split / join and careful edge cases"]],
  not: "**Not this pattern** when you search for a pattern inside a long text (→ KMP / hashing), need nested structure like brackets (→ stack), or compare two strings with edits (→ DP).",
  templates: [
    ["Scan runs", "runs.py", `def compress(s):
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:   # extend the run
            j += 1
        out.append(s[i])
        if j - i > 1:
            out.append(str(j - i))
        i = j
    return "".join(out)                      # build once at the end

print(compress("aaabccdddd"))`, "a3bc2d4"],
    ["Add as strings", "add_strings.py", `def add_strings(a, b):
    i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
    while i >= 0 or j >= 0 or carry:
        d = carry
        if i >= 0: d += ord(a[i]) - 48; i -= 1
        if j >= 0: d += ord(b[j]) - 48; j -= 1
        out.append(str(d % 10))
        carry = d // 10
    return "".join(reversed(out))

print(add_strings("999", "27"))`, "1026"]
  ],
  examples: [
    { t: "Reverse Words in a String", d: "Medium", lc: "reverse-words-in-a-string", f: "Split and rebuild",
      q: "Reverse the order of words; collapse multiple spaces; no leading/trailing spaces.",
      idea: "`split()` with no argument already drops empty pieces.",
      code: `def reverse_words(s):
    return " ".join(reversed(s.split()))

print(repr(reverse_words("  the sky   is blue ")))`, out: "'blue is sky the'", cx: "O(n)" },
    { t: "Zigzag Conversion", d: "Medium", lc: "zigzag-conversion", f: "Simulation",
      q: "Write s in a zigzag over numRows rows, then read row by row.",
      idea: "Keep one list per row and a direction that flips at the top and bottom row.",
      code: `def convert(s, rows):
    if rows == 1: return s
    lines, r, step = [[] for _ in range(rows)], 0, 1
    for ch in s:
        lines[r].append(ch)
        if r == 0: step = 1
        elif r == rows - 1: step = -1
        r += step
    return "".join("".join(x) for x in lines)

print(convert("PAYPALISHIRING", 3))`, out: "PAHNAPLSIIGYIR", cx: "O(n)" },
    { t: "Integer to Roman", d: "Medium", lc: "integer-to-roman", f: "Greedy table",
      q: "Convert 1..3999 to Roman numerals.",
      idea: "A table that includes the subtractive pairs (CM, XC, IV…) turns it into a greedy loop.",
      code: `def to_roman(n):
    table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
             (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = []
    for v, sym in table:
        q, n = divmod(n, v)
        out.append(sym * q)
    return "".join(out)

print(to_roman(1994))`, out: "MCMXCIV", cx: "O(1)" }
  ],
  pitfalls: [
    ["`s += ch` inside a big loop", "Each concatenation can copy the string: build a list and join once."],
    ["`s.split(' ')` vs `s.split()`", "Splitting on a single space keeps empty strings for repeated spaces."],
    ["Forgetting the final run / final carry", "Loops that close a run on change miss the last one; loops over digits miss a leftover carry."],
    ["Leading zeros and empty parts", "In validation tasks like IP addresses, `'01'` and `''` are classic traps."]
  ],
  edge: ["Empty string", "Single character", "Only spaces", "Upper and lower case mixed", "Very long input (10⁵ characters)"],
  compare: [
    ["String Matching", "string-matching", "Finding a pattern inside a long text efficiently needs KMP or hashing."],
    ["Stack for Parsing", "stack-parsing", "Nested structure (brackets, `3[a2[c]]`, calculators) needs a stack."],
    ["Simulation", "simulation", "Both are “follow the rules carefully”; simulation does it over steps or a grid."]
  ],
  mcq: [
    ["Why prefer `''.join(parts)` over `s += part` in a loop?", ["It's shorter", "Strings are immutable, so repeated `+=` can copy the whole string each time", "join sorts the parts", "+= doesn't work on strings"], 1, "Building a list and joining once is O(total length)."],
    ["`'a  b'.split(' ')` returns…", ["['a', 'b']", "['a', '', 'b']", "['a  b']", "['a', ' ', 'b']"], 1, "Splitting on one explicit space keeps the empty piece between two spaces; `split()` drops it."]
  ],
  summary: {
    oneLine: "Follow the statement exactly: scan with an index, build pieces in a list, join once.",
    signals: ["Format / encode / decode a string", "Big numbers as strings", "“Is this a valid …?”", "Words and spaces"],
    template: `out, i = [], 0
while i < len(s):
    j = i
    while j < len(s) and same_group(s[i], s[j]):
        j += 1
    out.append(build(s[i:j]))
    i = j
return "".join(out)`,
    pitfalls: ["No `s +=` in big loops", "`split()` not `split(' ')`", "Close the last run / final carry"],
    cx: "O(n) time · O(n) space",
    drill: { task: "Add two non-negative integers given as decimal strings, without converting them to int. Return the sum as a string.",
      ref: `def add_strings(a, b):
    i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
    while i >= 0 or j >= 0 or carry:
        d = carry
        if i >= 0:
            d += ord(a[i]) - 48; i -= 1
        if j >= 0:
            d += ord(b[j]) - 48; j -= 1
        out.append(str(d % 10))
        carry = d // 10
    return "".join(reversed(out))`,
      tests: [["'11', '123'", "'134'"], ["'456', '77'", "'533'"], ["'0', '0'", "'0'"], ["'999', '1'", "'1000'"]] }
  },
  problems: [
    { id: "squash-runs", title: "Squash the Runs", d: "Easy", lc: "string-compression",
      statement: "Compress `s` by replacing each run of the same character with the character followed by the run length. Runs of length 1 keep just the character. Return the compressed string.",
      examples: [["'aaabccdddd'", "'a3bc2d4'", ""], ["'abc'", "'abc'", ""], ["'zzzzzzzzzzzz'", "'z12'", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["Find each run with an inner while loop.", "Append the pieces to a list and join at the end."],
      solution: `def squash(s):
    out, i = [], 0
    while i < len(s):
        j = i
        while j < len(s) and s[j] == s[i]:
            j += 1
        out.append(s[i])
        if j - i > 1:
            out.append(str(j - i))
        i = j
    return "".join(out)`,
      why: "Each character is visited once and the result is built in a list, so it's linear.", time: "O(n)",
      hidden: [["'a'", "'a'"], ["'aabbaa'", "'a2b2a2'"], ["'x' * 100000", "'x100000'"], ["'ab' * 50000", "'ab' * 50000"]] },
    { id: "shared-start", title: "Shared Start", d: "Easy", lc: "longest-common-prefix",
      statement: "Return the longest prefix shared by **every** string in `words` (`''` if none).",
      examples: [["['flower', 'flow', 'flight']", "'fl'", ""], ["['dog', 'racecar', 'car']", "''", ""]],
      constraints: ["1 ≤ len(words) ≤ 200", "0 ≤ len(words[i]) ≤ 200"],
      hints: ["Compare column by column.", "Stop at the first column where words disagree or one runs out."],
      solution: `def shared_start(words):
    out = []
    for chars in zip(*words):
        if len(set(chars)) != 1:
            break
        out.append(chars[0])
    return "".join(out)`,
      why: "`zip(*words)` walks columns and stops at the shortest word; the first mismatch ends the prefix.", time: "O(total length)",
      hidden: [["['a']", "'a'"], ["['', 'a']", "''"], ["['ab' * 100] * 200", "'ab' * 100"], ["['abc', 'abd', 'ab']", "'ab'"]] },
    { id: "string-sum", title: "Sum Without int()", d: "Easy", lc: "add-strings",
      statement: "`a` and `b` are non-negative integers written as decimal strings (no leading zeros except `'0'`). Return their sum as a string **without** converting the whole strings to numbers.",
      examples: [["'11', '123'", "'134'", ""], ["'456', '77'", "'533'", ""], ["'0', '0'", "'0'", ""]],
      constraints: ["1 ≤ len(a), len(b) ≤ 10⁴"],
      hints: ["Add from the rightmost digit with a carry, like on paper.", "Keep going while either string has digits or the carry is non-zero."],
      solution: `def string_sum(a, b):
    i, j, carry, out = len(a) - 1, len(b) - 1, 0, []
    while i >= 0 or j >= 0 or carry:
        d = carry
        if i >= 0:
            d += ord(a[i]) - 48
            i -= 1
        if j >= 0:
            d += ord(b[j]) - 48
            j -= 1
        out.append(str(d % 10))
        carry = d // 10
    return "".join(reversed(out))`,
      why: "Digit-by-digit addition with a carry, building the result in reverse.", time: "O(max(m, n))",
      hidden: [["'999', '1'", "'1000'"], ["'1', '9999'", "'10000'"], ["'9' * 10000, '1'", "'1' + '0' * 10000"]] },
    { id: "flip-words", title: "Flip the Words", d: "Medium", lc: "reverse-words-in-a-string",
      statement: "Reverse the order of the words in `s`. Words are separated by one or more spaces; the result must have single spaces between words and no leading or trailing spaces.",
      examples: [["'the sky is blue'", "'blue is sky the'", ""], ["'  hello world  '", "'world hello'", ""], ["'a good   example'", "'example good a'", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁴", "s has at least one word"],
      hints: ["`split()` with no argument drops all the extra spaces.", "Reverse the list and join with single spaces."],
      solution: `def flip_words(s):
    return " ".join(reversed(s.split()))`,
      why: "split() normalises whitespace for free; reversing the word list and joining is linear.", time: "O(n)",
      hidden: [["'x'", "'x'"], ["'   a   b   '", "'b a'"], ["' '.join(str(i) for i in range(2000))", "' '.join(str(i) for i in range(1999, -1, -1))"]] },
    { id: "zigzag-rows", title: "Zigzag Rows", d: "Medium", lc: "zigzag-conversion",
      statement: "Write `s` in a zigzag down and up across `rows` rows (down the first column, diagonally up, down again…), then read the rows top to bottom and return the result.",
      examples: [["'PAYPALISHIRING', 3", "'PAHNAPLSIIGYIR'", "P A H N / APLSIIG / Y I R"], ["'PAYPALISHIRING', 4", "'PINALSIGYAHRPI'", ""], ["'A', 1", "'A'", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵", "1 ≤ rows ≤ 1000"],
      hints: ["Keep a list of characters for each row.", "Move the current row down, flip direction at the top and bottom rows.", "With one row, return s unchanged."],
      solution: `def zigzag(s, rows):
    if rows == 1:
        return s
    lines = [[] for _ in range(rows)]
    r, step = 0, 1
    for ch in s:
        lines[r].append(ch)
        if r == 0:
            step = 1
        elif r == rows - 1:
            step = -1
        r += step
    return "".join("".join(x) for x in lines)`,
      why: "A direct simulation of the zigzag places each character once.", time: "O(n)",
      hidden: [["'AB', 1", "'AB'"], ["'ABCD', 2", "'ACBD'"], ["'ab' * 50000, 2", "'a' * 50000 + 'b' * 50000"]] },
    { id: "check-address", title: "Check the Address", d: "Medium", lc: "validate-ip-address",
      statement: "Return `True` if `ip` is a valid IPv4 address: exactly four parts separated by dots, each part made only of digits, with value 0–255 and **no leading zeros** (so `'0'` is fine but `'01'` is not).",
      examples: [["'172.16.254.1'", "True", ""], ["'256.1.1.1'", "False", "256 is too big."], ["'1.01.1.1'", "False", "Leading zero."], ["'1.1.1'", "False", ""]],
      constraints: ["1 ≤ len(ip) ≤ 50"],
      hints: ["Split on '.' and require exactly 4 parts.", "Each part: non-empty, all digits, no leading zero unless it's exactly '0', at most 255."],
      solution: `def check_address(ip):
    parts = ip.split(".")
    if len(parts) != 4:
        return False
    for p in parts:
        if not p or not p.isdigit() or len(p) > 3:
            return False
        if p[0] == "0" and len(p) > 1:
            return False
        if int(p) > 255:
            return False
    return True`,
      why: "Splitting on dots and checking each rule per part covers every case directly.", time: "O(n)",
      hidden: [["'0.0.0.0'", "True"], ["'1.1.1.1.'", "False"], ["'1..1.1'", "False"], ["'255.255.255.255'", "True"], ["'1.1.1.-1'", "False"], ["'1.1.1.1e'", "False"]] },
    { id: "to-roman", title: "To Roman", d: "Medium", lc: "integer-to-roman",
      statement: "Convert `n` (1 ≤ n ≤ 3999) to a Roman numeral. Use the standard subtractive forms: IV, IX, XL, XC, CD, CM.",
      examples: [["3", "'III'", ""], ["58", "'LVIII'", "L = 50, V = 5, III = 3"], ["1994", "'MCMXCIV'", ""]],
      constraints: ["1 ≤ n ≤ 3999"],
      hints: ["Put the subtractive pairs into the value table too.", "Go from the biggest value down, taking it as many times as it fits."],
      solution: `def to_roman(n):
    table = [(1000, "M"), (900, "CM"), (500, "D"), (400, "CD"), (100, "C"), (90, "XC"),
             (50, "L"), (40, "XL"), (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I")]
    out = []
    for v, sym in table:
        q, n = divmod(n, v)
        out.append(sym * q)
    return "".join(out)`,
      why: "With the subtractive pairs in the table, greedily taking the largest value always produces the standard numeral.", time: "O(1)",
      hidden: [["4", "'IV'"], ["3999", "'MMMCMXCIX'"], ["400", "'CD'"], ["9", "'IX'"]] },
    { id: "justify-text", title: "Justify the Text", d: "Hard", lc: "text-justification",
      statement: "Pack `words` into lines of exactly `width` characters, greedily putting as many words on each line as fit (with at least one space between words). Spread extra spaces between words as evenly as possible; if they don't divide evenly, the **left** gaps get more. A line with one word is left-justified and padded on the right. The **last** line is left-justified: single spaces, padded on the right. Return the list of lines.",
      examples: [["['This', 'is', 'an', 'example', 'of', 'text', 'justification.'], 16", "['This    is    an', 'example  of text', 'justification.  ']", ""], ["['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], 16", "['What   must   be', 'acknowledgment  ', 'shall be        ']", ""]],
      constraints: ["1 ≤ len(words) ≤ 300", "1 ≤ len(words[i]) ≤ width ≤ 100"],
      hints: ["First decide which words go on each line: add words while total letters + gaps ≤ width.", "For a normal line: spaces = width − letters, split across (k − 1) gaps with divmod.", "The last line and one-word lines are joined with single spaces and padded with ljust."],
      solution: `def justify_text(words, width):
    lines, i = [], 0
    while i < len(words):
        j, length = i, 0
        while j < len(words) and length + len(words[j]) + (j - i) <= width:
            length += len(words[j])
            j += 1
        line = words[i:j]
        if j == len(words) or len(line) == 1:
            lines.append(" ".join(line).ljust(width))
        else:
            gaps = len(line) - 1
            q, r = divmod(width - length, gaps)
            parts = []
            for k, w in enumerate(line[:-1]):
                parts.append(w + " " * (q + (1 if k < r else 0)))
            parts.append(line[-1])
            lines.append("".join(parts))
        i = j
    return lines`,
      why: "Greedy packing decides each line; divmod spreads the spaces with the remainder going to the leftmost gaps.", time: "O(total characters)",
      hidden: [["['a'], 1", "['a']"], ["['a', 'b', 'c', 'd'], 3", "['a b', 'c d']"], ["['Science', 'is', 'what', 'we', 'understand', 'well', 'enough', 'to', 'explain', 'to', 'a', 'computer.', 'Art', 'is', 'everything', 'else', 'we', 'do'], 20", "['Science  is  what we', 'understand      well', 'enough to explain to', 'a  computer.  Art is', 'everything  else  we', 'do                  ']"]] }
  ]
});
