"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { weekDays, toKey } from "./data";
import { HABITS_PATH } from "@/app/habits/data";
import { getHabits, getLogs } from "@/app/lib/local";

type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};

export default function Calendar() {
  const today = new Date();
  const todayKey = toKey(today);
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const [trackedCount, setTrackedCount] = useState<number | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    getHabits()
      .then((rows) => setTrackedCount(rows.filter((row) => row.tracked).length))
      .catch(() => setTrackedCount(0));
  }, []);

  useEffect(() => {
    let cancelled = false;
    getLogs(monthKey)
      .then((data) => {
        if (!cancelled) setLogs(data);
      })
      .catch(() => {
        if (!cancelled) setLogs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  const logsByDay = useMemo(() => {
    const map: Record<string, HabitLog[]> = {};
    logs.forEach((l) => {
      const k = l.date.slice(0, 10);
      (map[k] ||= []).push(l);
    });
    return map;
  }, [logs]);

  const cells = useMemo(() => {
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const total = Math.ceil((offset + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const date = new Date(year, month, i - offset + 1);
      return {
        key: toKey(date),
        day: date.getDate(),
        inMonth: date.getMonth() === month,
      };
    });
  }, [year, month]);

  const successCount = logs.filter((l) => l.completed).length;
  const failCount = logs.length - successCount;

  const monthName = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(cursor);
  const monthTitle = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-24 text-white sm:px-6 sm:pt-32 lg:flex lg:h-dvh lg:min-h-150 lg:flex-col lg:overflow-hidden lg:pb-6 lg:pt-24">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col lg:min-h-0 lg:flex-1">
        <div className="mb-5 sm:mb-8 lg:mb-4 lg:shrink-0">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-4xl">
            Твои дни
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400 lg:mt-1.5 lg:[@media(max-height:820px)]:hidden">
            Зелёные дни прошли без срывов, красные — со срывом.
          </p>
        </div>

        <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_320px] lg:grid-rows-[minmax(0,1fr)]">
          <section className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-6 lg:min-h-0 lg:p-4">
            <div className="mb-3 flex items-center justify-between gap-3 sm:mb-6 lg:mb-3 lg:shrink-0">
              <h2 className="text-xl font-semibold sm:text-3xl lg:text-xl">
                {monthTitle}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() =>
                    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
                  }
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
                >
                  Сегодня
                </button>
                <button
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                  className="rounded-xl bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10"
                  aria-label="Предыдущий месяц"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                  className="rounded-xl bg-white/5 p-1.5 text-slate-200 transition hover:bg-white/10"
                  aria-label="Следующий месяц"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-1.5 grid grid-cols-7 gap-1 sm:gap-2 lg:mb-1 lg:shrink-0">
              {weekDays.map((w) => (
                <div
                  key={w}
                  className="py-1 text-center text-xs font-medium text-slate-500 lg:py-0.5"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:min-h-0 lg:flex-1 lg:auto-rows-fr lg:gap-1.5">
              {cells.map((c) => {
                const dayLogs = logsByDay[c.key] ?? [];
                const ok = dayLogs.filter((l) => l.completed).length;
                const fail = dayLogs.length - ok;
                return (
                  <div
                    key={c.key}
                    className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-sm sm:aspect-auto sm:min-h-20 sm:items-start sm:justify-between sm:p-2.5 lg:min-h-0 lg:p-1.5 ${
                      c.inMonth ? "text-white" : "text-slate-600"
                    } ${
                      fail > 0
                        ? "border-red-500/30 bg-red-500/12"
                        : ok > 0
                          ? "border-emerald-500/30 bg-emerald-500/12"
                          : "border-white/5 bg-white/3"
                    } ${c.key === todayKey ? "ring-2 ring-primary" : ""}`}
                  >
                    <span className="font-medium tabular-nums">{c.day}</span>
                    <span className="flex h-1.5 items-center gap-1">
                      {ok > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      {fail > 0 && <span className="h-1.5 w-1.5 rounded-full bg-red-400" />}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:p-3">
                <p className="text-xs text-slate-500">Без срывов</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-emerald-400">
                  {successCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:p-3">
                <p className="text-xs text-slate-500">Срывы</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-red-400">
                  {failCount}
                </p>
              </div>
            </div>

            {trackedCount === 0 && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-400">
                Привычек пока нет — отмечать нечего
                <Link
                  href={HABITS_PATH}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  Выбрать привычки
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
