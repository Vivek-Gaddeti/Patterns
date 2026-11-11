PAT("graph-traversal", {
  time: "O(V + E)", space: "O(V)",
  lede: "Visit everything reachable from a start, exactly once, using a visited set. DFS (stack/recursion) for “explore the whole region”; BFS (queue) when you need the **fewest steps**. A grid is just a graph whose neighbours are up, down, left and right.",
  idea: "Graphs can have cycles, so the one rule is: **mark a node visited the moment you add it**, and never add it again. Then every node and edge is handled once: O(V + E). Count connected components by starting a new search from every unvisited node. For shortest paths when every step costs 1, BFS discovers nodes in order of distance.",
  analogy: "Exploring a cave system with chalk: mark each chamber as you enter it so you never explore it twice. Exploring one tunnel to the end is DFS; sending a search party one chamber further each round is BFS.",
  flavours: [["Need", "Use", "Notes"], [
    ["**Reachability / regions / count components**", "DFS or BFS", "start from every unvisited node"],
    ["**Fewest steps (unweighted)**", "BFS", "record distance when you enqueue"],
    ["**Grid**", "neighbours via `(dr, dc)` directions", "check bounds and walls"],
    ["**Build the graph first**", "adjacency list `defaultdict(list)`", "edges list → graph"]]],
  signals: [["Grid of land / water, walls, colours", "islands, flood fill, regions"], ["“Is there a path…?”, “can you reach…?”", "reachability"], ["“Minimum number of steps / moves / transformations”", "BFS"], ["Count connected groups", "components"]],
  not: "**Not this pattern** when edges have different weights (→ Dijkstra), when you need an order that respects dependencies (→ topological sort), or the question is about merging groups over time (→ union-find).",
  templates: [
    ["Grid DFS", "islands.py", `def count_islands(grid):
    R, C = len(grid), len(grid[0])
    seen = set()
    def dfs(r, c):
        stack = [(r, c)]
        seen.add((r, c))                       # mark when you push
        while stack:
            r, c = stack.pop()
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nr, nc = r + dr, c + dc
                if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] == "1" and (nr, nc) not in seen:
                    seen.add((nr, nc))
                    stack.append((nr, nc))
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                dfs(r, c)                      # a new component
                count += 1
    return count

print(count_islands(["11000", "11000", "00100", "00011"]))`, "3"],
    ["BFS shortest steps", "bfs.py", `from collections import deque, defaultdict

def fewest_steps(n, edges, src, dst):
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b); g[b].append(a)
    dist = {src: 0}
    q = deque([src])
    while q:
        u = q.popleft()
        if u == dst:
            return dist[u]
        for v in g[u]:
            if v not in dist:                  # first visit = shortest distance
                dist[v] = dist[u] + 1
                q.append(v)
    return -1

print(fewest_steps(5, [[0, 1], [1, 2], [0, 3], [3, 4], [4, 2]], 0, 2))`, "2"]
  ],
  examples: [
    { t: "Max Area of Island", d: "Medium", lc: "max-area-of-island", f: "Grid DFS",
      q: "Largest island area (count of connected 1s).",
      idea: "DFS from each unvisited land cell, counting cells; sink visited land by setting it to 0.",
      code: `def max_area(g):
    R, C = len(g), len(g[0])
    def dfs(r, c):
        if not (0 <= r < R and 0 <= c < C) or g[r][c] != 1: return 0
        g[r][c] = 0
        return 1 + dfs(r + 1, c) + dfs(r - 1, c) + dfs(r, c + 1) + dfs(r, c - 1)
    return max((dfs(r, c) for r in range(R) for c in range(C)), default=0)

print(max_area([[1, 1, 0], [0, 1, 0], [0, 0, 1]]))`, out: "3", cx: "O(R·C)" },
    { t: "Word Ladder", d: "Hard", lc: "word-ladder", f: "BFS",
      q: "Fewest words in a transformation sequence changing one letter at a time, all in the word list.",
      idea: "Words are nodes; BFS from the start. Generate neighbours by changing each position to every letter.",
      code: `from collections import deque

def ladder(begin, end, words):
    words = set(words)
    if end not in words: return 0
    q, seen = deque([(begin, 1)]), {begin}
    while q:
        w, d = q.popleft()
        if w == end: return d
        for i in range(len(w)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                nw = w[:i] + ch + w[i + 1:]
                if nw in words and nw not in seen:
                    seen.add(nw); q.append((nw, d + 1))
    return 0

print(ladder("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]))`, out: "5", cx: "O(N · L · 26)" },
    { t: "Surrounded Regions", d: "Medium", lc: "surrounded-regions", f: "From the border",
      q: "Capture every 'O' region not connected to the border by flipping it to 'X'.",
      idea: "Instead of finding surrounded regions, find the **safe** ones: DFS from border 'O's and mark them; flip everything else.",
      code: `def solve(b):
    R, C = len(b), len(b[0])
    def dfs(r, c):
        if 0 <= r < R and 0 <= c < C and b[r][c] == "O":
            b[r][c] = "S"
            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)
    for r in range(R):
        dfs(r, 0); dfs(r, C - 1)
    for c in range(C):
        dfs(0, c); dfs(R - 1, c)
    for r in range(R):
        for c in range(C):
            b[r][c] = "O" if b[r][c] == "S" else "X"
    return ["".join(row) for row in b]

print(solve([list("XXXX"), list("XOOX"), list("XXOX"), list("XOXX")]))`, out: "['XXXX', 'XXXX', 'XXXX', 'XOXX']", cx: "O(R·C)" }
  ],
  pitfalls: [
    ["Marking visited when you pop instead of when you push", "The same node can be queued many times: slower and, for BFS, wrong distances."],
    ["Recursion depth on big grids", "A 1000×1000 grid of land overflows Python recursion: use an explicit stack or BFS."],
    ["Forgetting bounds checks", "Check `0 <= r < R and 0 <= c < C` before reading the cell."],
    ["Using DFS for shortest paths", "DFS finds *a* path, not the shortest; use BFS for unweighted distances."]
  ],
  edge: ["Empty grid / no edges", "Everything connected", "Nothing connected", "Start equals end", "Disconnected graph"],
  compare: [
    ["Multi-source BFS", "multi-source-bfs", "When distances are measured from the nearest of many sources, start the queue with all of them."],
    ["Union-Find", "union-find", "Counting components while edges arrive over time is easier with union-find."],
    ["Shortest Paths", "shortest-paths", "Weighted edges need Dijkstra; plain BFS only works when every edge costs the same."]
  ],
  mcq: [
    ["When should a BFS mark a node as visited?", ["When it is popped", "When it is pushed (discovered)", "At the end", "Never"], 1, "Marking on push guarantees each node enters the queue once, with its shortest distance."],
    ["Fewest moves between two cells in a grid where each move costs 1:", ["DFS", "BFS", "Dijkstra", "Union-Find"], 1, "BFS explores cells in increasing distance, so the first time you reach the target is optimal."]
  ],
  summary: {
    oneLine: "Visited set + DFS (explore regions) or BFS (fewest steps). Grids are graphs with 4 neighbours.",
    signals: ["Islands / regions / flood fill", "Is there a path / can you reach", "Fewest steps, unweighted", "Count components"],
    template: `seen = {start}
q = deque([start])
while q:
    u = q.popleft()
    for v in neighbours(u):
        if v not in seen:
            seen.add(v)
            q.append(v)`,
    pitfalls: ["Mark on push", "Explicit stack for huge grids", "Bounds checks", "BFS for shortest"],
    cx: "O(V + E) time · O(V) space",
    drill: { task: "Count the islands (groups of horizontally/vertically connected '1's) in a grid of strings.",
      ref: `def islands(grid):
    R, C = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1
                stack = [(r, c)]
                seen.add((r, c))
                while stack:
                    x, y = stack.pop()
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == "1" and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            stack.append((nx, ny))
    return count`,
      tests: [["['11000', '11000', '00100', '00011']", "3"], ["['111', '010', '111']", "1"], ["['0']", "0"]] }
  },
  problems: [
    { id: "paint-bucket", title: "Paint Bucket", d: "Easy", lc: "flood-fill",
      statement: "Starting at pixel `(sr, sc)`, recolour it and every pixel connected to it (up/down/left/right) that has the **same original colour** with `color`. Return the image.",
      examples: [["[[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2", "[[2, 2, 2], [2, 2, 0], [2, 0, 1]]", ""], ["[[0, 0, 0], [0, 0, 0]], 0, 0, 0", "[[0, 0, 0], [0, 0, 0]]", "Already that colour."]],
      constraints: ["1 ≤ rows, cols ≤ 50"],
      hints: ["DFS/BFS from the start, only through cells of the original colour.", "If the new colour equals the original, return immediately (or you'd loop forever)."],
      solution: `def paint_bucket(image, sr, sc, color):
    old = image[sr][sc]
    if old == color:
        return image
    R, C = len(image), len(image[0])
    stack = [(sr, sc)]
    image[sr][sc] = color
    while stack:
        r, c = stack.pop()
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < R and 0 <= nc < C and image[nr][nc] == old:
                image[nr][nc] = color
                stack.append((nr, nc))
    return image`,
      why: "Recolouring a cell also marks it visited, so each pixel is processed once.", time: "O(R·C)",
      hidden: [["[[5]], 0, 0, 3", "[[3]]"], ["[[1, 2], [2, 1]], 0, 0, 9", "[[9, 2], [2, 1]]"], ["[[1] * 50 for _ in range(50)], 25, 25, 7", "[[7] * 50 for _ in range(50)]"]] },
    { id: "coast-length", title: "Coastline Length", d: "Easy", lc: "island-perimeter",
      statement: "`grid` has exactly one island of 1s (no lakes inside it). Return the length of its perimeter, counting each unit edge between land and water (or the map border).",
      examples: [["[[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]", "16", ""], ["[[1]]", "4", ""]],
      constraints: ["1 ≤ rows, cols ≤ 100"],
      hints: ["Each land cell contributes 4 edges.", "Subtract 2 for every pair of adjacent land cells (one shared edge each)."],
      solution: `def coast_length(grid):
    R, C = len(grid), len(grid[0])
    total = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c]:
                total += 4
                if r and grid[r - 1][c]:
                    total -= 2
                if c and grid[r][c - 1]:
                    total -= 2
    return total`,
      why: "Counting 4 per cell and subtracting shared edges avoids any search.", time: "O(R·C)",
      hidden: [["[[1, 0]]", "4"], ["[[1, 1], [1, 1]]", "8"], ["[[1] * 100 for _ in range(100)]", "400"]] },
    { id: "route-exists", title: "Route Exists?", d: "Easy", lc: "find-if-path-exists-in-graph",
      statement: "An undirected graph has nodes `0..n−1` and `edges`. Return `True` if there's a path from `src` to `dst`.",
      examples: [["3, [[0, 1], [1, 2], [2, 0]], 0, 2", "True", ""], ["6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5", "False", ""]],
      constraints: ["1 ≤ n ≤ 2·10⁵", "0 ≤ len(edges) ≤ 2·10⁵"],
      hints: ["Build an adjacency list.", "BFS or iterative DFS from src with a visited set."],
      solution: `def route_exists(n, edges, src, dst):
    g = defaultdict(list)
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    seen = {src}
    stack = [src]
    while stack:
        u = stack.pop()
        if u == dst:
            return True
        for v in g[u]:
            if v not in seen:
                seen.add(v)
                stack.append(v)
    return False`,
      why: "Every node and edge is visited at most once.", time: "O(V + E)",
      hidden: [["1, [], 0, 0", "True"], ["2, [], 0, 1", "False"], ["200000, [[i, i + 1] for i in range(199999)], 0, 199999", "True"]] },
    { id: "island-count", title: "Count the Islands", d: "Medium", lc: "number-of-islands",
      statement: "`grid` is a list of strings of `'1'` (land) and `'0'` (water). Return the number of islands: groups of land connected horizontally or vertically.",
      examples: [["['11110', '11010', '11000', '00000']", "1", ""], ["['11000', '11000', '00100', '00011']", "3", ""]],
      constraints: ["1 ≤ rows, cols ≤ 300"],
      hints: ["Scan every cell; an unvisited land cell starts a new island.", "Flood the whole island from it (DFS/BFS) so you don't count it again.", "Use an explicit stack: deep recursion can overflow on big islands."],
      solution: `def island_count(grid):
    R, C = len(grid), len(grid[0])
    seen = set()
    count = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1" and (r, c) not in seen:
                count += 1
                stack = [(r, c)]
                seen.add((r, c))
                while stack:
                    x, y = stack.pop()
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == "1" and (nx, ny) not in seen:
                            seen.add((nx, ny))
                            stack.append((nx, ny))
    return count`,
      why: "Each island is flooded once from its first cell; every cell is processed once overall.", time: "O(R·C)",
      hidden: [["['0']", "0"], ["['1']", "1"], ["['10' * 150] * 300", "150"], ["['1' * 300] * 300", "1"]] },
    { id: "biggest-island", title: "Biggest Island", d: "Medium", lc: "max-area-of-island",
      statement: "`grid` holds 0s and 1s. Return the area (number of cells) of the largest island of horizontally/vertically connected 1s, or 0 if there's no land.",
      examples: [["[[0, 0, 1, 0, 0], [0, 1, 1, 0, 0], [0, 1, 0, 0, 1], [1, 0, 0, 1, 1]]", "4", ""], ["[[0, 0, 0, 0]]", "0", ""]],
      constraints: ["1 ≤ rows, cols ≤ 300"],
      hints: ["Flood each island, counting cells.", "Mark cells as visited (or set them to 0) so they're counted once."],
      solution: `def biggest_island(grid):
    R, C = len(grid), len(grid[0])
    best = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == 1:
                grid[r][c] = 0
                stack, area = [(r, c)], 0
                while stack:
                    x, y = stack.pop()
                    area += 1
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                        if 0 <= nx < R and 0 <= ny < C and grid[nx][ny] == 1:
                            grid[nx][ny] = 0
                            stack.append((nx, ny))
                best = max(best, area)
    return best`,
      why: "Sinking land as you visit it doubles as the visited set.", time: "O(R·C)",
      hidden: [["[[1]]", "1"], ["[[1, 0, 1]]", "1"], ["[[1] * 300 for _ in range(300)]", "90000"]] },
    { id: "unlock-rooms", title: "Unlock Every Room", d: "Medium", lc: "keys-and-rooms",
      statement: "Rooms `0..n−1` are locked except room 0. `rooms[i]` lists the keys found inside room i (each key opens one room). Return `True` if you can enter every room.",
      examples: [["[[1], [2], [3], []]", "True", ""], ["[[1, 3], [3, 0, 1], [2], [0]]", "False", "Room 2's key is only inside room 2."]],
      constraints: ["2 ≤ n ≤ 1000", "total keys ≤ 3000"],
      hints: ["Rooms are nodes, keys are edges.", "DFS/BFS from room 0 and check how many rooms you reached."],
      solution: `def unlock_rooms(rooms):
    seen = {0}
    stack = [0]
    while stack:
        r = stack.pop()
        for k in rooms[r]:
            if k not in seen:
                seen.add(k)
                stack.append(k)
    return len(seen) == len(rooms)`,
      why: "Reachability from room 0 in the key graph is exactly the set of rooms you can open.", time: "O(V + E)",
      hidden: [["[[1], []]", "True"], ["[[], [0]]", "False"], ["[[i + 1] for i in range(999)] + [[]]", "True"]] },
    { id: "capture-regions", title: "Capture Enclosed Regions", d: "Medium", lc: "surrounded-regions",
      statement: "`board` is a list of lists of `'X'` and `'O'`. Flip every `'O'` that is **not** connected (up/down/left/right) to an `'O'` on the border into `'X'`, in place. Return nothing; the checker reads `board`.",
      examples: [["[list('XXXX'), list('XOOX'), list('XXOX'), list('XOXX')]", "[list('XXXX'), list('XXXX'), list('XXXX'), list('XOXX')]", "The bottom 'O' touches the border."], ["[['X']]", "[['X']]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 200"],
      hints: ["Finding enclosed regions directly is awkward; find the safe ones instead.", "Flood from every border 'O' and mark it safe.", "Then flip all unmarked 'O's to 'X' and restore the safe marks."],
      solution: `def capture(board):
    R, C = len(board), len(board[0])
    stack = [(r, c) for r in range(R) for c in (0, C - 1)] + [(r, c) for c in range(C) for r in (0, R - 1)]
    while stack:
        r, c = stack.pop()
        if 0 <= r < R and 0 <= c < C and board[r][c] == "O":
            board[r][c] = "S"
            stack += [(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)]
    for r in range(R):
        for c in range(C):
            board[r][c] = "O" if board[r][c] == "S" else "X"`,
      conv: "args[0]",
      why: "Only regions reachable from the border survive, which one flood from the border identifies.", time: "O(R·C)",
      hidden: [["[['O']]", "[['O']]"], ["[list('XXX'), list('XOX'), list('XXX')]", "[list('XXX'), list('XXX'), list('XXX')]"], ["[['O'] * 200 for _ in range(200)]", "[['O'] * 200 for _ in range(200)]"]] },
    { id: "two-oceans", title: "Water to Both Oceans", d: "Medium", lc: "pacific-atlantic-water-flow",
      statement: "Rain on cell `(r, c)` flows to a neighbour (up/down/left/right) whose height is **≤** the current one. The west ocean touches the left and top edges; the east ocean touches the right and bottom edges. Return all cells `[r, c]` from which water can reach **both** oceans, sorted.",
      examples: [["[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]", "[[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]", ""], ["[[1]]", "[[0, 0]]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 200"],
      hints: ["Reverse the flow: from each ocean, climb to neighbours that are **≥** the current height.", "Run one search from each ocean's border.", "Answer = cells reached by both."],
      solution: `def two_oceans(h):
    R, C = len(h), len(h[0])
    def reach(starts):
        seen = set(starts)
        stack = list(starts)
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
                if 0 <= nr < R and 0 <= nc < C and (nr, nc) not in seen and h[nr][nc] >= h[r][c]:
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return seen
    west = reach([(r, 0) for r in range(R)] + [(0, c) for c in range(C)])
    east = reach([(r, C - 1) for r in range(R)] + [(R - 1, c) for c in range(C)])
    return sorted([r, c] for r, c in west & east)`,
      why: "Two reverse floods, one per ocean, replace a separate search from every cell.", time: "O(R·C)",
      hidden: [["[[1, 1], [1, 1]]", "[[0, 0], [0, 1], [1, 0], [1, 1]]"], ["[[3, 3, 3], [3, 1, 3], [0, 2, 4]]", "[[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]]"], ["[[5] * 200 for _ in range(200)]", "[[r, c] for r in range(200) for c in range(200)]"]] },
    { id: "clear-path", title: "Clear Path Out", d: "Medium", lc: "shortest-path-in-binary-matrix",
      statement: "In an `n × n` grid of 0s (open) and 1s (blocked), you may move in **8 directions**. Return the number of cells on the shortest clear path from the top-left to the bottom-right cell, or -1 if there is none.",
      examples: [["[[0, 1], [1, 0]]", "2", ""], ["[[0, 0, 0], [1, 1, 0], [1, 1, 0]]", "4", ""], ["[[1, 0, 0], [1, 1, 0], [1, 1, 0]]", "-1", "Start is blocked."]],
      constraints: ["1 ≤ n ≤ 100"],
      hints: ["Fewest cells → BFS.", "Neighbours are all 8 directions.", "Check the start and end cells are open."],
      solution: `def clear_path(grid):
    n = len(grid)
    if grid[0][0] or grid[n - 1][n - 1]:
        return -1
    q = deque([(0, 0, 1)])
    grid[0][0] = 1
    while q:
        r, c, d = q.popleft()
        if r == n - 1 and c == n - 1:
            return d
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                nr, nc = r + dr, c + dc
                if 0 <= nr < n and 0 <= nc < n and grid[nr][nc] == 0:
                    grid[nr][nc] = 1
                    q.append((nr, nc, d + 1))
    return -1`,
      why: "BFS reaches each cell first along a shortest path; marking cells blocked when enqueued avoids repeats.", time: "O(n²)",
      hidden: [["[[0]]", "1"], ["[[0, 0], [0, 1]]", "-1"], ["[[0] * 100 for _ in range(100)]", "100"]] },
    { id: "word-steps", title: "Word Steps", d: "Hard", lc: "word-ladder",
      statement: "Change `start` into `goal` one letter at a time; every intermediate word must be in `words` (`start` need not be). Return the number of words in the **shortest** such sequence, including `start` and `goal`, or 0 if impossible.",
      examples: [["'hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']", "5", "hit → hot → dot → dog → cog"], ["'hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']", "0", "cog isn't in the list."]],
      constraints: ["1 ≤ word length ≤ 10", "1 ≤ len(words) ≤ 5000", "lowercase letters"],
      hints: ["Words are nodes; one-letter changes are edges.", "BFS from start gives the fewest steps.", "Generate neighbours by changing each position to each letter and checking a set."],
      solution: `def word_steps(start, goal, words):
    words = set(words)
    if goal not in words:
        return 0
    q = deque([(start, 1)])
    seen = {start}
    while q:
        w, d = q.popleft()
        if w == goal:
            return d
        for i in range(len(w)):
            for ch in "abcdefghijklmnopqrstuvwxyz":
                nw = w[:i] + ch + w[i + 1:]
                if nw in words and nw not in seen:
                    seen.add(nw)
                    q.append((nw, d + 1))
    return 0`,
      why: "BFS on the implicit word graph; neighbours are generated in O(26 · L) instead of comparing against every word.", time: "O(N · L · 26)",
      hidden: [["'a', 'c', ['a', 'b', 'c']", "2"], ["'hot', 'dog', ['hot', 'dog']", "0"], ["'aaaa', 'zzzz', [c * 4 for c in 'abcdefghijklmnopqrstuvwxyz'] + ['zaaa', 'zzaa', 'zzza']", "5"]] }
  ]
});
