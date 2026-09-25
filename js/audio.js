/**
 * Razel 360 - Web Audio API Synthesizer
 * Zero MP3 dependencies; synthesizes dynamic chimes & whooshes
 */

let isAudioEnabled = true;
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (AudioClass) audioCtx = new AudioClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playPopSound() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(1040, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) { }
}

function playWhooshSound() {
  if (!isAudioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  } catch (e) { }
}

function toggleAudio() {
  isAudioEnabled = !isAudioEnabled;
  const btn = document.getElementById('btn-toggle-audio-switch');
  if (btn) {
    if (isAudioEnabled) {
      btn.className = "px-3 py-1 rounded-lg text-xs font-bold transition glass-active text-white";
      btn.innerText = "ON";
      playPopSound();
    } else {
      btn.className = "px-3 py-1 rounded-lg text-xs font-bold transition glass-button text-slate-400";
      btn.innerText = "OFF";
    }
  }
}
