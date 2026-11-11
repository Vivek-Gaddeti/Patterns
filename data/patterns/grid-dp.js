PAT("grid-dp", {
  time: "O(m·n)", space: "O(n)",
  lede: "When you can only move right/down (or row by row), each cell's answer comes from the cells you could have arrived from. Fill the grid in that order; keep just one row if you like.",
  idea: "dp[r][c] means “best / number of ways to reach cell (r, c)”. If moves are right and down, the last move came from above or from the left, so `dp[r][c] = f(dp[r−1][c], dp[r][c−1]) + cell`. Fill row by row; the first row and column are base cases. Because each row only reads the previous row, a single 1-D array works. Sometimes it's easier to go **backwards** from the target (dungeon game).",
  analogy: "Counting routes through a city grid where you only walk east or south: the number of routes to a junction is the routes to the junction north of it plus the routes to the junction west of it.",
  signals: [["Moves only right/down (or down to the next row)", "unique paths, min path sum, triangle"], ["“Number of ways to reach the corner”", "count paths"], ["“Largest square of 1s”", "dp from top, left, top-left"], ["Need to survive / keep a value positive along the way", "fill backwards from the end"]],
  not: "**Not this pattern** when moves can go in any direction (→ BFS / Dijkstra on the grid), or when you're counting regions (→ DFS / union-find).",
  templates: [
    ["Paths and min sums", "grid.py", `def min_path_sum(g):
    R, C = len(g), len(g[0])
    dp = [0] * C
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0:
                dp[c] = g[0][0]
            elif r == 0:
                dp[c] = dp[c - 1] + g[r][c]              # only from the left
            elif c == 0:
                dp[c] = dp[c] + g[r][c]                  # only from above
            else:
                dp[c] = min(dp[c], dp[c - 1]) + g[r][c]  # above (old dp[c]) or left
    return dp[-1]

print(min_path_sum([[1, 3, 1], [1, 5, 1], [4, 2, 1]]))`, "7"]
  ],
  examples: [
    { t: "Unique Paths II", d: "Medium", lc: "unique-paths-ii", f: "Count paths",
      q: "Number of right/down paths from top-left to bottom-right avoiding obstacles (1s).",
      idea: "ways[c] += ways[c − 1]; an obstacle resets that cell to 0.",
      code: `def paths(g):
    C = len(g[0])
    ways = [1] + [0] * (C - 1)
    for row in g:
        for c in range(C):
            if row[c]: ways[c] = 0
            elif c: ways[c] += ways[c - 1]
    return ways[-1]

print(paths([[0, 0, 0], [0, 1, 0], [0, 0, 0]]))`, out: "2", cx: "O(m·n) · O(n)" },
    { t: "Maximal Square", d: "Medium", lc: "maximal-square", f: "Three neighbours",
      q: "Area of the largest square containing only 1s.",
      idea: "side[r][c] = 1 + min(top, left, top-left) when the cell is 1: a square is limited by its three neighbours' squares.",
      code: `def maximal_square(m):
    R, C = len(m), len(m[0])
    dp = [[0] * (C + 1) for _ in range(R + 1)]
    best = 0
    for r in range(R):
        for c in range(C):
            if m[r][c] == "1":
                dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                best = max(best, dp[r + 1][c + 1])
    return best * best

print(maximal_square(["10100", "10111", "11111", "10010"]))`, out: "4", cx: "O(m·n)" },
    { t: "Dungeon Game", d: "Hard", lc: "dungeon-game", f: "Backwards",
      q: "Minimum starting health to reach the bottom-right with health always ≥ 1.",
      idea: "Going forwards you don't know what's needed later. Go backwards: need[r][c] = max(1, min(need below, need right) − cell).",
      code: `def min_health(d):
    R, C = len(d), len(d[0])
    INF = float("inf")
    need = [[INF] * (C + 1) for _ in range(R + 1)]
    need[R][C - 1] = need[R - 1][C] = 1
    for r in range(R - 1, -1, -1):
        for c in range(C - 1, -1, -1):
            need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) - d[r][c])
    return need[0][0]

print(min_health([[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]))`, out: "7", cx: "O(m·n)" }
  ],
  pitfalls: [
    ["Forgetting the first row / column", "They can only be reached from one direction."],
    ["Overwriting values you still need", "In 1-D form, `dp[c]` is “above” before you update it, and `dp[c − 1]` is already “left” in this row."],
    ["Using DP when moves can go up or left", "Then there's no fill order: it's a shortest-path problem."],
    ["Going forwards when the constraint is about the future", "Survival / minimum-start problems are easier backwards."]
  ],
  edge: ["1 × 1 grid", "Single row or column", "Obstacle on the start or end", "All obstacles", "Negative values"],
  compare: [
    ["1-D DP", "dp-1d", "Grid DP is the same idea with two indices; often compressible back to one array."],
    ["Shortest Paths", "shortest-paths", "Free movement in four directions with costs needs Dijkstra, not DP."],
    ["DP on Two Strings", "two-strings-dp", "Edit distance and LCS are grid DPs where the grid is indexed by two string positions."]
  ],
  mcq: [
    ["With right/down moves, dp[r][c] (min path sum) depends on…", ["dp[r+1][c] and dp[r][c+1]", "dp[r−1][c] and dp[r][c−1]", "All four neighbours", "Only dp[r−1][c−1]"], 1, "You arrive from above or from the left."],
    ["Why solve the dungeon game backwards?", ["It's faster", "The health needed at a cell depends on what comes after it", "To avoid recursion", "No reason"], 1, "Forward DP can't know how much buffer later cells will require."]
  ],
  summary: {
    oneLine: "Right/down moves → dp[r][c] from above and left; fill row by row, often in one array.",
    signals: ["Moves only right/down", "Count paths to a corner", "Largest square of 1s", "Minimum start value (go backwards)"],
    template: `dp = [0] * C
for r in range(R):
    for c in range(C):
        up = dp[c] if r else INF
        left = dp[c - 1] if c else INF
        dp[c] = grid[r][c] + (0 if r == c == 0 else min(up, left))`,
    pitfalls: ["Base row / column", "Read old dp[c] before overwriting", "Backwards for future constraints"],
    cx: "O(m·n) time · O(n) space",
    drill: { task: "Return the number of right/down paths from the top-left to the bottom-right of an `m × n` grid.",
      ref: `def paths(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            dp[c] += dp[c - 1]
    return dp[-1]`,
      tests: [["3, 7", "28"], ["3, 2", "3"], ["1, 1", "1"]] }
  },
  problems: [
    { id: "pascal-row", title: "Pascal Row", d: "Easy", lc: "pascals-triangle-ii",
      statement: "Return row `k` (0-indexed) of Pascal's triangle, where each number is the sum of the two above it.",
      examples: [["3", "[1, 3, 3, 1]", ""], ["0", "[1]", ""]],
      constraints: ["0 ≤ k ≤ 33"],
      hints: ["Each row comes from the previous row.", "Update in place from right to left: row[j] += row[j − 1]."],
      solution: `def pascal_row(k):
    row = [1] * (k + 1)
    for i in range(2, k + 1):
        for j in range(i - 1, 0, -1):
            row[j] += row[j - 1]
    return row`,
      why: "Going right to left reads the previous row's values before they're overwritten.", time: "O(k²)",
      hidden: [["1", "[1, 1]"], ["4", "[1, 4, 6, 4, 1]"], ["33", "[math.comb(33, i) for i in range(34)]"]] },
    { id: "corner-routes", title: "Corner Routes", d: "Medium", lc: "unique-paths",
      statement: "A robot at the top-left of an `m × n` grid moves only right or down. Return the number of different routes to the bottom-right corner.",
      examples: [["3, 7", "28", ""], ["3, 2", "3", ""]],
      constraints: ["1 ≤ m, n ≤ 100"],
      hints: ["Routes to a cell = routes to the cell above + routes to the cell to the left.", "The first row and column have exactly one route each."],
      solution: `def corner_routes(m, n):
    dp = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            dp[c] += dp[c - 1]
    return dp[-1]`,
      why: "Each row is built from the previous one, keeping only one array.", time: "O(m·n)",
      hidden: [["1, 1", "1"], ["2, 2", "2"], ["100, 100", "math.comb(198, 99)"]] },
    { id: "blocked-routes", title: "Routes Around Rocks", d: "Medium", lc: "unique-paths-ii",
      statement: "`grid` has 0 (open) and 1 (rock). Moving only right or down, count the routes from the top-left to the bottom-right that avoid rocks.",
      examples: [["[[0, 0, 0], [0, 1, 0], [0, 0, 0]]", "2", ""], ["[[0, 1], [0, 0]]", "1", ""], ["[[1]]", "0", ""]],
      constraints: ["1 ≤ m, n ≤ 100"],
      hints: ["Same as counting routes, but a rock cell has 0 routes.", "Watch out for a rock at the start."],
      solution: `def blocked_routes(grid):
    C = len(grid[0])
    ways = [0] * C
    ways[0] = 1
    for row in grid:
        for c in range(C):
            if row[c]:
                ways[c] = 0
            elif c:
                ways[c] += ways[c - 1]
    return ways[-1]`,
      why: "Rocks zero out their cell, which naturally blocks every route through them.", time: "O(m·n)",
      hidden: [["[[0]]", "1"], ["[[0, 0], [1, 1], [0, 0]]", "0"], ["[[0] * 100 for _ in range(100)]", "math.comb(198, 99)"]] },
    { id: "cheapest-walk", title: "Cheapest Walk", d: "Medium", lc: "minimum-path-sum",
      statement: "Each cell of `grid` has a non-negative cost. Moving only right or down from the top-left to the bottom-right, return the minimum total cost (including both ends).",
      examples: [["[[1, 3, 1], [1, 5, 1], [4, 2, 1]]", "7", "1 → 3 → 1 → 1 → 1"], ["[[1, 2, 3], [4, 5, 6]]", "12", ""]],
      constraints: ["1 ≤ m, n ≤ 200"],
      hints: ["dp[r][c] = grid[r][c] + min(from above, from the left).", "The first row and column only have one way in."],
      solution: `def cheapest_walk(grid):
    R, C = len(grid), len(grid[0])
    dp = [0] * C
    for r in range(R):
        for c in range(C):
            if r == 0 and c == 0:
                dp[c] = grid[0][0]
            elif r == 0:
                dp[c] = dp[c - 1] + grid[r][c]
            elif c == 0:
                dp[c] = dp[c] + grid[r][c]
            else:
                dp[c] = min(dp[c], dp[c - 1]) + grid[r][c]
    return dp[-1]`,
      why: "Every cell's best cost needs only the best costs of its two possible predecessors.", time: "O(m·n)",
      hidden: [["[[5]]", "5"], ["[[1, 2], [1, 1]]", "3"], ["[[1] * 200 for _ in range(200)]", "399"]] },
    { id: "pyramid-path", title: "Pyramid Path", d: "Medium", lc: "triangle",
      statement: "`tri` is a triangle: row i has i + 1 numbers. Start at the top; from index j you may move to index j or j + 1 of the next row. Return the minimum path sum to the bottom.",
      examples: [["[[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]", "11", "2 + 3 + 5 + 1"], ["[[-10]]", "-10", ""]],
      constraints: ["1 ≤ rows ≤ 200"],
      hints: ["Work from the bottom row upwards.", "best[j] = tri[i][j] + min(best[j], best[j + 1])."],
      solution: `def pyramid_path(tri):
    best = tri[-1][:]
    for i in range(len(tri) - 2, -1, -1):
        for j in range(i + 1):
            best[j] = tri[i][j] + min(best[j], best[j + 1])
    return best[0]`,
      why: "Bottom-up, each position already knows the best way down from both of its children.", time: "O(n²)",
      hidden: [["[[1], [2, 3]]", "3"], ["[[-1], [2, 3], [1, -1, -3]]", "-1"], ["[[1] * (i + 1) for i in range(200)]", "200"]] },
    { id: "lowest-descent", title: "Lowest Descent", d: "Medium", lc: "minimum-falling-path-sum",
      statement: "In the square grid `a`, pick one cell per row from top to bottom; each pick must be in the same column as the previous one or a neighbouring column. Return the minimum possible sum.",
      examples: [["[[2, 1, 3], [6, 5, 4], [7, 8, 9]]", "13", "1 → 5 → 7 or 1 → 4 → 8"], ["[[-19, 57], [-40, -5]]", "-59", ""]],
      constraints: ["1 ≤ n ≤ 100"],
      hints: ["dp for the current row from the previous row's three neighbours.", "Edge columns have only two neighbours."],
      solution: `def lowest_descent(a):
    n = len(a)
    prev = a[0][:]
    for r in range(1, n):
        cur = [0] * n
        for c in range(n):
            best = prev[c]
            if c:
                best = min(best, prev[c - 1])
            if c + 1 < n:
                best = min(best, prev[c + 1])
            cur[c] = a[r][c] + best
        prev = cur
    return min(prev)`,
      why: "Each row's best sums depend only on the previous row: O(n²) total.", time: "O(n²)",
      hidden: [["[[7]]", "7"], ["[[1, 2], [3, 4]]", "4"], ["[[1] * 100 for _ in range(100)]", "100"]] },
    { id: "biggest-square", title: "Biggest Square", d: "Medium", lc: "maximal-square",
      statement: "`grid` is a list of strings of `'0'` and `'1'`. Return the area of the largest square made only of `'1'`s.",
      examples: [["['10100', '10111', '11111', '10010']", "4", ""], ["['01', '10']", "1", ""], ["['0']", "0", ""]],
      constraints: ["1 ≤ rows, cols ≤ 300"],
      hints: ["side[r][c] = size of the largest all-1 square with bottom-right corner at (r, c).", "It's 1 + min(top, left, top-left) when the cell is '1'."],
      solution: `def biggest_square(grid):
    R, C = len(grid), len(grid[0])
    dp = [[0] * (C + 1) for _ in range(R + 1)]
    best = 0
    for r in range(R):
        for c in range(C):
            if grid[r][c] == "1":
                dp[r + 1][c + 1] = 1 + min(dp[r][c + 1], dp[r + 1][c], dp[r][c])
                if dp[r + 1][c + 1] > best:
                    best = dp[r + 1][c + 1]
    return best * best`,
      why: "A square can only be one larger than the smallest of the three squares it touches.", time: "O(m·n)",
      hidden: [["['1']", "1"], ["['11', '11']", "4"], ["['1' * 300] * 300", "90000"]] },
    { id: "knight-health", title: "Knight's Health", d: "Hard", lc: "dungeon-game",
      statement: "A knight starts at the top-left of `rooms` and must reach the bottom-right, moving only right or down. Entering a room adds its value to the knight's health (negative values hurt; the start and end rooms count too). Health must stay **at least 1** at all times. Return the minimum starting health.",
      examples: [["[[-2, -3, 3], [-5, -10, 1], [10, 30, -5]]", "7", ""], ["[[0]]", "1", ""], ["[[100]]", "1", ""]],
      constraints: ["1 ≤ m, n ≤ 200", "−1000 ≤ rooms[r][c] ≤ 1000"],
      hints: ["Going forwards you can't tell how much buffer you'll need later.", "Go backwards: need[r][c] = max(1, min(need below, need right) − rooms[r][c]).", "Use infinity outside the grid, and 1 just past the goal."],
      solution: `def knight_health(rooms):
    R, C = len(rooms), len(rooms[0])
    need = [[inf] * (C + 1) for _ in range(R + 1)]
    need[R][C - 1] = need[R - 1][C] = 1
    for r in range(R - 1, -1, -1):
        for c in range(C - 1, -1, -1):
            need[r][c] = max(1, min(need[r + 1][c], need[r][c + 1]) - rooms[r][c])
    return need[0][0]`,
      why: "From the end backwards, each room knows exactly how much health it needs on entry.", time: "O(m·n)",
      hidden: [["[[-5]]", "6"], ["[[1, -3, 3], [0, -2, 0], [-3, -3, -3]]", "3"], ["[[-1] * 200 for _ in range(200)]", "400"]] }
  ]
});
