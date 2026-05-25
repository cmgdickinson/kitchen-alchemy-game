# Kitchen Alchemy — Game Development Plan

## Concept Summary

A browser-based ingredient combination game where players unlock recipes through experimentation, discover new ingredients at milestones, and fulfill humorous customer orders. No resource management — the fun is in discovery, not bookkeeping.

**Tech stack:** Vanilla JavaScript, HTML, CSS (no frameworks)

---

## File Structure

```
CookingGame/
├── index.html
├── css/
│   ├── style.css          ← layout, theme, typography
│   ├── pantry.css         ← ingredient grid cards
│   ├── workspace.css      ← combination area
│   ├── orders.css         ← order cards + timers
│   └── animations.css     ← discovery pop, shake-on-fail, etc.
├── js/
│   ├── data/
│   │   ├── ingredients.js  ← all ingredient definitions
│   │   ├── recipes.js      ← all recipe definitions + descriptions
│   │   └── milestones.js   ← milestone triggers + rewards
│   ├── systems/
│   │   ├── state.js        ← game state object + localStorage save/load
│   │   ├── combination.js  ← recipe lookup logic
│   │   ├── milestones.js   ← milestone checker
│   │   └── orders.js       ← order generation + countdown timers
│   ├── ui/
│   │   ├── pantry.js       ← render ingredient shelf
│   │   ├── workspace.js    ← render/handle the mixing area
│   │   ├── recipeBook.js   ← discovered recipe log panel
│   │   └── orderBoard.js   ← render order cards
│   └── main.js             ← init + wires all systems together
```

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Kitchen Alchemy 🍳              💰 Coins: 0         │
├───────────────────┬─────────────┬───────────────────┤
│                   │             │                   │
│   PANTRY          │  WORKSPACE  │   ORDER BOARD     │
│  (ingredient      │  (click to  │  (3 order card    │
│   grid, scrolls)  │   add +     │   slots w/timers) │
│                   │   Combine)  │                   │
└───────────────────┴─────────────┴───────────────────┘
│  RECIPE BOOK (collapsible panel, shows discoveries) │
└─────────────────────────────────────────────────────┘
```

Three-panel layout using CSS Grid. The recipe book is a collapsible drawer at the bottom.

---

## Data Models

### Ingredient
```js
{
  id: "flour",
  name: "Flour",
  emoji: "🌾",
  description: "The foundation of civilization, and also cookies.",
  unlocked: true  // false if milestone-gated
}
```

### Recipe
```js
{
  id: "pancake_batter",
  name: "Pancake Batter",
  emoji: "🥞",
  ingredients: ["flour", "egg", "milk"],  // order-agnostic matching
  result: "pancake_batter",               // id of new ingredient/dish produced
  description: "The primordial soup of breakfasts. Flat cakes await.",
  discovered: false
}
```

### Milestone
```js
{
  id: "unlock_yeast",
  condition: { type: "discoveries", count: 5 },
  reward: { type: "ingredient", id: "yeast" },
  message: "A mysterious jar appears in your pantry... It's alive?!"
}
```

### Order
```js
{
  id: "order_001",
  customerName: "Hungry Harold",
  recipeId: "scrambled_eggs",
  reward: 15,       // coins
  timeLimit: 60,    // seconds
  status: "active"  // active | fulfilled | expired
}
```

---

## Starting Ingredients (7, all unlocked from the start)

| Ingredient | Emoji |
|---|---|
| Water | 💧 |
| Egg | 🥚 |
| Milk | 🥛 |
| Flour | 🌾 |
| Sugar | 🍬 |
| Butter | 🧈 |
| Salt | 🧂 |

---

## Recipe Tree

### Tier 1 — Simple combos (2 ingredients)

| Ingredients | Result | Funny Description |
|---|---|---|
| Flour + Water | Paste | "Congratulations! You've invented wallpaper paste. Technically edible, in the way that cardboard is technically food." |
| Egg + Milk | Egg Wash | "A golden glaze that makes baked goods shine like they just got a spray tan." |
| Sugar + Butter | Caramel | "Burnt sugar that somehow became a luxury. The glow-up story of the century." |
| Egg + Butter | Scrambled Eggs | "The dish that has saved more hungover people than aspirin. A masterpiece." |
| Milk + Sugar | Sweet Milk | "Milk... but with ambitions." |
| Flour + Salt | Seasoned Flour | "Salt's attempt at being an influencer. 'I make everything better,' it said." |
| Water + Salt | Brine | "Salt water with a LinkedIn profile." |
| Egg + Salt | Salted Egg | "A humble egg that found its true calling." |

### Tier 2 — Three-ingredient combos

| Ingredients | Result | Funny Description |
|---|---|---|
| Flour + Egg + Milk | Batter | "The universal ancestor. From this primordial gloop, all fried things descend." |
| Egg + Milk + Sugar | Custard Base | "Technically this is just enriched sadness until you cook it." |
| Flour + Water + Salt | Dough | "A blank canvas. A promise. An uncooked lump." |
| Butter + Sugar + Flour | Shortcrust | "Pastry's lazy cousin. It doesn't layer, it just crumbles into buttery oblivion." |
| Egg + Butter + Salt | Buttered Eggs | "Scrambled eggs went to finishing school." |
| Milk + Butter + Salt | Béchamel | "France is smug about this one, and frankly, it's earned." |
| Water + Flour + Egg | Pasta Dough | "Italy would like a word. Several words, actually, all very loud." |

### Tier 3 — Milestone-unlocked ingredient combos

| Ingredients | Result | Funny Description |
|---|---|---|
| Dough + Yeast | Bread Dough | "It's alive. Legally, it counts as a pet at this point." |
| Bread Dough + Water + Salt | Bread | "Humanity's oldest flex. Entire civilizations rose and fell over this." |
| Batter + Sugar + Vanilla | Cake Batter | "One step closer to a celebration that probably wasn't earned." |
| Custard Base + Vanilla | Vanilla Custard | "Silky, wobbly, judgementally yellow." |
| Caramel + Butter + Milk | Butterscotch | "Like caramel, but it went to private school." |
| Chocolate + Butter + Sugar | Chocolate Ganache | "A glossy mirror into your life choices. Delicious ones." |
| Cream + Sugar | Whipped Cream | "Air and fat, elevated to art. A real achievement for both." |
| Flour + Butter + Cheese | Cheese Pastry | "Cheese got ambitious and enrolled in baking school." |
| Egg + Milk + Vanilla + Sugar | French Toast Batter | "The French did not invent this. The French are annoyed about it." |
| Milk + Cinnamon + Sugar | Horchata | "A drink so good it crossed entire oceans to get to you." |
| Chocolate + Milk + Sugar | Hot Chocolate | "Liquid comfort. Scientifically proven to make bad days 40% better. (Not peer reviewed.)" |

---

## Milestone Schedule

| Trigger | Unlock | Pantry Notification |
|---|---|---|
| 3 recipe discoveries | Yeast 🧫 | "Something bubbled up in your pantry. It smells... alive." |
| 7 recipe discoveries | Vanilla Extract 🌿 | "A tiny brown bottle appears. It costs more than rent." |
| 12 recipe discoveries | Chocolate 🍫 | "The greatest discovery since fire. Possibly greater." |
| 20 recipe discoveries | Cheese 🧀 | "Aged, mysterious, slightly terrifying. Welcome." |
| 30 recipe discoveries | Cream 🫙 | "Milk that got a promotion." |
| Complete 5 orders | Baking Powder | "A small jar that punches well above its weight class." |
| Complete 10 orders | Cinnamon 🫙 | "The scent of autumn in a jar. Also a TikTok challenge, inexplicably." |
| Complete 20 orders | Lemon 🍋 | "Sour, yellow, and judgmental. A great addition to anything." |

---

## Core Systems Detail

### Combination System (`js/systems/combination.js`)
1. Player clicks ingredients in the pantry to add them to the workspace (2–4 at a time)
2. Hits the **Combine** button
3. System sorts selected ingredient IDs and builds a lookup key
4. Checks against a pre-computed recipe map built at startup (O(1) lookup)
5. **Hit:** marks recipe as discovered, runs milestone check, shows animated result card with description
6. **Miss:** plays shake animation + shows a random funny failure message from a pool of quips
7. Workspace clears after each attempt

**Sample failure messages:**
- "The ingredients stared at each other awkwardly and nothing happened."
- "Something went very wrong. You're choosing to pretend it didn't."
- "A faint smell of disappointment fills the kitchen."
- "The universe has reviewed your combination and respectfully declined."
- "Technically food. We won't be serving it."
- "Your ancestors are watching. They are not impressed."

### Milestone System (`js/systems/milestones.js`)
- Runs after every successful recipe discovery or order fulfillment
- Checks all un-triggered milestones against current game state
- On trigger: unlocks ingredient in state, shows modal notification, animates new ingredient appearing in pantry with a "NEW" badge

### Order System (`js/systems/orders.js`)
- 3 order slots on the board at all times
- Orders only pull from the player's **already-discovered** recipes (no impossible orders)
- Each order has a visible countdown timer (progress bar depletes)
- Fulfilling an order costs nothing — knowledge is the resource, not ingredients
- Expired orders show a sad customer quip, then the slot refills after a short delay
- Order difficulty scales over time: early orders have long timers; later orders with rarer recipes have shorter ones

**Sample expired order messages:**
- "Hungry Harold stormed off. He said some things we can't repeat."
- "The customer waited, sighed, and left a strongly-worded Yelp review."
- "Order expired. The customer is now eating cereal at home. This is your fault."

### State & Persistence (`js/systems/state.js`)
- Single `gameState` object: `{ coins, discoveredRecipes[], unlockedIngredients[], completedOrders, triggeredMilestones[] }`
- Auto-saved to `localStorage` on every state mutation
- Loaded on page init; gracefully handles missing or corrupt save data with a fresh-state fallback

---

## Development Phases

### Phase 1 — Foundation
- [ ] Set up all files and folder structure
- [ ] Write `index.html` with three-panel skeleton
- [ ] Write `style.css` — warm kitchen color palette, fonts, responsive grid
- [ ] Define all ingredient, recipe, and milestone data in data files

### Phase 2 — Core Mechanic
- [ ] `state.js` — state object, save/load from localStorage
- [ ] `pantry.js` — render unlocked ingredients as clickable cards
- [ ] `workspace.js` — ingredient slots, Combine button, clear button
- [ ] `combination.js` — recipe map, lookup, success/fail logic
- [ ] Wire pantry → workspace → result feedback loop

### Phase 3 — Recipe Book
- [ ] `recipeBook.js` — collapsible drawer, discovered recipes as cards
- [ ] Undiscovered slots show as `???` with ingredient count hint
- [ ] Discovery counter + progress bar toward next milestone

### Phase 4 — Milestones
- [ ] `milestones.js` — checker function, runs after each state change
- [ ] Milestone notification modal with ingredient reveal animation
- [ ] "NEW" badge pulse on freshly unlocked pantry items

### Phase 5 — Order System
- [ ] `orders.js` — order generator, countdown timers, slot management
- [ ] `orderBoard.js` — render 3 order cards with progress bars
- [ ] Fulfill button, coin reward animation, expired-order messages
- [ ] Coins displayed and animated in header

### Phase 6 — Polish
- [ ] `animations.css` — discovery shimmer, fail shake, coin pop, milestone burst
- [ ] Responsive layout adjustments for tablet
- [ ] First-time tutorial tooltip overlay
- [ ] 10+ randomized failure message pool
- [ ] "New!" badge animation on pantry items
- [ ] Optional: Web Audio API for a satisfying *ding* on discovery

---

## Design Principles

- **No resource drain** — ingredients are infinite; orders cost nothing to fulfill. The only currency is discovery.
- **No dead ends** — every recipe should feel achievable and logically guessable (egg + butter = scrambled eggs should just *make sense*).
- **Humor is the reward** — the description shown on discovery is the main payoff; it must be consistently funny.
- **Orders create urgency without frustration** — timers should be generous early; the drama comes from juggling 3 simultaneously, not from punishing the player.
- **Save constantly** — no player should lose progress from closing a tab.
