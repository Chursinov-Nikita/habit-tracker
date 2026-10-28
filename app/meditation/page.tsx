"use client";

import { useEffect, useState } from "react";
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Check,
  Sparkles,
} from "lucide-react";
import {
  techniques,
  durations,
  durationClasses,
  ringLength,
} from "./data";
import { addMeditation, getMeditationToday } from "@/app/lib/local";
import { sound } from "@/app/lib/sound";

export default function Meditation() {
  const [techniqueIndex, setTechniqueIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [today, setToday] = useState({ sessions: 0, minutes: 0 });

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

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-28 text-white sm:px-6 lg:pb-6 lg:pt-24">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 text-center lg:mb-4 lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-xl lg:mb-2">
            <Wind className="h-4 w-4 text-indigo-400" />
            Релакс
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-4xl">
            Медитация
          </h1>
          <p className="mt-3 max-w-xl text-slate-400 lg:mt-1.5 lg:text-sm lg:[@media(max-height:820px)]:hidden">
            Несколько минут осознанного дыхания снижают стресс и помогают
            держать курс на новые привычки.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:gap-4">
          <section className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10 lg:justify-center lg:p-6">
            <div className="relative flex h-72 w-72 items-center justify-center lg:h-[min(18rem,34dvh)] lg:w-[min(18rem,34dvh)]">
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
                className={`h-[89%] w-[89%] rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_80px_rgba(99,102,241,0.45)] transition-transform ease-in-out ${orbClass}`}
              />

              <div className="absolute flex flex-col items-center text-center">
                {finished ? (
                  <>
                    <Check className="mb-1 h-8 w-8" />
                    <span className="text-xl font-semibold">Готово</span>
                  </>
                ) : running ? (
                  <>
                    <span className="text-xl font-semibold">{phase.label}</span>
                    <span className="text-4xl font-bold tabular-nums">
                      {phaseLeft}
                    </span>
                  </>
                ) : paused ? (
                  <>
                    <Pause className="mb-1 h-8 w-8" />
                    <span className="text-xl font-semibold">Пауза</span>
                  </>
                ) : (
                  <span className="text-xl font-semibold">Готовы?</span>
                )}
              </div>
            </div>

            <div className="mt-8 text-5xl font-bold tabular-nums lg:mt-5 lg:text-4xl">
              {minutesLeft}:{secondsLeft}
            </div>
            <div className="mt-2 text-slate-400 lg:mt-1">
              {techniques[techniqueIndex].name}
            </div>

            <div className="mt-8 flex items-center gap-3 lg:mt-5">
              <button
                onClick={() => {
                  if (finished) {
                    setElapsed(0);
                    setRunning(true);
                    return;
                  }
                  setRunning((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 active:scale-95 lg:py-3"
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
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95 lg:h-11 lg:w-11"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </section>

          <aside className="flex flex-col gap-6 lg:gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:p-3">
              <h2 className="mb-4 text-lg font-semibold lg:mb-2 lg:text-base">
                Техника дыхания
              </h2>
              <div className="flex flex-col gap-2 lg:gap-1.5">
                {techniques.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setTechniqueIndex(index);
                      reset();
                    }}
                    aria-pressed={index === techniqueIndex}
                    className={`rounded-2xl border px-4 py-3 text-left transition lg:py-2 ${
                      index === techniqueIndex
                        ? "border-indigo-400/60 bg-indigo-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-slate-400 lg:text-xs lg:[@media(max-height:760px)]:hidden">
                      {item.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:p-3">
              <h2 className="mb-4 text-lg font-semibold lg:mb-2 lg:text-base">
                Длительность
              </h2>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((value, index) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDurationIndex(index);
                      reset();
                    }}
                    aria-pressed={index === durationIndex}
                    className={`rounded-2xl border py-3 text-sm font-medium transition lg:py-2 ${
                      index === durationIndex
                        ? "border-indigo-400/60 bg-indigo-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {value} мин
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl lg:p-3">
              <h2 className="mb-4 text-lg font-semibold lg:mb-2 lg:text-base">
                Сегодня
              </h2>
              <div className="grid grid-cols-2 gap-3 lg:gap-2">
                <div className="rounded-2xl bg-white/5 p-4 lg:flex lg:items-center lg:gap-3 lg:p-2.5">
                  <Sparkles className="mb-2 h-5 w-5 text-indigo-400 lg:mb-0 lg:shrink-0" />
                  <div>
                    <div className="text-2xl font-bold tabular-nums lg:text-xl lg:leading-none">
                      {today.sessions}
                    </div>
                    <div className="text-sm text-slate-400 lg:text-xs">
                      сессий
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 lg:flex lg:items-center lg:gap-3 lg:p-2.5">
                  <Clock className="mb-2 h-5 w-5 text-indigo-400 lg:mb-0 lg:shrink-0" />
                  <div>
                    <div className="text-2xl font-bold tabular-nums lg:text-xl lg:leading-none">
                      {today.minutes}
                    </div>
                    <div className="text-sm text-slate-400 lg:text-xs">
                      минут
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
