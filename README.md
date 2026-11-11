# Patterns — DSA pattern practice for online assessments

50 patterns, 409 original problems you solve in the browser (Python runs locally via Pyodide), spaced revision, mock OAs and a Python OA toolkit.

## Open the site

Double-click `index.html`, or serve the folder (recommended, avoids browser caching issues):

```bash
python tools/serve.py
```

Then open http://localhost:5173. The first time you run code, the browser downloads Python (about 10 MB), so that needs internet once.

Progress is stored in your browser. Use **Settings → Export** to back it up.

## Pages

| Page | File |
|---|---|
| Home dashboard | `index.html` |
| All patterns | `learn.html` |
| One pattern | `pattern.html#<id>` |
| Practice list (pattern hidden) | `practice.html` |
| Solve a problem | `solve.html#<problem-id>` |
| Revise (due today, cards, drills, spot the pattern) | `revise.html` |
| Mock OA | `mock.html` |
| Python OA toolkit | `toolkit.html` |
| Roadmap / Settings | `roadmap.html`, `settings.html` |

## Content

Each pattern lives in one file: `data/patterns/<id>.js`, written as `PAT("<id>", { ... })`. It holds the page content, the revision card and drill (`summary`), and its problems. Each problem has an original statement, `examples` (visible tests), `hidden` tests and a reference `solution`.

Test format: `[args, expected]`, both Python source. Optional fields:

- `call`: how to call the user's code (default `F(*args)`). Class problems use `run_ops(F, *args)`.
- `conv`: transforms the result before comparing, e.g. `to_list(r)` for linked lists, `args[0]` for in-place problems, `sorted(r)` when order doesn't matter.

Helpers available to tests and user code: `ListNode`, `TreeNode`, `build_list`, `build_tree`, `to_list`, `tree_to_list`, `find_node`, `run_ops`, plus the common imports. They are defined in `assets/judge.js` (`PRELUDE`).

## After editing content

```bash
node tools/build.js
```

This validates every pattern file, regenerates `data/index.js`, and runs every code block, template, drill and reference solution against every test with real Python. Use `node tools/build.js <pattern-id>` to check one pattern, or `--fast` to only rebuild the index.

## Tablet and stylus

On a tablet or phone the site switches to a touch layout by itself: bigger buttons and text, a bottom navigation bar, and scratchpads. **Settings → Touch layout** can force it on or off.

- **Scratchpad** (`assets/scratch.js`): on Revise cards, in the Scratch tab of every problem, and behind the Sketch button on pattern pages. It is an infinite canvas: the stylus draws with pressure, one finger drags the canvas, two fingers pinch to zoom, and Fit brings the whole drawing back into view. A resting palm is ignored. With a mouse: right or middle drag moves, the wheel moves, Ctrl+wheel zooms. Sketches are saved in the browser, one per card, problem or pattern (the 80 most recent are kept). They are not part of the Settings export.
- **Solve** on a narrow screen shows Problem / Code / Scratch as tabs.
- **Practice** shows 40 problems at a time in mixed mode, and folding groups in By pattern mode.
