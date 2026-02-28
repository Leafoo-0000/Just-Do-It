import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { Habit, CompletionLog, Stats, ChartDataPoint, MonthlyDataPoint, DistributionDataPoint } from '../types';

export function useProgressData(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    try {
      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase
          .from('habits')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
          .order('completed_at', { ascending: false })
      ]);

      setHabits(habitsData || []);
      setLogs(logsData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const interval = setInterval(fetchData, 10000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchData]);

  const stats = useMemo<Stats | null>(() => {
    if (!habits.length) return null;

    const totalHabits = habits.length;
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = logs.filter(log => log.completed_at.startsWith(today)).length;
    const completionRate = totalHabits > 0 ? Math.round((todaysLogs / totalHabits) * 100) : 0;

    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const hasActivityToday = logs.some(log => log.completed_at.startsWith(todayStr));
    const hasActivityYesterday = logs.some(log => log.completed_at.startsWith(yesterdayStr));
    
    if (hasActivityToday || hasActivityYesterday) {
      currentStreak = 1;
      for (let i = 1; i < 365; i++) {
        const checkDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        if (logs.some(log => log.completed_at.startsWith(checkDate))) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      totalHabits,
      completedToday: todaysLogs,
      completionRate,
      currentStreak,
      bestStreak: currentStreak,
      totalCompleted: logs.length
    };
  }, [habits, logs]);

  const getChartData = useCallback((timeRange: 'week' | 'month' | 'year'): ChartDataPoint[] => {
    if (!logs.length) return [];

    const now = new Date();
    const data: ChartDataPoint[] = [];
    
    if (timeRange === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLogs = logs.filter(log => {
          const logDate = new Date(log.completed_at);
          return logDate.getMonth() === monthDate.getMonth() && 
                 logDate.getFullYear() === monthDate.getFullYear();
        });
        
        data.push({
          label: months[monthDate.getMonth()],
          completions: monthLogs.length,
          target: habits.filter(h => h.frequency === 'daily').length * 30
        });
      }
    } else {
      const days = timeRange === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayLogs = logs.filter(log => log.completed_at.startsWith(dateStr));
        
        const label = timeRange === 'week' 
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        data.push({
          label,
          completions: dayLogs.length,
          target: habits.filter(h => h.frequency === 'daily').length
        });
      }
    }
    
    return data;
  }, [logs, habits]);

  const monthlyData = useMemo<MonthlyDataPoint[]>(() => {
    if (!logs.length) return [];
    
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    return weeks.map((week, index) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (28 - index * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.completed_at);
        return logDate >= weekStart && logDate < weekEnd;
      });
      
      const target = habits.filter(h => h.frequency === 'daily').length * 7;
      const completed = target > 0 ? Math.round((weekLogs.length / target) * 100) : 0;
      
      return { week, completed: Math.min(completed, 100), target: 100 };
    });
  }, [logs, habits]);

  const distributionData = useMemo<DistributionDataPoint[]>(() => {
    const daily = habits.filter(h => h.frequency === 'daily').length;
    const weekly = habits.filter(h => h.frequency === 'weekly').length;
    
    if (daily === 0 && weekly === 0) return [];
    
    return [
      { name: 'Daily', value: daily || 0, color: '#10b981' },
      { name: 'Weekly', value: weekly || 0, color: '#3b82f6' }
    ];
  }, [habits]);

  return {
    habits,
    logs,
    loading,
    lastUpdated,
    stats,
    fetchData,
    getChartData,
    monthlyData,
    distributionData
  };
}