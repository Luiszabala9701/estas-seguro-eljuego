// All sound is synthesized locally. Never starts without a user gesture.
export class Ambience {
  private context?: AudioContext;
  private gain?: GainNode;
  private tapeGain?: GainNode;
  private started = false;
  async configure(enabled: boolean, volume: number): Promise<void> {
    if (!enabled) { if (this.gain && this.context) this.gain.gain.setTargetAtTime(0, this.context.currentTime, .15); return; }
    this.context ??= new AudioContext();
    if (this.context.state === 'suspended') await this.context.resume();
    if (!this.started) this.build();
    this.gain!.gain.setTargetAtTime(volume / 100 * .22, this.context.currentTime, .3);
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
  tape(): void {
    if (!this.context || !this.gain) return;
    const ctx = this.context;
    this.tapeGain?.disconnect();
    this.tapeGain = ctx.createGain(); this.tapeGain.gain.setValueAtTime(.08, ctx.currentTime); this.tapeGain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 2);
    const tone = ctx.createOscillator(); tone.type = 'triangle'; tone.frequency.setValueAtTime(170, ctx.currentTime); tone.frequency.linearRampToValueAtTime(90, ctx.currentTime + 2); tone.connect(this.tapeGain).connect(this.gain); tone.start(); tone.stop(ctx.currentTime + 2);
  }
  async suspend(): Promise<void> { await this.context?.suspend(); }
}
