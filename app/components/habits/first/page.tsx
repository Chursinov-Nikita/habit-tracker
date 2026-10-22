"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Habit, ServerHabit } from "../types";
import {
  catalog,
  categories,
  formCategories,
  goalOptions,
  pickerIcons,
  icons,
} from "../data";
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

export const STORAGE_KEY = "habittrack:habits:v1";
export const TRACKED_KEY = "habittrack:tracked:v1";
export const PROGRESS_KEY = "habittrack:progress:v1";
export const TRACKER_PATH = "/components/habits/second";

type AiInfo = {
  harm: string[];
  benefits: { when: string; text: string }[];
  motivation: string;
  tip: string;
};

export default function Habits({
  onSave,
}: {
  onSave?: (
    habits: { id: string; name: string; category: string; goalDays: number }[],
  ) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState("Здоровье");
  const [newIcon, setNewIcon] = useState("ban");
  const [newGoal, setNewGoal] = useState(30);
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [trackedCount, setTrackedCount] = useState(0);
  const [clearOpen, setClearOpen] = useState(false);
  const [aiHabit, setAiHabit] = useState<Habit | null>(null);
  const [aiInfo, setAiInfo] = useState<Record<string, AiInfo>>({});
  const [aiFailed, setAiFailed] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiCooldown, setAiCooldown] = useState(0);
  const router = useRouter();
  const loaded = useRef(false);

  useEffect(() => {
    axios
      .get("/api/habits")
      .then(({ data }) => {
        const rows: ServerHabit[] = Array.isArray(data) ? data : [];
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
          .filter((row) => row.selected && validIds.has(row.key))
          .map((row) => row.key);
        const nextGoals: Record<string, number> = {};
        rows.forEach((row) => {
          nextGoals[row.key] = row.goalDays;
        });
        const trackedRows = rows.filter((row) => row.tracked);
        setCustom(storedCustom);
        setSelected(selectedKeys);
        setGoals(nextGoals);
        setTrackedCount(trackedRows.length);
        setSaved(
          trackedRows.length > 0 &&
            trackedRows.length === selectedKeys.length &&
            trackedRows.every(
              (row) => row.selected && row.trackedGoal === row.goalDays,
            ),
        );
        loaded.current = true;
        setHydrated(true);
      })
      .catch((error) => {
        if (error?.response?.status === 401) router.replace("/");
        else setHydrated(true);
      });
  }, [router]);

  const draft = JSON.stringify({
    habits: [
      ...custom.map((habit) => ({
        key: habit.id,
        name: habit.name,
        category: habit.category,
        icon: habit.icon,
        custom: true,
        selected: selected.includes(habit.id),
        goalDays: goals[habit.id] ?? 30,
      })),
      ...catalog
        .filter((habit) => selected.includes(habit.id))
        .map((habit) => ({
          key: habit.id,
          name: habit.name,
          category: habit.category,
          icon: habit.icon,
          custom: false,
          selected: true,
          goalDays: goals[habit.id] ?? 30,
        })),
    ],
  });

  useEffect(() => {
    if (!hydrated || !loaded.current) return;
    const timer = window.setTimeout(() => {
      axios
        .put("/api/habits", draft, {
          headers: { "Content-Type": "application/json" },
        })
        .catch(() => {});
    }, 400);
    return () => window.clearTimeout(timer);
  }, [hydrated, draft]);

  useEffect(() => {
    if (!modalOpen && !clearOpen && !aiHabit) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
        setClearOpen(false);
        setAiHabit(null);
      }
    };
    document.body.classList.add("overflow-hidden");
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("overflow-hidden");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [modalOpen, clearOpen, aiHabit]);

  useEffect(() => {
    if (aiCooldown <= 0) return;
    const timer = window.setTimeout(
      () => setAiCooldown((value) => value - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [aiCooldown]);

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
  const aiLocked = aiBusy || aiCooldown > 0;
  const aiWait =
    aiCooldown > 99 ? `${Math.ceil(aiCooldown / 60)} мин` : `${aiCooldown} с`;

  const askAi = async (habit: Habit) => {
    if (aiInfo[habit.id]) {
      setAiFailed(null);
      setAiHabit(habit);
      return;
    }
    if (aiBusy || aiCooldown > 0) return;
    setAiHabit(habit);
    setAiFailed(null);
    setAiBusy(true);
    try {
      const { data } = await axios.post("/api/habit-ai", { name: habit.name });
      const { cooldown, ...info } = data;
      setAiInfo((prev) => ({ ...prev, [habit.id]: info }));
      setAiCooldown(Number(cooldown) || 0);
    } catch (error) {
      setAiFailed(habit.id);
      const wait = axios.isAxiosError(error)
        ? Number(error.response?.data?.retryAfter)
        : 0;
      setAiCooldown(wait > 0 ? wait : 3);
    }
    setAiBusy(false);
  };

  const toggle = (id: string) => {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setGoals((prev) => (prev[id] ? prev : { ...prev, [id]: 30 }));
  };

  const clearAll = async () => {
    setSaved(false);
    setSelected([]);
    setClearOpen(false);
    setTrackedCount(0);
    try {
      await axios.delete("/api/habits/track");
    } catch {}
  };

  const removeCustom = (id: string) => {
    if (!window.confirm("Удалить привычку навсегда?")) return;
    setSaved(false);
    setCustom((prev) => prev.filter((habit) => habit.id !== id));
    setSelected((prev) => prev.filter((item) => item !== id));
    setGoals((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const createHabit = () => {
    const trimmed = name.trim();
    if (!trimmed || duplicate) return;
    const id = `custom-${Date.now()}`;
    setCustom((prev) => [
      { id, name: trimmed, category: newCategory, icon: newIcon, custom: true },
      ...prev,
    ]);
    setSelected((prev) => [id, ...prev]);
    setGoals((prev) => ({ ...prev, [id]: newGoal }));
    setName("");
    setNewCategory("Здоровье");
    setNewIcon("ban");
    setNewGoal(30);
    setSaved(false);
    setModalOpen(false);
  };

  const save = async () => {
    const payload = selectedHabits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      icon: habit.icon,
      goalDays: goals[habit.id] ?? 30,
    }));
    try {
      await axios.put("/api/habits", draft, {
        headers: { "Content-Type": "application/json" },
      });
      await axios.post("/api/habits/track");
    } catch {
      return;
    }
    setTrackedCount(payload.length);
    onSave?.(payload);
    setSaved(true);
    router.push(TRACKER_PATH);
  };

  return (
    <div
      className={`relative min-h-screen px-4 pb-28 pt-50 text-slate-100 transition-opacity duration-300 sm:px-6 sm:pt-36 lg:flex lg:h-dvh lg:min-h-150 lg:flex-col lg:overflow-hidden lg:px-10 lg:pb-6 lg:pt-24 ${
        hydrated ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative mx-auto flex w-full max-w-7xl flex-col lg:min-h-0 lg:flex-1">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mb-5 lg:shrink-0 lg:gap-4">
          <div>
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 py-1.5 pl-3 pr-4 text-sm text-slate-300 backdrop-blur lg:mb-2">
              <span className="flex gap-1">
                <span className="h-1.5 w-6 rounded-full bg-[#6366F1]" />
                <span className="h-1.5 w-6 rounded-full bg-white/10" />
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#6366F1]" />
                Шаг 1 из 2
              </span>
            </div>
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
            {trackedCount > 0 && (
              <Link
                href={TRACKER_PATH}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F1A] active:scale-[0.98]"
              >
                Мой прогресс
                <span className="rounded-md bg-[#6366F1]/20 px-1.5 text-xs tabular-nums text-[#A5B4FC]">
                  {trackedCount}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6366F1] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F1A] active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Создать свою
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[minmax(0,1fr)] lg:gap-6">
          <section className="lg:flex lg:min-h-0 lg:flex-col">
            <div className="mb-5 flex flex-col gap-4 lg:mb-3 lg:shrink-0 lg:gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Поиск привычки"
                  placeholder="Поиск привычки"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-11 text-sm text-slate-100 placeholder:text-slate-500 outline-none backdrop-blur transition focus:border-[#6366F1]/60 focus:bg-white/[0.07] focus:ring-4 focus:ring-[#6366F1]/10 lg:py-3"
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

              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                {categories.map((item) => (
                  <button
                    key={item}
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 ${
                      category === item
                        ? "border-[#6366F1] bg-[#6366F1] font-medium text-white shadow-lg shadow-[#6366F1]/20"
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
                Выбрано:{" "}
                <span className="tabular-nums text-slate-300">
                  {selectedHabits.length}
                </span>
              </p>
            </div>

            {filtered.length === 0 ? (
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
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70"
                >
                  <Plus className="h-4 w-4 text-[#6366F1]" />
                  {query
                    ? `Создать «${query.slice(0, 24)}»`
                    : "Создать привычку"}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:min-h-0 lg:flex-1 lg:content-start lg:overflow-y-auto lg:py-1 lg:pr-1">
                {filtered.map((habit) => {
                  const Icon = icons[habit.icon] ?? Ban;
                  const active = selected.includes(habit.id);
                  return (
                    <button
                      key={habit.id}
                      onClick={() => toggle(habit.id)}
                      aria-pressed={active}
                      className={`group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition duration-200 before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-white/25 before:to-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98] lg:p-3 ${
                        active
                          ? "border-[#6366F1]/70 bg-[#6366F1]/10 shadow-[0_10px_30px_-12px_rgba(99,102,241,0.6)]"
                          : "border-white/10 bg-[#111827]/60 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#111827]"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition duration-200 lg:h-10 lg:w-10 ${
                          active
                            ? "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30"
                            : "bg-white/5 text-[#6366F1] group-hover:bg-[#6366F1]/15"
                        }`}
                      >
                        <Icon className="h-6 w-6 lg:h-5 lg:w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-slate-100">
                          {habit.name}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                          {habit.custom && (
                            <span className="rounded-md bg-[#6366F1]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#A5B4FC]">
                              Своя
                            </span>
                          )}
                          {habit.category}
                        </span>
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition duration-200 ${
                          active
                            ? "border-[#6366F1] bg-[#6366F1] text-white"
                            : "border-white/15 text-transparent group-hover:border-white/30"
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="lg:flex lg:min-h-0 lg:flex-col">
            <div className="rounded-3xl border border-white/10 bg-[#111827]/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:p-4">
              <div className="mb-5 flex items-center justify-between gap-3 lg:mb-3 lg:shrink-0">
                <h2
                  className={` flex items-center gap-3 text-lg font-semibold`}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#6366F1]">
                    <Target className="h-5 w-5" />
                  </span>
                  Мои привычки
                </h2>
                <div className="flex items-center gap-2">
                  {selectedHabits.length > 0 && (
                    <button
                      onClick={() => setClearOpen(true)}
                      className="rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-white/5 hover:text-slate-200"
                    >
                      Очистить
                    </button>
                  )}
                  <span
                    className={` min-w-8 rounded-lg bg-white/5 px-2.5 py-1 text-center text-sm font-semibold tabular-nums text-slate-300`}
                  >
                    {selectedHabits.length}
                  </span>
                </div>
              </div>

              {selectedHabits.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 px-4 py-12 text-center lg:flex-1 lg:justify-center lg:py-6">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-slate-600">
                    <Flame className="h-6 w-6" />
                  </span>
                  <p className="text-sm text-slate-300">
                    Пока ничего не выбрано
                  </p>
                  <p className="mt-1 max-w-55 text-xs leading-relaxed text-slate-500">
                    Нажми на карточку слева, чтобы добавить привычку
                  </p>
                </div>
              ) : (
                <ul className="flex max-h-147.5 flex-col gap-2.5 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1 lg:gap-2">
                  {selectedHabits.map((habit) => {
                    const Icon = icons[habit.icon] ?? Ban;
                    return (
                      <li
                        key={habit.id}
                        className="rounded-2xl border border-white/10 bg-white/3 p-3 lg:p-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6366F1]/15 text-[#6366F1]">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">
                              {habit.name}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {habit.category}
                            </span>
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => askAi(habit)}
                              disabled={aiLocked && !aiInfo[habit.id]}
                              aria-label="Узнать подробнее о вреде"
                              title={
                                aiLocked && !aiInfo[habit.id]
                                  ? "ИИ отдыхает, подожди немного"
                                  : "Узнать подробнее о вреде"
                              }
                              className="mr-1 inline-flex min-w-14 items-center justify-center gap-1 rounded-lg bg-linear-to-r from-[#6366F1]/25 to-[#8B5CF6]/25 px-2 py-1 text-[11px] font-semibold tabular-nums text-[#C4B5FD] shadow-[0_0_14px_-4px_rgba(139,92,246,0.8)] ring-1 ring-[#8B5CF6]/30 transition hover:from-[#6366F1]/40 hover:to-[#8B5CF6]/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5CF6]/70 active:scale-95 disabled:cursor-not-allowed disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500 disabled:shadow-none disabled:ring-white/10 disabled:active:scale-100"
                            >
                              <Sparkles
                                className={`h-3.5 w-3.5 ${
                                  aiBusy && !aiInfo[habit.id]
                                    ? "animate-pulse"
                                    : ""
                                }`}
                              />
                              {aiInfo[habit.id]
                                ? "ИИ"
                                : aiBusy
                                  ? "…"
                                  : aiCooldown > 0
                                    ? aiWait
                                    : "ИИ"}
                            </button>
                            {habit.custom && (
                              <button
                                onClick={() => removeCustom(habit.id)}
                                aria-label="Удалить привычку навсегда"
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => toggle(habit.id)}
                              aria-label="Убрать привычку"
                              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/10 hover:text-slate-200"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 lg:mt-2">
                          <p className="mb-1.5 text-[11px] uppercase tracking-wider text-slate-500 lg:mb-1">
                            Цель в днях
                          </p>
                          <div className="grid grid-cols-5 gap-1.5">
                            {goalOptions.map((days) => (
                              <button
                                key={days}
                                onClick={() => {
                                  setSaved(false);
                                  setGoals((prev) => ({
                                    ...prev,
                                    [habit.id]: days,
                                  }));
                                }}
                                aria-pressed={(goals[habit.id] ?? 30) === days}
                                className={`rounded-lg border py-1.5 text-xs font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 lg:py-1 ${
                                  (goals[habit.id] ?? 30) === days
                                    ? "border-[#6366F1] bg-[#6366F1] text-white"
                                    : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                                }`}
                              >
                                {days}
                              </button>
                            ))}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <button
                onClick={save}
                disabled={selectedHabits.length === 0}
                className={`mt-5 hidden w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none lg:mt-3 lg:flex lg:shrink-0 lg:py-3 ${
                  saved
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 hover:bg-[#5558E8]"
                }`}
              >
                {saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Flame className="h-4 w-4" />
                )}
                {saved ? "Сохранено" : "Начать отслеживать"}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-white/10 bg-[#0B0F1A]/85 px-4 py-3 backdrop-blur-xl sm:px-6 lg:hidden">
        <div className="min-w-0 flex-1">
          <p className={` text-xl font-semibold leading-none tabular-nums`}>
            {selectedHabits.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">выбрано</p>
        </div>
        <button
          onClick={save}
          disabled={selectedHabits.length === 0}
          className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none ${
            saved
              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
              : "bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 hover:bg-[#5558E8]"
          }`}
        >
          {saved ? (
            <Check className="h-4 w-4" />
          ) : (
            <Flame className="h-4 w-4" />
          )}
          {saved ? "Сохранено" : "Начать отслеживать"}
        </button>
      </div>

      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-habit-title"
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#111827] shadow-2xl shadow-black/50 sm:rounded-3xl"
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

            <div className="flex flex-col gap-6 overflow-y-auto px-6 pb-6">
              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#0B0F1A]/60 p-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/30">
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
                  className={`w-full rounded-xl border bg-[#0B0F1A] px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:ring-4 ${
                    duplicate
                      ? "border-rose-500/60 focus:border-rose-500/60 focus:ring-rose-500/10"
                      : "border-white/10 focus:border-[#6366F1]/60 focus:ring-[#6366F1]/10"
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
                      className={`rounded-full border px-4 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 ${
                        newCategory === item
                          ? "border-[#6366F1] bg-[#6366F1] font-medium text-white"
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
                        className={`flex aspect-square items-center justify-center rounded-xl border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 ${
                          newIcon === key
                            ? "border-[#6366F1] bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25"
                            : "border-white/10 bg-white/5 text-[#6366F1] hover:bg-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-300">Цель</p>
                <div className="grid grid-cols-5 gap-2">
                  {goalOptions.map((days) => (
                    <button
                      key={days}
                      onClick={() => setNewGoal(days)}
                      aria-pressed={newGoal === days}
                      className={`rounded-xl border py-2.5 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 ${
                        newGoal === days
                          ? "border-[#6366F1] bg-[#6366F1] text-white"
                          : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-200"
                      }`}
                    >
                      <span
                        className={` block text-lg font-semibold leading-none`}
                      >
                        {days}
                      </span>
                      <span
                        className={`mt-1 block text-[11px] ${
                          newGoal === days ? "text-white/70" : "text-slate-500"
                        }`}
                      >
                        дней
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/10 bg-[#111827] p-4 sm:px-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
              >
                Отмена
              </button>
              <button
                onClick={createHabit}
                disabled={!name.trim() || duplicate}
                className="flex-1 rounded-xl bg-[#6366F1] py-3 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none"
              >
                Добавить
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
            className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-6 shadow-2xl shadow-black/50"
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
              Выбранные привычки пропадут и со страницы прогресса, а серии,
              рекорды и срывы будут удалены. Это действие нельзя отменить.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setClearOpen(false)}
                autoFocus
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70"
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

      {aiHabit && (
        <div
          onClick={() => setAiHabit(null)}
          className="fixed inset-0 z-50 flex animate-[ai-fade_0.25s_ease-out] items-end justify-center bg-black/70 p-0 backdrop-blur-sm motion-reduce:animate-none sm:items-center sm:p-6"
        >
          <style>{`
            @keyframes ai-fade{from{opacity:0}to{opacity:1}}
            @keyframes ai-pop{from{opacity:0;transform:translateY(16px) scale(.95)}to{opacity:1;transform:none}}
            @keyframes ai-glow{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
            @keyframes ai-spin{from{transform:translate(-50%,-50%) rotate(0deg)}to{transform:translate(-50%,-50%) rotate(360deg)}}
            @keyframes ai-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
            @keyframes ai-shimmer{to{transform:translateX(100%)}}
            @keyframes ai-twinkle{0%,100%{opacity:1;transform:scale(1) rotate(0deg)}50%{opacity:.6;transform:scale(1.25) rotate(18deg)}}
          `}</style>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_65%)]" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg animate-[ai-pop_0.4s_cubic-bezier(0.16,1,0.3,1)] motion-reduce:animate-none"
          >
            <div className="pointer-events-none absolute -inset-6 hidden animate-[ai-glow_4s_ease-in-out_infinite] rounded-[3rem] bg-linear-to-br from-[#6366F1]/40 via-[#8B5CF6]/30 to-[#A78BFA]/20 blur-3xl motion-reduce:animate-none sm:block" />
            <div className="relative flex max-h-[92vh] overflow-hidden rounded-t-3xl p-[1.5px] shadow-[0_0_60px_-12px_rgba(139,92,246,0.7)] sm:rounded-3xl">
              <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[200%] animate-[ai-spin_7s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0%,transparent_55%,#6366F1_75%,#A78BFA_88%,transparent_100%)] motion-reduce:animate-none" />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="ai-title"
                className="relative flex min-h-0 w-full flex-col overflow-hidden rounded-t-[22px] bg-[#111827] sm:rounded-[22px]"
              >
                <div className="relative shrink-0 overflow-hidden px-6 pb-4 pt-5">
                  <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 animate-[ai-glow_5s_ease-in-out_infinite] rounded-full bg-[#8B5CF6]/25 blur-3xl motion-reduce:animate-none" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[#6366F1] to-[#8B5CF6] text-white shadow-[0_0_24px_-2px_rgba(139,92,246,0.8)]">
                        <AiIcon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0">
                        <h2
                          id="ai-title"
                          className="truncate text-xl font-bold text-slate-100"
                        >
                          {aiHabit.name}
                        </h2>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#C4B5FD]">
                          <Sparkles className="h-3.5 w-3.5 animate-[ai-twinkle_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
                          Разбор от GigaChat
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAiHabit(null)}
                      aria-label="Закрыть"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-slate-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-5">
                  {aiError ? (
                    <div className="flex animate-[ai-rise_0.4s_ease-out_both] flex-col items-center rounded-2xl border border-dashed border-rose-500/30 bg-rose-500/5 px-4 py-8 text-center">
                      <p className="text-sm text-rose-300">
                        Не удалось получить ответ от ИИ
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Проверь подключение и попробуй ещё раз
                      </p>
                      <button
                        onClick={() => askAi(aiHabit)}
                        disabled={aiLocked}
                        className="mt-4 rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold tabular-nums text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-slate-500 disabled:shadow-none disabled:active:scale-100"
                      >
                        {aiBusy
                          ? "Запрашиваем…"
                          : aiCooldown > 0
                            ? `Повторить через ${aiWait}`
                            : "Повторить"}
                      </button>
                    </div>
                  ) : !aiCurrent ? (
                    <div className="flex flex-col gap-3" aria-live="polite">
                      <p className="flex items-center gap-2 text-sm text-slate-400">
                        <Sparkles className="h-4 w-4 animate-[ai-twinkle_1.6s_ease-in-out_infinite] text-[#8B5CF6] motion-reduce:animate-none" />
                        GigaChat готовит ответ…
                      </p>
                      {[16, 16, 20].map((height, index) => (
                        <div
                          key={index}
                          className={`relative overflow-hidden rounded-2xl bg-white/5 ${
                            height === 20 ? "h-20" : "h-16"
                          }`}
                        >
                          <div className="absolute inset-0 -translate-x-full animate-[ai-shimmer_1.6s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent motion-reduce:animate-none" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="animate-[ai-rise_0.5s_ease-out_both] motion-reduce:animate-none">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Чем это вредно
                        </p>
                        <ul className="flex flex-col gap-2">
                          {aiCurrent.harm.map((item) => (
                            <li
                              key={item}
                              className="flex gap-2.5 text-sm leading-relaxed text-slate-300"
                            >
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {aiCurrent.benefits.length > 0 && (
                        <div className="animate-[ai-rise_0.5s_ease-out_both] [animation-delay:120ms] motion-reduce:animate-none">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Что изменится, если бросить
                          </p>
                          <ul className="flex flex-col gap-2">
                            {aiCurrent.benefits.map((item) => (
                              <li
                                key={`${item.when}-${item.text}`}
                                className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-300"
                              >
                                <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
                                  <Check className="h-3 w-3" />
                                  {item.when}
                                </span>
                                {item.text}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex animate-[ai-rise_0.5s_ease-out_both] gap-3 rounded-2xl border border-[#6366F1]/30 bg-linear-to-br from-[#6366F1]/20 to-[#8B5CF6]/10 p-4 shadow-[0_0_30px_-10px_rgba(139,92,246,0.6)] [animation-delay:240ms] motion-reduce:animate-none">
                        <Flame className="mt-0.5 h-5 w-5 shrink-0 text-[#A78BFA]" />
                        <p className="text-sm leading-relaxed text-slate-100">
                          {aiCurrent.motivation}
                        </p>
                      </div>

                      {aiCurrent.tip && (
                        <p className="flex animate-[ai-rise_0.5s_ease-out_both] gap-2.5 text-sm leading-relaxed text-slate-400 [animation-delay:360ms] motion-reduce:animate-none">
                          <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#6366F1]" />
                          <span>
                            <span className="font-medium text-slate-300">
                              Совет:{" "}
                            </span>
                            {aiCurrent.tip}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 px-6 py-3">
                  <p className="text-[11px] leading-snug text-slate-600">
                    Ответ сгенерирован нейросетью и не заменяет консультацию
                    врача.
                  </p>
                  {aiCooldown > 0 && (
                    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[11px] tabular-nums text-slate-400">
                      Новый запрос через {aiWait}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
