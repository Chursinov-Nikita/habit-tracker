import { Target, Flame, Trophy, Wind, Medal, Crown } from "lucide-react";
import { Stats } from "./page";

export const HABITS_PATH = "/components/habits/first";
export const DAY = 86400000;

export const providerNames: Record<string, string> = {
  google: "Google",
  github: "GitHub",
};

export const levels = [
  { min: 0, name: "Новичок" },
  { min: 3, name: "Первые шаги" },
  { min: 7, name: "Стойкий" },
  { min: 14, name: "Упорный" },
  { min: 30, name: "Железная воля" },
  { min: 60, name: "Мастер" },
  { min: 90, name: "Легенда" },
];

export const achievements: {
  title: string;
  hint: string;
  icon: typeof Target;
  done: (stats: Stats) => boolean;
}[] = [
  {
    title: "Первый шаг",
    hint: "Начни отслеживать привычку",
    icon: Target,
    done: (s) => s.habits >= 1,
  },
  {
    title: "Неделя силы",
    hint: "7 дней без срывов",
    icon: Flame,
    done: (s) => s.bestStreak >= 7,
  },
  {
    title: "Цель взята",
    hint: "Достигни цели по привычке",
    icon: Trophy,
    done: (s) => s.goalsDone >= 1,
  },
  {
    title: "Дзен",
    hint: "Проведи сессию медитации",
    icon: Wind,
    done: (s) => s.sessions >= 1,
  },
  {
    title: "Месяц стойкости",
    hint: "30 дней без срывов",
    icon: Medal,
    done: (s) => s.bestStreak >= 30,
  },
  {
    title: "Легенда",
    hint: "90 дней без срывов",
    icon: Crown,
    done: (s) => s.bestStreak >= 90,
  },
];

export const plural = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};
