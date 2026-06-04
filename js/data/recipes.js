// Each recipe: { combinations[][], result, description }
// A recipe can be reached by any of its combinations. Each combination is order-agnostic
// (the combination system sorts before matching). The invariant is (combination, result)
// uniqueness — a single combination is not required to map to a single result.

export const RECIPES = [

  // ── Tier 1: Two starting ingredients ─────────────────────────

  {
    combinations: [['flour', 'water']],
    result: 'paste',
    description: "Congratulations! You've invented wallpaper paste. Technically edible, in the same way that cardboard is technically food.",
  },
  {
    combinations: [['egg', 'milk']],
    result: 'egg_wash',
    description: "A golden glaze that makes baked goods shine like they just got a spray tan. Very Hollywood.",
  },
  {
    combinations: [['sugar', 'butter']],
    result: 'caramel',
    description: "Burnt sugar that somehow became a luxury. The glow-up story of the culinary century.",
  },
  {
    combinations: [['egg', 'butter']],
    result: 'scrambled_eggs',
    description: "The dish that has saved more hungover people than aspirin. A true cultural institution.",
  },
  {
    combinations: [['milk', 'sugar']],
    result: 'sweet_milk',
    description: "Milk... but with ambitions. It's going places. Probably into something more interesting.",
  },
  {
    combinations: [['egg', 'sugar']],
    result: 'meringue_base',
    description: "Air and sugar whipped into defiance against the laws of physics. It shouldn't work, and yet.",
  },
  {
    combinations: [['butter', 'milk']],
    result: 'buttermilk',
    description: "Milk's slightly sour, slightly rebellious cousin who changed its name and moved to Brooklyn.",
  },

  // ── Tier 2: Three starting ingredients ───────────────────────

  {
    combinations: [['flour', 'egg', 'milk']],
    result: 'batter',
    description: "The universal ancestor. From this primordial gloop, all fried, baked, and pan-cooked things descend.",
  },
  {
    combinations: [['egg', 'milk', 'sugar']],
    result: 'custard_base',
    description: "Technically just enriched sadness until you cook it. Then it becomes something transcendent.",
  },
  {
    combinations: [['flour', 'water', 'salt']],
    result: 'dough',
    description: "A blank canvas. A promise. An uncooked lump of potential that judges you silently.",
  },
  {
    combinations: [['butter', 'sugar', 'flour']],
    result: 'shortcrust',
    description: "Pastry's lazy cousin. It doesn't bother to layer — it just crumbles into buttery oblivion.",
  },
  {
    combinations: [['milk', 'butter', 'salt']],
    result: 'bechamel',
    description: "France is smug about this one, and frankly, it's earned. A velvety white sauce of pure arrogance.",
  },
  {
    combinations: [['flour', 'egg', 'water']],
    result: 'pasta_dough',
    description: "Italy would like several words. All of them are passionate. All of them involve hand gestures.",
  },
  {
    combinations: [['caramel', 'milk'], ['sugar', 'butter', 'milk']],
    result: 'toffee',
    description: "Caramel went to finishing school and came out chewier and even more pleased with itself.",
  },
  {
    combinations: [['egg', 'flour', 'sugar']],
    result: 'sponge_base',
    description: "The silent backbone of celebrations everywhere. Nobody ever says 'wow, great sponge!' — and yet without it, everything falls apart.",
  },

  // ── Tier 3: Four starting ingredients ────────────────────────

  {
    combinations: [['flour', 'egg', 'milk', 'sugar']],
    result: 'waffle_batter',
    description: "Batter that dreamed of having a grid pattern. An achiever. A go-getter. A morning-person batter.",
  },

  // ── Tier 4: Milestone ingredient combos ──────────────────────

  {
    combinations: [['dough', 'yeast']],
    result: 'bread_dough',
    description: "It's alive. Legally, it counts as a pet at this point. Please treat it with respect.",
  },
  {
    combinations: [['batter', 'baking_powder']],
    result: 'pancake_batter',
    description: "Batter that grew a spine. Those little bubbles forming? That's ambition. That's breakfast happening.",
  },
  {
    combinations: [['pancake_batter', 'butter'], ['batter', 'butter', 'baking_powder']],
    result: 'pancakes',
    description: "A flat cake that society has collectively decided is acceptable for breakfast but not dessert. Nobody knows why. Nobody questions it.",
  },
  {
    combinations: [['custard_base', 'vanilla']],
    result: 'vanilla_custard',
    description: "Silky, wobbly, and judgementally yellow. It has seen things. It has opinions. It will not share them.",
  },
  {
    combinations: [['cream', 'sugar']],
    result: 'whipped_cream',
    description: "Air and fat elevated to the highest art form. An entire generation grew up putting this directly in their mouth from the can.",
  },
  {
    combinations: [['lemon', 'sugar']],
    result: 'lemon_syrup',
    description: "Sweet, sharp, and deeply passive-aggressive. It will improve your drink and then remind you it didn't have to.",
  },
  {
    combinations: [['caramel', 'butter', 'milk'], ['sugar', 'butter', 'milk']],
    result: 'butterscotch',
    description: "Like caramel, but it went to private school, summer abroad, and came back with a mid-Atlantic accent.",
  },
  {
    combinations: [['chocolate', 'cream'], ['chocolate', 'butter', 'sugar']],
    result: 'chocolate_ganache',
    description: "A glossy mirror into your own life choices. They are delicious choices. No regrets.",
  },
  {
    combinations: [['sweet_milk', 'cinnamon'], ['milk', 'cinnamon', 'sugar']],
    result: 'horchata',
    description: "A drink so good it crossed entire oceans and time zones to get to you. It would do it again.",
  },
  {
    combinations: [['chocolate', 'sweet_milk'], ['chocolate', 'milk', 'sugar']],
    result: 'hot_chocolate',
    description: "Liquid comfort. Scientists have measured its effects on morale. Results were classified because they were too powerful.",
  },
  {
    combinations: [['pasta_dough', 'egg', 'salt']],
    result: 'fresh_pasta',
    description: "Italy exhaled. A nonna somewhere nodded, once, almost imperceptibly. This is the highest praise available.",
  },
  {
    combinations: [['flour', 'water', 'salt', 'yeast']],
    result: 'bread',
    description: "Humanity's oldest flex. Entire civilizations rose and fell over this humble loaf. You did it.",
  },
  {
    combinations: [['sweet_milk', 'egg', 'vanilla'], ['egg', 'milk', 'vanilla', 'sugar']],
    result: 'french_toast_batter',
    description: "The French did not invent this. The French are deeply annoyed about it. The French will not let it go.",
  },
  {
    combinations: [['lemon', 'butter', 'egg', 'sugar']],
    result: 'lemon_curd',
    description: "Spreadable sunshine with a superiority complex. It goes on toast, scones, or directly into your mouth at 2am.",
  },

  // ── Tier 5: Chained combinations ─────────────────────────────

  {
    combinations: [['meringue_base', 'vanilla'], ['egg', 'sugar', 'vanilla']],
    result: 'pavlova',
    description: "Named after a ballerina. It's crisp on the outside, soft on the inside, and the centre of an eternal diplomatic dispute between Australia and New Zealand.",
  },
  {
    combinations: [['shortcrust', 'cheese']],
    result: 'cheese_tart',
    description: "Pastry that found its calling. The cheese is smug. The pastry is flattered. Together they are unstoppable.",
  },
  {
    combinations: [['whipped_cream', 'chocolate_ganache']],
    result: 'chocolate_mousse',
    description: "Chocolate that went to a spa, got a facial, and returned floaty and ethereal. Worth every calorie.",
  },
  {
    combinations: [['chocolate', 'cream']],
    result: 'chocolate_cream',
    description: "Two powerhouses walking into a room and immediately understanding each other. A perfect partnership. A culinary power couple.",
  },
  {
    combinations: [['caramel', 'salt'], ['caramel', 'cream', 'salt'], ['sugar', 'butter', 'salt']],
    result: 'salted_caramel',
    description: "Salt and sweet fighting for dominance. They called a truce. The truce is delicious. You win.",
  },
];
