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

export type ServerHabit = {
  id: string;
  key: string;
  name: string;
  category: string;
  icon: string;
  custom: boolean;
  selected: boolean;
  goalDays: number;
  tracked: boolean;
  trackedGoal: number;
  startedAt: string | null;
  best: number;
  relapses: number;
};
