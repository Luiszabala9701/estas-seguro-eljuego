import type { CaseData, GameState } from '../engine/types';

export type CueId = 'archive' | 'achievements' | 'rain-line' | 'thirteen-minutes' | 'old-reel' | 'dead-frequency' | 'last-carriage' | 'magnetic' | 'borrowed-memory' | 'under-glass' | 'fracture' | 'last-signature' | 'aftermath';

export const CUE_TITLES: Record<CueId, string> = {
  archive: 'Archivo dormido',
  achievements: 'Trofeos en penumbra',
  'rain-line': 'La línea bajo la lluvia',
  'thirteen-minutes': 'Trece minutos de más',
  'old-reel': 'El carrete recuerda',
  'dead-frequency': 'Frecuencia cero',
  'last-carriage': 'Riel sin retorno',
  magnetic: 'Cinta magnética',
  'borrowed-memory': 'Memoria prestada',
  'under-glass': 'Prueba bajo vidrio',
  fracture: 'La versión se quiebra',
  'last-signature': 'La última firma',
  aftermath: 'Después del acta'
};

interface Score { notes: (number | null)[]; interval: number; wave: OscillatorType; root: number; filter: number; level: number }
const scores: Record<CueId, Score> = {
  archive: { notes: [0, null, 12, null, 5, null, 3, null], interval: 2200, wave: 'sine', root: 73.42, filter: 520, level: .052 },
  achievements: { notes: [0, 7, 12, 9, 7, 4, 0, null], interval: 820, wave: 'sine', root: 196, filter: 1150, level: .072 },
  'rain-line': { notes: [0, 3, 7, null, 10, 7, 3, null], interval: 1050, wave: 'triangle', root: 146.83, filter: 920, level: .085 },
  'thirteen-minutes': { notes: [0, null, 1, 8, null, 7, 1, 13], interval: 1210, wave: 'sine', root: 98, filter: 620, level: .074 },
  'old-reel': { notes: [0, 7, 10, null, 14, 9, null, 5], interval: 1640, wave: 'triangle', root: 123.47, filter: 760, level: .068 },
  'dead-frequency': { notes: [0, null, 6, 5, null, 11, 18, 1], interval: 1380, wave: 'sawtooth', root: 82.41, filter: 410, level: .045 },
  'last-carriage': { notes: [0, 7, 5, 2, 12, 8, 7, 1], interval: 760, wave: 'triangle', root: 110, filter: 780, level: .072 },
  magnetic: { notes: [0, null, 12, 7, 19, null, 5, 3], interval: 1320, wave: 'sine', root: 130.81, filter: 880, level: .068 },
  'borrowed-memory': { notes: [0, 3, 7, 15, 12, 7, 3, null], interval: 1850, wave: 'sine', root: 174.61, filter: 1050, level: .055 },
  'under-glass': { notes: [0, 1, 7, 8, 12, 13, 8, 7], interval: 980, wave: 'triangle', root: 116.54, filter: 840, level: .08 },
  fracture: { notes: [0, 1, 6, 1, 8, 6, 13, null], interval: 680, wave: 'sawtooth', root: 92.5, filter: 390, level: .038 },
  'last-signature': { notes: [0, null, 5, 6, 10, 12, 5, 1], interval: 980, wave: 'triangle', root: 103.83, filter: 720, level: .075 },
  aftermath: { notes: [0, 3, 7, 12, 15, 10, 7, 3], interval: 1980, wave: 'sine', root: 87.31, filter: 650, level: .058 }
};

export function cueForGame(game: GameState, data: CaseData): CueId {
  if (game.endingId) return 'aftermath';
  const scene = data.scenes.find(item => item.id === game.sceneId);
  if (game.contradictions.some(item => item.status === 'pending' && !item.used) || game.tension > 65) return 'fracture';
  if (scene?.kind === 'decision') return 'last-signature';
  if (scene?.kind === 'revelation') return 'under-glass';
  if (scene?.kind === 'memory') return 'borrowed-memory';
  if (scene?.kind === 'evidence') return 'magnetic';
  return ({ 'ultima-llamada': 'rain-line', 'habitacion-309': 'thirteen-minutes', 'testigo-imposible': 'old-reel', 'frecuencia-muerta': 'dead-frequency', 'ultimo-vagon': 'last-carriage' } as Record<string, CueId>)[game.caseId] ?? 'archive';
}

// All sound and music is synthesized locally. Never starts without a user gesture.
export class Ambience {
  private context?: AudioContext;
  private gain?: GainNode;
  private tapeGain?: GainNode;
  private started = false;
  private cue: CueId = 'archive';
  private scoreTimer?: ReturnType<typeof setInterval>;
  private scoreStep = 0;
  private activeTones = new Set<OscillatorNode>();
  setCue(cue: CueId): void {
    if (cue === this.cue) return;
    this.cue = cue; this.scoreStep = 0;
    if (this.started && this.context?.state === 'running') this.startScore();
  }
  async configure(enabled: boolean, volume: number): Promise<void> {
    if (!enabled) { clearInterval(this.scoreTimer); this.scoreTimer = undefined; this.stopScoreVoices(); if (this.gain && this.context) this.gain.gain.setTargetAtTime(0, this.context.currentTime, .15); return; }
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
    if (!this.started) this.build();
    this.gain!.gain.setTargetAtTime(volume / 100 * .22, this.context.currentTime, .3);
    if (!this.scoreTimer) this.startScore();
  }
  private build(): void {
    const ctx = this.context!;
    this.gain = ctx.createGain(); this.gain.gain.value = 0; this.gain.connect(ctx.destination);
    const hum = ctx.createOscillator(); hum.type = 'sine'; hum.frequency.value = 50;
    const humGain = ctx.createGain(); humGain.gain.value = .08; hum.connect(humGain).connect(this.gain); hum.start();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const channel = buffer.getChannelData(0); let previous = 0;
    for (let i = 0; i < channel.length; i++) { previous = (previous + (Math.random() * 2 - 1) * .03) / 1.03; channel[i] = previous * 4; }
    const rain = ctx.createBufferSource(); rain.buffer = buffer; rain.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;
    const rainGain = ctx.createGain(); rainGain.gain.value = .22;
    rain.connect(filter).connect(rainGain).connect(this.gain); rain.start();
    this.started = true;
  }
  private startScore(): void {
    clearInterval(this.scoreTimer); this.stopScoreVoices(); this.scoreStep = 0;
    this.playScoreStep();
    this.scoreTimer = setInterval(() => this.playScoreStep(), scores[this.cue].interval);
  }
  private stopScoreVoices(): void {
    if (!this.context) return;
    for (const tone of this.activeTones) { try { tone.stop(this.context.currentTime + .03); } catch { /* The voice already ended. */ } }
    this.activeTones.clear();
  }
  private playScoreStep(): void {
    if (!this.context || !this.gain || this.context.state !== 'running') return;
    const score = scores[this.cue];
    const note = score.notes[this.scoreStep++ % score.notes.length];
    if (note === null || note === undefined) return;
    const now = this.context.currentTime;
    const frequency = score.root * Math.pow(2, note / 12);
    const tone = this.context.createOscillator(); tone.type = score.wave; tone.frequency.value = frequency;
    const overtone = this.context.createOscillator(); overtone.type = 'sine'; overtone.frequency.value = frequency * 2;
    const overtoneGain = this.context.createGain(); overtoneGain.gain.value = .16;
    const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = score.filter;
    const envelope = this.context.createGain(); envelope.gain.setValueAtTime(.0001, now); envelope.gain.exponentialRampToValueAtTime(score.level, now + .12); envelope.gain.exponentialRampToValueAtTime(.0001, now + Math.min(2.8, score.interval / 1000 * 1.6));
    tone.connect(filter); overtone.connect(overtoneGain).connect(filter); filter.connect(envelope).connect(this.gain);
    const stopAt = now + Math.min(3, score.interval / 1000 * 1.7);
    for (const voice of [tone, overtone]) { this.activeTones.add(voice); voice.onended = () => { this.activeTones.delete(voice); voice.disconnect(); }; voice.start(now); voice.stop(stopAt); }
  }
  tape(): void {
    if (!this.context || !this.gain) return;
    const ctx = this.context;
    this.tapeGain?.disconnect();
    this.tapeGain = ctx.createGain(); this.tapeGain.gain.setValueAtTime(.08, ctx.currentTime); this.tapeGain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 2);
    const tone = ctx.createOscillator(); tone.type = 'triangle'; tone.frequency.setValueAtTime(170, ctx.currentTime); tone.frequency.linearRampToValueAtTime(90, ctx.currentTime + 2); tone.connect(this.tapeGain).connect(this.gain); tone.start(); tone.stop(ctx.currentTime + 2);
  }
  async suspend(): Promise<void> { clearInterval(this.scoreTimer); this.scoreTimer = undefined; await this.context?.suspend(); }
}
