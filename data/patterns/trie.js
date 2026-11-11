PAT("trie", {
  time: "O(L) per word", space: "O(total characters)",
  lede: "A tree where each edge is a character and each path from the root spells a prefix. Words that share a beginning share nodes, so prefix questions cost O(length of the prefix), no matter how many words you stored.",
  idea: "Checking a prefix against a list of words is O(n · L). A trie stores all words in one tree of characters; looking up any prefix walks at most L nodes. Mark nodes where a word **ends**. Tries also work on bits (0/1 children) to find the number that maximises XOR with a given one.",
  analogy: "A dictionary's thumb index: to find words starting with “pre”, you go to P, then R, then E. Everything below that point starts with “pre”.",
  flavours: [["Node holds", "How", "Use it for"], [
    ["**children + end flag**", "`dict` of char → node, `end = True`", "insert, search, starts-with"],
    ["**+ count**", "how many words pass through", "count words with a prefix"],
    ["**+ stored word**", "save the word at its end node", "word search in a grid, suggestions"],
    ["**bit trie**", "children 0 / 1 for each bit, high to low", "maximum XOR pair"]]],
  signals: [["“Starts with”, “prefix”, “autocomplete”, “suggestions”", "many words, many prefix queries"], ["Wildcard search like `b.d`", "DFS through the trie"], ["Find many dictionary words in a grid", "trie + backtracking"], ["Maximum XOR of two numbers", "bit trie"]],
  not: "**Not this pattern** for one-off prefix checks on a few strings (`str.startswith` is fine), or exact-match lookups only (→ a set or dict).",
  templates: [
    ["Trie class", "trie.py", `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})   # create the child if missing
        node["$"] = True                     # marks the end of a word

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None

t = Trie()
for w in ["apple", "app", "bat"]:
    t.insert(w)
print(t.search("app"), t.search("ap"), t.starts_with("ap"), t.starts_with("c"))`, "True False True False"]
  ],
  examples: [
    { t: "Design Add and Search Words", d: "Medium", lc: "design-add-and-search-words-data-structure", f: "Wildcard DFS",
      q: "Support addWord(w) and search(pattern) where '.' matches any letter.",
      idea: "Normal characters follow one child; '.' tries every child (DFS).",
      code: `class WordDict:
    def __init__(self): self.root = {}
    def add(self, w):
        n = self.root
        for c in w: n = n.setdefault(c, {})
        n["$"] = True
    def search(self, p):
        def dfs(n, i):
            if i == len(p): return "$" in n
            if p[i] == ".":
                return any(dfs(ch, i + 1) for k, ch in n.items() if k != "$")
            return p[i] in n and dfs(n[p[i]], i + 1)
        return dfs(self.root, 0)

d = WordDict()
for w in ["bad", "dad", "mad"]: d.add(w)
print(d.search("pad"), d.search(".ad"), d.search("b.."))`, out: "False True True", cx: "O(L) or O(26^dots · L)" },
    { t: "Maximum XOR of Two Numbers", d: "Medium", lc: "maximum-xor-of-two-numbers-in-an-array", f: "Bit trie",
      q: "Max of a XOR b over all pairs.",
      idea: "Insert numbers bit by bit (high to low). For each number, greedily walk to the opposite bit when possible.",
      code: `def max_xor(nums):
    root, best = {}, 0
    for x in nums:
        node = root
        for b in range(30, -1, -1):
            node = node.setdefault((x >> b) & 1, {})
    for x in nums:
        node, cur = root, 0
        for b in range(30, -1, -1):
            bit = (x >> b) & 1
            if 1 - bit in node:
                cur |= 1 << b; node = node[1 - bit]
            else:
                node = node[bit]
        best = max(best, cur)
    return best

print(max_xor([3, 10, 5, 25, 2, 8]))`, out: "28", cx: "O(31 · n)" }
  ],
  pitfalls: [
    ["Forgetting the end-of-word marker", "Without it, “app” would look present just because “apple” was inserted."],
    ["Treating a prefix as a word", "`starts_with` checks the path exists; `search` also needs the end marker."],
    ["Building a new trie per query", "Insert all words once, then answer every query."],
    ["Bit trie with the wrong bit order", "Walk from the highest bit to the lowest so greedy choices are optimal."]
  ],
  edge: ["Empty string as a word", "Words that are prefixes of other words", "Duplicate inserts", "Prefix longer than any word", "No matches at all"],
  compare: [
    ["Hashing", "hashing", "A set answers “is this exact word present?” just as fast; tries win when you need prefixes."],
    ["Backtracking", "backtracking", "Word Search II combines grid backtracking with a trie to prune dead prefixes."],
    ["Bit Manipulation", "bits", "A bit trie is how you answer “maximum XOR” questions efficiently."]
  ],
  mcq: [
    ["Why mark the end of each word in a trie?", ["To save memory", "So a word that's only a prefix of another isn't reported as present", "To sort words", "It's optional"], 1, "Paths exist for every prefix; only the marker says a whole word ends there."],
    ["Cost of `starts_with(prefix)` in a trie holding n words?", ["O(n)", "O(len(prefix))", "O(n log n)", "O(1)"], 1, "You walk one node per character of the prefix."]
  ],
  summary: {
    oneLine: "Shared-prefix tree of characters: insert/search/starts-with in O(length).",
    signals: ["Prefix / autocomplete / suggestions", "Wildcard word search", "Many words in a grid", "Max XOR (bit trie)"],
    template: `root = {}
def insert(word):
    node = root
    for ch in word:
        node = node.setdefault(ch, {})
    node["$"] = True`,
    pitfalls: ["End-of-word marker", "Prefix ≠ word", "Build once, query many"],
    cx: "O(L) per operation · O(total chars) space",
    drill: { task: "Given `words` and `prefixes`, return for each prefix how many words start with it. Build a trie with counts.",
      ref: `def prefix_counts(words, prefixes):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
            node["#"] = node.get("#", 0) + 1
    out = []
    for p in prefixes:
        node = root
        for ch in p:
            node = node.get(ch)
            if node is None:
                break
        out.append(node.get("#", 0) if node is not None else 0)
    return out`,
      tests: [["['apple', 'app', 'apt', 'bat'], ['ap', 'app', 'b', 'c']", "[3, 2, 1, 0]"], ["['a'], ['a', 'aa']", "[1, 0]"]] }
  },
  problems: [
    { id: "prefix-count", title: "Count by Prefix", d: "Easy", lc: "counting-words-with-a-given-prefix",
      statement: "Return how many strings in `words` start with `prefix`.",
      examples: [["['pay', 'attention', 'practice', 'attend'], 'at'", "2", ""], ["['leetcode', 'win', 'loops', 'success'], 'code'", "0", ""]],
      constraints: ["1 ≤ len(words) ≤ 10⁵", "1 ≤ len(prefix) ≤ 100"],
      hints: ["For a single query, `startswith` is enough.", "(For many queries, a trie with counts answers each in O(len(prefix)).)"],
      solution: `def prefix_count(words, prefix):
    return sum(1 for w in words if w.startswith(prefix))`,
      why: "One query only needs one pass; tries pay off when the same words get many prefix queries.", time: "O(n · len(prefix))",
      hidden: [["['a'], 'a'", "1"], ["['ab', 'a'], 'ab'", "1"], ["['abc'] * 100000, 'ab'", "100000"]] },
    { id: "prefix-tree", title: "Build a Prefix Tree", d: "Medium", lc: "implement-trie-prefix-tree",
      statement: "Implement `PrefixTree` with `insert(word)`, `search(word)` (is the exact word stored?) and `starts_with(prefix)` (does any stored word start with it?). The checker runs a list of operations; the constructor and `insert` output `None`.",
      examples: [["['PrefixTree', 'insert', 'search', 'search', 'starts_with', 'insert', 'search'], [[], ['apple'], ['apple'], ['app'], ['app'], ['app'], ['app']]", "[None, None, True, False, True, None, True]", ""], ["['PrefixTree', 'insert', 'insert', 'starts_with', 'search', 'search'], [[], ['bat'], ['bath'], ['ba'], ['bat'], ['ba']]", "[None, None, None, True, True, False]", ""]],
      constraints: ["up to 3·10⁴ operations", "lowercase words, length ≤ 2000"],
      hints: ["Each node: a dict of children and an end-of-word flag.", "search needs the flag; starts_with only needs the path."],
      starter: "class PrefixTree:\n    def __init__(self):\n        pass\n\n    def insert(self, word):\n        pass\n\n    def search(self, word):\n        pass\n\n    def starts_with(self, prefix):\n        pass\n",
      solution: `class PrefixTree:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def _walk(self, s):
        node = self.root
        for ch in s:
            if ch not in node:
                return None
            node = node[ch]
        return node

    def search(self, word):
        node = self._walk(word)
        return node is not None and "$" in node

    def starts_with(self, prefix):
        return self._walk(prefix) is not None`,
      call: "run_ops(F, *args)",
      why: "Each operation walks one node per character, independent of how many words are stored.", time: "O(L) per operation",
      hidden: [["['PrefixTree', 'search'], [[], ['a']]", "[None, False]"], ["['PrefixTree', 'insert', 'starts_with', 'search'], [[], ['ab'], ['abc'], ['a']]", "[None, None, False, False]"], ["['PrefixTree'] + ['insert'] * 1000 + ['search'], [[]] + [['w' + str(i)] for i in range(1000)] + [['w999']]", "[None] * 1001 + [True]"]] },
    { id: "root-words", title: "Shorten to Roots", d: "Medium", lc: "replace-words",
      statement: "`roots` is a list of word roots. Replace every word in `sentence` that starts with some root by the **shortest** such root; leave other words alone. Return the new sentence.",
      examples: [["['cat', 'bat', 'rat'], 'the cattle was rattled by the battery'", "'the cat was rat by the bat'", ""], ["['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs'", "'a a b c'", ""]],
      constraints: ["1 ≤ len(roots) ≤ 1000", "1 ≤ len(sentence) ≤ 10⁶"],
      hints: ["Put all roots in a trie.", "For each word, walk the trie and stop at the first end-of-root marker."],
      solution: `def root_words(roots, sentence):
    trie = {}
    for r in roots:
        node = trie
        for ch in r:
            node = node.setdefault(ch, {})
        node["$"] = r
    out = []
    for w in sentence.split():
        node, rep = trie, w
        for ch in w:
            if ch not in node:
                break
            node = node[ch]
            if "$" in node:
                rep = node["$"]
                break
        out.append(rep)
    return " ".join(out)`,
      why: "The trie finds the shortest matching root in O(length of the root) per word.", time: "O(total characters)",
      hidden: [["['a'], 'b'", "'b'"], ["['ab', 'a'], 'abc'", "'a'"], ["['x'], ' '.join(['xyz'] * 100000)", "' '.join(['x'] * 100000)"]] },
    { id: "typeahead", title: "Typeahead Suggestions", d: "Medium", lc: "search-suggestions-system",
      statement: "As the user types `query` one letter at a time, after each letter suggest up to **three** product names that start with the typed prefix, in alphabetical order. Return a list of suggestion lists.",
      examples: [["['mobile', 'mouse', 'moneypot', 'monitor', 'mousepad'], 'mouse'", "[['mobile', 'moneypot', 'monitor'], ['mobile', 'moneypot', 'monitor'], ['mouse', 'mousepad'], ['mouse', 'mousepad'], ['mouse', 'mousepad']]", ""], ["['havana'], 'tatiana'", "[[], [], [], [], [], [], []]", ""]],
      constraints: ["1 ≤ len(products) ≤ 1000", "1 ≤ len(query) ≤ 1000"],
      hints: ["Sort the products first.", "In a trie, store at each node the first three (sorted) words passing through it.", "Or: binary-search the prefix in the sorted list and take the next three that match."],
      solution: `def typeahead(products, query):
    root = {}
    for p in sorted(products):
        node = root
        for ch in p:
            node = node.setdefault(ch, {})
            node.setdefault("#", [])
            if len(node["#"]) < 3:
                node["#"].append(p)
    out, node = [], root
    for ch in query:
        node = node.get(ch, {}) if node is not None else None
        out.append(node.get("#", []) if node else [])
    return out`,
      why: "Inserting in sorted order means each node keeps exactly its three alphabetically-first words.", time: "O(total characters)",
      hidden: [["['a', 'ab'], 'a'", "[['a', 'ab']]"], ["['bags', 'baggage', 'banner', 'box', 'cloths'], 'bags'", "[['baggage', 'bags', 'banner'], ['baggage', 'bags', 'banner'], ['baggage', 'bags'], ['bags']]"], ["['abc'] * 1000, 'abcd'", "[['abc'] * 3, ['abc'] * 3, ['abc'] * 3, []]"]] },
    { id: "wild-dictionary", title: "Wildcard Dictionary", d: "Medium", lc: "design-add-and-search-words-data-structure",
      statement: "Implement `WildDict` with `add(word)` and `search(pattern)`, where `.` in a pattern matches any single letter. The checker runs a list of operations; the constructor and `add` output `None`.",
      examples: [["['WildDict', 'add', 'add', 'add', 'search', 'search', 'search', 'search'], [[], ['bad'], ['dad'], ['mad'], ['pad'], ['bad'], ['.ad'], ['b..']]", "[None, None, None, None, False, True, True, True]", ""], ["['WildDict', 'add', 'search', 'search', 'search'], [[], ['cat'], ['c.t'], ['...'], ['ca']]", "[None, None, True, True, False]", ""]],
      constraints: ["up to 10⁴ operations", "patterns have at most 2 dots"],
      hints: ["Store words in a trie.", "On '.', try every child (DFS); otherwise follow one child."],
      starter: "class WildDict:\n    def __init__(self):\n        pass\n\n    def add(self, word):\n        pass\n\n    def search(self, pattern):\n        pass\n",
      solution: `class WildDict:
    def __init__(self):
        self.root = {}

    def add(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, pattern):
        def dfs(node, i):
            if i == len(pattern):
                return "$" in node
            ch = pattern[i]
            if ch == ".":
                return any(dfs(child, i + 1) for k, child in node.items() if k != "$")
            return ch in node and dfs(node[ch], i + 1)
        return dfs(self.root, 0)`,
      call: "run_ops(F, *args)",
      why: "Exact letters follow a single path; dots branch only where needed.", time: "O(L), more with dots",
      hidden: [["['WildDict', 'search'], [[], ['.']]", "[None, False]"], ["['WildDict', 'add', 'search', 'search'], [[], ['a'], ['.'], ['..']]", "[None, None, True, False]"], ["['WildDict'] + ['add'] * 1000 + ['search'], [[]] + [['ab' + str(i % 10)] for i in range(1000)] + [['ab.']]", "[None] * 1001 + [True]"]] },
    { id: "built-word", title: "Word Built Letter by Letter", d: "Medium", lc: "longest-word-in-dictionary",
      statement: "Return the longest word in `words` that can be built one letter at a time, where every prefix (of length 1, 2, …) is also in `words`. If there's a tie, return the alphabetically smallest; return `''` if none.",
      examples: [["['w', 'wo', 'wor', 'worl', 'world']", "'world'", ""], ["['a', 'banana', 'app', 'appl', 'ap', 'apply', 'apple']", "'apple'", "'apply' ties but 'apple' is smaller."]],
      constraints: ["1 ≤ len(words) ≤ 1000", "1 ≤ len(words[i]) ≤ 30"],
      hints: ["A set of words lets you check every prefix.", "Or insert into a trie and DFS only through nodes that end a word."],
      solution: `def built_word(words):
    have = set(words)
    best = ""
    for w in words:
        if all(w[:i] in have for i in range(1, len(w))):
            if len(w) > len(best) or (len(w) == len(best) and w < best):
                best = w
    return best`,
      why: "A word qualifies if all its proper prefixes are words; checking them via a set is fast enough here.", time: "O(Σ L²)",
      hidden: [["['b']", "'b'"], ["['ab']", "''"], ["['a', 'ab', 'abc', 'b', 'bc', 'bcd']", "'abc'"]] },
    { id: "best-xor-pair", title: "Best XOR Pair", d: "Medium", lc: "maximum-xor-of-two-numbers-in-an-array",
      statement: "Return the maximum value of `a XOR b` over all pairs (including a number with itself) from `nums`.",
      examples: [["[3, 10, 5, 25, 2, 8]", "28", "5 XOR 25"], ["[14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]", "127", ""]],
      constraints: ["1 ≤ len(nums) ≤ 2·10⁵", "0 ≤ nums[i] < 2³¹"],
      hints: ["Checking all pairs is O(n²).", "Insert each number's bits (high to low) into a binary trie.", "For each number, walk greedily towards the opposite bit to make the XOR as large as possible."],
      solution: `def best_xor_pair(nums):
    root = {}
    for x in nums:
        node = root
        for b in range(30, -1, -1):
            node = node.setdefault((x >> b) & 1, {})
    best = 0
    for x in nums:
        node, cur = root, 0
        for b in range(30, -1, -1):
            bit = (x >> b) & 1
            if 1 - bit in node:
                cur |= 1 << b
                node = node[1 - bit]
            else:
                node = node[bit]
        best = max(best, cur)
    return best`,
      why: "A higher bit always outweighs all lower bits together, so choosing the opposite bit greedily from the top is optimal.", time: "O(31 · n)",
      hidden: [["[0]", "0"], ["[8, 10, 2]", "10"], ["list(range(1, 20001))", "32767"]] },
    { id: "grid-words", title: "Words in the Grid", d: "Hard", lc: "word-search-ii",
      statement: "Return every word from `words` that can be traced in the letter `board` by moving between horizontally or vertically adjacent cells, without reusing a cell within one word. Return them sorted alphabetically.",
      examples: [["[['o', 'a', 'a', 'n'], ['e', 't', 'a', 'e'], ['i', 'h', 'k', 'r'], ['i', 'f', 'l', 'v']], ['oath', 'pea', 'eat', 'rain']", "['eat', 'oath']", ""], ["[['a', 'b'], ['c', 'd']], ['abcb']", "[]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 12", "1 ≤ len(words) ≤ 3·10⁴", "1 ≤ len(words[i]) ≤ 10"],
      hints: ["Searching each word separately repeats work.", "Put all words in a trie and backtrack from each cell, following trie edges.", "Stop as soon as the current path isn't a prefix of any word; remove found words to prune more."],
      solution: `def grid_words(board, words):
    root = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w
    R, C = len(board), len(board[0])
    found = set()
    def dfs(r, c, node):
        ch = board[r][c]
        nxt = node.get(ch)
        if not nxt:
            return
        if "$" in nxt:
            found.add(nxt.pop("$"))
        board[r][c] = "#"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != "#":
                dfs(nr, nc, nxt)
        board[r][c] = ch
        if not nxt:
            node.pop(ch)
    for r in range(R):
        for c in range(C):
            dfs(r, c, root)
    return sorted(found)`,
      why: "The trie lets one backtracking search look for all words at once and abandon paths that aren't prefixes of any word.", time: "O(cells · 4 · 3^(L−1)) worst case",
      hidden: [["[['a']], ['a', 'b']", "['a']"], ["[['a', 'a']], ['aaa']", "[]"], ["[['a'] * 12 for _ in range(12)], ['a' * k for k in range(1, 11)] + ['b']", "sorted('a' * k for k in range(1, 11))"]] }
  ]
});
