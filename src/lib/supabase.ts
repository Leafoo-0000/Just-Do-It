import { createClient } from '@supabase/supabase-js';
import type { Habit } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for habits
export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function addHabit(habit: Omit<Habit, 'id' | 'created_at'>, userId: string) {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ 
      ...habit, 
      user_id: userId,
      reminder_enabled: habit.reminder_enabled || false // Ensure it's saved
    }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateHabit(id: string, updates: Partial<Habit>) {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteHabit(id: string) {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}