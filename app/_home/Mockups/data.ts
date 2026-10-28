export type DayState = "empty" | "clean" | "relapse" | "today" | "future";

const OFFSET = 3;
const DAYS_IN_MONTH = 31;
const RELAPSE_DAY = 6;
export const TODAY = 27;

export const calendar: { day: number | null; state: DayState }[] = Array.from(
  { length: 35 },
  (_, i) => {
    const day = i - OFFSET + 1;
    if (day < 1 || day > DAYS_IN_MONTH) return { day: null, state: "empty" };
    if (day === RELAPSE_DAY) return { day, state: "relapse" };
    if (day === TODAY) return { day, state: "today" };
    if (day > TODAY) return { day, state: "future" };
    return { day, state: "clean" };
  },
);

export const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export const tracked = [
  { name: "Курение", icon: "cigarette", days: 21, goal: 30 },
  { name: "Сладкое", icon: "candy", days: 14, goal: 14 },
  { name: "Скроллинг", icon: "phone", days: 9, goal: 30 },
];

export const streak = { name: "Курение", icon: "cigarette", days: 21, goal: 30 };
