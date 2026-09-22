import type { CaseData, GameState, Progress, SaveData, Settings } from './types';
export const SAVE_KEY = 'estas-seguro.save';
export const BACKUP_KEY = `${SAVE_KEY}.backup`;
export const defaultSettings = (): Settings => ({ audio: false, volume: 35, reducedMotion: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches, instantText: false, showStats: false, textSize: 'normal' });
export const defaultProgress = (): Progress => ({ unlocked: ['ultima-llamada'], completed: [], endings: {}, evidence: {}, scenes: {} });
export const emptySave = (): SaveData => ({ version: 2, savedAt: '', game: null, progress: defaultProgress(), settings: defaultSettings() });
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
const primitiveRecord = (v: unknown) => record(v) && Object.values(v).every(x => ['boolean', 'number', 'string'].includes(typeof x));
const stringLists = (v: unknown) => record(v) && Object.values(v).every(strings);

export function decodeSave(raw: string, cases: CaseData[]): SaveData {
  const parsed: unknown = JSON.parse(raw);
  if (!record(parsed)) throw new Error('El guardado no tiene un formato válido.');
  if (parsed.version === 1) {
    // v1 prototype persisted the same core model but lacked discovery times,
    // per-case scene history and the large-text preference.
    parsed.version = 2;
    if (record(parsed.settings)) parsed.settings = { ...defaultSettings(), ...parsed.settings };
    if (record(parsed.progress)) parsed.progress = { ...defaultProgress(), ...parsed.progress };
    if (record(parsed.game)) parsed.game = { ...parsed.game, version: 2, evidenceDiscovery: parsed.game.evidenceDiscovery ?? {}, sceneVisits: parsed.game.sceneVisits ?? Object.fromEntries((strings(parsed.game.visited) ? parsed.game.visited : []).map(id => [id, 1])) };
  }
  if (parsed.version !== 2) throw new Error('Este guardado pertenece a otra versión. Se conserva sin sobrescribir.');
  // Early v2 saves predate visit counters. Rebuild the minimum compatible
  // value from their unique scene history without discarding the save.
  if (record(parsed.game) && !record(parsed.game.sceneVisits)) parsed.game.sceneVisits = Object.fromEntries((strings(parsed.game.visited) ? parsed.game.visited : []).map(id => [id, 1]));
  const p = parsed.progress; const s = parsed.settings;
  if (!record(p) || !strings(p.unlocked) || !strings(p.completed) || !stringLists(p.endings) || !stringLists(p.evidence) || !stringLists(p.scenes)) throw new Error('El progreso está incompleto.');
  if (!record(s) || !['audio', 'reducedMotion', 'instantText', 'showStats'].every(k => typeof s[k] === 'boolean') || typeof s.volume !== 'number' || !Number.isFinite(s.volume) || s.volume < 0 || s.volume > 100 || !['normal', 'large'].includes(String(s.textSize))) throw new Error('Las opciones están dañadas.');
  if (parsed.game !== null) validateGame(parsed.game, cases);
  const result = parsed as unknown as SaveData;
  // Validate progress IDs too; stale scene/ending identifiers must not surface as
  // false unlocks or break the archive.
  for (const id of [...result.progress.unlocked, ...result.progress.completed]) if (!cases.some(c => c.id === id)) throw new Error('Caso guardado no disponible.');
  for (const [caseId, ids] of Object.entries(result.progress.endings)) if (!cases.some(c => c.id === caseId && ids.every(id => c.endings.some(e => e.id === id)))) throw new Error('Final guardado no disponible.');
  for (const [caseId, ids] of Object.entries(result.progress.evidence)) if (!cases.some(c => c.id === caseId && ids.every(id => c.evidence.some(e => e.id === id)))) throw new Error('Prueba guardada no disponible.');
  // Content expansions inherit the sequential unlock earned by completing the
  // former last case, so existing players do not need to replay it.
  for (const completedId of result.progress.completed) {
    const following = cases[cases.findIndex(c => c.id === completedId) + 1];
    if (following && !result.progress.unlocked.includes(following.id)) result.progress.unlocked.push(following.id);
  }
  return result;
}
function validateGame(value: unknown, cases: CaseData[]): asserts value is GameState {
  if (!record(value)) throw new Error('Partida incompleta.');
  const data = cases.find(c => c.id === value.caseId);
  if (!data || value.version !== 2 || !data.scenes.some(s => s.id === value.sceneId)) throw new Error('La escena guardada no existe.');
  if (value.endingId !== undefined && !data.endings.some(e => e.id === value.endingId)) throw new Error('El final guardado no existe.');
  if (!['suspicion', 'tension', 'order'].every(k => typeof value[k] === 'number' && Number.isFinite(value[k]) && (value[k] as number) >= 0)) throw new Error('Variables de partida dañadas.');
  if (!primitiveRecord(value.flags) || !primitiveRecord(value.playerKnowledge) || !record(value.evidenceDiscovery) || !record(value.sceneVisits) || !Object.values(value.sceneVisits).every(count => typeof count === 'number' && Number.isInteger(count) && count >= 1) || typeof value.phase !== 'string') throw new Error('Memoria de partida dañada.');
  for (const key of ['investigatorEvidence', 'discoveredEvidence', 'presentedEvidence']) if (!strings(value[key]) || !(value[key] as string[]).every(id => data.evidence.some(e => e.id === id))) throw new Error('Pruebas de partida dañadas.');
  if (!strings(value.visited) || !value.visited.every(id => data.scenes.some(s => s.id === id)) || !strings(value.memories)) throw new Error('Escenas de partida dañadas.');
  if (!Array.isArray(value.declarations) || !value.declarations.every(d => record(d) && typeof d.id === 'string' && typeof d.fact === 'string' && typeof d.original === 'string' && typeof d.order === 'number' && typeof d.narrativeTime === 'string' && ['certain', 'uncertain', 'withheld'].includes(String(d.certainty)) && ['active', 'rectified', 'uncertain', 'withheld'].includes(String(d.status)) && strings(d.evidenceIds) && ['string', 'boolean', 'number'].includes(typeof d.value))) throw new Error('Declaraciones de partida dañadas.');
  const ids = new Set(value.declarations.map(d => d.id));
  if (!Array.isArray(value.contradictions) || !value.contradictions.every(c => record(c) && typeof c.id === 'string' && typeof c.description === 'string' && typeof c.used === 'boolean' && typeof c.fact === 'string' && strings(c.declarationIds) && c.declarationIds.every(id => ids.has(id)) && strings(c.evidenceIds) && c.evidenceIds.every(id => data.evidence.some(e => e.id === id)) && ['logical', 'evidence', 'temporal', 'relationship', 'possible'].includes(String(c.type)) && ['pending', 'rectified', 'explained', 'unresolved', 'insufficient'].includes(String(c.status)))) throw new Error('Contradicciones de partida dañadas.');
  if (!Array.isArray(value.choices) || !value.choices.every(c => record(c) && typeof c.scene === 'string' && typeof c.option === 'string' && typeof c.text === 'string' && typeof c.order === 'number')) throw new Error('Historial de partida dañado.');
}
export function updateProgress(progress: Progress, game: GameState, cases: CaseData[]): Progress {
  const next = structuredClone(progress);
  next.evidence[game.caseId] = [...new Set([...(next.evidence[game.caseId] ?? []), ...game.discoveredEvidence])];
  next.scenes[game.caseId] = [...new Set([...(next.scenes[game.caseId] ?? []), ...game.visited])];
  if (game.endingId) {
    next.completed = [...new Set([...next.completed, game.caseId])];
    next.endings[game.caseId] = [...new Set([...(next.endings[game.caseId] ?? []), game.endingId])];
    const nextCase = cases[cases.findIndex(c => c.id === game.caseId) + 1];
    if (nextCase) next.unlocked = [...new Set([...next.unlocked, nextCase.id])];
  }
  return next;
}
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export function load(storage: StorageLike, cases: CaseData[]): { data: SaveData; warning?: string; blocked?: boolean } {
  let raw: string | null;
  try { raw = storage.getItem(SAVE_KEY); } catch { return { data: emptySave(), warning: 'El navegador no permite guardar. Esta sesión funciona, pero no se conservará al cerrar.' }; }
  if (!raw) return { data: emptySave() };
  try {
    const header: unknown = JSON.parse(raw);
    if (record(header) && typeof header.version === 'number' && header.version > 2) return { data: emptySave(), blocked: true, warning: 'Guardado de una versión más reciente. Se conserva intacto; podés exportarlo desde Opciones.' };
  } catch { /* A malformed main slot may still have a usable backup. */ }
  try { return { data: decodeSave(raw, cases) }; } catch (error) {
    try { const backup = storage.getItem(BACKUP_KEY); if (backup) return { data: decodeSave(backup, cases), warning: 'Se recuperó la copia de seguridad de la decisión anterior.' }; } catch { /* Preserve both raw slots. */ }
    return { data: emptySave(), blocked: true, warning: `${error instanceof Error ? error.message : 'No se pudo leer la partida.'} Podés exportarla desde Opciones antes de restablecer los datos.` };
  }
}
export function save(storage: StorageLike, data: SaveData): void {
  const payload = JSON.stringify({ ...data, savedAt: new Date().toISOString() });
  const old = storage.getItem(SAVE_KEY);
  if (old) {
    try { const candidate: unknown = JSON.parse(old); if (record(candidate) && candidate.version === 2) storage.setItem(BACKUP_KEY, old); } catch { /* Keep a recovered backup intact. */ }
  }
  storage.setItem(SAVE_KEY, payload);
}
