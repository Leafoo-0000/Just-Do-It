export interface Habit {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  completed: boolean;
  category?: string;
}

export interface TopNavbarProps {
  pageTitle: string;
}

export interface AddHabitModalProps {
  onClose: () => void;
  onSave?: (habit: Omit<Habit, 'id'>) => void;
}