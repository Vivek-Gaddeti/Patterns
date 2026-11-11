PAT("matrix", {
  time: "O(m·n)", space: "O(1) extra",
  lede: "Grid problems that aren't graph searches: spirals, rotations, diagonals and in-place updates. The trick is clean index bookkeeping, not a clever algorithm.",
  idea: "Most matrix questions reduce to a few moves: walk **layer by layer** with four boundaries (spiral), use identities like *rotate = transpose + reverse rows*, notice that diagonals share `r − c` or `r + c`, and when updating **in place**, encode the old and new state together so you don't read a value you've already overwritten.",
  analogy: "Peeling an onion: deal with the outer ring, shrink the boundaries, repeat on the inner ring.",
  flavours: [["Trick", "Key idea", "Problems"], [
    ["**Boundaries**", "top, bottom, left, right shrink inward", "spiral order, spiral fill"],
    ["**Transpose + reverse**", "rotate 90° in place", "rotate image"],
    ["**Diagonal keys**", "`r − c` constant on ↘, `r + c` on ↙", "diagonal sums, anti-diagonal traversal"],
    ["**Staircase search**", "start top-right, move left or down", "search a row- and column-sorted grid"],
    ["**State encoding**", "store old and new in one cell", "game of life, set zeroes"]]],
  signals: [["“Spiral order”, “rotate 90 degrees”, “transpose”", "boundary or identity tricks"], ["“In place” on a grid", "encode two states, or use row 0 / col 0 as markers"], ["Rows **and** columns are sorted", "staircase search from a corner"], ["Diagonals", "group cells by r − c or r + c"]],
  not: "**Not this pattern** when you're exploring connected regions or shortest paths in a grid (→ graph DFS / BFS), or computing best paths (→ grid DP).",
  templates: [
    ["Spiral", "spiral.py", `def spiral(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1): out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1): out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1): out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1): out.append(m[r][left])
            left += 1
    return out

print(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))`, "[1, 2, 3, 6, 9, 8, 7, 4, 5]"],
    ["Rotate", "rotate.py", `def rotate(m):                         # 90° clockwise, in place
    n = len(m)
    for i in range(n):
        for j in range(i + 1, n):
            m[i][j], m[j][i] = m[j][i], m[i][j]   # transpose
    for row in m:
        row.reverse()                              # mirror left-right
    return m

print(rotate([[1, 2], [3, 4]]))`, "[[3, 1], [4, 2]]"]
  ],
  examples: [
    { t: "Spiral Matrix", d: "Medium", lc: "spiral-matrix", f: "Boundaries",
      q: "Return all elements in spiral order.",
      idea: "Four boundaries; after each side, shrink one. Guard the bottom and left passes for single rows/columns.",
      code: `def spiral(m):
    out = []
    while m:
        out += m.pop(0)                               # top row
        m = [list(r) for r in zip(*m)][::-1]          # rotate the rest counter-clockwise
    return out

print(spiral([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]))`, out: "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]", cx: "O(mn) (this short version is O(mn · min(m,n)))" },
    { t: "Set Matrix Zeroes", d: "Medium", lc: "set-matrix-zeroes", f: "Markers",
      q: "If a cell is 0, set its whole row and column to 0, in place.",
      idea: "Use the first row and column as marker storage; remember separately whether they themselves had a zero.",
      code: `def set_zeroes(m):
    R, C = len(m), len(m[0])
    row0 = any(m[0][c] == 0 for c in range(C))
    col0 = any(m[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if m[r][c] == 0:
                m[r][0] = m[0][c] = 0
    for r in range(1, R):
        for c in range(1, C):
            if m[r][0] == 0 or m[0][c] == 0:
                m[r][c] = 0
    if row0:
        m[0] = [0] * C
    if col0:
        for r in range(R): m[r][0] = 0
    return m

print(set_zeroes([[1, 1, 1], [1, 0, 1], [1, 1, 1]]))`, out: "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]", cx: "O(mn) time · O(1) space" },
    { t: "Search a 2D Matrix II", d: "Medium", lc: "search-a-2d-matrix-ii", f: "Staircase",
      q: "Rows and columns are sorted ascending. Is target present?",
      idea: "From the top-right corner: too big → go left, too small → go down. Each step removes a row or column.",
      code: `def search(m, target):
    r, c = 0, len(m[0]) - 1
    while r < len(m) and c >= 0:
        if m[r][c] == target: return True
        if m[r][c] > target: c -= 1
        else: r += 1
    return False

g = [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
print(search(g, 5), search(g, 10))`, out: "True False", cx: "O(m + n)" }
  ],
  pitfalls: [
    ["Spiral on a single row / column", "Without the `if top <= bottom` / `if left <= right` guards you visit cells twice."],
    ["Writing zeros immediately in Set Matrix Zeroes", "New zeros then spread further. Mark first, update after."],
    ["Rotating with a copy when “in place” is required", "Transpose + reverse needs no extra grid."],
    ["Mixing up `m[r][c]` and `m[c][r]`", "Rows first. Name loop variables r and c, not i and j."]
  ],
  edge: ["1 × 1 grid", "Single row or single column", "Non-square m × n", "Empty grid", "All zeros / no zeros"],
  compare: [
    ["Graph DFS / BFS", "graph-traversal", "Islands, flood fill and shortest paths on grids are graph problems, not index tricks."],
    ["Grid DP", "grid-dp", "Counting paths or minimum path sums need DP over cells."],
    ["Binary Search", "binary-search", "If the whole grid is sorted row after row, binary-search it as a 1-D array of length m·n."]
  ],
  mcq: [
    ["Rotate an n × n matrix 90° clockwise in place:", ["Reverse rows, then reverse columns", "Transpose, then reverse each row", "Transpose twice", "Swap opposite corners only"], 1, "Transpose flips across the diagonal; reversing each row then gives a clockwise rotation."],
    ["Rows and columns are sorted. Where do you start a staircase search?", ["Top-left", "Top-right (or bottom-left)", "Centre", "Bottom-right"], 1, "From top-right, left means smaller and down means bigger, so each comparison discards a row or column."]
  ],
  summary: {
    oneLine: "Grid index tricks: shrinking boundaries, transpose + reverse, diagonal keys, staircase search, in-place markers.",
    signals: ["Spiral / rotate / transpose", "In-place grid updates", "Rows and columns sorted", "Diagonals (r − c, r + c)"],
    template: `top, bottom, left, right = 0, m - 1, 0, n - 1
while top <= bottom and left <= right:
    # walk top row, right col, bottom row, left col
    # shrinking one boundary after each side`,
    pitfalls: ["Guard single row / column in spirals", "Mark first, update after", "Rows before columns: m[r][c]"],
    cx: "O(m·n) time · O(1) extra",
    drill: { task: "Return the elements of the grid in clockwise spiral order.",
      ref: `def spiral(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1): out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1): out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1): out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1): out.append(m[r][left])
            left += 1
    return out`,
      tests: [["[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[1, 2, 3, 6, 9, 8, 7, 4, 5]"], ["[[1, 2, 3, 4]]", "[1, 2, 3, 4]"], ["[[1], [2], [3]]", "[1, 2, 3]"]] }
  },
  problems: [
    { id: "flip-grid", title: "Flip the Grid", d: "Easy", lc: "transpose-matrix",
      statement: "Return the **transpose** of `grid`: row i of the result is column i of the input. The grid may be rectangular.",
      examples: [["[[1, 2, 3], [4, 5, 6]]", "[[1, 4], [2, 5], [3, 6]]", ""], ["[[7]]", "[[7]]", ""]],
      constraints: ["1 ≤ rows, cols ≤ 1000", "rows × cols ≤ 10⁵"],
      hints: ["Result has cols rows and rows columns.", "result[c][r] = grid[r][c], or `list(zip(*grid))`."],
      solution: `def flip_grid(grid):
    return [[grid[r][c] for r in range(len(grid))] for c in range(len(grid[0]))]`,
      why: "Each cell is copied once to its mirrored position.", time: "O(m·n)",
      hidden: [["[[1], [2]]", "[[1, 2]]"], ["[[1, 2], [3, 4]]", "[[1, 3], [2, 4]]"], ["[list(range(1000))] * 100", "[[c] * 100 for c in range(1000)]"]] },
    { id: "cross-sum", title: "Cross Sum", d: "Easy", lc: "matrix-diagonal-sum",
      statement: "For a square grid, return the sum of the main diagonal plus the anti-diagonal. A centre cell shared by both is counted once.",
      examples: [["[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "25", "1 + 5 + 9 + 3 + 7"], ["[[1, 1], [1, 1]]", "4", ""], ["[[5]]", "5", ""]],
      constraints: ["1 ≤ n ≤ 1000"],
      hints: ["Main diagonal: (i, i). Anti-diagonal: (i, n − 1 − i).", "If n is odd, subtract the centre once."],
      solution: `def cross_sum(g):
    n = len(g)
    total = sum(g[i][i] + g[i][n - 1 - i] for i in range(n))
    if n % 2:
        total -= g[n // 2][n // 2]
    return total`,
      why: "Both diagonals are indexed directly; only the odd centre is double-counted.", time: "O(n)",
      hidden: [["[[2, 3], [4, 5]]", "14"], ["[[1, 0, 0], [0, 1, 0], [0, 0, 1]]", "3"], ["[[1] * 1000 for _ in range(1000)]", "2000"]] },
    { id: "spiral-read", title: "Spiral Read", d: "Medium", lc: "spiral-matrix",
      statement: "Return all values of the `m × n` grid in **clockwise spiral order**, starting at the top-left.",
      examples: [["[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[1, 2, 3, 6, 9, 8, 7, 4, 5]", ""], ["[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]", "[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]", ""]],
      constraints: ["1 ≤ m, n ≤ 300"],
      hints: ["Keep four boundaries: top, bottom, left, right.", "After walking a side, move that boundary inward.", "Guard the bottom and left walks for single rows or columns."],
      solution: `def spiral_read(m):
    out = []
    top, bottom, left, right = 0, len(m) - 1, 0, len(m[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):
            out.append(m[top][c])
        top += 1
        for r in range(top, bottom + 1):
            out.append(m[r][right])
        right -= 1
        if top <= bottom:
            for c in range(right, left - 1, -1):
                out.append(m[bottom][c])
            bottom -= 1
        if left <= right:
            for r in range(bottom, top - 1, -1):
                out.append(m[r][left])
            left += 1
    return out`,
      why: "Shrinking boundaries visit each cell exactly once.", time: "O(m·n)",
      hidden: [["[[1]]", "[1]"], ["[[1], [2], [3]]", "[1, 2, 3]"], ["[[1, 2], [3, 4], [5, 6]]", "[1, 2, 4, 6, 5, 3]"], ["[[1] * 300 for _ in range(300)]", "[1] * 90000"]] },
    { id: "turn-photo", title: "Turn the Photo", d: "Medium", lc: "rotate-image",
      statement: "Rotate the square `photo` 90° **clockwise in place** (don't build a new grid). Return nothing; the checker reads `photo`.",
      examples: [["[[1, 2, 3], [4, 5, 6], [7, 8, 9]]", "[[7, 4, 1], [8, 5, 2], [9, 6, 3]]", ""], ["[[1, 2], [3, 4]]", "[[3, 1], [4, 2]]", ""]],
      constraints: ["1 ≤ n ≤ 500"],
      hints: ["Rotation = transpose, then reverse every row.", "Transpose by swapping (i, j) with (j, i) for j > i."],
      solution: `def turn_photo(photo):
    n = len(photo)
    for i in range(n):
        for j in range(i + 1, n):
            photo[i][j], photo[j][i] = photo[j][i], photo[i][j]
    for row in photo:
        row.reverse()`,
      conv: "args[0]",
      why: "Transpose flips across the main diagonal; reversing rows completes the clockwise turn, all in place.", time: "O(n²)",
      hidden: [["[[5]]", "[[5]]"], ["[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]]", "[[13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3], [16, 12, 8, 4]]"], ["[[r * 500 + c for c in range(500)] for r in range(500)]", "[[(499 - c) * 500 + r for c in range(500)] for r in range(500)]"]] },
    { id: "zero-spread", title: "Zero Spread", d: "Medium", lc: "set-matrix-zeroes",
      statement: "If any cell of `grid` is 0, set its entire row and column to 0. Do it **in place** with O(1) extra space. Return nothing; the checker reads `grid`.",
      examples: [["[[1, 1, 1], [1, 0, 1], [1, 1, 1]]", "[[1, 0, 1], [0, 0, 0], [1, 0, 1]]", ""], ["[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]", "[[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]", ""]],
      constraints: ["1 ≤ m, n ≤ 200"],
      hints: ["Don't write zeros while you're still scanning.", "Use row 0 and column 0 as flags for the other rows/columns.", "Remember separately whether row 0 / column 0 had a zero."],
      solution: `def zero_spread(g):
    R, C = len(g), len(g[0])
    row0 = any(g[0][c] == 0 for c in range(C))
    col0 = any(g[r][0] == 0 for r in range(R))
    for r in range(1, R):
        for c in range(1, C):
            if g[r][c] == 0:
                g[r][0] = 0
                g[0][c] = 0
    for r in range(1, R):
        for c in range(1, C):
            if g[r][0] == 0 or g[0][c] == 0:
                g[r][c] = 0
    if row0:
        for c in range(C):
            g[0][c] = 0
    if col0:
        for r in range(R):
            g[r][0] = 0`,
      conv: "args[0]",
      why: "The first row and column store the markers, so no extra grid is needed; two flags remember their own state.", time: "O(m·n)",
      hidden: [["[[1]]", "[[1]]"], ["[[0]]", "[[0]]"], ["[[1, 0], [1, 1]]", "[[0, 0], [1, 0]]"], ["[[1] * 200 for _ in range(199)] + [[0] + [1] * 199]", "[[0] + [1] * 199 for _ in range(199)] + [[0] * 200]"]] },
    { id: "sorted-grid-find", title: "Find in a Sorted Grid", d: "Medium", lc: "search-a-2d-matrix-ii",
      statement: "Each row of `grid` is sorted left to right and each column top to bottom. Return `True` if `target` is in the grid. Aim for O(m + n).",
      examples: [["[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16]], 5", "True", ""], ["[[1, 4, 7, 11], [2, 5, 8, 12], [3, 6, 9, 16]], 10", "False", ""]],
      constraints: ["1 ≤ m, n ≤ 1000"],
      hints: ["Start at the top-right corner.", "Bigger than target → move left. Smaller → move down."],
      solution: `def sorted_grid_find(grid, target):
    r, c = 0, len(grid[0]) - 1
    while r < len(grid) and c >= 0:
        v = grid[r][c]
        if v == target:
            return True
        if v > target:
            c -= 1
        else:
            r += 1
    return False`,
      why: "From the top-right, each comparison rules out a whole row or column: at most m + n steps.", time: "O(m + n)",
      hidden: [["[[5]], 5", "True"], ["[[1, 2], [3, 4]], 0", "False"], ["[[r + c for c in range(1000)] for r in range(1000)], 1998", "True"], ["[[2 * (r + c) for c in range(1000)] for r in range(1000)], 999", "False"]] },
    { id: "next-generation", title: "Next Generation", d: "Medium", lc: "game-of-life",
      statement: "Cells are 1 (alive) or 0 (dead). Compute the next state using the 8 neighbours: a live cell survives with 2 or 3 live neighbours, otherwise dies; a dead cell becomes alive with exactly 3. Update `board` **in place** (all cells change at once). Return nothing; the checker reads `board`.",
      examples: [["[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]", "[[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]", ""], ["[[1, 1], [1, 0]]", "[[1, 1], [1, 1]]", ""]],
      constraints: ["1 ≤ m, n ≤ 100"],
      hints: ["You can't overwrite a cell before its neighbours have read it.", "Encode both states in one cell: bit 0 = now, bit 1 = next.", "After filling bit 1 everywhere, shift each cell right by one."],
      solution: `def next_generation(board):
    R, C = len(board), len(board[0])
    for r in range(R):
        for c in range(C):
            live = 0
            for dr in (-1, 0, 1):
                for dc in (-1, 0, 1):
                    if (dr or dc) and 0 <= r + dr < R and 0 <= c + dc < C:
                        live += board[r + dr][c + dc] & 1
            if board[r][c] & 1 and live in (2, 3):
                board[r][c] |= 2
            if not board[r][c] & 1 and live == 3:
                board[r][c] |= 2
    for r in range(R):
        for c in range(C):
            board[r][c] >>= 1`,
      conv: "args[0]",
      why: "Bit 0 keeps the current state readable while bit 1 accumulates the next one, so no copy is needed.", time: "O(m·n)",
      hidden: [["[[1]]", "[[0]]"], ["[[0, 0, 0], [1, 1, 1], [0, 0, 0]]", "[[0, 1, 0], [0, 1, 0], [0, 1, 0]]"], ["[[1] * 100 for _ in range(100)]", "[[1] + [0] * 98 + [1]] + [[0] * 100 for _ in range(98)] + [[1] + [0] * 98 + [1]]"]] }
  ]
});
