"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { icons } from "@/app/components/habits/data";
import { ServerHabit } from "@/app/components/habits/types";
import {
  Ban,
  Check,
  Clock,
  Crown,
  Flame,
  Lock,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  User,
} from "lucide-react";
import {
  DAY,
  HABITS_PATH,
  providerNames,
  levels,
  achievements,
  plural,
} from "./data";

export type Stats = {
  habits: number;
  bestStreak: number;
  relapses: number;
  goalsDone: number;
  sessions: number;
  minutes: number;
};

export type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bio: string | null;
  createdAt: string;
  providers: string[];
  stats: Stats;
};

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<ServerHabit[]>([]);
  const [now, setNow] = useState(0);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axios
      .get("/api/profile")
      .then(({ data }) => {
        setProfile(data);
        setLoaded(true);
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          router.replace("/");
          return;
        }
        setError(true);
        setLoaded(true);
      });
  }, [router]);

  useEffect(() => {
    axios
      .get("/api/habits")
      .then(({ data }) => {
        setHabits(
          Array.isArray(data)
            ? data.filter((row: ServerHabit) => row.tracked)
            : [],
        );
        setNow(Date.now());
      })
      .catch(() => {});
  }, []);

  const streak = profile?.stats.bestStreak ?? 0;
  const levelIndex = levels.reduce(
    (acc, item, i) => (streak >= item.min ? i : acc),
    0,
  );
  const level = levels[levelIndex];
  const nextLevel = levels[levelIndex + 1];
  const levelPercent = nextLevel
    ? Math.round(((streak - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;
  const unlocked = profile
    ? achievements.filter((item) => item.done(profile.stats)).length
    : 0;

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
      className={`relative min-h-screen px-4 pb-16 pt-28 text-white transition-opacity duration-300 sm:px-6 sm:pt-36 lg:pb-6 lg:pt-24 ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="relative mx-auto max-w-6xl">
        {profile ? (
          <>
            <div className="mb-6 text-center lg:mb-3 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-slate-300 backdrop-blur-xl">
                <User className="h-4 w-4 text-indigo-400" />
                Профиль
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111827]/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-start-1 lg:row-start-1">
                <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#8B5CF6]/25 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-[#6366F1]/15 blur-3xl" />
                <div className="relative flex items-center gap-4">
                  <div className="shrink-0 rounded-full bg-linear-to-br from-[#6366F1] via-[#8B5CF6] to-[#A78BFA] p-0.5 shadow-[0_0_30px_-4px_rgba(139,92,246,0.7)]">
                    {profile.image ? (
                      <img
                        src={profile.image}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-full border-2 border-[#0B0F1A] object-cover"
                      />
                    ) : (
                      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#0B0F1A] bg-[#1E1B4B] text-3xl font-bold text-white">
                        {(profile.name ?? profile.email ?? "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">
                      {profile.name ?? "Без имени"}
                    </h1>
                    <p className="truncate text-sm text-slate-400">
                      {profile.email ?? "Email не указан"}
                    </p>
                    {profile.bio && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-300 lg:line-clamp-1">
                        {profile.bio}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {profile.providers.map((provider) => (
                        <span
                          key={provider}
                          className="rounded-md bg-[#6366F1]/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#A5B4FC]"
                        >
                          {providerNames[provider] ?? provider}
                        </span>
                      ))}
                      <span className="text-xs text-slate-500">
                        С нами с{" "}
                        {new Date(profile.createdAt).toLocaleDateString(
                          "ru-RU",
                          { month: "long", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="relative overflow-hidden rounded-3xl border border-[#6366F1]/30 bg-linear-to-br from-[#6366F1]/20 via-[#111827]/70 to-[#111827]/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-start-2 lg:row-start-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#A5B4FC]">
                    Уровень {levelIndex + 1} из {levels.length}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6366F1]/20 text-[#A78BFA]">
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
                  className="mt-3 h-2 w-full appearance-none overflow-hidden rounded-full bg-white/10 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-linear-to-r [&::-webkit-progress-value]:from-[#6366F1] [&::-webkit-progress-value]:to-[#A78BFA] [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:duration-700 [&::-moz-progress-bar]:rounded-full [&::-moz-progress-bar]:bg-[#8B5CF6]"
                />
                <p className="mt-2 text-xs text-slate-400">
                  {nextLevel
                    ? `До «${nextLevel.name}» ещё ${nextLevel.min - streak} ${plural(nextLevel.min - streak)} без срывов`
                    : "Максимальный уровень достигнут"}
                </p>
              </section>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-start-1 lg:row-start-2 lg:gap-2.5">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111827]/60 p-3 backdrop-blur transition hover:-translate-y-0.5 hover:border-[#6366F1]/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#6366F1]/25 to-[#8B5CF6]/10 text-[#A5B4FC] ring-1 ring-[#6366F1]/20">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-semibold leading-none tabular-nums">
                          {stat.value}
                        </span>
                        <span className="mt-1 block truncate text-[11px] text-slate-500">
                          {stat.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>

              <section className="rounded-3xl border border-white/10 bg-[#111827]/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-start-1 lg:row-start-3">
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
                            ? "border-[#6366F1]/40 bg-[#6366F1]/10 hover:-translate-y-0.5"
                            : "border-white/5 bg-white/3"
                        }`}
                      >
                        <span
                          className={`relative flex h-9 w-9 items-center justify-center rounded-full ${
                            done
                              ? "bg-linear-to-br from-[#6366F1] to-[#A78BFA] text-white shadow-[0_0_18px_-2px_rgba(139,92,246,0.8)]"
                              : "bg-white/5 text-slate-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {!done && (
                            <Lock className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#0B0F1A] p-0.5 text-slate-500" />
                          )}
                        </span>
                        <span
                          className={`text-[11px] font-medium leading-tight ${
                            done ? "text-slate-100" : "text-slate-500"
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] leading-tight text-slate-500 lg:[@media(max-height:760px)]:hidden">
                          {item.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="flex flex-col rounded-3xl border border-white/10 bg-[#111827]/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl lg:col-start-2 lg:row-span-2 lg:row-start-2 lg:h-0 lg:min-h-full">
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
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#6366F1] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#6366F1]/25 transition hover:bg-[#5558E8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1]/70 active:scale-[0.98]"
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
                                  : "bg-[#6366F1]/15 text-[#6366F1]"
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
                                : "[&::-webkit-progress-value]:bg-[#6366F1] [&::-moz-progress-bar]:bg-[#6366F1]"
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
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/3 px-6 py-20 text-center">
            <p className="text-lg font-semibold">
              {error ? "Не удалось загрузить профиль" : "Загружаем профиль"}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
