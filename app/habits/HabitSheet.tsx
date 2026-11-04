"use client";

import { useState } from "react";
import { Ban, Sparkles, Trash2, X } from "lucide-react";
import { Habit } from "./types";
import { icons } from "./data";
import GoalFields from "./GoalFields";
import useKeyboardHeight from "./useKeyboardHeight";

type HabitSheetProps = {
  habit: Habit;
  active: boolean;
  goal: number;
  held: number;
  onSubmit: (goal: number, held: number) => void;
  onRemove: () => void;
  onAskAi?: () => void;
  onDelete?: () => void;
  onClose: () => void;
};

export default function HabitSheet({
  habit,
  active,
  goal,
  held,
  onSubmit,
  onRemove,
  onAskAi,
  onDelete,
  onClose,
}: HabitSheetProps) {
  const Icon = icons[habit.icon] ?? Ban;
  const keyboardHeight = useKeyboardHeight();
  const [draftGoal, setDraftGoal] = useState(goal);
  const [draftHeld, setDraftHeld] = useState(held);

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

        <div className="mt-5">
          <GoalFields
            goal={draftGoal}
            onGoal={setDraftGoal}
            held={draftHeld}
            onHeld={setDraftHeld}
          />
        </div>

        <div className="mt-5 flex gap-3">
          {active ? (
            <>
              <button
                onClick={onRemove}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Убрать
              </button>
              <button
                onClick={() => onSubmit(draftGoal, draftHeld)}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
              >
                Готово
              </button>
            </>
          ) : (
            <button
              onClick={() => onSubmit(draftGoal, draftHeld)}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
            >
              Начать отслеживать
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
