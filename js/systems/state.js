import { STARTING_ITEMS } from '../data/ingredients.js';

const DEFAULT_STATE = {
  coins: 0,
  unlockedItems: [...STARTING_ITEMS],
  // discoveredCombinations: { [result]: string[] } where each string is a
  // combinationKey(...). A recipe counts as "discovered" iff this object has
  // a non-empty array for its result — derived via getDiscoveredRecipes().
  discoveredCombinations: {},
  triggeredMilestones: [],
  completedOrders: 0,
};

const STORAGE_KEY = 'kitchen-alchemy-v1';

// Recursively freezes obj and every nested object/array.
//
// Object.freeze locks the top-level only — without this helper,
// `frozen.items.push(...)` would still work because the array itself isn't
// frozen, only the property pointing to it. We walk Object.values once,
// freezing every nested object/array, then freeze the parent on the way back.
// Already-frozen objects are safe to re-freeze (Object.freeze is a no-op on
// them), so deepFreeze can run on a state object whose old arrays are carried
// over from a previous state without issue.
function deepFreeze(obj) {
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') deepFreeze(v);
  }
  return Object.freeze(obj);
}

// _state is always a deep-frozen object. We replace it (rather than mutate it)
// on every setState/loadState/resetState — see comments on those functions.
let _state = deepFreeze(structuredClone(DEFAULT_STATE));

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields survive version upgrades
      _state = deepFreeze({ ...DEFAULT_STATE, ...parsed });
      return;
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  _state = deepFreeze(structuredClone(DEFAULT_STATE));
}

// Returns the current state as a frozen reference — no clone.
//
// Callers must treat the result as read-only; mutations throw TypeError in
// strict mode (which ES modules use by default). To change state, build a
// patch object and call setState.
//
// Don't hold onto a getState() result across a setState boundary — the
// underlying object is replaced, not mutated, so an old reference is stale.
// Re-read via getState() whenever you need fresh state.
export function getState() {
  return _state;
}

// Derived: the list of result IDs the player has discovered at least one
// combination for. Order is insertion order into discoveredCombinations,
// which matches chronological discovery order.
//
// Memoised against the discoveredCombinations reference. setState replaces
// the whole _state on every call, but the inner discoveredCombinations
// reference only changes when discoveries actually change (patches that
// don't touch it carry the previous reference through via spread). Same
// memoisation idiom used in recipeBook.js and main.js for hint counts.
let _cachedDiscoveredRecipes = null;
let _cachedDiscoveredCombinations = null;
export function getDiscoveredRecipes() {
  if (_state.discoveredCombinations !== _cachedDiscoveredCombinations) {
    _cachedDiscoveredRecipes = Object.keys(_state.discoveredCombinations);
    _cachedDiscoveredCombinations = _state.discoveredCombinations;
  }
  return _cachedDiscoveredRecipes;
}

// Replaces _state with a new frozen object combining the previous state and
// the patch. Spread `{..._state, ...patch}` makes a fresh shallow copy: keys
// in patch overwrite the old values, keys absent from patch carry over.
export function setState(patch) {
  _state = deepFreeze({ ..._state, ...patch });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function resetState() {
  _state = deepFreeze(structuredClone(DEFAULT_STATE));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove state from localStorage:', e);
  }
}
