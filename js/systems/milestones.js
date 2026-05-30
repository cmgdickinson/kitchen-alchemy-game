import { MILESTONES } from '../data/milestones.js';
import { getState, setState } from './state.js';

export function checkMilestones() {
  const state = getState();
  const triggered = [];

  for (const milestone of MILESTONES) {
    if (state.triggeredMilestones.includes(milestone.id)) continue;
    const { type, count } = milestone.condition;
    const met =
      type === 'discoveries' ? state.discoveredRecipes.length >= count :
      type === 'orders'      ? state.completedOrders >= count :
      false;
    if (met) {
      triggered.push(milestone);
      state.triggeredMilestones.push(milestone.id);
      if (!state.unlockedItems.includes(milestone.reward.id)) {
        state.unlockedItems.push(milestone.reward.id);
      }
    }
  }

  if (triggered.length > 0) {
    setState({
      unlockedItems: state.unlockedItems,
      triggeredMilestones: state.triggeredMilestones,
    });
  }
  return triggered;
}
