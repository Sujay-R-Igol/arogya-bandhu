// Web Audio API Synthesizer for Sentinel CHO Dashboard
// Procedural audio generation ensures zero asset dependencies and instant feedback.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard and vendor-prefixed AudioContext support
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Low-level helper to play custom tones
export function playTone(
  freq: number,
  type: OscillatorType = 'sine',
  duration = 0.2,
  gainStart = 0.1,
  rampType: 'exponential' | 'linear' = 'exponential'
) {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // Handle suspended state due to browser autoplay policies
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gainNode.gain.setValueAtTime(gainStart, ctx.currentTime);
    if (rampType === 'exponential') {
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    } else {
      gainNode.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + duration);
    }

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio Context failed to emit tone:', e);
  }
}

// 1. Dual-tone notification chime (pleasant, clinical)
export function playNotificationChime() {
  const ctx = getAudioContext();
  if (!ctx) return;
  
  // High-pitched notification ping (523Hz [C5] followed by 784Hz [G5])
  playTone(523.25, 'sine', 0.25, 0.1);
  setTimeout(() => {
    playTone(783.99, 'sine', 0.35, 0.08);
  }, 100);
}

// 2. High-urgency pulse alarm for incoming SOS requests (two-tone alternating siren)
let alarmInterval: NodeJS.Timeout | null = null;
export function startEmergencyAlarm() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (alarmInterval) return; // Already running

  let high = true;
  alarmInterval = setInterval(() => {
    // Alternating between 880Hz (A5) and 660Hz (E5) saw-tooth waves
    playTone(high ? 880 : 660, 'sawtooth', 0.2, 0.06, 'linear');
    high = !high;
  }, 220);
}

export function stopEmergencyAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  // Pleasant resolution tone
  playSuccessArpeggio();
}

// 3. Successful resolution chime (rising major chord)
export function playSuccessArpeggio() {
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 'sine', 0.4, 0.08);
    }, idx * 80);
  });
}

// 4. Heavy emergency alert sound (single heavy warning gong)
export function playWarningGong() {
  playTone(220, 'triangle', 0.8, 0.25);
  setTimeout(() => {
    playTone(110, 'sine', 1.0, 0.15);
  }, 100);
}
