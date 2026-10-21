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

type Phase = {
  type: "inhale" | "hold" | "exhale" | "rest";
  label: string;
  seconds: number;
};

const techniques: { name: string; hint: string; phases: Phase[] }[] = [
  {
    name: "Спокойное дыхание",
    hint: "Вдох 4 · выдох 6",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "exhale", label: "Выдох", seconds: 6 },
    ],
  },
  {
    name: "Квадратное дыхание",
    hint: "Вдох 4 · задержка 4 · выдох 4 · пауза 4",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "hold", label: "Задержка", seconds: 4 },
      { type: "exhale", label: "Выдох", seconds: 4 },
      { type: "rest", label: "Пауза", seconds: 4 },
    ],
  },
  {
    name: "4-7-8",
    hint: "Вдох 4 · задержка 7 · выдох 8",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "hold", label: "Задержка", seconds: 7 },
      { type: "exhale", label: "Выдох", seconds: 8 },
    ],
  },
];

const durations = [1, 3, 5, 10];

const durationClasses: Record<number, string> = {
  4: "duration-[4000ms]",
  6: "duration-[6000ms]",
  7: "duration-[7000ms]",
  8: "duration-[8000ms]",
};

const ringLength = 2 * Math.PI * 140;

export default function RelaxPage() {
  const [techniqueIndex, setTechniqueIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [today, setToday] = useState({ sessions: 0, minutes: 0 });

  const phases = techniques[techniqueIndex].phases;
  const cycle = phases.reduce((sum, item) => sum + item.seconds, 0);
  const total = durations[durationIndex] * 60;
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
    fetch(`/api/meditation?tz=${new Date().getTimezoneOffset()}`)
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.sessions === "number") {
          setToday({ sessions: data.sessions, minutes: data.minutes });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || elapsed < total) return;
    const next = {
      sessions: today.sessions + 1,
      minutes: today.minutes + durations[durationIndex],
    };
    setRunning(false);
    setFinished(true);
    setToday(next);
    fetch("/api/meditation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minutes: durations[durationIndex],
        tz: new Date().getTimezoneOffset(),
      }),
    }).catch(() => {});
  }, [elapsed, running, total, today, durationIndex]);

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-28 text-white sm:px-6">
      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 text-center lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-xl">
            <Wind className="h-4 w-4 text-indigo-400" />
            Релакс
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Медитация
          </h1>
          <p className="mt-3 max-w-xl text-slate-400">
            Несколько минут осознанного дыхания снижают стресс и помогают
            держать курс на новые привычки.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <section className="flex flex-col items-center rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-10">
            <div className="relative flex h-72 w-72 items-center justify-center">
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
                className={`h-64 w-64 rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_80px_rgba(99,102,241,0.45)] transition-transform ease-in-out ${orbClass}`}
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
                ) : (
                  <span className="text-xl font-semibold">Готовы?</span>
                )}
              </div>
            </div>

            <div className="mt-8 text-5xl font-bold tabular-nums">
              {minutesLeft}:{secondsLeft}
            </div>
            <div className="mt-2 text-slate-400">
              {techniques[techniqueIndex].name}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button
                onClick={() => {
                  if (finished) {
                    setElapsed(0);
                    setFinished(false);
                    setRunning(true);
                    return;
                  }
                  setRunning((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 active:scale-95"
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
                onClick={() => {
                  setRunning(false);
                  setElapsed(0);
                  setFinished(false);
                }}
                aria-label="Сбросить"
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 active:scale-95"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold">Техника дыхания</h2>
              <div className="flex flex-col gap-2">
                {techniques.map((item, index) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      setTechniqueIndex(index);
                      setElapsed(0);
                      setRunning(false);
                      setFinished(false);
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      index === techniqueIndex
                        ? "border-indigo-400/60 bg-indigo-500/15"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-slate-400">{item.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold">Длительность</h2>
              <div className="grid grid-cols-4 gap-2">
                {durations.map((value, index) => (
                  <button
                    key={value}
                    onClick={() => {
                      setDurationIndex(index);
                      setElapsed(0);
                      setRunning(false);
                      setFinished(false);
                    }}
                    className={`rounded-2xl border py-3 text-sm font-medium transition ${
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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="mb-4 text-lg font-semibold">Сегодня</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/5 p-4">
                  <Sparkles className="mb-2 h-5 w-5 text-indigo-400" />
                  <div className="text-2xl font-bold tabular-nums">
                    {today.sessions}
                  </div>
                  <div className="text-sm text-slate-400">сессий</div>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <Clock className="mb-2 h-5 w-5 text-indigo-400" />
                  <div className="text-2xl font-bold tabular-nums">
                    {today.minutes}
                  </div>
                  <div className="text-sm text-slate-400">минут</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
