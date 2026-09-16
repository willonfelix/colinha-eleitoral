// Web Audio API synthesized sounds for Brazilian Urna Eletrônica (100% offline)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Key press beep (short high tone)
 */
export function playKeyBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, ctx.currentTime);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.065);
  } catch {
    // ignore audio errors if blocked by browser policy
  }
}

/**
 * Corrige beep (canceling/clearing a number)
 */
export function playCorrigeBeep() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(320, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.13);
  } catch {
    // ignore
  }
}

/**
 * Iconic Brazilian Urna Eletrônica "FIM" / Confirmação Chime (Interflow of frequencies)
 */
export function playUrnaConfirmSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, now);
      masterGain.connect(ctx.destination);

      // 3 ascending notes: Note 1 (493.88 Hz - B4), Note 2 (659.25 Hz - E5), Note 3 (987.77 Hz - B5)
      // and final sustained resonance
      const notes = [
        { freq: 520, start: 0, duration: 0.14 },
        { freq: 690, start: 0.15, duration: 0.14 },
        { freq: 1040, start: 0.30, duration: 0.45 }
      ];

      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();

        osc.type = 'sawtooth';
        // lowpass filter to make it sound like the classic plastic speaker of the Urna
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        osc.frequency.setValueAtTime(n.freq, now + n.start);

        noteGain.gain.setValueAtTime(0, now + n.start);
        noteGain.gain.linearRampToValueAtTime(0.25, now + n.start + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + n.start + n.duration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + n.start);
        osc.stop(now + n.start + n.duration + 0.02);
      });

      setTimeout(() => {
        resolve();
      }, 850);
    } catch {
      resolve();
    }
  });
}
