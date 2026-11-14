/**
 * Procedural Web Audio API Sound Engine for Diwali Celebrations
 * Generates realistic sound effects without relying on external media files.
 */

export interface AtmosphereSettings {
  enabled: boolean;
  volume: number; // 0 to 1
  wind: boolean;
  city: boolean;
  music: boolean;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private atmosphereGain: GainNode | null = null;
  private crackerGain: GainNode | null = null;
  private windGain: GainNode | null = null;
  private cityGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private isMuted: boolean = false;
  private isAtmosphereActive: boolean = false;
  private isMusicPlaying: boolean = false;
  private crackerVolume: number = 0.8;

  private windSource: AudioBufferSourceNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private cityNoiseSource: AudioBufferSourceNode | null = null;
  private cityOscs: OscillatorNode[] = [];
  private distantFireworkTimer: number | null = null;

  private ambientOscillators: OscillatorNode[] = [];
  private ambientTimer: number | null = null;

  private atmosphereSettings: AtmosphereSettings = {
    enabled: true,
    volume: 0.6,
    wind: true,
    city: true,
    music: true
  };

  constructor() {
    // Lazy initialization on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.atmosphereGain = this.ctx.createGain();
      this.atmosphereGain.gain.setValueAtTime(this.atmosphereSettings.volume, this.ctx.currentTime);
      this.atmosphereGain.connect(this.masterGain);

      this.crackerGain = this.ctx.createGain();
      this.crackerGain.gain.setValueAtTime(this.crackerVolume, this.ctx.currentTime);
      this.crackerGain.connect(this.masterGain);

      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(this.atmosphereSettings.wind ? 0.14 : 0, this.ctx.currentTime);
      this.windGain.connect(this.atmosphereGain);

      this.cityGain = this.ctx.createGain();
      this.cityGain.gain.setValueAtTime(this.atmosphereSettings.city ? 0.10 : 0, this.ctx.currentTime);
      this.cityGain.connect(this.atmosphereGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.atmosphereSettings.music ? 0.16 : 0, this.ctx.currentTime);
      this.musicGain.connect(this.atmosphereGain);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
  }

  public isContextRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running';
  }

  public async unlock(): Promise<boolean> {
    this.initContext();
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }
    return this.ctx.state === 'running';
  }

  /**
   * Run a sound effect only when AudioContext is actively running so autoplay-blocked
   * ticks never queue onto a frozen clock and burst out late when resumed later.
   */
  private withRunningContext(cb: (ctx: AudioContext, soundGain: GainNode) => void) {
    this.initContext();
    if (!this.ctx || !this.crackerGain || this.isMuted) return;

    if (this.ctx.state === 'running') {
      cb(this.ctx, this.crackerGain);
      return;
    }

    const requestedAt = performance.now();
    this.ctx
      .resume()
      .then(() => {
        if (
          this.ctx &&
          this.crackerGain &&
          !this.isMuted &&
          this.ctx.state === 'running' &&
          performance.now() - requestedAt < 120
        ) {
          cb(this.ctx, this.crackerGain);
        }
      })
      .catch(() => {});
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.05);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public setCrackerVolume(vol: number) {
    this.crackerVolume = Math.max(0, Math.min(1, vol));
    if (this.crackerGain && this.ctx && !this.isMuted) {
      this.crackerGain.gain.setTargetAtTime(this.crackerVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getCrackerVolume(): number {
    return this.crackerVolume;
  }

  // Create white/pink noise buffer
  private createNoiseBuffer(durationSeconds: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext uninitialized');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink-ish noise filter
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }
    return buffer;
  }

  /**
   * Countdown beat sound (crisp percussive pulse + ascending D-major anticipation chime for 3 -> 2 -> 1)
   */
  public playCountdownTick(count: number) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      // Ascending anticipation pitch aligned to D-major Happy Diwali resolution (D5 = 587.33 Hz)
      const chimeFreq = count === 3 ? 440.0 : count === 2 ? 493.88 : 554.37;
      const bassStartFreq = count === 1 ? 190 : 155;

      // Tight sub-bass beat punch
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(bassStartFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(42, now + 0.18);

      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.55, now + 0.005);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      subOsc.connect(subGain);
      subGain.connect(masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.24);

      // Clear tonal countdown chime
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chimeOsc.type = 'triangle';
      chimeOsc.frequency.setValueAtTime(chimeFreq, now);

      chimeGain.gain.setValueAtTime(0.001, now);
      chimeGain.gain.linearRampToValueAtTime(0.32, now + 0.006);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(masterGain);
      chimeOsc.start(now);
      chimeOsc.stop(now + 0.3);

      // Sharp clock transient click right at t = 0
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(count === 1 ? 1800 : 1400, now);
      clickOsc.frequency.exponentialRampToValueAtTime(420, now + 0.035);

      clickGain.gain.setValueAtTime(0.32, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      clickOsc.connect(clickGain);
      clickGain.connect(masterGain);
      clickOsc.start(now);
      clickOsc.stop(now + 0.045);
    });
  }

  /**
   * "Happy Diwali" celebration blast: orchestral chime chord + optional deep explosion + glitter
   */
  public playHappyDiwaliBlast(includeExplosion = true) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      if (includeExplosion) {
        // Deep celebratory boom
        this.playExplosionSound(now, 1.2, true);
      }

      // Majestic D major / Indian Bhupali raag resolution chord landing right on beat 0
      const chordNotes = [587.33, 293.66, 369.99, 440.0, 493.88, 739.99, 880.0];
      chordNotes.forEach((freq, idx) => {
        const startOffset = idx === 0 ? 0 : idx * 0.025;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);

        gain.gain.setValueAtTime(0.001, now + startOffset);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.24 : 0.16, now + startOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + startOffset);
        osc.stop(now + 2.8);
      });

      // Shimmering chime wash
      this.playSparkleArpeggio(now + 0.14, 8);
    });
  }

  /**
   * Frame-accurate single skyshot mortar launch sound (triggered right as rocket launches on canvas)
   */
  public playSkyshotLaunch() {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      const thudOsc = ctx.createOscillator();
      const thudGain = ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(30, now + 0.16);
      thudGain.gain.setValueAtTime(0.45, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      thudOsc.connect(thudGain);
      thudGain.connect(masterGain);
      thudOsc.start(now);
      thudOsc.stop(now + 0.2);

      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(0.32);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(3400, now + 0.28);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.14, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(now);
      noise.stop(now + 0.32);
    });
  }

  /**
   * Frame-accurate skyshot burst sound (triggered on the exact canvas frame the rocket explodes)
   */
  public playSkyshotExplosion(intensity = 0.95) {
    this.withRunningContext((ctx) => {
      this.playExplosionSound(ctx.currentTime, intensity, false);
    });
  }

  /**
   * Sizzling fuse sound
   */
  public playFuseSizzle(durationSeconds = 1.0) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      const noiseBuffer = this.createNoiseBuffer(durationSeconds);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.linearRampToValueAtTime(0.25, now + durationSeconds - 0.1);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      noiseSource.start(now);
      noiseSource.stop(now + durationSeconds);
    });
  }

  /**
   * Charkhi sound: Centrifugal rotational whistle + continuous ground spark crackle
   */
  public playCharkhiSound(durationSeconds = 4.5) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      // Centrifugal rotational whistle (frequency oscillating & accelerating)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + Math.min(1.2, durationSeconds * 0.35));
      osc.frequency.setValueAtTime(800, now + Math.max(0.1, durationSeconds - 1.2));
      osc.frequency.exponentialRampToValueAtTime(140, now + durationSeconds);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(8, now);
      lfo.frequency.linearRampToValueAtTime(26, now + Math.min(1.5, durationSeconds * 0.4));
      lfo.frequency.linearRampToValueAtTime(6, now + durationSeconds);
      lfoGain.gain.setValueAtTime(120, now);

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + durationSeconds);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(6.0, now);

      oscGain.gain.setValueAtTime(0.05, now);
      oscGain.gain.linearRampToValueAtTime(0.28, now + Math.min(0.5, durationSeconds * 0.2));
      oscGain.gain.setValueAtTime(0.28, now + Math.max(0.1, durationSeconds - 0.8));
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + durationSeconds);

      // Continuous radial spark hiss
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(durationSeconds);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2200, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.1, now);
      noiseGain.gain.linearRampToValueAtTime(0.35, now + Math.min(0.8, durationSeconds * 0.25));
      noiseGain.gain.setValueAtTime(0.35, now + Math.max(0.1, durationSeconds - 0.8));
      noiseGain.gain.linearRampToValueAtTime(0.01, now + durationSeconds);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noise.start(now);
      noise.stop(now + durationSeconds);
    });
  }

  /**
   * Anar (Flower Pot) sound: Ascending crescendo fountain with roaring spark bursts
   */
  public playAnarSound(durationSeconds = 5.0) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;
      const apexTime = Math.min(2.4, durationSeconds * 0.45);

      // Escalating noise fountain
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(durationSeconds);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(4500, now + apexTime);
      filter.frequency.exponentialRampToValueAtTime(1200, now + durationSeconds);
      filter.Q.setValueAtTime(2.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.55, now + apexTime);
      gain.gain.setValueAtTime(0.5, now + Math.max(apexTime, durationSeconds - 1.0));
      gain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + durationSeconds);

      // Low rumble undertone for fountain pressure
      const rumble = ctx.createOscillator();
      const rumbleGain = ctx.createGain();
      rumble.type = 'triangle';
      rumble.frequency.setValueAtTime(80, now);
      rumble.frequency.linearRampToValueAtTime(140, now + apexTime);
      rumbleGain.gain.setValueAtTime(0.15, now);
      rumbleGain.gain.linearRampToValueAtTime(0.35, now + apexTime);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + durationSeconds);

      rumble.connect(rumbleGain);
      rumbleGain.connect(masterGain);
      rumble.start(now);
      rumble.stop(now + durationSeconds);
    });
  }

  /**
   * Phooljhadi (Sparkler): Crisp sizzling starburst pops & hissing trail
   */
  public playPhooljhadiSound(durationSeconds = 6.0) {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(durationSeconds);

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4800, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.3);
      gain.gain.setValueAtTime(0.22, now + Math.max(0.35, durationSeconds - 0.5));
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      noise.start(now);
      noise.stop(now + durationSeconds);
    });
  }

  /**
   * Controllable ascending rocket screech & thrust. Returns stop() so the visual canvas
   * cuts off the whistle cleanly on the exact animation frame the rocket explodes.
   */
  public startRocketLaunchSound(expectedFlightSeconds = 0.95): () => void {
    let stopped = false;
    let stopHandle: (() => void) | null = null;

    this.withRunningContext((ctx, masterGain) => {
      if (stopped) return;
      const now = ctx.currentTime;
      const maxDur = Math.max(0.4, expectedFlightSeconds + 0.5);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(2400, now + expectedFlightSeconds);

      oscGain.gain.setValueAtTime(0.1, now);
      oscGain.gain.exponentialRampToValueAtTime(0.36, now + expectedFlightSeconds * 0.85);
      oscGain.gain.linearRampToValueAtTime(0.001, now + maxDur);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + maxDur + 0.05);

      const thrustNoise = ctx.createBufferSource();
      thrustNoise.buffer = this.createNoiseBuffer(maxDur);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.linearRampToValueAtTime(3600, now + expectedFlightSeconds);

      const thrustGain = ctx.createGain();
      thrustGain.gain.setValueAtTime(0.14, now);
      thrustGain.gain.linearRampToValueAtTime(0.32, now + expectedFlightSeconds * 0.9);
      thrustGain.gain.linearRampToValueAtTime(0.001, now + maxDur);

      thrustNoise.connect(filter);
      filter.connect(thrustGain);
      thrustGain.connect(masterGain);
      thrustNoise.start(now);
      thrustNoise.stop(now + maxDur + 0.05);

      stopHandle = () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        try {
          oscGain.gain.cancelScheduledValues(t);
          oscGain.gain.setValueAtTime(oscGain.gain.value, t);
          oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
          osc.stop(t + 0.04);

          thrustGain.gain.cancelScheduledValues(t);
          thrustGain.gain.setValueAtTime(thrustGain.gain.value, t);
          thrustGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
          thrustNoise.stop(t + 0.04);
        } catch {
          // Ignore already stopped nodes
        }
      };
    });

    return () => {
      stopped = true;
      stopHandle?.();
    };
  }

  /**
   * Rocket (Audio-Only preview helper): ascending whoosh screech -> explosion
   */
  public playRocketSound(flightDuration = 0.95) {
    const stopLaunch = this.startRocketLaunchSound(flightDuration);
    window.setTimeout(() => {
      stopLaunch();
      this.playSkyshotExplosion(1.3);
    }, flightDuration * 1000);
  }

  /**
   * Skyshots (Audio-Only preview helper): Sequential mortar thumps followed by sky bursts
   */
  public playSkyshotSound(shotsCount = 7) {
    for (let i = 0; i < shotsCount; i++) {
      const delayMs = i * 680;
      window.setTimeout(() => {
        this.playSkyshotLaunch();
        window.setTimeout(() => {
          this.playSkyshotExplosion(0.95 + Math.random() * 0.25);
        }, 530);
      }, delayMs);
    }
  }

  /**
   * Deep bass explosion with crackle
   */
  private playExplosionSound(startTime: number, intensity = 1.0, isGrand = false) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Sub-bass thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(isGrand ? 160 : 130, startTime);
    subOsc.frequency.exponentialRampToValueAtTime(22, startTime + (isGrand ? 0.7 : 0.45));

    subGain.gain.setValueAtTime(0.8 * intensity, startTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, startTime + (isGrand ? 0.8 : 0.5));

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    subOsc.start(startTime);
    subOsc.stop(startTime + (isGrand ? 0.85 : 0.55));

    // Mid crackle & blast wave
    const blastNoise = this.ctx.createBufferSource();
    blastNoise.buffer = this.createNoiseBuffer(isGrand ? 2.2 : 1.2);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, startTime);
    filter.frequency.exponentialRampToValueAtTime(120, startTime + 0.9);

    const blastGain = this.ctx.createGain();
    blastGain.gain.setValueAtTime(0.6 * intensity, startTime);
    blastGain.gain.exponentialRampToValueAtTime(0.001, startTime + (isGrand ? 2.0 : 1.1));

    blastNoise.connect(filter);
    filter.connect(blastGain);
    blastGain.connect(this.masterGain);
    blastNoise.start(startTime);
    blastNoise.stop(startTime + (isGrand ? 2.2 : 1.2));
  }

  /**
   * Shimmering sparkle arpeggio
   */
  private playSparkleArpeggio(startTime: number, notesCount = 6) {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0];

    for (let i = 0; i < notesCount; i++) {
      const noteTime = startTime + i * 0.08;
      const freq = baseFreqs[i % baseFreqs.length] * (1 + (Math.random() * 0.04 - 0.02));
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.08, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.65);
    }
  }

  /**
   * Sweets celebration audio: joyful chime + warm blessing harmonic
   */
  public playSweetCheer() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Upward pentatonic celebration bells
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const noteTime = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(noteTime);
      osc.stop(noteTime + 0.85);
    });
  }

  /**
   * "Share Joy" screen-wide confetti cannon pop + shimmering celebration fanfare
   */
  public playShareJoyConfetti() {
    this.withRunningContext((ctx, masterGain) => {
      const now = ctx.currentTime;

      // Crisp dual confetti-cannon pop
      [0, 0.08].forEach((offset, idx) => {
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(idx === 0 ? 220 : 280, now + offset);
        popOsc.frequency.exponentialRampToValueAtTime(55, now + offset + 0.14);

        popGain.gain.setValueAtTime(0.001, now + offset);
        popGain.gain.linearRampToValueAtTime(0.45, now + offset + 0.006);
        popGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);

        popOsc.connect(popGain);
        popGain.connect(masterGain);
        popOsc.start(now + offset);
        popOsc.stop(now + offset + 0.18);

        // Air-burst confetti flutter noise
        const noise = ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer(0.24);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400 + idx * 600, now + offset);
        filter.Q.setValueAtTime(1.4, now + offset);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.22, now + offset);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(masterGain);
        noise.start(now + offset);
        noise.stop(now + offset + 0.24);
      });

      // Joyful sparkling arpeggio wash
      this.playSparkleArpeggio(now + 0.05, 7);
    });
  }

  /**
   * Continuous Soft Wind / Evening Breeze
   * Filtered noise with undulating resonant LFO
   */
  private startWind() {
    if (!this.ctx || !this.windGain || this.windSource) return;
    try {
      const duration = 6.0;
      const buffer = this.createNoiseBuffer(duration);
      this.windSource = this.ctx.createBufferSource();
      this.windSource.buffer = buffer;
      this.windSource.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

      this.windLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.windLfo.type = 'sine';
      this.windLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

      this.windLfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      this.windLfo.start();

      this.windSource.connect(filter);
      filter.connect(this.windGain);
      this.windSource.start();
    } catch {
      // Context might be suspended
    }
  }

  private stopWind() {
    if (this.windLfo) {
      try { this.windLfo.stop(); this.windLfo.disconnect(); } catch {}
      this.windLfo = null;
    }
    if (this.windSource) {
      try { this.windSource.stop(); this.windSource.disconnect(); } catch {}
      this.windSource = null;
    }
  }

  /**
   * Distant City Noise & Distant Diwali Fireworks
   * Low-passed rumble + sub harmonic drone + periodic muffled distant bursts
   */
  private startCityAmbience() {
    if (!this.ctx || !this.cityGain || this.cityNoiseSource) return;
    try {
      const duration = 5.0;
      const buffer = this.createNoiseBuffer(duration);
      this.cityNoiseSource = this.ctx.createBufferSource();
      this.cityNoiseSource.buffer = buffer;
      this.cityNoiseSource.loop = true;

      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = 'lowpass';
      lowFilter.frequency.setValueAtTime(115, this.ctx.currentTime);
      lowFilter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      this.cityNoiseSource.connect(lowFilter);
      lowFilter.connect(this.cityGain);
      this.cityNoiseSource.start();

      const humFreqs = [56, 60];
      this.cityOscs = humFreqs.map((freq) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        g.gain.setValueAtTime(0.04, this.ctx!.currentTime);
        osc.connect(g);
        g.connect(this.cityGain!);
        osc.start();
        return osc;
      });

      const scheduleNextDistantFirework = () => {
        const delay = 7500 + Math.random() * 8000;
        this.distantFireworkTimer = window.setTimeout(() => {
          if (this.isAtmosphereActive && this.atmosphereSettings.city && !this.isMuted) {
            this.playDistantHorizonBurst();
          }
          scheduleNextDistantFirework();
        }, delay);
      };
      scheduleNextDistantFirework();
    } catch {
      // Context might be suspended
    }
  }

  private stopCityAmbience() {
    if (this.distantFireworkTimer) {
      clearTimeout(this.distantFireworkTimer);
      this.distantFireworkTimer = null;
    }
    this.cityOscs.forEach((osc) => {
      try { osc.stop(); osc.disconnect(); } catch {}
    });
    this.cityOscs = [];
    if (this.cityNoiseSource) {
      try { this.cityNoiseSource.stop(); this.cityNoiseSource.disconnect(); } catch {}
      this.cityNoiseSource = null;
    }
  }

  /**
   * Distant horizon muffled firework burst (low rumble filtered as if kilometers away)
   */
  public playDistantHorizonBurst() {
    if (!this.ctx || !this.cityGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.65);

    subGain.gain.setValueAtTime(0.18, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(1.4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(160, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 0.9);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    subOsc.connect(subGain);
    subGain.connect(this.cityGain);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.cityGain);

    subOsc.start(now);
    subOsc.stop(now + 0.75);
    noise.start(now);
    noise.stop(now + 1.3);
  }

  /**
   * Ambient Indian festive sitar & tanpura melodic drone
   */
  public toggleAmbientMusic(enable?: boolean) {
    this.initContext();
    const target = enable !== undefined ? enable : !this.isMusicPlaying;
    this.isMusicPlaying = target;
    this.atmosphereSettings.music = target;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(target ? 0.16 : 0, this.ctx.currentTime, 0.05);
    }
    if (target) {
      this.startAmbientMusic();
    } else {
      this.stopAmbientMusic();
    }
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  private startAmbientMusic() {
    if (!this.ctx || !this.musicGain) return;
    this.stopAmbientMusic();

    const droneFreqs = [146.83, 220.0, 293.66];
    this.ambientOscillators = droneFreqs.map((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = i === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.05, this.ctx!.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      osc.start();
      return osc;
    });

    const melodyNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 739.99];
    let noteIdx = 0;
    this.ambientTimer = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const freq = melodyNotes[noteIdx % melodyNotes.length];
      noteIdx = (noteIdx + 1 + Math.floor(Math.random() * 2)) % melodyNotes.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 1.5);
    }, 2200);
  }

  private stopAmbientMusic() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    this.ambientOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
  }

  /**
   * Complete Atmospheric Layer Master Controls
   */
  public startAtmosphere() {
    this.initContext();
    this.isAtmosphereActive = true;
    this.atmosphereSettings.enabled = true;
    if (this.atmosphereSettings.wind) this.startWind();
    if (this.atmosphereSettings.city) this.startCityAmbience();
    if (this.atmosphereSettings.music) this.startAmbientMusic();
  }

  public stopAtmosphere() {
    this.isAtmosphereActive = false;
    this.atmosphereSettings.enabled = false;
    this.stopWind();
    this.stopCityAmbience();
    this.stopAmbientMusic();
  }

  public toggleAtmosphere(enable?: boolean) {
    this.initContext();
    const target = enable !== undefined ? enable : !this.isAtmosphereActive;
    if (target) {
      this.startAtmosphere();
    } else {
      this.stopAtmosphere();
    }
  }

  public getIsAtmosphereActive(): boolean {
    return this.isAtmosphereActive;
  }

  public getAtmosphereSettings(): AtmosphereSettings {
    return { ...this.atmosphereSettings };
  }

  public updateAtmosphereSettings(partial: Partial<AtmosphereSettings>) {
    this.initContext();
    this.atmosphereSettings = { ...this.atmosphereSettings, ...partial };
    const now = this.ctx ? this.ctx.currentTime : 0;

    if (partial.volume !== undefined && this.atmosphereGain && this.ctx) {
      this.atmosphereGain.gain.setTargetAtTime(partial.volume, now, 0.05);
    }
    if (partial.wind !== undefined && this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(partial.wind ? 0.14 : 0, now, 0.05);
      if (partial.wind && this.isAtmosphereActive && !this.windSource) {
        this.startWind();
      } else if (!partial.wind) {
        this.stopWind();
      }
    }
    if (partial.city !== undefined && this.cityGain && this.ctx) {
      this.cityGain.gain.setTargetAtTime(partial.city ? 0.10 : 0, now, 0.05);
      if (partial.city && this.isAtmosphereActive && !this.cityNoiseSource) {
        this.startCityAmbience();
      } else if (!partial.city) {
        this.stopCityAmbience();
      }
    }
    if (partial.music !== undefined && this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(partial.music ? 0.16 : 0, now, 0.05);
      if (partial.music && this.isAtmosphereActive && this.ambientOscillators.length === 0) {
        this.startAmbientMusic();
      } else if (!partial.music) {
        this.stopAmbientMusic();
      }
    }
    if (partial.enabled !== undefined) {
      this.toggleAtmosphere(partial.enabled);
    }
  }
}

export const soundEngine = new SoundEngine();
