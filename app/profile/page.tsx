"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ChangeEvent,
} from "react";
import Link from "next/link";
import { icons } from "@/app/habits/data";
import { ServerHabit } from "@/app/habits/types";
import {
  exportData,
  getHabits,
  getProfile,
  importData,
  type LocalStats,
} from "@/app/lib/local";
import { isSoundOn, setSoundOn, sound, subscribeSound } from "@/app/lib/sound";
import { markCelebrated, readCelebrated } from "@/app/lib/celebrated";
import Celebration from "@/app/elements/Celebration";
import {
  Ban,
  Check,
  Clock,
  Crown,
  Download,
  Flame,
  Lock,
  Plus,
  RotateCcw,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  Upload,
  User,
  Volume2,
  VolumeX,
} from "lucide-react";
import { DAY, HABITS_PATH, levels, achievements, plural } from "./data";

type Profile = {
  createdAt: string;
  stats: LocalStats;
};

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<ServerHabit[]>([]);
  const [now, setNow] = useState(0);
  const [error, setError] = useState(false);
  const [importError, setImportError] = useState(false);
  const [celebrated, setCelebrated] = useState<Set<string> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const soundOn = useSyncExternalStore(subscribeSound, isSoundOn, () => true);

  const toggleSound = () => {
    setSoundOn(!soundOn);
    if (!soundOn) sound.select();
  };

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setCelebrated(readCelebrated());
      })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    getHabits()
      .then((rows) => {
        setHabits(rows.filter((row) => row.tracked));
        setNow(Date.now());
      })
      .catch(() => {});
  }, []);

  const downloadBackup = () => {
    sound.tap();
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      importData(await file.text());
      window.location.reload();
    } catch {
      setImportError(true);
    }
  };

  const best = profile?.stats.bestStreak ?? 0;
  const current = profile?.stats.currentStreak ?? 0;
  const levelIndex = levels.reduce(
    (acc, item, i) => (best >= item.min ? i : acc),
    0,
  );
  const level = levels[levelIndex];
  const nextLevel = levels[levelIndex + 1];
  const daysToNext = nextLevel ? nextLevel.min - current : 0;
  const levelPercent = nextLevel
    ? Math.max(
        0,
        Math.round(
          ((current - level.min) / (nextLevel.min - level.min)) * 100,
        ),
      )
    : 100;
  const levelHint = !nextLevel
    ? "Максимальный уровень достигнут"
    : !profile?.stats.habits
      ? `Начни отслеживать привычку, чтобы дойти до уровня «${nextLevel.name}»`
      : `До уровня «${nextLevel.name}» ещё ${daysToNext} ${plural(daysToNext)} без срывов`;
  const unlocked = profile
    ? achievements.filter((item) => item.done(profile.stats)).length
    : 0;
  const newAchievement =
    profile && celebrated
      ? achievements.find(
          (item) =>
            item.done(profile.stats) && !celebrated.has(`achievement:${item.title}`),
        )
      : undefined;
  const newLevel =
    profile && celebrated && levelIndex > 0 && !celebrated.has(`level:${levelIndex}`)
      ? level
      : undefined;
  const celebration = newAchievement
    ? {
        key: `achievement:${newAchievement.title}`,
        icon: newAchievement.icon,
        eyebrow: "Достижение открыто",
        title: newAchievement.title,
        text: `${newAchievement.hint}. Ты это сделал — так держать!`,
      }
    : newLevel
      ? {
          key: `level:${levelIndex}`,
          icon: Crown,
          eyebrow: `Уровень ${levelIndex + 1} из ${levels.length}`,
          title: newLevel.name,
          text: nextLevel
            ? `Новый уровень! Следующая ступень — «${nextLevel.name}», серия от ${nextLevel.min} ${plural(nextLevel.min)}.`
            : "Ты на вершине — максимальный уровень достигнут.",
        }
      : undefined;

  const habitItems = habits.map((habit) => {
    const startedAt = habit.startedAt
      ? new Date(habit.startedAt).getTime()
      : now;
    const elapsed = Math.max(0, now - startedAt);
    const goalMs = habit.trackedGoal * DAY;
    return {
      ...habit,
      days: Math.floor(elapsed / DAY),
      done: elapsed >= goalMs,
      percent: Math.min(100, Math.floor((elapsed / goalMs) * 100)),
    };
  });

  const stats = profile
    ? [
        {
          label: "Привычек в работе",
          value: String(profile.stats.habits),
          icon: Target,
        },
        {
          label: "Лучшая серия",
          value: `${profile.stats.bestStreak} ${plural(profile.stats.bestStreak)}`,
          icon: Flame,
        },
        {
          label: "Целей достигнуто",
          value: String(profile.stats.goalsDone),
          icon: Trophy,
        },
        {
          label: "Срывов",
          value: String(profile.stats.relapses),
          icon: RotateCcw,
        },
        {
          label: "Сессий медитации",
          value: String(profile.stats.sessions),
          icon: Sparkles,
        },
        {
          label: "Минут медитации",
          value: String(profile.stats.minutes),
          icon: Clock,
        },
      ]
    : [];

  return (
    <main
      className="relative min-h-screen px-4 pb-16 pt-24 text-white sm:px-6 sm:pt-32 lg:pb-6 lg:pt-24"
    >
      <div className="relative mx-auto max-w-6xl">
        {profile ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface/70 p-4 shadow-2xl sm:p-5 shadow-black/30 backdrop-blur-xl lg:col-start-1 lg:row-start-1">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <div className="shrink-0 rounded-full bg-linear-to-br from-primary via-accent to-accent-soft p-0.5 shadow-[0_0_30px_-4px_rgba(139,92,246,0.7)]">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink bg-[#1E1B4B] text-white sm:h-20 sm:w-20">
                      <User className="h-7 w-7 sm:h-9 sm:w-9" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate font-display text-xl font-bold sm:text-3xl">
                      Мой профиль
                    </h1>
                    <p className="flex items-center gap-1.5 text-sm text-slate-400">
                      <Smartphone className="h-4 w-4 shrink-0" />
                      Данные на этом устройстве
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadBackup}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-xs sm:min-h-0 font-semibold text-primary-pale ring-1 ring-primary/30 transition hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Копия
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs sm:min-h-0 font-semibold text-slate-300 ring-1 ring-white/10 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        Восстановить
                      </button>
                      <button
                        type="button"
                        onClick={toggleSound}
                        aria-pressed={soundOn}
                        aria-label={soundOn ? "Звук включён" : "Звук выключен"}
                        className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition sm:min-h-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${
                          soundOn
                            ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30 hover:bg-emerald-400/20"
                            : "bg-white/5 text-slate-400 ring-white/10 hover:bg-white/10"
                        }`}
                      >
                        {soundOn ? (
                          <Volume2 className="h-3.5 w-3.5" />
                        ) : (
                          <VolumeX className="h-3.5 w-3.5" />
                        )}
                        <span className="hidden sm:inline">{soundOn ? "Звук" : "Без звука"}</span>
                      </button>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="application/json,.json"
                        onChange={restoreBackup}
                        className="hidden"
                      />
                    </div>
                    {importError && (
                      <p role="alert" className="mt-2 text-xs text-rose-400">
                        Этот файл не похож на копию трекера
                      </p>
                    )}
                    <div className="mt-2">
                      <span className="text-xs text-slate-500">
                        С нами с{" "}
                        {new Date(profile.createdAt).toLocaleDateString(
                          "ru-RU",
                          { day: "numeric", month: "long", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-linear-to-br from-primary/20 via-surface/70 to-surface/70 p-4 shadow-2xl sm:p-5 shadow-black/30 backdrop-blur-xl lg:col-start-2 lg:row-start-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-primary-soft">
                    Уровень {levelIndex + 1} из {levels.length}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/20 text-accent-soft">
                    <Crown className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-1 font-display text-2xl font-bold">
                  {level.name}
                </p>
                <progress
                  value={levelPercent}
                  max={100}
                  aria-label="Прогресс до следующего уровня"
                  className="mt-3 h-2 w-full appearance-none overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-linear-to-r [&::-webkit-progress-value]:from-primary [&::-webkit-progress-value]:to-accent-soft [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-700 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-accent"
                />
                <p className="mt-2 text-xs text-slate-400">
                  {levelHint}
                </p>
              </section>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:col-start-1 lg:row-start-2 lg:gap-2.5">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex min-w-0 flex-col gap-1 rounded-2xl border border-white/10 bg-surface/60 p-3 backdrop-blur transition sm:flex-row sm:items-center sm:gap-3 sm:hover:-translate-y-0.5 sm:hover:border-primary/40"
                    >
                      <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 to-accent/10 text-primary-soft ring-1 ring-primary/20 sm:flex">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-semibold leading-tight tabular-nums">
                          {stat.value}
                        </span>
                        <span className="mt-1 block text-[11px] leading-tight text-slate-500">
                          {stat.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <section className="rounded-3xl border border-white/10 bg-surface/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-start-1 lg:row-start-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-base font-semibold">Достижения</h2>
                  <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-300">
                    {unlocked} из {achievements.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {achievements.map((item) => {
                    const Icon = item.icon;
                    const done = item.done(profile.stats);
                    return (
                      <div
                        key={item.title}
                        title={`${item.title}: ${item.hint}`}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-2.5 text-center transition ${
                          done
                            ? "border-primary/40 bg-primary/10 hover:-translate-y-0.5"
                            : "border-white/5 bg-white/3"
                        }`}
                      >
                        <span
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
                            done
                              ? "bg-linear-to-br from-primary to-accent-soft text-white shadow-[0_0_18px_-2px_rgba(139,92,246,0.8)]"
                              : "bg-white/5 text-slate-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {!done && (
                            <Lock className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-ink p-0.5 text-slate-500" />
                          )}
                        </span>
                        <span
                          className={`text-[11px] font-medium leading-tight ${
                            done ? "text-slate-100" : "text-slate-500"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="hidden text-[10px] leading-tight text-slate-500 sm:block lg:[@media(max-height:760px)]:hidden">
                          {item.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="hidden flex-col rounded-3xl border border-white/10 bg-surface/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:flex lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:h-0 lg:min-h-full">
                <div className="mb-3 flex items-center justify-between lg:shrink-0">
                  <h2 className="text-base font-semibold">Мои привычки</h2>
                  <span className="rounded-lg bg-white/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-slate-300">
                    {habitItems.length}
                  </span>
                </div>

                {habitItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center lg:min-h-0 lg:flex-1 lg:py-4">
                    <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-slate-600">
                      <Flame className="h-5 w-5" />
                    </span>
                    <p className="text-sm text-slate-300">
                      Пока нет отслеживаемых привычек
                    </p>
                    <Link
                      href={HABITS_PATH}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 active:scale-[0.98]"
                    >
                      <Plus className="h-4 w-4" />
                      Выбрать привычки
                    </Link>
                  </div>
                ) : (
                  <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto pr-1 lg:max-h-none lg:min-h-0 lg:flex-1">
                    {habitItems.map((item) => {
                      const Icon = icons[item.icon] ?? Ban;
                      return (
                        <li
                          key={item.key}
                          className={`rounded-2xl border p-2.5 ${
                            item.done
                              ? "border-emerald-500/30 bg-emerald-500/4"
                              : "border-white/10 bg-white/3"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                                item.done
                                  ? "bg-emerald-500/15 text-emerald-300"
                                  : "bg-primary/15 text-primary"
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-slate-100">
                                {item.name}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {item.days} {plural(item.days)} из{" "}
                                {item.trackedGoal}
                              </span>
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
                          <progress
                            value={item.percent}
                            max={100}
                            aria-label={`Прогресс: ${item.name}`}
                            className={`mt-2 h-1.5 w-full appearance-none overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-700 [&::-moz-progress-bar]:rounded-full ${
                              item.done
                                ? "[&::-webkit-progress-value]:bg-emerald-500 [&::-moz-progress-bar]:bg-emerald-500"
                                : "[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                            }`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : (
          error ? (
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-20 text-center">
              <p className="text-lg font-semibold">Не удалось загрузить профиль</p>
            </div>
          ) : (
            <div aria-hidden="true" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="h-36 animate-pulse rounded-3xl bg-white/5" />
              <div className="h-36 animate-pulse rounded-3xl bg-white/5" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((tile) => (
                  <div key={tile} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                ))}
              </div>
              <div className="h-48 animate-pulse rounded-3xl bg-white/5 lg:row-span-2" />
              <div className="h-40 animate-pulse rounded-3xl bg-white/5" />
            </div>
          )
        )}
      </div>

      {celebration && (
        <Celebration
          key={celebration.key}
          icon={celebration.icon}
          eyebrow={celebration.eyebrow}
          title={celebration.title}
          text={celebration.text}
          onClose={() => setCelebrated(markCelebrated(celebration.key))}
        />
      )}
    </main>
  );
}
