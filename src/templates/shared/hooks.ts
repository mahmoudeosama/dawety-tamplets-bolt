import { useEffect, useRef, useState } from 'react';

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

export function useCountdown(date?: string): TimeLeft {
  const target = date ? new Date(date).getTime() : 0;
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(target));

  useEffect(() => {
    if (!date) return;
    const id = setInterval(() => setTimeLeft(computeTimeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target, date]);

  return timeLeft;
}

/**
 * Lightweight ambient background music toggle.
 * Generates a soft, royalty-free ambient tone via the Web Audio API so the
 * invitation works without external audio assets. Returns play/pause controls.
 */
export function useAmbientMusic() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ osc: OscillatorNode[]; gain: GainNode } | null>(null);

  const start = () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
    }
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    // Soft major chord pad
    const freqs = [196.0, 246.94, 293.66, 392.0];
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.18;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      // gentle vibrato
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.2;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();
      return osc;
    });

    gain.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 1.4);
    nodesRef.current = { osc: oscs, gain };
    setPlaying(true);
  };

  const stop = () => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (ctx && nodes) {
      nodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
      setTimeout(() => {
        nodes.osc.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
      }, 700);
      nodesRef.current = null;
    }
    setPlaying(false);
  };

  const toggle = () => (playing ? stop() : start());

  useEffect(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    return () => {
      if (ctx && nodes) {
        nodes.osc.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* noop */
          }
        });
      }
    };
  }, []);

  return { playing, toggle };
}

export function useLockBody(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [locked]);
}
