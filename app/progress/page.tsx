"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { icons, HABITS_PATH, DAY, RING, plural } from "@/app/habits/data";
import { Tracked, Progress } from "@/app/habits/types";
import {
  getHabits,
  relapse as saveRelapse,
  untrackHabit,
  getCosts,
  saveCost,
} from "@/app/lib/local";
import CostsSheet from "./CostsSheet";
import MonthCalendar from "./MonthCalendar";
import { defaultCosts, formatMoney, formatTime, type DailyCost } from "./data";
import { sound } from "@/app/lib/sound";
import { markCelebrated, readCelebrated } from "@/app/lib/celebrated";
import Celebration from "@/app/elements/Celebration";
import {
  ArrowLeft,
  Ban,
  Check,
  Flame,
  Plus,
  RotateCcw,
  Trash2,
  Trophy,
  PiggyBank,
  SlidersHorizontal,
} from "lucide-react";

export default function Tracker() {
  const [tracked, setTracked] = useState<Tracked[]>([]);
  const [progress, setProgress] = useState<Progress>({});
  const [now, setNow] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [relapseTarget, setRelapseTarget] = useState<Tracked | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Tracked | null>(null);
  const [relapsing, setRelapsing] = useState(false);
  const [logsVersion, setLogsVersion] = useState(0);
  const [relapseError, setRelapseError] = useState(false);
  const [celebrated, setCelebrated] = useState<Set<string> | null>(null);
  const [costs, setCosts] = useState<Record<string, DailyCost>>({});
  const [costsOpen, setCostsOpen] = useState(false);

  useEffect(() => {
    getHabits()
      .then((rows) => {
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
        setCelebrated(readCelebrated());
        getCosts().then(setCosts).catch(() => {});
        setNow(Date.now());
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!relapseTarget && !removeTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setRelapseTarget(null);
      setRemoveTarget(null);
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [relapseTarget, removeTarget]);

  const openRemove = (habit: Tracked) => {
    sound.tap();
    setRemoveTarget(habit);
  };

  const remove = async (id: string) => {
    try {
      await untrackHabit(id);
    } catch {}
    sound.remove();
    setRemoveTarget(null);
    setLogsVersion((version) => version + 1);
    setTracked((prev) => prev.filter((habit) => habit.id !== id));
    setProgress((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const openRelapse = (habit: Tracked) => {
    sound.tap();
    setRelapseError(false);
    setRelapseTarget(habit);
  };

  const relapse = async (id: string) => {
    if (relapsing) return;
    setRelapsing(true);
    setRelapseError(false);
    try {
      const data = await saveRelapse(id);
      const startedAt = new Date(data.startedAt).getTime();
      setNow(startedAt);
      setProgress((prev) => ({
        ...prev,
        [id]: { startedAt, best: data.best, relapses: data.relapses },
      }));
      sound.relapse();
      setRelapseTarget(null);
      setLogsVersion((version) => version + 1);
    } catch {
      setRelapseError(true);
    }
    setRelapsing(false);
  };

  const items = tracked.map((habit) => {
    const startedAt = progress[habit.id]?.startedAt ?? now;
    const elapsed = Math.max(0, now - startedAt);
    const goalMs = habit.goalDays * DAY;
    const days = Math.floor(elapsed / DAY);
    return {
      ...habit,
      startedAt,
      days,
      done: elapsed >= goalMs,
      percent: Math.min(100, Math.floor((elapsed / goalMs) * 100)),
      left: Math.max(0, habit.goalDays - days),
      best: Math.max(progress[habit.id]?.best ?? 0, days),
      relapses: progress[habit.id]?.relapses ?? 0,
    };
  });

  const few = items.length <= 2;
  const many = items.length > 6;
  const relapseItem = relapseTarget
    ? items.find((item) => item.id === relapseTarget.id)
    : undefined;
  const costOf = (id: string): DailyCost =>
    costs[id] ?? defaultCosts[id] ?? { money: 0, minutes: 0 };
  const saved = items.reduce(
    (sum, item) => {
      const cost = costOf(item.id);
      const days = Math.max(0, now - item.startedAt) / DAY;
      return { money: sum.money + cost.money * days, minutes: sum.minutes + cost.minutes * days };
    },
    { money: 0, minutes: 0 },
  );
  const hasCosts = items.some((item) => {
    const cost = costOf(item.id);
    return cost.money > 0 || cost.minutes > 0;
  });

  const saveCosts = async (next: Record<string, DailyCost>) => {
    await Promise.all(
      Object.entries(next).map(([id, cost]) => saveCost(id, cost.money, cost.minutes)),
    ).catch(() => {});
    setCosts((prev) => ({ ...prev, ...next }));
    setCostsOpen(false);
    sound.select();
  };

  const goalKey = (item: (typeof items)[number]) =>
    `goal:${item.id}:${item.startedAt}:${item.goalDays}`;
  const goalReached = celebrated
    ? items.find((item) => item.done && !celebrated.has(goalKey(item)))
    : undefined;
  const GoalIcon = goalReached ? (icons[goalReached.icon] ?? Trophy) : Trophy;

  return (
    <div
      className={`relative min-h-screen px-4 pb-16 pt-24 text-slate-100 sm:px-6 sm:pt-32 lg:flex lg:h-dvh lg:min-h-150 lg:flex-col lg:overflow-hidden lg:px-10 lg:pb-6 lg:pt-24`}
    >
      <div className="relative mx-auto flex w-full max-w-7xl flex-col lg:min-h-0 lg:flex-1">
        <div className="mb-6 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:gap-6 sm:justify-between lg:mb-4 lg:shrink-0 lg:gap-4">
          <div>
            <h1 className="bg-linear-to-b from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-4xl">
              Мой прогресс
            </h1>
            {hydrated && items.length === 0 && (
              <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400 lg:mt-1.5 lg:text-sm lg:[@media(max-height:820px)]:hidden">
                Каждый день без привычки заполняет шкалу. Сорвался — сбрось
                серию и начни заново, рекорд сохранится.
              </p>
            )}
          </div>
          <Link
            href={HABITS_PATH}
            className="hidden items-center justify-center gap-2 rounded-xl border border-white/10 sm:inline-flex bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Изменить привычки
          </Link>
        </div>

        {!hydrated ? (
          <div aria-hidden="true">
            <div className="mb-5 h-32 animate-pulse rounded-3xl bg-white/5 sm:mb-8 lg:mb-4" />
            <div className="grid gap-4 lg:grid-cols-2 lg:gap-3">
              {[0, 1].map((card) => (
                <div key={card} className="h-32 animate-pulse rounded-3xl bg-white/5" />
              ))}
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-20 text-center lg:flex-1 lg:justify-center lg:py-8">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
              <Flame className="h-7 w-7" />
            </span>
            <p className="text-lg font-semibold">
              Пока нет отслеживаемых привычек
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-400">
              Выбери привычки, задай цели и нажми «Начать отслеживать»
            </p>
            <Link
              href={HABITS_PATH}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Выбрать привычки
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-5 rounded-3xl border border-emerald-400/20 bg-[linear-gradient(135deg,rgba(52,211,153,0.12),rgba(17,24,39,0.65)_60%)] p-4 sm:mb-8 lg:mb-4 lg:shrink-0">
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                  <PiggyBank className="h-4 w-4" />
                  Сэкономлено
                </p>
                <button
                  onClick={() => {
                    sound.tap();
                    setCostsOpen(true);
                  }}
                  className="-my-1.5 -mr-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-2.5 text-xs text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Настроить
                </button>
              </div>
              {hasCosts ? (
                <>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                      <p className="font-display text-2xl font-bold tabular-nums text-white">
                        {formatMoney(saved.money)}
                      </p>
                      <p className="text-xs text-slate-400">денег не потрачено</p>
                    </div>
                    <div>
                      <p className="font-display text-2xl font-bold tabular-nums text-white">
                        {formatTime(saved.minutes)}
                      </p>
                      <p className="text-xs text-slate-400">времени освободилось</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">
                    За текущие серии без срывов
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Укажи, сколько денег и времени уходило на привычки в день, —
                  посчитаем, сколько уже сэкономлено.
                </p>
              )}
            </section>

            <div className="flex flex-col gap-5 lg:min-h-0 lg:flex-1 lg:gap-4 lg:overflow-y-auto lg:py-1 lg:pr-1">
              <ul
                className={`grid gap-4 lg:grid-cols-2 lg:content-start lg:gap-3 ${
                  many ? "xl:grid-cols-3" : ""
                }`}
              >
                {items.map((item) => {
                  const Icon = icons[item.icon] ?? Ban;
                  return (
                    <li
                      key={item.id}
                      className={`group relative flex items-center gap-4 overflow-hidden rounded-3xl border p-4 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-200 before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent hover:-translate-y-0.5 ${
                        many ? "lg:gap-3 lg:p-3" : few ? "lg:p-6" : "lg:p-4"
                      } ${
                        item.done
                          ? "border-emerald-500/30 bg-emerald-500/4 hover:border-emerald-500/50"
                          : "border-white/10 bg-surface/70 hover:border-primary/40"
                      }`}
                    >
                      <div
                        className={`relative h-16 w-16 shrink-0 ${
                          many ? "lg:h-14 lg:w-14" : few ? "lg:h-24 lg:w-24" : ""
                        }`}
                      >
                        <svg
                          viewBox="0 0 64 64"
                          className="h-full w-full -rotate-90"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient
                              id={`ring-${item.id}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor={item.done ? "#34D399" : "#6366F1"}
                              />
                              <stop
                                offset="100%"
                                stopColor={item.done ? "#10B981" : "#A78BFA"}
                              />
                            </linearGradient>
                          </defs>
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            fill="none"
                            stroke="rgba(255,255,255,0.08)"
                            strokeWidth="6"
                          />
                          <circle
                            cx="32"
                            cy="32"
                            r="26"
                            fill="none"
                            stroke={`url(#ring-${item.id})`}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={RING}
                            strokeDashoffset={RING * (1 - item.percent / 100)}
                            className="transition-[stroke-dashoffset] duration-700"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span
                            className={`text-xl font-bold leading-none tabular-nums ${
                              item.done ? "text-emerald-300" : "text-slate-100"
                            } ${many ? "lg:text-lg" : few ? "lg:text-3xl" : ""}`}
                          >
                            {item.days}
                          </span>
                          <span className="mt-0.5 text-[10px] font-medium leading-none text-slate-500">
                            из {item.goalDays}
                          </span>
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                              item.done
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-primary/15 text-primary"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="line-clamp-2 min-w-0 flex-1 font-medium leading-snug text-slate-100">
                            {item.name}
                          </span>
                          {item.done ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                              <Check className="h-3 w-3" />
                              Цель
                            </span>
                          ) : (
                            <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-300">
                              {item.percent}%
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.category} · с{" "}
                          {new Date(item.startedAt).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                          })}
                          {!item.done &&
                            ` · ещё ${item.left} ${plural(item.left)}`}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
                          <p className="text-xs text-slate-500">
                            Рекорд{" "}
                            <span className="tabular-nums text-slate-300">
                              {item.best} {plural(item.best)}
                            </span>
                            <span className="mx-1.5 text-slate-700">·</span>
                            Срывов{" "}
                            <span className="tabular-nums text-slate-300">
                              {item.relapses}
                            </span>
                          </p>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <button
                              onClick={() => openRelapse(item)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-300 transition hover:border-rose-500/40 sm:min-h-0 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Сорвался
                            </button>
                            <button
                              onClick={() => openRemove(item)}
                              aria-label={`Убрать «${item.name}» из прогресса`}
                              title="Убрать из прогресса"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-400 sm:h-7 sm:w-7 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <MonthCalendar version={logsVersion} />
            </div>
          </>
        )}
      </div>

      {costsOpen && (
        <CostsSheet
          rows={items.map((item) => ({ id: item.id, name: item.name, icon: item.icon, cost: costOf(item.id) }))}
          onSave={saveCosts}
          onClose={() => setCostsOpen(false)}
        />
      )}

      {removeTarget && (
        <div
          onClick={() => setRemoveTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="remove-title"
            aria-describedby="remove-text"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl shadow-black/50"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </span>
            <h2 id="remove-title" className="wrap-break-word text-xl font-bold">
              Убрать «{removeTarget.name}» из прогресса?
            </h2>
            <p
              id="remove-text"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              Серия, рекорд и отметки в календаре по этой привычке удалятся.
              Сама привычка останется в списке — её можно выбрать снова.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRemoveTarget(null)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Отмена
              </button>
              <button
                onClick={() => remove(removeTarget.id)}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 active:scale-[0.98]"
              >
                Убрать
              </button>
            </div>
          </div>
        </div>
      )}

      {goalReached && !relapseTarget && !removeTarget && (
        <Celebration
          key={goalKey(goalReached)}
          icon={GoalIcon}
          eyebrow={goalReached.name}
          title="Цель взята!"
          text={`${goalReached.goalDays} ${plural(goalReached.goalDays)} без срывов. Это настоящая победа — продолжай в том же духе.`}
          onClose={() => setCelebrated(markCelebrated(goalKey(goalReached)))}
        />
      )}

      {relapseTarget && (
        <div
          onClick={() => setRelapseTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="relapse-title"
            aria-describedby="relapse-text"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl shadow-black/50"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <RotateCcw className="h-6 w-6" />
            </span>
            <h2 id="relapse-title" className="wrap-break-word text-xl font-bold">
              Сорвался с «{relapseTarget.name}»?
            </h2>
            <p
              id="relapse-text"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              {relapseItem && relapseItem.days > 0
                ? `Текущая серия — ${relapseItem.days} ${plural(relapseItem.days)}. `
                : ""}
              Серия начнётся заново, сегодняшний день отметится срывом в
              календаре, а рекорд сохранится. Срыв — не провал, а часть пути.
            </p>
            {relapseError && (
              <p
                role="alert"
                className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300"
              >
                Не удалось сбросить серию. Попробуй ещё раз
              </p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRelapseTarget(null)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Отмена
              </button>
              <button
                onClick={() => relapse(relapseTarget.id)}
                disabled={relapsing}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {relapsing ? "Сбрасываем…" : "Начать заново"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
