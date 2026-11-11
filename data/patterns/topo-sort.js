PAT("topo-sort", {
  time: "O(V + E)", space: "O(V + E)",
  lede: "Order the nodes of a directed graph so every edge points forward: each task comes after everything it depends on. Kahn's algorithm repeatedly takes a node with no remaining prerequisites. If you get stuck before taking them all, there's a cycle.",
  idea: "Count each node's **in-degree** (how many prerequisites it still has). Every node with in-degree 0 can go first: put them in a queue. Taking a node “completes” it, so decrease the in-degree of everything that depended on it; any that reach 0 join the queue. If the output has fewer than V nodes, the remaining ones form a cycle and no valid order exists. A min-heap instead of a queue gives the lexicographically smallest order.",
  analogy: "Getting dressed: socks before shoes, shirt before jacket. At any moment you can put on anything whose prerequisites are already on.",
  flavours: [["Variant", "How", "Use it for"], [
    ["**Kahn (BFS)**", "queue of in-degree-0 nodes", "an order, cycle detection, levels (semesters)"],
    ["**Kahn + heap**", "min-heap instead of queue", "smallest order when several are possible"],
    ["**DFS post-order**", "add a node after all its children; reverse at the end", "alternative order, cycle detection with colours"],
    ["**Layers**", "process the queue level by level", "minimum number of rounds / semesters"]]],
  signals: [["Prerequisites, dependencies, “must come before”", "courses, builds, recipes"], ["“Is it possible to finish all…?”", "cycle detection in a directed graph"], ["“Return an order” / “minimum number of semesters”", "Kahn, layer by layer"], ["Derive an order from sorted examples", "alien dictionary"]],
  not: "**Not this pattern** for undirected graphs (cycles there use union-find / DFS), or when edges have weights and you need shortest distances (→ Dijkstra; though DAGs allow DP in topological order).",
  templates: [
    ["Kahn's algorithm", "kahn.py", `from collections import deque, defaultdict

def topo_order(n, edges):                  # edge [a, b]: a must come before b
    g = defaultdict(list)
    indeg = [0] * n
    for a, b in edges:
        g[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:              # all its prerequisites are done
                q.append(v)
    return order if len(order) == n else []   # [] means there's a cycle

print(topo_order(4, [[0, 1], [0, 2], [1, 3], [2, 3]]), topo_order(2, [[0, 1], [1, 0]]))`, "[0, 1, 2, 3] []"]
  ],
  examples: [
    { t: "Course Schedule", d: "Medium", lc: "course-schedule", f: "Cycle detection",
      q: "Given prerequisite pairs, can you finish all courses?",
      idea: "Run Kahn's algorithm; you can finish iff every course gets taken (no cycle).",
      code: `from collections import deque

def can_finish(n, pre):
    g, indeg = [[] for _ in range(n)], [0] * n
    for course, req in pre:
        g[req].append(course); indeg[course] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    done = 0
    while q:
        u = q.popleft(); done += 1
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0: q.append(v)
    return done == n

print(can_finish(2, [[1, 0]]), can_finish(2, [[1, 0], [0, 1]]))`, out: "True False", cx: "O(V + E)" },
    { t: "Alien Dictionary", d: "Hard", lc: "alien-dictionary", f: "Derive edges",
      q: "Words sorted in an unknown alphabet. Recover a letter order (or '' if impossible).",
      idea: "Compare adjacent words: the first differing letters give an edge. A longer word before its own prefix is invalid. Then topologically sort the letters.",
      code: `import heapq

def alien_order(words):
    letters = sorted(set("".join(words)))
    g, indeg = {c: set() for c in letters}, {c: 0 for c in letters}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in g[x]: g[x].add(y); indeg[y] += 1
                break
        else:
            if len(a) > len(b): return ""
    heap = [c for c in letters if indeg[c] == 0]
    out = []
    while heap:
        c = heapq.heappop(heap); out.append(c)
        for d in g[c]:
            indeg[d] -= 1
            if indeg[d] == 0: heapq.heappush(heap, d)
    return "".join(out) if len(out) == len(letters) else ""

print(alien_order(["wrt", "wrf", "er", "ett", "rftt"]))`, out: "wertf", cx: "O(total chars)" }
  ],
  pitfalls: [
    ["Getting the edge direction backwards", "[course, prerequisite] means prerequisite → course."],
    ["Forgetting cycle detection", "If fewer than V nodes come out, there's a cycle."],
    ["Nodes with no edges", "They still need to appear: start in-degree counting from all n nodes."],
    ["Duplicate edges", "A repeated edge increments in-degree twice; dedupe if the input can repeat (alien dictionary)."]
  ],
  edge: ["No edges at all", "A self-loop", "Disconnected parts", "Duplicate edges", "Everything in one chain"],
  compare: [
    ["Graph DFS / BFS", "graph-traversal", "Plain traversal ignores direction and order; topo sort respects dependencies."],
    ["Union-Find", "union-find", "Detects cycles in **undirected** graphs; directed cycles need topo sort or DFS colours."],
    ["1-D DP", "dp-1d", "DP on a DAG (longest path, number of ways) processes nodes in topological order."]
  ],
  mcq: [
    ["Kahn's algorithm ends with fewer nodes than the graph has. What does that mean?", ["The graph is disconnected", "There's a cycle", "There are duplicate edges", "Nothing"], 1, "Nodes on a cycle never reach in-degree 0."],
    ["Pair [a, b] means “to take a you must first take b”. Which edge do you add?", ["a → b", "b → a", "both", "neither"], 1, "Edges point from prerequisite to the course that depends on it."]
  ],
  summary: {
    oneLine: "Kahn: start with in-degree-0 nodes, remove them, push nodes whose in-degree drops to 0; leftovers = cycle.",
    signals: ["Prerequisites / dependencies", "Can you finish everything? (cycle)", "Return an order / minimum rounds", "Alien dictionary"],
    template: `q = deque(i for i in range(n) if indeg[i] == 0)
order = []
while q:
    u = q.popleft()
    order.append(u)
    for v in g[u]:
        indeg[v] -= 1
        if indeg[v] == 0:
            q.append(v)
# len(order) < n  ->  cycle`,
    pitfalls: ["Edge direction", "Check for cycles", "Include isolated nodes"],
    cx: "O(V + E) time · O(V + E) space",
    drill: { task: "`n` tasks, edges `[a, b]` mean a must come before b. Return a valid order, always taking the **smallest** available task next; return `[]` if impossible.",
      ref: `def smallest_order(n, edges):
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in edges:
        g[a].append(b)
        indeg[b] += 1
    heap = [i for i in range(n) if indeg[i] == 0]
    heapify(heap)
    out = []
    while heap:
        u = heappop(heap)
        out.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heappush(heap, v)
    return out if len(out) == n else []`,
      tests: [["4, [[1, 0], [2, 0], [3, 1]]", "[2, 3, 1, 0]"], ["2, [[0, 1], [1, 0]]", "[]"], ["3, []", "[0, 1, 2]"]] }
  },
  problems: [
    { id: "town-judge", title: "The Town Judge", d: "Easy", lc: "find-the-town-judge",
      statement: "People are labelled `1..n`. `trust[i] = [a, b]` means a trusts b. The judge trusts nobody and is trusted by everyone else. Return the judge's label, or -1 if there isn't exactly one.",
      examples: [["2, [[1, 2]]", "2", ""], ["3, [[1, 3], [2, 3], [3, 1]]", "-1", ""], ["1, []", "1", ""]],
      constraints: ["1 ≤ n ≤ 1000", "0 ≤ len(trust) ≤ 10⁴"],
      hints: ["Track in-degree (trusted by) and out-degree (trusts) for everyone.", "The judge has in-degree n − 1 and out-degree 0."],
      solution: `def town_judge(n, trust):
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    for p in range(1, n + 1):
        if score[p] == n - 1:
            return p
    return -1`,
      why: "in-degree − out-degree = n − 1 only for someone trusted by all others who trusts nobody.", time: "O(n + t)",
      hidden: [["2, []", "-1"], ["3, [[1, 3], [2, 3]]", "3"], ["1000, [[i, 1000] for i in range(1, 1000)]", "1000"]] },
    { id: "finish-all", title: "Can You Finish?", d: "Medium", lc: "course-schedule",
      statement: "There are `n` courses `0..n−1`. `prereqs[i] = [a, b]` means you must take b before a. Return `True` if you can finish every course.",
      examples: [["2, [[1, 0]]", "True", ""], ["2, [[1, 0], [0, 1]]", "False", "Each needs the other first."]],
      constraints: ["1 ≤ n ≤ 2000", "0 ≤ len(prereqs) ≤ 5000"],
      hints: ["It's possible exactly when the dependency graph has no cycle.", "Kahn's algorithm: count how many courses you can take."],
      solution: `def finish_all(n, prereqs):
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in prereqs:
        g[b].append(a)
        indeg[a] += 1
    q = deque(i for i in range(n) if indeg[i] == 0)
    taken = 0
    while q:
        u = q.popleft()
        taken += 1
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return taken == n`,
      why: "Courses on a cycle never reach in-degree 0, so they're never taken.", time: "O(V + E)",
      hidden: [["1, []", "True"], ["3, [[0, 1], [1, 2], [2, 0]]", "False"], ["2000, [[i + 1, i] for i in range(1999)]", "True"]] },
    { id: "study-order", title: "Study Order", d: "Medium", lc: "course-schedule-ii",
      statement: "Same setup as before (`[a, b]` = take b before a). Return an order in which to take all courses; whenever several courses are available, take the **smallest number** first. Return `[]` if impossible.",
      examples: [["2, [[1, 0]]", "[0, 1]", ""], ["4, [[1, 0], [2, 0], [3, 1], [3, 2]]", "[0, 1, 2, 3]", ""], ["2, [[0, 1], [1, 0]]", "[]", ""]],
      constraints: ["1 ≤ n ≤ 2000", "0 ≤ len(prereqs) ≤ n(n−1)"],
      hints: ["Kahn's algorithm with a min-heap instead of a queue.", "Return [] if not every course was taken."],
      solution: `def study_order(n, prereqs):
    g = [[] for _ in range(n)]
    indeg = [0] * n
    for a, b in prereqs:
        g[b].append(a)
        indeg[a] += 1
    heap = [i for i in range(n) if indeg[i] == 0]
    heapify(heap)
    out = []
    while heap:
        u = heappop(heap)
        out.append(u)
        for v in g[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heappush(heap, v)
    return out if len(out) == n else []`,
      why: "The heap always offers the smallest available course, which makes the order unique.", time: "O((V + E) log V)",
      hidden: [["1, []", "[0]"], ["3, [[0, 2], [1, 2]]", "[2, 0, 1]"], ["2000, [[i, i + 1] for i in range(1999)]", "list(range(1999, -1, -1))"]] },
    { id: "semesters", title: "Fewest Semesters", d: "Medium", lc: "parallel-courses",
      statement: "Courses are labelled `1..n`. `relations[i] = [a, b]` means a must be taken in an earlier semester than b. You can take any number of courses per semester. Return the minimum number of semesters, or -1 if impossible.",
      examples: [["3, [[1, 3], [2, 3]]", "2", ""], ["3, [[1, 2], [2, 3], [3, 1]]", "-1", ""]],
      constraints: ["1 ≤ n ≤ 5000", "1 ≤ len(relations) ≤ 5000"],
      hints: ["Each semester, take everything whose prerequisites are done: one Kahn layer.", "Count the layers; check that all courses were taken."],
      solution: `def semesters(n, relations):
    g = [[] for _ in range(n + 1)]
    indeg = [0] * (n + 1)
    for a, b in relations:
        g[a].append(b)
        indeg[b] += 1
    q = deque(i for i in range(1, n + 1) if indeg[i] == 0)
    taken = terms = 0
    while q:
        terms += 1
        for _ in range(len(q)):
            u = q.popleft()
            taken += 1
            for v in g[u]:
                indeg[v] -= 1
                if indeg[v] == 0:
                    q.append(v)
    return terms if taken == n else -1`,
      why: "Taking every available course each term is optimal; the number of Kahn layers is the longest dependency chain.", time: "O(V + E)",
      hidden: [["1, []", "1"], ["4, [[1, 2], [3, 4]]", "2"], ["5000, [[i, i + 1] for i in range(1, 5000)]", "5000"]] },
    { id: "safe-states", title: "Safe Places", d: "Medium", lc: "find-eventual-safe-states",
      statement: "`graph[i]` lists the nodes that node i points to. A node is *safe* if every path from it eventually stops at a node with no outgoing edges (it can't get stuck in a cycle). Return all safe nodes in increasing order.",
      examples: [["[[1, 2], [2, 3], [5], [0], [5], [], []]", "[2, 4, 5, 6]", ""], ["[[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]", "[4]", ""]],
      constraints: ["1 ≤ n ≤ 10⁴", "total edges ≤ 4·10⁴"],
      hints: ["Reverse every edge.", "Terminal nodes (no outgoing edges) are safe: they have in-degree 0 in the reversed graph.", "Kahn on the reversed graph: everything that gets removed is safe."],
      solution: `def safe_states(graph):
    n = len(graph)
    rev = [[] for _ in range(n)]
    out = [len(graph[i]) for i in range(n)]
    for u in range(n):
        for v in graph[u]:
            rev[v].append(u)
    q = deque(i for i in range(n) if out[i] == 0)
    safe = [False] * n
    while q:
        v = q.popleft()
        safe[v] = True
        for u in rev[v]:
            out[u] -= 1
            if out[u] == 0:
                q.append(u)
    return [i for i in range(n) if safe[i]]`,
      why: "A node is safe once all of its outgoing edges lead to safe nodes, which is exactly Kahn's rule on reversed edges.", time: "O(V + E)",
      hidden: [["[[]]", "[0]"], ["[[0]]", "[]"], ["[[i + 1] for i in range(9999)] + [[]]", "list(range(10000))"]] },
    { id: "tree-centres", title: "Best Roots", d: "Medium", lc: "minimum-height-trees",
      statement: "`edges` describe a tree on nodes `0..n−1`. Choosing a root makes the tree's height the longest root-to-leaf path. Return all roots that give the **minimum** height, in increasing order.",
      examples: [["4, [[1, 0], [1, 2], [1, 3]]", "[1]", ""], ["6, [[3, 0], [3, 1], [3, 2], [3, 4], [5, 4]]", "[3, 4]", ""]],
      constraints: ["1 ≤ n ≤ 2·10⁴"],
      hints: ["The best roots are the centre(s) of the longest path: at most 2 of them.", "Peel leaves layer by layer (like Kahn with degree 1).", "The last 1 or 2 nodes left are the answer."],
      solution: `def tree_centres(n, edges):
    if n <= 2:
        return list(range(n))
    g = [set() for _ in range(n)]
    for a, b in edges:
        g[a].add(b)
        g[b].add(a)
    leaves = [i for i in range(n) if len(g[i]) == 1]
    left = n
    while left > 2:
        left -= len(leaves)
        nxt = []
        for leaf in leaves:
            nb = g[leaf].pop()
            g[nb].remove(leaf)
            if len(g[nb]) == 1:
                nxt.append(nb)
        leaves = nxt
    return sorted(leaves)`,
      why: "Removing all current leaves at once shrinks every longest path from both ends equally, converging on its centre.", time: "O(n)",
      hidden: [["1, []", "[0]"], ["2, [[0, 1]]", "[0, 1]"], ["20000, [[i, i + 1] for i in range(19999)]", "[9999, 10000]"]] },
    { id: "alien-alphabet", title: "Alien Alphabet", d: "Hard", lc: "alien-dictionary",
      statement: "`words` is sorted according to an unknown alphabet (a subset of lowercase letters). Return a string of all letters that appear, in an order consistent with the sorting; when several letters are possible next, choose the **alphabetically smallest**. Return `''` if the input is inconsistent.",
      examples: [["['wrt', 'wrf', 'er', 'ett', 'rftt']", "'wertf'", ""], ["['z', 'x']", "'zx'", ""], ["['z', 'x', 'z']", "''", "z < x and x < z."], ["['abc', 'ab']", "''", "A word can't come before its own prefix."]],
      constraints: ["1 ≤ len(words) ≤ 100", "1 ≤ len(words[i]) ≤ 100"],
      hints: ["Only the first differing letter of each adjacent pair gives information: an edge.", "If a word is followed by its own proper prefix, it's invalid.", "Topologically sort the letters with a min-heap."],
      solution: `def alien_alphabet(words):
    letters = sorted(set("".join(words)))
    g = {c: set() for c in letters}
    indeg = {c: 0 for c in letters}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in g[x]:
                    g[x].add(y)
                    indeg[y] += 1
                break
        else:
            if len(a) > len(b):
                return ""
    heap = [c for c in letters if indeg[c] == 0]
    heapify(heap)
    out = []
    while heap:
        c = heappop(heap)
        out.append(c)
        for d in g[c]:
            indeg[d] -= 1
            if indeg[d] == 0:
                heappush(heap, d)
    return "".join(out) if len(out) == len(letters) else ""`,
      why: "Adjacent pairs give all the ordering facts; a topological sort combines them, and a cycle means a contradiction.", time: "O(total characters)",
      hidden: [["['a']", "'a'"], ["['ab', 'adc']", "'abcd'"], ["['ba', 'bc', 'ac', 'cab']", "'bac'"], ["[chr(97 + i) for i in range(25, -1, -1)]", "'zyxwvutsrqponmlkjihgfedcba'"]] }
  ]
});
