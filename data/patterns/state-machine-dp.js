PAT("state-machine-dp", {
  time: "O(n · states)", space: "O(states)",
  lede: "At every step you're in one of a few states (holding a stock or not, in cooldown, last colour used…). Keep the best value for each state, and update all of them together from the previous step's values.",
  idea: "Some problems have a small amount of “memory” that matters: are you holding a share, how many transactions are left, what colour was the previous house? Name those **states**, draw the arrows between them (buy, sell, rest), and for each day compute `new[state] = best over arrows into it of old[from] + gain`. Because only the previous day is used, a handful of variables is enough.",
  analogy: "A traffic light: at any moment it's red, amber or green, and the rules for what it can switch to next depend only on its current colour.",
  flavours: [["Problem", "States", "Transitions"], [
    ["**Stock, unlimited trades**", "hold, free", "buy: free → hold, sell: hold → free"],
    ["**+ cooldown**", "hold, sold (cooldown), rest", "sold → rest only"],
    ["**+ fee**", "hold, free", "pay the fee on sell"],
    ["**At most k trades**", "hold[j], free[j] for j trades used", "k pairs of states"],
    ["**Colouring**", "last colour", "can't repeat the previous colour"]]],
  signals: [["Buy / sell with rules: cooldown, fee, limited trades", "stock problems"], ["Each step's options depend on the previous step's choice", "colouring, alternating states"], ["“Minimum flips to make it …”", "track the state you're in"], ["Strings with forbidden patterns (no two 1s in a row)", "count by last character"]],
  not: "**Not this pattern** when the state is a position in a sequence of many choices with no small memory (→ plain 1-D DP), or when one greedy rule works (unlimited trades can also be done greedily).",
  templates: [
    ["Stock with cooldown", "cooldown.py", `def max_profit_cooldown(prices):
    hold, sold, rest = float("-inf"), 0, 0    # best profit in each state
    for p in prices:
        hold, sold, rest = (max(hold, rest - p),   # keep holding, or buy (only after resting)
                            hold + p,              # sell today -> cooldown tomorrow
                            max(rest, sold))       # rest, or finish a cooldown
    return max(sold, rest)

print(max_profit_cooldown([1, 2, 3, 0, 2]))`, "3"],
    ["At most k trades", "k_trades.py", `def max_profit_k(k, prices):
    hold = [float("-inf")] * (k + 1)           # hold[j]: holding, j-th buy done
    free = [0] * (k + 1)                       # free[j]: not holding, j trades done
    for p in prices:
        for j in range(1, k + 1):
            hold[j] = max(hold[j], free[j - 1] - p)
            free[j] = max(free[j], hold[j] + p)
    return free[k]

print(max_profit_k(2, [3, 2, 6, 5, 0, 3]))`, "7"]
  ],
  examples: [
    { t: "Best Time to Buy and Sell Stock with Transaction Fee", d: "Medium", lc: "best-time-to-buy-and-sell-stock-with-transaction-fee", f: "Two states",
      q: "Unlimited trades, but each sale costs a fee. Max profit.",
      idea: "hold = max(hold, free − p); free = max(free, hold + p − fee).",
      code: `def max_profit_fee(prices, fee):
    hold, free = float("-inf"), 0
    for p in prices:
        hold, free = max(hold, free - p), max(free, hold + p - fee)
    return free

print(max_profit_fee([1, 3, 2, 8, 4, 9], 2))`, out: "8", cx: "O(n) · O(1)" },
    { t: "Paint House", d: "Medium", lc: "paint-house", f: "Last colour",
      q: "Paint n houses with 3 colours (costs given); neighbours can't share a colour. Min cost.",
      idea: "State = colour of the current house. new[c] = cost[c] + min of the other two old states.",
      code: `def min_paint(costs):
    a = b = c = 0
    for r, g, bl in costs:
        a, b, c = r + min(b, c), g + min(a, c), bl + min(a, b)
    return min(a, b, c)

print(min_paint([[17, 2, 17], [16, 16, 5], [14, 3, 19]]))`, out: "10", cx: "O(n)" }
  ],
  pitfalls: [
    ["Updating states in place", "Compute all new states from the **old** values (tuple assignment or temporaries)."],
    ["Initial “holding” state", "Before any purchase, holding is impossible: start at −∞, not 0."],
    ["Counting a transaction at the wrong moment", "Decide whether a buy or a sell uses up one of the k trades, and be consistent."],
    ["Large k", "If k ≥ n / 2, it's the same as unlimited trades: use the simpler O(n) version."]
  ],
  edge: ["Prices only fall", "One day", "k = 0", "Fee larger than any gain", "All costs equal"],
  compare: [
    ["1-D DP", "dp-1d", "State machines are 1-D DP with several values per index instead of one."],
    ["Kadane's Algorithm", "kadane", "A single buy/sell is Kadane on price differences (or min-so-far)."],
    ["Greedy", "greedy", "Unlimited trades with no fee: just add every positive day-to-day rise."]
  ],
  mcq: [
    ["Why start `hold` at −∞?", ["To make profits negative", "Holding a share before buying any is impossible", "It's a convention only", "To handle fees"], 1, "−∞ guarantees the first transition into hold is a real purchase."],
    ["With a cooldown, from which state can you buy?", ["sold", "rest", "hold", "any"], 1, "After selling you must rest a day before buying again."]
  ],
  summary: {
    oneLine: "A few named states per step; update all of them together from the previous step.",
    signals: ["Stock problems with cooldown / fee / k trades", "Choices depend on the previous choice", "Min flips / forbidden patterns"],
    template: `hold, free = -inf, 0
for p in prices:
    hold, free = max(hold, free - p), max(free, hold + p)
return free`,
    pitfalls: ["Update from old values only", "hold starts at −∞", "Big k = unlimited"],
    cx: "O(n · states) time · O(states) space",
    drill: { task: "Unlimited buy/sell, but after selling you must wait one day before buying again. Return the max profit.",
      ref: `def cooldown_profit(prices):
    hold, sold, rest = -inf, 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
      tests: [["[1, 2, 3, 0, 2]", "3"], ["[1]", "0"], ["[2, 1]", "0"]] }
  },
  problems: [
    { id: "no-double-ones", title: "No Two Ones in a Row", d: "Easy", lc: "non-negative-integers-without-consecutive-ones",
      statement: "Return how many binary strings of length `n` have **no two adjacent 1s**.",
      examples: [["1", "2", "0, 1"], ["3", "5", "000, 001, 010, 100, 101"]],
      constraints: ["1 ≤ n ≤ 80"],
      hints: ["Track two states: strings ending in 0 and strings ending in 1.", "End in 0: append 0 to anything. End in 1: append 1 only to strings ending in 0."],
      solution: `def no_double_ones(n):
    end0, end1 = 1, 1
    for _ in range(n - 1):
        end0, end1 = end0 + end1, end0
    return end0 + end1`,
      why: "The last character is the only memory that matters for the rule.", time: "O(n)",
      hidden: [["2", "3"], ["10", "144"], ["80", "61305790721611591"]] },
    { id: "many-trades", title: "Trade as Often as You Like", d: "Medium", lc: "best-time-to-buy-and-sell-stock-ii",
      statement: "You may buy and sell one share as many times as you like, but hold at most one share at a time (you may sell and buy on the same day). Return the maximum profit.",
      examples: [["[7, 1, 5, 3, 6, 4]", "7", "Buy 1 sell 5, buy 3 sell 6."], ["[1, 2, 3, 4, 5]", "4", ""], ["[7, 6, 4, 3, 1]", "0", ""]],
      constraints: ["1 ≤ len(prices) ≤ 3·10⁴"],
      hints: ["Two states: holding a share, or not.", "hold = max(hold, free − p); free = max(free, hold + p).", "(Equivalently: add every positive day-to-day rise.)"],
      solution: `def many_trades(prices):
    hold, free = -inf, 0
    for p in prices:
        hold, free = max(hold, free - p), max(free, hold + p)
    return free`,
      why: "Two states fully describe your position; each day updates both from yesterday's values.", time: "O(n)",
      hidden: [["[5]", "0"], ["[1, 3, 1, 3]", "4"], ["[1, 2] * 15000", "15000"]] },
    { id: "trades-with-rest", title: "Trades With a Rest Day", d: "Medium", lc: "best-time-to-buy-and-sell-stock-with-cooldown",
      statement: "Unlimited trades of one share at a time, but after you sell you must wait **one full day** before buying again. Return the maximum profit.",
      examples: [["[1, 2, 3, 0, 2]", "3", "buy, sell, rest, buy, sell"], ["[1]", "0", ""]],
      constraints: ["1 ≤ len(prices) ≤ 5000"],
      hints: ["Three states: holding, just sold (cooldown), resting.", "You can only buy from the resting state."],
      solution: `def trades_with_rest(prices):
    hold, sold, rest = -inf, 0, 0
    for p in prices:
        hold, sold, rest = max(hold, rest - p), hold + p, max(rest, sold)
    return max(sold, rest)`,
      why: "The cooldown is just a state you must pass through between selling and buying.", time: "O(n)",
      hidden: [["[2, 1]", "0"], ["[1, 2, 4]", "3"], ["[1, 3] * 2500", "2500"]] },
    { id: "trades-with-fee", title: "Trades With a Fee", d: "Medium", lc: "best-time-to-buy-and-sell-stock-with-transaction-fee",
      statement: "Unlimited trades of one share at a time; every **sale** costs `fee`. Return the maximum profit.",
      examples: [["[1, 3, 2, 8, 4, 9], 2", "8", "Buy 1 sell 8, buy 4 sell 9."], ["[1, 3, 7, 5, 10, 3], 3", "6", ""]],
      constraints: ["1 ≤ len(prices) ≤ 5·10⁴", "0 ≤ fee ≤ 5·10⁴"],
      hints: ["Same two states as unlimited trades.", "Subtract the fee when moving from holding to free."],
      solution: `def trades_with_fee(prices, fee):
    hold, free = -inf, 0
    for p in prices:
        hold, free = max(hold, free - p), max(free, hold + p - fee)
    return free`,
      why: "The fee only changes the sell transition; the state machine is otherwise unchanged.", time: "O(n)",
      hidden: [["[1], 0", "0"], ["[1, 4], 3", "0"], ["[1, 10] * 25000, 1", "200000"]] },
    { id: "paint-street", title: "Paint the Street", d: "Medium", lc: "paint-house",
      statement: "`costs[i] = [red, green, blue]` is the cost to paint house i each colour. Neighbouring houses can't have the same colour. Return the minimum total cost.",
      examples: [["[[17, 2, 17], [16, 16, 5], [14, 3, 19]]", "10", "green, blue, green"], ["[[7, 6, 2]]", "2", ""]],
      constraints: ["1 ≤ n ≤ 10⁴", "costs[i][j] ≤ 20"],
      hints: ["State: the colour of the current house.", "new[c] = costs[i][c] + min of the other two previous states."],
      solution: `def paint_street(costs):
    a = b = c = 0
    for r, g, bl in costs:
        a, b, c = r + min(b, c), g + min(a, c), bl + min(a, b)
    return min(a, b, c)`,
      why: "The previous house's colour is the only thing that constrains the next choice.", time: "O(n)",
      hidden: [["[[1, 1, 1]]", "1"], ["[[1, 100, 100], [1, 100, 100]]", "101"], ["[[1, 2, 3]] * 10000", "15000"]] },
    { id: "monotone-flips", title: "Flip to Rising", d: "Medium", lc: "flip-string-to-monotone-increasing",
      statement: "`s` is a string of 0s and 1s. Return the minimum number of flips to make it **monotone increasing** (some 0s followed by some 1s).",
      examples: [["'00110'", "1", "Flip the last 0."], ["'010110'", "2", ""], ["'00011000'", "2", ""]],
      constraints: ["1 ≤ len(s) ≤ 10⁵"],
      hints: ["Two states: still in the 0-part, or already in the 1-part.", "zero = flips so far keeping everything 0; one = min flips ending in the 1-part."],
      solution: `def monotone_flips(s):
    zero = one = 0
    for ch in s:
        if ch == "0":
            zero, one = zero, min(zero, one) + 1
        else:
            zero, one = zero + 1, min(zero, one)
    return min(zero, one)`,
      why: "Each character either stays in the current part or the string switches into the 1-part, which a two-state DP captures.", time: "O(n)",
      hidden: [["'0'", "0"], ["'10'", "1"], ["'10' * 50000", "50000"]] },
    { id: "two-trades-max", title: "At Most Two Trades", d: "Hard", lc: "best-time-to-buy-and-sell-stock-iii",
      statement: "You may complete **at most two** buy-sell trades (one share at a time). Return the maximum profit.",
      examples: [["[3, 3, 5, 0, 0, 3, 1, 4]", "6", "Buy 0 sell 3, buy 1 sell 4."], ["[1, 2, 3, 4, 5]", "4", ""], ["[7, 6, 4, 3, 1]", "0", ""]],
      constraints: ["1 ≤ len(prices) ≤ 10⁵"],
      hints: ["Four states: after first buy, after first sell, after second buy, after second sell.", "Each one is the best of staying or transitioning from the previous state."],
      solution: `def two_trades(prices):
    b1 = b2 = -inf
    s1 = s2 = 0
    for p in prices:
        b1 = max(b1, -p)
        s1 = max(s1, b1 + p)
        b2 = max(b2, s1 - p)
        s2 = max(s2, b2 + p)
    return s2`,
      why: "Four sequential states encode how many buys and sells have happened; updating in that order uses today's price at most once per transition chain, which is allowed since same-day buy/sell nets zero.", time: "O(n)",
      hidden: [["[1]", "0"], ["[1, 5, 1, 5, 1, 5]", "8"], ["list(range(100000))", "99999"]] },
    { id: "k-trades-max", title: "At Most K Trades", d: "Hard", lc: "best-time-to-buy-and-sell-stock-iv",
      statement: "You may complete **at most `k`** buy-sell trades (one share at a time). Return the maximum profit.",
      examples: [["2, [2, 4, 1]", "2", ""], ["2, [3, 2, 6, 5, 0, 3]", "7", ""]],
      constraints: ["1 ≤ k ≤ 100", "1 ≤ len(prices) ≤ 1000"],
      hints: ["States hold[j] and free[j] for j trades.", "hold[j] = max(hold[j], free[j−1] − p); free[j] = max(free[j], hold[j] + p).", "If k ≥ n/2, it's the unlimited case."],
      solution: `def k_trades(k, prices):
    if 2 * k >= len(prices):
        return sum(max(0, b - a) for a, b in zip(prices, prices[1:]))
    hold = [-inf] * (k + 1)
    free = [0] * (k + 1)
    for p in prices:
        for j in range(1, k + 1):
            hold[j] = max(hold[j], free[j - 1] - p)
            free[j] = max(free[j], hold[j] + p)
    return free[k]`,
      why: "k pairs of states generalise the two-trade machine; large k collapses to the greedy unlimited answer.", time: "O(n · k)",
      hidden: [["1, [5]", "0"], ["1, [1, 3, 1, 5]", "4"], ["100, [1, 5] * 500", "400"]] }
  ]
});
