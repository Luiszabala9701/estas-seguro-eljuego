import { describe, it, expect } from 'vitest';
import { cases } from '../src/cases';
import { startCase, choose, answerInput, resolveConfrontation, pendingConfrontation, currentScene, availableOptions } from '../src/engine/engine';
import { validateCase } from '../src/engine/validation';
import { updateProgress, emptySave, decodeSave } from '../src/engine/persistence';
import type { CaseData, GameState } from '../src/engine/types';
export const paths: Record<string, Record<string, string[]>> = {
  'habitacion-309': {
    defensa: ['entered', 'pilar-first', 'locate', 'input:boiler', 'align', 'blackmail', 'admit-room', 'remember', 'confess-force', 'find-knife', 'defense', 'formal-defense', 'finish'],
    pacto: ['entered', 'camera-first', 'place-now', 'input:boiler', 'align', 'blackmail', 'admit-room', 'reception', 'keep', 'pact-final', 'finish'],
    detencion: ['entered', 'pilar-first', 'locate', 'input:boiler', 'align', 'blackmail', 'admit-room', 'remember', 'confess-force', 'my-force', 'confess', 'finish'],
    umbral: ['denied', 'camera-first', 'place-now', 'input:street', 'ignore-clock', 'stranger', 'deny-room', 'wound', 'find-knife', 'only-proof', 'leave', 'finish']
  },
  'testigo-imposible': {
    archivo: ['screen', 'similar', 'input:projection', 'elisa', 'original', 'correct-date', 'listen', 'memory', 'admit-hide', 'admit-past', 'name-father', 'full', 'finish'],
    hermano: ['screen', 'tomas', 'input:projection', 'victim', 'check-master', 'correct-date', 'child-me', 'admit-child', 'protect-father', 'withdraw', 'finish'],
    voz: ['live', 'tomas', 'input:gallery', 'first', 'hold-date', 'double-down', 'no-child', 'deny-family', 'denial', 'insist', 'insist-final', 'finish'],
    silencio: ['uncertain', 'similar', 'input:street', 'elisa', 'original', 'challenge-date', 'refuse-date', 'listen', 'admit-child', 'protect-father', 'silence', 'finish']
  }
};
function settle(state: GameState, data: CaseData, rectify = false): GameState {
  let s = state; let guard = 0;
  while (pendingConfrontation(s)) { if (++guard > 60) throw new Error('Confrontación repetida'); s = resolveConfrontation(s, data, rectify ? 'rectify' : 'explain'); }
  return s;
}
describe.each(cases)('$title', data => {
  it('referencias, variables y salidas válidas', () => expect(validateCase(data)).toEqual([]));
  for (const [ending, actions] of Object.entries(paths[data.id] ?? {})) {
    it(`ruta a ${ending}`, () => {
      let s = startCase(data);
      for (const action of actions) { s = settle(s, data); s = action.startsWith('input:') ? answerInput(s, data, action.slice(6), 'Frase de prueba') : choose(s, data, action); }
      s = settle(s, data);
      expect(s.endingId).toBe(ending);
      const saved = emptySave(); saved.game = s; saved.progress = updateProgress(saved.progress, s, cases);
      expect(decodeSave(JSON.stringify(saved), cases).game).toEqual(s);
    });
  }
  it('100 recorridos deterministas no quedan bloqueados y alcanzan un final', () => {
    for (let seed = 1; seed <= 100; seed++) {
      let random = seed; const rng = () => { random = (random * 1664525 + 1013904223) >>> 0; return random / 4294967296; };
      let s = startCase(data); let steps = 0;
      while (!s.endingId && steps++ < 180) {
        s = settle(s, data, seed % 2 === 0);
        const scene = currentScene(s, data); const options = availableOptions(s, data);
        if (scene.input && rng() < .7) { const category = scene.input.categories[Math.floor(rng() * scene.input.categories.length)]!; s = answerInput(s, data, category.id, category.label); }
        else { expect(options.length).toBeGreaterThan(0); s = choose(s, data, options[Math.floor(rng() * options.length)]!.id); }
      }
      expect(s.endingId, `semilla ${seed}, escena ${s.sceneId}`).toBeTruthy();
      expect(s.suspicion).toBeLessThanOrEqual(100); expect(s.tension).toBeLessThanOrEqual(100);
    }
  });
});
it('un final desfavorable desbloquea el siguiente caso', () => {
  const s = startCase(cases[0]!); s.endingId = 'eco';
  const progress = updateProgress(emptySave().progress, s, cases);
  expect(progress.unlocked).toEqual(['ultima-llamada', 'habitacion-309']);
});
it('una rectificación de relación no escribe un booleano en el vínculo', () => {
  const c = cases[0]!; let s = choose(startCase(c), c, 'stranger'); s = choose(s, c, 'yes'); s = settle(s, c, true);
  expect(s.declarations.filter(d => d.fact === 'relationship').at(-1)?.value).toBe('friend');
});
