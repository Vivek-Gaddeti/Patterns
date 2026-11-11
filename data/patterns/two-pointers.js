PAT("two-pointers", {
  time: "O(n)", space: "O(1)",
  lede: "Two indices walk through the data following a simple rule. Together they replace a nested O(n²) loop with a single O(n) pass, usually with no extra memory.",
  idea: "A brute-force pair search checks every `(i, j)`: that's n² pairs. Two pointers work because the data has **structure** (it's sorted, or you're filling it in order), so each comparison lets you throw away a whole row of pairs at once.",
  analogy: "Two people search a sorted bookshelf for two books whose prices add to ₹500. One starts at the cheap end, one at the expensive end. Too expensive? The right person steps left. Too cheap? The left person steps right. Nobody ever walks back.",
  flavours: [["Flavour", "Setup", "Use it for"], [
    ["**Opposite ends**", "`l = 0`, `r = n − 1`, move inward", "sorted pair sums, palindromes, container / water"],
    ["**Same direction**", "`w` = write slot, `r` = read cursor", "remove duplicates, move zeros, partition in place"],
    ["**Two sequences**", "`i` in A, `j` in B", "merge sorted arrays, subsequence check"]]],
  signals: [["The input is **sorted** (or you may sort it)", "and you need a pair, triplet or closest sum"], ["“**in place**” or “O(1) extra space”", "remove, move or partition elements"], ["Compare from **both ends**", "palindromes, reversing, mirror checks"], ["Walk **two sequences** together", "merge, intersect, subsequence"]],
  not: "**Not this pattern** when the array is unsorted and you need original indices (→ hashing), or when you need a contiguous range that satisfies a condition (→ sliding window).",
  viz: ["pairSum", { a: [1, 3, 4, 6, 8, 10, 13], target: 18 }],
  templates: [
    ["Opposite ends", "opposite_ends.py", `def pair_with_sum(a, target):        # a must be sorted
    l, r = 0, len(a) - 1
    while l < r:                         # stop when the pointers meet
        s = a[l] + a[r]
        if s == target:
            return (l, r)
        if s < target:
            l += 1                       # too small: need a bigger left value
        else:
            r -= 1                       # too big: need a smaller right value
    return None

print(pair_with_sum([1, 2, 4, 6, 8], 10))
print(pair_with_sum([1, 2, 3], 100))`, "(1, 4)\nNone"],
    ["Read / write", "read_write.py", `def remove_duplicates(a):              # a is sorted; dedupe in place
    w = 0                                # next slot to write a keeper into
    for r in range(len(a)):              # r reads every element once
        if r == 0 or a[r] != a[r - 1]:   # is a[r] worth keeping?
            a[w] = a[r]
            w += 1
    return w                             # a[:w] is the answer

arr = [1, 1, 2, 3, 3, 3, 4]
k = remove_duplicates(arr)
print(k, arr[:k])`, "4 [1, 2, 3, 4]"],
    ["Two sequences", "two_sequences.py", `def merge_sorted(a, b):
    i = j = 0
    out = []
    while i < len(a) and j < len(b):     # take the smaller head each step
        if a[i] <= b[j]:
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])                    # one list may have leftovers
    out.extend(b[j:])
    return out

print(merge_sorted([1, 4, 7], [2, 3, 8, 9]))`, "[1, 2, 3, 4, 7, 8, 9]"]
  ],
  examples: [
    { t: "Valid Palindrome", d: "Easy", lc: "valid-palindrome", f: "Opposite ends",
      q: "Is the string a palindrome when you only look at letters and digits, ignoring case?",
      idea: "Opposite ends. Skip anything that isn't alphanumeric, compare lowercase characters, step both pointers inward.",
      code: `def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum(): l += 1
        while l < r and not s[r].isalnum(): r -= 1
        if s[l].lower() != s[r].lower():
            return False
        l, r = l + 1, r - 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"), is_palindrome("race a car"))`, out: "True False", cx: "O(n) time · O(1) space" },
    { t: "Container With Most Water", d: "Medium", lc: "container-with-most-water", f: "Opposite ends",
      q: "Pick two vertical lines that, together with the x-axis, hold the most water.",
      idea: "Start with the widest container. The shorter line caps the height, so moving the **taller** line inward can never help. Always move the shorter one.",
      code: `def max_area(h):
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(h[l], h[r]))
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))`, out: "49", cx: "O(n) time · O(1) space" },
    { t: "3Sum", d: "Medium", lc: "3sum", f: "Opposite ends",
      q: "Return all unique triplets that sum to 0.",
      idea: "Sort. Fix `i`, then run opposite-ends two pointers on the rest. Skip equal values so no triplet repeats.",
      code: `def three_sum(nums):
    nums.sort()
    res = []
    for i in range(len(nums)):
        if i and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res

print(three_sum([-1, 0, 1, 2, -1, -4]))`, out: "[[-1, -1, 2], [-1, 0, 1]]", cx: "O(n²) time · O(1) extra" },
    { t: "Move Zeroes", d: "Easy", lc: "move-zeroes", f: "Read / write",
      q: "Move every 0 to the end while keeping the order of the other numbers, in place.",
      idea: "`w` marks where the next non-zero belongs. Swapping pushes zeros back in the same pass.",
      code: `def move_zeroes(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w], nums[r] = nums[r], nums[w]
            w += 1
    return nums

print(move_zeroes([0, 1, 0, 3, 12]))`, out: "[1, 3, 12, 0, 0]", cx: "O(n) time · O(1) space" },
    { t: "Sort Colors (Dutch flag)", d: "Medium", lc: "sort-colors", f: "Read / write",
      q: "Sort an array of 0s, 1s and 2s in place, in one pass.",
      idea: "Before `lo` everything is 0, after `hi` everything is 2, `i` scans the middle. Don't advance `i` after swapping with `hi`: the value that came in hasn't been checked.",
      code: `def sort_colors(a):
    lo, i, hi = 0, 0, len(a) - 1
    while i <= hi:
        if a[i] == 0:
            a[lo], a[i] = a[i], a[lo]; lo += 1; i += 1
        elif a[i] == 2:
            a[hi], a[i] = a[i], a[hi]; hi -= 1
        else:
            i += 1
    return a

print(sort_colors([2, 0, 2, 1, 1, 0]))`, out: "[0, 0, 1, 1, 2, 2]", cx: "O(n) time · O(1) space" },
    { t: "Merge Sorted Array", d: "Easy", lc: "merge-sorted-array", f: "Two sequences",
      q: "Merge nums2 into nums1, which has empty space at the end, in place.",
      idea: "Fill from the **back** with three pointers so you never overwrite a value you still need.",
      code: `def merge(nums1, m, nums2, n):
    i, j, w = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[w] = nums1[i]; i -= 1
        else:
            nums1[w] = nums2[j]; j -= 1
        w -= 1
    return nums1

print(merge([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3))`, out: "[1, 2, 2, 3, 5, 6]", cx: "O(m + n) time · O(1) space" },
    { t: "Trapping Rain Water", d: "Hard", lc: "trapping-rain-water", f: "Opposite ends",
      q: "Given bar heights, how much rain water is trapped between them?",
      idea: "Water above a bar is `min(maxLeft, maxRight) − height`. The side with the smaller running max is the bottleneck, so its water level is already known: process that side.",
      code: `def trap(h):
    l, r = 0, len(h) - 1
    left_max = right_max = water = 0
    while l < r:
        if h[l] < h[r]:
            left_max = max(left_max, h[l])
            water += left_max - h[l]
            l += 1
        else:
            right_max = max(right_max, h[r])
            water += right_max - h[r]
            r -= 1
    return water

print(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]))`, out: "6", cx: "O(n) time · O(1) space" }
  ],
  pitfalls: [
    ["Opposite ends on an **unsorted** array", "“Move l when the sum is too small” only works on sorted data. Sort first, or use a hash map."],
    ["`while l <= r` instead of `while l < r`", "The pointers can land on the same element and pair it with itself."],
    ["Forgetting to skip duplicates in 3Sum / 4Sum", "You'll output the same triplet several times."],
    ["Advancing `i` after swapping with `hi` (Dutch flag)", "The value swapped in from the right hasn't been checked yet."],
    ["Merging forward into nums1", "You overwrite values you still need. Merge from the back."]
  ],
  edge: ["Empty array / single element", "All elements equal", "No valid answer exists", "Negative numbers", "Answer uses the first or last element"],
  compare: [
    ["Sliding Window", "sliding-window-variable", "Both use two indices, but a window cares about **everything between** l and r. Two pointers usually only look at the two ends."],
    ["Hashing", "hashing", "Pair sum in **unsorted** data where you need original indices → hash map: O(n) time, O(n) space. Sorted → two pointers: O(1) space."],
    ["Binary Search", "binary-search", "You *could* binary-search each element's partner (O(n log n)). Two pointers is O(n) because both pointers only move one way."]
  ],
  mcq: [
    ["You need the indices of two numbers that sum to target in an **unsorted** array. Best approach?", ["Sort, then two pointers", "Hash map of value → index", "Nested loops", "Binary search per element"], 1, "Sorting loses the original indices and costs O(n log n). One pass with a hash map is O(n)."],
    ["In Container With Most Water, why move the **shorter** line?", ["It's always on the left", "Moving the taller one can never give a larger area", "To keep the window small", "It makes the code simpler"], 1, "Width shrinks either way and the height is capped by the shorter line, so moving the taller one can only make things worse."]
  ],
  summary: {
    oneLine: "Sorted data or in-place work → two indices that only move inward or forward.",
    signals: ["Sorted input + pair / triplet / closest sum", "“In place”, O(1) extra space", "Compare from both ends (palindromes)", "Walk two sequences together (merge)"],
    template: `l, r = 0, len(a) - 1
while l < r:
    s = a[l] + a[r]
    if s == target: return (l, r)
    if s < target: l += 1
    else: r -= 1`,
    pitfalls: ["Pair sums need sorted data", "`while l < r`, not `<=`", "Skip duplicates in 3Sum", "Merge into nums1 from the back"],
    cx: "O(n) time · O(1) space (O(n log n) if you sort first)",
    drill: { task: "The list is sorted. Return the pair of indices `(l, r)` whose values add to target, or `None`.",
      ref: `def pair_with_sum(a, target):
    l, r = 0, len(a) - 1
    while l < r:
        s = a[l] + a[r]
        if s == target: return (l, r)
        if s < target: l += 1
        else: r -= 1
    return None`,
      tests: [["[1, 2, 4, 6, 8], 10", "(1, 4)"], ["[1, 2, 3], 100", "None"], ["[-3, 0, 2, 5], 2", "(0, 3)"]] }
  },
  problems: [
    { id: "matching-weights", title: "Matching Weights", d: "Easy", lc: "two-sum-ii-input-array-is-sorted",
      statement: "A warehouse lists package weights in **non-decreasing order**. Find two different packages whose weights add up exactly to `cap`. Return their indices `[i, j]` with `i < j`, or `[-1, -1]` if no such pair exists. At most one valid pair exists.",
      examples: [["[1, 2, 4, 7, 11], 15", "[2, 4]", "4 + 11 = 15"], ["[2, 3], 5", "[0, 1]", ""], ["[1, 2, 3], 100", "[-1, -1]", "No pair adds up to 100."]],
      constraints: ["2 ≤ len(weights) ≤ 10⁵", "−10⁹ ≤ weights[i] ≤ 10⁹", "weights is sorted"],
      hints: ["The list is sorted. What does that tell you when a sum is too small?", "Put one pointer at each end.", "Too small: move the left pointer right. Too big: move the right pointer left."],
      solution: `def matching_weights(weights, cap):
    l, r = 0, len(weights) - 1
    while l < r:
        s = weights[l] + weights[r]
        if s == cap:
            return [l, r]
        if s < cap:
            l += 1
        else:
            r -= 1
    return [-1, -1]`,
      why: "Because the list is sorted, a sum that's too small can only grow by moving the left pointer, and one that's too big can only shrink by moving the right pointer. Each step discards a whole row of pairs.", time: "O(n)",
      hidden: [["[-5, -1, 0, 3, 9], -6", "[0, 1]"], ["[1, 1], 2", "[0, 1]"], ["list(range(0, 200000, 2)), 399994", "[99998, 99999]"], ["[1, 2], 4", "[-1, -1]"]] },
    { id: "mirror-code", title: "Mirror Code", d: "Easy", lc: "valid-palindrome",
      statement: "A door code is a *mirror code* if, after removing every character that is not a letter or digit and ignoring upper/lower case, it reads the same forwards and backwards. Return `True` if `code` is a mirror code.",
      examples: [["'Ab1-1bA'", "True", "Cleaned: ab11ba"], ["'No x in Nixon'", "True", ""], ["'ab2a'", "False", ""]],
      constraints: ["0 ≤ len(code) ≤ 2·10⁵", "Printable ASCII characters"],
      hints: ["Compare characters from the two ends.", "Skip characters that aren't alphanumeric with inner while loops.", "Compare with `.lower()` and move both pointers inward."],
      solution: `def is_mirror(code):
    l, r = 0, len(code) - 1
    while l < r:
        while l < r and not code[l].isalnum():
            l += 1
        while l < r and not code[r].isalnum():
            r -= 1
        if code[l].lower() != code[r].lower():
            return False
        l, r = l + 1, r - 1
    return True`,
      why: "Opposite-end pointers compare the outermost meaningful characters and work inward. No cleaned copy of the string is needed.", time: "O(n)",
      hidden: [["''", "True"], ["'.,!'", "True"], ["'a' * 100000 + 'b' + 'a' * 100000", "True"], ["'0P'", "False"]] },
    { id: "compact-log", title: "Compact the Log", d: "Easy", lc: "remove-duplicates-from-sorted-array",
      statement: "`ids` is a sorted list of event IDs with repeats. Remove the repeats **in place** so each ID appears once, keeping order. Return `k`, the number of unique IDs; the first `k` slots of `ids` must hold them. (The checker looks at `k` and `ids[:k]`.)",
      examples: [["[1, 1, 2, 3, 3, 3, 4]", "(4, [1, 2, 3, 4])", ""], ["[5]", "(1, [5])", ""]],
      constraints: ["1 ≤ len(ids) ≤ 10⁵", "ids is sorted"],
      hints: ["Use one pointer to read and one to write.", "Only write a value when it differs from the previous one you read."],
      solution: `def compact(ids):
    w = 0
    for r in range(len(ids)):
        if r == 0 or ids[r] != ids[r - 1]:
            ids[w] = ids[r]
            w += 1
    return w`,
      conv: "(r, args[0][:r])",
      why: "A read pointer scans everything; a write pointer marks where the next unique value goes. Both move forward only.", time: "O(n)",
      hidden: [["[2, 2, 2]", "(1, [2])"], ["[-3, -1, 0, 0, 7]", "(4, [-3, -1, 0, 7])"], ["sorted(list(range(50000)) * 2)", "(50000, list(range(50000)))"]] },
    { id: "sink-zeros", title: "Sink the Zeros", d: "Easy", lc: "move-zeroes",
      statement: "Move every `0` in `nums` to the end **in place**, keeping the relative order of the non-zero values. Return nothing; the checker reads `nums`.",
      examples: [["[0, 1, 0, 3, 12]", "[1, 3, 12, 0, 0]", ""], ["[0]", "[0]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵"],
      hints: ["Keep a write pointer for the next non-zero.", "Swap each non-zero into the write slot."],
      solution: `def sink_zeros(nums):
    w = 0
    for r in range(len(nums)):
        if nums[r] != 0:
            nums[w], nums[r] = nums[r], nums[w]
            w += 1`,
      conv: "args[0]",
      why: "Swapping each non-zero into the write slot keeps their order and pushes zeros back in one pass.", time: "O(n)",
      hidden: [["[1, 2, 3]", "[1, 2, 3]"], ["[0, 0, 1]", "[1, 0, 0]"], ["[0, 5] * 50000", "[5] * 50000 + [0] * 50000"]] },
    { id: "squared-readings", title: "Squared Readings", d: "Easy", lc: "squares-of-a-sorted-array",
      statement: "Sensor readings are sorted in non-decreasing order and may be negative. Return the squares of all readings, also sorted in non-decreasing order, in O(n).",
      examples: [["[-4, -1, 0, 3, 10]", "[0, 1, 9, 16, 100]", ""], ["[-7, -3, 2, 3, 11]", "[4, 9, 9, 49, 121]", ""]],
      constraints: ["1 ≤ len(nums) ≤ 10⁵", "−10⁴ ≤ nums[i] ≤ 10⁴"],
      hints: ["The biggest square is at one of the two ends.", "Fill the answer from the back, taking the bigger end each time."],
      solution: `def sorted_squares(nums):
    n = len(nums)
    out = [0] * n
    l, r = 0, n - 1
    for w in range(n - 1, -1, -1):
        if abs(nums[l]) > abs(nums[r]):
            out[w] = nums[l] * nums[l]; l += 1
        else:
            out[w] = nums[r] * nums[r]; r -= 1
    return out`,
      why: "Squares are largest at the extremes of a sorted list, so compare the two ends and fill the output from largest to smallest.", time: "O(n)",
      hidden: [["[0]", "[0]"], ["[-5, -3, -2]", "[4, 9, 25]"], ["list(range(-50000, 50000))", "sorted(x * x for x in range(-50000, 50000))"]] },
    { id: "zero-triplets", title: "Zero Triplets", d: "Medium", lc: "3sum",
      statement: "Return every **unique** triplet `[a, b, c]` from `nums` (using three different positions) with `a + b + c == 0`. Each triplet should be in ascending order. The checker sorts your list of triplets, so their order doesn't matter.",
      examples: [["[-1, 0, 1, 2, -1, -4]", "[[-1, -1, 2], [-1, 0, 1]]", ""], ["[0, 0, 0, 0]", "[[0, 0, 0]]", ""], ["[1, 2, 3]", "[]", ""]],
      constraints: ["3 ≤ len(nums) ≤ 3000", "−10⁵ ≤ nums[i] ≤ 10⁵"],
      hints: ["Sort first.", "Fix the first number, then find pairs in the rest with two pointers.", "Skip equal neighbours to avoid repeated triplets."],
      solution: `def zero_triplets(nums):
    nums = sorted(nums)
    res = []
    for i in range(len(nums) - 2):
        if i and nums[i] == nums[i - 1]:
            continue
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
    return res`,
      conv: "sorted(r)",
      why: "Sorting lets each fixed first element use an O(n) two-pointer scan, O(n²) overall, and makes duplicates adjacent so they're easy to skip.", time: "O(n²)",
      hidden: [["[-2, 0, 1, 1, 2]", "[[-2, 0, 2], [-2, 1, 1]]"], ["[0, 0, 0]", "[[0, 0, 0]]"], ["list(range(1, 2001)) + [-3]", "[[-3, 1, 2]]"]] },
    { id: "widest-tank", title: "Widest Tank", d: "Medium", lc: "container-with-most-water",
      statement: "Walls of heights `h[i]` stand at positions `0..n-1`. Choose two walls; together with the floor they form a tank holding `(j - i) * min(h[i], h[j])` units of water. Return the most water any tank can hold.",
      examples: [["[1, 8, 6, 2, 5, 4, 8, 3, 7]", "49", "Walls at 1 and 8: 7 × 7."], ["[1, 1]", "1", ""]],
      constraints: ["2 ≤ len(h) ≤ 10⁵", "0 ≤ h[i] ≤ 10⁴"],
      hints: ["Start with the widest tank.", "The shorter wall limits the height. Can moving the taller wall ever help?", "Always move the shorter wall inward."],
      solution: `def widest_tank(h):
    l, r, best = 0, len(h) - 1, 0
    while l < r:
        best = max(best, (r - l) * min(h[l], h[r]))
        if h[l] < h[r]:
            l += 1
        else:
            r -= 1
    return best`,
      why: "Moving the taller wall shrinks the width without raising the cap, so only moving the shorter wall can find a better tank.", time: "O(n)",
      hidden: [["[4, 3, 2, 1, 4]", "16"], ["[1, 2, 1]", "2"], ["list(range(1, 100001))", "2500000000"]] },
    { id: "flag-sort", title: "Three-Colour Sort", d: "Medium", lc: "sort-colors",
      statement: "`a` contains only the values 0, 1 and 2. Sort it **in place** in a single pass, without counting and without `sort()`. Return nothing; the checker reads `a`.",
      examples: [["[2, 0, 2, 1, 1, 0]", "[0, 0, 1, 1, 2, 2]", ""], ["[2, 0, 1]", "[0, 1, 2]", ""]],
      constraints: ["1 ≤ len(a) ≤ 10⁵"],
      hints: ["Keep three regions: 0s at the front, 2s at the back, unknown in the middle.", "Use pointers lo, i, hi.", "After swapping with hi, don't move i: the new value is unchecked."],
      solution: `def flag_sort(a):
    lo, i, hi = 0, 0, len(a) - 1
    while i <= hi:
        if a[i] == 0:
            a[lo], a[i] = a[i], a[lo]
            lo += 1; i += 1
        elif a[i] == 2:
            a[hi], a[i] = a[i], a[hi]
            hi -= 1
        else:
            i += 1`,
      conv: "args[0]",
      why: "Every value is either swapped into its final region or skipped, so one pass sorts it (Dijkstra's Dutch national flag).", time: "O(n)",
      hidden: [["[1]", "[1]"], ["[2, 2, 0, 0]", "[0, 0, 2, 2]"], ["[2, 1, 0] * 30000", "[0] * 30000 + [1] * 30000 + [2] * 30000"]] },
    { id: "rescue-rafts", title: "Rescue Rafts", d: "Medium", lc: "boats-to-save-people",
      statement: "Each raft carries **at most two** people with total weight at most `limit`. Given everyone's weight (each ≤ limit), return the minimum number of rafts needed.",
      examples: [["[3, 2, 2, 1], 3", "3", "(1, 2), (2), (3)"], ["[3, 5, 3, 4], 5", "4", ""]],
      constraints: ["1 ≤ len(people) ≤ 5·10⁴", "1 ≤ people[i] ≤ limit ≤ 3·10⁴"],
      hints: ["Sort the weights.", "The heaviest person always takes a raft. Who can share it?", "Pair the heaviest with the lightest if they fit; otherwise the heaviest goes alone."],
      solution: `def rafts(people, limit):
    people = sorted(people)
    l, r, count = 0, len(people) - 1, 0
    while l <= r:
        if people[l] + people[r] <= limit:
            l += 1
        r -= 1
        count += 1
    return count`,
      why: "If the lightest person can't share with the heaviest, nobody can, so the heaviest goes alone. Otherwise pairing them is never worse.", time: "O(n log n)",
      hidden: [["[1, 2], 3", "1"], ["[5, 1, 4, 2], 6", "2"], ["[1] * 50000, 2", "25000"]] },
    { id: "rain-catcher", title: "Rain Catcher", d: "Hard", lc: "trapping-rain-water",
      statement: "Bars of width 1 have heights `h`. After rain, water settles in the dips between bars. Return the total units of water trapped.",
      examples: [["[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]", "6", ""], ["[4, 2, 0, 3, 2, 5]", "9", ""]],
      constraints: ["1 ≤ len(h) ≤ 2·10⁴", "0 ≤ h[i] ≤ 10⁵"],
      hints: ["Water above bar i is min(highest to the left, highest to the right) − h[i].", "You don't need both maxima: whichever side's running max is smaller decides.", "Two pointers with left_max and right_max; move the side with the smaller bar."],
      solution: `def rain(h):
    l, r = 0, len(h) - 1
    left_max = right_max = water = 0
    while l < r:
        if h[l] < h[r]:
            left_max = max(left_max, h[l])
            water += left_max - h[l]
            l += 1
        else:
            right_max = max(right_max, h[r])
            water += right_max - h[r]
            r -= 1
    return water`,
      why: "When h[l] < h[r], the right side is guaranteed to have a wall at least as tall, so the water at l depends only on left_max.", time: "O(n)",
      hidden: [["[5]", "0"], ["[3, 0, 3]", "3"], ["[10000] + [0] * 19998 + [10000]", "199980000"]] }
  ]
});
