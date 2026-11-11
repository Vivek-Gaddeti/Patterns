PAT("line-sweep", {
  time: "O(n log n)", space: "O(n)",
  lede: "Turn each interval into two events, +1 where it starts and −1 where it ends, then sweep from left to right keeping a running total. On a small integer range, the same idea is the difference array.",
  idea: "Asking “how many intervals cover point x?” for every x is slow. But coverage only **changes** at interval endpoints. Record those changes as events, sort them, and a running sum gives the coverage everywhere. When positions are small integers you skip sorting: add at `diff[start]`, subtract at `diff[end]`, then take prefix sums.",
  analogy: "A turnstile counter at a stadium: you don't track each person, you just add one when someone enters and subtract one when someone leaves. The peak reading is the busiest moment.",
  flavours: [["Variant", "How", "Use it for"], [
    ["**Event sweep**", "list (pos, +k) and (pos, −k), sort, running sum", "max overlap, capacity checks, busiest time"],
    ["**Difference array**", "`d[l] += v; d[r+1] −= v`, then prefix sum", "many range updates, then read every value"],
    ["**Sweep + heap**", "process events in order, heap of active heights", "skyline, active maximum"]]],
  signals: [["Many intervals and “how many overlap at once?”", "max concurrent, capacity"], ["“Add v to every element in [l, r]” many times", "then report the final array"], ["“Earliest / busiest moment”", "sweep events in time order"], ["Coverage of positions on a line", "count covered points"]],
  not: "**Not this pattern** when you must answer range queries **between** updates (→ segment / Fenwick tree), or you need to merge the intervals themselves (→ intervals: sort + merge).",
  templates: [
    ["Event sweep", "events.py", `def max_overlap(intervals):             # [start, end) intervals
    events = []
    for s, e in intervals:
        events.append((s, 1))
        events.append((e, -1))
    events.sort()                          # at equal positions, -1 sorts before +1
    cur = best = 0
    for _, delta in events:
        cur += delta
        best = max(best, cur)
    return best

print(max_overlap([[1, 4], [2, 5], [4, 6], [7, 8]]))`, "2"],
    ["Difference array", "diff.py", `def apply_updates(n, updates):          # updates: [l, r, v] inclusive
    d = [0] * (n + 1)
    for l, r, v in updates:
        d[l] += v
        d[r + 1] -= v
    out, run = [], 0
    for i in range(n):
        run += d[i]
        out.append(run)
    return out

print(apply_updates(5, [[1, 3, 2], [2, 4, 3], [0, 2, -2]]))`, "[-2, 0, 3, 5, 3]"]
  ],
  examples: [
    { t: "Car Pooling", d: "Medium", lc: "car-pooling", f: "Difference array",
      q: "Trips [passengers, from, to]. Can a car with given capacity do them all, driving east only?",
      idea: "+passengers at `from`, −passengers at `to`; the running load must never exceed capacity.",
      code: `def car_pooling(trips, capacity):
    d = [0] * 1001
    for k, a, b in trips:
        d[a] += k
        d[b] -= k
    load = 0
    for x in d:
        load += x
        if load > capacity:
            return False
    return True

print(car_pooling([[2, 1, 5], [3, 3, 7]], 4), car_pooling([[2, 1, 5], [3, 5, 7]], 3))`, out: "False True", cx: "O(n + range)" },
    { t: "Corporate Flight Bookings", d: "Medium", lc: "corporate-flight-bookings", f: "Difference array",
      q: "Bookings [first, last, seats] on flights 1..n. Total seats per flight.",
      idea: "Range add on a difference array, then one prefix sum.",
      code: `def flight_bookings(bookings, n):
    d = [0] * (n + 2)
    for a, b, k in bookings:
        d[a] += k
        d[b + 1] -= k
    out, run = [], 0
    for i in range(1, n + 1):
        run += d[i]
        out.append(run)
    return out

print(flight_bookings([[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5))`, out: "[10, 55, 45, 25, 25]", cx: "O(n + bookings)" },
    { t: "The Skyline Problem", d: "Hard", lc: "the-skyline-problem", f: "Sweep + heap",
      q: "Buildings [left, right, height]. Return the key points of the skyline outline.",
      idea: "Sweep x-coordinates; a max-heap holds active heights (lazily removing ended buildings). Emit a point whenever the max height changes.",
      code: `import heapq

def skyline(buildings):
    xs = sorted({x for l, r, h in buildings for x in (l, r)})
    out, heap, i = [], [(0, float("inf"))], 0
    B = sorted(buildings)
    for x in xs:
        while i < len(B) and B[i][0] <= x:
            heapq.heappush(heap, (-B[i][2], B[i][1])); i += 1
        while heap[0][1] <= x:
            heapq.heappop(heap)
        h = -heap[0][0]
        if not out or out[-1][1] != h:
            out.append([x, h])
    return out

print(skyline([[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]))`, out: "[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]", cx: "O(n log n)" }
  ],
  pitfalls: [
    ["Wrong tie order at equal positions", "For half-open [s, e), process −1 before +1 at the same x, or touching intervals look overlapping."],
    ["Off-by-one with inclusive ranges", "Inclusive [l, r] subtracts at `r + 1`, so size the array n + 1 (or n + 2 if 1-indexed)."],
    ["Allocating a huge difference array", "If positions go up to 10⁹, sort events (or compress coordinates) instead."],
    ["Forgetting the final prefix sum", "The difference array holds changes, not values."]
  ],
  edge: ["Intervals that touch", "All intervals identical", "Single interval", "Updates covering the whole array", "Very large coordinates"],
  compare: [
    ["Intervals: Sort + Sweep", "intervals", "Merging or picking intervals → sort intervals. Counting coverage over time → events."],
    ["Prefix Sum", "prefix-sum", "A difference array is the inverse of a prefix sum: you store changes and prefix-sum them at the end."],
    ["Segment / Fenwick Tree", "segment-fenwick", "If queries come **between** updates, you need a tree; the difference array only works when you read at the end."]
  ],
  mcq: [
    ["Add v to every element in [l, r] (inclusive) on a difference array d:", ["d[l] += v; d[r] -= v", "d[l] += v; d[r + 1] -= v", "d[l - 1] += v; d[r] -= v", "Loop from l to r"], 1, "The change starts at l and stops after r, so it's undone at r + 1."],
    ["For half-open meetings [s, e), at the same time which events come first?", ["Starts (+1)", "Ends (−1)", "Doesn't matter", "Random"], 1, "A meeting ending at t frees its slot before one starting at t takes it."]
  ],
  summary: {
    oneLine: "+1 at a start, −1 at an end, sweep with a running total; on small ranges use a difference array.",
    signals: ["Max overlap / capacity / busiest time", "Many range updates, read at the end", "Coverage on a line", "Skyline-like outlines (sweep + heap)"],
    template: `events = []
for s, e in intervals:
    events += [(s, 1), (e, -1)]
cur = best = 0
for _, d in sorted(events):
    cur += d
    best = max(best, cur)`,
    pitfalls: ["Tie order at equal positions", "Inclusive ranges subtract at r + 1", "Don't allocate 10⁹-sized arrays"],
    cx: "O(n log n) (O(n + range) with a difference array)",
    drill: { task: "Intervals are half-open `[start, end)`. Return the maximum number that overlap at any moment.",
      ref: `def max_overlap(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))
        events.append((e, -1))
    cur = best = 0
    for _, d in sorted(events):
        cur += d
        best = max(best, cur)
    return best`,
      tests: [["[[1, 4], [2, 5], [4, 6]]", "2"], ["[[1, 2], [2, 3]]", "1"], ["[[0, 10], [1, 2], [1, 3]]", "3"]] }
  },
  problems: [
    { id: "busiest-year", title: "Busiest Year", d: "Easy", lc: "maximum-population-year",
      statement: "`logs[i] = [birth, death]`: person i was alive in years `birth .. death − 1`. Return the **earliest** year with the most people alive.",
      examples: [["[[1993, 1999], [2000, 2010]]", "1993", ""], ["[[1950, 1961], [1960, 1971], [1970, 1981]]", "1960", ""]],
      constraints: ["1 ≤ len(logs) ≤ 10⁵", "1950 ≤ birth < death ≤ 2050"],
      hints: ["Years are a small range: use a difference array.", "+1 at birth, −1 at death, then prefix-sum and take the first maximum."],
      solution: `def busiest_year(logs):
    d = [0] * 102
    for b, e in logs:
        d[b - 1950] += 1
        d[e - 1950] -= 1
    best_year, best, run = 1950, 0, 0
    for i in range(101):
        run += d[i]
        if run > best:
            best, best_year = run, 1950 + i
    return best_year`,
      why: "The difference array turns every lifespan into two updates; one prefix sum gives the population each year.", time: "O(n + years)",
      hidden: [["[[2000, 2001]]", "2000"], ["[[1950, 2050], [2049, 2050]]", "2049"], ["[[1950 + i % 50, 2000 + i % 50] for i in range(100000)]", "1999"]] },
    { id: "covered-spots", title: "Covered Spots", d: "Easy", lc: "points-that-intersect-with-cars",
      statement: "Cars park on a number line; car i covers integer points `start .. end` (inclusive). Return how many integer points are covered by at least one car.",
      examples: [["[[3, 6], [1, 5], [4, 7]]", "7", "Points 1 to 7."], ["[[1, 3], [5, 8]]", "7", ""]],
      constraints: ["1 ≤ len(cars) ≤ 10⁵", "1 ≤ start ≤ end ≤ 10⁵"],
      hints: ["Difference array over positions.", "Count positions with a positive running total."],
      solution: `def covered_spots(cars):
    top = max(e for s, e in cars)
    d = [0] * (top + 2)
    for s, e in cars:
        d[s] += 1
        d[e + 1] -= 1
    run = count = 0
    for x in d:
        run += x
        if run > 0:
            count += 1
    return count`,
      why: "One pass of updates and one prefix sum mark every covered point.", time: "O(n + range)",
      hidden: [["[[5, 5]]", "1"], ["[[1, 2], [3, 4]]", "4"], ["[[1, 100000]] * 100000", "100000"]] },
    { id: "range-boosts", title: "Range Boosts", d: "Medium", lc: "range-addition",
      statement: "Start with `n` zeros. Each update `[l, r, v]` adds `v` to every position `l..r` (inclusive). Return the final array.",
      examples: [["5, [[1, 3, 2], [2, 4, 3], [0, 2, -2]]", "[-2, 0, 3, 5, 3]", ""], ["3, []", "[0, 0, 0]", ""]],
      constraints: ["1 ≤ n ≤ 10⁵", "0 ≤ len(updates) ≤ 10⁵"],
      hints: ["Applying each update directly is O(n) per update.", "Record only where each update starts and stops.", "One prefix sum at the end produces the values."],
      solution: `def range_boosts(n, updates):
    d = [0] * (n + 1)
    for l, r, v in updates:
        d[l] += v
        d[r + 1] -= v
    out, run = [], 0
    for i in range(n):
        run += d[i]
        out.append(run)
    return out`,
      why: "Each update costs O(1) on the difference array; the final prefix sum costs O(n).", time: "O(n + u)",
      hidden: [["1, [[0, 0, 5]]", "[5]"], ["4, [[0, 3, 1], [1, 2, -1]]", "[1, 0, 0, 1]"], ["100000, [[0, 99999, 1]] * 100000", "[100000] * 100000"]] },
    { id: "ride-share", title: "Ride Share", d: "Medium", lc: "car-pooling",
      statement: "A van drives east only and holds `capacity` passengers. `trips[i] = [count, pickup, dropoff]`: `count` passengers ride from `pickup` to `dropoff` (they leave at `dropoff`). Return `True` if every trip fits.",
      examples: [["[[2, 1, 5], [3, 3, 7]], 4", "False", "5 people between 3 and 5."], ["[[2, 1, 5], [3, 3, 7]], 5", "True", ""], ["[[2, 1, 5], [3, 5, 7]], 3", "True", "Drop-off happens before pickup at 5."]],
      constraints: ["1 ≤ len(trips) ≤ 10⁵", "0 ≤ pickup < dropoff ≤ 10⁵"],
      hints: ["+count at pickup, −count at dropoff.", "Sweep positions in order; fail if the load ever exceeds capacity."],
      solution: `def ride_share(trips, capacity):
    top = max(b for _, _, b in trips)
    d = [0] * (top + 1)
    for k, a, b in trips:
        d[a] += k
        d[b] -= k
    load = 0
    for x in d:
        load += x
        if load > capacity:
            return False
    return True`,
      why: "The running total of the difference array is exactly the number of passengers on board at each point.", time: "O(n + range)",
      hidden: [["[[3, 2, 7], [3, 7, 9], [8, 3, 9]], 11", "True"], ["[[1, 0, 1]], 0", "False"], ["[[1, i, i + 2] for i in range(100000)], 1", "False"], ["[[1, i, i + 1] for i in range(99999)], 1", "True"]] },
    { id: "seat-totals", title: "Seat Totals", d: "Medium", lc: "corporate-flight-bookings",
      statement: "Flights are numbered `1..n`. Booking `[first, last, seats]` reserves `seats` on every flight from `first` to `last`. Return the total seats booked on each flight.",
      examples: [["[[1, 2, 10], [2, 3, 20], [2, 5, 25]], 5", "[10, 55, 45, 25, 25]", ""], ["[[1, 2, 10], [2, 2, 15]], 2", "[10, 25]", ""]],
      constraints: ["1 ≤ n ≤ 2·10⁴", "1 ≤ len(bookings) ≤ 2·10⁴"],
      hints: ["It's a range add on 1-indexed flights.", "Size the difference array n + 2."],
      solution: `def seat_totals(bookings, n):
    d = [0] * (n + 2)
    for a, b, k in bookings:
        d[a] += k
        d[b + 1] -= k
    out, run = [], 0
    for i in range(1, n + 1):
        run += d[i]
        out.append(run)
    return out`,
      why: "Difference array: O(1) per booking, then one prefix sum.", time: "O(n + b)",
      hidden: [["[[1, 1, 5]], 1", "[5]"], ["[[1, 3, 1], [3, 3, 1]], 3", "[1, 1, 2]"], ["[[1, 20000, 1]] * 20000, 20000", "[20000] * 20000"]] },
    { id: "brightest-spot", title: "Brightest Spot", d: "Medium", lc: "brightest-position-on-street",
      statement: "Lamp `[pos, r]` lights every point from `pos − r` to `pos + r` inclusive. A point's brightness is the number of lamps lighting it. Return the **smallest** point with the highest brightness.",
      examples: [["[[-3, 2], [1, 2], [3, 3]]", "-1", "Lamps light [−5, −1], [−1, 3] and [0, 6]. No point is lit by all three; −1 is the first point lit by two."], ["[[1, 0], [0, 1]]", "1", ""]],
      constraints: ["1 ≤ len(lamps) ≤ 10⁵", "−10⁸ ≤ pos ≤ 10⁸", "0 ≤ r ≤ 10⁸"],
      hints: ["Coordinates are huge: use sorted events, not an array.", "Event +1 at pos − r and −1 at pos + r + 1.", "At equal positions apply −1 before +1, and record a new best only when it strictly increases."],
      solution: `def brightest_spot(lamps):
    events = []
    for p, r in lamps:
        events.append((p - r, 1))
        events.append((p + r + 1, -1))
    events.sort()
    cur = best = 0
    best_pos = None
    i = 0
    while i < len(events):
        x = events[i][0]
        while i < len(events) and events[i][0] == x:
            cur += events[i][1]
            i += 1
        if cur > best:
            best, best_pos = cur, x
    return best_pos`,
      why: "Brightness only changes at event points, so sweeping sorted events finds the earliest maximum.", time: "O(n log n)",
      hidden: [["[[5, 0]]", "5"], ["[[0, 10], [100, 10]]", "-10"], ["[[i, 1] for i in range(0, 300000, 3)]", "-1"]] },
    { id: "city-outline", title: "City Outline", d: "Hard", lc: "the-skyline-problem",
      statement: "Building `[left, right, height]` is a rectangle on flat ground from x = left to x = right. Return the skyline as a list of key points `[x, height]`: where the visible outline height changes, sorted by x, ending with a point at height 0. Consecutive points must have different heights.",
      examples: [["[[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]", "[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]", ""], ["[[0, 2, 3], [2, 5, 3]]", "[[0, 3], [5, 0]]", ""]],
      constraints: ["1 ≤ len(buildings) ≤ 10⁴", "0 ≤ left < right ≤ 2³¹ − 1", "1 ≤ height ≤ 2³¹ − 1"],
      hints: ["The outline can only change at a building edge.", "Sweep sorted x-coordinates; keep a max-heap of (height, right) for buildings that have started.", "Pop buildings whose right edge has passed (lazily), then compare the top height with the last key point."],
      solution: `import heapq

def city_outline(buildings):
    B = sorted(buildings)
    xs = sorted({x for l, r, h in B for x in (l, r)})
    out, heap, i = [], [(0, float("inf"))], 0
    for x in xs:
        while i < len(B) and B[i][0] <= x:
            heapq.heappush(heap, (-B[i][2], B[i][1]))
            i += 1
        while heap[0][1] <= x:
            heapq.heappop(heap)
        h = -heap[0][0]
        if not out or out[-1][1] != h:
            out.append([x, h])
    return out`,
      why: "Every candidate x is processed once; the heap gives the tallest active building, with ended ones removed lazily.", time: "O(n log n)",
      hidden: [["[[1, 2, 1]]", "[[1, 1], [2, 0]]"], ["[[1, 5, 3], [2, 4, 5]]", "[[1, 3], [2, 5], [4, 3], [5, 0]]"], ["[[i, i + 2, 5] for i in range(0, 10000)]", "[[0, 5], [10001, 0]]"]] }
  ]
});
