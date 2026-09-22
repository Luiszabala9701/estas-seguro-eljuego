import type { CaseData, Contradiction, GameState } from './types';
import { matches } from './conditions';
export function detectContradictions(state: GameState, data: CaseData): void {
  const add = (c: Contradiction) => {
    if (!state.contradictions.some(existing => existing.id === c.id)) state.contradictions.push(c);
  };
  for (const current of state.declarations) {
    if (current.certainty !== 'certain' || current.status === 'rectified') continue;
    for (const previous of state.declarations) {
      if (previous.order >= current.order || previous.fact !== current.fact || previous.value === current.value || previous.certainty !== 'certain') continue;
      // An explicit rectification preserves the earlier assertion, without accusing
      // the player again of the same correction.
      if (previous.status === 'rectified') continue;
      add({ id: `claims:${previous.id}:${current.id}`, type: 'logical', fact: current.fact, declarationIds: [previous.id, current.id], evidenceIds: [], description: `Tu versión sobre ${data.factLabels[current.fact] ?? current.fact} cambió. Las dos afirmaciones no pueden ser ciertas a la vez.`, used: false, status: 'pending' });
    }
    for (const evidence of data.evidence) {
      if (!state.investigatorEvidence.includes(evidence.id) || !(current.fact in evidence.facts)) continue;
      if (!current.evidenceIds.includes(evidence.id)) current.evidenceIds.push(evidence.id);
      if (evidence.facts[current.fact] === current.value) continue;
      const possible = evidence.reliability === 'disputed';
      add({ id: `proof:${current.id}:${evidence.id}`, type: possible ? 'possible' : 'evidence', fact: current.fact, declarationIds: [current.id], evidenceIds: [evidence.id], description: possible ? `«${evidence.title}» no coincide con tu versión, pero su fiabilidad está en discusión. No es una contradicción confirmada.` : `«${evidence.title}» contradice tu declaración sobre ${data.factLabels[current.fact] ?? current.fact}.`, used: false, status: possible ? 'insufficient' : 'pending' });
    }
  }
  for (const rule of data.rules) {
    if (!matches(state, rule.when)) continue;
    const ids = rule.facts.map(f => state.declarations.filter(d => d.fact === f && d.certainty === 'certain').at(-1)?.id).filter((id): id is string => !!id);
    add({ id: `rule:${rule.id}:${ids.join(':')}`, ruleId: rule.id, type: rule.kind, fact: rule.facts[0]!, declarationIds: ids, evidenceIds: [], description: rule.description, used: false, status: 'pending' });
  }
}
export const pendingConfrontation = (state: GameState): Contradiction | undefined => state.contradictions.find(c => c.status === 'pending' && !c.used);
