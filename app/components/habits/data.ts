import { Habit } from "../habits/types";
import {
  Ban,
  Candy,
  Cigarette,
  Coffee,
  Cookie,
  Gamepad2,
  Hand,
  Hourglass,
  Moon,
  Pizza,
  ShoppingBag,
  Smartphone,
  Sofa,
  Tv,
  Utensils,
  Wine,
  Zap,
  Flame,
} from "lucide-react";

export const catalog: Habit[] = [
  { id: "smoking", name: "Курение", category: "Здоровье", icon: "cigarette" },
  { id: "alcohol", name: "Алкоголь", category: "Здоровье", icon: "wine" },
  { id: "nails", name: "Грызть ногти", category: "Здоровье", icon: "hand" },
  {
    id: "sedentary",
    name: "Сидячий образ жизни",
    category: "Здоровье",
    icon: "sofa",
  },
  {
    id: "late-sleep",
    name: "Поздний отход ко сну",
    category: "Здоровье",
    icon: "moon",
  },
  { id: "sweets", name: "Сладкое", category: "Питание", icon: "candy" },
  { id: "fastfood", name: "Фастфуд", category: "Питание", icon: "pizza" },
  { id: "energy", name: "Энергетики", category: "Питание", icon: "zap" },
  { id: "coffee", name: "Лишний кофе", category: "Питание", icon: "coffee" },
  {
    id: "night-snacks",
    name: "Ночные перекусы",
    category: "Питание",
    icon: "utensils",
  },
  {
    id: "social",
    name: "Бесцельный скроллинг",
    category: "Цифровое",
    icon: "phone",
  },
  { id: "games", name: "Игры допоздна", category: "Цифровое", icon: "gamepad" },
  { id: "series", name: "Сериалы запоем", category: "Цифровое", icon: "tv" },
  {
    id: "procrastination",
    name: "Прокрастинация",
    category: "Цифровое",
    icon: "hourglass",
  },
  {
    id: "impulse",
    name: "Импульсивные траты",
    category: "Финансы",
    icon: "bag",
  },
];

export const categories = [
  "Все",
  "Здоровье",
  "Питание",
  "Цифровое",
  "Финансы",
  "Свои",
];

export const formCategories = ["Здоровье", "Питание", "Цифровое", "Финансы"];

export const goalOptions = [7, 14, 30, 66, 90];

export const pickerIcons = [
  "ban",
  "flame",
  "zap",
  "moon",
  "coffee",
  "phone",
  "gamepad",
  "candy",
  "wine",
  "hourglass",
  "bag",
  "tv",
  "cigarette",
  "pizza",
  "sofa",
  "hand",
  "utensils",
  "cookie",
];

export const TRACKER_PATH = "/components/habits/second";

// TRACKER
export const icons: Record<string, typeof Ban> = {
  ban: Ban,
  candy: Candy,
  cigarette: Cigarette,
  coffee: Coffee,
  cookie: Cookie,
  flame: Flame,
  gamepad: Gamepad2,
  hand: Hand,
  hourglass: Hourglass,
  moon: Moon,
  pizza: Pizza,
  bag: ShoppingBag,
  phone: Smartphone,
  sofa: Sofa,
  tv: Tv,
  utensils: Utensils,
  wine: Wine,
  zap: Zap,
};

export const HABITS_PATH = "/components/habits/first";
export const DAY = 86400000;
export const RING = 2 * Math.PI * 26;

export const plural = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
};
