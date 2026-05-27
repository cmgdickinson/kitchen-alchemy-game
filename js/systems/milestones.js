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
      const newUnlocked = [...state.unlockedItems];
      if (!newUnlocked.includes(milestone.reward.id)) {
        newUnlocked.push(milestone.reward.id);
      }
      setState({
        unlockedItems: newUnlocked,
        triggeredMilestones: [...state.triggeredMilestones, milestone.id],
      });
    }
  }

  return triggered;
}
