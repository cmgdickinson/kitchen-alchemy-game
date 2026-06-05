# 🍳 Kitchen Alchemy

A browser-based cooking game where you combine pantry ingredients to discover recipes, fulfil hungry customers' orders, and unlock new items as you cook. Built with vanilla JavaScript — no frameworks, no build step.

## How to play

You start with seven basic ingredients: water, egg, milk, flour, sugar, butter, and salt. Click 2–4 of them to bring them into the **Workspace**, then hit **Combine**. If your combination matches a recipe, you'll get a result card with a description of what you made, and a new item is added to your pantry. If it doesn't match, you'll get a polite (and lightly judgmental) failure message.

As you discover more recipes, hungry customers show up on the **Order Board** asking for dishes you've made. Fulfilling orders earns coins and progresses you toward milestone unlocks of new ingredients — each one opening entirely new branches of the recipe tree.

Toggle the **Hints** button to see, on each pantry card, how many undiscovered recipes still use that ingredient.

The **Recipe Book** drawer at the bottom of the screen shows the recipes you've discovered, with the ingredient combinations you've found for each. The header counter tracks how many of the total recipes you've found.

Progress is saved automatically to `localStorage` between sessions.

## Running it locally

The game uses native ES modules, so it needs to be served over HTTP — browsers block module loading on `file://` URLs for security reasons, so you can't just double-click `index.html`.

Two easy options:

```bash
# Python (already installed on macOS / most Linux)
python3 -m http.server 8000

# Node
npx serve
```

Then open the URL the server prints (usually `http://localhost:8000` for Python or `http://localhost:3000` for serve) in a browser.

## Running the tests

```bash
npm install
npm test
```

105 tests across the data, state, combination, milestone, and order systems. Jest with Babel for ES-module → CommonJS translation.

## Project structure

```
index.html               ← three-panel layout + modal markup
css/
  style.css              ← layout, theme, modal, recipe book drawer
  pantry.css             ← ingredient grid cards
  workspace.css          ← combination area + result card
  orders.css             ← order cards + timer bars
  animations.css         ← discovery pop, shake-on-fail, etc.
js/
  data/                  ← declarative ingredient, recipe, milestone data
  systems/               ← state, combination lookup, milestones, orders
  ui/                    ← pantry, workspace, recipe book, order board renderers
  main.js                ← entry point: wires events and orchestrates rendering
__tests__/               ← Jest tests
```

The `data → systems → ui → main.js` dependency direction is one-way: data files import nothing from the rest of the codebase, and UI files are called by `main.js` rather than the other way round.

## Design notes

- **No resource drain.** Ingredients are infinite; orders cost nothing to fulfil. The only currency is discovery.
- **No frameworks.** Pure ES modules, native DOM APIs, plain CSS. There's no build step and no bundler.
- **Persistent.** Game state is saved to `localStorage` on every change, and restored on page load.
- **Lightly judgmental.** Failure messages, expired-customer messages, and recipe descriptions are the main reward for play.

## License

MIT — see [LICENSE](LICENSE).
