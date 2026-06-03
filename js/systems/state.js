import { STARTING_ITEMS } from '../data/ingredients.js';

const DEFAULT_STATE = {
  coins: 0,
  unlockedItems: [...STARTING_ITEMS],
  discoveredRecipes: [],
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
