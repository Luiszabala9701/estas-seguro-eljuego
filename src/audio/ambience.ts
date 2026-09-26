import type { CaseData, GameState } from '../engine/types';

const musicFiles = import.meta.glob('../musica/*.mp3', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const track = (name: string, fallback = 'menu') => musicFiles[`../musica/${name}.mp3`] ?? musicFiles[`../musica/${fallback}.mp3`] ?? '';

export type CueId = 'archive' | 'achievements' | 'rain-line' | 'thirteen-minutes' | 'old-reel' | 'dead-frequency' | 'last-carriage' | 'service-floor' | 'drowned-foundation' | 'blind-camera' | 'mile-seventeen' | 'zero-index' | 'aftermath';

export const CUE_TITLES: Record<CueId, string> = {
  archive: 'Noir de medianoche',
  achievements: 'Logros en penumbra',
  'rain-line': 'La línea bajo la lluvia',
  'thirteen-minutes': 'Trece minutos de más',
  'old-reel': 'El carrete recuerda',
  'dead-frequency': 'Frecuencia cero',
  'last-carriage': 'Riel sin retorno',
  'service-floor': 'El piso que no figura',
  'drowned-foundation': 'Debajo de la cota',
  'blind-camera': 'Seis minutos a oscuras',
  'mile-seventeen': 'La ruta sin testigos',
  'zero-index': 'Todo lo que quisieron borrar',
  aftermath: 'Después del acta'
};

const tracks: Record<CueId, string> = {
  archive: track('menu'),
  achievements: track('logros'),
  'rain-line': track('caso-01'),
  'thirteen-minutes': track('caso-02'),
  'old-reel': track('caso-03'),
  'dead-frequency': track('caso-04'),
  'last-carriage': track('caso-05'),
  'service-floor': track('caso-06', 'caso-01'),
  'drowned-foundation': track('caso-07', 'caso-02'),
  'blind-camera': track('caso-08', 'caso-03'),
  'mile-seventeen': track('caso-09', 'caso-04'),
  'zero-index': track('caso-10', 'caso-05'),
  aftermath: track('finales')
};

const achievementUnlockedTrack = track('logro-desbloqueado');

const caseCues: Record<string, CueId> = {
  'ultima-llamada': 'rain-line',
  'habitacion-309': 'thirteen-minutes',
  'testigo-imposible': 'old-reel',
  'frecuencia-muerta': 'dead-frequency',
  'ultimo-vagon': 'last-carriage',
  'ascensor-vacio': 'service-floor',
  'casa-sumergida': 'drowned-foundation',
  'camara-ciega': 'blind-camera',
  'kilometro-diecisiete': 'mile-seventeen',
  'archivo-cero': 'zero-index'
};

export function cueForGame(game: GameState, _data: CaseData): CueId {
  if (game.endingId) return 'aftermath';
  return caseCues[game.caseId] ?? 'archive';
}

// Music begins only after a user gesture enables it. Tracks crossfade between screens.
export class Ambience {
  private cue: CueId = 'archive';
  private currentCue?: CueId;
  private current?: HTMLAudioElement;
  private fadingOut?: HTMLAudioElement;
  private fadeFrame?: number;
  private enabled = false;
  private targetVolume = 0;
  private effectContext?: AudioContext;

  setCue(cue: CueId): void {
    this.cue = cue;
  }

  async configure(enabled: boolean, volume: number): Promise<void> {
    this.enabled = enabled;
    this.targetVolume = Math.max(0, Math.min(1, volume / 100 * 0.48));
    if (!enabled) {
      this.stopAll();
      return;
    }
    await this.playCue();
  }

  private async playCue(): Promise<void> {
    if (this.current && this.currentCue === this.cue) {
      this.current.volume = this.targetVolume;
      if (this.current.paused) await this.current.play();
      return;
    }

    const requestedCue = this.cue;
    const next = new Audio(tracks[requestedCue]);
    next.preload = 'auto';
    next.loop = true;
    next.volume = 0;
    await next.play();

    if (!this.enabled || this.cue !== requestedCue) {
      next.pause();
      return;
    }

    this.cancelFade();
    const previous = this.current;
    this.fadingOut = previous;
    this.current = next;
    this.currentCue = requestedCue;
    this.crossfade(next, previous);
  }

  private crossfade(next: HTMLAudioElement, previous?: HTMLAudioElement): void {
    const startedAt = performance.now();
    const previousVolume = previous?.volume ?? 0;
    const duration = previous ? 1100 : 450;
    const step = (now: number) => {
      if (!this.enabled || this.current !== next) return;
      const progress = Math.min(1, (now - startedAt) / duration);
      next.volume = this.targetVolume * progress;
      if (previous) previous.volume = previousVolume * (1 - progress);
      if (progress < 1) this.fadeFrame = requestAnimationFrame(step);
      else {
        previous?.pause();
        if (this.fadingOut === previous) this.fadingOut = undefined;
        this.fadeFrame = undefined;
      }
    };
    this.fadeFrame = requestAnimationFrame(step);
  }

  private cancelFade(): void {
    if (this.fadeFrame !== undefined) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = undefined;
    this.fadingOut?.pause();
    this.fadingOut = undefined;
  }

  private stopAll(): void {
    this.cancelFade();
    this.current?.pause();
    this.current = undefined;
    this.currentCue = undefined;
  }

  async achievement(): Promise<void> {
    if (!this.enabled) return;
    const sound = new Audio(achievementUnlockedTrack);
    sound.volume = Math.min(1, this.targetVolume * 1.8);
    await sound.play();
  }

  tape(): void {
    if (!this.enabled) return;
    this.effectContext ??= new AudioContext();
    const context = this.effectContext;
    void context.resume();
    const gain = context.createGain();
    gain.gain.setValueAtTime(Math.max(.001, this.targetVolume * .55), context.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + 2);
    const tone = context.createOscillator();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(170, context.currentTime);
    tone.frequency.linearRampToValueAtTime(90, context.currentTime + 2);
    tone.connect(gain).connect(context.destination);
    tone.start();
    tone.stop(context.currentTime + 2);
  }

  async suspend(): Promise<void> {
    this.current?.pause();
    await this.effectContext?.suspend();
  }
}
