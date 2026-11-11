PAT("backtracking", {
  time: "O(branches^depth)", space: "O(depth)",
  lede: "Build a solution one choice at a time. After exploring a choice, undo it and try the next. Choose → explore → un-choose. Prune branches that can't lead anywhere.",
  idea: "When a problem asks for **all** subsets, orders, combinations or placements, there's no shortcut: you must enumerate them. Backtracking walks the tree of decisions depth-first with one shared `path`: append a choice, recurse, pop it. Each complete path is an answer. The art is in **what you're allowed to choose next** (start index for combinations, a `used` set for permutations, skipping equal neighbours for duplicates) and in **pruning** early.",
  analogy: "Solving a maze by hand: walk forward, and when you hit a dead end, step back to the last fork and take the next turn you haven't tried.",
  flavours: [["Problem", "Choose from", "Avoid duplicates by"], [
    ["**Subsets**", "elements after the current start index", "only moving forward"],
    ["**Combinations of size k / sum target**", "start index (same index again if reuse is allowed)", "sorting + skipping equal neighbours"],
    ["**Permutations**", "any unused element", "a `used` array; skip equal unused neighbours"],
    ["**Placement / grid**", "valid positions or neighbours", "marking cells, sets of attacked columns/diagonals"]]],
  signals: [["“Return **all** possible …”", "subsets, permutations, combinations, partitions"], ["Small n (≤ 10–20) with exponential output", "enumeration is expected"], ["Puzzles: N-Queens, Sudoku, word search", "place, check, undo"], ["“Generate every valid string”", "parentheses, phone letters, IP addresses"]],
  not: "**Not this pattern** when you only need the **count** or the best value and subproblems repeat (→ DP), or a shortest path (→ BFS).",
  templates: [
    ["Subsets / combinations", "subsets.py", `def subsets(nums):
    out, path = [], []
    def go(start):
        out.append(path[:])                # every path is a subset
        for i in range(start, len(nums)):
            path.append(nums[i])           # choose
            go(i + 1)                      # explore (only later elements)
            path.pop()                     # un-choose
    go(0)
    return out

print(subsets([1, 2, 3]))`, "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]"],
    ["Permutations", "permutations.py", `def permutations(nums):
    out, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True; path.append(nums[i])
            go()
            path.pop(); used[i] = False
    go()
    return out

print(permutations([1, 2, 3]))`, "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"]
  ],
  examples: [
    { t: "Combination Sum", d: "Medium", lc: "combination-sum", f: "Combinations with reuse",
      q: "All combinations of candidates (reusable) that sum to target.",
      idea: "Recurse with the same start index to allow reuse; prune when the sum overshoots (candidates sorted).",
      code: `def combination_sum(cands, target):
    cands.sort()
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:]); return
        for i in range(start, len(cands)):
            if cands[i] > left: break          # prune: sorted, so the rest are bigger too
            path.append(cands[i])
            go(i, left - cands[i])             # i, not i + 1: reuse allowed
            path.pop()
    go(0, target)
    return out

print(combination_sum([2, 3, 6, 7], 7))`, out: "[[2, 2, 3], [7]]", cx: "exponential" },
    { t: "N-Queens", d: "Hard", lc: "n-queens", f: "Placement",
      q: "Place n queens so none attack each other. Count the solutions.",
      idea: "One queen per row. Track used columns and both diagonals (r − c and r + c) in sets.",
      code: `def n_queens(n):
    cols, d1, d2 = set(), set(), set()
    def go(r):
        if r == n: return 1
        total = 0
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2: continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            total += go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
        return total
    return go(0)

print(n_queens(4), n_queens(8))`, out: "2 92", cx: "O(n!)" },
    { t: "Word Search", d: "Medium", lc: "word-search", f: "Grid",
      q: "Can the word be traced through adjacent cells without reusing a cell?",
      idea: "DFS from every cell; mark the cell while it's on the path, unmark when backtracking.",
      code: `def exist(board, word):
    R, C = len(board), len(board[0])
    def go(r, c, i):
        if i == len(word): return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]: return False
        board[r][c] = "#"
        found = any(go(r + dr, c + dc, i + 1) for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))
        board[r][c] = word[i]
        return found
    return any(go(r, c, 0) for r in range(R) for c in range(C))

b = [list("ABCE"), list("SFCS"), list("ADEE")]
print(exist(b, "ABCCED"), exist(b, "ABCB"))`, out: "True False", cx: "O(cells · 3^L)" }
  ],
  pitfalls: [
    ["Appending `path` instead of `path[:]`", "Every saved answer would be the same list object, emptied at the end."],
    ["Forgetting to un-choose", "Undo every change (pop, unmark, remove from sets) after the recursive call."],
    ["Duplicate answers with repeated input", "Sort first, then skip `nums[i] == nums[i − 1]` at the same depth (`i > start`)."],
    ["No pruning", "Stop early when the partial sum already exceeds the target or a constraint is broken."]
  ],
  edge: ["Empty input", "Target 0", "Duplicates in input", "No solution exists", "n = 1"],
  compare: [
    ["Dynamic Programming", "dp-1d", "Counting combinations (not listing them) usually has overlapping subproblems → DP is exponentially faster."],
    ["Graph DFS / BFS", "graph-traversal", "Grid DFS for islands marks cells permanently; backtracking unmarks them so other paths can reuse them."],
    ["Bitmask DP", "bitmask-dp", "When n ≤ 20 and you need the best over all subsets, DP over masks avoids re-exploring."]
  ],
  mcq: [
    ["Why save `path[:]` instead of `path`?", ["It's faster", "path keeps changing; you need a snapshot copy", "Python requires it", "To sort it"], 1, "Otherwise every stored answer is the same list, which ends up empty."],
    ["Subsets of [1, 2, 2] without duplicate subsets. At each depth you skip i when…", ["nums[i] is even", "i > start and nums[i] == nums[i − 1] (after sorting)", "i == start", "Never"], 1, "Choosing the second 2 at the same depth would repeat a subset already built with the first 2."]
  ],
  summary: {
    oneLine: "Choose → explore → un-choose, over a tree of decisions; prune dead branches.",
    signals: ["Return **all** subsets / permutations / combinations", "Small n, exponential output", "N-Queens, Sudoku, word search"],
    template: `out, path = [], []
def go(start):
    out.append(path[:])
    for i in range(start, len(nums)):
        path.append(nums[i])
        go(i + 1)
        path.pop()
go(0)`,
    pitfalls: ["Save path[:], not path", "Undo every change", "Sort + skip equal neighbours for duplicates", "Prune early"],
    cx: "Exponential time · O(depth) extra space",
    drill: { task: "Return all subsets of `nums` (distinct values). The checker sorts your answer, so order doesn't matter.",
      ref: `def subsets(nums):
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      conv: "sorted(sorted(s) for s in r)",
      tests: [["[1, 2, 3]", "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]"], ["[0]", "[[], [0]]"]] }
  },
  problems: [
    { id: "xor-of-all-groups", title: "XOR of Every Group", d: "Easy", lc: "sum-of-all-subset-xor-totals",
      statement: "For every subset of `nums` (including the empty one), compute the XOR of its elements. Return the sum of all those XOR values.",
      examples: [["[1, 3]", "6", "0 + 1 + 3 + (1 XOR 3 = 2)"], ["[5, 1, 6]", "28", ""]],
      constraints: ["1 ≤ len(nums) ≤ 12", "1 ≤ nums[i] ≤ 20"],
      hints: ["n ≤ 12: you can visit all 2ⁿ subsets.", "Recurse with two choices per element: take it or skip it, carrying the running XOR."],
      solution: `def xor_groups(nums):
    def go(i, cur):
        if i == len(nums):
            return cur
        return go(i + 1, cur ^ nums[i]) + go(i + 1, cur)
    return go(0, 0)`,
      why: "A take/skip recursion visits each subset once, carrying its XOR along.", time: "O(2ⁿ)",
      hidden: [["[3]", "3"], ["[1, 1]", "2"], ["list(range(1, 13))", "30720"]] },
    { id: "every-subset", title: "Every Subset", d: "Medium", lc: "subsets",
      statement: "`nums` has distinct values. Return every subset (the power set). The checker sorts each subset and the list of subsets, so order doesn't matter.",
      examples: [["[1, 2, 3]", "[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]", ""], ["[0]", "[[], [0]]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10"],
      hints: ["Every node of the recursion is a subset: save it on entry.", "Only choose elements after the current start index, so each subset is built once."],
      solution: `def every_subset(nums):
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      conv: "sorted(sorted(s) for s in r)",
      why: "Choosing only later elements visits each of the 2ⁿ subsets exactly once.", time: "O(n · 2ⁿ)",
      hidden: [["[5, 1]", "[[], [1], [1, 5], [5]]"], ["[-1, 0, 1]", "[[], [-1], [-1, 0], [-1, 0, 1], [-1, 1], [0], [0, 1], [1]]"], ["list(range(10))", "sorted(sorted(c) for k in range(11) for c in combinations(range(10), k))"]] },
    { id: "subsets-with-repeats", title: "Subsets With Repeats", d: "Medium", lc: "subsets-ii",
      statement: "`nums` may contain duplicates. Return all **distinct** subsets. The checker sorts each subset and the list, so order doesn't matter.",
      examples: [["[1, 2, 2]", "[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]", ""], ["[0]", "[[], [0]]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10"],
      hints: ["Sort first so equal values are neighbours.", "At the same depth, skip nums[i] if it equals nums[i − 1] and i > start."],
      solution: `def subsets_with_repeats(nums):
    nums = sorted(nums)
    out, path = [], []
    def go(start):
        out.append(path[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            path.append(nums[i])
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      conv: "sorted(sorted(s) for s in r)",
      why: "Skipping equal neighbours at the same depth means each value-multiset is built once.", time: "O(n · 2ⁿ)",
      hidden: [["[2, 2]", "[[], [2], [2, 2]]"], ["[4, 4, 4, 1, 4]", "[[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]]"], ["[1] * 10", "[[1] * k for k in range(11)]"]] },
    { id: "every-order", title: "Every Order", d: "Medium", lc: "permutations",
      statement: "`nums` has distinct values. Return every ordering (permutation). The checker sorts the list of permutations, so order doesn't matter.",
      examples: [["[1, 2, 3]", "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]", ""], ["[0, 1]", "[[0, 1], [1, 0]]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 8"],
      hints: ["At each position, try every element not used yet.", "Track used elements with a boolean list; undo after recursing."],
      solution: `def every_order(nums):
    out, path, used = [], [], [False] * len(nums)
    def go():
        if len(path) == len(nums):
            out.append(path[:])
            return
        for i in range(len(nums)):
            if not used[i]:
                used[i] = True
                path.append(nums[i])
                go()
                path.pop()
                used[i] = False
    go()
    return out`,
      conv: "sorted(r)",
      why: "Each level fixes one position with an unused element, producing all n! orders.", time: "O(n · n!)",
      hidden: [["[1]", "[[1]]"], ["[3, 1, 2]", "[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]"], ["list(range(8))", "sorted(list(p) for p in permutations(range(8)))"]] },
    { id: "choose-k", title: "Choose K", d: "Medium", lc: "combinations",
      statement: "Return all ways to choose `k` numbers from `1..n` (each combination in increasing order). The checker sorts the list, so order doesn't matter.",
      examples: [["4, 2", "[[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]", ""], ["1, 1", "[[1]]", ""]],
      constraints: ["1 ≤ k ≤ n ≤ 20"],
      hints: ["Choose increasing numbers: the next choice starts after the last one.", "Prune: stop if not enough numbers remain to reach size k."],
      solution: `def choose_k(n, k):
    out, path = [], []
    def go(start):
        if len(path) == k:
            out.append(path[:])
            return
        for x in range(start, n - (k - len(path)) + 2):
            path.append(x)
            go(x + 1)
            path.pop()
    go(1)
    return out`,
      conv: "sorted(r)",
      why: "Increasing choices avoid repeats; the loop bound prunes branches that can't reach size k.", time: "O(k · C(n, k))",
      hidden: [["3, 3", "[[1, 2, 3]]"], ["5, 1", "[[1], [2], [3], [4], [5]]"], ["20, 3", "[list(c) for c in combinations(range(1, 21), 3)]"]] },
    { id: "make-the-total", title: "Make the Total", d: "Medium", lc: "combination-sum",
      statement: "`coins` has distinct positive values, each usable **any number of times**. Return every combination (as a non-decreasing list) that adds up to `target`. The checker sorts the list of combinations.",
      examples: [["[2, 3, 6, 7], 7", "[[2, 2, 3], [7]]", ""], ["[2, 3, 5], 8", "[[2, 2, 2, 2], [2, 3, 3], [3, 5]]", ""], ["[2], 1", "[]", ""]],
      constraints: ["1 ≤ len(coins) ≤ 30", "2 ≤ coins[i] ≤ 40", "1 ≤ target ≤ 40"],
      hints: ["Sort the coins.", "Recurse with the **same** start index to allow reuse.", "Break the loop when a coin exceeds the remaining amount."],
      solution: `def make_total(coins, target):
    coins = sorted(coins)
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(coins)):
            if coins[i] > left:
                break
            path.append(coins[i])
            go(i, left - coins[i])
            path.pop()
    go(0, target)
    return out`,
      conv: "sorted(r)",
      why: "Non-decreasing choices (start index never goes back) avoid permutations of the same combination.", time: "exponential in target",
      hidden: [["[1], 2", "[[1, 1]]"], ["[3, 4], 7", "[[3, 4]]"], ["[2, 4], 8", "[[2, 2, 2, 2], [2, 2, 4], [4, 4]]"]] },
    { id: "make-total-once", title: "Make the Total, Once Each", d: "Medium", lc: "combination-sum-ii",
      statement: "`cards` may contain duplicates; each card can be used **at most once**. Return all distinct combinations (non-decreasing lists) that sum to `target`. The checker sorts the list.",
      examples: [["[10, 1, 2, 7, 6, 1, 5], 8", "[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]", ""], ["[2, 5, 2, 1, 2], 5", "[[1, 2, 2], [5]]", ""]],
      constraints: ["1 ≤ len(cards) ≤ 100", "1 ≤ cards[i] ≤ 50", "1 ≤ target ≤ 30"],
      hints: ["Sort, recurse with i + 1 (no reuse).", "Skip a card equal to the previous one at the same depth.", "Break when a card exceeds what's left."],
      solution: `def make_total_once(cards, target):
    cards = sorted(cards)
    out, path = [], []
    def go(start, left):
        if left == 0:
            out.append(path[:])
            return
        for i in range(start, len(cards)):
            if i > start and cards[i] == cards[i - 1]:
                continue
            if cards[i] > left:
                break
            path.append(cards[i])
            go(i + 1, left - cards[i])
            path.pop()
    go(0, target)
    return out`,
      conv: "sorted(r)",
      why: "i + 1 forbids reuse; skipping equal neighbours removes duplicate combinations.", time: "exponential",
      hidden: [["[1, 1, 1], 2", "[[1, 1]]"], ["[3], 2", "[]"], ["[1] * 100, 30", "[[1] * 30]"]] },
    { id: "keypad-words", title: "Keypad Words", d: "Medium", lc: "letter-combinations-of-a-phone-number",
      statement: "On a phone keypad, 2=abc, 3=def, 4=ghi, 5=jkl, 6=mno, 7=pqrs, 8=tuv, 9=wxyz. Return every letter string the `digits` could spell. Return `[]` for an empty input. The checker sorts the list.",
      examples: [["'23'", "['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf']", ""], ["''", "[]", ""], ["'2'", "['a', 'b', 'c']", ""]],
      constraints: ["0 ≤ len(digits) ≤ 4", "digits are 2–9"],
      hints: ["One recursion level per digit.", "At each level, try each letter of that digit."],
      solution: `def keypad_words(digits):
    if not digits:
        return []
    keys = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl", "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    out, path = [], []
    def go(i):
        if i == len(digits):
            out.append("".join(path))
            return
        for ch in keys[digits[i]]:
            path.append(ch)
            go(i + 1)
            path.pop()
    go(0)
    return out`,
      conv: "sorted(r)",
      why: "The recursion tree has one level per digit and one branch per letter.", time: "O(4ⁿ · n)",
      hidden: [["'9'", "['w', 'x', 'y', 'z']"], ["'79'", "sorted(a + b for a in 'pqrs' for b in 'wxyz')"], ["'2345'", "sorted(a + b + c + d for a in 'abc' for b in 'def' for c in 'ghi' for d in 'jkl')"]] },
    { id: "balanced-strings", title: "Every Balanced String", d: "Medium", lc: "generate-parentheses",
      statement: "Return every string of `n` pairs of correctly matched parentheses. The checker sorts the list.",
      examples: [["3", "['((()))', '(()())', '(())()', '()(())', '()()()']", ""], ["1", "['()']", ""]],
      constraints: ["1 ≤ n ≤ 8"],
      hints: ["Track how many '(' and ')' you've used.", "You may add '(' while open < n, and ')' while close < open."],
      solution: `def balanced_strings(n):
    out, path = [], []
    def go(open_, close):
        if len(path) == 2 * n:
            out.append("".join(path))
            return
        if open_ < n:
            path.append("(")
            go(open_ + 1, close)
            path.pop()
        if close < open_:
            path.append(")")
            go(open_, close + 1)
            path.pop()
    go(0, 0)
    return out`,
      conv: "sorted(r)",
      why: "The two counters enforce validity at every step, so only valid strings are ever built.", time: "O(Catalan(n) · n)",
      hidden: [["2", "['(())', '()()']"], ["4", "['(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()', '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()']"], ["6", "sorted(t for t in (''.join(p) for p in product('()', repeat=12)) if t.count('(') == 6 and all(t[:i].count('(') >= t[:i].count(')') for i in range(13)))"]] },
    { id: "trace-the-word", title: "Trace the Word", d: "Medium", lc: "word-search",
      statement: "Return `True` if `word` can be traced in `board` by moving between horizontally or vertically adjacent cells, using each cell at most once.",
      examples: [["[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'", "True", ""], ["[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'", "True", ""], ["[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'", "False", "Can't reuse B."]],
      constraints: ["1 ≤ rows, cols ≤ 6", "1 ≤ len(word) ≤ 15"],
      hints: ["Start a DFS from every cell that matches word[0].", "Mark a cell while it's on the current path; restore it when you backtrack."],
      solution: `def trace_word(board, word):
    R, C = len(board), len(board[0])
    def go(r, c, i):
        if i == len(word):
            return True
        if not (0 <= r < R and 0 <= c < C) or board[r][c] != word[i]:
            return False
        board[r][c] = "#"
        found = go(r + 1, c, i + 1) or go(r - 1, c, i + 1) or go(r, c + 1, i + 1) or go(r, c - 1, i + 1)
        board[r][c] = word[i]
        return found
    return any(go(r, c, 0) for r in range(R) for c in range(C))`,
      why: "Marking cells on the path prevents reuse; restoring them lets other paths use them.", time: "O(cells · 3^L)",
      hidden: [["[['a']], 'a'", "True"], ["[['a', 'b']], 'ba'", "True"], ["[['A', 'B'], ['C', 'D']], 'ABDC'", "True"], ["[['A', 'B'], ['C', 'D']], 'ABCD'", "False"]] },
    { id: "mirror-pieces", title: "Mirror Pieces", d: "Medium", lc: "palindrome-partitioning",
      statement: "Split `s` into pieces so that **every piece is a palindrome**. Return all such splits (each a list of pieces). The checker sorts the list.",
      examples: [["'aab'", "[['a', 'a', 'b'], ['aa', 'b']]", ""], ["'a'", "[['a']]", ""]],
      constraints: ["1 ≤ len(s) ≤ 14"],
      hints: ["Choose the next piece as s[start:end] for every end.", "Only recurse if that piece is a palindrome."],
      solution: `def mirror_pieces(s):
    out, path = [], []
    def go(start):
        if start == len(s):
            out.append(path[:])
            return
        for end in range(start + 1, len(s) + 1):
            piece = s[start:end]
            if piece == piece[::-1]:
                path.append(piece)
                go(end)
                path.pop()
    go(0)
    return out`,
      conv: "sorted(r)",
      why: "Each recursion step fixes the next palindromic piece; non-palindromes are pruned immediately.", time: "O(n · 2ⁿ)",
      hidden: [["'ab'", "[['a', 'b']]"], ["'aba'", "[['a', 'b', 'a'], ['aba']]"], ["'abba'", "[['a', 'b', 'b', 'a'], ['a', 'bb', 'a'], ['abba']]"]] },
    { id: "queen-count", title: "Count the Queen Layouts", d: "Hard", lc: "n-queens-ii",
      statement: "Return the number of ways to place `n` queens on an `n × n` chessboard so that no two attack each other (same row, column or diagonal).",
      examples: [["4", "2", ""], ["1", "1", ""]],
      constraints: ["1 ≤ n ≤ 9"],
      hints: ["Exactly one queen per row: recurse row by row.", "Keep sets of used columns, r − c diagonals and r + c diagonals.", "Add, recurse, remove."],
      solution: `def queen_count(n):
    cols, d1, d2 = set(), set(), set()
    def go(r):
        if r == n:
            return 1
        total = 0
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2:
                continue
            cols.add(c); d1.add(r - c); d2.add(r + c)
            total += go(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
        return total
    return go(0)`,
      why: "Constant-time conflict checks with three sets prune almost the whole tree.", time: "O(n!)",
      hidden: [["2", "0"], ["6", "4"], ["9", "352"]] },
    { id: "finish-sudoku", title: "Finish the Sudoku", d: "Hard", lc: "sudoku-solver",
      statement: "Fill the empty cells (`'.'`) of the 9×9 `board` **in place** so every row, column and 3×3 box contains the digits 1–9 exactly once. The puzzle has exactly one solution. Return nothing; the checker reads `board`.",
      examples: [["[list('53..7....'), list('6..195...'), list('.98....6.'), list('8...6...3'), list('4..8.3..1'), list('7...2...6'), list('.6....28.'), list('...419..5'), list('....8..79')]", "[list('534678912'), list('672195348'), list('198342567'), list('859761423'), list('426853791'), list('713924856'), list('961537284'), list('287419635'), list('345286179')]", ""], ["[list('..9748...'), list('7........'), list('.2.1.9...'), list('..7...24.'), list('.64.1.59.'), list('.98...3..'), list('...8.3.2.'), list('........6'), list('...2759..')]", "[list('519748632'), list('783652419'), list('426139875'), list('357986241'), list('264317598'), list('198524367'), list('975863124'), list('832491756'), list('641275983')]", ""]],
      constraints: ["board is 9 × 9", "exactly one solution"],
      hints: ["Keep sets of digits used in each row, column and box.", "Fill empty cells in order; try each digit not used in its row, column or box.", "Undo on failure; stop as soon as all cells are filled."],
      solution: `def finish_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                empty.append((r, c))
            else:
                rows[r].add(v); cols[c].add(v); boxes[r // 3 * 3 + c // 3].add(v)
    def go(k):
        if k == len(empty):
            return True
        r, c = empty[k]
        b = r // 3 * 3 + c // 3
        for d in "123456789":
            if d in rows[r] or d in cols[c] or d in boxes[b]:
                continue
            board[r][c] = d
            rows[r].add(d); cols[c].add(d); boxes[b].add(d)
            if go(k + 1):
                return True
            rows[r].remove(d); cols[c].remove(d); boxes[b].remove(d)
        board[r][c] = "."
        return False
    go(0)`,
      conv: "args[0]",
      why: "Sets make each validity check O(1); backtracking undoes a digit only when it leads to a dead end.", time: "exponential worst case, fast in practice",
      hidden: [["[list('534678912'), list('672195348'), list('198342567'), list('859761423'), list('426853791'), list('713924856'), list('961537284'), list('287419635'), list('34528617.')]", "[list('534678912'), list('672195348'), list('198342567'), list('859761423'), list('426853791'), list('713924856'), list('961537284'), list('287419635'), list('345286179')]"], ["[list('.34678912'), list('6.2195348'), list('19.342567'), list('859.61423'), list('4268.3791'), list('71392.856'), list('961537.84'), list('2874196.5'), list('34528617.')]", "[list('534678912'), list('672195348'), list('198342567'), list('859761423'), list('426853791'), list('713924856'), list('961537284'), list('287419635'), list('345286179')]"], ["[list('.19748632'), list('7.3652419'), list('42.139875'), list('357.86241'), list('2643.7598'), list('19852.367'), list('975863.24'), list('8324917.6'), list('64127598.')]", "[list('519748632'), list('783652419'), list('426139875'), list('357986241'), list('264317598'), list('198524367'), list('975863124'), list('832491756'), list('641275983')]"]] }
  ]
});
