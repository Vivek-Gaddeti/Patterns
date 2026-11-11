PAT("greedy", {
  time: "O(n log n)", space: "O(1) – O(n)",
  lede: "Make the choice that looks best right now and never look back. It's fast and simple, but only correct when you can argue that a best-now choice never ruins the final answer.",
  idea: "A greedy algorithm usually **sorts** by the right key, then walks once making a local decision. The hard part is knowing it's correct. The standard argument is an **exchange**: take any optimal solution that differs from greedy's, swap in greedy's choice, and show it's no worse. If you can't find such an argument, try a small counterexample, and fall back to DP if greedy fails.",
  analogy: "Paying with the fewest notes using ₹500, ₹200, ₹100: always hand over the biggest note that fits. It works for these notes, but not for every currency, which is why you check.",
  flavours: [["Shape", "Key idea", "Examples"], [
    ["**Reach / jumps**", "track the farthest point reachable so far", "jump game I and II"],
    ["**Sort then match**", "pair smallest with smallest (or largest with smallest)", "cookies, boats, two-city"],
    ["**Running balance**", "if the total is OK, reset the start when the tank goes negative", "gas station"],
    ["**Two passes**", "satisfy left neighbours, then right neighbours", "candy"],
    ["**Heap of options**", "delay a choice; take the best past option when forced", "refuelling stops, course schedule III"]]],
  signals: [["“Minimum number of …” / “maximum number of …” with a simple local rule", "jumps, arrows, platforms"], ["A natural sort order (deadlines, sizes, differences)", "sort then sweep"], ["You can argue “taking the best now never hurts”", "exchange argument"], ["n up to 10⁵ and DP would be O(n²)", "greedy is likely intended"]],
  not: "**Not this pattern** when a locally bad choice can enable a much better future (coin change with arbitrary coins, 0/1 knapsack) → DP. If you can find a counterexample, greedy is wrong.",
  templates: [
    ["Reach", "reach.py", `def can_reach_end(nums):
    far = 0
    for i, step in enumerate(nums):
        if i > far:
            return False                   # stuck before reaching i
        far = max(far, i + step)           # farthest index reachable so far
    return True

def min_jumps(nums):
    jumps = end = far = 0
    for i in range(len(nums) - 1):
        far = max(far, i + nums[i])
        if i == end:                       # must jump now; jump as far as possible
            jumps += 1
            end = far
    return jumps

print(can_reach_end([2, 3, 1, 1, 4]), can_reach_end([3, 2, 1, 0, 4]), min_jumps([2, 3, 1, 1, 4]))`, "True False 2"],
    ["Sort then match", "cookies.py", `def content_children(greed, sizes):
    greed, sizes = sorted(greed), sorted(sizes)
    child = 0
    for s in sizes:                        # smallest cookie first
        if child < len(greed) and s >= greed[child]:
            child += 1                     # it satisfies the least greedy child left
    return child

print(content_children([1, 2, 3], [1, 1]), content_children([1, 2], [1, 2, 3]))`, "1 2"]
  ],
  examples: [
    { t: "Gas Station", d: "Medium", lc: "gas-station", f: "Running balance",
      q: "Circular route; can you complete it, and from which station?",
      idea: "If total gas ≥ total cost, a start exists. Whenever the running tank goes negative, no station up to here can be the start: restart after it.",
      code: `def can_complete(gas, cost):
    if sum(gas) < sum(cost): return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start

print(can_complete([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]), can_complete([2, 3, 4], [3, 4, 3]))`, out: "3 -1", cx: "O(n)" },
    { t: "Candy", d: "Hard", lc: "candy", f: "Two passes",
      q: "Each child gets ≥ 1 candy; a child with a higher rating than a neighbour gets more than that neighbour. Minimum total.",
      idea: "Left-to-right fixes the left-neighbour rule, right-to-left fixes the right one (taking the max keeps both).",
      code: `def candy(r):
    n = len(r); c = [1] * n
    for i in range(1, n):
        if r[i] > r[i - 1]: c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if r[i] > r[i + 1]: c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)

print(candy([1, 0, 2]), candy([1, 2, 2]))`, out: "5 4", cx: "O(n)" },
    { t: "Partition Labels", d: "Medium", lc: "partition-labels", f: "Reach",
      q: "Split s into as many parts as possible so each letter appears in at most one part.",
      idea: "Record each letter's last index. Extend the current part's end to the last index of every letter in it; cut when i reaches the end.",
      code: `def partition_labels(s):
    last = {c: i for i, c in enumerate(s)}
    out, start, end = [], 0, 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            out.append(end - start + 1); start = i + 1
    return out

print(partition_labels("ababcbacadefegdehijhklij"))`, out: "[9, 7, 8]", cx: "O(n)" }
  ],
  pitfalls: [
    ["Assuming greedy works without checking", "Try a tiny counterexample first; coin change with [1, 3, 4] and 6 breaks “largest coin first”."],
    ["Sorting by the wrong key", "Interval scheduling sorts by end, not start; two-city sorts by cost difference."],
    ["One pass when two are needed", "Constraints in both directions (candy) need a left pass and a right pass."],
    ["Forgetting the global feasibility check", "Gas station: if total gas < total cost, no start works."]
  ],
  edge: ["Single element", "All equal values", "Already optimal input", "Impossible case", "Ties in the sort key"],
  compare: [
    ["Dynamic Programming", "dp-1d", "When greedy has a counterexample, DP considers every option; it's slower but always correct."],
    ["Intervals: Sort + Sweep", "intervals", "Max non-overlapping intervals is the textbook proven greedy."],
    ["Top-K / Heaps", "top-k", "“Take the best option seen so far when forced” greedy needs a heap."]
  ],
  mcq: [
    ["How do you usually prove a greedy algorithm correct?", ["Run it on examples", "Exchange argument: swapping greedy's choice into an optimal solution doesn't make it worse", "It's always correct", "Use recursion"], 1, "If greedy's choice can always be part of some optimal answer, induction finishes the proof."],
    ["Coins [1, 3, 4], amount 6. Does “largest coin first” give the fewest coins?", ["Yes", "No: it gives 4+1+1 (3 coins) but 3+3 is 2", "Only sometimes", "It's undefined"], 1, "A counterexample means you need DP."]
  ],
  summary: {
    oneLine: "Sort by the right key, sweep once, take the locally best choice; prove it with an exchange argument.",
    signals: ["Min / max count with a simple local rule", "Natural sort order", "Reachability / jumps", "n too large for DP"],
    template: `items.sort(key=KEY)
for x in items:
    if can_take(x):
        take(x)`,
    pitfalls: ["Check for counterexamples", "Right sort key", "Two passes for two-sided rules"],
    cx: "O(n log n) time · O(1)–O(n) space",
    drill: { task: "`nums[i]` is the max jump length from index i. Return `True` if you can reach the last index from index 0.",
      ref: `def can_reach(nums):
    far = 0
    for i, step in enumerate(nums):
        if i > far:
            return False
        far = max(far, i + step)
    return True`,
      tests: [["[2, 3, 1, 1, 4]", "True"], ["[3, 2, 1, 0, 4]", "False"], ["[0]", "True"]] }
  },
  problems: [
    { id: "cookie-share", title: "Cookie Share", d: "Easy", lc: "assign-cookies",
      statement: "Child i is content with a cookie of size at least `greed[i]`; cookie j has size `sizes[j]`. Each child gets at most one cookie. Return the maximum number of content children.",
      examples: [["[1, 2, 3], [1, 1]", "1", ""], ["[1, 2], [1, 2, 3]", "2", ""]],
      constraints: ["1 ≤ len(greed), len(sizes) ≤ 3·10⁴"],
      hints: ["Sort both lists.", "Give each cookie (smallest first) to the least greedy child it can satisfy."],
      solution: `def cookie_share(greed, sizes):
    greed, sizes = sorted(greed), sorted(sizes)
    child = 0
    for s in sizes:
        if child < len(greed) and s >= greed[child]:
            child += 1
    return child`,
      why: "Using the smallest sufficient cookie for the least greedy child never wastes a bigger cookie someone else needs.", time: "O(n log n)",
      hidden: [["[5], [1]", "0"], ["[1, 1, 1], [1, 1, 1]", "3"], ["list(range(1, 30001)), list(range(1, 30001))", "30000"]] },
    { id: "change-booth", title: "Change Booth", d: "Easy", lc: "lemonade-change",
      statement: "Lemonade costs 5. Customers pay with 5, 10 or 20 in the order given, and you start with no change. Return `True` if you can give every customer correct change.",
      examples: [["[5, 5, 5, 10, 20]", "True", ""], ["[5, 5, 10, 10, 20]", "False", ""]],
      constraints: ["1 ≤ len(bills) ≤ 10⁵"],
      hints: ["Track how many 5s and 10s you hold.", "For 20, prefer giving 10 + 5 (keep 5s, which are more flexible)."],
      solution: `def change_booth(bills):
    fives = tens = 0
    for b in bills:
        if b == 5:
            fives += 1
        elif b == 10:
            if not fives:
                return False
            fives -= 1
            tens += 1
        else:
            if tens and fives:
                tens -= 1
                fives -= 1
            elif fives >= 3:
                fives -= 3
            else:
                return False
    return True`,
      why: "5s can make change for anything, 10s only for 20s, so spend 10s first.", time: "O(n)",
      hidden: [["[10]", "False"], ["[5, 5, 5, 20]", "True"], ["[5, 10] * 50000", "True"]] },
    { id: "can-hop-to-end", title: "Can You Hop to the End?", d: "Medium", lc: "jump-game",
      statement: "Standing on index 0, `hops[i]` is the maximum jump length from index i. Return `True` if you can reach the last index.",
      examples: [["[2, 3, 1, 1, 4]", "True", ""], ["[3, 2, 1, 0, 4]", "False", "You always land on the 0."]],
      constraints: ["1 ≤ len(hops) ≤ 10⁵"],
      hints: ["Track the farthest index you can reach so far.", "If the current index is beyond it, you're stuck."],
      solution: `def can_hop(hops):
    far = 0
    for i, h in enumerate(hops):
        if i > far:
            return False
        far = max(far, i + h)
    return True`,
      why: "Every index up to `far` is reachable, so one pass checks reachability of the end.", time: "O(n)",
      hidden: [["[0]", "True"], ["[0, 1]", "False"], ["[1] * 100000", "True"], ["[3] * 50000 + [0] * 4 + [1]", "False"]] },
    { id: "fewest-hops", title: "Fewest Hops", d: "Medium", lc: "jump-game-ii",
      statement: "Same hops as before, and the last index is always reachable. Return the minimum number of jumps to reach it.",
      examples: [["[2, 3, 1, 1, 4]", "2", "0 → 1 → 4"], ["[2, 3, 0, 1, 4]", "2", ""]],
      constraints: ["1 ≤ len(hops) ≤ 10⁵"],
      hints: ["Think of BFS levels: all indices reachable with k jumps form a range.", "When you reach the end of the current range, you must jump: the next range ends at the farthest point seen."],
      solution: `def fewest_hops(hops):
    jumps = end = far = 0
    for i in range(len(hops) - 1):
        far = max(far, i + hops[i])
        if i == end:
            jumps += 1
            end = far
    return jumps`,
      why: "Each jump extends the reachable range as far as possible, which is exactly BFS by levels.", time: "O(n)",
      hidden: [["[0]", "0"], ["[1, 1, 1]", "2"], ["[1] * 100000", "99999"], ["[100000] + [1] * 99999", "1"]] },
    { id: "fuel-loop", title: "Fuel Loop", d: "Medium", lc: "gas-station",
      statement: "Stations on a circular road: you get `gas[i]` at station i and it costs `cost[i]` to drive to station i + 1. Starting with an empty tank, return the index of the station where you can start and drive the whole loop, or -1. The answer is unique if it exists.",
      examples: [["[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]", "3", ""], ["[2, 3, 4], [3, 4, 3]", "-1", ""]],
      constraints: ["1 ≤ n ≤ 10⁵"],
      hints: ["If total gas < total cost, it's impossible.", "If the tank goes negative after station i, none of the stations from your start up to i can be the start.", "Restart from i + 1."],
      solution: `def fuel_loop(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank = start = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start`,
      why: "A failing stretch rules out every start inside it; enough total gas guarantees the surviving start works.", time: "O(n)",
      hidden: [["[5], [4]", "0"], ["[3, 1, 1], [1, 2, 2]", "0"], ["[1] * 99999 + [100001], [2] * 100000", "99999"], ["[1] * 99999 + [100000], [2] * 100000", "-1"]] },
    { id: "cut-into-labels", title: "Cut Into Labels", d: "Medium", lc: "partition-labels",
      statement: "Split `s` into as many pieces as possible so that each letter appears in **at most one** piece. Return the piece lengths in order.",
      examples: [["'ababcbacadefegdehijhklij'", "[9, 7, 8]", ""], ["'eccbbbbdec'", "[10]", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵", "lowercase letters"],
      hints: ["Record each letter's last position.", "Grow the current piece's end to the last position of every letter inside it.", "Cut when the index reaches that end."],
      solution: `def cut_into_labels(s):
    last = {c: i for i, c in enumerate(s)}
    out, start, end = [], 0, 0
    for i, c in enumerate(s):
        end = max(end, last[c])
        if i == end:
            out.append(end - start + 1)
            start = i + 1
    return out`,
      why: "Cutting at the earliest possible point (when every letter so far is complete) maximises the number of pieces.", time: "O(n)",
      hidden: [["'a'", "[1]"], ["'abc'", "[1, 1, 1]"], ["'ab' * 50000", "[100000]"]] },
    { id: "two-offices", title: "Two Offices", d: "Medium", lc: "two-city-scheduling",
      statement: "2n people must be split so exactly n go to office A and n to office B. `costs[i] = [a, b]` is person i's cost for each office. Return the minimum total cost.",
      examples: [["[[10, 20], [30, 200], [400, 50], [30, 20]]", "110", "A: people 0, 1. B: people 2, 3."], ["[[259, 770], [448, 54], [926, 667], [184, 139], [840, 118], [577, 469]]", "1859", ""]],
      constraints: ["2 ≤ len(costs) ≤ 100, even"],
      hints: ["Imagine everyone goes to B, then move n people to A.", "Moving person i changes the cost by a − b: pick the n smallest differences."],
      solution: `def two_offices(costs):
    costs = sorted(costs, key=lambda c: c[0] - c[1])
    n = len(costs) // 2
    return sum(c[0] for c in costs[:n]) + sum(c[1] for c in costs[n:])`,
      why: "Sorting by a − b puts the people who save most by going to A first.", time: "O(n log n)",
      hidden: [["[[1, 2], [2, 1]]", "2"], ["[[5, 5], [5, 5]]", "10"], ["[[i, 100 - i] for i in range(100)]", "2500"]] },
    { id: "rebuild-queue", title: "Rebuild the Queue", d: "Medium", lc: "queue-reconstruction-by-height",
      statement: "Each person is `[h, k]`: height h, and exactly k people in front of them are at least as tall. Return the queue (a list of `[h, k]`) that satisfies everyone.",
      examples: [["[[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]]", "[[5, 0], [7, 0], [5, 2], [6, 1], [4, 4], [7, 1]]", ""], ["[[6, 0], [5, 0], [4, 0], [3, 2], [2, 2], [1, 4]]", "[[4, 0], [5, 0], [2, 2], [3, 2], [1, 4], [6, 0]]", ""]],
      constraints: ["1 ≤ len(people) ≤ 2000"],
      hints: ["Place the tallest people first: shorter people inserted later don't affect them.", "Sort by height descending, k ascending.", "Insert each person at index k."],
      solution: `def rebuild_queue(people):
    out = []
    for h, k in sorted(people, key=lambda p: (-p[0], p[1])):
        out.insert(k, [h, k])
    return out`,
      why: "When a person is inserted, everyone already placed is at least as tall, so position k is exactly right; later (shorter) inserts don't change that.", time: "O(n²)",
      hidden: [["[[1, 0]]", "[[1, 0]]"], ["[[2, 0], [1, 1]]", "[[2, 0], [1, 1]]"], ["[[5, i] for i in range(2000)]", "[[5, i] for i in range(2000)]"]] },
    { id: "fair-candy", title: "Fair Candy", d: "Hard", lc: "candy",
      statement: "Children stand in a row with `ratings`. Each child gets at least one candy, and a child with a higher rating than a neighbour must get more candies than that neighbour. Return the minimum total candies.",
      examples: [["[1, 0, 2]", "5", "2, 1, 2"], ["[1, 2, 2]", "4", "1, 2, 1"]],
      constraints: ["1 ≤ n ≤ 2·10⁴"],
      hints: ["Handle the left-neighbour rule in a left-to-right pass.", "Handle the right-neighbour rule in a right-to-left pass, keeping the max of both."],
      solution: `def fair_candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)`,
      why: "Each pass enforces one direction minimally; taking the max satisfies both without overshooting.", time: "O(n)",
      hidden: [["[5]", "1"], ["[1, 3, 2, 2, 1]", "7"], ["list(range(20000))", "200010000"]] },
    { id: "refuel-stops", title: "Fewest Refuel Stops", d: "Hard", lc: "minimum-number-of-refueling-stops",
      statement: "A car must travel `target` miles, starting with `start` litres (1 litre = 1 mile, the tank is unlimited). `stations[i] = [position, fuel]` are sorted by position. Return the fewest stops to reach the target, or -1.",
      examples: [["1, 1, []", "0", ""], ["100, 1, [[10, 100]]", "-1", ""], ["100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]", "2", "Stop at 10 and 60."]],
      constraints: ["1 ≤ target, start ≤ 10⁹", "0 ≤ len(stations) ≤ 500"],
      hints: ["Drive as far as you can; remember every station you passed.", "When you run out, retroactively refuel at the passed station with the most fuel (max-heap).", "If there's nothing to refuel from, it's impossible."],
      solution: `def refuel_stops(target, start, stations):
    heap = []
    fuel, stops, i = start, 0, 0
    while fuel < target:
        while i < len(stations) and stations[i][0] <= fuel:
            heappush(heap, -stations[i][1])
            i += 1
        if not heap:
            return -1
        fuel += -heappop(heap)
        stops += 1
    return stops`,
      why: "Choosing the biggest available refuel only when forced is optimal (exchange argument) and needs at most one heap pop per stop.", time: "O(n log n)",
      hidden: [["10, 10, [[5, 5]]", "0"], ["10, 5, [[5, 5]]", "1"], ["1000, 1, [[i, 2] for i in range(1, 500)]", "-1"], ["500, 1, [[i, 1] for i in range(1, 500)]", "499"]] }
  ]
});
