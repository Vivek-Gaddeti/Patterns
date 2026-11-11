PAT("bst", {
  time: "O(h)", space: "O(h)",
  lede: "In a binary search tree everything left of a node is smaller and everything right is bigger. Use that to walk straight to a value (O(h)), prune whole subtrees, or read values in sorted order with an inorder traversal.",
  idea: "Two facts do most of the work. **Ordering:** at each node you know which side the answer is on, so searches, inserts and LCA follow a single path. **Inorder = sorted:** left, node, right visits values in increasing order, so “kth smallest”, “validate” and “fix two swapped nodes” become problems about a sorted sequence.",
  analogy: "A phone book: you never read every page to find a name; you open it, see whether the name comes before or after, and throw away half.",
  flavours: [["Use", "How", "Problems"], [
    ["**Walk one path**", "go left if target < node.val else right", "search, insert, closest value, LCA"],
    ["**Pass a valid range down**", "`(low, high)` bounds per subtree", "validate BST, range sum with pruning"],
    ["**Inorder = sorted**", "left → node → right, often iteratively", "kth smallest, recover swapped nodes"],
    ["**Build from sorted**", "middle element becomes the root", "sorted array → balanced BST"]]],
  signals: [["The problem says **binary search tree**", "use the ordering"], ["“Kth smallest / largest”, “in order”", "inorder traversal"], ["“Validate”, “is it a BST?”", "min/max bounds"], ["Closest value, floor / ceiling", "walk one path"]],
  not: "**Not this pattern** when the tree has no ordering (→ tree DFS / BFS), or when you need many order-statistic queries with updates (→ balanced trees / segment trees, or `sortedcontainers` outside OAs).",
  templates: [
    ["Walk one path", "search.py", `class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def search(node, target):
    while node and node.val != target:
        node = node.left if target < node.val else node.right
    return node

root = T(4, T(2, T(1), T(3)), T(7))
print(search(root, 3).val, search(root, 5))`, "3 None"],
    ["Inorder (iterative)", "inorder.py", `class T:
    def __init__(self, v, l=None, r=None):
        self.val, self.left, self.right = v, l, r

def kth_smallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:                        # go as far left as possible
            stack.append(node)
            node = node.left
        node = stack.pop()                 # next value in sorted order
        k -= 1
        if k == 0:
            return node.val
        node = node.right

root = T(5, T(3, T(2, T(1)), T(4)), T(6))
print(kth_smallest(root, 3))`, "3"]
  ],
  examples: [
    { t: "Validate Binary Search Tree", d: "Medium", lc: "validate-binary-search-tree", f: "Range",
      q: "Is the tree a valid BST (strictly smaller left, strictly bigger right, recursively)?",
      idea: "Comparing a node only with its children isn't enough; pass the allowed (low, high) range down.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def valid(node, lo=float("-inf"), hi=float("inf")):
    if not node: return True
    if not lo < node.val < hi: return False
    return valid(node.left, lo, node.val) and valid(node.right, node.val, hi)

print(valid(T(2, T(1), T(3))), valid(T(5, T(1), T(4, T(3), T(6)))))`, out: "True False", cx: "O(n)" },
    { t: "LCA of a BST", d: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree", f: "Walk one path",
      q: "Lowest common ancestor of p and q in a BST.",
      idea: "If both are smaller go left, if both bigger go right; otherwise you're at the split point.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def lca(node, p, q):
    while node:
        if p < node.val and q < node.val: node = node.left
        elif p > node.val and q > node.val: node = node.right
        else: return node.val

root = T(6, T(2, T(0), T(4, T(3), T(5))), T(8, T(7), T(9)))
print(lca(root, 2, 8), lca(root, 3, 5))`, out: "6 4", cx: "O(h)" },
    { t: "Convert Sorted Array to BST", d: "Easy", lc: "convert-sorted-array-to-binary-search-tree", f: "Build",
      q: "Build a height-balanced BST from a sorted array.",
      idea: "The middle value is the root; build the halves recursively.",
      code: `class T:
    def __init__(s, v, l=None, r=None): s.val, s.left, s.right = v, l, r

def build(a, lo=0, hi=None):
    if hi is None: hi = len(a) - 1
    if lo > hi: return None
    mid = (lo + hi) // 2
    return T(a[mid], build(a, lo, mid - 1), build(a, mid + 1, hi))

def inorder(n): return inorder(n.left) + [n.val] + inorder(n.right) if n else []
r = build([-10, -3, 0, 5, 9])
print(r.val, inorder(r))`, out: "0 [-10, -3, 0, 5, 9]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Validating by comparing only parent and children", "A deeper node can still break the rule: pass (low, high) bounds."],
    ["Forgetting duplicates rules", "Read whether equal values go left, right or are forbidden."],
    ["Assuming O(log n)", "Operations are O(h); a skewed BST has h = n."],
    ["Recursion depth on skewed trees", "Use the iterative inorder with an explicit stack for very deep trees."]
  ],
  edge: ["Empty tree", "Single node", "Skewed (sorted insert) tree", "Target not present", "Values at integer limits"],
  compare: [
    ["Tree DFS", "tree-dfs", "Without the ordering you must visit every node; with it you follow one path."],
    ["Binary Search", "binary-search", "A BST is binary search turned into a data structure that supports inserts."],
    ["Top-K / Heaps", "top-k", "For kth smallest in a stream of updates, a heap is often simpler than a BST."]
  ],
  mcq: [
    ["Inorder traversal of a BST visits values…", ["In insertion order", "In increasing order", "Level by level", "In random order"], 1, "Left subtree (smaller), node, right subtree (bigger)."],
    ["Why isn't `left.val < node.val < right.val` at every node enough to validate a BST?", ["It is enough", "A deeper descendant can still be on the wrong side of an ancestor", "Because of duplicates only", "Because of recursion limits"], 1, "e.g. a right subtree containing a value smaller than the root deeper down."]
  ],
  summary: {
    oneLine: "Left < node < right: walk one path for search/insert/LCA; inorder gives sorted order.",
    signals: ["Binary **search** tree in the statement", "Kth smallest / in order", "Validate a BST", "Closest / floor / ceiling"],
    template: `def valid(node, lo=-inf, hi=inf):
    if not node: return True
    if not lo < node.val < hi: return False
    return valid(node.left, lo, node.val) and \\
           valid(node.right, node.val, hi)`,
    pitfalls: ["Pass bounds, not just parent checks", "O(h) can be O(n)", "Know the duplicates rule"],
    cx: "O(h) per search · O(n) traversals",
    drill: { task: "Return `True` if the tree is a valid binary search tree (strictly smaller on the left, strictly bigger on the right, at every level).",
      ref: `def is_bst(root):
    def ok(node, lo, hi):
        if not node:
            return True
        if not lo < node.val < hi:
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))`,
      tests: [["build_tree([2, 1, 3])", "True"], ["build_tree([5, 1, 4, None, None, 3, 6])", "False"], ["build_tree([5, 4, 6, None, None, 3, 7])", "False"]] }
  },
  problems: [
    { id: "bst-find", title: "Find in the Catalogue", d: "Easy", lc: "search-in-a-binary-search-tree",
      statement: "`root` is a binary search tree. Return the subtree rooted at the node with value `val`, or `None` if it isn't there. (The checker reads the subtree level by level.)",
      examples: [["build_tree([4, 2, 7, 1, 3]), 2", "[2, 1, 3]", ""], ["build_tree([4, 2, 7, 1, 3]), 5", "[]", ""]],
      constraints: ["1 ≤ nodes ≤ 5000"],
      hints: ["Compare with the current node and go left or right.", "No need to visit the other side."],
      solution: `def bst_find(root, val):
    node = root
    while node and node.val != val:
        node = node.left if val < node.val else node.right
    return node`,
      conv: "tree_to_list(r)",
      why: "The BST ordering points to exactly one child at each step.", time: "O(h)",
      hidden: [["build_tree([1]), 1", "[1]"], ["build_tree([2, 1, 3]), 3", "[3]"], ["build_tree([5, 3, 8, 2, 4, 7, 9]), 8", "[8, 7, 9]"]] },
    { id: "closest-price", title: "Closest Price", d: "Easy", lc: "closest-binary-search-tree-value",
      statement: "`root` is a BST of prices and `target` is a float. Return the stored value closest to `target`; if two are equally close, return the **smaller** one.",
      examples: [["build_tree([4, 2, 5, 1, 3]), 3.714286", "4", ""], ["build_tree([1]), 4.428571", "1", ""], ["build_tree([4, 2, 5]), 3.5", "4", "Only 2, 4 and 5 exist; 4 is 0.5 away."]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["Walk down the BST like a search.", "Update the best answer at every node you pass."],
      solution: `def closest_price(root, target):
    best = root.val
    node = root
    while node:
        if abs(node.val - target) < abs(best - target) or (abs(node.val - target) == abs(best - target) and node.val < best):
            best = node.val
        node = node.left if target < node.val else node.right
    return best`,
      why: "The closest value lies on the search path for target, so one path is enough.", time: "O(h)",
      hidden: [["build_tree([2, 1, 3]), 2.5", "2"], ["build_tree([10, 5, 15]), 100.0", "15"], ["build_tree([8, 4, 12, 2, 6, 10, 14]), 9.0", "8"]] },
    { id: "price-band-total", title: "Price Band Total", d: "Easy", lc: "range-sum-of-bst",
      statement: "Return the sum of all values in the BST that lie in the inclusive range `[low, high]`.",
      examples: [["build_tree([10, 5, 15, 3, 7, None, 18]), 7, 15", "32", "7 + 10 + 15"], ["build_tree([10, 5, 15, 3, 7, 13, 18, 1, None, 6]), 6, 10", "23", ""]],
      constraints: ["1 ≤ nodes ≤ 2·10⁴"],
      hints: ["If node.val < low, only the right subtree can contain values in range.", "If node.val > high, only the left subtree can."],
      solution: `def band_total(root, low, high):
    if not root:
        return 0
    if root.val < low:
        return band_total(root.right, low, high)
    if root.val > high:
        return band_total(root.left, low, high)
    return root.val + band_total(root.left, low, high) + band_total(root.right, low, high)`,
      why: "The ordering lets you skip whole subtrees that can't contain values in the band.", time: "O(n) worst, often much less",
      hidden: [["build_tree([5]), 1, 10", "5"], ["build_tree([5]), 6, 10", "0"], ["build_tree([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]), 1, 15", "120"]] },
    { id: "balanced-from-sorted", title: "Balanced From Sorted", d: "Easy", lc: "convert-sorted-array-to-binary-search-tree",
      statement: "Build a height-balanced BST from the sorted list `nums`. Use the element at index `(lo + hi) // 2` of each range as its root (so the answer is unique). Return the root; the checker reads it level by level.",
      examples: [["[-10, -3, 0, 5, 9]", "[0, -10, 5, None, -3, None, 9]", ""], ["[1, 3]", "[1, None, 3]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁴", "nums is strictly increasing"],
      hints: ["The middle element becomes the root.", "Recursively build the left half and the right half."],
      solution: `def balanced_from_sorted(nums):
    def build(lo, hi):
        if lo > hi:
            return None
        mid = (lo + hi) // 2
        return TreeNode(nums[mid], build(lo, mid - 1), build(mid + 1, hi))
    return build(0, len(nums) - 1)`,
      conv: "tree_to_list(r)",
      why: "Choosing the middle keeps both halves the same size, so the tree is balanced, and the order makes it a BST.", time: "O(n)",
      hidden: [["[1]", "[1]"], ["[1, 2, 3]", "[2, 1, 3]"], ["list(range(7))", "[3, 1, 5, 0, 2, 4, 6]"]] },
    { id: "check-catalogue", title: "Check the Catalogue", d: "Medium", lc: "validate-binary-search-tree",
      statement: "Return `True` if the tree is a valid BST: every node's left subtree holds only **smaller** values, its right subtree only **larger** values, and both subtrees are BSTs.",
      examples: [["build_tree([2, 1, 3])", "True", ""], ["build_tree([5, 1, 4, None, None, 3, 6])", "False", "4 is in 5's right subtree."], ["build_tree([2, 2, 2])", "False", "Equal values aren't allowed."]],
      constraints: ["1 ≤ nodes ≤ 10⁴"],
      hints: ["Comparing a node with its children isn't enough.", "Pass down the range (low, high) that the subtree must stay within."],
      solution: `def check_catalogue(root):
    def ok(node, lo, hi):
        if not node:
            return True
        if not lo < node.val < hi:
            return False
        return ok(node.left, lo, node.val) and ok(node.right, node.val, hi)
    return ok(root, float("-inf"), float("inf"))`,
      why: "Every ancestor tightens the allowed range; a node outside its range breaks the BST property.", time: "O(n)",
      hidden: [["build_tree([1])", "True"], ["build_tree([5, 4, 6, None, None, 3, 7])", "False"], ["build_tree([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15])", "True"]] },
    { id: "kth-cheapest", title: "Kth Cheapest", d: "Medium", lc: "kth-smallest-element-in-a-bst",
      statement: "Return the `k`-th smallest value (1-indexed) in the BST.",
      examples: [["build_tree([3, 1, 4, None, 2]), 1", "1", ""], ["build_tree([5, 3, 6, 2, 4, None, None, 1]), 3", "3", ""]],
      constraints: ["1 ≤ k ≤ nodes ≤ 10⁴"],
      hints: ["Inorder traversal visits values in sorted order.", "Stop as soon as you've visited k nodes (an explicit stack makes stopping easy)."],
      solution: `def kth_cheapest(root, k):
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val
        node = node.right`,
      why: "Iterative inorder yields values in increasing order and can stop early after k of them.", time: "O(h + k)",
      hidden: [["build_tree([1]), 1", "1"], ["build_tree([2, 1, 3]), 3", "3"], ["build_tree([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]), 10", "10"]] },
    { id: "bst-common-boss", title: "Common Boss in a BST", d: "Medium", lc: "lowest-common-ancestor-of-a-binary-search-tree",
      statement: "In a BST with unique values, return the value of the lowest common ancestor of the nodes with values `p` and `q` (both exist).",
      examples: [["build_tree([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]), 2, 8", "6", ""], ["build_tree([6, 2, 8, 0, 4, 7, 9, None, None, 3, 5]), 2, 4", "2", ""]],
      constraints: ["2 ≤ nodes ≤ 10⁵"],
      hints: ["If both values are smaller than the node, the LCA is on the left.", "If both are larger, it's on the right.", "Otherwise this node splits them: it's the LCA."],
      solution: `def bst_common_boss(root, p, q):
    node = root
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node.val`,
      why: "The first node whose value lies between p and q (inclusive) is where their search paths split.", time: "O(h)",
      hidden: [["build_tree([2, 1]), 2, 1", "2"], ["build_tree([5, 3, 8, 2, 4, 7, 9]), 7, 9", "8"], ["build_tree([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]), 5, 7", "6"]] },
    { id: "bst-add", title: "Add to the Catalogue", d: "Medium", lc: "insert-into-a-binary-search-tree",
      statement: "Insert `val` (not already present) into the BST as a **new leaf** in the standard place: walk down comparing values and attach it where you fall off. Return the root; the checker reads the tree level by level.",
      examples: [["build_tree([4, 2, 7, 1, 3]), 5", "[4, 2, 7, 1, 3, 5]", ""], ["build_tree([]), 5", "[5]", ""]],
      constraints: ["0 ≤ nodes ≤ 10⁴"],
      hints: ["An empty tree becomes a single node.", "Walk down; when the child on your side is None, attach the new node there."],
      solution: `def bst_add(root, val):
    if not root:
        return TreeNode(val)
    node = root
    while True:
        if val < node.val:
            if node.left:
                node = node.left
            else:
                node.left = TreeNode(val)
                break
        else:
            if node.right:
                node = node.right
            else:
                node.right = TreeNode(val)
                break
    return root`,
      conv: "tree_to_list(r)",
      why: "Following the search path to its end finds the unique leaf position that keeps the BST valid.", time: "O(h)",
      hidden: [["build_tree([1]), 2", "[1, None, 2]"], ["build_tree([5, 3, 8]), 4", "[5, 3, 8, None, 4]"], ["build_tree([8, 4, 12]), 13", "[8, 4, 12, None, None, None, 13]"]] },
    { id: "bst-remove", title: "Remove From the Catalogue", d: "Medium", lc: "delete-node-in-a-bst",
      statement: "Delete the node with value `key` (if present) from the BST and return the root. If the node has two children, replace its value with its **inorder successor** (smallest value in its right subtree) and delete that successor instead. The checker reads the tree level by level.",
      examples: [["build_tree([5, 3, 6, 2, 4, None, 7]), 3", "[5, 4, 6, 2, None, None, 7]", ""], ["build_tree([5, 3, 6, 2, 4, None, 7]), 0", "[5, 3, 6, 2, 4, None, 7]", "Not present."]],
      constraints: ["0 ≤ nodes ≤ 10⁴"],
      hints: ["Find the node recursively, returning the (possibly new) subtree root.", "0 or 1 child: return the other child.", "2 children: copy the successor's value, then delete the successor from the right subtree."],
      solution: `def bst_remove(root, key):
    if not root:
        return None
    if key < root.val:
        root.left = bst_remove(root.left, key)
    elif key > root.val:
        root.right = bst_remove(root.right, key)
    else:
        if not root.left:
            return root.right
        if not root.right:
            return root.left
        succ = root.right
        while succ.left:
            succ = succ.left
        root.val = succ.val
        root.right = bst_remove(root.right, succ.val)
    return root`,
      conv: "tree_to_list(r)",
      why: "Replacing with the inorder successor keeps every left value smaller and every right value larger.", time: "O(h)",
      hidden: [["build_tree([1]), 1", "[]"], ["build_tree([5, 3, 6]), 5", "[6, 3]"], ["build_tree([8, 4, 12, 2, 6, 10, 14]), 4", "[8, 6, 12, 2, None, 10, 14]"]] },
    { id: "fix-two-swapped", title: "Fix Two Swapped", d: "Hard", lc: "recover-binary-search-tree",
      statement: "Exactly two node values of a BST were swapped by mistake. Fix the tree **in place** without changing its shape. Return nothing; the checker reads the tree level by level.",
      examples: [["build_tree([1, 3, None, None, 2])", "[3, 1, None, None, 2]", ""], ["build_tree([3, 1, 4, None, None, 2])", "[2, 1, 4, None, None, 3]", ""]],
      constraints: ["2 ≤ nodes ≤ 1000"],
      hints: ["Inorder should be increasing; a swap creates one or two “drops”.", "The first wrong node is the bigger value at the first drop; the second is the smaller value at the last drop.", "Swap their values back."],
      solution: `def fix_two_swapped(root):
    first = second = prev = None
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev and prev.val > node.val:
            if not first:
                first = prev
            second = node
        prev = node
        node = node.right
    first.val, second.val = second.val, first.val`,
      conv: "tree_to_list(args[0])",
      why: "In a sorted sequence with two elements swapped, the drops in order pinpoint both elements.", time: "O(n)",
      hidden: [["build_tree([2, 3, 1])", "[2, 1, 3]"], ["build_tree([5, 3, 9, -2147483648, 2])", "[5, 2, 9, -2147483648, 3]"], ["build_tree([8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 15, 9, 11, 13, 7])", "[8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15]"]] }
  ]
});
