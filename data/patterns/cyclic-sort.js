PAT("cyclic-sort", {
  time: "O(n)", space: "O(1)",
  lede: "When values are 1..n (or 0..n), each value tells you exactly which index it belongs at. Put every value in its home and the misfits reveal what's missing or duplicated, with O(1) extra space.",
  idea: "A hash set would solve “what's missing?” in O(n) space. But if the values are in range 1..n, the **array itself** can be the hash table: value v lives at index v − 1. Swap each value home (cyclic sort), or mark its home by negating it. Then one scan finds the misfits.",
  analogy: "Numbered lockers 1..n and a pile of numbered keys. Hang each key in its own locker; the empty lockers and doubled-up keys jump out at you.",
  flavours: [["Technique", "How", "Keeps the array?"], [
    ["**Cyclic sort**", "swap `a[i]` to index `a[i] − 1` until it's home", "rearranges it"],
    ["**Negative marking**", "make `a[abs(v) − 1]` negative to mean “seen”", "values recoverable with abs()"]]],
  signals: [["Values are in the range **1..n** or **0..n**", "and the array has n (or n+1) slots"], ["“Find the missing / duplicate number(s)”", "with **O(1) extra space**"], ["“Smallest missing positive”", "values outside 1..n can be ignored"]],
  not: "**Not this pattern** when values aren't bounded by the array length (→ hashing or sorting), or you're not allowed to modify the input.",
  templates: [
    ["Cyclic sort", "cyclic_sort.py", `def cyclic_sort(a):                   # values 1..n
    i = 0
    while i < len(a):
        home = a[i] - 1
        if 0 <= home < len(a) and a[i] != a[home]:
            a[i], a[home] = a[home], a[i]   # send it home; don't move i yet
        else:
            i += 1
    return a

print(cyclic_sort([3, 1, 5, 4, 2]))
arr = cyclic_sort([3, 4, 2, 4, 1])
print([i + 1 for i, v in enumerate(arr) if v != i + 1])   # missing numbers`, "[1, 2, 3, 4, 5]\n[5]"],
    ["Negative marking", "mark.py", `def disappeared(a):
    for v in a:
        a[abs(v) - 1] = -abs(a[abs(v) - 1])     # mark index v-1 as "seen"
    return [i + 1 for i, v in enumerate(a) if v > 0]

print(disappeared([4, 3, 2, 7, 8, 2, 3, 1]))`, "[5, 6]"]
  ],
  examples: [
    { t: "Missing Number", d: "Easy", lc: "missing-number", f: "Math / cyclic",
      q: "0..n with one number missing (n values). Find it.",
      idea: "Sum formula, XOR, or cyclic sort all work. The sum trick: n(n+1)/2 − sum.",
      code: `def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)

print(missing_number([3, 0, 1]), missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))`, out: "2 8", cx: "O(n) time · O(1) space" },
    { t: "Find All Duplicates in an Array", d: "Medium", lc: "find-all-duplicates-in-an-array", f: "Negative marking",
      q: "Values 1..n, each appears once or twice. Return those appearing twice, O(1) extra space.",
      idea: "Flip the sign at index v − 1. If it's already negative, v is a duplicate.",
      code: `def find_duplicates(a):
    out = []
    for v in a:
        j = abs(v) - 1
        if a[j] < 0:
            out.append(abs(v))
        else:
            a[j] = -a[j]
    return out

print(find_duplicates([4, 3, 2, 7, 8, 2, 3, 1]))`, out: "[2, 3]", cx: "O(n) · O(1)" },
    { t: "First Missing Positive", d: "Hard", lc: "first-missing-positive", f: "Cyclic sort",
      q: "Smallest positive integer not in the array, O(n) time and O(1) space.",
      idea: "The answer is in 1..n+1. Cyclic-sort values 1..n home, ignore the rest, then the first index i with a[i] ≠ i + 1 gives the answer.",
      code: `def first_missing_positive(a):
    n = len(a)
    for i in range(n):
        while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
            j = a[i] - 1
            a[i], a[j] = a[j], a[i]
    for i in range(n):
        if a[i] != i + 1:
            return i + 1
    return n + 1

print(first_missing_positive([3, 4, -1, 1]), first_missing_positive([7, 8, 9]))`, out: "2 1", cx: "O(n) · O(1)" }
  ],
  pitfalls: [
    ["Advancing `i` right after a swap", "The value swapped in hasn't been placed yet: keep i until a[i] is home or can't move."],
    ["Infinite loop on duplicates", "Only swap when `a[i] != a[home]`; otherwise two equal values swap forever."],
    ["Forgetting `abs()` with negative marking", "Values you already marked are negative; their index is `abs(v) − 1`."],
    ["Not checking the range", "In “first missing positive”, values ≤ 0 or > n have no home: skip them."]
  ],
  edge: ["Nothing missing (answer is n + 1)", "All values the same", "Negative numbers and zero", "Single element", "Value n present / absent"],
  compare: [
    ["Hashing", "hashing", "A set solves the same questions in O(n) space; cyclic sort trades that for O(1) space when values are 1..n."],
    ["Fast & Slow Pointers", "fast-slow", "“Find the duplicate without modifying the array” treats a[i] as a next-pointer and finds the cycle start."],
    ["Bit Manipulation", "bits", "XOR of indices and values finds a single missing number without any marking."]
  ],
  mcq: [
    ["Values are 1..n. Where does value v belong after cyclic sort?", ["Index v", "Index v − 1", "Index n − v", "Anywhere"], 1, "With 0-based indices, 1 lives at 0, 2 at 1, … so v at v − 1."],
    ["What's the largest possible answer for “first missing positive” with n numbers?", ["n − 1", "n", "n + 1", "Unbounded"], 2, "If 1..n are all present, the answer is n + 1."]
  ],
  summary: {
    oneLine: "Values 1..n → value v lives at index v − 1; misfits reveal missing / duplicates in O(1) space.",
    signals: ["Values bounded by the array length", "Find missing / duplicate numbers", "O(1) extra space required"],
    template: `i = 0
while i < len(a):
    home = a[i] - 1
    if 0 <= home < len(a) and a[i] != a[home]:
        a[i], a[home] = a[home], a[i]
    else:
        i += 1`,
    pitfalls: ["Don't advance i after a swap", "Swap only if a[i] != a[home]", "abs() when negative-marking"],
    cx: "O(n) time · O(1) space",
    drill: { task: "Values are integers (any range). Return the smallest positive integer that's missing, in O(n) time and O(1) extra space.",
      ref: `def first_missing(a):
    n = len(a)
    for i in range(n):
        while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
            j = a[i] - 1
            a[i], a[j] = a[j], a[i]
    for i in range(n):
        if a[i] != i + 1:
            return i + 1
    return n + 1`,
      tests: [["[1, 2, 0]", "3"], ["[3, 4, -1, 1]", "2"], ["[7, 8, 9, 11, 12]", "1"]] }
  },
  problems: [
    { id: "missing-ticket", title: "Missing Ticket", d: "Easy", lc: "missing-number",
      statement: "Tickets numbered `0..n` were sold, but one is missing from the `n` tickets in `tickets`. Return the missing number. Try O(1) extra space.",
      examples: [["[3, 0, 1]", "2", ""], ["[0, 1]", "2", ""], ["[9, 6, 4, 2, 3, 5, 7, 0, 1]", "8", ""]],
      constraints: ["1 ≤ n ≤ 10⁵", "all numbers are distinct"],
      hints: ["You know what 0 + 1 + … + n adds up to.", "Or XOR every index and value together."],
      solution: `def missing_ticket(tickets):
    n = len(tickets)
    return n * (n + 1) // 2 - sum(tickets)`,
      why: "The expected total minus the actual total is exactly the missing ticket.", time: "O(n)",
      hidden: [["[0]", "1"], ["[1]", "0"], ["list(range(100001))[:50000] + list(range(50001, 100001))", "50000"]] },
    { id: "mixed-up-set", title: "Mixed-up Set", d: "Easy", lc: "set-mismatch",
      statement: "`nums` should contain each of `1..n` once, but one number got copied over another: one value appears twice and one is missing. Return `[duplicate, missing]`.",
      examples: [["[1, 2, 2, 4]", "[2, 3]", ""], ["[1, 1]", "[1, 2]", ""]],
      constraints: ["2 ≤ len(nums) ≤ 10⁴"],
      hints: ["Mark index v − 1 as seen by making it negative.", "Hitting an already-negative slot means v is the duplicate.", "Afterwards, the still-positive slot is the missing number."],
      solution: `def mixed_up(nums):
    a = nums[:]
    dup = -1
    for v in a:
        j = abs(v) - 1
        if a[j] < 0:
            dup = abs(v)
        else:
            a[j] = -a[j]
    missing = next(i + 1 for i, v in enumerate(a) if v > 0)
    return [dup, missing]`,
      why: "Negative marking records “seen” inside the array itself, so both answers come out in O(1) extra space.", time: "O(n)",
      hidden: [["[2, 2]", "[2, 1]"], ["[3, 2, 3, 4, 6, 5]", "[3, 1]"], ["list(range(1, 10000)) + [9999]", "[9999, 10000]"]] },
    { id: "vanished-ids", title: "Vanished IDs", d: "Easy", lc: "find-all-numbers-disappeared-in-an-array",
      statement: "`ids` has `n` values, each in `1..n`; some appear twice and some never. Return all values in `1..n` that never appear, ascending.",
      examples: [["[4, 3, 2, 7, 8, 2, 3, 1]", "[5, 6]", ""], ["[1, 1]", "[2]", ""]],
      constraints: ["1 ≤ n ≤ 10⁵", "1 ≤ ids[i] ≤ n"],
      hints: ["Value v's home is index v − 1.", "Mark homes as visited (negate); unmarked homes are missing."],
      solution: `def vanished(ids):
    a = ids[:]
    for v in a:
        j = abs(v) - 1
        a[j] = -abs(a[j])
    return [i + 1 for i, v in enumerate(a) if v > 0]`,
      why: "Each present value marks its home; homes left unmarked belong to missing values.", time: "O(n)",
      hidden: [["[1]", "[]"], ["[2, 2]", "[1]"], ["[1] * 100000", "list(range(2, 100001))"]] },
    { id: "twice-seen", title: "Seen Twice", d: "Medium", lc: "find-all-duplicates-in-an-array",
      statement: "Every value in `nums` is in `1..n` (n = len(nums)) and appears once or twice. Return the values that appear twice, ascending, using O(1) extra space besides the output.",
      examples: [["[4, 3, 2, 7, 8, 2, 3, 1]", "[2, 3]", ""], ["[1, 1, 2]", "[1]", ""], ["[1]", "[]", ""]],
      constraints: ["1 ≤ n ≤ 10⁵"],
      hints: ["Use the sign of a[v − 1] as a “seen v” flag.", "Finding the flag already set means v is a repeat."],
      solution: `def twice_seen(nums):
    a = nums[:]
    out = []
    for v in a:
        j = abs(v) - 1
        if a[j] < 0:
            out.append(abs(v))
        else:
            a[j] = -a[j]
    return sorted(out)`,
      why: "The array doubles as a seen-set via signs, so duplicates are detected in one pass.", time: "O(n)",
      hidden: [["[2, 2]", "[2]"], ["[5, 4, 6, 7, 9, 3, 10, 9, 5, 6]", "[5, 6, 9]"], ["[i // 2 + 1 for i in range(100000)]", "list(range(1, 50001))"]] },
    { id: "the-copy", title: "The Copy", d: "Medium", lc: "find-the-duplicate-number",
      statement: "`nums` has `n + 1` values, each in `1..n`, so at least one value repeats. Exactly one value repeats (possibly several times). Return it. Try not to modify `nums` and use O(1) extra space.",
      examples: [["[1, 3, 4, 2, 2]", "2", ""], ["[3, 1, 3, 4, 2]", "3", ""], ["[3, 3, 3, 3, 3]", "3", ""]],
      constraints: ["1 ≤ n ≤ 10⁵"],
      hints: ["Treat each value as a pointer: i → nums[i].", "Because some value is pointed to twice, the walk from index 0 enters a cycle.", "The cycle's entrance is the duplicate (Floyd's tortoise and hare)."],
      solution: `def the_copy(nums):
    slow = fast = nums[0]
    while True:
        slow = nums[slow]
        fast = nums[nums[fast]]
        if slow == fast:
            break
    slow = nums[0]
    while slow != fast:
        slow = nums[slow]
        fast = nums[fast]
    return slow`,
      why: "Index 0 is never a target, so the walk from it reaches a cycle whose entry is the repeated value.", time: "O(n)",
      hidden: [["[1, 1]", "1"], ["[2, 5, 9, 6, 9, 3, 8, 9, 7, 1]", "9"], ["list(range(1, 100001)) + [77777]", "77777"]] },
    { id: "first-free-slot", title: "First Free Slot", d: "Hard", lc: "first-missing-positive",
      statement: "`slots` lists parking-slot numbers already taken (any integers, including junk like 0 or negatives). Return the smallest **positive** slot number not taken. Use O(n) time and O(1) extra space.",
      examples: [["[1, 2, 0]", "3", ""], ["[3, 4, -1, 1]", "2", ""], ["[7, 8, 9, 11, 12]", "1", ""]],
      constraints: ["1 ≤ len(slots) ≤ 10⁵", "−2³¹ ≤ slots[i] ≤ 2³¹ − 1"],
      hints: ["With n numbers, the answer is between 1 and n + 1.", "Cyclic-sort values in 1..n to their home index; ignore everything else.", "The first index i with a[i] ≠ i + 1 gives the answer."],
      solution: `def first_free(slots):
    a = slots[:]
    n = len(a)
    for i in range(n):
        while 1 <= a[i] <= n and a[a[i] - 1] != a[i]:
            j = a[i] - 1
            a[i], a[j] = a[j], a[i]
    for i in range(n):
        if a[i] != i + 1:
            return i + 1
    return n + 1`,
      why: "Each swap puts one value in its final home, so there are at most n swaps in total.", time: "O(n)",
      hidden: [["[1]", "2"], ["[2]", "1"], ["list(range(100000, 0, -1))", "100001"], ["[1, 1, 2, 2]", "3"]] },
    { id: "first-k-free", title: "First K Free Slots", d: "Medium", lc: "kth-missing-positive-number",
      statement: "Return the **k smallest** positive integers that are not in `taken`, in ascending order.",
      examples: [["[2, 3, 4, 7, 11], 5", "[1, 5, 6, 8, 9]", ""], ["[1, 2, 3, 4], 2", "[5, 6]", ""]],
      constraints: ["1 ≤ len(taken) ≤ 10⁵", "1 ≤ taken[i] ≤ 10⁹", "1 ≤ k ≤ 10⁵"],
      hints: ["A set of taken values gives O(1) membership.", "Walk 1, 2, 3, … collecting free numbers until you have k.", "At most n + k numbers need checking."],
      solution: `def first_k_free(taken, k):
    s = set(taken)
    out, x = [], 1
    while len(out) < k:
        if x not in s:
            out.append(x)
        x += 1
    return out`,
      why: "Only the first n + k positive integers can matter, and each check is O(1).", time: "O(n + k)",
      hidden: [["[1], 1", "[2]"], ["[5, 6], 3", "[1, 2, 3]"], ["list(range(1, 100001)), 3", "[100001, 100002, 100003]"]] }
  ]
});
