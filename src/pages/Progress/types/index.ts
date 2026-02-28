export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  completed: boolean;
  created_at: string;
}

export interface CompletionLog {
  id: string;
  habit_id: string;
  completed_at: string;
}

export interface Stats {
  totalHabits: number;
  completedToday: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
}

export interface ChartDataPoint {
  label: string;
  completions: number;
  target: number;
}

export interface MonthlyDataPoint {
  week: string;
  completed: number;
  target: number;
}

export interface DistributionDataPoint {
  name: string;
  value: number;
  color: string;
}