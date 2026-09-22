import { describe, it, expect } from 'vitest';
import { lastCall } from '../src/cases/last-call';
import { startCase, choose, answerInput, applyEffects, pendingConfrontation, resolveConfrontation, presentEvidence, availableOptions } from '../src/engine/engine';
import { detectContradictions } from '../src/engine/memory';
import { interpret } from '../src/engine/interpreter';
import { validateCase } from '../src/engine/validation';
import { decodeSave, emptySave, load, save, SAVE_KEY, BACKUP_KEY, updateProgress, type StorageLike } from '../src/engine/persistence';
import type { CaseData, GameState } from '../src/engine/types';
import { achievements, caseCompletion } from '../src/achievements';
const domain = lastCall.scenes.find(s => s.id === 'location')!.input!;
export function settle(s: GameState, c = lastCall): GameState {
  let count = 0; while (pendingConfrontation(s)) { if (++count > 40) throw new Error('Bucle de confrontaciones'); s = resolveConfrontation(s, c, 'explain'); } return s;
}
export function route(data: CaseData, actions: string[]): GameState {
  let s = startCase(data);
  for (const action of actions) {
    s = settle(s, data);
    s = action.startsWith('input:') ? answerInput(s, data, action.slice(6), action) : choose(s, data, action);
  }
  return s;
}
describe('interpretación acotada', () => {
  it.each(['Estaba en mi casa', 'Me quedé en casa', 'No salí de mi domicilio', '  EN MÍ CÁSA!!!  '])('equivalencia: %s', text => {
    const result = interpret(text, domain); expect(result.kind).toBe('recognized'); if (result.kind === 'recognized') expect(result.category.id).toBe('home');
  });
  it.each(['No estaba en casa', 'Nunca estuve en el taller', 'No fui al trabajo', 'Tampoco estaba en casa'])('no inventa afirmación: %s', text => { expect(interpret(text, domain).kind).toBe('unknown'); });
  it.each(['En casa o en el taller', 'Creo que estaba en casa', 'Tal vez en el taller'])('aclara ambigüedad: %s', text => { expect(interpret(text, domain).kind).toBe('ambiguous'); });
  it('distingue el silencio de una negación', () => { const r = interpret('Prefiero no responder', domain); expect(r.kind).toBe('recognized'); if (r.kind === 'recognized') expect(r.category.id).toBe('silence'); });
  it('no inventa hechos para texto libre desconocido', () => { expect(interpret('El color del aire fue un sábado', domain).kind).toBe('unknown'); });
  it('pide aclaración cuando se afirma y niega el mismo lugar', () => { expect(interpret('No estaba en el taller. Estaba en el taller.', domain).kind).toBe('ambiguous'); });
});
describe('motor de memoria', () => {
  it('valida la estructura del primer caso', () => expect(validateCase(lastCall)).toEqual([]));
  it('no usa la verdad objetiva como conocimiento del investigador', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'contact', value: false }], 'No lo atendí.'); detectContradictions(s, lastCall);
    expect(s.declarations[0]?.verification).toBe('false'); expect(s.contradictions).toHaveLength(0); expect(s.suspicion).toBe(15);
    applyEffects(s, lastCall, [{ type: 'evidence', id: 'phone', audience: 'player' }], ''); detectContradictions(s, lastCall); expect(s.contradictions).toHaveLength(0);
    const next = presentEvidence(s, lastCall, 'phone'); expect(next.contradictions).toHaveLength(1);
  });
  it('confronta afirmaciones incompatibles y conserva ambas', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'contact', value: false }, { type: 'declare', fact: 'contact', value: true }], 'Mi versión'); detectContradictions(s, lastCall);
    expect(s.contradictions[0]?.type).toBe('logical'); const next = resolveConfrontation(s, lastCall, 'rectify'); expect(next.declarations).toHaveLength(3); expect(next.declarations[0]?.status).toBe('rectified'); expect(pendingConfrontation(next)).toBeUndefined();
  });
  it('no confronta recuerdos inciertos ni respuestas compatibles', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'contact', value: false, certainty: 'uncertain' }, { type: 'declare', fact: 'contact', value: true }, { type: 'declare', fact: 'contact', value: true }, { type: 'evidence', id: 'phone' }], 'Recuerdo'); detectContradictions(s, lastCall); expect(s.contradictions).toHaveLength(0);
  });
  it('distingue un testigo no fiable', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'leftAlone', value: false }, { type: 'evidence', id: 'neighbor' }], 'Con Mateo'); detectContradictions(s, lastCall); expect(s.contradictions[0]?.status).toBe('insufficient'); expect(pendingConfrontation(s)).toBeUndefined();
  });
  it('no repite una confrontación y no borra una explicación', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'contact', value: false }, { type: 'evidence', id: 'phone' }], 'No'); detectContradictions(s, lastCall); const next = resolveConfrontation(s, lastCall, 'explain'); detectContradictions(next, lastCall); expect(next.contradictions).toHaveLength(1); expect(pendingConfrontation(next)).toBeUndefined(); expect(next.contradictions[0]?.explanation).toContain('no corroborada');
  });
  it('consultar la procedencia desbloquea una prueba', () => {
    const s = startCase(lastCall); applyEffects(s, lastCall, [{ type: 'declare', fact: 'contact', value: false }, { type: 'evidence', id: 'phone' }], 'No'); detectContradictions(s, lastCall); const next = resolveConfrontation(s, lastCall, 'challenge'); expect(next.discoveredEvidence).toContain('custody');
  });
  it('presentar una prueba depende del contexto y no acumula efectos', () => {
    let s = route(lastCall, ['friend', 'yes', 'input:workshop', 'admit', 'recorder', 'open', 'hold']); expect(s.sceneId).toBe('trust'); s = presentEvidence(s, lastCall, 'accounts'); expect(s.flags.protection).toBe(true); expect(s.investigatorEvidence).toContain('accounts'); const before = s.declarations.length; s = presentEvidence(s, lastCall, 'accounts'); expect(s.declarations).toHaveLength(before); expect(s.lastReaction).toContain('Ya incorporamos');
  });
  it('no vuelve a ofrecer una respuesta ya elegida', () => {
    let s = choose(startCase(lastCall), lastCall, 'friend');
    s.sceneId = lastCall.initialScene;
    expect(availableOptions(s, lastCall).map(option => option.id)).not.toContain('friend');
    expect(s.sceneVisits[lastCall.initialScene]).toBe(1);
  });
});
describe('cuatro finales del primer caso', () => {
  const common = ['friend', 'yes', 'input:workshop', 'admit', 'recorder'];
  it.each([
    ['alba', [...common, 'open', 'share', 'trust', 'find', 'safe', 'finish']],
    ['fuga', [...common, 'north', 'find', 'escape', 'finish']],
    ['custodia', [...common, 'north', 'responsibility', 'sign', 'finish']],
    ['eco', [...common, 'north', 'stop', 'finish']]
  ])('%s es alcanzable por decisiones', (id, actions) => { const s = route(lastCall, actions as string[]); expect(s.endingId).toBe(id); });
  it('cada escena tiene alternativas', () => { for (const scene of lastCall.scenes) { const s = startCase(lastCall); s.sceneId = scene.id; expect(availableOptions(s, lastCall).length).toBeGreaterThan(0); } });
});
describe('persistencia', () => {
  const memory = (): StorageLike => { const values = new Map<string, string>(); return { getItem: key => values.get(key) ?? null, setItem: (k,v) => { values.set(k,v); }, removeItem: key => { values.delete(key); } }; };
  it('restaura una partida completa sin cambiar el historial', () => {
    const s = emptySave(); s.game = route(lastCall, ['stranger', 'yes', 'input:home']); const store = memory(); save(store, s); expect(load(store, [lastCall]).data.game).toEqual(s.game);
  });
  it('recupera una copia cuando falla la escritura principal', () => { const s = emptySave(); s.game = startCase(lastCall); const store = memory(); save(store, s); save(store, s); store.setItem(SAVE_KEY, '{'); expect(load(store, [lastCall]).data.game).toEqual(s.game); expect(load(store, [lastCall]).warning).toContain('copia'); });
  it('preserva datos ilegibles sin sobrescribir', () => { const store = memory(); store.setItem(SAVE_KEY, '{'); expect(load(store, [lastCall]).blocked).toBe(true); expect(store.getItem(SAVE_KEY)).toBe('{'); });
  it('migra v1', () => { const s = emptySave(); const old: Record<string, unknown> = structuredClone(s) as unknown as Record<string, unknown>; old.version = 1; expect(decodeSave(JSON.stringify(old), [lastCall]).version).toBe(2); });
  it('rechaza futuras versiones, escenas inexistentes y memoria corrupta', () => { const s = emptySave(); expect(() => decodeSave(JSON.stringify({ ...s, version: 99 }), [lastCall])).toThrow(); s.game = startCase(lastCall); s.game.sceneId = 'missing'; expect(() => decodeSave(JSON.stringify(s), [lastCall])).toThrow(); s.game = startCase(lastCall); (s.game as unknown as Record<string, unknown>).declarations = [{}]; expect(() => decodeSave(JSON.stringify(s), [lastCall])).toThrow(); });
  it('conserva hallazgos al repetir', () => { const game = route(lastCall, ['friend', 'yes', 'input:workshop', 'admit', 'recorder', 'north', 'stop', 'finish']); const progress = updateProgress(emptySave().progress, game, [lastCall]); const updated = updateProgress(progress, startCase(lastCall), [lastCall]); expect(updated.endings[lastCall.id]).toEqual(['eco']); expect(updated.evidence[lastCall.id]).toContain('tape'); });
  it('advierte cuando el almacenamiento está deshabilitado', () => { const store: StorageLike = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() {} }; expect(load(store, [lastCall]).warning).toContain('no permite guardar'); });
  it('no reemplaza un guardado futuro por un respaldo antiguo', () => { const store = memory(); store.setItem(SAVE_KEY, JSON.stringify({ version: 99 })); store.setItem(BACKUP_KEY, JSON.stringify(emptySave())); expect(load(store, [lastCall]).blocked).toBe(true); expect(store.getItem(SAVE_KEY)).toContain('99'); });
});
describe('logros', () => {
  it('se derivan de finales y pruebas guardados', () => {
    const progress = emptySave().progress;
    progress.endings[lastCall.id] = lastCall.endings.map(ending => ending.id);
    progress.evidence[lastCall.id] = lastCall.evidence.map(evidence => evidence.id);
    expect(caseCompletion(progress, lastCall).complete).toBe(true);
    expect(achievements(progress, [lastCall]).filter(item => item.unlocked)).toHaveLength(lastCall.endings.length + 2);
  });
});
