import { dayKey, daysBetween } from "./days";
import { MAX_GOAL_DAYS, MAX_HELD_DAYS } from "@/app/habits/data";
import type { ServerHabit } from "@/app/habits/types";

const KEY = "habittrack:offline:v1";
const DAY = 86400000;

type StoredHabit = ServerHabit & { createdAt: string };
type Log = { habitId: string; day: string; completed: boolean };
type Meditation = { day: string; minutes: number };
type Data = {
  version: 1;
  createdAt: string;
  habits: StoredHabit[];
  logs: Log[];
  meditations: Meditation[];
  costs?: Record<string, { money: number; minutes: number }>;
};

export type TrackInput = {
  key: string;
  name: string;
  category: string;
  icon: string;
  custom: boolean;
  goalDays: number;
  heldDays?: number;
};

export type LocalStats = {
  habits: number;
  bestStreak: number;
  currentStreak: number;
  relapses: number;
  goalsDone: number;
  sessions: number;
  minutes: number;
};

const empty = (): Data => ({
  version: 1,
  createdAt: new Date().toISOString(),
  habits: [],
  logs: [],
  meditations: [],
});

const isData = (value: unknown): value is Data => {
  const v = value as Data;
  return (
    v?.version === 1 &&
    typeof v.createdAt === "string" &&
    Array.isArray(v.habits) &&
    Array.isArray(v.logs) &&
    Array.isArray(v.meditations)
  );
};

const read = (): Data => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (isData(data)) return data;
    }
  } catch {}
  const data = empty();
  write(data);
  return data;
};

const write = (data: Data) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
};

const tz = () => new Date().getTimezoneOffset();
const today = () => dayKey(new Date(), tz());
const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const strip = (habit: StoredHabit): ServerHabit => {
  const copy: Partial<StoredHabit> = { ...habit };
  delete copy.createdAt;
  return copy as ServerHabit;
};

const currentDays = (habit: ServerHabit, now: number) =>
  habit.startedAt
    ? Math.floor((now - new Date(habit.startedAt).getTime()) / DAY)
    : 0;

const run = <T>(fn: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (error) {
      reject(error);
    }
  });

export const getHabits = () =>
  run(() =>
    [...read().habits]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(strip),
  );

const moveStart = (data: Data, habit: StoredHabit, heldDays: number) => {
  const started = new Date(Date.now() - heldDays * DAY);
  const startDay = dayKey(started, tz());
  habit.startedAt = started.toISOString();
  data.logs = data.logs.filter(
    (log) =>
      log.habitId !== habit.id ||
      (log.completed ? log.day >= startDay : log.day <= startDay),
  );
};

export const trackHabit = (input: TrackInput) =>
  run(() => {
    const data = read();
    const goalDays =
      Number.isInteger(input.goalDays) &&
      input.goalDays > 0 &&
      input.goalDays <= MAX_GOAL_DAYS
        ? input.goalDays
        : 30;
    let habit = data.habits.find((h) => h.key === input.key);
    if (!habit) {
      habit = {
        id: newId(),
        key: input.key.slice(0, 64),
        name: input.name.trim().slice(0, 40),
        category: input.category.slice(0, 40),
        icon: input.icon.slice(0, 20),
        custom: input.custom,
        selected: true,
        goalDays,
        tracked: false,
        trackedGoal: goalDays,
        startedAt: null,
        best: 0,
        relapses: 0,
        createdAt: new Date().toISOString(),
      };
      data.habits.push(habit);
    }
    if (!habit.tracked || !habit.startedAt) {
      Object.assign(habit, {
        tracked: true,
        startedAt: new Date().toISOString(),
        best: 0,
        relapses: 0,
      });
    }
    Object.assign(habit, { selected: true, goalDays, trackedGoal: goalDays });
    const held = input.heldDays;
    if (
      held !== undefined &&
      Number.isInteger(held) &&
      held >= 0 &&
      held <= MAX_HELD_DAYS
    ) {
      moveStart(data, habit, held);
    }
    write(data);
  });

export const stopTracking = () =>
  run(() => {
    const data = read();
    data.logs = [];
    data.habits.forEach((h) =>
      Object.assign(h, {
        selected: false,
        tracked: false,
        startedAt: null,
        best: 0,
        relapses: 0,
      }),
    );
    write(data);
  });

export const untrackHabit = (key: string) =>
  run(() => {
    const data = read();
    const habit = data.habits.find((h) => h.key === key);
    if (!habit) return;
    data.logs = data.logs.filter((l) => l.habitId !== habit.id);
    Object.assign(habit, {
      selected: false,
      tracked: false,
      startedAt: null,
      best: 0,
      relapses: 0,
    });
    write(data);
  });

export const deleteHabit = (key: string) =>
  run(() => {
    const data = read();
    const habit = data.habits.find((h) => h.key === key);
    if (!habit || !habit.custom) return { wasTracked: false };
    data.habits = data.habits.filter((h) => h.id !== habit.id);
    data.logs = data.logs.filter((l) => l.habitId !== habit.id);
    write(data);
    return { wasTracked: habit.tracked };
  });

export const relapse = (key: string) =>
  run(() => {
    const data = read();
    const habit = data.habits.find((h) => h.key === key);
    if (!habit || !habit.tracked || !habit.startedAt) {
      throw new Error("Not found");
    }
    const now = new Date();
    const offset = tz();
    const day = dayKey(now, offset);
    const yesterday = dayKey(new Date(now.getTime() - DAY), offset);
    const days = currentDays(habit, now.getTime());
    const known = new Set(
      data.logs.filter((l) => l.habitId === habit.id).map((l) => l.day),
    );

    daysBetween(dayKey(new Date(habit.startedAt), offset), yesterday).forEach(
      (d) => {
        if (!known.has(d)) data.logs.push({ habitId: habit.id, day: d, completed: true });
      },
    );
    const todayLog = data.logs.find((l) => l.habitId === habit.id && l.day === day);
    if (todayLog) todayLog.completed = false;
    else data.logs.push({ habitId: habit.id, day, completed: false });

    habit.startedAt = now.toISOString();
    habit.best = Math.max(habit.best, days);
    habit.relapses += 1;
    write(data);

    return { startedAt: habit.startedAt, best: habit.best, relapses: habit.relapses };
  });

export const getLogs = (month: string) =>
  run(() => {
    const data = read();
    const offset = tz();
    const end = today();
    const [year, mon] = month.split("-").map(Number);
    const monthStart = `${month}-01`;
    const monthEnd = new Date(Date.UTC(year, mon, 0)).toISOString().slice(0, 10);
    const tracked = data.habits.filter((h) => h.tracked && h.startedAt);
    let changed = false;

    tracked.forEach((habit) => {
      const start = dayKey(new Date(habit.startedAt!), offset);
      const from = start > monthStart ? start : monthStart;
      const to = end < monthEnd ? end : monthEnd;
      const known = new Set(
        data.logs.filter((l) => l.habitId === habit.id).map((l) => l.day),
      );
      daysBetween(from, to).forEach((day) => {
        if (known.has(day)) return;
        data.logs.push({ habitId: habit.id, day, completed: true });
        changed = true;
      });
    });
    if (changed) write(data);

    const ids = new Set(tracked.map((h) => h.id));
    return data.logs
      .filter((l) => ids.has(l.habitId) && l.day.startsWith(month))
      .map((l) => ({
        id: `${l.habitId}:${l.day}`,
        habitId: l.habitId,
        date: l.day,
        completed: l.completed,
      }));
  });

export const getMeditationToday = () =>
  run(() => {
    const day = today();
    const sessions = read().meditations.filter((m) => m.day === day);
    return {
      sessions: sessions.length,
      minutes: sessions.reduce((sum, m) => sum + m.minutes, 0),
    };
  });

export const addMeditation = (minutes: number) =>
  run(() => {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 120) return;
    const data = read();
    data.meditations.push({ day: today(), minutes });
    write(data);
  });

export const getProfile = () =>
  run(() => {
    const data = read();
    const now = Date.now();
    const tracked = data.habits.filter((h) => h.tracked);
    const current = tracked.map((h) => currentDays(h, now));
    const stats: LocalStats = {
      habits: tracked.length,
      bestStreak: tracked.reduce((max, h, i) => Math.max(max, h.best, current[i]), 0),
      currentStreak: current.reduce((max, days) => Math.max(max, days), 0),
      relapses: tracked.reduce((sum, h) => sum + h.relapses, 0),
      goalsDone: tracked.filter(
        (h, i) => Math.max(h.best, current[i]) >= h.trackedGoal,
      ).length,
      sessions: data.meditations.length,
      minutes: data.meditations.reduce((sum, m) => sum + m.minutes, 0),
    };
    return { createdAt: data.createdAt, stats };
  });

export const getCosts = () => run(() => read().costs ?? {});

export const saveCost = (key: string, money: number, minutes: number) =>
  run(() => {
    const data = read();
    const clamp = (value: number, max: number) =>
      Number.isFinite(value) ? Math.min(Math.max(Math.round(value), 0), max) : 0;
    data.costs = {
      ...data.costs,
      [key]: { money: clamp(money, 100000), minutes: clamp(minutes, 1440) },
    };
    write(data);
  });

export const exportData = () => JSON.stringify(read(), null, 2);

export const importData = (text: string) => {
  const data = JSON.parse(text);
  if (!isData(data)) throw new Error("Bad backup");
  write(data);
};
