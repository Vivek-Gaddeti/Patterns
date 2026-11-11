/* Runnable Python snippets for the toolkit page: [id, title, code, expected output] */
window.SNIPPETS = [
  ["collections", "collections: Counter, defaultdict, deque", `from collections import Counter, defaultdict, deque

c = Counter("mississippi")
print(c.most_common(2))            # [(char, count), ...]

g = defaultdict(list)              # no KeyError for new keys
for a, b in [(1, 2), (1, 3), (2, 3)]:
    g[a].append(b)
print(dict(g))

q = deque([1, 2, 3])
q.appendleft(0); q.append(4)
print(q.popleft(), q.pop(), list(q))   # O(1) at both ends`, "[('i', 4), ('s', 4)]\n{1: [2, 3], 2: [3]}\n0 4 [1, 2, 3]"],
  ["heapq", "heapq: min-heap, max-heap, top k", `import heapq

h = []
for x in [5, 1, 8, 3]:
    heapq.heappush(h, x)
print(heapq.heappop(h), h[0])      # smallest out, next smallest on top

mx = [-x for x in [5, 1, 8, 3]]    # max-heap: store negatives
heapq.heapify(mx)
print(-heapq.heappop(mx))

print(heapq.nlargest(2, [5, 1, 8, 3]))
tasks = [(2, "write"), (1, "read")] # tuples compare by first item
heapq.heapify(tasks)
print(heapq.heappop(tasks))`, "1 3\n8\n[8, 5]\n(1, 'read')"],
  ["bisect", "bisect: binary search for free", `from bisect import bisect_left, bisect_right, insort

a = [1, 3, 3, 3, 7]
print(bisect_left(a, 3), bisect_right(a, 3))   # first index >= 3, first index > 3
print(bisect_right(a, 3) - bisect_left(a, 3))  # how many 3s
insort(a, 5)                                   # keep it sorted
print(a)`, "1 4\n3\n[1, 3, 3, 3, 5, 7]"],
  ["sorting", "Sorting with keys and comparators", `from functools import cmp_to_key

people = [("asha", 25), ("ben", 19), ("cara", 25)]
print(sorted(people, key=lambda p: (-p[1], p[0])))  # age desc, then name

nums = [3, 30, 34, 5, 9]                          # "largest number"
def cmp(a, b):
    return -1 if a + b > b + a else 1
print("".join(sorted(map(str, nums), key=cmp_to_key(cmp))))`, "[('asha', 25), ('cara', 25), ('ben', 19)]\n9534330"],
  ["math", "math: gcd, primes, modular arithmetic", `import math
MOD = 10**9 + 7

print(math.gcd(12, 18), math.lcm(4, 6), math.isqrt(99))
print(pow(2, 10**18, MOD))          # fast modular power
print(math.comb(5, 2) % MOD)

def sieve(n):                       # all primes < n
    is_p = [True] * n
    is_p[0:2] = [False, False]
    for i in range(2, math.isqrt(n) + 1):
        if is_p[i]:
            is_p[i*i::i] = [False] * len(is_p[i*i::i])
    return [i for i, p in enumerate(is_p) if p]
print(sieve(30))`, "6 12 9\n719476260\n10\n[2, 3, 5, 7, 11, 13, 17, 19, 23, 29]"],
  ["itertools", "itertools + recursion with memo", `from itertools import accumulate, combinations, permutations
from functools import lru_cache
import sys
sys.setrecursionlimit(10**6)        # default is 1000: deep DFS will crash

print(list(accumulate([1, 2, 3, 4])))          # prefix sums
print(list(combinations("abc", 2)))
print(len(list(permutations(range(4)))))

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(90))`, "[1, 3, 6, 10]\n[('a', 'b'), ('a', 'c'), ('b', 'c')]\n24\n2880067194370816120"]
];
