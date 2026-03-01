import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Stats {
  completedToday: number;
  totalHabits: number;
  completionRate: number;
  totalCompleted: number;
  currentStreak: number;
  bestStreak: number;
}

export function useStats(userId: string | undefined) {
  const [stats, setStats] = useState<Stats>({
    completedToday: 0,
    totalHabits: 0,
    completionRate: 0,
    totalCompleted: 0,
    currentStreak: 0,
    bestStreak: 0
  });
  const [loading, setLoading] = useState(true);

  const calculateStreak = (dates: string[]): { current: number; best: number } => {
    if (dates.length === 0) return { current: 0, best: 0 };
    
    const uniqueDays = [...new Set(dates.map(d => new Date(d).toDateString()))];
    uniqueDays.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // Calculate best streak
    let bestStreak = 0;
    let currentStreakCount = 0;
    
    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        currentStreakCount = 1;
      } else {
        const prevDate = new Date(uniqueDays[i - 1]);
        const currDate = new Date(uniqueDays[i]);
        const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreakCount++;
        } else {
          bestStreak = Math.max(bestStreak, currentStreakCount);
          currentStreakCount = 1;
        }
      }
    }
    bestStreak = Math.max(bestStreak, currentStreakCount);
    
    // Calculate current streak (must include today or yesterday)
    let currentStreak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDays[0] === today || uniqueDays[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const prevDate = new Date(uniqueDays[i - 1]);
        const currDate = new Date(uniqueDays[i]);
        const diffDays = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    return { current: currentStreak, best: bestStreak };
  };

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Get habits with today's status
      const { data: habits, error: habitsError } = await supabase
        .rpc('get_habits_with_status', {
          p_user_id: userId
        });

      if (habitsError) throw habitsError;
      
      const totalHabits = habits?.length || 0;
      const completedToday = habits?.filter((h: any) => h.completed).length || 0;
      const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

      // Get all-time total completions
      const { count: totalCompleted, error: countError } = await supabase
        .from('habit_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (countError) throw countError;

      // Get all logs for streak calculation
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (logsError) throw logsError;

      const streaks = calculateStreak(logs?.map((l: any) => l.completed_at) || []);

      setStats({
        completedToday,
        totalHabits,
        completionRate,
        totalCompleted: totalCompleted || 0,
        currentStreak: streaks.current,
        bestStreak: streaks.best
      });

    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
    
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, refresh: fetchStats };
}