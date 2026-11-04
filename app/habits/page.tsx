"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Habit } from "./types";
import HabitSheet from "./HabitSheet";
import GoalFields from "./GoalFields";
import useKeyboardHeight from "./useKeyboardHeight";
import {
  catalog,
  categories,
  formCategories,
  pickerIcons,
  icons,
  DAY,
  plural,
  TRACKER_PATH,
} from "./data";
import { type AiInfo, getAi, hasAi } from "./ai";
import {
  deleteHabit,
  getHabits,
  stopTracking,
  trackHabit,
  untrackHabit,
} from "@/app/lib/local";
import { sound } from "@/app/lib/sound";
import {
  ArrowRight,
  Ban,
  Check,
  Flame,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
} from "lucide-react";

const scrollbar =
  "overscroll-contain [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/15 hover:[&::-webkit-scrollbar-thumb]:bg-white/30";

export default function Habits() {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [heldNow, setHeldNow] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState("Здоровье");
  const [newIcon, setNewIcon] = useState("ban");
  const [newGoal, setNewGoal] = useState(30);
  const [newHeld, setNewHeld] = useState(0);
  const keyboardHeight = useKeyboardHeight();
  const [hydrated, setHydrated] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [untrackTarget, setUntrackTarget] = useState<Habit | null>(null);
  const [aiHabit, setAiHabit] = useState<Habit | null>(null);
  const [aiClosing, setAiClosing] = useState(false);
  const [aiInfo, setAiInfo] = useState<Record<string, AiInfo>>({});
  const [aiFailed, setAiFailed] = useState<string | null>(null);

  const closeAi = useCallback(() => {
    setAiClosing(true);
    window.setTimeout(() => {
      setAiHabit(null);
      setAiClosing(false);
    }, 220);
  }, []);

  useEffect(() => {
    getHabits()
      .then((rows) => {
        const storedCustom: Habit[] = rows
          .filter((row) => row.custom)
          .map((row) => ({
            id: row.key,
            name: row.name,
            category: row.category,
            icon: row.icon,
            custom: true,
          }));
        const validIds = new Set([
          ...catalog.map((habit) => habit.id),
          ...storedCustom.map((habit) => habit.id),
        ]);
        const selectedKeys = rows
          .filter((row) => row.tracked && validIds.has(row.key))
          .map((row) => row.key);
        const nextGoals: Record<string, number> = {};
        rows.forEach((row) => {
          nextGoals[row.key] = row.tracked ? row.trackedGoal : row.goalDays;
        });
        const nextHeldNow: Record<string, number> = {};
        rows.forEach((row) => {
          if (row.tracked && row.startedAt) {
            nextHeldNow[row.key] = Math.floor(
              (Date.now() - new Date(row.startedAt).getTime()) / DAY,
            );
          }
        });
        setHeldNow(nextHeldNow);
        setCustom(storedCustom);
        setSelected(selectedKeys);
        setGoals(nextGoals);
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (
      !modalOpen &&
      !clearOpen &&
      !aiHabit &&
      !deleteTarget &&
      !detailHabit &&
      !untrackTarget
    ) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setClearOpen(false);
        setDeleteTarget(null);
        setUntrackTarget(null);
        if (aiHabit) closeAi();
        else setDetailHabit(null);
      }
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, clearOpen, aiHabit, deleteTarget, detailHabit, untrackTarget, closeAi]);

  const all = [...catalog, ...custom];

  const counts = categories.reduce<Record<string, number>>((acc, item) => {
    acc[item] = all.filter((habit) =>
      item === "Все"
        ? true
        : item === "Свои"
          ? habit.custom
          : habit.category === item,
    ).length;
    return acc;
  }, {});

  const filtered = all.filter((habit) => {
    const matchesQuery = habit.name
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    const matchesCategory =
      category === "Все" ||
      (category === "Свои" ? habit.custom : habit.category === category);
    return matchesQuery && matchesCategory;
  });

  const selectedHabits = selected
    .map((id) => all.find((habit) => habit.id === id))
    .filter((habit): habit is Habit => Boolean(habit));

  const PreviewIcon = icons[newIcon] ?? Ban;

  const duplicate =
    name.trim() !== "" &&
    all.some((habit) => habit.name.toLowerCase() === name.trim().toLowerCase());

  const aiCurrent = aiHabit ? aiInfo[aiHabit.id] : undefined;
  const aiError = aiHabit !== null && aiFailed === aiHabit.id;
  const AiIcon = aiHabit ? (icons[aiHabit.icon] ?? Ban) : Ban;

  const askAi = async (habit: Habit) => {
    sound.tap();
    setAiFailed(null);
    setAiHabit(habit);
    if (aiInfo[habit.id]) return;
    try {
      const info = await getAi(habit.id);
      setAiInfo((prev) => ({ ...prev, [habit.id]: info }));
    } catch {
      setAiFailed(habit.id);
    }
  };

  const persistHabit = (habit: Habit, goal: number, held: number) => {
    const wasTracked = selected.includes(habit.id);
    const heldChanged = held !== (heldNow[habit.id] ?? 0);
    return trackHabit({
      key: habit.id,
      name: habit.name,
      category: habit.category,
      icon: habit.icon,
      custom: habit.custom === true,
      goalDays: goal,
      heldDays: heldChanged ? held : undefined,
    }).then(() => {
      if (!wasTracked) setSelected((prev) => [habit.id, ...prev]);
      setGoals((prev) => ({ ...prev, [habit.id]: goal }));
      setHeldNow((prev) => ({ ...prev, [habit.id]: held }));
    });
  };

  const submitHabit = (habit: Habit, goal: number, held: number) => {
    const wasTracked = selected.includes(habit.id);
    setDetailHabit(null);
    const unchanged =
      wasTracked &&
      goal === (goals[habit.id] ?? 30) &&
      held === (heldNow[habit.id] ?? 0);
    if (unchanged) return;
    persistHabit(habit, goal, held)
      .then(() => {
        if (wasTracked) sound.select();
        else sound.success();
      })
      .catch(() => {});
  };

  const removeFromTracking = (habit: Habit) => {
    setUntrackTarget(null);
    untrackHabit(habit.id)
      .then(() => {
        sound.remove();
        setSelected((prev) => prev.filter((item) => item !== habit.id));
        setHeldNow((prev) => {
          const next = { ...prev };
          delete next[habit.id];
          return next;
        });
      })
      .catch(() => {});
  };

  const clearAll = async () => {
    sound.remove();
    setSelected([]);
    setHeldNow({});
    setClearOpen(false);
    try {
      await stopTracking();
    } catch {}
  };

  const removeCustom = async (habit: Habit) => {
    sound.remove();
    setDeleteTarget(null);
    setCustom((prev) => prev.filter((item) => item.id !== habit.id));
    setSelected((prev) => prev.filter((item) => item !== habit.id));
    setGoals((prev) => {
      const next = { ...prev };
      delete next[habit.id];
      return next;
    });
    setAiInfo((prev) => {
      const next = { ...prev };
      delete next[habit.id];
      return next;
    });
    try {
      await deleteHabit(habit.id);
    } catch {}
  };

  const createHabit = () => {
    const trimmed = name.trim();
    if (!trimmed || duplicate) return;
    sound.create();
    const habit: Habit = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      category: newCategory,
      icon: newIcon,
      custom: true,
    };
    setCustom((prev) => [habit, ...prev]);
    persistHabit(habit, newGoal, newHeld).catch(() => {});
    setName("");
    setNewCategory("Здоровье");
    setNewIcon("ban");
    setNewGoal(30);
    setNewHeld(0);
    setModalOpen(false);
  };

  return (
    <div
      className={`relative min-h-screen px-4 pb-16 pt-24 text-slate-100 sm:px-6 sm:pt-32 lg:flex lg:h-dvh lg:min-h-150 lg:flex-col lg:overflow-hidden lg:px-10 lg:pb-6 lg:pt-24`}
    >
      <style>{`
        @keyframes ai-fade{from{opacity:0}to{opacity:1}}
        @keyframes ai-fade-out{from{opacity:1}to{opacity:0}}
        @keyframes ai-pop{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:none}}
        @keyframes ai-pop-out{from{opacity:1;transform:none}to{opacity:0;transform:translateY(24px) scale(.94)}}
        @keyframes ai-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
        @keyframes ai-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        @keyframes ai-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes ai-shimmer{to{transform:translateX(100%)}}
        @keyframes ai-twinkle{0%,100%{opacity:1;transform:scale(1) rotate(0deg)}50%{opacity:.6;transform:scale(1.25) rotate(18deg)}}
      `}</style>

      <div className="relative mx-auto flex w-full max-w-7xl flex-col lg:min-h-0 lg:flex-1">
        <div className="mb-6 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:gap-6 sm:justify-between lg:mb-5 lg:shrink-0 lg:gap-4">
          <div>
            <h1
              className={` bg-linear-to-b from-white to-slate-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-4xl`}
            >
              Привычки
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-400 lg:mt-1.5 lg:text-sm lg:[@media(max-height:820px)]:hidden">
              Выбери, с чем хочешь бороться: возьми готовую привычку из списка
              или создай свою и задай цель в днях.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {selectedHabits.length > 0 && (
              <Link
                href={TRACKER_PATH}
                className="hidden items-center justify-center gap-2 rounded-xl border border-white/10 sm:inline-flex bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98]"
              >
                Мой прогресс
                <span className="rounded-md bg-primary/20 px-1.5 text-xs tabular-nums text-primary-soft">
                  {selectedHabits.length}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Создать свою
            </button>
          </div>
        </div>

        <div className="grid lg:min-h-0 lg:flex-1 lg:grid-rows-[minmax(0,1fr)]">
          <section className="min-w-0 lg:flex lg:min-h-0 lg:flex-col">
            <div className="mb-5 flex flex-col gap-4 lg:mb-3 lg:shrink-0 lg:gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Поиск привычки"
                  placeholder="Поиск привычки"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition focus:border-primary/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-primary/10 lg:py-3"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Очистить поиск"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition sm:gap-2 sm:px-4 sm:py-2 sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                      category === item
                        ? "border-primary bg-primary font-medium text-white shadow-lg shadow-primary/20"
                        : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {item}
                    <span
                      className={`rounded-md px-1.5 text-xs tabular-nums ${
                        category === item
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-slate-500"
                      }`}
                    >
                      {counts[item]}
                    </span>
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-500">
                Найдено:{" "}
                <span className="tabular-nums text-slate-300">
                  {filtered.length}
                </span>
                <span className="mx-2 text-slate-700">·</span>
                В работе:{" "}
                <span className="tabular-nums text-slate-300">
                  {hydrated ? selectedHabits.length : "–"}
                </span>
                {selectedHabits.length > 0 && (
                  <button
                    onClick={() => setClearOpen(true)}
                    className="-my-2 ml-2 rounded-lg px-2 py-2 text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                  >
                    Очистить
                  </button>
                )}
              </p>
            </div>

            {!hydrated ? (
              <div
                aria-hidden="true"
                className="grid grid-cols-2 gap-2.5 max-[340px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4"
              >
                {catalog.map((habit) => (
                  <div key={habit.id} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-16 text-center lg:min-h-0 lg:flex-1 lg:justify-center lg:py-8">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
                  <Search className="h-7 w-7" />
                </span>
                <p className={` text-lg font-semibold`}>
                  {category === "Свои" && custom.length === 0 && !query
                    ? "Своих привычек пока нет"
                    : "Ничего не нашлось"}
                </p>
                <p className="mt-1 max-w-xs text-sm text-slate-400">
                  {category === "Свои" && custom.length === 0 && !query
                    ? "Создай первую — она появится в этом разделе"
                    : "Попробуй другой запрос или создай свою привычку"}
                </p>
                <button
                  onClick={() => {
                    setName(query.slice(0, 40));
                    setModalOpen(true);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                >
                  <Plus className="h-4 w-4 text-primary" />
                  {query
                    ? `Создать «${query.slice(0, 24)}»`
                    : "Создать привычку"}
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 gap-2.5 max-[340px]:grid-cols-1 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 lg:min-h-0 lg:flex-1 lg:content-start lg:overflow-y-auto lg:py-1 lg:pr-1 ${scrollbar}`}
              >
                {filtered.map((habit) => {
                  const Icon = icons[habit.icon] ?? Ban;
                  const active = selected.includes(habit.id);
                  const goal = goals[habit.id] ?? 30;
                  return (
                    <div
                      key={habit.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        sound.tap();
                        setDetailHabit(habit);
                      }}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          sound.tap();
                          setDetailHabit(habit);
                        }
                      }}
                      aria-haspopup="dialog"
                      aria-label={
                        active
                          ? `${habit.name}, в работе, цель ${goal} ${plural(goal)}`
                          : habit.name
                      }
                      className={`group flex min-h-16 min-w-0 cursor-pointer select-none items-center gap-2 rounded-2xl border p-2 text-left backdrop-blur transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink active:scale-[0.98] sm:gap-3 sm:p-3 ${
                        active
                          ? "border-primary bg-primary shadow-lg shadow-primary/25 hover:bg-primary-hover"
                          : "border-white/10 bg-surface/60 hover:border-white/20 hover:bg-surface"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition duration-200 sm:h-10 sm:w-10 sm:rounded-xl ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-white/5 text-primary group-hover:bg-primary/15"
                        }`}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`line-clamp-3 hyphens-auto wrap-break-word text-[13px] font-medium leading-snug tracking-tight sm:text-sm sm:tracking-normal ${
                            active ? "text-white" : "text-slate-100"
                          }`}
                        >
                          {habit.name}
                        </span>
                        {active ? (
                          <span className="mt-0.5 block text-xs tabular-nums text-primary-pale">
                            {goal} {plural(goal)}
                          </span>
                        ) : habit.custom ? (
                          <span className="mt-0.5 block text-xs text-primary-soft">
                            Своя
                          </span>
                        ) : (
                          <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                            {habit.category}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-habit-title"
            className="flex max-h-[min(92vh,100%)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-surface shadow-2xl shadow-black/50 sm:rounded-3xl"
          >
            <div className="px-6 pb-4 pt-3 sm:pt-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="new-habit-title" className={` text-2xl font-bold`}>
                    Новая привычка
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Название, иконка и цель — остальное сделаем за тебя
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Закрыть"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className={`flex flex-col gap-6 overflow-y-auto px-6 pb-6 ${scrollbar}`}
            >
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-ink/60 p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
                  <PreviewIcon className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={` block truncate text-lg font-semibold ${
                      name.trim() ? "text-slate-100" : "text-slate-600"
                    }`}
                  >
                    {name.trim() || "Название привычки"}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {newCategory} · цель {newGoal} дн.
                  </span>
                </span>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="habit-name"
                    className="text-sm font-medium text-slate-300"
                  >
                    Название
                  </label>
                  <span className="text-xs tabular-nums text-slate-600">
                    {name.length}/40
                  </span>
                </div>
                <input
                  id="habit-name"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createHabit();
                  }}
                  maxLength={40}
                  placeholder="Например, ночной перекус"
                  aria-invalid={duplicate}
                  className={`w-full rounded-xl border bg-ink px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:ring-4 ${
                    duplicate
                      ? "border-rose-500/60 focus:border-rose-500/60 focus:ring-rose-500/10"
                      : "border-white/10 focus:border-primary/60 focus:ring-primary/10"
                  }`}
                />
                {duplicate && (
                  <p className="mt-2 text-xs text-rose-400">
                    Такая привычка уже есть в списке
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Категория
                </p>
                <div className="flex flex-wrap gap-2">
                  {formCategories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setNewCategory(item)}
                      aria-pressed={newCategory === item}
                      className={`rounded-full border px-4 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                        newCategory === item
                          ? "border-primary bg-primary font-medium text-white"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">
                  Иконка
                </p>
                <div className="grid grid-cols-6 gap-2">
                  {pickerIcons.map((key) => {
                    const Icon = icons[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setNewIcon(key)}
                        aria-label={key}
                        aria-pressed={newIcon === key}
                        className={`flex aspect-square items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                          newIcon === key
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/25"
                            : "border-white/10 bg-white/5 text-primary hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <GoalFields
                goal={newGoal}
                onGoal={setNewGoal}
                held={newHeld}
                onHeld={setNewHeld}
                labelClassName="mb-2 block text-sm font-medium text-slate-300"
              />
            </div>

            <div className="flex gap-3 border-t border-white/10 bg-surface p-4 sm:px-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Отмена
              </button>
              <button
                onClick={createHabit}
                disabled={!name.trim() || duplicate}
                className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {detailHabit && (
        <HabitSheet
          habit={detailHabit}
          active={selected.includes(detailHabit.id)}
          goal={goals[detailHabit.id] ?? 30}
          held={heldNow[detailHabit.id] ?? 0}
          onSubmit={(goal, held) => submitHabit(detailHabit, goal, held)}
          onRemove={() => {
            setUntrackTarget(detailHabit);
            setDetailHabit(null);
          }}
          onAskAi={hasAi(detailHabit.id) ? () => askAi(detailHabit) : undefined}
          onDelete={
            detailHabit.custom
              ? () => {
                  setDeleteTarget(detailHabit);
                  setDetailHabit(null);
                }
              : undefined
          }
          onClose={() => setDetailHabit(null)}
        />
      )}

      {untrackTarget && (
        <div
          onClick={() => setUntrackTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="untrack-title"
            aria-describedby="untrack-text"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl shadow-black/50"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </span>
            <h2 id="untrack-title" className="text-xl font-bold">
              Убрать «{untrackTarget.name}»?
            </h2>
            <p
              id="untrack-text"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              Серия, рекорд и отметки в календаре по этой привычке удалятся. Это
              действие нельзя отменить.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setUntrackTarget(null)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Отмена
              </button>
              <button
                onClick={() => removeFromTracking(untrackTarget)}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 active:scale-[0.98]"
              >
                Убрать
              </button>
            </div>
          </div>
        </div>
      )}

      {clearOpen && (
        <div
          onClick={() => setClearOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="clear-title"
            aria-describedby="clear-text"
            className="w-full max-w-md rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl shadow-black/50"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </span>
            <h2 id="clear-title" className={` text-xl font-bold`}>
              Очистить все привычки?
            </h2>
            <p
              id="clear-text"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              Все привычки пропадут со страницы прогресса, а серии,
              рекорды и срывы будут удалены. Это действие нельзя отменить.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setClearOpen(false)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Отмена
              </button>
              <button
                onClick={clearAll}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 active:scale-[0.98]"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          onClick={() => setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex animate-[ai-fade_0.2s_ease-out] items-center justify-center bg-black/70 p-4 backdrop-blur-sm motion-reduce:animate-none sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-text"
            className="w-full max-w-md animate-[ai-pop_0.3s_cubic-bezier(0.16,1,0.3,1)] rounded-3xl border border-white/10 bg-surface p-6 shadow-2xl shadow-black/50 motion-reduce:animate-none"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
              <Trash2 className="h-6 w-6" />
            </span>
            <h2 id="delete-title" className="wrap-break-word text-xl font-bold">
              Удалить «{deleteTarget.name}»?
            </h2>
            <p
              id="delete-text"
              className="mt-2 text-sm leading-relaxed text-slate-400"
            >
              Привычка пропадёт из списка, а если ты её отслеживаешь, то серия,
              рекорд, срывы и отметки в календаре тоже будут удалены. Это
              действие нельзя отменить.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
              >
                Отмена
              </button>
              <button
                onClick={() => removeCustom(deleteTarget)}
                className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 active:scale-[0.98]"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      {aiHabit && (
        <div
          onClick={closeAi}
          className={`fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm motion-reduce:animate-none sm:items-center sm:p-6 ${
            aiClosing
              ? "animate-[ai-fade-out_0.22s_ease-in_forwards]"
              : "animate-[ai-fade_0.25s_ease-out]"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_65%)]" />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-3xl motion-reduce:animate-none lg:max-w-5xl ${
              aiClosing
                ? "animate-[ai-pop-out_0.22s_ease-in_forwards]"
                : "animate-[ai-pop_0.4s_cubic-bezier(0.16,1,0.3,1)]"
            }`}
          >
            <div className="pointer-events-none absolute -inset-6 hidden animate-[ai-glow_4s_ease-in-out_infinite] rounded-[3rem] bg-linear-to-br from-primary/40 via-accent/30 to-accent-soft/20 blur-3xl motion-reduce:animate-none sm:block" />
            <div className="relative flex max-h-[92vh] overflow-hidden rounded-t-3xl p-[1.5px] shadow-[0_0_60px_-12px_rgba(139,92,246,0.7)] sm:rounded-3xl">
              <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[200%] animate-[ai-spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_55%,#6366F1_75%,#A78BFA_88%,transparent_100%)] motion-reduce:animate-none" />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-title"
                className="relative flex min-h-0 w-full flex-col overflow-hidden rounded-t-[22px] bg-surface sm:rounded-[22px]"
              >
                <div className="relative shrink-0 overflow-hidden px-5 pb-3 pt-4 sm:px-6">
                  <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 animate-[ai-glow_5s_ease-in-out_infinite] rounded-full bg-accent/25 blur-3xl motion-reduce:animate-none" />
                  <div className="relative flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3.5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-accent text-white shadow-[0_0_24px_-2px_rgba(139,92,246,0.8)]">
                        <AiIcon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <h2
                          id="ai-title"
                          className="truncate text-xl font-bold leading-tight text-slate-100"
                        >
                          {aiHabit.name}
                        </h2>
                        <p className="flex items-center gap-1.5 text-xs text-accent-pale">
                          <Sparkles className="h-3.5 w-3.5 animate-[ai-twinkle_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
                          Разбор от GigaChat · {aiHabit.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeAi}
                      aria-label="Закрыть"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div
                  className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-4 sm:px-6 ${scrollbar}`}
                >
                  {aiError ? (
                    <div className="flex animate-[ai-rise_0.4s_ease-out_both] flex-col items-center rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 px-4 py-10 text-center">
                      <p className="text-sm text-rose-300">
                        Для этой привычки разбора пока нет
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Готовые разборы есть для привычек из каталога
                      </p>
                    </div>
                  ) : !aiCurrent ? (
                    <div className="flex flex-col gap-3" aria-live="polite">
                      <p className="flex items-center gap-2 text-sm text-slate-400">
                        <Sparkles className="h-4 w-4 animate-[ai-twinkle_1.6s_ease-in-out_infinite] text-accent motion-reduce:animate-none" />
                        Открываем разбор…
                      </p>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {[
                          "h-10 md:col-span-2 lg:col-span-3",
                          "h-44",
                          "h-44",
                          "h-44",
                          "h-28",
                          "h-28",
                          "h-28",
                          "h-20 md:col-span-2 lg:col-span-3",
                        ].map((size, index) => (
                          <div
                            key={index}
                            className={`relative overflow-hidden rounded-2xl bg-white/5 ${size}`}
                          >
                            <div className="absolute inset-0 -translate-x-full animate-[ai-shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent motion-reduce:animate-none" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {aiCurrent.summary && (
                        <p className="animate-[ai-rise_0.5s_ease-out_both] text-sm leading-relaxed text-slate-200 motion-reduce:animate-none">
                          {aiCurrent.summary}
                        </p>
                      )}

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-rose-500/15 bg-rose-500/5 p-3.5 [animation-delay:60ms] motion-reduce:animate-none">
                          <p className="mb-2 text-xs font-semibold text-rose-300/80">
                            Чем вредно
                          </p>
                          <ul className="flex flex-col gap-2">
                            {aiCurrent.harm.map((item) => (
                              <li
                                key={`${item.title}-${item.text}`}
                                className="text-[13px] leading-snug text-slate-300"
                              >
                                {item.title && (
                                  <span className="font-semibold text-rose-200">
                                    {item.title}.{" "}
                                  </span>
                                )}
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        </section>

                        {aiCurrent.benefits.length > 0 && (
                          <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-3.5 [animation-delay:120ms] motion-reduce:animate-none">
                            <p className="mb-2 text-xs font-semibold text-emerald-300/80">
                              Что изменится, если бросить
                            </p>
                            <ol className="flex flex-col gap-2">
                              {aiCurrent.benefits.map((item) => (
                                <li
                                  key={`${item.when}-${item.text}`}
                                  className="grid grid-cols-[5.25rem_1fr] gap-2 text-[13px] leading-snug"
                                >
                                  <span className="font-semibold text-emerald-300">
                                    {item.when}
                                  </span>
                                  <span className="text-slate-300">
                                    {item.text}
                                  </span>
                                </li>
                              ))}
                            </ol>
                          </section>
                        )}

                        {aiCurrent.steps.length > 0 && (
                          <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-primary/20 bg-primary/5 p-3.5 [animation-delay:180ms] motion-reduce:animate-none">
                            <p className="mb-2 text-xs font-semibold text-primary-soft/80">
                              План на неделю
                            </p>
                            <ol className="flex flex-col gap-2">
                              {aiCurrent.steps.map((item, index) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-2.5 text-[13px] leading-snug text-slate-300"
                                >
                                  <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/25 text-[11px] font-bold tabular-nums text-primary-pale">
                                    {index + 1}
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ol>
                          </section>
                        )}

                        {aiCurrent.facts.length > 0 && (
                          <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-white/10 bg-white/3 p-3.5 [animation-delay:240ms] motion-reduce:animate-none">
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              Интересные факты
                            </p>
                            <ul className="flex flex-col gap-2">
                              {aiCurrent.facts.map((item) => (
                                <li
                                  key={item}
                                  className="flex gap-2 text-[13px] leading-snug text-slate-300"
                                >
                                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {aiCurrent.triggers.length > 0 && (
                          <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-white/10 bg-white/3 p-3.5 [animation-delay:300ms] motion-reduce:animate-none">
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              Когда тянет сильнее
                            </p>
                            <ul className="flex flex-wrap gap-1.5">
                              {aiCurrent.triggers.map((item) => (
                                <li
                                  key={item}
                                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}

                        {aiCurrent.alternatives.length > 0 && (
                          <section className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-white/10 bg-white/3 p-3.5 [animation-delay:360ms] motion-reduce:animate-none">
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                              Чем заменить
                            </p>
                            <ul className="flex flex-col gap-1.5">
                              {aiCurrent.alternatives.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-2 text-[13px] leading-snug text-slate-300"
                                >
                                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </section>
                        )}
                      </div>

                      <div className="animate-[ai-rise_0.5s_ease-out_both] rounded-2xl border border-primary/30 bg-linear-to-br from-primary/20 to-accent/10 p-4 shadow-[0_0_30px_-10px_rgba(139,92,246,0.6)] [animation-delay:420ms] motion-reduce:animate-none">
                        <div className="flex gap-3">
                          <Flame className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" />
                          <p className="text-sm leading-relaxed text-slate-100">
                            {aiCurrent.motivation}
                          </p>
                        </div>
                        {aiCurrent.tip && (
                          <p className="mt-3 flex gap-2.5 border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-400">
                            <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>
                              <span className="font-medium text-slate-300">
                                Совет:{" "}
                              </span>
                              {aiCurrent.tip}
                            </span>
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-5 py-2.5 sm:px-6">
                  <p className="text-[11px] leading-snug text-slate-600">
                    Ответ сгенерирован нейросетью и не заменяет консультацию
                    врача.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
