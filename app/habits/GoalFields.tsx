"use client";

import { useState } from "react";
import { goalOptions, MAX_GOAL_DAYS, MAX_HELD_DAYS, plural } from "./data";

const digits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

const numberField =
  "w-full rounded-xl border bg-ink px-3 py-2.5 pr-24 text-sm tabular-nums text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

type GoalFieldsProps = {
  goal: number;
  onGoal: (days: number) => void;
  held: number;
  onHeld: (days: number) => void;
  labelClassName?: string;
};

export default function GoalFields({
  goal,
  onGoal,
  held,
  onHeld,
  labelClassName = "mb-2 block text-xs text-slate-500",
}: GoalFieldsProps) {
  const isPreset = goalOptions.includes(goal);
  const [goalText, setGoalText] = useState(isPreset ? "" : String(goal));
  const [heldText, setHeldText] = useState(held > 0 ? String(held) : "");

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
    <div>
      <p className={labelClassName}>Цель в днях</p>
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
        <span className={labelClassName}>Уже держусь</span>
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
    </div>
  );
}
