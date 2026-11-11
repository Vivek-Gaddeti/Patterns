PAT("multi-source-bfs", {
  time: "O(V + E)", space: "O(V)",
  lede: "Put **every** source into the BFS queue at distance 0, then run one ordinary BFS. Each cell is reached first by its nearest source, so one pass gives every distance.",
  idea: "“Distance from each cell to the nearest gate / zero / rotten orange” looks like one BFS per source, which is O(k · V). But imagine a virtual super-source connected to all real sources: one BFS from it is the same as starting the queue with all of them. Layers of the BFS are then “minute 1, minute 2, …” of something spreading from every source at once.",
  analogy: "Several stones dropped into a pond at the same moment: the ripples spread together, and each spot on the water is hit first by the ripple of the closest stone.",
  signals: [["Something **spreads** from many places at once", "rotting, fire, infection, flooding"], ["“Distance to the **nearest** X” for every cell", "gates, zeros, land, water"], ["“Minimum minutes / steps until everything is …”", "BFS layers = time"], ["Two regions: distance from one to the other", "start from all cells of the first"]],
  not: "**Not this pattern** when there's a single source (plain BFS), when steps have different costs (→ Dijkstra), or you need connectivity rather than distances (→ DFS / union-find).",
  templates: [
    ["Many sources at once", "multi_bfs.py", `from collections import deque

def nearest_zero(grid):
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0:
                dist[r][c] = 0
                q.append((r, c))               # every source starts at distance 0
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist

print(nearest_zero([[0, 0, 0], [0, 1, 0], [1, 1, 1]]))`, "[[0, 0, 0], [0, 1, 0], [1, 2, 1]]"]
  ],
  examples: [
    { t: "Rotting Oranges", d: "Medium", lc: "rotting-oranges", f: "Spreading",
      q: "Each minute, fresh oranges next to rotten ones rot. Minutes until none are fresh, or −1.",
      idea: "Queue every rotten orange at minute 0; BFS layer by layer, counting fresh ones left.",
      code: `from collections import deque

def oranges(g):
    R, C = len(g), len(g[0])
    q = deque((r, c) for r in range(R) for c in range(C) if g[r][c] == 2)
    fresh = sum(row.count(1) for row in g)
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and g[nr][nc] == 1:
                    g[nr][nc] = 2; fresh -= 1; q.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes

print(oranges([[2, 1, 1], [1, 1, 0], [0, 1, 1]]), oranges([[2, 1, 1], [0, 1, 1], [1, 0, 1]]))`, out: "4 -1", cx: "O(R·C)" },
    { t: "As Far from Land as Possible", d: "Medium", lc: "as-far-from-land-as-possible", f: "Nearest source",
      q: "Water cell whose distance to the nearest land is largest; return that distance (−1 if no land or no water).",
      idea: "All land cells are sources; the last layer BFS reaches is the answer.",
      code: `from collections import deque

def max_distance(g):
    n = len(g)
    q = deque((r, c) for r in range(n) for c in range(n) if g[r][c])
    if len(q) in (0, n * n): return -1
    d = -1
    while q:
        d += 1
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and not g[nr][nc]:
                    g[nr][nc] = 1; q.append((nr, nc))
    return d

print(max_distance([[1, 0, 1], [0, 0, 0], [1, 0, 1]]))`, out: "2", cx: "O(n²)" }
  ],
  pitfalls: [
    ["Running a BFS per source", "That's O(k · V); one BFS with all sources is O(V)."],
    ["Counting minutes wrongly", "Increase the time once per **layer** (freeze `len(q)`), not per cell."],
    ["Forgetting unreachable cells", "After BFS, check whether anything is still fresh / unvisited and return −1."],
    ["Marking visited when popping", "Mark (rot, set distance) when you push, or cells get queued twice."]
  ],
  edge: ["No sources", "Nothing to reach", "Everything already a source", "Unreachable cells", "1 × 1 grid"],
  compare: [
    ["Graph DFS / BFS", "graph-traversal", "Plain BFS has one source; multi-source just seeds the queue with many."],
    ["Shortest Paths", "shortest-paths", "If edges have weights, multi-source Dijkstra (heap seeded with all sources) is the analogue."],
    ["Tree BFS", "tree-bfs", "Same layer-by-layer loop, but graphs need a visited set."]
  ],
  mcq: [
    ["Distances from every cell to the nearest gate, with many gates. Best approach?", ["BFS from each gate separately", "One BFS with every gate in the queue at distance 0", "DFS from each cell", "Dijkstra per cell"], 1, "One BFS from a virtual source connected to all gates gives every nearest distance at once."],
    ["In “rotting oranges”, when do you add a minute?", ["After each orange", "After each BFS layer", "At the start only", "When the queue is empty"], 1, "A layer is everything that rots in the same minute."]
  ],
  summary: {
    oneLine: "Seed the BFS queue with every source at distance 0; layers = time / distance.",
    signals: ["Spreading from many places at once", "Distance to the nearest X for every cell", "Minutes until everything is …"],
    template: `q = deque(all_sources)
dist = {s: 0 for s in all_sources}
while q:
    u = q.popleft()
    for v in neighbours(u):
        if v not in dist:
            dist[v] = dist[u] + 1
            q.append(v)`,
    pitfalls: ["One BFS, not one per source", "Minutes per layer", "Check unreachable leftovers"],
    cx: "O(V + E) time · O(V) space",
    drill: { task: "For each cell of the 0/1 grid, return the distance (up/down/left/right steps) to the nearest 0.",
      ref: `def nearest_zero(grid):
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0:
                dist[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist`,
      tests: [["[[0, 0, 0], [0, 1, 0], [1, 1, 1]]", "[[0, 0, 0], [0, 1, 0], [1, 2, 1]]"], ["[[0, 1, 1, 1]]", "[[0, 1, 2, 3]]"]] }
  },
  problems: [
    { id: "spoiled-fruit", title: "Spoiled Fruit", d: "Medium", lc: "rotting-oranges",
      statement: "Cells are 0 (empty), 1 (fresh fruit) or 2 (spoiled). Every minute, fresh fruit next to spoiled fruit (up/down/left/right) spoils. Return the minutes until no fresh fruit remains, or -1 if some never spoils.",
      examples: [["[[2, 1, 1], [1, 1, 0], [0, 1, 1]]", "4", ""], ["[[2, 1, 1], [0, 1, 1], [1, 0, 1]]", "-1", "The bottom-left fruit is cut off."], ["[[0, 2]]", "0", ""]],
      constraints: ["1 ≤ rows, cols ≤ 300"],
      hints: ["All spoiled fruit spreads at the same time: put every 2 in the queue first.", "Process BFS layer by layer; each layer is one minute.", "Count fresh fruit to know when you're done or stuck."],
      solution: `def spoiled_fruit(grid):
    R, C = len(grid), len(grid[0])
    q = deque((r, c) for r in range(R) for c in range(C) if grid[r][c] == 2)
    fresh = sum(row.count(1) for row in grid)
    minutes = 0
    while q and fresh:
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    q.append((nr, nc))
        minutes += 1
    return -1 if fresh else minutes`,
      why: "One BFS from all spoiled fruit at once makes each layer exactly one minute of spreading.", time: "O(R·C)",
      hidden: [["[[1]]", "-1"], ["[[2, 2], [1, 1]]", "1"], ["[[2] + [1] * 299] + [[1] * 300 for _ in range(299)]", "598"]] },
    { id: "distance-to-zero", title: "Distance to the Nearest Zero", d: "Medium", lc: "01-matrix",
      statement: "For every cell of the 0/1 grid, return the number of up/down/left/right steps to the nearest 0. At least one 0 exists.",
      examples: [["[[0, 0, 0], [0, 1, 0], [0, 0, 0]]", "[[0, 0, 0], [0, 1, 0], [0, 0, 0]]", ""], ["[[0, 0, 0], [0, 1, 0], [1, 1, 1]]", "[[0, 0, 0], [0, 1, 0], [1, 2, 1]]", ""]],
      constraints: ["1 ≤ rows · cols ≤ 10⁵"],
      hints: ["A BFS from each 1 would be too slow.", "Start one BFS from all zeros at distance 0."],
      solution: `def distance_to_zero(grid):
    R, C = len(grid), len(grid[0])
    dist = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 0:
                dist[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and dist[nr][nc] == -1:
                dist[nr][nc] = dist[r][c] + 1
                q.append((nr, nc))
    return dist`,
      why: "Every cell is first reached by the wave from its closest zero.", time: "O(R·C)",
      hidden: [["[[0]]", "[[0]]"], ["[[1, 0, 1]]", "[[1, 0, 1]]"], ["[[0] + [1] * 999] * 100", "[list(range(1000))] * 100"]] },
    { id: "rooms-to-exits", title: "Rooms to Exits", d: "Medium", lc: "walls-and-gates",
      statement: "In `rooms`, -1 is a wall, 0 is an exit, and 2147483647 is an empty room. Fill each empty room **in place** with the number of steps to its nearest exit; leave rooms that can't reach an exit as 2147483647. Return nothing; the checker reads `rooms`.",
      examples: [["[[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]]", "[[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]]", ""], ["[[-1]]", "[[-1]]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 250"],
      hints: ["All exits are sources.", "BFS only into cells that still hold 2147483647."],
      solution: `def rooms_to_exits(rooms):
    INF = 2147483647
    R, C = len(rooms), len(rooms[0])
    q = deque((r, c) for r in range(R) for c in range(C) if rooms[r][c] == 0)
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and rooms[nr][nc] == INF:
                rooms[nr][nc] = rooms[r][c] + 1
                q.append((nr, nc))`,
      conv: "args[0]",
      why: "The INF value doubles as “unvisited”; the first wave to reach a room is from its nearest exit.", time: "O(R·C)",
      hidden: [["[[0, 2147483647]]", "[[0, 1]]"], ["[[2147483647, -1, 0]]", "[[2147483647, -1, 0]]"], ["[[0] + [2147483647] * 249 for _ in range(250)]", "[list(range(250)) for _ in range(250)]"]] },
    { id: "farthest-sea", title: "Farthest From Land", d: "Medium", lc: "as-far-from-land-as-possible",
      statement: "In an `n × n` grid, 1 is land and 0 is water. Return the largest distance from any water cell to its nearest land cell, using Manhattan distance. Return -1 if there's no land or no water.",
      examples: [["[[1, 0, 1], [0, 0, 0], [1, 0, 1]]", "2", "The centre is 2 from every corner."], ["[[1, 0, 0], [0, 0, 0], [0, 0, 0]]", "4", ""]],
      constraints: ["1 ≤ n ≤ 100"],
      hints: ["All land cells are sources.", "BFS layer by layer; the number of layers you go through is the answer."],
      solution: `def farthest_sea(grid):
    n = len(grid)
    q = deque((r, c) for r in range(n) for c in range(n) if grid[r][c] == 1)
    if len(q) == 0 or len(q) == n * n:
        return -1
    d = -1
    while q:
        d += 1
        for _ in range(len(q)):
            r, c = q.popleft()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                    grid[nr][nc] = 1
                    q.append((nr, nc))
    return d`,
      why: "Grid BFS distance with 4 moves equals Manhattan distance, and the last layer is the farthest water.", time: "O(n²)",
      hidden: [["[[1]]", "-1"], ["[[0, 0], [0, 0]]", "-1"], ["[[1] + [0] * 99] + [[0] * 100 for _ in range(99)]", "198"]] },
    { id: "terrain-heights", title: "Terrain Heights", d: "Medium", lc: "map-of-highest-peak",
      statement: "`is_water[r][c]` is 1 for water. Assign heights: water must be 0, and neighbouring cells (up/down/left/right) must differ by at most 1. Make the tallest point as high as possible; return the height grid. (The answer is: each cell's distance to the nearest water.)",
      examples: [["[[0, 1], [0, 0]]", "[[1, 0], [2, 1]]", ""], ["[[0, 0, 1], [1, 0, 0], [0, 0, 0]]", "[[1, 1, 0], [0, 1, 1], [1, 2, 2]]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 1000", "at least one water cell"],
      hints: ["Heights can grow by at most 1 per step away from water.", "So the best height is the distance to the nearest water: multi-source BFS from all water."],
      solution: `def terrain_heights(is_water):
    R, C = len(is_water), len(is_water[0])
    h = [[-1] * C for _ in range(R)]
    q = deque()
    for r in range(R):
        for c in range(C):
            if is_water[r][c]:
                h[r][c] = 0
                q.append((r, c))
    while q:
        r, c = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and h[nr][nc] == -1:
                h[nr][nc] = h[r][c] + 1
                q.append((nr, nc))
    return h`,
      why: "Distance from the nearest water is both feasible (neighbours differ by ≤ 1) and the largest possible.", time: "O(R·C)",
      hidden: [["[[1]]", "[[0]]"], ["[[1, 0, 0]]", "[[0, 1, 2]]"], ["[[1] + [0] * 299 for _ in range(300)]", "[list(range(300)) for _ in range(300)]"]] },
    { id: "join-islands", title: "Join the Two Islands", d: "Medium", lc: "shortest-bridge",
      statement: "The `n × n` grid has exactly **two** islands of 1s. Return the minimum number of 0s you must turn into 1s to connect them.",
      examples: [["[[0, 1], [1, 0]]", "1", ""], ["[[0, 1, 0], [0, 0, 0], [0, 0, 1]]", "2", ""], ["[[1, 1, 1, 1, 1], [1, 0, 0, 0, 1], [1, 0, 1, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1]]", "1", ""]],
      constraints: ["2 ≤ n ≤ 100"],
      hints: ["Find one island completely (DFS) and mark it.", "Start a multi-source BFS from all its cells through water.", "The first time you touch the other island, the BFS distance is the answer."],
      solution: `def join_islands(grid):
    n = len(grid)
    start = next((r, c) for r in range(n) for c in range(n) if grid[r][c] == 1)
    q = deque()
    stack = [start]
    grid[start[0]][start[1]] = 2
    while stack:
        r, c = stack.pop()
        q.append((r, c, 0))
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 1:
                grid[nr][nc] = 2
                stack.append((nr, nc))
    while q:
        r, c, d = q.popleft()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < n and 0 <= nc < n:
                if grid[nr][nc] == 1:
                    return d
                if grid[nr][nc] == 0:
                    grid[nr][nc] = 2
                    q.append((nr, nc, d + 1))
    return -1`,
      why: "Expanding from the whole first island at once finds the shortest water crossing to the second.", time: "O(n²)",
      hidden: [["[[1, 0], [0, 1]]", "1"], ["[[1, 0, 1], [0, 0, 0], [0, 0, 0]]", "1"], ["[[1] + [0] * 98 + [1] for _ in range(100)]", "98"]] }
  ]
});
