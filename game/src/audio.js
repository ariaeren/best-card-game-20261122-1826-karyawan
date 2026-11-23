// Tiny WebAudio synth: no files, no network, no autoplay.
// A single AudioContext is created only after the first real player gesture.

let context = null;

function audioContext() {
  if (context) return context;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  context = new Ctor();
  return context;
}

function tone(frequency, duration, type = 'sine', volume = 0.06, delay = 0) {
  const ctx = audioContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playSelect() {
  tone(520, 0.09, 'triangle', 0.035);
}

export function playPlace() {
  tone(230, 0.14, 'sine', 0.05);
  tone(345, 0.1, 'triangle', 0.025, 0.05);
}

export function playWinPoint() {
  tone(523, 0.12, 'triangle', 0.05);
  tone(659, 0.14, 'triangle', 0.05, 0.08);
  tone(784, 0.2, 'sine', 0.05, 0.16);
}

export function playLossPoint() {
  tone(300, 0.16, 'sawtooth', 0.03);
  tone(196, 0.24, 'sine', 0.045, 0.08);
}

export function playDraw() {
  tone(392, 0.12, 'sine', 0.03);
}

export function playFanfare(won) {
  if (won) {
    [392, 523, 659, 784].forEach((f, i) => tone(f, 0.3, 'triangle', 0.06, i * 0.11));
  } else {
    [392, 330, 262, 196].forEach((f, i) => tone(f, 0.34, 'sine', 0.055, i * 0.13));
  }
}
