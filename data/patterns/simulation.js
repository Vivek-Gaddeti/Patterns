PAT("simulation", {
  time: "O(steps)", space: "varies",
  lede: "Some OA questions have no clever trick: do exactly what the statement says, step by step, with clean state. The score comes from not making off-by-one mistakes, and from spotting when the naive loop is too slow and a shortcut exists.",
  idea: "Pick a **small, explicit state** (position, direction, counters, a queue), write one function that advances it by one step, and loop. Directions as a list `[(0,1),(1,0),(0,−1),(−1,0)]` with an index turn left/right with `% 4`. Before coding, check the step count: if it can be 10⁹, look for a cycle, a formula, or a way to jump many steps at once.",
  analogy: "Following a recipe exactly: no improvising, just keeping careful track of what's in each bowl at each step.",
  flavours: [["Situation", "Technique", "Examples"], [
    ["**Moving on a grid**", "direction vectors + index mod 4", "robot moves, spiral generation"],
    ["**Processing commands**", "a stack or counters", "score keeping, folder navigation"],
    ["**Queues / rounds**", "deque rotation, or a formula", "ticket queue, elimination circle"],
    ["**Huge step counts**", "detect a cycle or jump with arithmetic", "robot bounded, reaching points"]]],
  signals: [["The statement describes a process: “each step / each second / each round”", "simulate it"], ["Commands, moves, operations to apply in order", "keep explicit state"], ["Small limits (n ≤ 1000)", "brute-force simulation is intended"], ["Huge limits on steps", "find a pattern or shortcut"]],
  not: "**Not this pattern** when the process hides a known structure (shortest spread → BFS; best choice per step → greedy/DP). Simulation is the fallback when nothing smarter is needed.",
  templates: [
    ["Grid walker", "walker.py", `def walk(commands):                   # 'G' forward, 'L' / 'R' turn
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]   # north, east, south, west
    x = y = d = 0
    for c in commands:
        if c == "G":
            x, y = x + dirs[d][0], y + dirs[d][1]
        elif c == "L":
            d = (d - 1) % 4
        else:
            d = (d + 1) % 4
    return (x, y), "NESW"[d]

print(walk("GGLLGG"), walk("GRGRGRG"))`, "((0, 0), 'S') ((0, 0), 'W')"]
  ],
  examples: [
    { t: "Robot Bounded In Circle", d: "Medium", lc: "robot-bounded-in-circle", f: "Cycle shortcut",
      q: "The robot repeats the instructions forever. Does it stay within some circle?",
      idea: "After one pass, it's bounded if it's back at the origin or facing a different direction (then 4 passes bring it home).",
      code: `def is_bounded(ins):
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x = y = d = 0
    for c in ins:
        if c == "G": x, y = x + dirs[d][0], y + dirs[d][1]
        elif c == "L": d = (d - 1) % 4
        else: d = (d + 1) % 4
    return (x, y) == (0, 0) or d != 0

print(is_bounded("GGLLGG"), is_bounded("GG"))`, out: "True False", cx: "O(n)" },
    { t: "Find the Winner of the Circular Game", d: "Medium", lc: "find-the-winner-of-the-circular-game", f: "Formula",
      q: "n friends in a circle; count k and remove that friend, repeatedly. Who wins?",
      idea: "Simulating with a list is O(n²); the Josephus recurrence w(i) = (w(i−1) + k) % i is O(n).",
      code: `def winner(n, k):
    w = 0
    for i in range(2, n + 1):
        w = (w + k) % i
    return w + 1

print(winner(5, 2), winner(6, 5))`, out: "3 1", cx: "O(n)" }
  ],
  pitfalls: [
    ["Off-by-one in loops and indices", "Trace the first two steps on paper with the given example."],
    ["Mutating state you still need this step", "Compute the new state from the old one (copy or temporaries)."],
    ["Simulating 10⁹ steps", "Check the limits; look for a cycle or a closed formula."],
    ["Turning with negative indices", "`(d − 1) % 4` is safe in Python, but think about it in other languages."]
  ],
  edge: ["No commands", "One step", "Returning to the start", "Obstacles on the start cell", "Very large step counts"],
  compare: [
    ["String Building & Parsing", "string-manipulation", "Both reward careful implementation; strings focus on text, simulation on state over time."],
    ["Matrix Tricks", "matrix", "Spirals and rotations are simulations with neat index identities."],
    ["Multi-source BFS", "multi-source-bfs", "If the process is “spreads to neighbours each minute”, BFS is the efficient simulation."]
  ],
  mcq: [
    ["Directions as [(0,1), (1,0), (0,−1), (−1,0)] in clockwise order. Turning right from index d gives…", ["d − 1", "(d + 1) % 4", "d * 2", "3 − d"], 1, "Clockwise order means right is the next index."],
    ["A process may run 10⁹ steps. What should you do first?", ["Simulate faster", "Look for a cycle, formula or bulk jump", "Use recursion", "Give up"], 1, "A direct simulation of 10⁹ Python steps takes minutes."]
  ],
  summary: {
    oneLine: "Explicit state + one step function + a loop; direction vectors with % 4; shortcuts for huge step counts.",
    signals: ["Each step / second / round", "Commands applied in order", "Small limits", "Huge limits → find a cycle"],
    template: `dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
x = y = d = 0
for c in commands:
    if c == "G": x += dirs[d][0]; y += dirs[d][1]
    elif c == "L": d = (d - 1) % 4
    else: d = (d + 1) % 4`,
    pitfalls: ["Trace examples first", "Don't overwrite state mid-step", "Check step limits"],
    cx: "O(steps)",
    drill: { task: "A robot starts at (0, 0) and follows moves 'U', 'D', 'L', 'R'. Return `True` if it ends back at the origin.",
      ref: `def back_home(moves):
    return moves.count("U") == moves.count("D") and moves.count("L") == moves.count("R")`,
      tests: [["'UD'", "True"], ["'LL'", "False"], ["''", "True"]] }
  },
  problems: [
    { id: "home-again", title: "Home Again?", d: "Easy", lc: "robot-return-to-origin",
      statement: "A robot starts at (0, 0) and follows the moves in `moves` ('U', 'D', 'L', 'R', one unit each). Return `True` if it finishes at the origin.",
      examples: [["'UD'", "True", ""], ["'LL'", "False", ""]],
      constraints: ["1 ≤ len(moves) ≤ 2·10⁴"],
      hints: ["Track x and y.", "Or: ups must equal downs and lefts equal rights."],
      solution: `def home_again(moves):
    x = y = 0
    for m in moves:
        if m == "U":
            y += 1
        elif m == "D":
            y -= 1
        elif m == "L":
            x -= 1
        else:
            x += 1
    return x == 0 and y == 0`,
      why: "Position is just the sum of the moves.", time: "O(n)",
      hidden: [["'RRDDLLUU'", "True"], ["'R'", "False"], ["'UDLR' * 5000", "True"]] },
    { id: "score-sheet", title: "Score Sheet", d: "Easy", lc: "baseball-game",
      statement: "Process `ops` in order on a score list: an integer string adds that score; `'+'` adds the sum of the last two scores; `'D'` adds double the last score; `'C'` removes the last score. Return the total of the final list.",
      examples: [["['5', '2', 'C', 'D', '+']", "30", "5, 10, 15"], ["['5', '-2', '4', 'C', 'D', '9', '+', '+']", "27", ""]],
      constraints: ["1 ≤ len(ops) ≤ 1000", "operations are always valid"],
      hints: ["Keep the scores in a list used as a stack.", "'+' and 'D' read the top of the stack; 'C' pops it."],
      solution: `def score_sheet(ops):
    st = []
    for op in ops:
        if op == "+":
            st.append(st[-1] + st[-2])
        elif op == "D":
            st.append(2 * st[-1])
        elif op == "C":
            st.pop()
        else:
            st.append(int(op))
    return sum(st)`,
      why: "Every operation only touches the most recent scores, so a stack is the natural state.", time: "O(n)",
      hidden: [["['1']", "1"], ["['1', 'C']", "0"], ["['1'] + ['D'] * 30", "2 ** 31 - 1"]] },
    { id: "ticket-line", title: "Ticket Line", d: "Easy", lc: "time-needed-to-buy-tickets",
      statement: "`tickets[i]` is how many tickets person i wants. Each second, the person at the front buys one ticket; if they want more, they go to the back of the line, otherwise they leave. Return how many seconds until person `k` is done.",
      examples: [["[2, 3, 2], 2", "6", ""], ["[5, 1, 1, 1], 0", "8", ""]],
      constraints: ["1 ≤ n ≤ 100", "1 ≤ tickets[i] ≤ 100"],
      hints: ["Simulating works, but there's a formula.", "People before k buy min(t, tickets[k]); people after k buy min(t, tickets[k] − 1)."],
      solution: `def ticket_line(tickets, k):
    need = tickets[k]
    return sum(min(t, need if i <= k else need - 1) for i, t in enumerate(tickets))`,
      why: "Each round, everyone still in line buys one; person k leaves after their last round.", time: "O(n)",
      hidden: [["[1], 0", "1"], ["[1, 1, 1], 1", "2"], ["[100] * 100, 99", "10000"]] },
    { id: "folder-steps", title: "Folder Steps", d: "Easy", lc: "crawler-log-folder",
      statement: "Starting in the main folder, apply `logs`: `'../'` moves to the parent (staying put at main), `'./'` stays, and `'x/'` enters child folder x. Return the minimum number of `'../'` steps needed to get back to main.",
      examples: [["['d1/', 'd2/', '../', 'd21/', './']", "2", ""], ["['d1/', '../', '../', '../']", "0", ""]],
      constraints: ["1 ≤ len(logs) ≤ 10³"],
      hints: ["Only the depth matters.", "Never let the depth go below 0."],
      solution: `def folder_steps(logs):
    depth = 0
    for log in logs:
        if log == "../":
            depth = max(0, depth - 1)
        elif log != "./":
            depth += 1
    return depth`,
      why: "The depth fully describes where you are relative to main.", time: "O(n)",
      hidden: [["['./']", "0"], ["['a/', 'b/', 'c/']", "3"], ["['x/'] * 1000", "1000"]] },
    { id: "bounded-robot", title: "Does the Robot Wander Off?", d: "Medium", lc: "robot-bounded-in-circle",
      statement: "A robot at (0, 0) facing north repeats `instructions` forever: 'G' moves one step forward, 'L' and 'R' turn 90°. Return `True` if the robot stays within some circle forever.",
      examples: [["'GGLLGG'", "True", ""], ["'GG'", "False", ""], ["'GL'", "True", ""]],
      constraints: ["1 ≤ len(instructions) ≤ 100"],
      hints: ["Simulate one pass.", "If it's back at the origin, it's bounded. If it faces a different direction, after at most 4 passes it's back too."],
      solution: `def bounded_robot(instructions):
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x = y = d = 0
    for c in instructions:
        if c == "G":
            x += dirs[d][0]
            y += dirs[d][1]
        elif c == "L":
            d = (d - 1) % 4
        else:
            d = (d + 1) % 4
    return (x, y) == (0, 0) or d != 0`,
      why: "Only facing north again after a pass, away from the origin, makes the robot drift forever.", time: "O(n)",
      hidden: [["'L'", "True"], ["'GRGL'", "False"], ["'G' * 99 + 'R'", "True"]] },
    { id: "obstacle-walk", title: "Walk Past Obstacles", d: "Medium", lc: "walking-robot-simulation",
      statement: "A robot at (0, 0) facing north gets `commands`: −2 turns left, −1 turns right, and 1..9 moves forward that many units one at a time, stopping before any obstacle. Return the largest squared distance from the origin reached at any point.",
      examples: [["[4, -1, 3], []", "25", "Ends at (3, 4)."], ["[4, -1, 4, -2, 4], [[2, 4]]", "65", "Reaches (1, 8)."]],
      constraints: ["1 ≤ len(commands) ≤ 10⁴", "0 ≤ len(obstacles) ≤ 10⁴"],
      hints: ["Put obstacles in a set of tuples for O(1) checks.", "Move one unit at a time so you stop right before an obstacle."],
      solution: `def obstacle_walk(commands, obstacles):
    blocked = set(map(tuple, obstacles))
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    x = y = d = best = 0
    for c in commands:
        if c == -2:
            d = (d - 1) % 4
        elif c == -1:
            d = (d + 1) % 4
        else:
            for _ in range(c):
                nx, ny = x + dirs[d][0], y + dirs[d][1]
                if (nx, ny) in blocked:
                    break
                x, y = nx, ny
            best = max(best, x * x + y * y)
    return best`,
      why: "Unit steps with a set lookup handle obstacles exactly; at most 9 steps per command.", time: "O(commands · 9 + obstacles)",
      hidden: [["[6, -1, -1, 6], []", "36"], ["[1], [[0, 1]]", "0"], ["[9] * 10000, []", "8100000000"]] },
    { id: "circle-elimination", title: "Circle Elimination", d: "Medium", lc: "find-the-winner-of-the-circular-game",
      statement: "`n` friends numbered 1..n sit in a circle. Starting at friend 1, count `k` friends clockwise (including the one you start on); that friend leaves, and counting restarts from the next friend. Return the last friend left.",
      examples: [["5, 2", "3", ""], ["6, 5", "1", ""]],
      constraints: ["1 ≤ k ≤ n ≤ 10⁵"],
      hints: ["A list simulation with pop is O(n²) — too slow for 10⁵.", "Josephus: with 0-based positions, w(1) = 0 and w(i) = (w(i − 1) + k) % i."],
      solution: `def circle_elimination(n, k):
    w = 0
    for i in range(2, n + 1):
        w = (w + k) % i
    return w + 1`,
      why: "After one removal the problem is the same with i − 1 people, shifted by k positions.", time: "O(n)",
      hidden: [["1, 1", "1"], ["7, 3", "4"], ["100000, 2", "68929"]] },
    { id: "fill-spiral", title: "Fill a Spiral", d: "Medium", lc: "spiral-matrix-ii",
      statement: "Return an `n × n` grid filled with 1..n² in clockwise spiral order, starting at the top-left.",
      examples: [["3", "[[1, 2, 3], [8, 9, 4], [7, 6, 5]]", ""], ["1", "[[1]]", ""]],
      constraints: ["1 ≤ n ≤ 20"],
      hints: ["Keep a direction index into [right, down, left, up].", "Walk forward; turn right when the next cell is outside or already filled."],
      solution: `def fill_spiral(n):
    g = [[0] * n for _ in range(n)]
    dirs = [(0, 1), (1, 0), (0, -1), (-1, 0)]
    r = c = d = 0
    for v in range(1, n * n + 1):
        g[r][c] = v
        nr, nc = r + dirs[d][0], c + dirs[d][1]
        if not (0 <= nr < n and 0 <= nc < n and g[nr][nc] == 0):
            d = (d + 1) % 4
            nr, nc = r + dirs[d][0], c + dirs[d][1]
        r, c = nr, nc
    return g`,
      why: "Turning only when blocked traces the spiral exactly once.", time: "O(n²)",
      hidden: [["2", "[[1, 2], [4, 3]]"], ["4", "[[1, 2, 3, 4], [12, 13, 14, 5], [11, 16, 15, 6], [10, 9, 8, 7]]"], ["5", "[[1, 2, 3, 4, 5], [16, 17, 18, 19, 6], [15, 24, 25, 20, 7], [14, 23, 22, 21, 8], [13, 12, 11, 10, 9]]"]] },
    { id: "reach-point", title: "Reach the Point", d: "Hard", lc: "reaching-points",
      statement: "From point (x, y) you may move to (x + y, y) or (x, x + y). Return `True` if you can get from `(sx, sy)` to `(tx, ty)`. All values are positive.",
      examples: [["1, 1, 3, 5", "True", "(1,1) → (1,2) → (3,2) → (3,5)"], ["1, 1, 2, 2", "False", ""], ["1, 1, 1, 1", "True", ""]],
      constraints: ["1 ≤ sx, sy, tx, ty ≤ 10⁹"],
      hints: ["Forward simulation explodes; go backwards — each point has exactly one parent.", "The larger coordinate came from subtracting the smaller one.", "Subtract many times at once with %, like Euclid's algorithm."],
      solution: `def reach_point(sx, sy, tx, ty):
    while tx >= sx and ty >= sy:
        if tx == sx and ty == sy:
            return True
        if tx > ty:
            if ty == sy:
                return (tx - sx) % ty == 0
            tx %= ty
        else:
            if tx == sx:
                return (ty - sy) % tx == 0
            ty %= tx
    return False`,
      why: "Walking backwards is deterministic, and modulo jumps over long runs of identical steps in O(log).", time: "O(log max)",
      hidden: [["3, 3, 12, 9", "True"], ["1, 1, 1000000000, 1", "True"], ["2, 3, 1000000000, 999999999", "False"]] }
  ]
});
