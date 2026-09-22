import type { CaseData, GameState, Effect, Option, Value } from './types';
import { matches } from './conditions';
import { detectContradictions, pendingConfrontation } from './memory';
export { matches, pendingConfrontation };
export const currentScene = (state: GameState, data: CaseData) => {
  const scene = data.scenes.find(s => s.id === state.sceneId);
  if (!scene) throw new Error(`Escena inexistente: ${state.sceneId}`);
  return scene;
};
export const availableOptions = (state: GameState, data: CaseData) => currentScene(state, data).options.filter(o => matches(state, o.when));
const uniquePush = (items: string[], value: string) => { if (!items.includes(value)) items.push(value); };

export function applyEffects(state: GameState, data: CaseData, effects: Effect[], original: string): void {
  for (const effect of effects) {
    switch (effect.type) {
      case 'declare': {
        const certainty = effect.certainty ?? 'certain';
        state.order++;
        state.declarations.push({ id: `${state.caseId}-d${state.order}`, caseId: state.caseId, characterId: data.protagonist, questionId: state.sceneId, fact: effect.fact, value: effect.value, original, narrativeTime: currentScene(state, data).time, order: state.order, certainty, status: certainty === 'certain' ? 'active' : certainty === 'uncertain' ? 'uncertain' : 'withheld', verification: certainty !== 'certain' || !(effect.fact in data.truth) ? 'unknown' : data.truth[effect.fact] === effect.value ? 'true' : 'false', evidenceIds: [] });
        break;
      }
      case 'evidence': {
        if (!data.evidence.some(e => e.id === effect.id)) throw new Error(`Prueba desconocida: ${effect.id}`);
        const audience = effect.audience ?? 'both';
        if (audience !== 'investigator') {
          uniquePush(state.discoveredEvidence, effect.id);
          state.evidenceDiscovery[effect.id] ??= { order: state.order, time: currentScene(state, data).time };
        }
        if (audience !== 'player') uniquePush(state.investigatorEvidence, effect.id);
        break;
      }
      case 'flag': state.flags[effect.key] = effect.value; break;
      case 'adjust':
        state.suspicion = Math.max(0, Math.min(100, state.suspicion + (effect.suspicion ?? 0)));
        state.tension = Math.max(0, Math.min(100, state.tension + (effect.tension ?? 0)));
        break;
      case 'remember': state.playerKnowledge[effect.fact] = effect.value; uniquePush(state.memories, effect.text); break;
    }
  }
}
function enter(state: GameState, data: CaseData, destination: string): void {
  if (destination === '$ending') {
    const ending = data.endings.find(e => matches(state, e.when));
    if (!ending) throw new Error(`El caso ${data.id} no tiene final de respaldo.`);
    state.endingId = ending.id;
    state.phase = 'resuelto';
    return;
  }
  state.sceneId = destination;
  const scene = currentScene(state, data);
  state.phase = scene.chapter;
  uniquePush(state.visited, destination);
  applyEffects(state, data, scene.onEnter ?? [], '');
  detectContradictions(state, data);
}
export function startCase(data: CaseData): GameState {
  const state: GameState = { version: 2, caseId: data.id, sceneId: data.initialScene, phase: '', order: 0, declarations: [], contradictions: [], playerKnowledge: { ...data.initialKnowledge }, investigatorEvidence: [], discoveredEvidence: [], presentedEvidence: [], evidenceDiscovery: {}, flags: {}, suspicion: 15, tension: 20, choices: [], memories: [], visited: [] };
  enter(state, data, data.initialScene);
  return state;
}
function transition(state: GameState, data: CaseData, option: Option, original?: string): GameState {
  const next = structuredClone(state);
  next.lastReaction = undefined;
  applyEffects(next, data, option.effects ?? [], original ?? option.text);
  next.choices.push({ scene: state.sceneId, option: option.id, text: original ?? option.text, order: ++next.order });
  detectContradictions(next, data);
  const destination = typeof option.to === 'string' ? option.to : option.to.find(r => matches(next, r.when))?.to ?? option.fallback;
  if (!destination) throw new Error('Transición sin alternativa.');
  enter(next, data, destination);
  return next;
}
export function choose(state: GameState, data: CaseData, optionId: string): GameState {
  if (state.endingId || pendingConfrontation(state)) throw new Error('Resolvé primero la confrontación.');
  const option = availableOptions(state, data).find(o => o.id === optionId);
  if (!option) throw new Error('Esta respuesta no está disponible.');
  return transition(state, data, option);
}
export function answerInput(state: GameState, data: CaseData, categoryId: string, original: string): GameState {
  if (state.endingId || pendingConfrontation(state)) throw new Error('Hay una confrontación pendiente.');
  const domain = currentScene(state, data).input;
  const category = domain?.categories.find(c => c.id === categoryId);
  if (!domain || !category) throw new Error('Interpretación no válida.');
  return transition(state, data, { id: `input:${category.id}`, text: category.label, effects: category.effects, to: domain.to }, original);
}
export type Resolution = 'rectify' | 'explain' | 'challenge' | 'silence';
export function resolveConfrontation(state: GameState, data: CaseData, response: Resolution): GameState {
  const next = structuredClone(state);
  const c = pendingConfrontation(next);
  if (!c) throw new Error('No hay confrontación pendiente.');
  c.used = true;
  const first = next.declarations.find(d => d.id === c.declarationIds[0])!;
  const proof = data.evidence.find(e => e.id === c.evidenceIds[0]);
  if (response === 'rectify') {
    c.status = 'rectified'; c.explanation = 'Reconoció y rectificó su declaración. La versión original se conserva.';
    const ruleCorrection = data.rules.find(r => r.id === c.ruleId)?.rectification;
    const value: Value | undefined = ruleCorrection?.value ?? proof?.facts[c.fact] ?? next.declarations.find(d => d.fact === c.fact && d.id === c.declarationIds.at(-1) && d.id !== first?.id)?.value;
    const correctedFact = ruleCorrection?.fact ?? c.fact;
    // Rectifying a proposition replaces its active version, never its history.
    // Retire all prior versions of that fact so stale conflicts cannot re-open
    // and force an oscillation between old statements.
    if (value !== undefined) {
      for (const d of next.declarations) if (d.fact === correctedFact && d.certainty === 'certain') d.status = 'rectified';
      applyEffects(next, data, [{ type: 'declare', fact: correctedFact, value }], `Rectifico mi declaración: ${data.valueLabels[String(value)] ?? String(value)}.`);
      for (const related of next.contradictions) {
        if (related.fact === correctedFact && related.status === 'pending') {
          related.used = true; related.status = 'rectified'; related.explanation = 'Resuelta por la rectificación explícita de este hecho. Se conserva el historial.';
        }
      }
    }
    next.flags.rectified = true;
    next.suspicion = Math.max(0, next.suspicion - 3);
    next.lastReaction = 'La rectificación queda asentada. Lo que dijiste antes también. Ahora podemos seguir.';
  } else if (response === 'challenge') {
    c.status = 'unresolved'; c.explanation = 'Solicitó verificar el origen de la prueba.';
    if (proof?.challenge) {
      applyEffects(next, data, [{ type: 'evidence', id: proof.challenge.evidence }], '');
      next.lastReaction = proof.challenge.reply;
    } else next.lastReaction = 'Tu objeción queda registrada. No la voy a dar por resuelta sin otra prueba.';
    next.flags.challenged = true;
  } else if (response === 'explain') {
    c.status = 'explained'; c.explanation = 'Alegó un recuerdo incompleto. Explicación registrada, todavía no corroborada.';
    next.flags.explained = true;
    next.tension = Math.min(100, next.tension + 5);
    next.lastReaction = 'Puede ser un recuerdo incompleto. Lo anoto como explicación pendiente; no como un hecho comprobado.';
  } else {
    c.status = 'unresolved'; c.explanation = 'Eligió no responder a esta confrontación.';
    next.tension = Math.min(100, next.tension + 8);
    next.lastReaction = 'El silencio no resuelve la diferencia. Tampoco prueba que seas culpable.';
  }
  next.choices.push({ scene: state.sceneId, option: `confront:${response}`, text: c.explanation ?? '', order: ++next.order });
  // Each factual conflict affects suspicion once, when actually confronted.
  next.suspicion = Math.min(100, next.suspicion + (response === 'rectify' ? 2 : 7));
  detectContradictions(next, data);
  return next;
}
export function presentEvidence(state: GameState, data: CaseData, evidenceId: string): GameState {
  if (!state.discoveredEvidence.includes(evidenceId) || state.endingId) throw new Error('Esta prueba no está disponible.');
  const next = structuredClone(state);
  const interaction = currentScene(next, data).presentation?.[evidenceId];
  const key = `presented:${state.sceneId}:${evidenceId}`;
  uniquePush(next.investigatorEvidence, evidenceId);
  uniquePush(next.presentedEvidence, evidenceId);
  if (interaction && !next.flags[key]) {
    applyEffects(next, data, interaction.effects, '');
    next.flags[key] = true;
    next.lastReaction = interaction.reply;
  } else next.lastReaction = interaction ? 'Ya incorporamos esa prueba a esta parte de la declaración.' : 'La incorporo al expediente, pero por sí sola no responde a lo que estamos reconstruyendo ahora.';
  detectContradictions(next, data);
  return next;
}
