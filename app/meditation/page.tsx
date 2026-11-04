"use client";

import { useEffect, useState } from "react";
import { Check, Pause, Play, RotateCcw } from "lucide-react";
import {
  techniques,
  durations,
  durationClasses,
  ringLength,
} from "./data";
import { addMeditation, getMeditationToday } from "@/app/lib/local";
import { sound } from "@/app/lib/sound";
import useWakeLock from "./useWakeLock";

export default function Meditation() {
  const [techniqueIndex, setTechniqueIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [today, setToday] = useState({ sessions: 0, minutes: 0 });

  useWakeLock(running);

  const phases = techniques[techniqueIndex].phases;
  const cycle = phases.reduce((sum, item) => sum + item.seconds, 0);
  const total = durations[durationIndex] * 60;
  const finished = elapsed >= total;
  const paused = !running && !finished && elapsed > 0;
  const left = Math.max(total - elapsed, 0);
  const position = elapsed % cycle;

  let phaseIndex = 0;
  let passed = 0;
  for (let i = 0; i < phases.length; i++) {
    if (position < passed + phases[i].seconds) {
      phaseIndex = i;
      break;
    }
    passed += phases[i].seconds;
  }

  const phase = phases[phaseIndex];
  const phaseLeft = passed + phase.seconds - position;
  const expanded =
    running && (phase.type === "inhale" || phase.type === "hold");
  const orbClass = !running
    ? "scale-50 duration-700"
    : `${expanded ? "scale-100" : "scale-50"} ${durationClasses[phase.seconds] ?? "duration-[4000ms]"}`;
  const minutesLeft = String(Math.floor(left / 60)).padStart(2, "0");
  const secondsLeft = String(left % 60).padStart(2, "0");
  const progressOffset = ringLength * (1 - Math.min(elapsed / total, 1));

  useEffect(() => {
    getMeditationToday()
      .then(setToday)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (running) sound.breathe(phase.type);
  }, [running, phaseIndex, phase.type]);

  useEffect(() => {
    if (!running || finished) return;
    const id = setTimeout(() => {
      const next = elapsed + 1;
      setElapsed(next);
      if (next < total) return;
      const minutes = durations[durationIndex];
      sound.finish();
      setRunning(false);
      setToday((prev) => ({
        sessions: prev.sessions + 1,
        minutes: prev.minutes + minutes,
      }));
      addMeditation(minutes).catch(() => {});
    }, 1000);
    return () => clearTimeout(id);
  }, [running, finished, elapsed, total, durationIndex]);

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  const sessionsWord =
    today.sessions % 10 === 1 && today.sessions % 100 !== 11
      ? "сессия"
      : [2, 3, 4].includes(today.sessions % 10) &&
          ![12, 13, 14].includes(today.sessions % 100)
        ? "сессии"
        : "сессий";

  const segment = (active: boolean) =>
    `rounded-xl px-2 py-2 text-xs font-medium transition sm:text-sm ${
      active
        ? "bg-primary text-white shadow-md shadow-primary/30"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-24 text-white sm:px-6 sm:pt-32 lg:pb-6 lg:pt-24">
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-5 sm:mb-8 lg:mb-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-4xl">
            Медитация
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Сегодня: {today.sessions} {sessionsWord} · {today.minutes} мин
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_320px]">
          <section className="flex min-w-0 flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-4 py-6 backdrop-blur-xl sm:p-10 lg:justify-center lg:p-6">
            <div className="relative flex aspect-square w-full max-w-60 items-center justify-center sm:max-w-72 lg:h-[min(18rem,34dvh)] lg:w-[min(18rem,34dvh)]">
              <svg
                viewBox="0 0 288 288"
                className="absolute inset-0 h-full w-full -rotate-90"
              >
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="3"
                />
                <circle
                  cx="144"
                  cy="144"
                  r="140"
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={ringLength}
                  strokeDashoffset={progressOffset}
                  className="transition-[stroke-dashoffset] duration-1000 ease-linear"
                />
              </svg>

              <div
                className={`h-[89%] w-[89%] rounded-full bg-linear-to-br from-primary via-violet-500 to-cyan-400 shadow-[0_0_80px_rgba(99,102,241,0.45)] transition-transform ease-in-out ${orbClass}`}
              />

              <div className="absolute flex flex-col items-center text-center">
                {finished ? (
                  <>
                    <Check className="mb-1 h-7 w-7" />
                    <span className="text-lg font-semibold">Готово</span>
                  </>
                ) : running ? (
                  <>
                    <span className="text-lg font-semibold">{phase.label}</span>
                    <span className="text-3xl font-bold tabular-nums">
                      {phaseLeft}
                    </span>
                  </>
                ) : paused ? (
                  <>
                    <Pause className="mb-1 h-7 w-7" />
                    <span className="text-lg font-semibold">Пауза</span>
                  </>
                ) : (
                  <span className="text-lg font-semibold">Готовы?</span>
                )}
              </div>
            </div>

            <div className="mt-5 text-4xl font-bold tabular-nums sm:mt-8 sm:text-5xl lg:mt-5 lg:text-4xl">
              {minutesLeft}:{secondsLeft}
            </div>

            <div className="mt-5 flex items-center gap-3 sm:mt-8 lg:mt-5">
              <button
                onClick={() => {
                  if (finished) {
                    setElapsed(0);
                    setRunning(true);
                    return;
                  }
                  setRunning((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-hover active:scale-95"
              >
                {running ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
                {running
                  ? "Пауза"
                  : finished
                    ? "Ещё раз"
                    : elapsed > 0
                      ? "Продолжить"
                      : "Начать"}
              </button>
              <button
                onClick={reset}
                aria-label="Сбросить"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </section>

          <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:self-start">
            <div>
              <p className="mb-2 text-xs text-slate-500">Техника</p>
              <div className="grid grid-cols-3 gap-1 rounded-2xl bg-ink/60 p-1">
                {techniques.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setTechniqueIndex(index);
                      reset();
                    }}
                    aria-pressed={index === techniqueIndex}
                    className={segment(index === techniqueIndex)}
                  >
                    {item.name.split(" ")[0]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {techniques[techniqueIndex].hint}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs text-slate-500">Длительность</p>
              <div className="grid grid-cols-4 gap-1 rounded-2xl bg-ink/60 p-1">
                {durations.map((value, index) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDurationIndex(index);
                      reset();
                    }}
                    aria-pressed={index === durationIndex}
                    className={segment(index === durationIndex)}
                  >
                    {value} мин
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
