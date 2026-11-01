export type DailyCost = { money: number; minutes: number };

export const defaultCosts: Record<string, DailyCost> = {
  smoking: { money: 250, minutes: 60 },
  alcohol: { money: 300, minutes: 60 },
  nails: { money: 0, minutes: 0 },
  sedentary: { money: 0, minutes: 0 },
  "late-sleep": { money: 0, minutes: 0 },
  sweets: { money: 150, minutes: 0 },
  fastfood: { money: 400, minutes: 20 },
  energy: { money: 150, minutes: 0 },
  coffee: { money: 200, minutes: 15 },
  "night-snacks": { money: 200, minutes: 15 },
  social: { money: 0, minutes: 120 },
  games: { money: 0, minutes: 90 },
  series: { money: 0, minutes: 120 },
  procrastination: { money: 0, minutes: 90 },
  impulse: { money: 500, minutes: 15 },
};

export const formatMoney = (value: number) =>
  `${Math.round(value).toLocaleString("ru-RU")} ₽`;

export const formatTime = (minutes: number) => {
  if (minutes < 60) return `${Math.round(minutes)} мин`;
  const hours = minutes / 60;
  return `${hours.toLocaleString("ru-RU", { maximumFractionDigits: hours < 10 ? 1 : 0 })} ч`;
};

export const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
