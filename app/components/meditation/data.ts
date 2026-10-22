import { Phase } from "./page";

export const techniques: { name: string; hint: string; phases: Phase[] }[] = [
  {
    name: "Спокойное дыхание",
    hint: "Вдох 4 · выдох 6",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "exhale", label: "Выдох", seconds: 6 },
    ],
  },
  {
    name: "Квадратное дыхание",
    hint: "Вдох 4 · задержка 4 · выдох 4 · пауза 4",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "hold", label: "Задержка", seconds: 4 },
      { type: "exhale", label: "Выдох", seconds: 4 },
      { type: "rest", label: "Пауза", seconds: 4 },
    ],
  },
  {
    name: "4-7-8",
    hint: "Вдох 4 · задержка 7 · выдох 8",
    phases: [
      { type: "inhale", label: "Вдох", seconds: 4 },
      { type: "hold", label: "Задержка", seconds: 7 },
      { type: "exhale", label: "Выдох", seconds: 8 },
    ],
  },
];

export const durations = [1, 3, 5, 10];

export const durationClasses: Record<number, string> = {
  4: "duration-[4000ms]",
  6: "duration-[6000ms]",
  7: "duration-[7000ms]",
  8: "duration-[8000ms]",
};

export const ringLength = 2 * Math.PI * 140;
