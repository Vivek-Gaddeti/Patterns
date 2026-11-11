PAT("intervals", {
  time: "O(n log n)", space: "O(n)",
  lede: "Sort intervals by start (or end), then sweep once, comparing each interval only with the last one you kept.",
  idea: "Unsorted intervals can overlap in any order, which pushes you towards O(n²) pair checks. **After sorting by start**, an interval can only overlap the one just before it (or the merged block so far), so a single pass decides everything. For “keep the most / remove the fewest”, sort by **end** instead and greedily keep whatever finishes first.",
  analogy: "Laying planks on a floor in order of where they start: each new plank either overlaps the last one you placed (extend it) or starts a fresh run.",
  flavours: [["Sort by", "Then", "Problems"], [
    ["**Start**", "merge into the last kept interval if `start ≤ last_end`", "merge, insert, total covered length"],
    ["**End**", "keep an interval if it starts after the last kept end", "max non-overlapping, min removals, arrows"],
    ["**Both lists sorted**", "two pointers, advance the one that ends first", "intersections of two schedules"],
    ["**Events**", "+1 at start, −1 at end, sweep", "rooms needed, max overlap (see Line Sweep)"]]],
  signals: [["A list of `[start, end]` pairs", "meetings, bookings, ranges, balloons"], ["“Merge overlapping”, “insert”, “free time”", "sort by start"], ["“Minimum removals”, “maximum non-overlapping”, “minimum arrows”", "sort by end, greedy"], ["“How many at the same time?”", "sweep events"]],
  not: "**Not this pattern** when the ranges are positions in an array you sum over (→ prefix sums / difference array), or you need to answer many point queries on dynamic intervals (→ segment tree).",
  templates: [
    ["Merge (sort by start)", "merge.py", `def merge(intervals):
    intervals.sort()                       # by start
    out = []
    for s, e in intervals:
        if out and s <= out[-1][1]:        # overlaps the last kept block
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

print(merge([[1, 3], [8, 10], [2, 6], [15, 18]]))`, "[[1, 6], [8, 10], [15, 18]]"],
    ["Keep most (sort by end)", "keep_most.py", `def max_non_overlapping(intervals):
    intervals.sort(key=lambda x: x[1])     # by end
    count, last_end = 0, float("-inf")
    for s, e in intervals:
        if s >= last_end:                  # fits after the last kept one
            count += 1
            last_end = e
    return count

print(max_non_overlapping([[1, 2], [2, 3], [3, 4], [1, 3]]))`, "3"]
  ],
  examples: [
    { t: "Merge Intervals", d: "Medium", lc: "merge-intervals", f: "Sort by start",
      q: "Merge all overlapping intervals.",
      idea: "Sort by start; extend the last block or start a new one.",
      code: `def merge(iv):
    out = []
    for s, e in sorted(iv):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

print(merge([[1, 4], [4, 5]]))`, out: "[[1, 5]]", cx: "O(n log n)" },
    { t: "Non-overlapping Intervals", d: "Medium", lc: "non-overlapping-intervals", f: "Sort by end",
      q: "Fewest intervals to remove so the rest don't overlap.",
      idea: "Keeping the interval that ends earliest leaves the most room. Removals = n − kept.",
      code: `def erase_overlap(iv):
    iv.sort(key=lambda x: x[1])
    kept, end = 0, float("-inf")
    for s, e in iv:
        if s >= end:
            kept += 1
            end = e
    return len(iv) - kept

print(erase_overlap([[1, 2], [2, 3], [3, 4], [1, 3]]))`, out: "1", cx: "O(n log n)" },
    { t: "Interval List Intersections", d: "Medium", lc: "interval-list-intersections", f: "Two pointers",
      q: "Two sorted lists of disjoint intervals. Return their intersections.",
      idea: "Overlap is `[max(starts), min(ends)]` when non-empty; advance whichever interval ends first.",
      code: `def intersect(A, B):
    i = j = 0
    out = []
    while i < len(A) and j < len(B):
        lo, hi = max(A[i][0], B[j][0]), min(A[i][1], B[j][1])
        if lo <= hi:
            out.append([lo, hi])
        if A[i][1] < B[j][1]: i += 1
        else: j += 1
    return out

print(intersect([[0, 2], [5, 10]], [[1, 5], [8, 12]]))`, out: "[[1, 2], [5, 5], [8, 10]]", cx: "O(m + n)" },
    { t: "Meeting Rooms II", d: "Medium", lc: "meeting-rooms-ii", f: "Heap of ends",
      q: "Minimum number of rooms so no meetings clash.",
      idea: "Sort by start; a min-heap holds end times of rooms in use. Reuse the room that frees up first.",
      code: `import heapq

def min_rooms(iv):
    ends = []
    for s, e in sorted(iv):
        if ends and ends[0] <= s:
            heapq.heapreplace(ends, e)
        else:
            heapq.heappush(ends, e)
    return len(ends)

print(min_rooms([[0, 30], [5, 10], [15, 20]]))`, out: "2", cx: "O(n log n)" }
  ],
  pitfalls: [
    ["Not sorting first", "The single-pass logic only works on sorted intervals."],
    ["Using `<` vs `<=` inconsistently", "Decide whether [1, 2] and [2, 3] overlap (touching). Read the statement."],
    ["Sorting by start for “max non-overlapping”", "The greedy needs earliest **end** first."],
    ["Mutating the input when you shouldn't", "`intervals.sort()` changes the caller's list; use `sorted()` if that matters."]
  ],
  edge: ["Empty list", "One interval", "Touching intervals [1, 2], [2, 3]", "One interval contains all others", "Identical intervals"],
  compare: [
    ["Line Sweep", "line-sweep", "Counting how many intervals cover a point at once is easier with +1/−1 events."],
    ["Greedy", "greedy", "Sort-by-end interval scheduling is the textbook greedy proof (exchange argument)."],
    ["Top-K / Heaps", "top-k", "Meeting rooms II keeps a min-heap of end times."]
  ],
  mcq: [
    ["To keep the **most** non-overlapping intervals, sort by…", ["Start time", "End time", "Length", "Input order"], 1, "Finishing earliest leaves the most room for the rest (exchange argument)."],
    ["After sorting by start, [s, e] overlaps the last merged block when…", ["s < last_start", "s <= last_end", "e <= last_end", "e >= last_start"], 1, "Sorted by start, it overlaps exactly when it begins before the block ends."]
  ],
  summary: {
    oneLine: "Sort by start to merge, by end to keep the most; then one pass comparing with the last kept interval.",
    signals: ["Lists of [start, end]", "Merge / insert / free time", "Min removals / max non-overlapping / arrows", "How many at once"],
    template: `out = []
for s, e in sorted(intervals):
    if out and s <= out[-1][1]:
        out[-1][1] = max(out[-1][1], e)
    else:
        out.append([s, e])`,
    pitfalls: ["Sort first", "Touching = overlapping? read carefully", "Max non-overlapping sorts by end"],
    cx: "O(n log n) time · O(n) space",
    drill: { task: "Merge all overlapping intervals and return them sorted by start.",
      ref: `def merge(intervals):
    out = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      tests: [["[[1, 3], [2, 6], [8, 10], [15, 18]]", "[[1, 6], [8, 10], [15, 18]]"], ["[[1, 4], [4, 5]]", "[[1, 5]]"], ["[[5, 7], [1, 2]]", "[[1, 2], [5, 7]]"]] }
  },
  problems: [
    { id: "any-clash", title: "Any Clash?", d: "Easy", lc: "meeting-rooms",
      statement: "`meetings` holds `[start, end)` pairs (end exclusive). Return `True` if one person can attend all of them, i.e. no two overlap.",
      examples: [["[[0, 30], [5, 10], [15, 20]]", "False", ""], ["[[7, 10], [2, 4]]", "True", ""], ["[[1, 5], [5, 8]]", "True", "Back-to-back is fine."]],
      constraints: ["0 ≤ len(meetings) ≤ 10⁵", "0 ≤ start < end ≤ 10⁶"],
      hints: ["Sort by start.", "Then you only need to compare neighbours."],
      solution: `def any_clash(meetings):
    meetings = sorted(meetings)
    for i in range(1, len(meetings)):
        if meetings[i][0] < meetings[i - 1][1]:
            return False
    return True`,
      why: "After sorting, any overlap shows up between two adjacent meetings.", time: "O(n log n)",
      hidden: [["[]", "True"], ["[[1, 2], [1, 2]]", "False"], ["[[i, i + 1] for i in range(100000)]", "True"], ["[[i, i + 2] for i in range(0, 100000, 2)] + [[5, 6]]", "False"]] },
    { id: "ranges-summary", title: "Range Summary", d: "Easy", lc: "summary-ranges",
      statement: "`nums` is sorted and has no duplicates. Summarise it as a list of strings: a run of consecutive numbers `a..b` becomes `'a->b'`, a lone number `a` becomes `'a'`.",
      examples: [["[0, 1, 2, 4, 5, 7]", "['0->2', '4->5', '7']", ""], ["[0, 2, 3, 4, 6, 8, 9]", "['0', '2->4', '6', '8->9']", ""]],
      constraints: ["0 ≤ len(nums) ≤ 10⁵"],
      hints: ["Walk the list; a run continues while the next number is exactly one more.", "Close the run when it breaks."],
      solution: `def ranges_summary(nums):
    out, i = [], 0
    while i < len(nums):
        j = i
        while j + 1 < len(nums) and nums[j + 1] == nums[j] + 1:
            j += 1
        out.append(str(nums[i]) if i == j else f"{nums[i]}->{nums[j]}")
        i = j + 1
    return out`,
      why: "Each number is visited once while building maximal runs (intervals).", time: "O(n)",
      hidden: [["[]", "[]"], ["[-1]", "['-1']"], ["list(range(100000))", "['0->99999']"]] },
    { id: "merge-bookings", title: "Merge Bookings", d: "Medium", lc: "merge-intervals",
      statement: "Merge all overlapping room bookings `[start, end]` (touching bookings like `[1, 4]` and `[4, 5]` count as overlapping). Return the merged list sorted by start.",
      examples: [["[[1, 3], [2, 6], [8, 10], [15, 18]]", "[[1, 6], [8, 10], [15, 18]]", ""], ["[[1, 4], [4, 5]]", "[[1, 5]]", ""]],
      constraints: ["1 ≤ len(bookings) ≤ 10⁵", "0 ≤ start ≤ end ≤ 10⁹"],
      hints: ["Sort by start.", "Compare each booking with the last merged one: extend or append."],
      solution: `def merge_bookings(bookings):
    out = []
    for s, e in sorted(bookings):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out`,
      why: "Sorted by start, a booking can only overlap the most recent merged block.", time: "O(n log n)",
      hidden: [["[[1, 4], [2, 3]]", "[[1, 4]]"], ["[[5, 6], [1, 2]]", "[[1, 2], [5, 6]]"], ["[[i, i + 1] for i in range(100000)]", "[[0, 100000]]"]] },
    { id: "slot-in", title: "Slot In a Booking", d: "Medium", lc: "insert-interval",
      statement: "`bookings` is sorted by start and non-overlapping. Insert `new` and merge where needed. Return the resulting sorted, non-overlapping list.",
      examples: [["[[1, 3], [6, 9]], [2, 5]", "[[1, 5], [6, 9]]", ""], ["[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]", "[[1, 2], [3, 10], [12, 16]]", ""]],
      constraints: ["0 ≤ len(bookings) ≤ 10⁵"],
      hints: ["Three phases: bookings entirely before `new`, ones overlapping it, ones entirely after.", "While overlapping, widen `new` to cover them."],
      solution: `def slot_in(bookings, new):
    s, e = new
    out, i, n = [], 0, len(bookings)
    while i < n and bookings[i][1] < s:
        out.append(bookings[i]); i += 1
    while i < n and bookings[i][0] <= e:
        s = min(s, bookings[i][0])
        e = max(e, bookings[i][1])
        i += 1
    out.append([s, e])
    out.extend(bookings[i:])
    return out`,
      why: "The input is already sorted, so one linear pass splits it into before / overlapping / after.", time: "O(n)",
      hidden: [["[], [5, 7]", "[[5, 7]]"], ["[[1, 5]], [2, 3]", "[[1, 5]]"], ["[[1, 5]], [6, 8]", "[[1, 5], [6, 8]]"], ["[[2 * i, 2 * i + 1] for i in range(50000)], [1, 99998]", "[[0, 99999]]"]] },
    { id: "fewest-cancels", title: "Fewest Cancellations", d: "Medium", lc: "non-overlapping-intervals",
      statement: "Return the minimum number of events to cancel so the remaining `[start, end)` events don't overlap (back-to-back is fine).",
      examples: [["[[1, 2], [2, 3], [3, 4], [1, 3]]", "1", "Cancel [1, 3]."], ["[[1, 2], [1, 2], [1, 2]]", "2", ""], ["[[1, 2], [2, 3]]", "0", ""]],
      constraints: ["1 ≤ len(events) ≤ 10⁵", "−5·10⁴ ≤ start < end ≤ 5·10⁴"],
      hints: ["Cancelling the fewest = keeping the most.", "Greedy: sort by end, keep each event that starts at or after the last kept end."],
      solution: `def fewest_cancels(events):
    kept, end = 0, float("-inf")
    for s, e in sorted(events, key=lambda x: x[1]):
        if s >= end:
            kept += 1
            end = e
    return len(events) - kept`,
      why: "The event that ends first is always safe to keep (exchange argument), so greedy keeps the maximum.", time: "O(n log n)",
      hidden: [["[[0, 1]]", "0"], ["[[1, 100], [11, 22], [1, 11], [2, 12]]", "2"], ["[[0, 50000]] + [[i, i + 1] for i in range(50000)]", "1"]] },
    { id: "pop-balloons", title: "Pop the Balloons", d: "Medium", lc: "minimum-number-of-arrows-to-burst-balloons",
      statement: "Each balloon spans `[x1, x2]` on the x-axis. An arrow shot straight up at position x pops every balloon with `x1 ≤ x ≤ x2`. Return the minimum number of arrows to pop all balloons.",
      examples: [["[[10, 16], [2, 8], [1, 6], [7, 12]]", "2", "Shoot at 6 and 11."], ["[[1, 2], [3, 4], [5, 6], [7, 8]]", "4", ""], ["[[1, 2], [2, 3], [3, 4], [4, 5]]", "2", ""]],
      constraints: ["1 ≤ len(points) ≤ 10⁵", "−2³¹ ≤ x1 < x2 ≤ 2³¹ − 1"],
      hints: ["Sort by end.", "Shoot at the end of the first balloon; it pops everything starting at or before that point.", "Shoot again only when a balloon starts after the last arrow."],
      solution: `def pop_balloons(points):
    arrows, last = 0, float("-inf")
    for s, e in sorted(points, key=lambda p: p[1]):
        if s > last:
            arrows += 1
            last = e
    return arrows`,
      why: "Shooting at the earliest end pops the maximum set of balloons that must include the first-ending one.", time: "O(n log n)",
      hidden: [["[[1, 2]]", "1"], ["[[1, 10], [2, 3], [4, 5]]", "2"], ["[[i, i + 1] for i in range(0, 200000, 2)]", "100000"]] },
    { id: "shared-free", title: "Both Free", d: "Medium", lc: "interval-list-intersections",
      statement: "`a` and `b` are each sorted lists of disjoint closed intervals: free slots of two people. Return every interval where **both** are free, sorted.",
      examples: [["[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]", "[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]", ""], ["[[1, 3], [5, 9]], []", "[]", ""]],
      constraints: ["0 ≤ len(a), len(b) ≤ 10⁵"],
      hints: ["Two pointers, one per list.", "The overlap of two intervals is [max starts, min ends] if non-empty.", "Advance whichever interval ends first."],
      solution: `def shared_free(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):
        lo = max(a[i][0], b[j][0])
        hi = min(a[i][1], b[j][1])
        if lo <= hi:
            out.append([lo, hi])
        if a[i][1] < b[j][1]:
            i += 1
        else:
            j += 1
    return out`,
      why: "The interval that ends first can't overlap anything later in the other list, so dropping it is safe.", time: "O(m + n)",
      hidden: [["[[1, 7]], [[3, 10]]", "[[3, 7]]"], ["[[1, 2]], [[3, 4]]", "[]"], ["[[2 * i, 2 * i] for i in range(50000)], [[0, 100000]]", "[[2 * i, 2 * i] for i in range(50000)]"]] },
    { id: "server-rooms", title: "Server Rooms", d: "Medium", lc: "meeting-rooms-ii",
      statement: "Each job is a pair `[start, end)` of minutes; it occupies a server room from `start` up to but **not including** `end`. Return the minimum number of rooms needed so no two overlapping jobs share a room.",
      examples: [["[[0, 30], [5, 10], [15, 20]]", "2", "[0,30] overlaps both others, but those two don't overlap each other."], ["[[7, 10], [2, 4]]", "1", ""], ["[[1, 5], [5, 10]]", "1", "The first job ends exactly when the second starts."]],
      constraints: ["0 ≤ len(jobs) ≤ 10⁵", "0 ≤ start < end ≤ 10⁹"],
      hints: ["What matters is how many jobs run at the same moment.", "Sort starts and ends separately and walk both.", "Or keep a min-heap of end times of rooms in use."],
      solution: `def min_rooms(jobs):
    starts = sorted(s for s, e in jobs)
    ends = sorted(e for s, e in jobs)
    rooms = best = j = 0
    for s in starts:
        while j < len(ends) and ends[j] <= s:
            rooms -= 1
            j += 1
        rooms += 1
        best = max(best, rooms)
    return best`,
      why: "The answer is the largest number of jobs overlapping at one moment, found by sweeping sorted starts and ends.", time: "O(n log n)",
      hidden: [["[]", "0"], ["[[1, 10], [2, 9], [3, 8]]", "3"], ["[[i, i + 3] for i in range(100000)]", "3"], ["[[5, 6]] * 4", "4"]] },
    { id: "team-free-time", title: "Team Free Time", d: "Hard", lc: "employee-free-time",
      statement: "`schedules[k]` is person k's busy intervals `[start, end]`, sorted and disjoint. Return the finite intervals of positive length when **everyone** is free, sorted.",
      examples: [["[[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]", "[[3, 4]]", ""], ["[[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]", "[[5, 6], [7, 9]]", ""]],
      constraints: ["1 ≤ people ≤ 50", "total intervals ≤ 10⁵"],
      hints: ["Flatten everyone's busy time into one list.", "Merge it like ordinary intervals.", "The gaps between merged blocks are the shared free time."],
      solution: `def team_free_time(schedules):
    busy = sorted(iv for person in schedules for iv in person)
    out = []
    end = busy[0][1]
    for s, e in busy[1:]:
        if s > end:
            out.append([end, s])
        end = max(end, e)
    return out`,
      why: "Free for everyone = not covered by anyone's busy time, i.e. the gaps in the merged busy list.", time: "O(N log N)",
      hidden: [["[[[1, 5]]]", "[]"], ["[[[1, 2]], [[3, 4]]]", "[[2, 3]]"], ["[[[2 * i, 2 * i + 1] for i in range(25000)], [[2 * i, 2 * i + 1] for i in range(25000)]]", "[[2 * i + 1, 2 * i + 2] for i in range(24999)]"]] }
  ]
});
