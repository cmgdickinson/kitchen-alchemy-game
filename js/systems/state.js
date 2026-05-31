const STARTING_ITEMS = ['water', 'egg', 'milk', 'flour', 'sugar', 'butter', 'salt'];

const DEFAULT_STATE = {
  coins: 0,
  unlockedItems: [...STARTING_ITEMS],
  discoveredRecipes: [],
  triggeredMilestones: [],
  completedOrders: 0,
};

const STORAGE_KEY = 'kitchen-alchemy-v1';

let _state = structuredClone(DEFAULT_STATE);

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields survive version upgrades
      _state = { ...DEFAULT_STATE, ...parsed };
      return;
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  _state = structuredClone(DEFAULT_STATE);
}

export function getState() {
  return structuredClone(_state);
}

export function setState(patch) {
  Object.assign(_state, patch);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function resetState() {
  _state = structuredClone(DEFAULT_STATE);
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to remove state from localStorage:', e);
  }
}
