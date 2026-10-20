export type Habit = {
  id: string;
  name: string;
  category: string;
  icon: string;
  custom?: boolean;
};

export type Tracked = {
  id: string;
  name: string;
  category: string;
  icon: string;
  goalDays: number;
};

export type Progress = Record<
  string,
  { startedAt: number; best: number; relapses: number }
>;
