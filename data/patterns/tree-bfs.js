PAT("tree-bfs", {
  time: "O(n)", space: "O(width)",
  lede: "Visit the tree one level at a time with a queue. Freezing the queue's length at the start of each level tells you exactly which nodes belong to that level.",
  idea: "A queue processes nodes in the order they were discovered: the root, then all of depth 1, then all of depth 2… Snapshot `len(queue)` before processing a level and pop exactly that many: everything you pop is on the **same level**, and everything you push belongs to the next one. Per-level questions (averages, rightmost node, zigzag) become trivial, and the first leaf you meet is the shallowest.",
  analogy: "Ripples in a pond: the first ring, then the second ring, then the third. You finish each ring before the next one starts.",
  signals: [["“Level by level”, “each level”, “per depth”", "level order traversal"], ["“Right / left side view”, “bottom-left value”", "first or last node per level"], ["“Minimum depth”, “nearest leaf”", "BFS stops at the first leaf"], ["Width of a level, zigzag order, cousins", "position or parent per level"]],
  not: "**Not this pattern** when the answer combines information from subtrees (height, diameter, path sums) (→ DFS), or when exploring a general graph or grid (→ graph BFS, same idea plus a visited set).",
  templates: [
    ["Level order", "levels.py", `from collections import deque

class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def levels(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):            # exactly the nodes of this level
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        out.append(level)
    return out

print(levels(T(3, T(9), T(20, T(15), T(7)))))`, "[[3], [9, 20], [15, 7]]"]
  ],
  examples: [
    { t: "Binary Tree Right Side View", d: "Medium", lc: "binary-tree-right-side-view", f: "Last per level",
      q: "Values you'd see looking at the tree from the right, top to bottom.",
      idea: "BFS by level; keep the last node of each level.",
      code: `from collections import deque

class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def right_view(root):
    out, q = [], deque([root] if root else [])
    while q:
        for i in range(len(q)):
            n = q.popleft()
            if i == 0: out.append(n.val)          # we enqueue right child first
            if n.right: q.append(n.right)
            if n.left: q.append(n.left)
    return out

print(right_view(T(1, T(2, None, T(5)), T(3, None, T(4)))))`, out: "[1, 3, 4]", cx: "O(n)" },
    { t: "Minimum Depth of Binary Tree", d: "Easy", lc: "minimum-depth-of-binary-tree", f: "First leaf",
      q: "Number of nodes on the shortest root-to-leaf path.",
      idea: "BFS reaches the shallowest leaf first, so stop there.",
      code: `from collections import deque

class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def min_depth(root):
    if not root: return 0
    q = deque([(root, 1)])
    while q:
        n, d = q.popleft()
        if not n.left and not n.right: return d
        if n.left: q.append((n.left, d + 1))
        if n.right: q.append((n.right, d + 1))

print(min_depth(T(3, T(9), T(20, T(15), T(7)))))`, out: "2", cx: "O(n), often much less" },
    { t: "Zigzag Level Order", d: "Medium", lc: "binary-tree-zigzag-level-order-traversal", f: "Alternate direction",
      q: "Level order, but every other level right-to-left.",
      idea: "Normal BFS; reverse every second level's list.",
      code: `from collections import deque

class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def zigzag(root):
    out, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            n = q.popleft(); level.append(n.val)
            if n.left: q.append(n.left)
            if n.right: q.append(n.right)
        out.append(level[::-1] if len(out) % 2 else level)
    return out

print(zigzag(T(3, T(9), T(20, T(15), T(7)))))`, out: "[[3], [20, 9], [15, 7]]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Using a list with `pop(0)`", "That's O(n) per pop; use `collections.deque` and `popleft()`."],
    ["Not freezing the level size", "Read `len(q)` once before the loop; the queue grows while you process the level."],
    ["Pushing `None` children", "Check `if node.left` before appending (unless you deliberately track positions)."],
    ["Using DFS for minimum depth on a huge, lopsided tree", "DFS explores deep branches fully; BFS stops at the first leaf."]
  ],
  edge: ["Empty tree", "Single node", "Skewed tree", "Last level partly filled", "Negative values in averages"],
  compare: [
    ["Tree DFS", "tree-dfs", "Most tree questions work either way; choose BFS when the question is about levels or the nearest node."],
    ["Graph DFS / BFS", "graph-traversal", "Same queue idea on graphs and grids, plus a visited set because of cycles."],
    ["Multi-source BFS", "multi-source-bfs", "Starting the queue with many nodes at once gives distances from the nearest source."]
  ],
  mcq: [
    ["Why snapshot `len(queue)` at the start of each level?", ["To save memory", "So you pop exactly the nodes of the current level, even as children are added", "deque requires it", "To sort the level"], 1, "Children appended during the loop belong to the next level."],
    ["Which finds the minimum depth faster on a very deep but lopsided tree?", ["DFS", "BFS", "Both equal always", "Sorting"], 1, "BFS returns at the first leaf it meets, which is the shallowest."]
  ],
  summary: {
    oneLine: "A queue, one level at a time: freeze len(q), pop that many, push their children.",
    signals: ["Level by level / per depth", "Side views, bottom-left", "Minimum depth, nearest leaf", "Zigzag, width, cousins"],
    template: `q = deque([root])
while q:
    level = []
    for _ in range(len(q)):
        node = q.popleft()
        level.append(node.val)
        if node.left: q.append(node.left)
        if node.right: q.append(node.right)
    out.append(level)`,
    pitfalls: ["deque, not list.pop(0)", "Freeze the level size", "Skip None children"],
    cx: "O(n) time · O(width) space",
    drill: { task: "Return the node values level by level, as a list of lists.",
      ref: `def levels(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out`,
      tests: [["build_tree([3, 9, 20, None, None, 15, 7])", "[[3], [9, 20], [15, 7]]"], ["build_tree([1])", "[[1]]"], ["build_tree([])", "[]"]] }
  },
  problems: [
    { id: "level-means", title: "Level Averages", d: "Easy", lc: "average-of-levels-in-binary-tree",
      statement: "Return the average value of the nodes on each level, top to bottom. (The checker rounds to 5 decimal places.)",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "[3.0, 14.5, 11.0]", ""], ["build_tree([3, 9, 20, 15, 7])", "[3.0, 14.5, 11.0]", ""]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["BFS level by level.", "Sum each level and divide by its size."],
      solution: `def level_means(root):
    out, q = [], deque([root])
    while q:
        size, total = len(q), 0
        for _ in range(size):
            node = q.popleft()
            total += node.val
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(total / size)
    return out`,
      conv: "[round(x, 5) for x in r]",
      why: "Freezing the level size gives both the count and the sum of each level.", time: "O(n)",
      hidden: [["build_tree([1])", "[1.0]"], ["build_tree([1, -1, 2])", "[1.0, 0.5]"], ["build_tree([5] * 1023)", "[5.0] * 10"]] },
    { id: "nearest-leaf", title: "Nearest Leaf", d: "Easy", lc: "minimum-depth-of-binary-tree",
      statement: "Return the number of nodes on the **shortest** path from the root to a leaf (0 for an empty tree).",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "2", ""], ["build_tree([2, None, 3, None, 4, None, 5, None, 6])", "5", "A node with one child isn't a leaf."]],
      constraints: ["0 ≤ nodes ≤ 10⁵"],
      hints: ["BFS meets leaves in order of depth.", "Return as soon as you pop a node with no children."],
      solution: `def nearest_leaf(root):
    if not root:
        return 0
    q = deque([(root, 1)])
    while q:
        node, d = q.popleft()
        if not node.left and not node.right:
            return d
        if node.left:
            q.append((node.left, d + 1))
        if node.right:
            q.append((node.right, d + 1))`,
      why: "BFS processes nodes in depth order, so the first leaf popped is the shallowest.", time: "O(n)",
      hidden: [["build_tree([])", "0"], ["build_tree([1, 2])", "2"], ["build_tree(list(range(65535)))", "16"]] },
    { id: "same-level-cousins", title: "Cousins?", d: "Easy", lc: "cousins-in-binary-tree",
      statement: "Values are unique. Two nodes are *cousins* if they are on the same level but have **different parents**. Return `True` if the nodes with values `x` and `y` are cousins.",
      examples: [["build_tree([1, 2, 3, 4]), 4, 3", "False", "Different levels."], ["build_tree([1, 2, 3, None, 4, None, 5]), 5, 4", "True", ""], ["build_tree([1, 2, 3, None, 4]), 2, 3", "False", "Same parent."]],
      constraints: ["2 ≤ nodes ≤ 100"],
      hints: ["BFS level by level, remembering each node's parent.", "Check whether x and y appear in the same level with different parents."],
      solution: `def cousins(root, x, y):
    q = deque([(root, None)])
    while q:
        found = {}
        for _ in range(len(q)):
            node, parent = q.popleft()
            if node.val in (x, y):
                found[node.val] = parent
            if node.left:
                q.append((node.left, node))
            if node.right:
                q.append((node.right, node))
        if len(found) == 2:
            return found[x] is not found[y]
        if found:
            return False
    return False`,
      why: "Processing a whole level at once shows immediately whether x and y share a depth, and the stored parents tell you whether they're siblings.", time: "O(n)",
      hidden: [["build_tree([1, 2, 3]), 2, 3", "False"], ["build_tree([1, 2, 3, 4, None, None, 5]), 4, 5", "True"], ["build_tree([1, 2, 3, None, 4, 5]), 4, 5", "True"]] },
    { id: "level-lists", title: "Level Lists", d: "Medium", lc: "binary-tree-level-order-traversal",
      statement: "Return the values of the tree level by level, left to right, as a list of lists.",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "[[3], [9, 20], [15, 7]]", ""], ["build_tree([1])", "[[1]]", ""], ["build_tree([])", "[]", ""]],
      constraints: ["0 ≤ nodes ≤ 2000"],
      hints: ["A queue gives nodes in level order.", "Pop exactly len(queue) nodes per level."],
      solution: `def level_lists(root):
    if not root:
        return []
    out, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level)
    return out`,
      why: "The frozen level size splits the BFS order into levels.", time: "O(n)",
      hidden: [["build_tree([1, 2, None, 3])", "[[1], [2], [3]]"], ["build_tree([1, 2, 3, 4, 5, 6, 7])", "[[1], [2, 3], [4, 5, 6, 7]]"], ["build_tree(list(range(1023)))", "[list(range(2 ** d - 1, 2 ** (d + 1) - 1)) for d in range(10)]"]] },
    { id: "right-view", title: "View From the Right", d: "Medium", lc: "binary-tree-right-side-view",
      statement: "Standing to the right of the tree, return the values you can see from top to bottom (the rightmost node of each level).",
      examples: [["build_tree([1, 2, 3, None, 5, None, 4])", "[1, 3, 4]", ""], ["build_tree([1, 2, 3, 4])", "[1, 3, 4]", "4 is visible because nothing on its level is to its right."]],
      constraints: ["0 ≤ nodes ≤ 100"],
      hints: ["BFS by level.", "Keep the last value of each level."],
      solution: `def right_view(root):
    out, q = [], deque([root] if root else [])
    while q:
        size = len(q)
        for i in range(size):
            node = q.popleft()
            if i == size - 1:
                out.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return out`,
      why: "The last node popped on each level is the rightmost one.", time: "O(n)",
      hidden: [["build_tree([])", "[]"], ["build_tree([1, 2])", "[1, 2]"], ["build_tree([1, 2, 3, 4, 5, 6, 7, 8])", "[1, 3, 7, 8]"]] },
    { id: "snake-levels", title: "Snake Through the Levels", d: "Medium", lc: "binary-tree-zigzag-level-order-traversal",
      statement: "Return the level-order values, but alternate direction: the first level left to right, the next right to left, and so on.",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "[[3], [20, 9], [15, 7]]", ""], ["build_tree([1])", "[[1]]", ""]],
      constraints: ["0 ≤ nodes ≤ 2000"],
      hints: ["Do a normal level-order BFS.", "Reverse every second level before adding it."],
      solution: `def snake_levels(root):
    out, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        out.append(level[::-1] if len(out) % 2 else level)
    return out`,
      why: "The traversal order is unchanged; only the output of odd levels is reversed.", time: "O(n)",
      hidden: [["build_tree([])", "[]"], ["build_tree([1, 2, 3, 4, 5, 6, 7])", "[[1], [3, 2], [4, 5, 6, 7]]"], ["build_tree(list(range(15)))", "[[0], [2, 1], [3, 4, 5, 6], [14, 13, 12, 11, 10, 9, 8, 7]]"]] },
    { id: "bottom-left", title: "Bottom-Left Value", d: "Medium", lc: "find-bottom-left-tree-value",
      statement: "Return the value of the leftmost node on the **deepest** level of the tree.",
      examples: [["build_tree([2, 1, 3])", "1", ""], ["build_tree([1, 2, 3, 4, None, 5, 6, None, None, 7])", "7", ""]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["The first node of the last level is the answer.", "Trick: BFS right child first, then left; the very last node popped is the answer."],
      solution: `def bottom_left(root):
    q = deque([root])
    node = root
    while q:
        node = q.popleft()
        if node.right:
            q.append(node.right)
        if node.left:
            q.append(node.left)
    return node.val`,
      why: "Visiting right before left makes the last node of the whole BFS the leftmost node of the deepest level.", time: "O(n)",
      hidden: [["build_tree([5])", "5"], ["build_tree([1, None, 2])", "2"], ["build_tree(list(range(1, 1024)))", "512"]] },
    { id: "widest-level", title: "Widest Level", d: "Medium", lc: "maximum-width-of-binary-tree",
      statement: "The *width* of a level is the distance between its leftmost and rightmost non-empty nodes, **counting the empty spots between them** as if the tree were complete. Return the maximum width over all levels.",
      examples: [["build_tree([1, 3, 2, 5, 3, None, 9])", "4", "Level 3: 5, 3, _, 9"], ["build_tree([1, 3, 2, 5, None, None, 9, 6, None, 7])", "7", ""], ["build_tree([1, 3, 2, 5])", "2", ""]],
      constraints: ["1 ≤ nodes ≤ 3000"],
      hints: ["Number nodes like a heap: root 0, children 2i and 2i + 1.", "Width of a level = last index − first index + 1.", "Re-base indices each level (subtract the first one) to keep numbers small."],
      solution: `def widest_level(root):
    best = 0
    q = deque([(root, 0)])
    while q:
        first = q[0][1]
        last = first
        for _ in range(len(q)):
            node, i = q.popleft()
            i -= first
            last = i
            if node.left:
                q.append((node.left, 2 * i))
            if node.right:
                q.append((node.right, 2 * i + 1))
        best = max(best, last + 1)
    return best`,
      why: "Heap-style indices count the missing positions; re-basing per level stops the numbers from exploding.", time: "O(n)",
      hidden: [["build_tree([1])", "1"], ["build_tree([1, 2, 3, 4, None, None, 5])", "4"], ["build_tree([1] + [2, None] * 40)", "1"]] },
    { id: "column-order", title: "Column by Column", d: "Hard", lc: "vertical-order-traversal-of-a-binary-tree",
      statement: "Place the root at (row 0, column 0); a left child is at (row + 1, column − 1) and a right child at (row + 1, column + 1). Return the values column by column from left to right. Within a column, list top to bottom; nodes in the **same row and column** are ordered by value.",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "[[9], [3, 15], [20], [7]]", ""], ["build_tree([1, 2, 3, 4, 5, 6, 7])", "[[4], [2], [1, 5, 6], [3], [7]]", "5 and 6 share a spot; sorted by value."]],
      constraints: ["1 ≤ nodes ≤ 1000"],
      hints: ["Collect (column, row, value) for every node with BFS or DFS.", "Sort the triples.", "Group by column."],
      solution: `def column_order(root):
    cells = []
    q = deque([(root, 0, 0)])
    while q:
        node, r, c = q.popleft()
        cells.append((c, r, node.val))
        if node.left:
            q.append((node.left, r + 1, c - 1))
        if node.right:
            q.append((node.right, r + 1, c + 1))
    cells.sort()
    out, last = [], None
    for c, r, v in cells:
        if c != last:
            out.append([])
            last = c
        out[-1].append(v)
    return out`,
      why: "Sorting by (column, row, value) encodes all three ordering rules at once.", time: "O(n log n)",
      hidden: [["build_tree([1])", "[[1]]"], ["build_tree([1, 2, 3, 4, 6, 5, 7])", "[[4], [2], [1, 5, 6], [3], [7]]"], ["build_tree([3, 1, 4, 0, 2, 2])", "[[0], [1], [3, 2, 2], [4]]"]] }
  ]
});
