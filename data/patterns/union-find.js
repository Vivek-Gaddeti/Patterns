PAT("union-find", {
  time: "O(α(n)) per operation", space: "O(n)",
  lede: "Keep groups as trees where each element points to a parent; the root names the group. `find` follows parents to the root, `union` links two roots. With path compression and union by size, both are effectively O(1).",
  idea: "When connections arrive one at a time and you keep asking “are these two in the same group?” or “how many groups are there?”, re-running DFS each time is wasteful. A **disjoint set union** answers in near-constant time. Union-find is also the simplest cycle detector for **undirected** graphs: adding an edge between two nodes already in the same group closes a cycle.",
  analogy: "Clubs merging: each club has a president. To check if two people are in the same club, ask each to point you to their president. Merging two clubs just means one president now reports to the other.",
  signals: [["“Are a and b connected?” many times", "dynamic connectivity"], ["“Number of groups / provinces / components”", "count successful unions"], ["“Which edge creates a cycle?”, “is it a valid tree?”", "undirected cycle detection"], ["Merge items that share something (emails, equal variables)", "group by shared keys"]],
  not: "**Not this pattern** for shortest paths (→ BFS / Dijkstra), directed graphs and dependencies (→ topological sort), or when edges get **removed** (union-find can't split groups).",
  templates: [
    ["DSU class", "dsu.py", `class DSU:
    def __init__(self, n):
        self.parent = list(range(n))
        self.size = [1] * n
        self.groups = n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression (halving)
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False                   # already together (this edge closes a cycle)
        if self.size[ra] < self.size[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra               # attach the smaller tree under the bigger one
        self.size[ra] += self.size[rb]
        self.groups -= 1
        return True

d = DSU(5)
d.union(0, 1); d.union(3, 4)
print(d.groups, d.find(0) == d.find(1), d.find(1) == d.find(3), d.union(1, 0))`, "3 True False False"]
  ],
  examples: [
    { t: "Redundant Connection", d: "Medium", lc: "redundant-connection", f: "Cycle detection",
      q: "A tree plus one extra edge. Return the edge that, if removed, leaves a tree (the last such edge in the input).",
      idea: "Union edges in order; the first one whose ends are already connected is the answer.",
      code: `def redundant(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb: return [a, b]
        parent[ra] = rb

print(redundant([[1, 2], [1, 3], [2, 3]]), redundant([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]))`, out: "[2, 3] [1, 4]", cx: "O(n α(n))" },
    { t: "Accounts Merge", d: "Medium", lc: "accounts-merge", f: "Group by shared key",
      q: "Accounts sharing an email belong to the same person. Merge them.",
      idea: "Union each account with the first account that owned each of its emails; then collect emails per root.",
      code: `from collections import defaultdict

def merge(accounts):
    parent = list(range(len(accounts)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    owner = {}
    for i, (_, *emails) in enumerate(accounts):
        for e in emails:
            if e in owner: parent[find(i)] = find(owner[e])
            else: owner[e] = i
    groups = defaultdict(set)
    for e, i in owner.items(): groups[find(i)].add(e)
    return sorted([accounts[r][0]] + sorted(es) for r, es in groups.items())

print(merge([["Ann", "a@x", "b@x"], ["Ann", "c@x"], ["Ann", "b@x", "d@x"]]))`, out: "[['Ann', 'a@x', 'b@x', 'd@x'], ['Ann', 'c@x']]", cx: "O(E α(n) + E log E)" }
  ],
  pitfalls: [
    ["No path compression or union by size", "Trees can become long chains, making `find` O(n)."],
    ["Using union-find for directed cycles", "It only detects cycles in undirected graphs."],
    ["Comparing nodes instead of roots", "Always compare `find(a) == find(b)`, not `parent[a] == parent[b]`."],
    ["Off-by-one labels", "If nodes are 1..n, size the parent array n + 1."]
  ],
  edge: ["No edges (n groups)", "All edges connect the same pair", "Self-loop edge", "Labels starting at 1", "Already connected graph"],
  compare: [
    ["Graph DFS / BFS", "graph-traversal", "One-off component counting works with DFS too; union-find shines when edges arrive over time."],
    ["Minimum Spanning Tree", "mst", "Kruskal's algorithm is union-find over edges sorted by weight."],
    ["Topological Sort", "topo-sort", "Directed cycles and dependency order need Kahn's algorithm instead."]
  ],
  mcq: [
    ["Adding edge (a, b) where find(a) == find(b) in an undirected graph means…", ["Nothing", "The edge creates a cycle", "The graph is disconnected", "a and b are leaves"], 1, "They were already connected, so a second path now exists."],
    ["What do path compression and union by size give you?", ["O(log n) find", "Amortised near-O(1) (inverse Ackermann) operations", "O(n) find", "Sorted groups"], 1, "Together they keep trees extremely flat."]
  ],
  summary: {
    oneLine: "Parent pointers to a root per group; find with path compression, union by size: near-O(1).",
    signals: ["Connected? many times", "Count groups", "Cycle in an undirected graph / valid tree", "Merge things sharing a key"],
    template: `parent = list(range(n))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    ra, rb = find(a), find(b)
    if ra == rb: return False
    parent[ra] = rb
    return True`,
    pitfalls: ["Use compression + size", "Undirected only", "Compare roots, not parents"],
    cx: "O(α(n)) per operation · O(n) space",
    drill: { task: "Return the number of connected components among nodes `0..n−1` given undirected `edges`, using union-find.",
      ref: `def count_groups(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            groups -= 1
    return groups`,
      tests: [["5, [[0, 1], [1, 2], [3, 4]]", "2"], ["3, []", "3"], ["4, [[0, 1], [1, 2], [2, 0], [2, 3]]", "1"]] }
  },
  problems: [
    { id: "friend-circles", title: "Friend Circles", d: "Medium", lc: "number-of-provinces",
      statement: "`linked[i][j] == 1` means cities i and j are directly connected (the matrix is symmetric, with 1s on the diagonal). A province is a group of directly or indirectly connected cities. Return the number of provinces.",
      examples: [["[[1, 1, 0], [1, 1, 0], [0, 0, 1]]", "2", ""], ["[[1, 0, 0], [0, 1, 0], [0, 0, 1]]", "3", ""]],
      constraints: ["1 ≤ n ≤ 200"],
      hints: ["Start with n groups.", "Union i and j for every 1 above the diagonal; each successful union removes a group."],
      solution: `def friend_circles(linked):
    n = len(linked)
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for i in range(n):
        for j in range(i + 1, n):
            if linked[i][j]:
                ri, rj = find(i), find(j)
                if ri != rj:
                    parent[ri] = rj
                    groups -= 1
    return groups`,
      why: "Each union that joins two different groups reduces the count by one.", time: "O(n² α(n))",
      hidden: [["[[1]]", "1"], ["[[1, 1], [1, 1]]", "1"], ["[[1 if i == j or abs(i - j) == 1 else 0 for j in range(200)] for i in range(200)]", "1"]] },
    { id: "network-pieces", title: "Network Pieces", d: "Medium", lc: "number-of-connected-components-in-an-undirected-graph",
      statement: "Return the number of connected components in the undirected graph with nodes `0..n−1` and `edges`.",
      examples: [["5, [[0, 1], [1, 2], [3, 4]]", "2", ""], ["5, [[0, 1], [1, 2], [2, 3], [3, 4]]", "1", ""]],
      constraints: ["1 ≤ n ≤ 2·10⁵", "0 ≤ len(edges) ≤ 2·10⁵"],
      hints: ["Union the endpoints of each edge.", "Count the successful unions; components = n − that count."],
      solution: `def network_pieces(n, edges):
    parent = list(range(n))
    size = [1] * n
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra != rb:
            if size[ra] < size[rb]:
                ra, rb = rb, ra
            parent[rb] = ra
            size[ra] += size[rb]
            groups -= 1
    return groups`,
      why: "Union by size with path compression makes each edge near-O(1).", time: "O(E α(n))",
      hidden: [["1, []", "1"], ["4, [[0, 1], [0, 1]]", "3"], ["200000, [[i, i + 1] for i in range(0, 199999, 2)]", "100000"]] },
    { id: "extra-cable", title: "The Extra Cable", d: "Medium", lc: "redundant-connection",
      statement: "A network of nodes `1..n` was a tree, then one extra cable was added. `edges` lists all n cables. Return the cable that can be removed to leave a tree; if several work, return the one that appears **last** in the input.",
      examples: [["[[1, 2], [1, 3], [2, 3]]", "[2, 3]", ""], ["[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]", "[1, 4]", ""]],
      constraints: ["3 ≤ n ≤ 1000"],
      hints: ["Add cables in order with union-find.", "The first cable whose ends are already connected closes the cycle: it's the answer."],
      solution: `def extra_cable(edges):
    parent = list(range(len(edges) + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb`,
      why: "The cycle's last-added edge is the first one found connecting two already-joined nodes.", time: "O(n α(n))",
      hidden: [["[[1, 2], [2, 3], [1, 3]]", "[1, 3]"], ["[[2, 3], [1, 2], [1, 3]]", "[1, 3]"], ["[[i, i + 1] for i in range(1, 1000)] + [[1, 1000]]", "[1, 1000]"]] },
    { id: "is-it-a-tree", title: "Is It a Tree?", d: "Medium", lc: "graph-valid-tree",
      statement: "Return `True` if the undirected graph with nodes `0..n−1` and `edges` is a valid tree: connected and without cycles.",
      examples: [["5, [[0, 1], [0, 2], [0, 3], [1, 4]]", "True", ""], ["5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]", "False", "1–2–3 is a cycle."]],
      constraints: ["1 ≤ n ≤ 2000", "0 ≤ len(edges) ≤ 5000"],
      hints: ["A tree has exactly n − 1 edges.", "With n − 1 edges, no cycle ⇔ connected. Use union-find to spot a cycle."],
      solution: `def is_tree(n, edges):
    if len(edges) != n - 1:
        return False
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return False
        parent[ra] = rb
    return True`,
      why: "n − 1 edges and no cycle forces the graph to be connected.", time: "O(n α(n))",
      hidden: [["1, []", "True"], ["2, []", "False"], ["2000, [[i, i + 1] for i in range(1999)]", "True"], ["4, [[0, 1], [2, 3], [1, 0]]", "False"]] },
    { id: "merge-profiles", title: "Merge Profiles", d: "Medium", lc: "accounts-merge",
      statement: "Each profile is `[name, email1, email2, ...]`. Two profiles belong to the same person if they share any email (the same name doesn't imply the same person). Merge them: return `[name, *sorted_emails]` for each person, with the whole list sorted.",
      examples: [["[['John', 'j1@m', 'j2@m'], ['John', 'j3@m'], ['John', 'j2@m', 'j4@m'], ['Mary', 'm@m']]", "[['John', 'j1@m', 'j2@m', 'j4@m'], ['John', 'j3@m'], ['Mary', 'm@m']]", ""], ["[['A', 'x@y']]", "[['A', 'x@y']]", ""]],
      constraints: ["1 ≤ len(profiles) ≤ 1000", "≤ 10 emails each"],
      hints: ["Union profiles that share an email: remember the first profile that owned each email.", "Group emails by the root profile.", "Sort emails inside each group and the final list."],
      solution: `def merge_profiles(profiles):
    parent = list(range(len(profiles)))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    owner = {}
    for i, p in enumerate(profiles):
        for e in p[1:]:
            if e in owner:
                parent[find(i)] = find(owner[e])
            else:
                owner[e] = i
    groups = defaultdict(set)
    for e, i in owner.items():
        groups[find(i)].add(e)
    return sorted([profiles[r][0]] + sorted(es) for r, es in groups.items())`,
      why: "Shared emails link profiles; union-find merges chains of links transitively.", time: "O(E α(n) + E log E)",
      hidden: [["[['A', 'a@'], ['A', 'a@']]", "[['A', 'a@']]"], ["[['A', 'x@'], ['B', 'y@'], ['A', 'z@', 'x@']]", "[['A', 'x@', 'z@'], ['B', 'y@']]"], ["[['P', 'e' + str(i) + '@', 'e' + str(i + 1) + '@'] for i in range(1000)]", "[['P'] + sorted('e' + str(i) + '@' for i in range(1001))]"]] },
    { id: "equation-check", title: "Equation Check", d: "Medium", lc: "satisfiability-of-equality-equations",
      statement: "Each string is `'a==b'` or `'a!=b'` for single-letter variables. Return `True` if you can assign integers to the variables so that all equations hold.",
      examples: [["['a==b', 'b!=a']", "False", ""], ["['b==a', 'a==b']", "True", ""], ["['a==b', 'b==c', 'a==c']", "True", ""]],
      constraints: ["1 ≤ len(equations) ≤ 500"],
      hints: ["First union every pair joined by ==.", "Then check every != pair: it fails if both sides are in the same group."],
      solution: `def equation_check(equations):
    parent = list(range(26))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    for e in equations:
        if e[1] == "=":
            parent[find(ord(e[0]) - 97)] = find(ord(e[3]) - 97)
    for e in equations:
        if e[1] == "!" and find(ord(e[0]) - 97) == find(ord(e[3]) - 97):
            return False
    return True`,
      why: "Equalities define groups; an inequality inside one group is the only possible contradiction.", time: "O(n α(26))",
      hidden: [["['a!=a']", "False"], ["['a==b', 'b!=c', 'c==a']", "False"], ["['c==c', 'b==d', 'x!=z']", "True"]] },
    { id: "rewire-network", title: "Rewire the Network", d: "Medium", lc: "number-of-operations-to-make-network-connected",
      statement: "`n` computers and `cables` (undirected). You may unplug any cable and plug it between two other computers. Return the minimum number of moves to connect every computer, or -1 if there aren't enough cables.",
      examples: [["4, [[0, 1], [0, 2], [1, 2]]", "1", "Move cable 1–2 to connect computer 3."], ["6, [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3]]", "2", ""], ["6, [[0, 1], [0, 2], [0, 3], [1, 2]]", "-1", ""]],
      constraints: ["1 ≤ n ≤ 10⁵", "1 ≤ len(cables) ≤ 10⁵"],
      hints: ["You need at least n − 1 cables.", "If you have enough, the answer is (number of components) − 1."],
      solution: `def rewire(n, cables):
    if len(cables) < n - 1:
        return -1
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    groups = n
    for a, b in cables:
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            groups -= 1
    return groups - 1`,
      why: "With ≥ n − 1 cables there are always enough spare (cycle) cables to join the components, one move each.", time: "O(E α(n))",
      hidden: [["1, []", "0"], ["3, [[0, 1], [0, 1]]", "1"], ["100000, [[0, 1]] * 99999", "99998"]] },
    { id: "rising-land", title: "Rising Land", d: "Hard", lc: "number-of-islands-ii",
      statement: "An `m × n` map starts as all water. `positions` lists cells that turn into land, one at a time. After each, record the number of islands (up/down/left/right connections). Adding land to an existing land cell changes nothing. Return the list of counts.",
      examples: [["3, 3, [[0, 0], [0, 1], [1, 2], [2, 1]]", "[1, 1, 2, 3]", ""], ["1, 1, [[0, 0]]", "[1]", ""], ["2, 2, [[0, 0], [1, 1], [0, 1]]", "[1, 2, 1]", ""]],
      constraints: ["1 ≤ m, n ≤ 10⁴", "1 ≤ len(positions) ≤ 10⁴"],
      hints: ["Re-counting islands after every addition is too slow.", "Each new land cell is a new island; union it with each land neighbour.", "Every successful union reduces the count by one."],
      solution: `def rising_land(m, n, positions):
    parent = {}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    count, out = 0, []
    for r, c in positions:
        cell = (r, c)
        if cell not in parent:
            parent[cell] = cell
            count += 1
            for nb in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if nb in parent:
                    ra, rb = find(cell), find(nb)
                    if ra != rb:
                        parent[ra] = rb
                        count -= 1
        out.append(count)
    return out`,
      why: "Union-find handles each new cell with at most four near-O(1) unions instead of a full recount.", time: "O(k α(k))",
      hidden: [["2, 2, [[0, 0], [0, 0]]", "[1, 1]"], ["1, 3, [[0, 0], [0, 2], [0, 1]]", "[1, 2, 1]"], ["1, 10000, [[0, i] for i in range(10000)]", "[1] * 10000"]] }
  ]
});
