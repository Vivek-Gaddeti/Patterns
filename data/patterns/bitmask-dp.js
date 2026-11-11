PAT("bitmask-dp", {
  time: "O(2ⁿ · n)", space: "O(2ⁿ)",
  lede: "When n is small (about 20 or less), a set of chosen items fits in one integer: bit i is 1 if item i is used. dp[mask] (or dp[mask][last]) stores the best answer for that exact set, and transitions add one more item.",
  idea: "Many problems care about **which** items are already used, not their order: assigning workers to jobs, visiting every city, splitting into groups. There are 2ⁿ subsets, which is fine for n ≤ 20. Represent a subset as an integer mask; `mask | (1 << i)` adds item i, `mask & (1 << i)` tests it. Process masks in increasing order (every subset of a mask is smaller than it). Add a second dimension like the last city visited when order matters at the boundary.",
  analogy: "A row of light switches, one per item: the pattern of on/off switches is a number, and you keep one notebook page per pattern.",
  flavours: [["State", "Transition", "Examples"], [
    ["**dp[mask]**", "add one unused item", "assignment, partition into groups"],
    ["**dp[mask][last]**", "go from last to an unvisited j", "travelling salesman, shortest path visiting all"],
    ["**BFS over (node, mask)**", "unweighted moves", "shortest path visiting all nodes"],
    ["**Enumerate subsets**", "`for mask in range(1 << n)`", "brute force over all subsets"]]],
  signals: [["n ≤ 15–20 and you must use / visit / assign **all** items", "exponential is expected"], ["“Assign n workers to n jobs” with costs", "dp[mask]"], ["Visit every node / city, order matters", "dp[mask][last]"], ["Split into k groups with equal sums", "dp over used items"]],
  not: "**Not this pattern** when n is large (2ⁿ explodes past ~25), or when the order of items is fixed and only a count matters (→ ordinary DP).",
  templates: [
    ["dp[mask]", "assign.py", `def min_assign(cost):                      # cost[i][j]: worker i does job j
    n = len(cost)
    INF = float("inf")
    dp = [INF] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == INF:
            continue
        i = bin(mask).count("1")               # next worker to assign
        if i == n:
            continue
        for j in range(n):
            if not mask & (1 << j):            # job j still free
                nxt = mask | (1 << j)
                dp[nxt] = min(dp[nxt], dp[mask] + cost[i][j])
    return dp[(1 << n) - 1]

print(min_assign([[9, 2, 7], [6, 4, 3], [5, 8, 1]]))`, "9"],
    ["dp[mask][last]", "tsp.py", `def shortest_tour(d):                      # visit all cities starting and ending at 0
    n = len(d)
    INF = float("inf")
    dp = [[INF] * n for _ in range(1 << n)]
    dp[1][0] = 0
    for mask in range(1 << n):
        for last in range(n):
            if dp[mask][last] == INF:
                continue
            for j in range(n):
                if not mask & (1 << j):
                    nm = mask | (1 << j)
                    dp[nm][j] = min(dp[nm][j], dp[mask][last] + d[last][j])
    full = (1 << n) - 1
    return min(dp[full][j] + d[j][0] for j in range(n))

print(shortest_tour([[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]))`, "80"]
  ],
  examples: [
    { t: "Shortest Path Visiting All Nodes", d: "Hard", lc: "shortest-path-visiting-all-nodes", f: "BFS over (node, mask)",
      q: "Fewest edges to visit every node (any start, revisits allowed).",
      idea: "BFS where a state is (current node, set of visited nodes). Start from every node at once.",
      code: `from collections import deque

def shortest_all(graph):
    n = len(graph); full = (1 << n) - 1
    q = deque((i, 1 << i, 0) for i in range(n))
    seen = {(i, 1 << i) for i in range(n)}
    while q:
        u, mask, d = q.popleft()
        if mask == full: return d
        for v in graph[u]:
            st = (v, mask | 1 << v)
            if st not in seen:
                seen.add(st); q.append((v, st[1], d + 1))

print(shortest_all([[1, 2, 3], [0], [0], [0]]))`, out: "4", cx: "O(2ⁿ · n²)" }
  ],
  pitfalls: [
    ["Using it for n = 30+", "2³⁰ states is about a billion: far too many."],
    ["Operator precedence", "In Python `1 << i & mask` parses as `1 << (i & mask)`: always add brackets."],
    ["Recomputing popcount the slow way", "`bin(mask).count('1')` is fine; or keep the count in the state."],
    ["Forgetting that order matters", "If the last item affects the next cost, you need dp[mask][last], not just dp[mask]."]
  ],
  edge: ["n = 1", "All costs equal", "Impossible partition (sum not divisible)", "Disconnected graph", "Zero costs"],
  compare: [
    ["Backtracking", "backtracking", "Backtracking explores orders; bitmask DP merges every order that reaches the same set."],
    ["Bit Manipulation", "bits", "The bit tricks (set, test, count) are the toolkit; bitmask DP is how you use them for subsets."],
    ["Multi-source BFS", "multi-source-bfs", "Shortest path visiting all nodes is BFS from every node with a mask in the state."]
  ],
  mcq: [
    ["How many states does dp[mask][last] have for n = 15?", ["15²", "2¹⁵ · 15 ≈ 490k", "15!", "2¹⁵"], 1, "2ⁿ masks times n possible last nodes."],
    ["How do you check whether item i is in mask?", ["mask == i", "mask & (1 << i)", "mask | i", "mask >> i == 1"], 1, "Shift a 1 into position i and AND it with the mask."]
  ],
  summary: {
    oneLine: "n ≤ 20: a subset is an integer; dp[mask] (or dp[mask][last]) over all 2ⁿ subsets.",
    signals: ["Small n, use / visit / assign everything", "Assignment with costs", "Visit all nodes (TSP)", "k groups with equal sums"],
    template: `dp = [INF] * (1 << n); dp[0] = 0
for mask in range(1 << n):
    for j in range(n):
        if not mask & (1 << j):
            nm = mask | (1 << j)
            dp[nm] = min(dp[nm], dp[mask] + cost(mask, j))`,
    pitfalls: ["Only for small n", "Bracket your bit operations", "Add 'last' when order matters"],
    cx: "O(2ⁿ · n) time · O(2ⁿ) space",
    drill: { task: "`cost[i][j]` is what worker i charges for job j (n ≤ 12). Each worker gets exactly one job. Return the minimum total cost.",
      ref: `def min_assign(cost):
    n = len(cost)
    dp = [inf] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == inf:
            continue
        i = bin(mask).count("1")
        if i == n:
            continue
        for j in range(n):
            if not mask & (1 << j):
                nm = mask | (1 << j)
                if dp[mask] + cost[i][j] < dp[nm]:
                    dp[nm] = dp[mask] + cost[i][j]
    return dp[-1]`,
      tests: [["[[9, 2, 7], [6, 4, 3], [5, 8, 1]]", "9"], ["[[1]]", "1"], ["[[1, 2], [2, 1]]", "2"]] }
  },
  problems: [
    { id: "all-subset-sums", title: "Every Subset Sum", d: "Easy", lc: "subsets",
      statement: "Return the sorted list of the sums of **every** subset of `nums` (2ⁿ values, including 0 for the empty subset, duplicates kept).",
      examples: [["[1, 2]", "[0, 1, 2, 3]", ""], ["[3, 3]", "[0, 3, 3, 6]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 15"],
      hints: ["Loop mask from 0 to 2ⁿ − 1.", "Faster: sums[mask] = sums[mask without its lowest bit] + that bit's value."],
      solution: `def all_subset_sums(nums):
    n = len(nums)
    sums = [0] * (1 << n)
    for mask in range(1, 1 << n):
        low = mask & -mask
        sums[mask] = sums[mask ^ low] + nums[low.bit_length() - 1]
    return sorted(sums)`,
      why: "Each subset's sum reuses a smaller subset's sum, so all 2ⁿ sums cost O(2ⁿ).", time: "O(2ⁿ log 2ⁿ)",
      hidden: [["[5]", "[0, 5]"], ["[1, 2, 4]", "[0, 1, 2, 3, 4, 5, 6, 7]"], ["[1] * 15", "sorted(bin(m).count('1') for m in range(1 << 15))"]] },
    { id: "job-matching", title: "Job Matching", d: "Medium", lc: "maximum-compatibility-score-sum",
      statement: "`cost[i][j]` is what worker i charges for job j. Each of the n workers must get exactly one of the n jobs. Return the minimum total cost.",
      examples: [["[[9, 2, 7], [6, 4, 3], [5, 8, 1]]", "9", "2 + 6 + 1"], ["[[4, 1], [2, 3]]", "3", ""]],
      constraints: ["1 ≤ n ≤ 12"],
      hints: ["The set of jobs already taken is all that matters.", "dp[mask] = cheapest cost when the first popcount(mask) workers took the jobs in mask.", "Assign the next worker to any free job."],
      solution: `def job_matching(cost):
    n = len(cost)
    dp = [inf] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] == inf:
            continue
        i = bin(mask).count("1")
        if i == n:
            continue
        for j in range(n):
            if not mask & (1 << j):
                nm = mask | (1 << j)
                if dp[mask] + cost[i][j] < dp[nm]:
                    dp[nm] = dp[mask] + cost[i][j]
    return dp[-1]`,
      why: "Assigning workers in a fixed order means the mask alone determines which worker is next.", time: "O(2ⁿ · n)",
      hidden: [["[[5]]", "5"], ["[[1, 2, 3], [2, 4, 6], [3, 6, 9]]", "10"], ["[[abs(i - j) for j in range(12)] for i in range(12)]", "0"]] },
    { id: "equal-teams", title: "K Equal Teams", d: "Medium", lc: "partition-to-k-equal-sum-subsets",
      statement: "Return `True` if `nums` can be split into `k` non-empty groups with equal sums.",
      examples: [["[4, 3, 2, 3, 5, 2, 1], 4", "True", "(5), (1, 4), (2, 3), (2, 3)"], ["[1, 2, 3, 4], 3", "False", ""]],
      constraints: ["1 ≤ k ≤ len(nums) ≤ 16", "1 ≤ nums[i] ≤ 10⁴"],
      hints: ["The target per group is sum / k; it must divide evenly.", "dp[mask] = sum of the current (partial) group after using the items in mask, or −1 if unreachable.", "Add an item only if it doesn't overflow the current group."],
      solution: `def equal_teams(nums, k):
    total = sum(nums)
    if total % k:
        return False
    target = total // k
    if max(nums) > target:
        return False
    n = len(nums)
    dp = [-1] * (1 << n)
    dp[0] = 0
    for mask in range(1 << n):
        if dp[mask] < 0:
            continue
        for i in range(n):
            if not mask & (1 << i) and dp[mask] + nums[i] <= target:
                nm = mask | (1 << i)
                if dp[nm] < 0:
                    dp[nm] = (dp[mask] + nums[i]) % target
    return dp[-1] == 0`,
      why: "Filling groups one at a time, the remainder of the current group is all that matters for each used-set.", time: "O(2ⁿ · n)",
      hidden: [["[5], 1", "True"], ["[2, 2, 2, 2, 3, 4, 5], 4", "False"], ["[1] * 16, 4", "True"]] },
    { id: "work-sessions", title: "Fewest Work Sessions", d: "Medium", lc: "minimum-number-of-work-sessions-to-finish-the-tasks",
      statement: "Tasks take `tasks[i]` hours. In one session you can work at most `limit` hours and must finish any task you start in that session. Return the minimum number of sessions to finish all tasks (each task fits in one session).",
      examples: [["[1, 2, 3], 3", "2", "(1, 2) and (3)"], ["[3, 1, 3, 1, 1], 8", "2", ""], ["[1, 2, 3, 4, 5], 15", "1", ""]],
      constraints: ["1 ≤ len(tasks) ≤ 14", "max(tasks) ≤ limit ≤ 15"],
      hints: ["State: the set of finished tasks.", "Store the best (sessions, hours used in the current session) for each set.", "Adding a task either fits in the current session or starts a new one."],
      solution: `def work_sessions(tasks, limit):
    n = len(tasks)
    best = [(inf, inf)] * (1 << n)
    best[0] = (1, 0)
    for mask in range(1 << n):
        s, used = best[mask]
        if s == inf:
            continue
        for i in range(n):
            if not mask & (1 << i):
                nm = mask | (1 << i)
                if used + tasks[i] <= limit:
                    cand = (s, used + tasks[i])
                else:
                    cand = (s + 1, tasks[i])
                if cand < best[nm]:
                    best[nm] = cand
    return best[-1][0]`,
      why: "Fewer sessions is always better, and for equal sessions less time used in the current one is better: the tuple order captures that.", time: "O(2ⁿ · n)",
      hidden: [["[5], 5", "1"], ["[2, 2, 2], 3", "3"], ["[1] * 14, 2", "7"]] },
    { id: "grand-tour", title: "Grand Tour", d: "Hard", lc: "find-the-shortest-superstring",
      statement: "`dist[i][j]` is the travel time between cities i and j (symmetric). Starting and ending at city 0, visit every city exactly once. Return the minimum total time.",
      examples: [["[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]", "80", "0 → 1 → 3 → 2 → 0"], ["[[0, 1], [1, 0]]", "2", ""]],
      constraints: ["2 ≤ n ≤ 13"],
      hints: ["State: (set of visited cities, current city).", "dp[mask][j] = cheapest way to start at 0, visit exactly mask, and stand at j.", "Finish by returning from the last city to 0."],
      solution: `def grand_tour(dist):
    n = len(dist)
    dp = [[inf] * n for _ in range(1 << n)]
    dp[1][0] = 0
    for mask in range(1 << n):
        for last in range(n):
            cur = dp[mask][last]
            if cur == inf:
                continue
            for j in range(n):
                if not mask & (1 << j):
                    nm = mask | (1 << j)
                    if cur + dist[last][j] < dp[nm][j]:
                        dp[nm][j] = cur + dist[last][j]
    full = (1 << n) - 1
    return min(dp[full][j] + dist[j][0] for j in range(1, n))`,
      why: "Held–Karp: any tour's cost only depends on which cities are done and where you are, not the order before.", time: "O(2ⁿ · n²)",
      hidden: [["[[0, 5, 5], [5, 0, 5], [5, 5, 0]]", "15"], ["[[0, 1, 2, 3], [1, 0, 1, 2], [2, 1, 0, 1], [3, 2, 1, 0]]", "6"], ["[[abs(i - j) for j in range(12)] for i in range(12)]", "22"]] },
    { id: "visit-every-node", title: "Visit Every Node", d: "Hard", lc: "shortest-path-visiting-all-nodes",
      statement: "`graph[i]` lists the neighbours of node i in a connected undirected graph. Return the length (number of edges) of the shortest walk that visits every node. You may start and end anywhere and revisit nodes and edges.",
      examples: [["[[1, 2, 3], [0], [0], [0]]", "4", "1 → 0 → 2 → 0 → 3"], ["[[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]", "4", ""]],
      constraints: ["1 ≤ n ≤ 12"],
      hints: ["A state is (current node, set of visited nodes).", "BFS over states gives the fewest edges.", "Start the BFS from every node at once."],
      solution: `def visit_every_node(graph):
    n = len(graph)
    full = (1 << n) - 1
    q = deque((i, 1 << i, 0) for i in range(n))
    seen = {(i, 1 << i) for i in range(n)}
    while q:
        u, mask, d = q.popleft()
        if mask == full:
            return d
        for v in graph[u]:
            nm = mask | (1 << v)
            if (v, nm) not in seen:
                seen.add((v, nm))
                q.append((v, nm, d + 1))`,
      why: "Multi-source BFS over (node, visited-set) states finds the fewest moves to cover everything.", time: "O(2ⁿ · n²)",
      hidden: [["[[]]", "0"], ["[[1], [0]]", "1"], ["[[1]] + [[i - 1, i + 1] for i in range(1, 11)] + [[10]]", "11"]] }
  ]
});
