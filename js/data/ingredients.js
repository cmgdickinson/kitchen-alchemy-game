// Every item that can appear in the pantry.
// unlockType: 'start' | 'milestone' | 'recipe'
// orderable: whether customers can request this item
export const INGREDIENTS = {

  // ── Starting ingredients ──────────────────────────────────────
  water:    { name: 'Water',           emoji: '💧', unlockType: 'start',     orderable: false },
  egg:      { name: 'Egg',             emoji: '🥚', unlockType: 'start',     orderable: false },
  milk:     { name: 'Milk',            emoji: '🥛', unlockType: 'start',     orderable: false },
  flour:    { name: 'Flour',           emoji: '🌾', unlockType: 'start',     orderable: false },
  sugar:    { name: 'Sugar',           emoji: '🍬', unlockType: 'start',     orderable: false },
  butter:   { name: 'Butter',          emoji: '🧈', unlockType: 'start',     orderable: false },
  salt:     { name: 'Salt',            emoji: '🧂', unlockType: 'start',     orderable: false },

  // ── Milestone unlocks ─────────────────────────────────────────
  yeast:         { name: 'Yeast',           emoji: '🧫', unlockType: 'milestone', orderable: false },
  vanilla:       { name: 'Vanilla Extract', emoji: '🌿', unlockType: 'milestone', orderable: false },
  chocolate:     { name: 'Chocolate',       emoji: '🍫', unlockType: 'milestone', orderable: false },
  cheese:        { name: 'Cheese',          emoji: '🧀', unlockType: 'milestone', orderable: false },
  cream:         { name: 'Cream',           emoji: '🫙', unlockType: 'milestone', orderable: false },
  baking_powder: { name: 'Baking Powder',   emoji: '🥄', unlockType: 'milestone', orderable: false },
  cinnamon:      { name: 'Cinnamon',        emoji: '🫚', unlockType: 'milestone', orderable: false },
  lemon:         { name: 'Lemon',           emoji: '🍋', unlockType: 'milestone', orderable: false },

  // ── Recipe results ────────────────────────────────────────────
  paste:               { name: 'Paste',               emoji: '🪣', unlockType: 'recipe', orderable: false },
  egg_wash:            { name: 'Egg Wash',             emoji: '✨', unlockType: 'recipe', orderable: false },
  caramel:             { name: 'Caramel',              emoji: '🍮', unlockType: 'recipe', orderable: true  },
  scrambled_eggs:      { name: 'Scrambled Eggs',       emoji: '🍳', unlockType: 'recipe', orderable: true  },
  sweet_milk:          { name: 'Sweet Milk',           emoji: '🍼', unlockType: 'recipe', orderable: false },
  meringue_base:       { name: 'Meringue Base',        emoji: '☁️', unlockType: 'recipe', orderable: false },
  buttermilk:          { name: 'Buttermilk',           emoji: '🫗', unlockType: 'recipe', orderable: false },
  batter:              { name: 'Batter',               emoji: '🥣', unlockType: 'recipe', orderable: false },
  custard_base:        { name: 'Custard Base',         emoji: '🫕', unlockType: 'recipe', orderable: false },
  dough:               { name: 'Dough',                emoji: '🫓', unlockType: 'recipe', orderable: false },
  shortcrust:          { name: 'Shortcrust',           emoji: '🥧', unlockType: 'recipe', orderable: false },
  bechamel:            { name: 'Béchamel',             emoji: '🍲', unlockType: 'recipe', orderable: true  },
  pasta_dough:         { name: 'Pasta Dough',          emoji: '🌀', unlockType: 'recipe', orderable: false },
  toffee:              { name: 'Toffee',               emoji: '🍭', unlockType: 'recipe', orderable: true  },
  sponge_base:         { name: 'Sponge Base',          emoji: '🎂', unlockType: 'recipe', orderable: false },
  bread:               { name: 'Bread',                emoji: '🍞', unlockType: 'recipe', orderable: true  },
  french_toast_batter: { name: 'French Toast Batter',  emoji: '🥐', unlockType: 'recipe', orderable: true  },
  lemon_curd:          { name: 'Lemon Curd',           emoji: '💛', unlockType: 'recipe', orderable: true  },
  waffle_batter:       { name: 'Waffle Batter',        emoji: '🧇', unlockType: 'recipe', orderable: true  },
  bread_dough:         { name: 'Bread Dough',          emoji: '🫔', unlockType: 'recipe', orderable: false },
  pancake_batter:      { name: 'Pancake Batter',       emoji: '🫙', unlockType: 'recipe', orderable: false },
  pancakes:            { name: 'Pancakes',             emoji: '🥞', unlockType: 'recipe', orderable: true  },
  vanilla_custard:     { name: 'Vanilla Custard',      emoji: '🍮', unlockType: 'recipe', orderable: true  },
  butterscotch:        { name: 'Butterscotch',         emoji: '🍯', unlockType: 'recipe', orderable: true  },
  chocolate_ganache:   { name: 'Chocolate Ganache',    emoji: '🫘', unlockType: 'recipe', orderable: true  },
  whipped_cream:       { name: 'Whipped Cream',        emoji: '🍦', unlockType: 'recipe', orderable: true  },
  horchata:            { name: 'Horchata',             emoji: '🥤', unlockType: 'recipe', orderable: true  },
  hot_chocolate:       { name: 'Hot Chocolate',        emoji: '☕', unlockType: 'recipe', orderable: true  },
  lemon_syrup:         { name: 'Lemon Syrup',          emoji: '🍋', unlockType: 'recipe', orderable: false },
  fresh_pasta:         { name: 'Fresh Pasta',          emoji: '🍝', unlockType: 'recipe', orderable: true  },
  pavlova:             { name: 'Pavlova',              emoji: '🍰', unlockType: 'recipe', orderable: true  },
  cheese_tart:         { name: 'Cheese Tart',          emoji: '🫕', unlockType: 'recipe', orderable: true  },
  chocolate_mousse:    { name: 'Chocolate Mousse',     emoji: '🍫', unlockType: 'recipe', orderable: true  },
  salted_caramel:      { name: 'Salted Caramel',       emoji: '🍮', unlockType: 'recipe', orderable: true  },
  chocolate_cream:     { name: 'Chocolate Cream',      emoji: '🎂', unlockType: 'recipe', orderable: true  },
};

// The seven ingredients a new game starts with. Derived from INGREDIENTS so this
// list stays in sync automatically when ingredients are added or re-categorized
// — there's only one place to update.
//
// Object.keys() returns an object's keys as an array, in the order they were
// inserted (for string keys). Then .filter() walks that array and keeps only
// the ids whose unlockType is 'start'. The arrow function `id => ...` is
// shorthand for `function(id) { return ...; }`.
export const STARTING_ITEMS = Object.keys(INGREDIENTS).filter(
  id => INGREDIENTS[id].unlockType === 'start'
);
