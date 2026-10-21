"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { icons } from "../data";
import { Tracked, Progress, ServerHabit } from "../types";
import {
  ArrowLeft,
  Ban,
  Check,
  Flame,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

const HABITS_PATH = "/components/habits/first";
const DAY = 86400000;

const plural = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};

export default function Tracker() {
  const [tracked, setTracked] = useState<Tracked[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [now, setNow] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/habits")
      .then(({ data }) => {
        const rows: ServerHabit[] = Array.isArray(data) ? data : [];
        const trackedRows = rows.filter((row) => row.tracked);
        const next: Progress = {};
        trackedRows.forEach((row) => {
          next[row.key] = {
            startedAt: row.startedAt
              ? new Date(row.startedAt).getTime()
              : Date.now(),
            best: row.best,
            relapses: row.relapses,
          };
        });
        setTracked(
          trackedRows.map((row) => ({
            id: row.key,
            name: row.name,
            category: row.category,
            icon: row.icon,
            goalDays: row.trackedGoal,
          })),
        );
        setProgress(next);
        setNow(Date.now());
        setHydrated(true);
      })
      .catch((error) => {
        if (error?.response?.status === 401) router.replace("/");
        else setHydrated(true);
      });
  }, [router]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const relapse = async (id: string) => {
    if (!window.confirm("Сбросить серию и начать заново?")) return;
    try {
      const { data } = await axios.post(
        `/api/habits/${encodeURIComponent(id)}/relapse`,
        { tz: new Date().getTimezoneOffset() },
      );
      setNow(Date.now());
      setProgress((prev) => ({
        ...prev,
        [id]: {
          startedAt: new Date(data.startedAt).getTime(),
          best: data.best,
          relapses: data.relapses,
        },
      }));
    } catch {}
  };

  const items = tracked.map((habit) => {
    const startedAt = progress[habit.id]?.startedAt ?? now;
    const elapsed = Math.max(0, now - startedAt);
    const goalMs = habit.goalDays * DAY;
    const days = Math.floor(elapsed / DAY);
    return {
      ...habit,
      startedAt,
      elapsed: Math.min(elapsed, goalMs),
      goalMs,
      days,
      done: elapsed >= goalMs,
      percent: Math.min(100, Math.floor((elapsed / goalMs) * 100)),
      left: Math.max(0, habit.goalDays - days),
      best: Math.max(progress[habit.id]?.best ?? 0, days),
      relapses: progress[habit.id]?.relapses ?? 0,
    };
  });

  const completed = items.filter((item) => item.done).length;
  const longest = items.reduce((max, item) => Math.max(max, item.days), 0);

  const stats = [
    { label: "Привычек в работе", value: String(items.length), icon: Target },
    {
      label: "Лучшая серия",
      value: `${longest} ${plural(longest)}`,
      icon: Flame,
    },
    {
      label: "Целей достигнуто",
      value: `${completed} из ${items.length}`,
      icon: Trophy,
    },
  ];

  return (
    <div
      className={`relative min-h-screen px-4 pb-16 pt-50 text-slate-100 transition-opacity duration-300 sm:px-6 sm:pt-36 lg:px-10 lg:pb-20 ${
        hydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-4 text-sm text-slate-300 backdrop-blur">
              <span className="flex gap-1">
                <span className="h-1.5 w-6 rounded-full bg-[#6366F1]" />
                <span className="h-1.5 w-6 rounded-full bg-[#6366F1]" />
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
                Шаг 2 из 2
              </span>
            </div>
            <h1
              className={` bg-linear-to-b from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl`}
            >
              Мой прогресс
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400">
              Каждый день без привычки заполняет шкалу. Сорвался — сбрось серию
              и начни заново, рекорд сохранится.
            </p>
          </div>
          <Link
            href={HABITS_PATH}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F1A] active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Изменить привычки
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-20 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
              <Flame className="h-7 w-7" />
            </span>
            <p className={` text-lg font-semibold`}>
              Пока нет отслеживаемых привычек
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-400">
              Выбери привычки, задай цели и нажми «Начать отслеживать»
            </p>
            <Link
              href={HABITS_PATH}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Выбрать привычки
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-3 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827]/60 p-4 backdrop-blur"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#6366F1]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span
                        className={` block truncate text-xl font-semibold leading-none tabular-nums`}
                      >
                        {stat.value}
                      </span>
                      <span className="mt-1.5 block text-xs text-slate-500">
                        {stat.label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>

            <ul className="grid gap-4 lg:grid-cols-2">
              {items.map((item) => {
                const Icon = icons[item.icon] ?? Ban;
                return (
                  <li
                    key={item.id}
                    className={`rounded-3xl border p-5 shadow-2xl shadow-black/30 backdrop-blur-xl transition ${
                      item.done
                        ? "border-emerald-500/30 bg-emerald-500/4"
                        : "border-white/10 bg-[#111827]/70"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                          item.done
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-[#6366F1]/15 text-[#6366F1]"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-100">
                          {item.name}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {item.category} · с{" "}
                          {new Date(item.startedAt).toLocaleDateString(
                            "ru-RU",
                            { day: "numeric", month: "short" },
                          )}
                        </span>
                      </span>
                      <span
                        className={` text-2xl font-bold tabular-nums ${
                          item.done ? "text-emerald-300" : "text-slate-100"
                        }`}
                      >
                        {item.percent}%
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p>
                        <span className={` text-3xl font-bold tabular-nums`}>
                          {item.days}
                        </span>{" "}
                        <span className="text-sm text-slate-400">
                          {plural(item.days)} из {item.goalDays}
                        </span>
                      </p>
                      {item.done ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                          <Check className="h-3.5 w-3.5" />
                          Цель достигнута
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">
                          Осталось {item.left} {plural(item.left)}
                        </span>
                      )}
                    </div>

                    <progress
                      value={item.elapsed}
                      max={item.goalMs}
                      aria-label={`Прогресс: ${item.name}`}
                      className={`mt-3 h-2.5 w-full appearance-none overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-700 [&::-moz-progress-bar]:rounded-full ${
                        item.done
                          ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
                          : "[&::-webkit-progress-value]:bg-[#6366F1] [&::-moz-progress-bar]:bg-[#6366F1]"
                      }`}
                    />

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        Рекорд:{" "}
                        <span className="tabular-nums text-slate-300">
                          {item.best} {plural(item.best)}
                        </span>
                        <span className="mx-2 text-slate-700">·</span>
                        Срывов:{" "}
                        <span className="tabular-nums text-slate-300">
                          {item.relapses}
                        </span>
                      </p>
                      <button
                        onClick={() => relapse(item.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Сорвался
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
