export type CueId = 'archive' | 'rain-line' | 'thirteen-minutes' | 'old-reel' | 'magnetic' | 'borrowed-memory' | 'under-glass' | 'fracture' | 'last-signature' | 'aftermath';

const scores: Record<CueId, { notes: (number | null)[]; interval: number; wave: OscillatorType }> = {
  archive: { notes: [0, null, 7, null, 3, null, 10, null], interval: 1800, wave: 'sine' },
  'rain-line': { notes: [0, 3, null, 7, 5, null, 3, null], interval: 1500, wave: 'triangle' },
  'thirteen-minutes': { notes: [0, null, 1, 8, null, 7, 1, null], interval: 1250, wave: 'sine' },
  'old-reel': { notes: [0, 7, 10, null, 2, 9, null, 5], interval: 1700, wave: 'triangle' },
  magnetic: { notes: [0, null, 12, 7, null, 5, 3, null], interval: 1350, wave: 'sine' },
  'borrowed-memory': { notes: [0, 3, 7, 10, 7, 3, null, null], interval: 1900, wave: 'sine' },
  'under-glass': { notes: [0, 1, 7, 8, 12, null, 8, 7], interval: 1100, wave: 'triangle' },
  fracture: { notes: [0, 1, 6, 1, 8, 6, 1, null], interval: 850, wave: 'sawtooth' },
  'last-signature': { notes: [0, null, 5, 6, 10, null, 5, 1], interval: 1050, wave: 'triangle' },
  aftermath: { notes: [0, 3, 7, 12, null, 10, 7, 3], interval: 2100, wave: 'sine' }
};

// All sound and music is synthesized locally. Never starts without a user gesture.
export class Ambience {
  private context?: AudioContext;
  private gain?: GainNode;
  private tapeGain?: GainNode;
  private started = false;
  private cue: CueId = 'archive';
  private scoreTimer?: ReturnType<typeof setInterval>;
  private scoreStep = 0;
  setCue(cue: CueId): void {
    if (cue === this.cue) return;
    this.cue = cue; this.scoreStep = 0;
    if (this.started && this.context?.state === 'running') this.startScore();
  }
  async configure(enabled: boolean, volume: number): Promise<void> {
    if (!enabled) { clearInterval(this.scoreTimer); this.scoreTimer = undefined; if (this.gain && this.context) this.gain.gain.setTargetAtTime(0, this.context.currentTime, .15); return; }
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
    const humGain = ctx.createGain(); humGain.gain.value = .15; hum.connect(humGain).connect(this.gain); hum.start();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const channel = buffer.getChannelData(0); let previous = 0;
    for (let i = 0; i < channel.length; i++) { previous = (previous + (Math.random() * 2 - 1) * .03) / 1.03; channel[i] = previous * 4; }
    const rain = ctx.createBufferSource(); rain.buffer = buffer; rain.loop = true;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 900;
    rain.connect(filter).connect(this.gain); rain.start();
    this.started = true;
  }
  private startScore(): void {
    clearInterval(this.scoreTimer); this.scoreStep = 0;
    this.playScoreStep();
    this.scoreTimer = setInterval(() => this.playScoreStep(), scores[this.cue].interval);
  }
  private playScoreStep(): void {
    if (!this.context || !this.gain || this.context.state !== 'running') return;
    const score = scores[this.cue];
    const note = score.notes[this.scoreStep++ % score.notes.length];
    if (note === null || note === undefined) return;
    const now = this.context.currentTime;
    const tone = this.context.createOscillator(); tone.type = score.wave; tone.frequency.value = 110 * Math.pow(2, note / 12);
    const filter = this.context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = this.cue === 'fracture' ? 430 : 680;
    const envelope = this.context.createGain(); envelope.gain.setValueAtTime(.0001, now); envelope.gain.exponentialRampToValueAtTime(this.cue === 'fracture' ? .045 : .075, now + .12); envelope.gain.exponentialRampToValueAtTime(.0001, now + Math.min(2.8, score.interval / 1000 * 1.6));
    tone.connect(filter).connect(envelope).connect(this.gain); tone.start(now); tone.stop(now + Math.min(3, score.interval / 1000 * 1.7));
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
