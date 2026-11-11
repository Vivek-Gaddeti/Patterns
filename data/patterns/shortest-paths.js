PAT("shortest-paths", {
  time: "O(E log V)", space: "O(V + E)",
  lede: "When edges have different (non-negative) costs, BFS isn't enough. Dijkstra always expands the closest unfinished node next, using a min-heap. Bellman-Ford handles limits on the number of edges (and negative weights). Floyd–Warshall gives all pairs for small graphs.",
  idea: "Keep the best known distance to every node. Repeatedly pop the node with the **smallest tentative distance** from a heap: with non-negative weights nothing can improve it later, so it's final. Relax its edges (`dist[v] = min(dist[v], dist[u] + w)`) and push improvements. Stale heap entries are skipped when popped. Variations change what “distance” means: maximum probability, minimum of the maximum step (minimax), or 0/1 weights (deque BFS).",
  analogy: "Water spreading through pipes of different lengths from a source: it reaches nearer junctions first, and once water arrives at a junction, no other route can get it there sooner.",
  flavours: [["Algorithm", "When", "Cost"], [
    ["**Dijkstra (heap)**", "non-negative weights, one source", "O(E log V)"],
    ["**Bellman-Ford (k rounds)**", "at most k edges, or negative weights", "O(k · E)"],
    ["**0-1 BFS (deque)**", "weights are only 0 or 1", "O(V + E)"],
    ["**Floyd–Warshall**", "all pairs, n ≤ ~400", "O(n³)"]]],
  signals: [["Weighted edges: times, costs, distances", "“minimum time / cost to reach”"], ["“With at most k stops / edges”", "Bellman-Ford rounds"], ["“Path whose largest step is smallest”, “max probability”", "Dijkstra with a different combine rule"], ["Distances between every pair, small n", "Floyd–Warshall"]],
  not: "**Not this pattern** when every edge costs the same (→ plain BFS is simpler and O(V + E)), or you need to connect everything cheaply rather than reach one target (→ minimum spanning tree).",
  templates: [
    ["Dijkstra", "dijkstra.py", `import heapq
from collections import defaultdict

def dijkstra(n, edges, src):               # edges: [u, v, w], directed
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist = [float("inf")] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:
            continue                       # stale entry: we found better already
        for v, w in g[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heapq.heappush(heap, (dist[v], v))
    return dist

print(dijkstra(4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1], [2, 3, 5]], 0))`, "[0, 3, 1, 4]"],
    ["Bellman-Ford (k edges)", "bellman.py", `def cheapest_with_k_edges(n, edges, src, dst, k):
    dist = [float("inf")] * n
    dist[src] = 0
    for _ in range(k):                     # each round allows one more edge
        new = dist[:]                      # read from the previous round only
        for u, v, w in edges:
            if dist[u] + w < new[v]:
                new[v] = dist[u] + w
        dist = new
    return dist[dst] if dist[dst] < float("inf") else -1

print(cheapest_with_k_edges(3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 2))`, "200"]
  ],
  examples: [
    { t: "Network Delay Time", d: "Medium", lc: "network-delay-time", f: "Dijkstra",
      q: "Signal starts at node k. Time until all nodes receive it (−1 if some never do).",
      idea: "Dijkstra from k; the answer is the largest final distance.",
      code: `import heapq

def delay(times, n, k):
    g = [[] for _ in range(n + 1)]
    for u, v, w in times: g[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heapq.heappop(heap)
        if u in dist: continue
        dist[u] = d
        for v, w in g[u]:
            if v not in dist: heapq.heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1

print(delay([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2))`, out: "2", cx: "O(E log V)" },
    { t: "Path With Minimum Effort", d: "Medium", lc: "path-with-minimum-effort", f: "Minimax Dijkstra",
      q: "Grid of heights; effort of a path = largest height difference between consecutive cells. Minimise it.",
      idea: "Dijkstra where a path's cost is `max(cost so far, step)` instead of a sum.",
      code: `import heapq

def min_effort(h):
    R, C = len(h), len(h[0])
    best = [[float("inf")] * C for _ in range(R)]
    best[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        e, r, c = heapq.heappop(heap)
        if (r, c) == (R - 1, C - 1): return e
        if e > best[r][c]: continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C:
                ne = max(e, abs(h[nr][nc] - h[r][c]))
                if ne < best[nr][nc]:
                    best[nr][nc] = ne; heapq.heappush(heap, (ne, nr, nc))

print(min_effort([[1, 2, 2], [3, 8, 2], [5, 3, 5]]))`, out: "2", cx: "O(RC log RC)" }
  ],
  pitfalls: [
    ["Using Dijkstra with negative edges", "A finished node could later get cheaper; use Bellman-Ford."],
    ["Not skipping stale heap entries", "Without `if d > dist[u]: continue`, you redo work (still correct, but slower)."],
    ["Bellman-Ford with k stops updating in place", "Copy the array each round, or paths with more than k edges sneak in."],
    ["Using BFS on weighted graphs", "BFS counts edges, not total weight."]
  ],
  edge: ["Unreachable nodes", "Source equals target", "Zero-weight edges", "Multiple edges between the same pair", "Self-loops"],
  compare: [
    ["Graph DFS / BFS", "graph-traversal", "All edges equal → BFS. Different weights → Dijkstra."],
    ["Minimum Spanning Tree", "mst", "MST minimises the total cost to connect **everything**, not the distance from one source."],
    ["Binary Search on the Answer", "binary-search-answer", "Minimax paths can also be solved by binary-searching the limit and checking reachability."]
  ],
  mcq: [
    ["Why can Dijkstra finalise a node when it's popped?", ["The heap is sorted", "With non-negative weights, no later path can be shorter", "It's popped once", "Because of BFS order"], 1, "Every other route goes through a node at least as far away, and weights can't reduce it."],
    ["Cheapest flight with at most k stops. Which approach?", ["Plain Dijkstra on cost", "Bellman-Ford for k + 1 rounds (or Dijkstra with stops in the state)", "BFS on edge count only", "Union-find"], 1, "The edge limit must be part of the state; k + 1 relaxation rounds enforce it."]
  ],
  summary: {
    oneLine: "Dijkstra: pop the closest node from a min-heap, relax its edges, skip stale entries.",
    signals: ["Weighted edges, minimum cost / time", "At most k stops (Bellman-Ford)", "Minimax / max-probability paths", "All pairs on small graphs (Floyd)"],
    template: `dist = {src: 0}
heap = [(0, src)]
while heap:
    d, u = heappop(heap)
    if d > dist.get(u, inf): continue
    for v, w in g[u]:
        if d + w < dist.get(v, inf):
            dist[v] = d + w
            heappush(heap, (d + w, v))`,
    pitfalls: ["No negative weights", "Skip stale entries", "Copy arrays in Bellman-Ford rounds"],
    cx: "O(E log V) time · O(V + E) space",
    drill: { task: "Directed weighted `edges` `[u, v, w]` on nodes `0..n−1`. Return the list of shortest distances from `src` (use -1 for unreachable).",
      ref: `def shortest(n, edges, src):
    g = defaultdict(list)
    for u, v, w in edges:
        g[u].append((v, w))
    dist = [inf] * n
    dist[src] = 0
    heap = [(0, src)]
    while heap:
        d, u = heappop(heap)
        if d > dist[u]:
            continue
        for v, w in g[u]:
            if d + w < dist[v]:
                dist[v] = d + w
                heappush(heap, (dist[v], v))
    return [x if x < inf else -1 for x in dist]`,
      tests: [["4, [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 1]], 0", "[0, 3, 1, 4]"], ["3, [[0, 1, 1]], 0", "[0, 1, -1]"]] }
  },
  problems: [
    { id: "signal-spread", title: "Signal Spread", d: "Medium", lc: "network-delay-time",
      statement: "`times[i] = [u, v, w]`: a signal travels from node u to node v in w time (directed). Nodes are `1..n`. A signal starts at node `k`. Return the time until every node has received it, or -1 if some never will.",
      examples: [["[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2", "2", ""], ["[[1, 2, 1]], 2, 1", "1", ""], ["[[1, 2, 1]], 2, 2", "-1", ""]],
      constraints: ["1 ≤ n ≤ 100", "1 ≤ len(times) ≤ 6000", "0 ≤ w ≤ 100"],
      hints: ["Shortest arrival time at every node from k: Dijkstra.", "The answer is the largest of those times."],
      solution: `def signal_spread(times, n, k):
    g = [[] for _ in range(n + 1)]
    for u, v, w in times:
        g[u].append((v, w))
    dist = {}
    heap = [(0, k)]
    while heap:
        d, u = heappop(heap)
        if u in dist:
            continue
        dist[u] = d
        for v, w in g[u]:
            if v not in dist:
                heappush(heap, (d + w, v))
    return max(dist.values()) if len(dist) == n else -1`,
      why: "Dijkstra gives each node's earliest arrival; the slowest node determines when everyone has it.", time: "O(E log V)",
      hidden: [["[], 1, 1", "0"], ["[[1, 2, 5], [1, 3, 1], [3, 2, 1]], 3, 1", "2"], ["[[i, i + 1, 1] for i in range(1, 100)], 100, 1", "99"]] },
    { id: "budget-flights", title: "Budget Flights", d: "Medium", lc: "cheapest-flights-within-k-stops",
      statement: "`flights[i] = [a, b, price]` is a one-way flight. Return the cheapest price from `src` to `dst` using **at most `k` stops** (k + 1 flights), or -1.",
      examples: [["4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1", "700", "0 → 1 → 3"], ["3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1", "200", ""], ["3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0", "500", ""]],
      constraints: ["1 ≤ n ≤ 100", "0 ≤ len(flights) ≤ n(n−1)/2"],
      hints: ["The stop limit must be part of the search.", "Bellman-Ford: k + 1 rounds, each allowing one more flight.", "Read only last round's prices while updating (copy the array)."],
      solution: `def budget_flights(n, flights, src, dst, k):
    price = [inf] * n
    price[src] = 0
    for _ in range(k + 1):
        new = price[:]
        for a, b, p in flights:
            if price[a] + p < new[b]:
                new[b] = price[a] + p
        price = new
    return price[dst] if price[dst] < inf else -1`,
      why: "After round i, price[v] is the cheapest cost using at most i flights.", time: "O(k · E)",
      hidden: [["2, [], 0, 1, 1", "-1"], ["2, [[0, 1, 5]], 0, 1, 0", "5"], ["100, [[i, i + 1, 1] for i in range(99)] + [[0, 99, 1000]], 0, 99, 98", "99"]] },
    { id: "gentle-hike", title: "Gentle Hike", d: "Medium", lc: "path-with-minimum-effort",
      statement: "`heights` is a grid. Walk from the top-left to the bottom-right moving up/down/left/right. A route's *effort* is the largest absolute height difference between two consecutive cells on it. Return the minimum possible effort.",
      examples: [["[[1, 2, 2], [3, 8, 2], [5, 3, 5]]", "2", ""], ["[[1, 2, 3], [3, 8, 4], [5, 3, 5]]", "1", ""]],
      constraints: ["1 ≤ rows, cols ≤ 100"],
      hints: ["It's a shortest path where the cost of a route is a maximum, not a sum.", "Dijkstra still works: new cost = max(cost so far, this step)."],
      solution: `def gentle_hike(heights):
    R, C = len(heights), len(heights[0])
    best = [[inf] * C for _ in range(R)]
    best[0][0] = 0
    heap = [(0, 0, 0)]
    while heap:
        e, r, c = heappop(heap)
        if (r, c) == (R - 1, C - 1):
            return e
        if e > best[r][c]:
            continue
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C:
                ne = max(e, abs(heights[nr][nc] - heights[r][c]))
                if ne < best[nr][nc]:
                    best[nr][nc] = ne
                    heappush(heap, (ne, nr, nc))`,
      why: "max is monotone like +, so the first time the target is popped its effort is minimal.", time: "O(RC log RC)",
      hidden: [["[[5]]", "0"], ["[[1, 10, 6, 7, 9, 10, 4, 9]]", "9"], ["[[r * 100 + c for c in range(100)] for r in range(100)]", "100"]] },
    { id: "safest-route", title: "Safest Route", d: "Medium", lc: "path-with-maximum-probability",
      statement: "Undirected edge `edges[i]` succeeds with probability `prob[i]`. Return the highest probability of getting from `start` to `end` (0 if impossible). The checker rounds to 5 decimal places.",
      examples: [["3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2", "0.25", ""], ["3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2", "0.3", ""], ["3, [[0, 1]], [0.5], 0, 2", "0", ""]],
      constraints: ["2 ≤ n ≤ 10⁴", "0 ≤ len(edges) ≤ 2·10⁴"],
      hints: ["Probabilities multiply and only shrink along a path.", "Dijkstra with a max-heap on probability (push negatives)."],
      solution: `def safest_route(n, edges, prob, start, end):
    g = defaultdict(list)
    for (a, b), p in zip(edges, prob):
        g[a].append((b, p))
        g[b].append((a, p))
    best = [0.0] * n
    best[start] = 1.0
    heap = [(-1.0, start)]
    while heap:
        p, u = heappop(heap)
        p = -p
        if u == end:
            return p
        if p < best[u]:
            continue
        for v, q in g[u]:
            if p * q > best[v]:
                best[v] = p * q
                heappush(heap, (-best[v], v))
    return 0`,
      conv: "round(r, 5)",
      why: "Multiplying by values ≤ 1 never increases a probability, so the Dijkstra argument holds with max instead of min.", time: "O(E log V)",
      hidden: [["2, [[0, 1]], [1.0], 0, 1", "1.0"], ["4, [[0, 1], [1, 3], [0, 2], [2, 3]], [0.9, 0.9, 0.5, 1.0], 0, 3", "0.81"], ["10000, [[i, i + 1] for i in range(9999)], [1.0] * 9999, 0, 9999", "1.0"]] },
    { id: "friendliest-city", title: "Friendliest City", d: "Medium", lc: "find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance",
      statement: "Cities `0..n−1` with undirected weighted `edges` `[a, b, w]`. For each city, count the other cities reachable within total distance `limit`. Return the city with the **fewest** such neighbours; on a tie, return the **largest** label.",
      examples: [["4, [[0, 1, 3], [1, 2, 1], [1, 3, 4], [2, 3, 1]], 4", "3", ""], ["5, [[0, 1, 2], [0, 4, 8], [1, 2, 3], [1, 4, 2], [2, 3, 1], [3, 4, 1]], 2", "0", ""]],
      constraints: ["2 ≤ n ≤ 100"],
      hints: ["You need distances between all pairs; n is small.", "Floyd–Warshall: for each k, i, j relax d[i][j] with d[i][k] + d[k][j]."],
      solution: `def friendliest_city(n, edges, limit):
    d = [[inf] * n for _ in range(n)]
    for i in range(n):
        d[i][i] = 0
    for a, b, w in edges:
        d[a][b] = d[b][a] = min(d[a][b], w)
    for k in range(n):
        for i in range(n):
            for j in range(n):
                if d[i][k] + d[k][j] < d[i][j]:
                    d[i][j] = d[i][k] + d[k][j]
    best, ans = inf, -1
    for i in range(n):
        cnt = sum(1 for j in range(n) if j != i and d[i][j] <= limit)
        if cnt <= best:
            best, ans = cnt, i
    return ans`,
      why: "Floyd–Warshall computes every pair's distance in O(n³), fine for n ≤ 100.", time: "O(n³)",
      hidden: [["2, [[0, 1, 5]], 4", "1"], ["3, [[0, 1, 1], [1, 2, 1]], 1", "2"], ["100, [[i, i + 1, 1] for i in range(99)], 10", "99"]] },
    { id: "rising-flood", title: "Rising Flood", d: "Hard", lc: "swim-in-rising-water",
      statement: "`grid[r][c]` is the elevation of each cell (all values distinct, `0..n²−1`). At time t the water level is t, and you can move between neighbouring cells (up/down/left/right) only if both are at elevation ≤ t. Return the earliest time you can get from the top-left to the bottom-right.",
      examples: [["[[0, 2], [1, 3]]", "3", ""], ["[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]", "16", ""]],
      constraints: ["1 ≤ n ≤ 50"],
      hints: ["The time needed for a route is the highest elevation on it.", "Minimise that maximum: Dijkstra with cost = max(cost so far, next elevation)."],
      solution: `def rising_flood(grid):
    n = len(grid)
    seen = {(0, 0)}
    heap = [(grid[0][0], 0, 0)]
    while heap:
        t, r, c = heappop(heap)
        if (r, c) == (n - 1, n - 1):
            return t
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heappush(heap, (max(t, grid[nr][nc]), nr, nc))`,
      why: "Always expanding the lowest reachable cell next is Dijkstra on a minimax cost.", time: "O(n² log n)",
      hidden: [["[[0]]", "0"], ["[[3, 2], [0, 1]]", "3"], ["[[r * 50 + c for c in range(50)] for r in range(50)]", "2499"]] },
    { id: "fix-the-arrows", title: "Fix the Arrows", d: "Hard", lc: "minimum-cost-to-make-at-least-one-valid-path-in-a-grid",
      statement: "Each cell holds an arrow: 1 = right, 2 = left, 3 = down, 4 = up. Starting at the top-left, you follow arrows. Changing one cell's arrow costs 1 (each cell can be changed once). Return the minimum total cost to make a path that reaches the bottom-right cell.",
      examples: [["[[1, 1, 1, 1], [2, 2, 2, 2], [1, 1, 1, 1], [2, 2, 2, 2]]", "3", ""], ["[[1, 1, 3], [3, 2, 2], [1, 1, 4]]", "0", ""], ["[[1, 2], [4, 3]]", "1", ""]],
      constraints: ["1 ≤ rows, cols ≤ 100"],
      hints: ["Moving the way the arrow points costs 0; any other direction costs 1.", "Weights are only 0 or 1: use a deque (0-1 BFS).", "Push 0-cost moves to the front and 1-cost moves to the back."],
      solution: `def fix_arrows(grid):
    R, C = len(grid), len(grid[0])
    dirs = {1: (0, 1), 2: (0, -1), 3: (1, 0), 4: (-1, 0)}
    dist = [[inf] * C for _ in range(R)]
    dist[0][0] = 0
    dq = deque([(0, 0)])
    while dq:
        r, c = dq.popleft()
        for k, (dr, dc) in dirs.items():
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C:
                w = 0 if grid[r][c] == k else 1
                if dist[r][c] + w < dist[nr][nc]:
                    dist[nr][nc] = dist[r][c] + w
                    if w == 0:
                        dq.appendleft((nr, nc))
                    else:
                        dq.append((nr, nc))
    return dist[R - 1][C - 1]`,
      why: "With 0/1 weights, a deque keeps nodes in distance order without a heap: O(V + E).", time: "O(R·C)",
      hidden: [["[[4]]", "0"], ["[[2, 2, 2], [2, 2, 2]]", "3"], ["[[1] * 100 for _ in range(100)]", "99"]] }
  ]
});
