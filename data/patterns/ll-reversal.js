PAT("ll-reversal", {
  time: "O(n)", space: "O(1)",
  lede: "Rewire `next` pointers one node at a time with three variables (prev, cur, next). A dummy node in front of the head removes every special case for the first node.",
  idea: "Reversing a list needs no extra memory: walk it once and point each node back at the previous one. The danger is losing the rest of the list, so **save `cur.next` first**. Most list problems (reverse a section, swap pairs, rotate, merge, delete) are this move plus a **dummy head** so the real head can change without special cases.",
  analogy: "Turning around a line of people holding hands: each person lets go of the one in front and grabs the one behind. You just have to remember who was in front before letting go.",
  flavours: [["Move", "Code", "Used in"], [
    ["**Reverse one link**", "`nxt = cur.next; cur.next = prev; prev = cur; cur = nxt`", "reverse list / section / k-group"],
    ["**Dummy head**", "`dummy = ListNode(0, head)` … `return dummy.next`", "deleting, merging, anything that may change the head"],
    ["**Tail pointer**", "`tail.next = node; tail = node`", "merging, building, partitioning"],
    ["**Cut and reconnect**", "find the node before a section, reverse, reattach", "reverse between, rotate"]]],
  signals: [["“Reverse” a linked list or part of it", "in place"], ["Swap / rotate / reorder nodes", "pointer rewiring"], ["Merge or partition lists", "tail pointer + dummy"], ["“Remove nodes with …”", "dummy head makes removing the first node normal"]],
  not: "**Not this pattern** when you need to detect cycles or find the middle (→ fast & slow pointers), or merge **k** lists efficiently (→ k-way merge with a heap).",
  templates: [
    ["Reverse", "reverse.py", `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next                     # save the rest of the list
        cur.next = prev                    # flip this link
        prev, cur = cur, nxt               # step forward
    return prev                            # new head

def show(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out

print(show(reverse(Node(1, Node(2, Node(3, Node(4)))))))`, "[4, 3, 2, 1]"],
    ["Dummy head", "dummy.py", `class Node:
    def __init__(self, val, nxt=None):
        self.val, self.next = val, nxt

def remove_all(head, val):
    dummy = Node(0, head)                  # the head can be removed like any node
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next

def show(h):
    out = []
    while h: out.append(h.val); h = h.next
    return out

print(show(remove_all(Node(6, Node(1, Node(6, Node(2)))), 6)))`, "[1, 2]"]
  ],
  examples: [
    { t: "Reverse Linked List II", d: "Medium", lc: "reverse-linked-list-ii", f: "Cut and reconnect",
      q: "Reverse the nodes from position left to right (1-indexed).",
      idea: "Walk to the node before `left`, then repeatedly move the next node to the front of the section.",
      code: `class N:
    def __init__(s, v, n=None): s.val, s.next = v, n

def reverse_between(head, left, right):
    dummy = N(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    cur = before.next
    for _ in range(right - left):
        move = cur.next
        cur.next = move.next
        move.next = before.next
        before.next = move
    return dummy.next

h = reverse_between(N(1, N(2, N(3, N(4, N(5))))), 2, 4)
out = []
while h: out.append(h.val); h = h.next
print(out)`, out: "[1, 4, 3, 2, 5]", cx: "O(n) · O(1)" },
    { t: "Merge Two Sorted Lists", d: "Easy", lc: "merge-two-sorted-lists", f: "Tail pointer",
      q: "Merge two sorted linked lists into one sorted list.",
      idea: "Dummy + tail: attach the smaller head each time, then the leftover list.",
      code: `class N:
    def __init__(s, v, n=None): s.val, s.next = v, n

def merge(a, b):
    tail = dummy = N(0)
    while a and b:
        if a.val <= b.val: tail.next, a = a, a.next
        else: tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next

h = merge(N(1, N(2, N(4))), N(1, N(3, N(4))))
out = []
while h: out.append(h.val); h = h.next
print(out)`, out: "[1, 1, 2, 3, 4, 4]", cx: "O(m + n)" },
    { t: "Reverse Nodes in k-Group", d: "Hard", lc: "reverse-nodes-in-k-group", f: "Reverse sections",
      q: "Reverse every block of k nodes; a final short block stays as is.",
      idea: "Check that k nodes remain, reverse them, reconnect to the previous block's tail, repeat.",
      code: `class N:
    def __init__(s, v, n=None): s.val, s.next = v, n

def reverse_k(head, k):
    dummy = N(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth: return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            cur.next, prev, cur = prev, cur, cur.next
        first = group_prev.next
        group_prev.next = kth
        group_prev = first

h = reverse_k(N(1, N(2, N(3, N(4, N(5))))), 2)
out = []
while h: out.append(h.val); h = h.next
print(out)`, out: "[2, 1, 4, 3, 5]", cx: "O(n) · O(1)" }
  ],
  pitfalls: [
    ["Losing the rest of the list", "Save `cur.next` before you overwrite it."],
    ["Special-casing the head", "A dummy node in front makes the head an ordinary node."],
    ["Forgetting to reconnect", "After reversing a section, link the node before it to the new section head, and the old section head to what follows."],
    ["Off-by-one positions", "Positions in these problems are usually 1-indexed."]
  ],
  edge: ["Empty list", "One node", "Section covers the whole list", "k = 1 or k = length", "Removing every node"],
  compare: [
    ["Fast & Slow Pointers", "fast-slow", "Find the middle with fast/slow, then reverse half: palindrome and reorder problems use both."],
    ["K-way Merge", "k-way-merge", "Merging two lists is a tail-pointer walk; merging k lists adds a heap."],
    ["Two Pointers", "two-pointers", "Arrays let you index from both ends; lists only let you walk forward, so you reverse or use fast/slow instead."]
  ],
  mcq: [
    ["Inside the reversal loop, which line must come first?", ["cur.next = prev", "nxt = cur.next", "prev = cur", "cur = nxt"], 1, "Save the next node before flipping the pointer, or you lose the rest of the list."],
    ["Why use a dummy head when deleting nodes?", ["It's faster", "The real head can be deleted like any other node, without special cases", "Python requires it", "To find the middle"], 1, "Return dummy.next at the end, whatever happened to the original head."]
  ],
  summary: {
    oneLine: "Save next, flip the link, step forward; a dummy head removes head special cases.",
    signals: ["Reverse all / part of a list", "Swap, rotate, reorder nodes", "Merge / partition lists", "Remove nodes"],
    template: `prev, cur = None, head
while cur:
    nxt = cur.next
    cur.next = prev
    prev, cur = cur, nxt
return prev`,
    pitfalls: ["Save cur.next first", "Dummy head for deletions", "Reconnect both ends of a section"],
    cx: "O(n) time · O(1) space",
    drill: { task: "Reverse the linked list in place and return the new head.",
      ref: `def reverse(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
      conv: "to_list(r)",
      tests: [["build_list([1, 2, 3, 4, 5])", "[5, 4, 3, 2, 1]"], ["build_list([1])", "[1]"], ["build_list([])", "[]"]] }
  },
  problems: [
    { id: "turn-train", title: "Turn the Train Around", d: "Easy", lc: "reverse-linked-list",
      statement: "Reverse the linked list and return its new head.",
      examples: [["build_list([1, 2, 3, 4, 5])", "[5, 4, 3, 2, 1]", ""], ["build_list([1, 2])", "[2, 1]", ""], ["build_list([])", "[]", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["Keep prev (starts as None) and cur.", "Save cur.next, point cur.next at prev, then advance both."],
      solution: `def turn_train(head):
    prev, cur = None, head
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return prev`,
      conv: "to_list(r)",
      why: "Each link is flipped exactly once while walking the list.", time: "O(n)",
      hidden: [["build_list([7])", "[7]"], ["build_list([1, 1, 2])", "[2, 1, 1]"], ["build_list(list(range(100000)))", "list(range(99999, -1, -1))"]] },
    { id: "join-sorted", title: "Join Two Sorted Trains", d: "Easy", lc: "merge-two-sorted-lists",
      statement: "Merge two sorted linked lists into one sorted list by splicing their nodes together. Return the head.",
      examples: [["build_list([1, 2, 4]), build_list([1, 3, 4])", "[1, 1, 2, 3, 4, 4]", ""], ["build_list([]), build_list([0])", "[0]", ""]],
      constraints: ["0 ≤ nodes in each list ≤ 5·10⁴"],
      hints: ["Use a dummy node and a tail pointer.", "Attach the smaller head each time; attach the leftover list at the end."],
      solution: `def join_sorted(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b
    return dummy.next`,
      conv: "to_list(r)",
      why: "Like merging two sorted arrays, but by relinking nodes: no new nodes are created.", time: "O(m + n)",
      hidden: [["build_list([]), build_list([])", "[]"], ["build_list([5]), build_list([1, 2, 3])", "[1, 2, 3, 5]"], ["build_list(list(range(0, 100000, 2))), build_list(list(range(1, 100000, 2)))", "list(range(100000))"]] },
    { id: "drop-value", title: "Drop a Value", d: "Easy", lc: "remove-linked-list-elements",
      statement: "Remove every node whose value equals `val` and return the new head.",
      examples: [["build_list([1, 2, 6, 3, 4, 5, 6]), 6", "[1, 2, 3, 4, 5]", ""], ["build_list([7, 7, 7, 7]), 7", "[]", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["The head itself might need removing: use a dummy node.", "Only advance cur when you didn't delete cur.next."],
      solution: `def drop_value(head, val):
    dummy = ListNode(0, head)
    cur = dummy
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return dummy.next`,
      conv: "to_list(r)",
      why: "The dummy makes deleting the head identical to deleting any other node.", time: "O(n)",
      hidden: [["build_list([]), 1", "[]"], ["build_list([1, 2]), 1", "[2]"], ["build_list([1, 2] * 50000), 1", "[2] * 50000"]] },
    { id: "flip-section", title: "Flip a Section", d: "Medium", lc: "reverse-linked-list-ii",
      statement: "Reverse the nodes from position `left` to position `right` (1-indexed, inclusive) in one pass. Return the head.",
      examples: [["build_list([1, 2, 3, 4, 5]), 2, 4", "[1, 4, 3, 2, 5]", ""], ["build_list([5]), 1, 1", "[5]", ""]],
      constraints: ["1 ≤ left ≤ right ≤ number of nodes ≤ 10⁵"],
      hints: ["Use a dummy so left = 1 isn't special.", "Walk to the node just before the section.", "Repeatedly move the node after the section's first node to the front of the section."],
      solution: `def flip_section(head, left, right):
    dummy = ListNode(0, head)
    before = dummy
    for _ in range(left - 1):
        before = before.next
    cur = before.next
    for _ in range(right - left):
        move = cur.next
        cur.next = move.next
        move.next = before.next
        before.next = move
    return dummy.next`,
      conv: "to_list(r)",
      why: "Head-insertion reverses the section in place while keeping it attached on both sides.", time: "O(n)",
      hidden: [["build_list([3, 5]), 1, 2", "[5, 3]"], ["build_list([1, 2, 3]), 1, 3", "[3, 2, 1]"], ["build_list(list(range(100000))), 2, 99999", "[0] + list(range(99998, 0, -1)) + [99999]"]] },
    { id: "swap-neighbours", title: "Swap Neighbours", d: "Medium", lc: "swap-nodes-in-pairs",
      statement: "Swap every two adjacent nodes (by relinking, not by changing values) and return the head.",
      examples: [["build_list([1, 2, 3, 4])", "[2, 1, 4, 3]", ""], ["build_list([1, 2, 3])", "[2, 1, 3]", ""], ["build_list([])", "[]", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["Dummy node; prev points to the node before the pair.", "Relink prev → second → first → rest, then move prev to first."],
      solution: `def swap_neighbours(head):
    dummy = ListNode(0, head)
    prev = dummy
    while prev.next and prev.next.next:
        a = prev.next
        b = a.next
        a.next = b.next
        b.next = a
        prev.next = b
        prev = a
    return dummy.next`,
      conv: "to_list(r)",
      why: "Three pointer updates per pair; the dummy handles the first pair like the rest.", time: "O(n)",
      hidden: [["build_list([1])", "[1]"], ["build_list([1, 2])", "[2, 1]"], ["build_list(list(range(100000)))", "[x for i in range(0, 100000, 2) for x in (i + 1, i)]"]] },
    { id: "rotate-train", title: "Rotate the Train", d: "Medium", lc: "rotate-list",
      statement: "Rotate the list to the right by `k` places (the last `k` nodes move to the front, in order). Return the head.",
      examples: [["build_list([1, 2, 3, 4, 5]), 2", "[4, 5, 1, 2, 3]", ""], ["build_list([0, 1, 2]), 4", "[2, 0, 1]", "k = 4 is the same as k = 1."]],
      constraints: ["0 ≤ number of nodes ≤ 500", "0 ≤ k ≤ 2·10⁹"],
      hints: ["Find the length and the tail.", "k %= length.", "Make it a ring (tail.next = head), then cut it at the right place."],
      solution: `def rotate_train(head, k):
    if not head:
        return None
    n, tail = 1, head
    while tail.next:
        tail = tail.next
        n += 1
    k %= n
    if k == 0:
        return head
    tail.next = head
    new_tail = head
    for _ in range(n - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return new_head`,
      conv: "to_list(r)",
      why: "Joining the ends turns rotation into choosing where to cut.", time: "O(n)",
      hidden: [["build_list([]), 3", "[]"], ["build_list([1, 2]), 2", "[1, 2]"], ["build_list(list(range(500))), 2000000001", "[499] + list(range(499))"]] },
    { id: "odds-then-evens", title: "Odds Then Evens", d: "Medium", lc: "odd-even-linked-list",
      statement: "Group the nodes at odd **positions** (1st, 3rd, …) first, followed by the nodes at even positions, keeping the original order within each group. O(1) extra space. Return the head.",
      examples: [["build_list([1, 2, 3, 4, 5])", "[1, 3, 5, 2, 4]", ""], ["build_list([2, 1, 3, 5, 6, 4, 7])", "[2, 3, 6, 7, 1, 5, 4]", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁴"],
      hints: ["Keep two chains: odd and even, with their tails.", "Alternate attaching nodes, then link the odd tail to the even head."],
      solution: `def odds_then_evens(head):
    if not head:
        return None
    odd, even = head, head.next
    even_head = even
    while even and even.next:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return head`,
      conv: "to_list(r)",
      why: "Splitting into two chains in one pass and joining them keeps both groups in order.", time: "O(n)",
      hidden: [["build_list([])", "[]"], ["build_list([1, 2])", "[1, 2]"], ["build_list(list(range(10000)))", "list(range(0, 10000, 2)) + list(range(1, 10000, 2))"]] },
    { id: "digit-trains", title: "Add Digit Trains", d: "Medium", lc: "add-two-numbers",
      statement: "Two non-negative integers are stored as linked lists of digits in **reverse** order (ones digit first). Return their sum in the same form.",
      examples: [["build_list([2, 4, 3]), build_list([5, 6, 4])", "[7, 0, 8]", "342 + 465 = 807"], ["build_list([9, 9, 9]), build_list([1])", "[0, 0, 0, 1]", ""]],
      constraints: ["1 ≤ nodes in each list ≤ 10⁴", "no leading zeros except the number 0"],
      hints: ["Digits are already aligned from the ones place.", "Add digit by digit with a carry, building a new list with a dummy head.", "Don't forget a final carry."],
      solution: `def digit_trains(a, b):
    dummy = tail = ListNode()
    carry = 0
    while a or b or carry:
        s = carry
        if a:
            s += a.val
            a = a.next
        if b:
            s += b.val
            b = b.next
        carry, d = divmod(s, 10)
        tail.next = ListNode(d)
        tail = tail.next
    return dummy.next`,
      conv: "to_list(r)",
      why: "Reverse order means you can add from the head with a carry, exactly like on paper.", time: "O(max(m, n))",
      hidden: [["build_list([0]), build_list([0])", "[0]"], ["build_list([5]), build_list([5])", "[0, 1]"], ["build_list([9] * 10000), build_list([1])", "[0] * 10000 + [1]"]] },
    { id: "drop-repeats", title: "Drop Every Repeat", d: "Medium", lc: "remove-duplicates-from-sorted-list-ii",
      statement: "The list is sorted. Delete **all** nodes whose value appears more than once, leaving only values that were unique. Return the head.",
      examples: [["build_list([1, 2, 3, 3, 4, 4, 5])", "[1, 2, 5]", ""], ["build_list([1, 1, 1, 2, 3])", "[2, 3]", ""]],
      constraints: ["0 ≤ number of nodes ≤ 10⁵"],
      hints: ["The head itself may be deleted: dummy node.", "When the next two nodes share a value, skip the whole run of that value."],
      solution: `def drop_repeats(head):
    dummy = ListNode(0, head)
    prev = dummy
    cur = head
    while cur:
        if cur.next and cur.next.val == cur.val:
            v = cur.val
            while cur and cur.val == v:
                cur = cur.next
            prev.next = cur
        else:
            prev = cur
            cur = cur.next
    return dummy.next`,
      conv: "to_list(r)",
      why: "Runs of equal values are adjacent in a sorted list, so each run is skipped in one sweep.", time: "O(n)",
      hidden: [["build_list([])", "[]"], ["build_list([1, 1])", "[]"], ["build_list(sorted(list(range(50000)) * 2) + [50000])", "[50000]"]] },
    { id: "flip-in-blocks", title: "Flip in Blocks of K", d: "Hard", lc: "reverse-nodes-in-k-group",
      statement: "Reverse the nodes of the list `k` at a time. If fewer than `k` nodes remain at the end, leave them as they are. Use O(1) extra space and relink nodes (don't just change values). Return the head.",
      examples: [["build_list([1, 2, 3, 4, 5]), 2", "[2, 1, 4, 3, 5]", ""], ["build_list([1, 2, 3, 4, 5]), 3", "[3, 2, 1, 4, 5]", ""]],
      constraints: ["1 ≤ k ≤ number of nodes ≤ 5000"],
      hints: ["Use a dummy; group_prev is the node before the current block.", "First check that k nodes remain.", "Reverse the block, then connect group_prev to the block's new head and move group_prev to the block's new tail."],
      solution: `def flip_in_blocks(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        first = group_prev.next
        group_prev.next = kth
        group_prev = first`,
      conv: "to_list(r)",
      why: "Each block is reversed in place with its tail already pointing at the next block, so reconnecting is one assignment.", time: "O(n)",
      hidden: [["build_list([1]), 1", "[1]"], ["build_list([1, 2, 3, 4]), 4", "[4, 3, 2, 1]"], ["build_list(list(range(5000))), 7", "[x for b in range(0, 4998, 7) for x in range(b + 6, b - 1, -1)] + [4998, 4999]"]] }
  ]
});
