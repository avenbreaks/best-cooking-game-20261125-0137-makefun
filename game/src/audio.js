// Small WebAudio blips for every kitchen action: a chop thock, a fry sizzle
// start, a serve ding and an error buzz. Everything is guarded: a browser
// without audio (or a headless screenshot run) simply stays silent.
let context = null;

function audio() {
  if (context) return context;
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

function blip(freq, seconds, type, gainValue) {
  const ctx = audio();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(gainValue, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + seconds);
  } catch {
    // Sound is garnish: a failure here must never break the game.
  }
}

export const SOUNDS = {
  chop() {
    blip(180, 0.08, 'square', 0.12);
  },
  pickup() {
    blip(520, 0.07, 'sine', 0.1);
  },
  place() {
    blip(340, 0.09, 'triangle', 0.12);
  },
  sizzle() {
    blip(900, 0.15, 'sawtooth', 0.05);
    blip(1200, 0.12, 'sawtooth', 0.04);
  },
  ding() {
    blip(880, 0.25, 'sine', 0.14);
    setTimeout(() => blip(1318, 0.3, 'sine', 0.12), 90);
  },
  error() {
    blip(140, 0.18, 'sawtooth', 0.1);
  },
  tick() {
    blip(660, 0.05, 'sine', 0.06);
  },
  rush() {
    blip(440, 0.12, 'square', 0.08);
    setTimeout(() => blip(587, 0.12, 'square', 0.08), 130);
  },
};
