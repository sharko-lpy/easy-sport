"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS = [30, 60, 90, 120];

function playBeep() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => ctx.close();
  } catch {
    // Web Audio indisponible, on ignore simplement le son.
  }
}

// Chrono de repos entre les séries : presets rapides + décompte + bip à zéro.
export default function RestTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          playBeep();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function start() {
    if (remaining === 0) setRemaining(duration);
    setRunning(true);
  }

  function pause() {
    setRunning(false);
  }

  function selectDuration(d: number) {
    setRunning(false);
    setDuration(d);
    setRemaining(d);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = duration > 0 ? remaining / duration : 0;

  return (
    <div className="rounded-xl border border-white/15 bg-white/5 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-white/60">Chrono de repos</p>
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => selectDuration(p)}
              className={`rounded-md px-2 py-1 text-xs ${
                duration === p
                  ? "bg-brand text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {p}s
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-3xl font-bold tabular-nums text-white">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </p>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-300 to-pink-600 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        {running ? (
          <button
            type="button"
            onClick={pause}
            className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10"
          >
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
          >
            {remaining === duration ? "Démarrer le repos" : "Reprendre"}
          </button>
        )}
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-white hover:bg-white/10"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
