import { useCallback, useRef } from 'react';

export const useSound = () => {
  const audioCtx = useRef(null);

  const initAudio = useCallback(() => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  }, []);

  const playTone = useCallback((frequency, type = 'sine', duration = 0.1, volume = 0.1) => {
    initAudio();
    const ctx = audioCtx.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }, [initAudio]);

  const soundLibrary = {
    click: () => playTone(800, 'sine', 0.05, 0.05),
    error: () => playTone(150, 'sawtooth', 0.3, 0.1),
    submit: () => playTone(600, 'sine', 0.1, 0.05),
    win: () => {
      playTone(523.25, 'sine', 0.2, 0.1); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.4, 0.1), 200); // G5
    }
  };

  return soundLibrary;
};
