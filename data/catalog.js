/* Every pattern on the site: metadata only. Full content lives in data/patterns/<id>.js */
window.GROUPS = [
  { id: "arrays",  name: "Arrays & Strings",    color: "yellow" },
  { id: "stacks",  name: "Stacks & Queues",     color: "pink" },
  { id: "search",  name: "Searching",           color: "blue" },
  { id: "lists",   name: "Linked Lists",        color: "green" },
  { id: "trees",   name: "Trees & Tries",       color: "purple" },
  { id: "heaps",   name: "Heaps",               color: "orange" },
  { id: "recur",   name: "Recursion",           color: "cyan" },
  { id: "graphs",  name: "Graphs",              color: "blue" },
  { id: "dp",      name: "Dynamic Programming", color: "pink" },
  { id: "greedy",  name: "Greedy & Bits",       color: "green" },
  { id: "math",    name: "Math & Implementation", color: "orange" },
  { id: "adv",     name: "Advanced",            color: "purple" }
];

/* [id, group, title, one-liner, time, practice count, OA frequency 3/2/1, new?] */
window.CATALOG = [
  ["hashing", "arrays", "Hashing: Seen / Count / Group", "Trade memory for O(1) lookups.", "O(n)", 14, 3],
  ["prefix-sum", "arrays", "Prefix Sum (+ Hash Map)", "Any range sum in O(1) after one pass.", "O(n)", 12, 3],
  ["two-pointers", "arrays", "Two Pointers", "Two indices replace a nested loop.", "O(n)", 15, 3],
  ["sliding-window-fixed", "arrays", "Sliding Window: Fixed", "Slide a k-sized window, update in O(1).", "O(n)", 10, 3],
  ["sliding-window-variable", "arrays", "Sliding Window: Variable", "Grow right, shrink left while invalid.", "O(n)", 14, 3],
  ["kadane", "arrays", "Kadane's Algorithm", "Best subarray ending here.", "O(n)", 9, 2],
  ["cyclic-sort", "arrays", "Index as Hash (Cyclic Sort)", "Values 1..n tell you where they belong.", "O(n)", 8, 1],
  ["matrix", "arrays", "Matrix Traversal Tricks", "Spirals, rotations, in-place marks.", "O(mn)", 10, 2],
  ["intervals", "arrays", "Intervals: Sort + Sweep", "Sort by start, then merge or count.", "O(n log n)", 12, 3],
  ["line-sweep", "arrays", "Line Sweep & Difference Array", "Events at +1 / −1, then scan.", "O(n log n)", 9, 2, 1],
  ["string-matching", "arrays", "String Matching (KMP / Rolling Hash)", "Find a pattern in linear time.", "O(n + m)", 8, 1, 1],
  ["string-manipulation", "arrays", "String Building & Parsing", "Split, join, count and rebuild strings.", "O(n)", 10, 3, 1],

  ["monotonic-stack", "stacks", "Monotonic Stack", "Next greater / smaller in one pass.", "O(n)", 13, 2],
  ["monotonic-deque", "stacks", "Monotonic Deque", "Window max / min in O(1) amortised.", "O(n)", 7, 1],
  ["stack-parsing", "stacks", "Stack for Parsing & Matching", "Brackets, calculators, decode strings.", "O(n)", 11, 2, 1],

  ["binary-search", "search", "Binary Search: Sorted / Rotated", "Halve the search space every step.", "O(log n)", 13, 3],
  ["binary-search-answer", "search", "Binary Search on the Answer", "Guess the answer, check if it works.", "O(n log W)", 11, 3],

  ["fast-slow", "lists", "Fast & Slow Pointers", "Cycles, middles, and happy numbers.", "O(n)", 9, 1],
  ["ll-reversal", "lists", "In-place Reversal & Dummy Nodes", "Rewire next pointers safely.", "O(n)", 11, 1],

  ["tree-dfs", "trees", "Tree DFS", "Children report up, parent combines.", "O(n)", 16, 2],
  ["tree-bfs", "trees", "Tree BFS (Level Order)", "A queue, one level at a time.", "O(n)", 10, 2],
  ["bst", "trees", "BST Properties", "Inorder is sorted; prune by range.", "O(h)", 10, 1, 1],
  ["trie", "trees", "Trie (Prefix Tree)", "Share prefixes, search by character.", "O(L)", 8, 1, 1],

  ["top-k", "heaps", "Top-K Elements", "Keep a heap of size k.", "O(n log k)", 11, 3],
  ["two-heaps", "heaps", "Two Heaps", "Balance two halves for a running median.", "O(log n)", 6, 1],
  ["k-way-merge", "heaps", "K-way Merge", "Pop the smallest head across k lists.", "O(n log k)", 7, 1],

  ["backtracking", "recur", "Backtracking", "Choose → explore → un-choose.", "O(2ⁿ)", 16, 2],

  ["graph-traversal", "graphs", "Graph DFS / BFS (incl. grids)", "Visit everything reachable once.", "O(V + E)", 15, 3],
  ["multi-source-bfs", "graphs", "Multi-source BFS", "Start the queue with every source.", "O(V + E)", 7, 2],
  ["topo-sort", "graphs", "Topological Sort", "Order tasks by their dependencies.", "O(V + E)", 7, 2],
  ["union-find", "graphs", "Union-Find", "Merge groups, ask \"same group?\" fast.", "O(α(n))", 9, 2],
  ["shortest-paths", "graphs", "Shortest Paths: Dijkstra & Bellman-Ford", "Weighted distances with a heap.", "O(E log V)", 8, 2],
  ["mst", "graphs", "Minimum Spanning Tree", "Cheapest way to connect everything.", "O(E log E)", 4, 1],

  ["dp-1d", "dp", "1-D DP", "Answer at i from answers before i.", "O(n)", 15, 3],
  ["knapsack", "dp", "Knapsack DP (0/1 & Unbounded)", "Take it or leave it, with a budget.", "O(n · W)", 10, 3],
  ["grid-dp", "dp", "Grid DP", "Each cell from its top and left.", "O(mn)", 8, 2],
  ["two-strings-dp", "dp", "DP on Two Strings", "dp[i][j] over two prefixes.", "O(mn)", 10, 2],
  ["interval-dp", "dp", "Interval DP & Palindromes", "Solve dp[l][r] from shorter ranges.", "O(n²–n³)", 8, 1],
  ["state-machine-dp", "dp", "State Machine DP", "A few states per day, clear transitions.", "O(n)", 6, 1],
  ["lis", "dp", "LIS & Patience Sorting", "Longest increasing subsequence in n log n.", "O(n log n)", 7, 2, 1],
  ["tree-dp", "dp", "Tree DP", "Return a tuple of states from each child.", "O(n)", 7, 1, 1],
  ["bitmask-dp", "dp", "Bitmask DP", "Subsets as integers, for n ≤ 20.", "O(2ⁿ · n)", 6, 1, 1],

  ["greedy", "greedy", "Greedy", "Locally best choice, proven by exchange.", "O(n log n)", 15, 3],
  ["bits", "greedy", "Bit Manipulation Tricks", "XOR, masks, and lowest set bits.", "O(n)", 11, 2],

  ["number-theory", "math", "Number Theory: GCD, Primes, Mod", "gcd, sieve, fast power, mod 10⁹+7.", "O(n log log n)", 10, 3, 1],
  ["combinatorics", "math", "Counting & nCr mod p", "Count arrangements without overflow.", "O(n)", 7, 2, 1],
  ["simulation", "math", "Simulation & Implementation", "Do exactly what the statement says, carefully.", "varies", 12, 3, 1],
  ["custom-sort", "math", "Sorting with Custom Keys", "Sort by tuples, lambdas and cmp_to_key.", "O(n log n)", 8, 3, 1],

  ["segment-fenwick", "adv", "Segment Tree & Fenwick Tree", "Range queries with point updates.", "O(log n)", 7, 1, 1],
  ["design", "adv", "Design Problems (LRU & co.)", "Combine structures for O(1) operations.", "O(1)", 9, 2, 1]
].map(([id, group, title, sub, cx, n, freq, isNew], i) => ({ id, group, title, sub, cx, n, freq, isNew: !!isNew, num: i + 1 }));

window.FREQ = ["", "Low", "Medium", "High"];
