// SoundEngine.js
export const playSound = (type) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
  
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
  
    if (type === "punch") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.2);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "correct") {
      osc.type = "square";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "error") {
      osc.type = "square";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === "win") {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      let time = now;
      notes.forEach((note) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "square";
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = note;
          g.gain.setValueAtTime(0.1, time);
          g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
          o.start(time);
          o.stop(time + 0.15);
          time += 0.1;
      });
    } else if (type === "lose") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.8);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.8);
      osc.start(now);
      osc.stop(now + 0.8);
    }
  };