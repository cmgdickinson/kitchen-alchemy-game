// Each recipe: { id, name, emoji, ingredients[], result, description }
// ingredients[] is order-agnostic — the combination system sorts them before matching.
// id == result (each result is produced by exactly one combination).

export const RECIPES = [

  // ── Tier 1: Two starting ingredients ─────────────────────────

  {
    id: 'paste',
    ingredients: ['flour', 'water'],
    result: 'paste',
    description: "Congratulations! You've invented wallpaper paste. Technically edible, in the same way that cardboard is technically food.",
  },
  {
    id: 'egg_wash',
    ingredients: ['egg', 'milk'],
    result: 'egg_wash',
    description: "A golden glaze that makes baked goods shine like they just got a spray tan. Very Hollywood.",
  },
  {
    id: 'caramel',
    ingredients: ['sugar', 'butter'],
    result: 'caramel',
    description: "Burnt sugar that somehow became a luxury. The glow-up story of the culinary century.",
  },
  {
    id: 'scrambled_eggs',
    ingredients: ['egg', 'butter'],
    result: 'scrambled_eggs',
    description: "The dish that has saved more hungover people than aspirin. A true cultural institution.",
  },
  {
    id: 'sweet_milk',
    ingredients: ['milk', 'sugar'],
    result: 'sweet_milk',
    description: "Milk... but with ambitions. It's going places. Probably into something more interesting.",
  },
  {
    id: 'meringue_base',
    ingredients: ['egg', 'sugar'],
    result: 'meringue_base',
    description: "Air and sugar whipped into defiance against the laws of physics. It shouldn't work, and yet.",
  },
  {
    id: 'buttermilk',
    ingredients: ['butter', 'milk'],
    result: 'buttermilk',
    description: "Milk's slightly sour, slightly rebellious cousin who changed its name and moved to Brooklyn.",
  },

  // ── Tier 2: Three starting ingredients ───────────────────────

  {
    id: 'batter',
    ingredients: ['flour', 'egg', 'milk'],
    result: 'batter',
    description: "The universal ancestor. From this primordial gloop, all fried, baked, and pan-cooked things descend.",
  },
  {
    id: 'custard_base',
    ingredients: ['egg', 'milk', 'sugar'],
    result: 'custard_base',
    description: "Technically just enriched sadness until you cook it. Then it becomes something transcendent.",
  },
  {
    id: 'dough',
    ingredients: ['flour', 'water', 'salt'],
    result: 'dough',
    description: "A blank canvas. A promise. An uncooked lump of potential that judges you silently.",
  },
  {
    id: 'shortcrust',
    ingredients: ['butter', 'sugar', 'flour'],
    result: 'shortcrust',
    description: "Pastry's lazy cousin. It doesn't bother to layer — it just crumbles into buttery oblivion.",
  },
  {
    id: 'bechamel',
    ingredients: ['milk', 'butter', 'salt'],
    result: 'bechamel',
    description: "France is smug about this one, and frankly, it's earned. A velvety white sauce of pure arrogance.",
  },
  {
    id: 'pasta_dough',
    ingredients: ['flour', 'egg', 'water'],
    result: 'pasta_dough',
    description: "Italy would like several words. All of them are passionate. All of them involve hand gestures.",
  },
  {
    id: 'toffee',
    ingredients: ['sugar', 'butter', 'milk'],
    result: 'toffee',
    description: "Caramel went to finishing school and came out chewier and even more pleased with itself.",
  },
  {
    id: 'sponge_base',
    ingredients: ['egg', 'flour', 'sugar'],
    result: 'sponge_base',
    description: "The silent backbone of celebrations everywhere. Nobody ever says 'wow, great sponge!' — and yet without it, everything falls apart.",
  },

  // ── Tier 3: Four starting ingredients ────────────────────────

  {
    id: 'bread',
    ingredients: ['flour', 'water', 'salt', 'yeast'],
    result: 'bread',
    description: "Humanity's oldest flex. Entire civilizations rose and fell over this humble loaf. You did it.",
  },
  {
    id: 'french_toast_batter',
    ingredients: ['egg', 'milk', 'vanilla', 'sugar'],
    result: 'french_toast_batter',
    description: "The French did not invent this. The French are deeply annoyed about it. The French will not let it go.",
  },
  {
    id: 'lemon_curd',
    ingredients: ['lemon', 'butter', 'egg', 'sugar'],
    result: 'lemon_curd',
    description: "Spreadable sunshine with a superiority complex. It goes on toast, scones, or directly into your mouth at 2am.",
  },
  {
    id: 'waffle_batter',
    ingredients: ['flour', 'egg', 'milk', 'sugar'],
    result: 'waffle_batter',
    description: "Batter that dreamed of having a grid pattern. An achiever. A go-getter. A morning-person batter.",
  },

  // ── Tier 4: Milestone ingredient combos ──────────────────────

  {
    id: 'bread_dough',
    ingredients: ['dough', 'yeast'],
    result: 'bread_dough',
    description: "It's alive. Legally, it counts as a pet at this point. Please treat it with respect.",
  },
  {
    id: 'pancake_batter',
    ingredients: ['batter', 'baking_powder'],
    result: 'pancake_batter',
    description: "Batter that grew a spine. Those little bubbles forming? That's ambition. That's breakfast happening.",
  },
  {
    id: 'pancakes',
    ingredients: ['pancake_batter', 'butter'],
    result: 'pancakes',
    description: "A flat cake that society has collectively decided is acceptable for breakfast but not dessert. Nobody knows why. Nobody questions it.",
  },
  {
    id: 'vanilla_custard',
    ingredients: ['custard_base', 'vanilla'],
    result: 'vanilla_custard',
    description: "Silky, wobbly, and judgementally yellow. It has seen things. It has opinions. It will not share them.",
  },
  {
    id: 'butterscotch',
    ingredients: ['caramel', 'butter', 'milk'],
    result: 'butterscotch',
    description: "Like caramel, but it went to private school, summer abroad, and came back with a mid-Atlantic accent.",
  },
  {
    id: 'chocolate_ganache',
    ingredients: ['chocolate', 'butter', 'sugar'],
    result: 'chocolate_ganache',
    description: "A glossy mirror into your own life choices. They are delicious choices. No regrets.",
  },
  {
    id: 'whipped_cream',
    ingredients: ['cream', 'sugar'],
    result: 'whipped_cream',
    description: "Air and fat elevated to the highest art form. An entire generation grew up putting this directly in their mouth from the can.",
  },
  {
    id: 'horchata',
    ingredients: ['milk', 'cinnamon', 'sugar'],
    result: 'horchata',
    description: "A drink so good it crossed entire oceans and time zones to get to you. It would do it again.",
  },
  {
    id: 'hot_chocolate',
    ingredients: ['chocolate', 'milk', 'sugar'],
    result: 'hot_chocolate',
    description: "Liquid comfort. Scientists have measured its effects on morale. Results were classified because they were too powerful.",
  },
  {
    id: 'lemon_syrup',
    ingredients: ['lemon', 'sugar'],
    result: 'lemon_syrup',
    description: "Sweet, sharp, and deeply passive-aggressive. It will improve your drink and then remind you it didn't have to.",
  },
  {
    id: 'fresh_pasta',
    ingredients: ['pasta_dough', 'egg', 'salt'],
    result: 'fresh_pasta',
    description: "Italy exhaled. A nonna somewhere nodded, once, almost imperceptibly. This is the highest praise available.",
  },

  // ── Tier 5: Chained combinations ─────────────────────────────

  {
    id: 'pavlova',
    ingredients: ['meringue_base', 'vanilla'],
    result: 'pavlova',
    description: "Named after a ballerina. It's crisp on the outside, soft on the inside, and the centre of an eternal diplomatic dispute between Australia and New Zealand.",
  },
  {
    id: 'cheese_tart',
    ingredients: ['shortcrust', 'cheese'],
    result: 'cheese_tart',
    description: "Pastry that found its calling. The cheese is smug. The pastry is flattered. Together they are unstoppable.",
  },
  {
    id: 'chocolate_mousse',
    ingredients: ['whipped_cream', 'chocolate_ganache'],
    result: 'chocolate_mousse',
    description: "Chocolate that went to a spa, got a facial, and returned floaty and ethereal. Worth every calorie.",
  },
  {
    id: 'salted_caramel',
    ingredients: ['caramel', 'cream', 'salt'],
    result: 'salted_caramel',
    description: "Salt and sweet fighting for dominance. They called a truce. The truce is delicious. You win.",
  },
  {
    id: 'chocolate_cream',
    ingredients: ['chocolate', 'cream'],
    result: 'chocolate_cream',
    description: "Two powerhouses walking into a room and immediately understanding each other. A perfect partnership. A culinary power couple.",
  },
];
