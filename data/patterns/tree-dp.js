PAT("tree-dp", {
  time: "O(n)", space: "O(h)",
  lede: "Each node returns a small tuple of answers about its subtree (for example: best if I'm taken, best if I'm not), and the parent combines its children's tuples. One post-order pass solves the whole tree.",
  idea: "Plain tree DFS returns one number. When a choice at a node constrains its neighbours (can't rob a parent and a child, cameras cover neighbours), one number isn't enough: return **one value per state**. The parent builds its own tuple from its children's. For questions about every node as a root (sum of distances), compute once from a root, then **reroot**: move the root to a child and adjust the answer in O(1).",
  analogy: "Each team lead reports two numbers to their manager: “what my team achieves if I join the project” and “what it achieves if I don't”. The manager picks the best combination without asking anyone below.",
  flavours: [["Problem", "Each node returns", "Combine"], [
    ["**Robber on a tree**", "(take, skip)", "take = val + skip(l) + skip(r); skip = max(l) + max(r)"],
    ["**Cameras**", "state: covered / has camera / needs cover", "greedy from the leaves"],
    ["**Paths through a node**", "best downward path", "record left + right in a global best"],
    ["**Rerooting**", "subtree sizes + one root's answer", "ans[child] = ans[parent] − size[child] + (n − size[child])"]]],
  signals: [["A tree where choosing a node restricts its parent or children", "take / skip states"], ["Cover / monitor / colour nodes with neighbour rules", "a few states per node"], ["“For every node, compute …” over the whole tree", "rerooting"], ["Balance or move things between subtrees", "return a surplus / deficit"]],
  not: "**Not this pattern** when one number per node suffices (→ plain tree DFS), or the structure is a general graph with cycles (→ graph algorithms).",
  templates: [
    ["Return a tuple", "rob_tree.py", `class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def rob(root):
    def go(node):                              # returns (best if taken, best if skipped)
        if not node:
            return (0, 0)
        lt, ls = go(node.left)
        rt, rs = go(node.right)
        take = node.val + ls + rs              # children must be skipped
        skip = max(lt, ls) + max(rt, rs)       # children free to choose
        return (take, skip)
    return max(go(root))

print(rob(T(3, T(2, None, T(3)), T(3, None, T(1)))))`, "7"]
  ],
  examples: [
    { t: "Binary Tree Cameras", d: "Hard", lc: "binary-tree-cameras", f: "States",
      q: "Fewest cameras so every node is monitored (a camera covers itself, its parent and children).",
      idea: "Post-order with states 0 = not covered, 1 = has camera, 2 = covered. If any child is uncovered, place a camera here.",
      code: `class T:
    def __init__(s, v=0, l=None, r=None): s.val, s.left, s.right = v, l, r

def min_cameras(root):
    count = 0
    def go(n):
        nonlocal count
        if not n: return 2
        l, r = go(n.left), go(n.right)
        if l == 0 or r == 0:
            count += 1; return 1
        return 2 if l == 1 or r == 1 else 0
    if go(root) == 0: count += 1
    return count

print(min_cameras(T(0, T(0, T(0), T(0)))))`, out: "1", cx: "O(n)" },
    { t: "Sum of Distances in Tree", d: "Hard", lc: "sum-of-distances-in-tree", f: "Rerooting",
      q: "For every node, the sum of distances to all other nodes.",
      idea: "One DFS gives subtree sizes and the answer for root 0. Moving the root to a child: size[child] nodes get 1 closer, the rest 1 farther.",
      code: `def sum_distances(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges: g[a].append(b); g[b].append(a)
    size, ans = [1] * n, [0] * n
    order, parent = [0], [-1] * n
    for u in order:
        for v in g[u]:
            if v != parent[u]: parent[v] = u; order.append(v)
    for u in reversed(order[1:]):
        size[parent[u]] += size[u]
        ans[parent[u]] += ans[u] + size[u]
    for u in order[1:]:
        ans[u] = ans[parent[u]] - size[u] + (n - size[u])
    return ans

print(sum_distances(6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]))`, out: "[8, 12, 6, 10, 10, 10]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Returning one value when you need several", "If a parent's choice depends on whether the child was chosen, return both cases."],
    ["Forgetting the root's own state", "Cameras: if the root ends up uncovered, it needs a camera too."],
    ["Recursion depth", "Line-shaped trees with 10⁵ nodes overflow recursion: iterate in BFS order and process it backwards."],
    ["O(n²) “every node as root”", "Re-running DFS from each node is too slow; reroot instead."]
  ],
  edge: ["Single node", "Line-shaped tree", "All zero values", "Perfect binary tree", "Star-shaped tree"],
  compare: [
    ["Tree DFS", "tree-dfs", "Tree DP is tree DFS that returns several values per node."],
    ["State Machine DP", "state-machine-dp", "Take/skip states on a tree are the same idea as hold/free states over days."],
    ["1-D DP", "dp-1d", "House robber on a line becomes house robber on a tree with the same two states."]
  ],
  mcq: [
    ["House robber on a tree: what should each node return?", ["Its value", "(best if this node is robbed, best if it isn't)", "The subtree height", "The number of children"], 1, "The parent needs both to decide whether it can rob itself."],
    ["Why is rerooting O(n) instead of O(n²)?", ["It skips nodes", "Each move of the root changes the answer by a formula computed in O(1)", "It uses a heap", "It isn't"], 1, "Moving the root across one edge only changes distances by ±1 for two known groups."]
  ],
  summary: {
    oneLine: "Post-order DFS returning a tuple of states per node; reroot for “every node as root”.",
    signals: ["Choices constrain parent / children", "Cover / monitor nodes", "Answer for every root", "Move surplus between subtrees"],
    template: `def go(node):
    if not node: return (0, 0)
    lt, ls = go(node.left)
    rt, rs = go(node.right)
    take = node.val + ls + rs
    skip = max(lt, ls) + max(rt, rs)
    return (take, skip)`,
    pitfalls: ["Return all needed states", "Handle the root's state", "Avoid deep recursion", "Reroot instead of n DFS runs"],
    cx: "O(n) time · O(h) space",
    drill: { task: "House robber on a tree: no two directly connected nodes may both be taken. Return the maximum sum.",
      ref: `def rob_tree(root):
    def go(node):
        if not node:
            return (0, 0)
        lt, ls = go(node.left)
        rt, rs = go(node.right)
        return (node.val + ls + rs, max(lt, ls) + max(rt, rs))
    return max(go(root))`,
      tests: [["build_tree([3, 2, 3, None, 3, None, 1])", "7"], ["build_tree([3, 4, 5, 1, 3, None, 1])", "9"], ["build_tree([])", "0"]] }
  },
  problems: [
    { id: "tree-tilt", title: "Total Tilt", d: "Easy", lc: "binary-tree-tilt",
      statement: "A node's *tilt* is |sum of its left subtree − sum of its right subtree| (an empty subtree sums to 0). Return the sum of every node's tilt.",
      examples: [["build_tree([1, 2, 3])", "1", ""], ["build_tree([4, 2, 9, 3, 5, None, 7])", "15", ""]],
      constraints: ["0 ≤ nodes ≤ 10⁴"],
      hints: ["Each node needs its subtrees' sums.", "Return the subtree sum, and add the tilt to a running total on the way."],
      solution: `def tree_tilt(root):
    total = 0
    def go(node):
        nonlocal total
        if not node:
            return 0
        l, r = go(node.left), go(node.right)
        total += abs(l - r)
        return node.val + l + r
    go(root)
    return total`,
      why: "One post-order pass returns sums upward while recording each tilt.", time: "O(n)",
      hidden: [["build_tree([])", "0"], ["build_tree([1, 2])", "2"], ["build_tree([1] * 1023)", "0"]] },
    { id: "tree-thief", title: "Thief in the Tree", d: "Medium", lc: "house-robber-iii",
      statement: "Houses form a binary tree. Robbing two houses connected directly (parent and child) sets off an alarm. Return the maximum amount you can rob.",
      examples: [["build_tree([3, 2, 3, None, 3, None, 1])", "7", "3 + 3 + 1"], ["build_tree([3, 4, 5, 1, 3, None, 1])", "9", "4 + 5"]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["For each node, compute (best if robbed, best if not).", "Robbed: its value plus both children's “not robbed”.", "Not robbed: each child takes its better option."],
      solution: `def tree_thief(root):
    def go(node):
        if not node:
            return (0, 0)
        lt, ls = go(node.left)
        rt, rs = go(node.right)
        return (node.val + ls + rs, max(lt, ls) + max(rt, rs))
    return max(go(root))`,
      why: "Two states per node carry exactly the information the parent needs.", time: "O(n)",
      hidden: [["build_tree([5])", "5"], ["build_tree([2, 1, 3, None, 4])", "7"], ["build_tree([1] * 1023)", "682"]] },
    { id: "same-value-path", title: "Same-Value Path", d: "Medium", lc: "longest-univalue-path",
      statement: "Return the number of **edges** in the longest path where every node has the same value (the path need not pass through the root).",
      examples: [["build_tree([5, 4, 5, 1, 1, None, 5])", "2", ""], ["build_tree([1, 4, 5, 4, 4, None, 5])", "2", ""]],
      constraints: ["0 ≤ nodes ≤ 10⁴"],
      hints: ["Return the longest same-value arm going down from each node.", "An arm continues into a child only if the child has the same value.", "The path through a node is left arm + right arm."],
      solution: `def same_value_path(root):
    best = 0
    def go(node):
        nonlocal best
        if not node:
            return 0
        l, r = go(node.left), go(node.right)
        l = l + 1 if node.left and node.left.val == node.val else 0
        r = r + 1 if node.right and node.right.val == node.val else 0
        best = max(best, l + r)
        return max(l, r)
    go(root)
    return best`,
      why: "Each node returns its best downward arm and tries itself as the bend of a path.", time: "O(n)",
      hidden: [["build_tree([])", "0"], ["build_tree([1, 1, 1])", "2"], ["build_tree([7] * 1023)", "18"]] },
    { id: "spread-coins", title: "Spread the Coins", d: "Medium", lc: "distribute-coins-in-binary-tree",
      statement: "Each node holds `node.val` coins and there are exactly as many coins as nodes. In one move, a coin travels along one edge. Return the minimum moves so every node has exactly one coin.",
      examples: [["build_tree([3, 0, 0])", "2", ""], ["build_tree([0, 3, 0])", "3", ""]],
      constraints: ["1 ≤ nodes ≤ 100"],
      hints: ["Each subtree has a surplus (or deficit) = coins − nodes.", "That surplus must cross the edge to the parent: |surplus| moves.", "Return the surplus up; add |left| + |right| to the moves."],
      solution: `def spread_coins(root):
    moves = 0
    def go(node):
        nonlocal moves
        if not node:
            return 0
        l, r = go(node.left), go(node.right)
        moves += abs(l) + abs(r)
        return node.val + l + r - 1
    go(root)
    return moves`,
      why: "Every coin crossing an edge is forced by the imbalance of the subtree below it.", time: "O(n)",
      hidden: [["build_tree([1])", "0"], ["build_tree([1, 0, 2])", "2"], ["build_tree([0, 0, None, 0, None, 0, None, 5])", "10"]] },
    { id: "best-split", title: "Best Split", d: "Medium", lc: "maximum-product-of-splitted-binary-tree",
      statement: "Remove one edge to split the tree into two parts. Return the maximum product of the two parts' sums, modulo 10⁹ + 7 (maximise first, then take the modulo).",
      examples: [["build_tree([1, 2, 3, 4, 5, 6])", "110", "11 × 10"], ["build_tree([1, None, 2, 3, 4, None, None, 5, 6])", "90", ""]],
      constraints: ["2 ≤ nodes ≤ 5·10⁴"],
      hints: ["Compute every subtree sum in one pass.", "Cutting above a subtree with sum s gives s × (total − s)."],
      solution: `def best_split(root):
    sums = []
    def go(node):
        if not node:
            return 0
        s = node.val + go(node.left) + go(node.right)
        sums.append(s)
        return s
    total = go(root)
    return max(s * (total - s) for s in sums) % (10**9 + 7)`,
      why: "Every cut corresponds to exactly one subtree; its sum determines both parts.", time: "O(n)",
      hidden: [["build_tree([1, 1])", "1"], ["build_tree([2, 3, 9, 10, 7, 8, 6, 5, 4, 11, 1])", "1025"], ["build_tree([10000] * 1023)", "(511 * 10000) * (512 * 10000) % (10**9 + 7)"]] },
    { id: "zigzag-tree", title: "Longest Zigzag", d: "Medium", lc: "longest-zigzag-path-in-a-binary-tree",
      statement: "A zigzag path starts at any node and alternates directions: left, right, left… or right, left, right… Return the number of **edges** in the longest zigzag path.",
      examples: [["build_tree([1, None, 1, 1, 1, None, None, 1, 1, None, 1, None, None, None, 1])", "3", ""], ["build_tree([1])", "0", ""]],
      constraints: ["1 ≤ nodes ≤ 5·10⁴"],
      hints: ["For each node keep two values: longest zigzag ending here arriving from the left, and from the right.", "Going left continues a path that last went right, and vice versa."],
      solution: `def zigzag_tree(root):
    best = 0
    stack = [(root, 0, 0)]
    while stack:
        node, from_left, from_right = stack.pop()
        best = max(best, from_left, from_right)
        if node.left:
            stack.append((node.left, from_right + 1, 0))
        if node.right:
            stack.append((node.right, 0, from_left + 1))
    return best`,
      why: "Two lengths per node carry the alternating constraint downward; an explicit stack avoids deep recursion.", time: "O(n)",
      hidden: [["build_tree([1, 1])", "1"], ["build_tree([1, 1, 1, None, 1, None, None, 1, 1, None, 1])", "4"], ["build_tree([1] * 1023)", "9"]] },
    { id: "guard-the-tree", title: "Guard the Tree", d: "Hard", lc: "binary-tree-cameras",
      statement: "A camera on a node watches the node, its parent and its children. Return the minimum number of cameras needed to watch every node.",
      examples: [["build_tree([0, 0, None, 0, 0])", "1", ""], ["build_tree([0, 0, None, 0, None, 0, None, None, 0])", "2", ""]],
      constraints: ["1 ≤ nodes ≤ 1000"],
      hints: ["Leaves should never hold cameras: put them on leaves' parents.", "Post-order states: 0 = not watched, 1 = has a camera, 2 = watched.", "If a child is unwatched, this node needs a camera; if a child has one, this node is watched."],
      solution: `def guard_tree(root):
    cams = 0
    def go(node):
        nonlocal cams
        if not node:
            return 2
        l, r = go(node.left), go(node.right)
        if l == 0 or r == 0:
            cams += 1
            return 1
        if l == 1 or r == 1:
            return 2
        return 0
    if go(root) == 0:
        cams += 1
    return cams`,
      why: "Placing cameras as high as possible (on leaves' parents) is optimal; the three states make that greedy exact.", time: "O(n)",
      hidden: [["build_tree([0])", "1"], ["build_tree([0, 0, 0])", "1"], ["build_tree([0] * 1000)", "288"]] },
    { id: "all-distance-sums", title: "Distance Sums for Everyone", d: "Hard", lc: "sum-of-distances-in-tree",
      statement: "An undirected tree has nodes `0..n−1` and `edges`. Return a list where position i is the sum of distances from node i to every other node.",
      examples: [["6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]", "[8, 12, 6, 10, 10, 10]", ""], ["1, []", "[0]", ""], ["2, [[1, 0]]", "[1, 1]", ""]],
      constraints: ["1 ≤ n ≤ 3·10⁴"],
      hints: ["Root the tree at 0. One pass computes subtree sizes and the answer for node 0.", "Moving the root from u to child v: size[v] nodes get 1 closer and n − size[v] get 1 farther.", "ans[v] = ans[u] − size[v] + (n − size[v])."],
      solution: `def all_distance_sums(n, edges):
    g = [[] for _ in range(n)]
    for a, b in edges:
        g[a].append(b)
        g[b].append(a)
    parent = [-1] * n
    order = [0]
    seen = [False] * n
    seen[0] = True
    for u in order:
        for v in g[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                order.append(v)
    size = [1] * n
    ans = [0] * n
    for u in reversed(order[1:]):
        size[parent[u]] += size[u]
        ans[parent[u]] += ans[u] + size[u]
    for u in order[1:]:
        ans[u] = ans[parent[u]] - size[u] + (n - size[u])
    return ans`,
      why: "One bottom-up pass and one top-down rerooting pass give every node's answer in O(n).", time: "O(n)",
      hidden: [["3, [[0, 1], [1, 2]]", "[3, 2, 3]"], ["4, [[0, 1], [0, 2], [0, 3]]", "[3, 5, 5, 5]"], ["30000, [[i, i + 1] for i in range(29999)]", "[i * (i + 1) // 2 + (29999 - i) * (30000 - i) // 2 for i in range(30000)]"]] }
  ]
});
