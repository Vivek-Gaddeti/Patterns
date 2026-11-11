PAT("stack-parsing", {
  time: "O(n)", space: "O(n)",
  lede: "When the most recent unfinished thing must be finished first (an open bracket, a pending operator, an outer string waiting for its inner part), a stack holds that “unfinished” context.",
  idea: "Nested structure is last-in, first-out: the bracket opened **last** must close **first**. Push when something opens or is pending, pop when it completes. For expressions, the stack holds partial results (and signs or multipliers from enclosing brackets); for “decode” problems it holds the outer context while you build the inner one.",
  analogy: "A pile of plates: you can only take the one you put down most recently. Brackets work the same way: the last one you opened is the first one you can close.",
  flavours: [["Problem type", "Stack holds", "Pop when"], [
    ["**Matching**", "open brackets", "a closing bracket arrives (must match the top)"],
    ["**Evaluate**", "numbers / partial sums", "an operator or `)` completes a value"],
    ["**Decode / nest**", "(outer string, repeat count)", "`]` finishes the inner part"],
    ["**Collisions / cancellation**", "survivors so far", "a new element cancels the top"],
    ["**Min stack**", "pairs (value, min so far)", "normal pop"]]],
  signals: [["Brackets, tags, nested structure", "“valid”, “balanced”, “depth”"], ["Evaluate an expression or a postfix (RPN) list", "calculator problems"], ["“Decode” strings like `3[a2[c]]`", "push context on [, pop on ]"], ["Backspaces, undo, collisions", "the newest item affects the previous one"]],
  not: "**Not this pattern** when you need the next greater/smaller element (→ monotonic stack) or a sliding window extreme (→ monotonic deque).",
  templates: [
    ["Matching", "brackets.py", `def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack                       # everything opened was closed

print(balanced("([]{})"), balanced("(]"), balanced("(("))`, "True False False"],
    ["Decode", "decode.py", `def decode(s):
    stack, cur, num = [], "", 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            stack.append((cur, num))       # save the outer context
            cur, num = "", 0
        elif ch == "]":
            outer, k = stack.pop()
            cur = outer + cur * k
        else:
            cur += ch
    return cur

print(decode("3[a2[c]]"), decode("2[ab]cd"))`, "accaccacc ababcd"]
  ],
  examples: [
    { t: "Evaluate Reverse Polish Notation", d: "Medium", lc: "evaluate-reverse-polish-notation", f: "Evaluate",
      q: "Evaluate a postfix expression; division truncates toward zero.",
      idea: "Numbers go on the stack; an operator pops two, applies, pushes the result.",
      code: `def eval_rpn(tokens):
    st = []
    for t in tokens:
        if t in "+-*/":
            b, a = st.pop(), st.pop()
            if t == "+": st.append(a + b)
            elif t == "-": st.append(a - b)
            elif t == "*": st.append(a * b)
            else: st.append(int(a / b))     # truncate toward zero
        else:
            st.append(int(t))
    return st[0]

print(eval_rpn(["2", "1", "+", "3", "*"]), eval_rpn(["4", "13", "5", "/", "+"]))`, out: "9 6", cx: "O(n)" },
    { t: "Basic Calculator", d: "Hard", lc: "basic-calculator", f: "Evaluate",
      q: "Evaluate a string with +, −, parentheses and spaces.",
      idea: "Keep a running result and sign. On `(`, push (result, sign) and start fresh; on `)`, combine with the saved values.",
      code: `def calculate(s):
    res, num, sign, st = 0, 0, 1, []
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            res += sign * num; num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            st.append((res, sign)); res, sign = 0, 1
        elif ch == ")":
            res += sign * num; num = 0
            prev, s0 = st.pop()
            res = prev + s0 * res
    return res + sign * num

print(calculate("(1+(4+5+2)-3)+(6+8)"), calculate(" 2-1 + 2 "))`, out: "23 3", cx: "O(n)" },
    { t: "Asteroid Collision", d: "Medium", lc: "asteroid-collision", f: "Cancellation",
      q: "Positive asteroids move right, negative move left. Collisions destroy the smaller; equal sizes both explode.",
      idea: "Survivors on a stack. A left-mover fights right-movers on top until it dies or wins.",
      code: `def collide(a):
    st = []
    for x in a:
        alive = True
        while alive and x < 0 and st and st[-1] > 0:
            if st[-1] < -x: st.pop()
            elif st[-1] == -x: st.pop(); alive = False
            else: alive = False
        if alive: st.append(x)
    return st

print(collide([5, 10, -5]), collide([8, -8]), collide([10, 2, -5]))`, out: "[5, 10] [] [10]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Popping an empty stack", "A closing bracket with nothing open must return False, not crash."],
    ["Forgetting the final check", "Leftover open brackets mean the string is invalid: `return not stack`."],
    ["Multi-digit numbers", "Accumulate `num = num * 10 + digit`; don't treat each digit as a number."],
    ["Python division", "`//` floors (−7 // 2 = −4). For “truncate toward zero” use `int(a / b)`."]
  ],
  edge: ["Empty string", "Only closing brackets", "Deep nesting", "Numbers with several digits", "Negative results"],
  compare: [
    ["Monotonic Stack", "monotonic-stack", "Also a stack, but its job is ordering values to find next greater/smaller."],
    ["String Building & Parsing", "string-manipulation", "Flat formatting tasks need no stack; nesting is the signal for one."],
    ["Tree DFS", "tree-dfs", "Recursion is an implicit stack: many parsing problems can be written recursively too."]
  ],
  mcq: [
    ["Why does bracket matching use a stack?", ["Brackets are sorted", "The most recently opened bracket must close first (LIFO)", "To count brackets", "For O(1) space"], 1, "Nesting is last-in, first-out."],
    ["In `3[a2[c]]`, what do you push when you see `[`?", ["The current character", "The outer string so far and its repeat count", "The closing bracket", "Nothing"], 1, "You save the context you'll return to after the inner part is decoded."]
  ],
  summary: {
    oneLine: "Nested or “newest affects previous” structure → push the unfinished context, pop when it completes.",
    signals: ["Brackets / balanced / valid", "Evaluate expressions, RPN", "Decode `k[...]` strings", "Backspace, collisions, undo"],
    template: `pairs = {")": "(", "]": "[", "}": "{"}
stack = []
for ch in s:
    if ch in "([{":
        stack.append(ch)
    elif not stack or stack.pop() != pairs[ch]:
        return False
return not stack`,
    pitfalls: ["Check before popping", "Leftovers mean invalid", "Multi-digit numbers", "Truncate with int(a / b)"],
    cx: "O(n) time · O(n) space",
    drill: { task: "Return `True` if the brackets `()[]{}` in `s` are balanced and correctly nested.",
      ref: `def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack`,
      tests: [["'()[]{}'", "True"], ["'(]'", "False"], ["'(('", "False"], ["'{[()]}'", "True"]] }
  },
  problems: [
    { id: "bracket-check", title: "Bracket Check", d: "Easy", lc: "valid-parentheses",
      statement: "`s` contains only the characters `()[]{}`. Return `True` if every bracket is closed by the same type, in the correct order.",
      examples: [["'()[]{}'", "True", ""], ["'(]'", "False", ""], ["'([)]'", "False", ""], ["'{[]}'", "True", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["The last bracket opened must be the first one closed.", "Push openers; on a closer, the top must be its partner.", "At the end the stack must be empty."],
      solution: `def bracket_check(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)
        elif not stack or stack.pop() != pairs[ch]:
            return False
    return not stack`,
      why: "A stack mirrors the nesting exactly; any mismatch or leftover opener means it's invalid.", time: "O(n)",
      hidden: [["']'", "False"], ["'['", "False"], ["'(' * 50000 + ')' * 50000", "True"], ["'([]' * 1000", "False"]] },
    { id: "typo-replay", title: "Typo Replay", d: "Easy", lc: "backspace-string-compare",
      statement: "Two strings were typed into editors where `#` means backspace (backspacing an empty editor does nothing). Return `True` if both editors end with the same text.",
      examples: [["'ab#c', 'ad#c'", "True", "Both become 'ac'."], ["'ab##', 'c#d#'", "True", "Both empty."], ["'a#c', 'b'", "False", ""]],
      constraints: ["1 ≤ len(s), len(t) ≤ 10⁵"],
      hints: ["Simulate typing with a stack: push letters, pop on '#'.", "Compare the two final stacks. (For O(1) space, walk both strings from the end, skipping characters that get deleted.)"],
      solution: `def typo_replay(s, t):
    def final(x):
        st = []
        for ch in x:
            if ch == "#":
                if st:
                    st.pop()
            else:
                st.append(ch)
        return st
    return final(s) == final(t)`,
      why: "A stack is exactly an editor's text: typing pushes, backspace pops.", time: "O(n + m)",
      hidden: [["'#', ''", "True"], ["'a##b', 'b'", "True"], ["'a' * 50000 + '#' * 50000, 'b#'", "True"]] },
    { id: "tidy-path", title: "Tidy the Path", d: "Medium", lc: "simplify-path",
      statement: "Simplify an absolute Unix-style `path`: `.` means the current folder, `..` goes up one level (staying at root if already there), and repeated slashes count as one. Return the canonical path, starting with `/`, with no trailing slash (except the root itself).",
      examples: [["'/home/'", "'/home'", ""], ["'/../'", "'/'", ""], ["'/home//foo/'", "'/home/foo'", ""], ["'/a/./b/../../c/'", "'/c'", ""]],
      constraints: ["1 ≤ len(path) ≤ 3000", "folder names may contain letters, digits, '.', '_'"],
      hints: ["Split on '/' and ignore empty parts and '.'.", "'..' pops the last folder if there is one.", "Anything else (even '...') is a folder name: push it."],
      solution: `def tidy_path(path):
    st = []
    for part in path.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if st:
                st.pop()
        else:
            st.append(part)
    return "/" + "/".join(st)`,
      why: "Folders form a stack: entering pushes, `..` pops.", time: "O(n)",
      hidden: [["'/'", "'/'"], ["'/...'", "'/...'"], ["'/a/../../b/./c//'", "'/b/c'"], ["'/x' * 1000 + '/..' * 999", "'/x'"]] },
    { id: "postfix-eval", title: "Postfix Calculator", d: "Medium", lc: "evaluate-reverse-polish-notation",
      statement: "Evaluate an arithmetic expression in Reverse Polish (postfix) notation given as a list of tokens. Operators are `+ - * /`; division **truncates toward zero**. All intermediate results fit in 32-bit integers.",
      examples: [["['2', '1', '+', '3', '*']", "9", "(2 + 1) × 3"], ["['4', '13', '5', '/', '+']", "6", "4 + 13 / 5"], ["['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+']", "22", ""]],
      constraints: ["1 ≤ len(tokens) ≤ 10⁴", "numbers may be negative"],
      hints: ["Numbers go on a stack.", "An operator pops the right operand first, then the left.", "`int(a / b)` truncates toward zero; `//` floors."],
      solution: `def postfix_eval(tokens):
    st = []
    for t in tokens:
        if t in ("+", "-", "*", "/"):
            b = st.pop()
            a = st.pop()
            if t == "+":
                st.append(a + b)
            elif t == "-":
                st.append(a - b)
            elif t == "*":
                st.append(a * b)
            else:
                st.append(int(a / b))
        else:
            st.append(int(t))
    return st[0]`,
      why: "In postfix, every operator applies to the two most recent values, which are exactly the top of the stack.", time: "O(n)",
      hidden: [["['5']", "5"], ["['7', '-2', '/']", "-3"], ["['1'] + ['1', '+'] * 5000", "5001"]] },
    { id: "unpack", title: "Unpack the Code", d: "Medium", lc: "decode-string",
      statement: "Decode `s`, where `k[text]` means `text` repeated `k` times. Brackets can be nested; `k` is a positive integer (possibly several digits).",
      examples: [["'3[a]2[bc]'", "'aaabcbc'", ""], ["'3[a2[c]]'", "'accaccacc'", ""], ["'2[abc]3[cd]ef'", "'abcabccdcdcdef'", ""]],
      constraints: ["1 ≤ len(s) ≤ 30", "the output has at most 10⁵ characters"],
      hints: ["When you meet '[', save the text built so far and the number before it.", "When you meet ']', the current text is the inner part: repeat it and attach it to the saved outer text."],
      solution: `def unpack(s):
    stack, cur, num = [], "", 0
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch == "[":
            stack.append((cur, num))
            cur, num = "", 0
        elif ch == "]":
            outer, k = stack.pop()
            cur = outer + cur * k
        else:
            cur += ch
    return cur`,
      why: "Each '[' pushes the context to return to, so nesting unwinds in the correct order.", time: "O(output)",
      hidden: [["'abc'", "'abc'"], ["'10[a]'", "'a' * 10"], ["'2[2[2[a]]]'", "'a' * 8"], ["'100[ab]'", "'ab' * 100"]] },
    { id: "space-rocks", title: "Space Rocks", d: "Medium", lc: "asteroid-collision",
      statement: "Rocks in a row move at the same speed: positive values move right, negative move left, and the absolute value is the size. When two meet, the smaller one breaks; equal sizes both break. Rocks moving the same way never meet. Return the rocks left after all collisions, in order.",
      examples: [["[5, 10, -5]", "[5, 10]", ""], ["[8, -8]", "[]", ""], ["[10, 2, -5]", "[10]", ""], ["[-2, -1, 1, 2]", "[-2, -1, 1, 2]", ""]],
      constraints: ["2 ≤ len(rocks) ≤ 10⁴", "rocks[i] ≠ 0"],
      hints: ["Only a left-mover arriving after right-movers causes collisions.", "Keep survivors on a stack; a new left-mover fights the right-movers on top.", "It stops when it breaks, or when the top is not a right-mover."],
      solution: `def space_rocks(rocks):
    st = []
    for x in rocks:
        alive = True
        while alive and x < 0 and st and st[-1] > 0:
            if st[-1] < -x:
                st.pop()
            elif st[-1] == -x:
                st.pop()
                alive = False
            else:
                alive = False
        if alive:
            st.append(x)
    return st`,
      why: "Each rock is pushed and popped at most once; the stack holds exactly the survivors so far.", time: "O(n)",
      hidden: [["[1, -1, -2]", "[-2]"], ["[-1, 1]", "[-1, 1]"], ["[1] * 5000 + [-6000]", "[-6000]"]] },
    { id: "min-tracker", title: "Min Tracker", d: "Medium", lc: "min-stack",
      statement: "Implement a class `MinTracker` with `push(x)`, `pop()`, `top()` and `get_min()`, each in **O(1)**. The checker calls a list of operations; the first creates the object (output `None`), and `push`/`pop` also return `None`.",
      examples: [["['MinTracker', 'push', 'push', 'push', 'get_min', 'pop', 'top', 'get_min'], [[], [-2], [0], [-3], [], [], [], []]", "[None, None, None, None, -3, None, 0, -2]", ""], ["['MinTracker', 'push', 'get_min', 'push', 'get_min'], [[], [5], [], [3], []]", "[None, None, 5, None, 3]", ""]],
      constraints: ["up to 3·10⁴ operations", "pop/top/get_min are only called when non-empty"],
      hints: ["Store, with each value, the minimum of the stack at that moment.", "Then get_min is just the top pair's min."],
      starter: "class MinTracker:\n    def __init__(self):\n        pass\n\n    def push(self, x):\n        pass\n\n    def pop(self):\n        pass\n\n    def top(self):\n        pass\n\n    def get_min(self):\n        pass\n",
      solution: `class MinTracker:
    def __init__(self):
        self.st = []

    def push(self, x):
        m = min(x, self.st[-1][1]) if self.st else x
        self.st.append((x, m))

    def pop(self):
        self.st.pop()

    def top(self):
        return self.st[-1][0]

    def get_min(self):
        return self.st[-1][1]`,
      call: "run_ops(F, *args)",
      why: "Each entry remembers the minimum below it, so popping restores the previous minimum automatically.", time: "O(1) per operation",
      hidden: [["['MinTracker', 'push', 'push', 'get_min', 'pop', 'get_min'], [[], [1], [1], [], [], []]", "[None, None, None, 1, None, 1]"], ["['MinTracker', 'push', 'push', 'pop', 'get_min', 'top'], [[], [2], [1], [], [], []]", "[None, None, None, None, 2, 2]"], ["['MinTracker'] + ['push'] * 10000 + ['get_min'], [[]] + [[i] for i in range(10000, 0, -1)] + [[]]", "[None] * 10001 + [1]"]] },
    { id: "sum-calculator", title: "Bracket Calculator", d: "Hard", lc: "basic-calculator",
      statement: "Evaluate `s`, a valid expression with non-negative integers, `+`, `-`, parentheses and spaces. `-` may also be unary (like `-(2+3)`). Don't use `eval`.",
      examples: [["'1 + 1'", "2", ""], ["' 2-1 + 2 '", "3", ""], ["'(1+(4+5+2)-3)+(6+8)'", "23", ""], ["'-(2+3)'", "-5", ""]],
      constraints: ["1 ≤ len(s) ≤ 3·10⁵"],
      hints: ["Keep a running result, the current number and the sign in front of it.", "On '(', push (result, sign) and start a fresh sub-expression.", "On ')', finish the inner result and combine: outer + sign × inner."],
      solution: `def sum_calculator(s):
    res, num, sign, st = 0, 0, 1, []
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)
        elif ch in "+-":
            res += sign * num
            num = 0
            sign = 1 if ch == "+" else -1
        elif ch == "(":
            st.append((res, sign))
            res, sign = 0, 1
        elif ch == ")":
            res += sign * num
            num = 0
            prev, s0 = st.pop()
            res = prev + s0 * res
    return res + sign * num`,
      why: "The stack saves exactly the outer state each bracket interrupts; everything else is a left-to-right sum.", time: "O(n)",
      hidden: [["'42'", "42"], ["'1-(-2)'", "3"], ["'(' * 1000 + '1' + ')' * 1000", "1"], ["'1+' * 50000 + '1'", "50001"]] }
  ]
});
