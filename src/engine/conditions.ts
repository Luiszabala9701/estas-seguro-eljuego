import type { Condition, GameState } from './types';
export function matches(state: GameState, condition?: Condition): boolean {
  if (!condition) return true;
  if ('all' in condition) return condition.all.every(c => matches(state, c));
  if ('any' in condition) return condition.any.some(c => matches(state, c));
  if ('not' in condition) return !matches(state, condition.not);
  if ('flag' in condition) return state.flags[condition.flag] === condition.eq;
  if ('claim' in condition) {
    const claims = state.declarations.filter(d => d.fact === condition.claim && d.certainty === 'certain');
    return condition.ever ? claims.some(d => d.value === condition.eq) : claims.at(-1)?.value === condition.eq;
  }
  if ('evidence' in condition) return (condition.audience === 'investigator' ? state.investigatorEvidence : state.discoveredEvidence).includes(condition.evidence);
  if ('visited' in condition) return state.visited.includes(condition.visited);
  return state[condition.stat] >= condition.gte;
}
