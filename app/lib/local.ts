import { dayKey, daysBetween } from "./days";
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
};

export type HabitDraft = {
  key: string;
  name: string;
  category: string;
  icon: string;
  custom: boolean;
  selected: boolean;
  goalDays: number;
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

export const saveHabits = (draft: string) =>
  run(() => {
    const data = read();
    const parsed = JSON.parse(draft) as { habits?: HabitDraft[] };
    const input = Array.isArray(parsed.habits) ? parsed.habits.slice(0, 200) : [];
    const keys = new Set(input.map((h) => h.key));

    const removed = new Set(
      data.habits.filter((h) => h.custom && !keys.has(h.key)).map((h) => h.id),
    );
    data.habits = data.habits.filter((h) => !removed.has(h.id));
    data.logs = data.logs.filter((l) => !removed.has(l.habitId));
    data.habits.forEach((h) => {
      if (!keys.has(h.key)) h.selected = false;
    });

    input.forEach((h) => {
      const goalDays =
        Number.isInteger(h.goalDays) && h.goalDays > 0 && h.goalDays <= 365
          ? h.goalDays
          : 30;
      const existing = data.habits.find((item) => item.key === h.key);
      if (existing) {
        existing.selected = h.selected === true;
        existing.goalDays = goalDays;
        return;
      }
      data.habits.push({
        id: newId(),
        key: h.key.slice(0, 64),
        name: h.name.trim().slice(0, 40),
        category: h.category.slice(0, 40),
        icon: h.icon.slice(0, 20),
        custom: h.custom === true,
        selected: h.selected === true,
        goalDays,
        tracked: false,
        trackedGoal: 30,
        startedAt: null,
        best: 0,
        relapses: 0,
        createdAt: new Date().toISOString(),
      });
    });

    write(data);
  });

export const startTracking = () =>
  run(() => {
    const data = read();
    const now = new Date().toISOString();
    const dropped = new Set(
      data.habits.filter((h) => !h.selected && h.tracked).map((h) => h.id),
    );
    data.logs = data.logs.filter((l) => !dropped.has(l.habitId));
    data.habits.forEach((h) => {
      if (dropped.has(h.id)) {
        Object.assign(h, { tracked: false, startedAt: null, best: 0, relapses: 0 });
      } else if (h.selected && h.tracked) {
        h.trackedGoal = h.goalDays;
      } else if (h.selected) {
        Object.assign(h, {
          tracked: true,
          trackedGoal: h.goalDays,
          startedAt: now,
          best: 0,
          relapses: 0,
        });
      }
    });
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

export const exportData = () => JSON.stringify(read(), null, 2);

export const importData = (text: string) => {
  const data = JSON.parse(text);
  if (!isData(data)) throw new Error("Bad backup");
  write(data);
};
