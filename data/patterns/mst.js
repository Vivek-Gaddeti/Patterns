PAT("mst", {
  time: "O(E log E)", space: "O(V + E)",
  lede: "Connect every node using a subset of edges with the smallest possible total cost. Kruskal: take edges cheapest-first, skipping any that would close a cycle (union-find). Prim: grow one tree, always adding the cheapest edge leaving it (heap).",
  idea: "A spanning tree of n nodes has exactly n − 1 edges and no cycles. The **cut property** says: the cheapest edge crossing any split of the nodes is safe to include. Kruskal applies it globally (sorted edges + union-find); Prim applies it to the split “tree so far vs everything else”. For dense graphs with implicit edges (like all pairs of points), the O(n²) array version of Prim is simplest.",
  analogy: "Laying fibre between towns on a budget: always lay the cheapest remaining cable that links two towns not already connected, and stop when every town is on the network.",
  flavours: [["Algorithm", "Best for", "Cost"], [
    ["**Kruskal**", "explicit edge lists", "O(E log E) sort + near-O(1) unions"],
    ["**Prim (heap)**", "adjacency lists", "O(E log V)"],
    ["**Prim (array)**", "dense / complete graphs (all pairs of points)", "O(V²)"],
    ["**Virtual node**", "each node can also “buy its own” connection", "add node 0 with an edge of that cost"]]],
  signals: [["“Minimum cost to connect all …”", "cities, points, houses, computers"], ["Every node must end up connected; total cost matters", "not a path between two nodes"], ["Choose which pipes / cables / roads to build", "spanning tree"]],
  not: "**Not this pattern** for the cheapest route between two specific nodes (→ shortest paths), or when connections are free and you only count groups (→ union-find).",
  templates: [
    ["Kruskal", "kruskal.py", `def kruskal(n, edges):                    # edges: [u, v, w]
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:                       # joins two different trees: safe
            parent[ru] = rv
            total += w
            used += 1
    return total if used == n - 1 else -1  # -1: graph not connected

print(kruskal(4, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4], [1, 3, 5]]))`, "7"],
    ["Prim on points", "prim.py", `def connect_points(points):               # complete graph, Manhattan costs
    n = len(points)
    in_tree = [False] * n
    best = [float("inf")] * n
    best[0] = 0
    total = 0
    for _ in range(n):
        u = min((i for i in range(n) if not in_tree[i]), key=best.__getitem__)
        in_tree[u] = True
        total += best[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1])
                if d < best[v]:
                    best[v] = d
    return total

print(connect_points([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]))`, "20"]
  ],
  examples: [
    { t: "Min Cost to Connect All Points", d: "Medium", lc: "min-cost-to-connect-all-points", f: "Prim (array)",
      q: "Points on a plane; connecting two costs their Manhattan distance. Minimum total to connect all.",
      idea: "The graph is complete (n² edges), so array-based Prim in O(n²) beats sorting all edges.",
      code: `def min_cost(points):
    n = len(points)
    dist = [float("inf")] * n
    dist[0], seen, total = 0, set(), 0
    for _ in range(n):
        u = min((i for i in range(n) if i not in seen), key=lambda i: dist[i])
        seen.add(u); total += dist[u]
        for v in range(n):
            if v not in seen:
                dist[v] = min(dist[v], abs(points[u][0] - points[v][0]) + abs(points[u][1] - points[v][1]))
    return total

print(min_cost([[3, 12], [-2, 5], [-4, 1]]))`, out: "18", cx: "O(n²)" }
  ],
  pitfalls: [
    ["Forgetting to check connectivity", "If fewer than n − 1 edges were used, the graph isn't connected."],
    ["Sorting all n² edges of a complete graph", "That's O(n² log n) memory-heavy; array Prim is O(n²) with O(n) memory."],
    ["Confusing MST with shortest paths", "MST minimises the total network cost, not the distance between two nodes."],
    ["Missing the virtual-node trick", "“Build a well here or pipe from a neighbour” = edge to an extra node 0."]
  ],
  edge: ["Single node (cost 0)", "Disconnected graph", "Duplicate edges with different weights", "All weights equal", "Zero-cost edges"],
  compare: [
    ["Union-Find", "union-find", "Kruskal is union-find plus “process edges cheapest first”."],
    ["Shortest Paths", "shortest-paths", "Prim's loop looks like Dijkstra, but the key is the single edge cost, not the distance from the source."],
    ["Greedy", "greedy", "MST algorithms are the classic proven-correct greedy algorithms (cut property)."]
  ],
  mcq: [
    ["How many edges does a spanning tree on n nodes have?", ["n", "n − 1", "n + 1", "n²"], 1, "Any tree on n nodes has exactly n − 1 edges."],
    ["Kruskal skips an edge when…", ["It's the most expensive so far", "Its endpoints are already connected (it would form a cycle)", "It touches a leaf", "Never"], 1, "union-find tells you when both ends already share a root."]
  ],
  summary: {
    oneLine: "Kruskal: cheapest edges first, skip cycles (union-find). Prim: grow one tree with the cheapest outgoing edge.",
    signals: ["Minimum cost to connect all", "Choose cables / pipes / roads", "Complete graph of points → array Prim"],
    template: `for u, v, w in sorted(edges, key=lambda e: e[2]):
    if find(u) != find(v):
        union(u, v)
        total += w
        used += 1
return total if used == n - 1 else -1`,
    pitfalls: ["Check n − 1 edges used", "Array Prim for complete graphs", "Virtual node for “build your own”"],
    cx: "O(E log E) (Kruskal) · O(V²) (array Prim)",
    drill: { task: "Return the total weight of a minimum spanning tree of the undirected graph (nodes `0..n−1`, edges `[u, v, w]`), or -1 if it isn't connected.",
      ref: `def mst_cost(n, edges):
    parent = list(range(n))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = used = 0
    for u, v, w in sorted(edges, key=lambda e: e[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            total += w
            used += 1
    return total if used == n - 1 else -1`,
      tests: [["4, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4]]", "7"], ["3, [[0, 1, 5]]", "-1"], ["1, []", "0"]] }
  },
  problems: [
    { id: "cable-budget", title: "Cable Budget", d: "Medium", lc: "connecting-cities-with-minimum-cost",
      statement: "Cities are labelled `1..n`. `options[i] = [a, b, cost]` is a possible two-way cable. Return the minimum total cost to connect all cities, or -1 if impossible.",
      examples: [["3, [[1, 2, 5], [1, 3, 6], [2, 3, 1]]", "6", "Cables 2–3 and 1–2."], ["4, [[1, 2, 3], [3, 4, 4]]", "-1", ""]],
      constraints: ["1 ≤ n ≤ 10⁴", "1 ≤ len(options) ≤ 10⁴"],
      hints: ["Sort the options by cost.", "Add a cable if it joins two different groups (union-find).", "Check that n − 1 cables were used."],
      solution: `def cable_budget(n, options):
    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = used = 0
    for a, b, c in sorted(options, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += c
            used += 1
    return total if used == n - 1 else -1`,
      why: "Kruskal: cheapest safe cable each time; union-find rejects cables that would only close a loop.", time: "O(E log E)",
      hidden: [["1, []", "0"], ["2, [[1, 2, 7], [1, 2, 3]]", "3"], ["10000, [[i, i + 1, 1] for i in range(1, 10000)]", "9999"]] },
    { id: "wire-the-points", title: "Wire the Points", d: "Medium", lc: "min-cost-to-connect-all-points",
      statement: "Wiring points `[x1, y1]` and `[x2, y2]` costs `|x1 − x2| + |y1 − y2|`. Return the minimum total cost to connect all `points` (any point can be wired to any other).",
      examples: [["[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]", "20", ""], ["[[3, 12], [-2, 5], [-4, 1]]", "18", ""]],
      constraints: ["1 ≤ len(points) ≤ 1000", "−10⁶ ≤ x, y ≤ 10⁶", "points are distinct"],
      hints: ["Every pair is a possible edge: n² edges.", "Array-based Prim: keep each point's cheapest connection to the tree so far.", "Each step adds the closest outside point and updates the others."],
      solution: `def wire_points(points):
    n = len(points)
    in_tree = [False] * n
    best = [inf] * n
    best[0] = 0
    total = 0
    for _ in range(n):
        u = -1
        for i in range(n):
            if not in_tree[i] and (u == -1 or best[i] < best[u]):
                u = i
        in_tree[u] = True
        total += best[u]
        ux, uy = points[u]
        for v in range(n):
            if not in_tree[v]:
                d = abs(ux - points[v][0]) + abs(uy - points[v][1])
                if d < best[v]:
                    best[v] = d
    return total`,
      why: "Prim with an array avoids building all n² edges; O(n²) is ideal for complete graphs.", time: "O(n²)",
      hidden: [["[[0, 0]]", "0"], ["[[0, 0], [1, 1], [1, 0], [-1, 1]]", "4"], ["[[i, 0] for i in range(1000)]", "999"]] },
    { id: "village-water", title: "Village Water", d: "Hard", lc: "optimize-water-distribution-in-a-village",
      statement: "Houses are `1..n`. Building a well at house i costs `wells[i−1]`; laying pipe `[a, b, cost]` connects two houses both ways. A house has water if it has a well or is connected to a house with water. Return the minimum total cost to give every house water.",
      examples: [["3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]]", "3", "Well at house 1, pipes 1–2 and 2–3."], ["2, [1, 1], [[1, 2, 1], [1, 2, 2]]", "2", ""]],
      constraints: ["2 ≤ n ≤ 10⁴", "0 ≤ len(pipes) ≤ 10⁴"],
      hints: ["A well is like a pipe to a shared water source.", "Add a virtual node 0 with an edge of cost wells[i−1] to each house i.", "Now it's an ordinary minimum spanning tree on n + 1 nodes."],
      solution: `def village_water(n, wells, pipes):
    edges = [[0, i + 1, w] for i, w in enumerate(wells)] + pipes
    parent = list(range(n + 1))
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x
    total = 0
    for a, b, c in sorted(edges, key=lambda e: e[2]):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[ra] = rb
            total += c
    return total`,
      why: "The virtual source turns “build a well” into an ordinary edge, so Kruskal finds the cheapest mix of wells and pipes.", time: "O(E log E)",
      hidden: [["1, [5], []", "5"], ["3, [10, 10, 1], [[1, 2, 1], [2, 3, 1]]", "3"], ["10000, [10**5] * 10000, [[i, i + 1, 1] for i in range(1, 10000)]", "109999"]] }
  ]
});
