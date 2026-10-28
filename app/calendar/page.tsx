"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { weekDays, toKey } from "./data";
import { HABITS_PATH } from "@/app/habits/data";
import { getHabits, getLogs } from "@/app/lib/local";

type Habit = { id: string; name: string };
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
  const [selected, setSelected] = useState(todayKey);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    getHabits()
      .then((rows) =>
        setHabits(
          rows
            .filter((row) => row.tracked)
            .map((row) => ({ id: row.id, name: row.name })),
        ),
      )
      .catch(() => setHabits([]));
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

  const [sy, sm, sd] = selected.split("-").map(Number);
  const selectedDate = new Date(sy, sm - 1, sd);
  const selectedLogs = logsByDay[selected] ?? [];

  const monthTitle = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(cursor);
  const selectedTitle = new Intl.DateTimeFormat("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(selectedDate);

  return (
    <main className="relative min-h-screen px-4 pb-16 pt-28 text-white sm:px-6 lg:flex lg:h-dvh lg:min-h-150 lg:flex-col lg:overflow-hidden lg:pb-6 lg:pt-24">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col lg:min-h-0 lg:flex-1">
        <div className="mb-10 text-center lg:mb-4 lg:shrink-0 lg:text-left">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-xl lg:mb-2">
            <CalendarDays className="h-4 w-4 text-indigo-400" />
            Календарь
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-4xl">
            Твои дни
          </h1>
          <p className="mt-3 max-w-xl text-slate-400 lg:mt-1.5 lg:text-sm lg:[@media(max-height:820px)]:hidden">
            Успешные дни отмечены зелёным, сорванные — красным. <br /> Нажмите
            на любой день, чтобы увидеть подробности.
          </p>
        </div>

        <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_380px] lg:grid-rows-[minmax(0,1fr)] lg:gap-4">
          <section className="flex flex-col rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6 lg:min-h-0 lg:p-4">
            <div className="mb-6 flex items-center justify-between gap-3 lg:mb-3 lg:shrink-0">
              <h2 className="text-2xl font-semibold capitalize sm:text-3xl lg:text-xl">
                {monthTitle}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCursor(
                      new Date(today.getFullYear(), today.getMonth(), 1),
                    );
                    setSelected(todayKey);
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 lg:py-1.5"
                >
                  Сегодня
                </button>
                <button
                  onClick={() => setCursor(new Date(year, month - 1, 1))}
                  className="rounded-xl bg-[#6366F1] p-2 text-white transition hover:bg-[#5558E8] lg:p-1.5"
                  aria-label="Предыдущий месяц"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                  className="rounded-xl bg-[#6366F1] p-2 text-white transition hover:bg-[#5558E8] lg:p-1.5"
                  aria-label="Следующий месяц"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2 lg:mb-1 lg:shrink-0">
              {weekDays.map((w) => (
                <div
                  key={w}
                  className="py-1 text-center text-xs font-medium uppercase tracking-wide text-slate-500 lg:py-0.5"
                >
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:min-h-0 lg:flex-1 lg:auto-rows-fr lg:gap-1.5">
              {cells.map((c) => {
                const dayLogs = logsByDay[c.key] ?? [];
                const ok = dayLogs.filter((l) => l.completed).length;
                const fail = dayLogs.length - ok;
                return (
                  <button
                    key={c.key}
                    onClick={() => setSelected(c.key)}
                    className={`flex min-h-14 flex-col items-start justify-between rounded-xl border p-2 text-left transition sm:min-h-24 sm:p-3 lg:min-h-0 lg:p-1.5 ${
                      c.inMonth ? "text-white" : "text-slate-600"
                    } ${
                      fail > 0
                        ? "border-red-500/30 bg-red-500/10"
                        : ok > 0
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/5 bg-white/3"
                    } ${c.key === selected ? "ring-2 ring-[#6366F1]" : "hover:bg-white/10"}`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-sm font-medium sm:h-7 sm:w-7 lg:h-6 lg:w-6 ${
                        c.key === todayKey ? "bg-white/20 font-semibold" : ""
                      }`}
                    >
                      {c.day}
                    </span>
                    <span className="flex items-center gap-2 text-[10px] font-medium sm:text-xs">
                      {ok > 0 && (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {ok}
                        </span>
                      )}
                      {fail > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                          {fail}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="flex flex-col gap-6 lg:min-h-0 lg:gap-3">
            <div className="grid grid-cols-2 gap-4 lg:shrink-0 lg:gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Без срывов
                </p>
                <p className="mt-2 text-3xl font-semibold text-emerald-400 lg:mt-1 lg:text-2xl">
                  {successCount}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl lg:p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Срывы
                </p>
                <p className="mt-2 text-3xl font-semibold text-red-400 lg:mt-1 lg:text-2xl">
                  {failCount}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:p-4">
              <h2 className="text-xl font-semibold capitalize lg:shrink-0 lg:text-lg">
                {selectedTitle}
              </h2>

              <ul className="mt-4 flex flex-col gap-2 lg:mt-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
                {habits.length === 0 && (
                  <li className="flex flex-col items-center rounded-xl border border-dashed border-white/10 p-4 text-center text-sm text-slate-500">
                    Привычек пока нет
                    <Link
                      href={HABITS_PATH}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      Выбрать привычки
                    </Link>
                  </li>
                )}
                {habits.map((h) => {
                  const log = selectedLogs.find((l) => l.habitId === h.id);
                  return (
                    <li
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 lg:py-2.5"
                    >
                      <span className="truncate text-sm font-medium">
                        {h.name}
                      </span>
                      {log ? (
                        log.completed ? (
                          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-emerald-400">
                            <Check className="h-4 w-4" />
                            Без срыва
                          </span>
                        ) : (
                          <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-red-400">
                            <X className="h-4 w-4" />
                            Срыв
                          </span>
                        )
                      ) : (
                        <span className="shrink-0 text-xs text-slate-500">
                          Нет отметки
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
