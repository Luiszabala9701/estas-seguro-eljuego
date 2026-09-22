import type { Effect, InputDomain, Option, Scene, Value } from '../engine/types';
export const say = (fact: string, value: Value): Effect => ({ type: 'declare', fact, value });
export const flag = (key: string, value: Value = true): Effect => ({ type: 'flag', key, value });
export const proof = (id: string, audience: 'both' | 'player' | 'investigator' = 'both'): Effect => ({ type: 'evidence', id, audience });
export const feel = (suspicion = 0, tension = 0): Effect => ({ type: 'adjust', suspicion, tension });
export const remember = (fact: string, value: Value, text: string): Effect => ({ type: 'remember', fact, value, text });
export const option = (id: string, text: string, to: string, effects: Effect[] = [], hint?: string): Option => ({ id, text, to, effects, hint });
export const scene = (id: string, chapter: string, time: string, text: string, options: Option[], extra: Partial<Scene> = {}): Scene => ({ id, chapter, time, text, options, kind: 'interview', ...extra });
export function locationDomain(fact: string, to: string, places: { id: string; label: string; patterns: string[]; negatedPatterns?: string[] }[]): InputDomain {
  return { prompt: 'Podés escribir un lugar, decir que no recordás o elegir no responder.', to, fallback: to, categories: [
    ...places.map(p => ({ ...p, effects: [say(fact, p.id)] })),
    { id: 'unknown', label: 'No recuerdo dónde estaba.', patterns: ['no (lo )?recuerdo', 'no (lo )?se', 'no me acuerdo'], effects: [{ type: 'declare', fact, value: 'unknown', certainty: 'uncertain' }] },
    { id: 'silence', label: 'Prefiero no responder.', patterns: ['prefiero no (responder|decirlo)', 'no quiero (responder|hablar)', 'guardar silencio'], effects: [{ type: 'declare', fact, value: 'silence', certainty: 'withheld' }] },
    { id: 'other', label: 'Otro lugar, sin especificar.', patterns: ['otro lugar', 'otra parte'], effects: [{ type: 'declare', fact, value: 'other', certainty: 'uncertain' }] }
  ] };
}
