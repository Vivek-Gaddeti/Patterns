PAT("fast-slow", {
  time: "O(n)", space: "O(1)",
  lede: "Two pointers move through a sequence at different speeds. If there's a cycle the fast one laps the slow one; if there isn't, the fast one reaches the end when the slow one is exactly halfway.",
  idea: "Detecting a cycle with a visited-set costs O(n) memory. Instead move `slow` one step and `fast` two steps. In a cycle the gap shrinks by one each step, so they **must meet**. Once they meet, restart one pointer from the head and move both one step at a time: they meet again at the cycle's entrance (Floyd). With no cycle, `slow` lands on the middle.",
  analogy: "Two runners on a track, one twice as fast. On a circular track the fast one eventually laps the slow one; on a straight road the fast one reaches the finish while the slow one is halfway.",
  flavours: [["Goal", "Move", "Result"], [
    ["**Cycle?**", "slow 1, fast 2", "they meet ⇔ cycle"],
    ["**Cycle start**", "after meeting, one pointer back to head, both step 1", "meet at the entrance"],
    ["**Middle**", "slow 1, fast 2 until fast ends", "slow is at the middle"],
    ["**Kth from end**", "fast goes k ahead, then both step 1", "slow stops k from the end"]]],
  signals: [["Linked list + “cycle”, “loop”", "detect or find the start"], ["“Middle of the list”, “split in half”", "palindrome check, reorder"], ["“Kth / nth from the end”", "gap of k between pointers"], ["A number sequence that may repeat", "happy number, function iteration"]],
  not: "**Not this pattern** when you're reversing or rewiring nodes (→ in-place reversal), or the sequence is an array you can index (→ two pointers).",
  templates: [
    ["Cycle + start", "floyd.py", `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                   # they met inside the cycle
            slow = head
            while slow is not fast:        # step together to the entrance
                slow, fast = slow.next, fast.next
            return slow
    return None

a, b, c, d = Node(3), Node(2), Node(0), Node(-4)
a.next, b.next, c.next, d.next = b, c, d, b   # -4 points back to 2
print(cycle_start(a).val, cycle_start(Node(1)))`, "2 None"],
    ["Middle", "middle.py", `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow                            # second middle for even lengths

head = None
for v in [5, 4, 3, 2, 1]:
    head = Node(v, head)
print(middle(head).val)`, "3"]
  ],
  examples: [
    { t: "Linked List Cycle II", d: "Medium", lc: "linked-list-cycle-ii", f: "Cycle start",
      q: "Return the node where the cycle begins, or None.",
      idea: "Meet with slow/fast, then move one pointer to head and step both: they meet at the entrance.",
      code: `class N:
    def __init__(s, v): s.val, s.next = v, None

def detect(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow
    return None

nodes = [N(v) for v in [3, 2, 0, -4]]
for a, b in zip(nodes, nodes[1:]): a.next = b
nodes[-1].next = nodes[1]                 # cycle back to the node with value 2
print(detect(nodes[0]).val)`, out: "2", cx: "O(n) · O(1)" },
    { t: "Happy Number", d: "Easy", lc: "happy-number", f: "Cycle on numbers",
      q: "Repeatedly replace n by the sum of squares of its digits. Does it reach 1?",
      idea: "The sequence either hits 1 or loops. Run slow/fast on the sequence.",
      code: `def is_happy(n):
    nxt = lambda x: sum(int(d) ** 2 for d in str(x))
    slow, fast = n, nxt(n)
    while fast != 1 and slow != fast:
        slow, fast = nxt(slow), nxt(nxt(fast))
    return fast == 1

print(is_happy(19), is_happy(2))`, out: "True False", cx: "O(log n) per step" },
    { t: "Palindrome Linked List", d: "Easy", lc: "palindrome-linked-list", f: "Middle + reverse",
      q: "Is the linked list a palindrome, in O(1) extra space?",
      idea: "Find the middle, reverse the second half, compare the halves node by node.",
      code: `class N:
    def __init__(s, v, n=None): s.val, s.next = v, n

def is_pal(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:
        slow.next, prev, slow = prev, slow, slow.next
    while prev:
        if prev.val != head.val: return False
        prev, head = prev.next, head.next
    return True

print(is_pal(N(1, N(2, N(2, N(1))))), is_pal(N(1, N(2))))`, out: "True False", cx: "O(n) · O(1)" }
  ],
  pitfalls: [
    ["Checking `fast.next.next` without checking `fast.next`", "Loop condition must be `while fast and fast.next`."],
    ["Comparing values instead of nodes", "Use `is` to compare nodes; values can repeat."],
    ["Off-by-one middle", "This loop returns the **second** middle for even lengths; start fast at head.next for the first middle."],
    ["Forgetting the gap for “kth from end”", "Move fast k steps first; a dummy head handles removing the first node."]
  ],
  edge: ["Empty list", "One node", "Cycle through the head itself", "Two nodes", "Even vs odd length"],
  compare: [
    ["In-place Reversal", "ll-reversal", "Palindrome and reorder problems combine the middle-finding trick with reversing half the list."],
    ["Hashing", "hashing", "A visited set detects cycles too, with O(n) memory instead of O(1)."],
    ["Cyclic Sort", "cyclic-sort", "“Find the duplicate” in 1..n treats values as next-pointers and runs Floyd on the array."]
  ],
  mcq: [
    ["Why must slow and fast meet if there is a cycle?", ["They start together", "Inside the cycle the gap shrinks by one each step", "fast is lucky", "They don't always meet"], 1, "Relative speed 1 means the fast pointer closes the distance one node per step."],
    ["After they meet, how do you find the cycle's start?", ["Return the meeting node", "Move one pointer to head and step both one at a time", "Count the cycle length only", "Reverse the list"], 1, "Floyd's lemma: distance head→entrance equals meeting point→entrance (mod cycle length)."]
  ],
  summary: {
    oneLine: "slow +1, fast +2: they meet iff there's a cycle; with no cycle, slow ends at the middle.",
    signals: ["Cycle in a linked list / sequence", "Middle of a list", "Kth from the end", "Happy number style repeats"],
    template: `slow = fast = head
while fast and fast.next:
    slow, fast = slow.next, fast.next.next
    if slow is fast:
        return True     # cycle
return False            # slow is the middle`,
    pitfalls: ["`while fast and fast.next`", "Compare nodes with `is`", "Which middle for even lengths?"],
    cx: "O(n) time · O(1) space",
    drill: { task: "Return the middle node of the list (the second middle if the length is even). The checker reads the list from your returned node.",
      ref: `def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow`,
      conv: "to_list(r)",
      tests: [["build_list([1, 2, 3, 4, 5])", "[3, 4, 5]"], ["build_list([1, 2, 3, 4, 5, 6])", "[4, 5, 6]"], ["build_list([1])", "[1]"]] }
  },
  problems: [
    { id: "loop-alarm", title: "Loop Alarm", d: "Easy", lc: "linked-list-cycle",
      statement: "Return `True` if the linked list starting at `head` contains a cycle. Try O(1) extra memory. (In the examples, `build_list(values, pos)` links the last node back to index `pos`; `pos = -1` means no cycle.)",
      examples: [["build_list([3, 2, 0, -4], 1)", "True", "−4 links back to 2."], ["build_list([1, 2], 0)", "True", ""], ["build_list([1], -1)", "False", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["Move one pointer 1 step and another 2 steps.", "If they ever point to the same node, there's a cycle.", "If fast reaches None, there isn't."],
      solution: `def loop_alarm(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True
    return False`,
      why: "Inside a cycle the faster pointer gains one node per step, so it must catch the slower one.", time: "O(n)",
      hidden: [["build_list([], -1)", "False"], ["build_list([1], 0)", "True"], ["build_list(list(range(100000)), 50000)", "True"], ["build_list(list(range(100000)), -1)", "False"]] },
    { id: "middle-car", title: "Middle Car", d: "Easy", lc: "middle-of-the-linked-list",
      statement: "A train is a linked list of cars. Return the **middle** car; if there are two middles, return the second. (The checker reads the train from your returned node to the end.)",
      examples: [["build_list([1, 2, 3, 4, 5])", "[3, 4, 5]", ""], ["build_list([1, 2, 3, 4, 5, 6])", "[4, 5, 6]", ""]],
      constraints: ["1 ≤ number of nodes ≤ 10⁵"],
      hints: ["Fast moves two steps for every one step of slow.", "When fast can't move two more steps, slow is in the middle."],
      solution: `def middle_car(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow`,
      conv: "to_list(r)",
      why: "slow travels half as far as fast, so it stops at the midpoint in one pass.", time: "O(n)",
      hidden: [["build_list([7])", "[7]"], ["build_list([1, 2])", "[2]"], ["build_list(list(range(100000)))", "list(range(50000, 100000))"]] },
    { id: "joyful-number", title: "Joyful Number", d: "Easy", lc: "happy-number",
      statement: "Start with `n`. Repeatedly replace it by the sum of the squares of its digits. Return `True` if this eventually reaches 1, or `False` if it loops forever without reaching 1.",
      examples: [["19", "True", "1²+9²=82 → 68 → 100 → 1"], ["2", "False", ""]],
      constraints: ["1 ≤ n ≤ 2³¹ − 1"],
      hints: ["The sequence either reaches 1 or repeats a value.", "Detect the repeat with a set, or with slow/fast pointers on the sequence."],
      solution: `def joyful(n):
    def nxt(x):
        s = 0
        while x:
            x, d = divmod(x, 10)
            s += d * d
        return s
    slow, fast = n, nxt(n)
    while fast != 1 and slow != fast:
        slow = nxt(slow)
        fast = nxt(nxt(fast))
    return fast == 1`,
      why: "The sequence is a linked list of numbers; Floyd detects whether it ends at 1 or cycles.", time: "O(log n) per step",
      hidden: [["1", "True"], ["7", "True"], ["4", "False"], ["2147483647", "False"]] },
    { id: "mirror-train", title: "Mirror Train", d: "Easy", lc: "palindrome-linked-list",
      statement: "Return `True` if the values of the linked list read the same forwards and backwards. Aim for O(1) extra space (you may modify the list).",
      examples: [["build_list([1, 2, 2, 1])", "True", ""], ["build_list([1, 2])", "False", ""], ["build_list([1, 0, 1])", "True", ""]],
      constraints: ["1 ≤ number of nodes ≤ 10⁵"],
      hints: ["Find the middle with slow/fast.", "Reverse the second half.", "Walk both halves together comparing values."],
      solution: `def mirror_train(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    prev = None
    while slow:
        nxt = slow.next
        slow.next = prev
        prev = slow
        slow = nxt
    a, b = head, prev
    while b:
        if a.val != b.val:
            return False
        a, b = a.next, b.next
    return True`,
      why: "The reversed second half lets you compare from both ends using only pointers.", time: "O(n)",
      hidden: [["build_list([5])", "True"], ["build_list([1, 2, 3, 2, 2])", "False"], ["build_list(list(range(50000)) + list(range(49999, -1, -1)))", "True"]] },
    { id: "drop-from-end", title: "Drop From the End", d: "Medium", lc: "remove-nth-node-from-end-of-list",
      statement: "Remove the `n`-th node from the **end** of the list and return the head of the resulting list, in one pass.",
      examples: [["build_list([1, 2, 3, 4, 5]), 2", "[1, 2, 3, 5]", ""], ["build_list([1]), 1", "[]", ""], ["build_list([1, 2]), 1", "[1]", ""]],
      constraints: ["1 ≤ n ≤ number of nodes ≤ 10⁵"],
      hints: ["Put a dummy node before head so removing the first node isn't special.", "Move fast n steps ahead, then move both until fast reaches the last node.", "slow.next is the node to remove."],
      solution: `def drop_from_end(head, n):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next
    return dummy.next`,
      conv: "to_list(r)",
      why: "A fixed gap of n nodes means slow stops just before the target when fast hits the end.", time: "O(n)",
      hidden: [["build_list([1, 2]), 2", "[2]"], ["build_list([1, 2, 3]), 3", "[2, 3]"], ["build_list(list(range(100000))), 100000", "list(range(1, 100000))"]] },
    { id: "loop-entrance", title: "Loop Entrance", d: "Medium", lc: "linked-list-cycle-ii",
      statement: "If the list has a cycle, return the node where the cycle begins; otherwise return `None`. Use O(1) extra memory. (Node values are distinct; the checker reads the value of the node you return.)",
      examples: [["build_list([3, 2, 0, -4], 1)", "2", ""], ["build_list([1, 2], 0)", "1", ""], ["build_list([1], -1)", "None", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["First find a meeting point with slow/fast.", "Then move one pointer back to head.", "Step both one at a time: they meet at the entrance."],
      solution: `def loop_entrance(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            slow = head
            while slow is not fast:
                slow = slow.next
                fast = fast.next
            return slow
    return None`,
      conv: "r.val if r else None",
      why: "From the meeting point, the distance to the entrance equals the distance from head to the entrance (mod the cycle length).", time: "O(n)",
      hidden: [["build_list([1], 0)", "1"], ["build_list([1, 2, 3, 4], 3)", "4"], ["build_list(list(range(100000)), 12345)", "12345"], ["build_list(list(range(10)), -1)", "None"]] },
    { id: "zip-train", title: "Zip the Train", d: "Medium", lc: "reorder-list",
      statement: "Reorder the list `L0 → L1 → … → Ln` **in place** to `L0 → Ln → L1 → Ln−1 → L2 → …`. Return nothing; the checker reads the list from `head`.",
      examples: [["build_list([1, 2, 3, 4])", "[1, 4, 2, 3]", ""], ["build_list([1, 2, 3, 4, 5])", "[1, 5, 2, 4, 3]", ""]],
      constraints: ["1 ≤ number of nodes ≤ 5·10⁴"],
      hints: ["Find the middle; cut the list there.", "Reverse the second half.", "Merge the two halves by alternating nodes."],
      solution: `def zip_train(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    second = slow.next
    slow.next = None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    first, second = head, prev
    while second:
        a, b = first.next, second.next
        first.next = second
        second.next = a
        first, second = a, b`,
      conv: "to_list(args[0])",
      why: "Middle + reverse + merge rewires every pointer once, with no extra list.", time: "O(n)",
      hidden: [["build_list([1])", "[1]"], ["build_list([1, 2])", "[1, 2]"], ["build_list(list(range(50000)))", "[x for i in range(25000) for x in (i, 49999 - i)]"]] }
  ]
});
