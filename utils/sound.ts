
export type SFXType = 
  | 'click' 
  | 'flip' 
  | 'start'
  | 'attack' 
  | 'block'
  | 'heal' 
  | 'coin' 
  | 'magic' 
  | 'evil' 
  | 'damage' 
  | 'level_up' 
  | 'game_over_win' 
  | 'game_over_loss';

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    // @ts-ignore - Handle vendor prefixes if strictly necessary, though standard is widely supported now
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

export const playSFX = (type: SFXType) => {
  try {
    const ctx = getContext();
    if (!ctx) return;
    
    // Resume context if suspended (browser policy requires user gesture)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {}); 
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'click':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'flip': // Soft noise/snap
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case 'start': // Ascending major arpeggio
        playNote(ctx, 261.63, now, 0.1, 'triangle'); // C4
        playNote(ctx, 329.63, now + 0.1, 0.1, 'triangle'); // E4
        playNote(ctx, 392.00, now + 0.2, 0.1, 'triangle'); // G4
        playNote(ctx, 523.25, now + 0.3, 0.4, 'triangle'); // C5
        break;

      case 'attack': // Sharp noise/sawtooth burst
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'block': // Metal clank
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case 'heal': // Rising sine waves (angelic)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.2);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        // Harmony
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(450, now); // Fifth above roughly
        osc2.frequency.linearRampToValueAtTime(900, now + 0.4);
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(0.1, now + 0.2);
        gain2.gain.linearRampToValueAtTime(0, now + 0.4);
        osc2.start(now);
        osc2.stop(now + 0.4);
        break;

      case 'coin': // High pitch double ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1600, now + 0.05); // Second ping
        gain3.gain.setValueAtTime(0.1, now + 0.05);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc3.start(now + 0.05);
        osc3.stop(now + 0.15);
        break;

      case 'magic': // Vibrato/FM-ish
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        // Tremolo effect manually by wobbling gain isn't easy without LFO node, keeping simple
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'evil': // Low dissonant drone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        
        const oscEvil = ctx.createOscillator();
        const gainEvil = ctx.createGain();
        oscEvil.connect(gainEvil);
        gainEvil.connect(ctx.destination);
        oscEvil.type = 'square';
        oscEvil.frequency.setValueAtTime(73, now); // Tritone-ish
        gainEvil.gain.setValueAtTime(0.1, now);
        gainEvil.gain.linearRampToValueAtTime(0, now + 0.4);
        oscEvil.start(now);
        oscEvil.stop(now + 0.4);
        break;

      case 'damage': // Low impact/thud
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'level_up': // Fast run up
        [261, 329, 392, 523, 659, 783, 1046].forEach((freq, i) => {
           playNote(ctx, freq, now + (i * 0.05), 0.05, 'square');
        });
        break;

      case 'game_over_win': // Fanfare
        playNote(ctx, 523.25, now, 0.15, 'square'); // C
        playNote(ctx, 523.25, now + 0.15, 0.15, 'square'); // C
        playNote(ctx, 523.25, now + 0.3, 0.15, 'square'); // C
        playNote(ctx, 659.25, now + 0.45, 0.6, 'square'); // E
        playNote(ctx, 783.99, now + 0.8, 0.8, 'square'); // G
        break;
        
      case 'game_over_loss': // Sad descent
        playNote(ctx, 392.00, now, 0.3, 'triangle'); // G
        playNote(ctx, 369.99, now + 0.3, 0.3, 'triangle'); // F#
        playNote(ctx, 349.23, now + 0.6, 0.3, 'triangle'); // F
        playNote(ctx, 329.63, now + 0.9, 1.0, 'sawtooth'); // E (low)
        break;
    }
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

// Helper for simple notes
const playNote = (ctx: AudioContext, freq: number, time: number, duration: number, type: OscillatorType) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    osc.start(time);
    osc.stop(time + duration);
};
