"use client";

import { useEffect, useState } from "react";
import { Ban, Sparkles, Trash2, X } from "lucide-react";
import { Habit } from "./types";
import {
  goalOptions,
  icons,
  MAX_GOAL_DAYS,
  MAX_HELD_DAYS,
  plural,
} from "./data";

const digits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

const numberField =
  "w-full rounded-xl border bg-ink px-3 py-2.5 pr-24 text-sm tabular-nums text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

type HabitSheetProps = {
  habit: Habit;
  active: boolean;
  goal: number;
  onGoal: (days: number) => void;
  held: number;
  onHeld: (days: number) => void;
  onToggle: () => void;
  onAskAi?: () => void;
  onDelete?: () => void;
  onClose: () => void;
};

export default function HabitSheet({
  habit,
  active,
  goal,
  onGoal,
  held,
  onHeld,
  onToggle,
  onAskAi,
  onDelete,
  onClose,
}: HabitSheetProps) {
  const Icon = icons[habit.icon] ?? Ban;
  const isPreset = goalOptions.includes(goal);
  const [goalText, setGoalText] = useState(isPreset ? "" : String(goal));
  const [heldText, setHeldText] = useState(held > 0 ? String(held) : "");
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () =>
      setKeyboardHeight(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  const changeGoalText = (value: string) => {
    const text = digits(value);
    const days = Math.min(Number(text), MAX_GOAL_DAYS);
    setGoalText(days > 0 ? String(days) : text);
    if (days > 0) onGoal(days);
  };

  const changeHeldText = (value: string) => {
    const text = digits(value);
    const days = Math.min(Number(text), MAX_HELD_DAYS);
    setHeldText(text === "" ? "" : String(days));
    onHeld(days);
  };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - held);

  return (
    <div
      onClick={onClose}
      style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined}
      className="fixed inset-0 z-50 flex animate-[ai-fade_0.2s_ease-out] items-end justify-center bg-black/70 backdrop-blur-sm motion-reduce:animate-none sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="habit-sheet-title"
        className="max-h-full w-full max-w-md animate-[ai-pop_0.25s_ease-out] overflow-y-auto overscroll-contain rounded-t-3xl border border-white/10 bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl shadow-black/50 motion-reduce:animate-none sm:rounded-3xl sm:pb-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <h2
              id="habit-sheet-title"
              className="text-lg font-semibold leading-snug"
            >
              {habit.name}
            </h2>
            <p className="text-xs text-slate-500">{habit.category}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="shrink-0 self-start rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {onAskAi && (
          <button
            onClick={onAskAi}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-primary/25 to-accent/25 py-3 text-sm font-semibold text-accent-pale shadow-[0_0_14px_-4px_rgba(139,92,246,0.8)] ring-1 ring-accent/30 transition hover:from-primary/40 hover:to-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            Разбор от ИИ
          </button>
        )}

        <p className="mb-2 mt-5 text-xs text-slate-500">Цель в днях</p>
        <div className="grid grid-cols-5 gap-1.5">
          {goalOptions.map((days) => (
            <button
              key={days}
              onClick={() => {
                setGoalText("");
                onGoal(days);
              }}
              aria-pressed={goal === days}
              className={`rounded-lg border py-2.5 text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                goal === days
                  ? "border-primary bg-primary text-white"
                  : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
              }`}
            >
              {days}
            </button>
          ))}
        </div>
        <label className="relative mt-2 block">
          <span className="sr-only">Своя цель в днях</span>
          <input
            inputMode="numeric"
            value={goalText}
            onChange={(e) => changeGoalText(e.target.value)}
            onBlur={() => setGoalText(isPreset ? "" : String(goal))}
            placeholder="Своё число"
            className={`${numberField} ${isPreset ? "border-white/10" : "border-primary"}`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
            до {MAX_GOAL_DAYS} дней
          </span>
        </label>

        <label className="mt-5 block">
          <span className="mb-2 block text-xs text-slate-500">Уже держусь</span>
          <span className="relative block">
            <input
              inputMode="numeric"
              value={heldText}
              onChange={(e) => changeHeldText(e.target.value)}
              placeholder="0"
              className={`${numberField} border-white/10`}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
              {plural(held)}
            </span>
          </span>
        </label>
        <p className="mt-1.5 text-xs text-slate-500">
          {held > 0
            ? `Начало серии — ${startDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`
            : "Оставь пустым, если начинаешь сегодня"}
        </p>

        <div className="mt-5 flex gap-3">
          {active ? (
            <>
              <button
                onClick={onToggle}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Убрать из выбранных
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
              >
                Готово
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
            >
              Выбрать привычку
            </button>
          )}
        </div>

        {onDelete && (
          <button
            onClick={onDelete}
            className="mx-auto mt-3 flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Удалить навсегда
          </button>
        )}
      </div>
    </div>
  );
}
