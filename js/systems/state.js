import { STARTING_ITEMS } from '../data/ingredients.js';

const DEFAULT_STATE = {
  coins: 0,
  unlockedItems: [...STARTING_ITEMS],
  // { [result]: combinationKey[] }. Use getDiscoveredRecipes() for the recipe list.
  discoveredCombinations: {},
  triggeredMilestones: [],
  completedOrders: 0,
};

const STORAGE_KEY = 'kitchen-alchemy-v1';

// Object.freeze is shallow; this recurses to lock nested arrays/objects too.
function deepFreeze(obj) {
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object') deepFreeze(v);
  }
  return Object.freeze(obj);
}

let _state = deepFreeze(structuredClone(DEFAULT_STATE));

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields survive version upgrades.
      _state = deepFreeze({ ...DEFAULT_STATE, ...parsed });
      return;
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  _state = deepFreeze(structuredClone(DEFAULT_STATE));
}

// Don't hold a getState() result across a setState — setState replaces _state,
// so old references go stale.
export function getState() {
  return _state;
}

// Memoised: the discoveredCombinations reference only changes when discoveries
// actually change (setState's spread carries it through unchanged otherwise),
// so the cache stays valid across unrelated state changes.
let _cachedDiscoveredRecipes = null;
let _cachedDiscoveredCombinations = null;
export function getDiscoveredRecipes() {
  if (_state.discoveredCombinations !== _cachedDiscoveredCombinations) {
    _cachedDiscoveredRecipes = Object.keys(_state.discoveredCombinations);
    _cachedDiscoveredCombinations = _state.discoveredCombinations;
  }
  return _cachedDiscoveredRecipes;
}

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
