"use client";

import { useEffect, useState } from "react";
import { Ban, X } from "lucide-react";
import { icons } from "@/app/habits/data";
import type { DailyCost } from "./data";

type Row = { id: string; name: string; icon: string; cost: DailyCost };

export default function CostsSheet({
  rows,
  onSave,
  onClose,
}: {
  rows: Row[];
  onSave: (costs: Record<string, DailyCost>) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(
      rows.map((row) => [row.id, { money: String(row.cost.money), minutes: String(row.cost.minutes) }]),
    ),
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const update = (id: string, field: "money" | "minutes", value: string) =>
    setDraft((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value.replace(/\D/g, "").slice(0, 6) } }));

  const save = () =>
    onSave(
      Object.fromEntries(
        rows.map((row) => [
          row.id,
          { money: Number(draft[row.id].money) || 0, minutes: Number(draft[row.id].minutes) || 0 },
        ]),
      ),
    );

  const field =
    "w-full rounded-xl border border-white/10 bg-ink px-3 py-2.5 pr-[4.75rem] text-sm tabular-nums text-slate-100 outline-none transition focus:border-primary/60 focus:ring-4 focus:ring-primary/10";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="costs-title"
        className="flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl border border-white/10 bg-surface shadow-2xl shadow-black/50 sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div>
            <h2 id="costs-title" className="text-lg font-bold">
              Траты в день
            </h2>
            <p className="mt-0.5 text-sm text-slate-400">
              Сколько уходило на привычку, пока она была
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-3 overflow-y-auto px-5 pb-4">
          {rows.map((row) => {
            const Icon = icons[row.icon] ?? Ban;
            return (
              <li key={row.id} className="rounded-2xl border border-white/10 bg-white/3 p-3">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="truncate">{row.name}</span>
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <label className="relative">
                    <span className="sr-only">Рублей в день</span>
                    <input
                      inputMode="numeric"
                      value={draft[row.id].money}
                      onChange={(e) => update(row.id, "money", e.target.value)}
                      className={field}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      ₽/день
                    </span>
                  </label>
                  <label className="relative">
                    <span className="sr-only">Минут в день</span>
                    <input
                      inputMode="numeric"
                      value={draft[row.id].minutes}
                      onChange={(e) => update(row.id, "minutes", e.target.value)}
                      className={field}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      мин/день
                    </span>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-3 border-t border-white/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Отмена
          </button>
          <button
            onClick={save}
            className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98]"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
