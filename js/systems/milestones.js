import { MILESTONES } from '../data/milestones.js';
import { getState, setState, getDiscoveredRecipes } from './state.js';

export function checkMilestones() {
  const state = getState();
  const discoveredCount = getDiscoveredRecipes().length;
  const triggered = [];

  // We collect the new ids/rewards in separate arrays, then build the new
  // state arrays once at the end. This is necessary because getState() returns
  // a frozen object — we can't push directly into state.triggeredMilestones or
  // state.unlockedItems.
  const newlyTriggeredIds = [];
  const newlyUnlocked = [];

  for (const milestone of MILESTONES) {
    if (state.triggeredMilestones.includes(milestone.id)) continue;
    const { type, count } = milestone.condition;
    const met =
      type === 'discoveries' ? discoveredCount >= count :
      type === 'orders'      ? state.completedOrders >= count :
      false;
    if (met) {
      triggered.push(milestone);
      newlyTriggeredIds.push(milestone.id);
      // Guard against the reward being already unlocked (e.g. via a recipe
      // earlier) or being the same as another reward triggered in this same
      // pass — preserves the original behaviour of not double-adding.
      if (!state.unlockedItems.includes(milestone.reward)
          && !newlyUnlocked.includes(milestone.reward)) {
        newlyUnlocked.push(milestone.reward);
      }
    }
  }

  if (triggered.length > 0) {
    setState({
      unlockedItems: [...state.unlockedItems, ...newlyUnlocked],
      triggeredMilestones: [...state.triggeredMilestones, ...newlyTriggeredIds],
    });
  }
  return triggered;
}
