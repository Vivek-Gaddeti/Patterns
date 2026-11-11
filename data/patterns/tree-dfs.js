PAT("tree-dfs", {
  time: "O(n)", space: "O(h)",
  lede: "Solve a tree problem by trusting recursion: ask each child for its answer, combine those answers at the parent. Or pass information down from parent to children.",
  idea: "Every tree is a root plus two smaller trees. So write a function that answers the question for **one node, assuming it already has the answers for its children**. Two shapes cover almost everything: **bottom-up** (children return values, the parent combines: height, diameter, balanced) and **top-down** (the parent passes state like a running sum or allowed range down to the children).",
  analogy: "A company asking “how many people work here?”: each manager asks their direct reports, adds them up, adds one for themselves, and reports upward.",
  flavours: [["Shape", "Function looks like", "Problems"], [
    ["**Bottom-up**", "`def f(node): l = f(node.left); r = f(node.right); return combine(l, r)`", "height, diameter, balanced, max path sum"],
    ["**Top-down**", "`def f(node, state): … f(node.left, new_state)`", "path sum, root-to-leaf paths, good nodes"],
    ["**Return + global best**", "return what the parent needs, update a best answer on the side", "diameter, max path sum"],
    ["**Two trees together**", "`def f(a, b)` walks both in step", "same tree, symmetric, subtree"]]],
  signals: [["Any question about a binary tree's depth, paths or structure", "recursion fits naturally"], ["“Root-to-leaf”, “path sum”, “all paths”", "top-down with state"], ["“Diameter”, “balanced”, “maximum path”", "bottom-up with a global best"], ["Lowest common ancestor", "children report whether they found p or q"]],
  not: "**Not this pattern** when the question is about levels (“level by level”, “rightmost at each depth”, “minimum depth” in a huge tree) → BFS, or when the tree is a BST and you can prune by value (→ BST properties).",
  templates: [
    ["Bottom-up", "bottom_up.py", `class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def height(node):
    if not node:
        return 0                           # base case: empty tree
    return 1 + max(height(node.left), height(node.right))

def diameter(root):
    best = 0
    def depth(node):
        nonlocal best
        if not node:
            return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)            # longest path through this node
        return 1 + max(l, r)               # what the parent needs
    depth(root)
    return best

root = T(1, T(2, T(4), T(5)), T(3))
print(height(root), diameter(root))`, "3 3"],
    ["Top-down", "top_down.py", `class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def has_path_sum(node, target):
    if not node:
        return False
    target -= node.val                     # pass the remaining sum down
    if not node.left and not node.right:
        return target == 0                 # leaf: did we use it all up?
    return has_path_sum(node.left, target) or has_path_sum(node.right, target)

root = T(5, T(4, T(11, T(7), T(2))), T(8, T(13), T(4, None, T(1))))
print(has_path_sum(root, 22), has_path_sum(root, 26), has_path_sum(root, 5))`, "True True False"]
  ],
  examples: [
    { t: "Lowest Common Ancestor", d: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree", f: "Bottom-up",
      q: "Lowest node that has both p and q as descendants (a node counts as its own descendant).",
      idea: "Return p or q if you are one; if both subtrees return something, you are the LCA.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def lca(node, p, q):
    if not node or node is p or node is q:
        return node
    l, r = lca(node.left, p, q), lca(node.right, p, q)
    return node if l and r else l or r

a, b = T(6), T(4)
root = T(3, T(5, a, T(2, T(7), b)), T(1, T(0), T(8)))
print(lca(root, a, b).val, lca(root, a, root.right).val)`, out: "5 3", cx: "O(n)" },
    { t: "Binary Tree Maximum Path Sum", d: "Hard", lc: "binary-tree-maximum-path-sum", f: "Return + global best",
      q: "Max sum of any path (any node to any node).",
      idea: "Each node returns its best downward gain (≥ 0). The path that bends at this node is `val + left + right`; track the best.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def max_path(root):
    best = float("-inf")
    def gain(n):
        nonlocal best
        if not n: return 0
        l, r = max(gain(n.left), 0), max(gain(n.right), 0)
        best = max(best, n.val + l + r)
        return n.val + max(l, r)
    gain(root)
    return best

print(max_path(T(-10, T(9), T(20, T(15), T(7)))))`, out: "42", cx: "O(n)" },
    { t: "Symmetric Tree", d: "Easy", lc: "symmetric-tree", f: "Two trees together",
      q: "Is the tree a mirror image of itself?",
      idea: "Compare left subtree with right subtree: outer pairs and inner pairs must match.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def mirror(a, b):
    if not a or not b: return a is b
    return a.val == b.val and mirror(a.left, b.right) and mirror(a.right, b.left)

t = T(1, T(2, T(3), T(4)), T(2, T(4), T(3)))
print(mirror(t.left, t.right))`, out: "True", cx: "O(n)" }
  ],
  pitfalls: [
    ["Missing the `None` base case", "Every recursive tree function starts with “if not node: return …”."],
    ["Returning the global answer instead of what the parent needs", "Diameter: return the depth, but record left + right on the side."],
    ["Treating a single-child node as a leaf", "A leaf has **no** children; `not node.left and not node.right`."],
    ["Deep trees and recursion limits", "Python's default limit is 1000; a 10⁵-node chain needs `sys.setrecursionlimit` or an explicit stack."]
  ],
  edge: ["Empty tree", "Single node", "Skewed tree (a linked-list shape)", "Negative values", "Duplicate values"],
  compare: [
    ["Tree BFS", "tree-bfs", "Level questions (per-level averages, right side view) are natural with a queue."],
    ["BST Properties", "bst", "If it's a BST, use the ordering to prune instead of visiting everything."],
    ["Tree DP", "tree-dp", "When each node must return several states (rob / don't rob), it's tree DP: DFS returning a tuple."]
  ],
  mcq: [
    ["For the diameter, what should the recursive function return?", ["The diameter of the subtree", "The depth of the subtree (longest downward path)", "The number of nodes", "Nothing"], 1, "The parent can only extend a downward path; the bent path is recorded separately."],
    ["Which is a leaf?", ["A node with one child", "A node with no children", "The root", "Any node with value 0"], 1, "Only nodes without children end a root-to-leaf path."]
  ],
  summary: {
    oneLine: "Answer for one node assuming the children's answers: bottom-up returns, top-down passes state.",
    signals: ["Height / depth / balanced / diameter", "Root-to-leaf paths and path sums", "LCA", "Compare two trees"],
    template: `def f(node):
    if not node:
        return BASE
    l, r = f(node.left), f(node.right)
    # update a global best if needed
    return combine(node.val, l, r)`,
    pitfalls: ["Base case for None", "Return what the parent needs", "Leaf = no children", "Recursion limit for deep trees"],
    cx: "O(n) time · O(h) stack",
    drill: { task: "Return the maximum depth (number of nodes on the longest root-to-leaf path) of the tree.",
      ref: `def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))`,
      tests: [["build_tree([3, 9, 20, None, None, 15, 7])", "3"], ["build_tree([1, None, 2])", "2"], ["build_tree([])", "0"]] }
  },
  problems: [
    { id: "tree-height", title: "Tree Height", d: "Easy", lc: "maximum-depth-of-binary-tree",
      statement: "Return the number of nodes on the longest path from the root down to a leaf. (Trees in the examples are written level by level, with `None` for missing children.)",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "3", ""], ["build_tree([1, None, 2])", "2", ""], ["build_tree([])", "0", ""]],
      constraints: ["0 ≤ nodes ≤ 10⁴"],
      hints: ["The empty tree has height 0.", "Height = 1 + the taller child's height."],
      solution: `def tree_height(root):
    if not root:
        return 0
    return 1 + max(tree_height(root.left), tree_height(root.right))`,
      why: "Each node's height depends only on its children's heights: classic bottom-up recursion.", time: "O(n)",
      hidden: [["build_tree([1])", "1"], ["build_tree([1, 2, None, 3, None, 4])", "4"], ["build_tree(list(range(1, 10001)))", "14"]] },
    { id: "twin-trees", title: "Twin Trees", d: "Easy", lc: "same-tree",
      statement: "Return `True` if two binary trees have exactly the same shape and the same values.",
      examples: [["build_tree([1, 2, 3]), build_tree([1, 2, 3])", "True", ""], ["build_tree([1, 2]), build_tree([1, None, 2])", "False", ""]],
      constraints: ["0 ≤ nodes ≤ 100 in each tree"],
      hints: ["Walk both trees together.", "Both empty → True; one empty → False; otherwise compare values and recurse."],
      solution: `def twin_trees(a, b):
    if not a or not b:
        return a is b
    return a.val == b.val and twin_trees(a.left, b.left) and twin_trees(a.right, b.right)`,
      why: "Two trees are equal iff their roots match and both pairs of subtrees are equal.", time: "O(n)",
      hidden: [["build_tree([]), build_tree([])", "True"], ["build_tree([1, 2, 1]), build_tree([1, 1, 2])", "False"], ["build_tree(list(range(100))), build_tree(list(range(100)))", "True"]] },
    { id: "mirror-check", title: "Mirror Check", d: "Easy", lc: "symmetric-tree",
      statement: "Return `True` if the tree is symmetric around its centre (its left side is a mirror image of its right side).",
      examples: [["build_tree([1, 2, 2, 3, 4, 4, 3])", "True", ""], ["build_tree([1, 2, 2, None, 3, None, 3])", "False", ""]],
      constraints: ["1 ≤ nodes ≤ 1000"],
      hints: ["Compare the left subtree with the right subtree.", "Outer pair: left.left with right.right. Inner pair: left.right with right.left."],
      solution: `def mirror_check(root):
    def same(a, b):
        if not a or not b:
            return a is b
        return a.val == b.val and same(a.left, b.right) and same(a.right, b.left)
    return same(root.left, root.right)`,
      why: "A mirror pairs each node with its opposite-side counterpart; walking both in step checks every pair once.", time: "O(n)",
      hidden: [["build_tree([1])", "True"], ["build_tree([1, 2, 3])", "False"], ["build_tree([1, 2, 2, 3, None, None, 3])", "True"]] },
    { id: "sum-to-leaf", title: "Sum to a Leaf", d: "Easy", lc: "path-sum",
      statement: "Return `True` if some **root-to-leaf** path has values adding up to `target`.",
      examples: [["build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, None, 1]), 22", "True", "5 → 4 → 11 → 2"], ["build_tree([1, 2, 3]), 5", "False", ""], ["build_tree([]), 0", "False", "An empty tree has no paths."]],
      constraints: ["0 ≤ nodes ≤ 5000"],
      hints: ["Pass the remaining target down.", "At a leaf, check whether the remaining target is exactly its value."],
      solution: `def sum_to_leaf(root, target):
    if not root:
        return False
    target -= root.val
    if not root.left and not root.right:
        return target == 0
    return sum_to_leaf(root.left, target) or sum_to_leaf(root.right, target)`,
      why: "Top-down recursion carries the remaining sum; only leaves can end a path.", time: "O(n)",
      hidden: [["build_tree([1, 2]), 1", "False"], ["build_tree([-2, None, -3]), -5", "True"], ["build_tree([1] * 4095), 12", "True"]] },
    { id: "mirror-flip", title: "Flip the Tree", d: "Easy", lc: "invert-binary-tree",
      statement: "Mirror the tree (swap every node's left and right children) and return its root. The checker reads the tree level by level.",
      examples: [["build_tree([4, 2, 7, 1, 3, 6, 9])", "[4, 7, 2, 9, 6, 3, 1]", ""], ["build_tree([2, 1, 3])", "[2, 3, 1]", ""]],
      constraints: ["0 ≤ nodes ≤ 100"],
      hints: ["An empty tree flips to itself.", "Swap the children of the root, then flip each subtree."],
      solution: `def mirror_flip(root):
    if root:
        root.left, root.right = mirror_flip(root.right), mirror_flip(root.left)
    return root`,
      conv: "tree_to_list(r)",
      why: "Mirroring the whole tree = swapping at the root and mirroring both subtrees.", time: "O(n)",
      hidden: [["build_tree([])", "[]"], ["build_tree([1, 2])", "[1, None, 2]"], ["build_tree([1, 2, 3, 4, 5, 6, 7])", "[1, 3, 2, 7, 6, 5, 4]"]] },
    { id: "even-keel", title: "Even Keel", d: "Easy", lc: "balanced-binary-tree",
      statement: "A tree is *height-balanced* if, at every node, the heights of the two subtrees differ by at most 1. Return `True` if the tree is height-balanced.",
      examples: [["build_tree([3, 9, 20, None, None, 15, 7])", "True", ""], ["build_tree([1, 2, 2, 3, 3, None, None, 4, 4])", "False", ""]],
      constraints: ["0 ≤ nodes ≤ 5000"],
      hints: ["Computing height separately at every node is O(n²).", "Return the height, or −1 to signal “already unbalanced”, in one bottom-up pass."],
      solution: `def even_keel(root):
    def h(node):
        if not node:
            return 0
        l = h(node.left)
        if l < 0:
            return -1
        r = h(node.right)
        if r < 0 or abs(l - r) > 1:
            return -1
        return 1 + max(l, r)
    return h(root) >= 0`,
      why: "One pass returns heights and propagates failure upward, so it's O(n) instead of O(n²).", time: "O(n)",
      hidden: [["build_tree([])", "True"], ["build_tree([1, None, 2, None, 3])", "False"], ["build_tree(list(range(4095)))", "True"]] },
    { id: "widest-path", title: "Longest Path Across", d: "Easy", lc: "diameter-of-binary-tree",
      statement: "Return the number of **edges** on the longest path between any two nodes of the tree (the path doesn't have to go through the root).",
      examples: [["build_tree([1, 2, 3, 4, 5])", "3", "4 → 2 → 1 → 3"], ["build_tree([1, 2])", "1", ""]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["The longest path bends at some node: left depth + right depth.", "Return the depth to the parent, but record left + right in a variable."],
      solution: `def widest_path(root):
    best = 0
    def depth(node):
        nonlocal best
        if not node:
            return 0
        l, r = depth(node.left), depth(node.right)
        best = max(best, l + r)
        return 1 + max(l, r)
    depth(root)
    return best`,
      why: "Each node tries itself as the bend point using its children's depths: one O(n) pass.", time: "O(n)",
      hidden: [["build_tree([1])", "0"], ["build_tree([1, 2, None, 3, 4, 5, None, None, 6])", "4"], ["build_tree(list(range(1, 8192)))", "24"]] },
    { id: "common-boss", title: "Common Boss", d: "Medium", lc: "lowest-common-ancestor-of-a-binary-tree",
      statement: "Values are unique. Return the value of the **lowest** node that has both `p` and `q` in its subtree (a node is in its own subtree). Both values are in the tree. (The checker passes the actual nodes for p and q.)",
      examples: [["build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]), 5, 1", "3", ""], ["build_tree([3, 5, 1, 6, 2, 0, 8, None, None, 7, 4]), 5, 4", "5", "5 is an ancestor of 4."]],
      constraints: ["2 ≤ nodes ≤ 10⁵"],
      hints: ["If the current node is p or q, return it.", "Ask both children. If both return something, this node is the answer.", "Otherwise pass up whichever side found something."],
      solution: `def common_boss(root, p, q):
    if not root or root is p or root is q:
        return root
    l = common_boss(root.left, p, q)
    r = common_boss(root.right, p, q)
    return root if l and r else l or r`,
      call: "F(args[0], find_node(args[0], args[1]), find_node(args[0], args[2]))",
      conv: "r.val",
      why: "The first node where p and q come from different sides (or which is one of them) is the lowest common ancestor.", time: "O(n)",
      hidden: [["build_tree([1, 2]), 1, 2", "1"], ["build_tree([1, 2, 3, 4, 5, 6, 7]), 4, 7", "1"], ["build_tree(list(range(1, 32768))), 16384, 32767", "1"]] },
    { id: "all-leaf-paths", title: "Every Path to the Target", d: "Medium", lc: "path-sum-ii",
      statement: "Return every **root-to-leaf** path (as a list of values) whose sum equals `target`, in left-to-right order.",
      examples: [["build_tree([5, 4, 8, 11, None, 13, 4, 7, 2, None, None, 5, 1]), 22", "[[5, 4, 11, 2], [5, 8, 4, 5]]", ""], ["build_tree([1, 2, 3]), 5", "[]", ""]],
      constraints: ["0 ≤ nodes ≤ 5000"],
      hints: ["Keep the current path in a list as you go down.", "At a leaf with the right sum, save a copy of the path.", "Pop the node when you return (backtrack)."],
      solution: `def all_leaf_paths(root, target):
    out, path = [], []
    def dfs(node, remaining):
        if not node:
            return
        path.append(node.val)
        remaining -= node.val
        if not node.left and not node.right and remaining == 0:
            out.append(path[:])
        dfs(node.left, remaining)
        dfs(node.right, remaining)
        path.pop()
    dfs(root, target)
    return out`,
      why: "Top-down DFS with one shared path list; copying only at successful leaves keeps it efficient.", time: "O(n · h)",
      hidden: [["build_tree([]), 0", "[]"], ["build_tree([1, 2]), 3", "[[1, 2]]"], ["build_tree([0] * 1023), 0", "[[0] * 10] * 512"]] },
    { id: "best-route", title: "Best Route Anywhere", d: "Hard", lc: "binary-tree-maximum-path-sum",
      statement: "A *route* is any sequence of connected nodes (each node used at most once; it needn't pass through the root). Return the maximum sum of values along a non-empty route.",
      examples: [["build_tree([1, 2, 3])", "6", "2 → 1 → 3"], ["build_tree([-10, 9, 20, None, None, 15, 7])", "42", "15 → 20 → 7"], ["build_tree([-3])", "-3", ""]],
      constraints: ["1 ≤ nodes ≤ 3·10⁴", "−1000 ≤ values ≤ 1000"],
      hints: ["For each node, compute the best route going **down** from it (gain).", "Ignore negative gains from children (take max with 0).", "The best route bending at a node is val + left gain + right gain."],
      solution: `def best_route(root):
    best = float("-inf")
    def gain(node):
        nonlocal best
        if not node:
            return 0
        l = max(gain(node.left), 0)
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)
    gain(root)
    return best`,
      why: "Every route has a highest node where it bends; each node evaluates that case with its children's best downward gains.", time: "O(n)",
      hidden: [["build_tree([2, -1])", "2"], ["build_tree([-1, -2, -3])", "-1"], ["build_tree([1] * 32767)", "29"]] }
  ]
});
