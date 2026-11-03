"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { weekDays, toKey } from "./data";
import { plural } from "@/app/habits/data";
import { getLogs } from "@/app/lib/local";

type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
};

export default function MonthCalendar({ version }: { version: number }) {
  const today = new Date();
  const todayKey = toKey(today);
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`;
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

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
  }, [monthKey, version]);

  const failedDays = new Set(
    logs.filter((log) => !log.completed).map((log) => log.date.slice(0, 10)),
  );
  const cleanDays = new Set(
    logs
      .map((log) => log.date.slice(0, 10))
      .filter((day) => day < todayKey && !failedDays.has(day)),
  );

  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: daysInMonth }, (_, i) => ({
    key: toKey(new Date(year, month, i + 1)),
    day: i + 1,
  }));

  const monthName = new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(
    cursor,
  );
  const monthTitle = `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}${
    year === today.getFullYear() ? "" : ` ${year}`
  }`;

  return (
    <section className="rounded-3xl border border-white/10 bg-surface/70 p-4 backdrop-blur-xl lg:max-w-xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <CalendarDays className="h-4 w-4 text-primary-soft" />
          {monthTitle}
        </p>
        <div className="flex items-center gap-1">
          {!isCurrentMonth && (
            <button
              onClick={() =>
                setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
              }
              className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            >
              Сегодня
            </button>
          )}
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10"
            aria-label="Следующий месяц"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1">
        {weekDays.map((weekDay) => (
          <div
            key={weekDay}
            className="text-center text-[11px] font-medium text-slate-500"
          >
            {weekDay}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={i} aria-hidden="true" />
        ))}
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium tabular-nums ${
              failedDays.has(cell.key)
                ? "bg-red-500/20 text-red-200"
                : cleanDays.has(cell.key)
                  ? "bg-emerald-500/15 text-emerald-200"
                  : "bg-white/3 text-slate-200"
            } ${cell.key === todayKey ? "ring-2 ring-primary" : ""}`}
          >
            {cell.day}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-emerald-500/10 px-3 py-2">
          <p className="text-lg font-semibold leading-tight tabular-nums text-emerald-300">
            {cleanDays.size} {plural(cleanDays.size)}
          </p>
          <p className="text-[11px] text-slate-400">без срывов</p>
        </div>
        <div className="rounded-xl bg-red-500/10 px-3 py-2">
          <p className="text-lg font-semibold leading-tight tabular-nums text-red-300">
            {failedDays.size} {plural(failedDays.size)}
          </p>
          <p className="text-[11px] text-slate-400">со срывом</p>
        </div>
      </div>
    </section>
  );
}
