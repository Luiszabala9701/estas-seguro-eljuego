import './styles.css';
import './ui/styles-extras.css';
import { cases } from './cases';
import { startCase, choose, answerInput, resolveConfrontation, currentScene, presentEvidence, pendingConfrontation, type Resolution } from './engine/engine';
import { interpret, type Interpretation } from './engine/interpreter';
import { load, save, updateProgress, emptySave, SAVE_KEY, BACKUP_KEY } from './engine/persistence';
import { validateCase } from './engine/validation';
import type { GameState, Settings } from './engine/types';
import { home } from './ui/home';
import { gameView, endingView } from './ui/game';
import { settingsPanel, journalPanel, evidencePanel, archivePanel, achievementsPanel, casePanel } from './ui/panels';
import { escapeHtml as h, icon } from './ui/icons';
import { Ambience, cueForGame } from './audio/ambience';
import { achievements, unlockedAchievementIds } from './achievements';

const app = document.querySelector<HTMLDivElement>('#app')!;
const modalRoot = document.querySelector<HTMLDivElement>('#modal-root')!;
const audio = new Ambience();
const loaded = load({ getItem: k => localStorage.getItem(k), setItem: (k,v) => localStorage.setItem(k,v), removeItem: k => localStorage.removeItem(k) }, cases);
let data = loaded.data;
let storageBlocked = loaded.blocked ?? false;
let warning = loaded.warning;
let view: 'home' | 'game' = 'home';
let journalTab = 'evidence';
let interpretation: Interpretation | undefined;
let lastFocus: HTMLElement | null = null;
let typing: ReturnType<typeof setInterval> | undefined;
let fullText = '';
let toastTimer: ReturnType<typeof setTimeout> | undefined;
const caseData = () => cases.find(c => c.id === data.game?.caseId) ?? cases[0]!;
const toast = (message: string) => {
  const element = document.querySelector<HTMLElement>('#toast')!;
  element.textContent = message; element.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => element.classList.remove('visible'), 6500);
};
function persist(): void {
  if (data.game) data.progress = updateProgress(data.progress, data.game, cases);
  if (storageBlocked) return;
  try { save(localStorage, data); warning = undefined; }
  catch { warning = 'Leé esto antes de cerrar: no se pudo guardar. Podés exportar la partida desde Opciones.'; toast(warning); }
}
function appearance(): void {
  document.documentElement.classList.toggle('reduced-motion', data.settings.reducedMotion);
  document.documentElement.classList.toggle('large-text', data.settings.textSize === 'large');
}
async function updateAudio(): Promise<void> {
  try { audio.setCue(view === 'game' && data.game ? cueForGame(data.game, caseData()) : 'archive'); await audio.configure(data.settings.audio, data.settings.volume); }
  catch { data.settings.audio = false; persist(); toast('El audio no está disponible. Podés seguir jugando en silencio.'); }
}
function finishTyping(): void {
  clearInterval(typing); typing = undefined;
  const node = document.querySelector<HTMLElement>('[data-progressive]');
  if (node && fullText) node.textContent = fullText;
  document.querySelector('.reveal-button')?.classList.add('hidden');
}
function render(): void {
  clearInterval(typing); fullText = ''; appearance();
  app.innerHTML = view === 'home' || !data.game ? home(data, cases) : data.game.endingId ? endingView(data, caseData()) : gameView(data, caseData());
  if (warning || storageBlocked) {
    const status = document.querySelector('.save-status'); if (status) status.textContent = 'Guardado no disponible';
  }
  const node = document.querySelector<HTMLElement>('[data-progressive]');
  if (node) {
    fullText = node.innerText; node.setAttribute('aria-label', fullText);
    if (!data.settings.instantText && !data.settings.reducedMotion) {
      let length = 0; node.textContent = '';
      typing = setInterval(() => { length += 9; node.textContent = fullText.slice(0, length); if (length >= fullText.length) finishTyping(); }, 18);
    } else finishTyping();
  } else document.querySelector('.reveal-button')?.classList.add('hidden');
}
function closeModal(): void {
  modalRoot.querySelector('dialog')?.close(); modalRoot.innerHTML = '';
  app.inert = false;
  lastFocus?.focus({ preventScroll: true });
  void updateAudio();
}
function modal(title: string, body: string, wide = false): void {
  finishTyping();
  if (!modalRoot.querySelector('dialog')) lastFocus = document.activeElement as HTMLElement;
  modalRoot.innerHTML = `<dialog class="modal ${wide ? 'wide' : ''}" aria-labelledby="modal-title"><div class="modal-header"><h2 id="modal-title">${h(title)}</h2><button class="icon-button" data-action="close" aria-label="Cerrar">${icon('close')}</button></div><div class="modal-body">${body}</div></dialog>`;
  const dialog = modalRoot.querySelector('dialog')!;
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeModal(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeModal(); } });
  dialog.showModal();
  app.inert = true;
}
function setGame(game: GameState): void {
  const previousAchievements = new Set(unlockedAchievementIds(data.progress, cases));
  data.game = game; view = 'game'; interpretation = undefined; persist(); closeModal(); render();
  const newlyUnlocked = achievements(data.progress, cases).filter(item => item.unlocked && !previousAchievements.has(item.id));
  if (newlyUnlocked.length === 1) toast(`Logro desbloqueado: ${newlyUnlocked[0]!.title}`);
  else if (newlyUnlocked.length > 1) toast(`${newlyUnlocked.length} logros desbloqueados. Revisalos en el menú.`);
  void updateAudio();
  const heading = document.querySelector<HTMLElement>('#speaker'); heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true });
}
function launch(id: string, confirmed = false): void {
  const next = cases.find(c => c.id === id);
  if (!next || !data.progress.unlocked.includes(id)) return;
  if (data.game && !data.game.endingId && !confirmed) {
    modal('Empezar otra declaración', `<p>Hay una partida en curso. Empezar de nuevo reemplaza esa partida; los finales y hallazgos del archivo se conservan.</p><div class="modal-actions"><button class="button secondary" data-action="close">Seguir con mi partida</button><button class="button primary" data-action="confirm-start" data-id="${id}">Empezar de nuevo</button></div>`); return;
  }
  setGame(startCase(next)); window.scrollTo(0, 0); void updateAudio();
}
function exportSave(): void {
  let raw = JSON.stringify(data, null, 2);
  if (storageBlocked) { try { raw = localStorage.getItem(SAVE_KEY) ?? raw; } catch { /* Use in-memory state. */ } }
  const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'estas-seguro-guardado.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function reviewInput(original: string): void {
  const domain = data.game && currentScene(data.game, caseData()).input; if (!domain) return;
  interpretation = interpret(original, domain);
  const target = document.querySelector<HTMLElement>('#interpretation')!;
  const categories = interpretation.kind === 'recognized' ? [interpretation.category] : domain.categories;
  target.innerHTML = `<div class="interpretation"><strong>${interpretation.kind === 'recognized' ? 'Esto es lo que quedaría asentado:' : '«Necesito que lo precises para el acta. ¿Cuál de estas versiones expresa lo que querés decir?»'}</strong>${interpretation.kind !== 'recognized' ? '<p>No se registró ninguna declaración todavía. Podés reformular arriba o elegir una interpretación.</p>' : ''}<div class="interpretation-choices">${categories.map(c => `<button type="button" class="button secondary" data-action="input-confirm" data-id="${c.id}">${h(c.label)} ${icon('check')}</button>`).join('')}${interpretation.kind === 'recognized' ? '<button type="button" class="text-button" data-action="input-rewrite">No, quiero reformular</button>' : ''}</div></div>`;
  target.querySelector<HTMLButtonElement>('button')?.focus();
}
document.addEventListener('submit', event => {
  if ((event.target as HTMLElement).id !== 'free-response') return;
  event.preventDefault(); reviewInput((document.querySelector('#declaration') as HTMLInputElement).value.trim());
});
document.addEventListener('click', event => {
  const button = (event.target as Element).closest<HTMLElement>('[data-action]'); if (!button) return;
  const { action, id = '' } = button.dataset;
  try {
    switch (action) {
      case 'home': closeModal(); view = 'home'; render(); window.scrollTo(0, 0); void updateAudio(); break;
      case 'cases': closeModal(); view = 'home'; render(); document.querySelector('#cases')?.scrollIntoView({ behavior: data.settings.reducedMotion ? 'instant' : 'smooth' }); void updateAudio(); break;
      case 'new': launch(cases[0]!.id); break;
      case 'start': launch(id); break;
      case 'confirm-start': launch(id, true); break;
      case 'continue': if (data.game) { closeModal(); view = 'game'; render(); window.scrollTo(0, 0); void updateAudio(); } break;
      case 'restart': launch(caseData().id); break;
      case 'case': { const c = cases.find(c => c.id === id); if (c) modal(c.title, casePanel(c, data.progress.unlocked.includes(c.id), data.game?.caseId === id && !data.game.endingId)); break; }
      case 'answer': if (data.game) setGame(choose(data.game, caseData(), id)); break;
      case 'resolve': if (data.game) setGame(resolveConfrontation(data.game, caseData(), id as Resolution)); break;
      case 'reveal': finishTyping(); break;
      case 'close': closeModal(); break;
      case 'journal': if (data.game) modal('Tu expediente', journalPanel(data.game, caseData(), journalTab), true); break;
      case 'journal-tab': if (data.game) { journalTab = id; modal('Tu expediente', journalPanel(data.game, caseData(), id), true); } break;
      case 'evidence': if (data.game && data.game.discoveredEvidence.includes(id)) modal(caseData().evidence.find(e => e.id === id)!.title, evidencePanel(id, data.game, caseData())); break;
      case 'present': if (data.game) setGame(presentEvidence(data.game, caseData(), id)); break;
      case 'settings': modal('Opciones', settingsPanel(data, warning)); break;
      case 'archive': modal('Archivo de investigación', archivePanel(data, cases), true); break;
      case 'achievements': audio.setCue('achievements'); void audio.configure(data.settings.audio, data.settings.volume); modal('Logros', achievementsPanel(data, cases), true); break;
      case 'audio': data.settings.audio = !data.settings.audio; persist(); void updateAudio(); render(); toast(data.settings.audio ? 'Ambiente activado' : 'Ambiente silenciado'); break;
      case 'tape': data.settings.audio = true; persist(); void updateAudio().then(() => audio.tape()); toast('Ambiente de cinta · La grabación se lee en la transcripción.'); break;
      case 'input-confirm': if (data.game && interpretation) setGame(answerInput(data.game, caseData(), id, interpretation.original)); break;
      case 'input-rewrite': document.querySelector('#interpretation')!.innerHTML = ''; document.querySelector<HTMLInputElement>('#declaration')?.focus(); break;
      case 'export': exportSave(); break;
      case 'reset': modal('Borrar todos los datos', '<p>Se borrarán de este navegador la partida, sus copias de seguridad, las opciones y todos los hallazgos. Esta acción no se puede deshacer.</p><div class="modal-actions"><button class="button secondary" data-action="close">Cancelar</button><button class="button danger-button" data-action="confirm-reset">Sí, borrar todos los datos</button></div>'); break;
      case 'confirm-reset': localStorage.removeItem(SAVE_KEY); localStorage.removeItem(BACKUP_KEY); data = emptySave(); storageBlocked = false; warning = undefined; closeModal(); view = 'home'; void updateAudio(); render(); toast('Se borraron los datos de este juego.'); break;
      case 'credits': modal('Detrás del expediente', '<p class="eyebrow">¿ESTÁS SEGURO? · EL JUEGO</p><p>Una ficción interactiva original de investigación criminal y terror psicológico, desarrollada a partir de la idea y el documento de diseño de Luis.</p><p>Guion, ilustraciones vectoriales, interfaz y banda sonora sintetizada creados para este proyecto. Todos los personajes, lugares y hechos son ficticios.</p><p>Sin servicios externos, cuentas ni inteligencia artificial durante el juego. Tus partidas permanecen en tu navegador.</p><p class="aside">Versión 1.1 · Cinco expedientes, veinte desenlaces.</p>'); break;
    }
  } catch (error) { toast(error instanceof Error ? error.message : 'No se pudo completar la acción. La última partida guardada se conserva.'); }
});
document.addEventListener('change', event => {
  const target = event.target as HTMLInputElement; const key = target.dataset.setting as keyof Settings | undefined; if (!key) return;
  if (key === 'volume') data.settings.volume = Number(target.value);
  else if (key === 'textSize') data.settings.textSize = target.value === 'large' ? 'large' : 'normal';
  else data.settings[key] = target.checked;
  persist(); appearance(); if (key === 'instantText' || key === 'reducedMotion') finishTyping(); if (key === 'audio' || key === 'volume') void updateAudio();
  // Keep the settings dialog and keyboard focus in place while refreshing the game.
  render();
});
document.addEventListener('keydown', event => {
  if (event.ctrlKey || event.metaKey || event.altKey || modalRoot.querySelector('dialog')) return;
  if ((event.target as Element).matches('input, textarea, select')) return;
  if (view === 'game' && event.key.toLowerCase() === 'e') { event.preventDefault(); if (data.game) modal('Tu expediente', journalPanel(data.game, caseData(), journalTab), true); }
  if (view === 'game' && /^[1-9]$/.test(event.key)) { const answers = document.querySelectorAll<HTMLButtonElement>('.answer'); answers[Number(event.key) - 1]?.click(); }
});
document.addEventListener('visibilitychange', () => { if (document.hidden) { persist(); void audio.suspend(); } else if (data.settings.audio) void updateAudio(); });
const issues = cases.flatMap(c => validateCase(c).map(error => `${c.title}: ${error}`));
if (issues.length) { app.innerHTML = `<main class="fatal-error"><h1>No pudimos abrir el expediente</h1><p>${h(issues.join(' · '))}</p></main>`; }
else { render(); if (warning) toast(warning); }
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => { void navigator.serviceWorker.register('./sw.js').catch(() => { /* A local static server remains sufficient. */ }); });
}
