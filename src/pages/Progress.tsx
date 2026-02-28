import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Leaf,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  completed: boolean;
  created_at: string;
}

interface CompletionLog {
  id: string;
  habit_id: string;
  completed_at: string;
}

export default function Progress() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<CompletionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Fetch habits
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (habitsError) throw habitsError;

      // Fetch completion logs for last year
      const { data: logsData, error: logsError } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false });

      if (logsError) throw logsError;
      
      setHabits(habitsData || []);
      setLogs(logsData || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    fetchData();
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    const interval = setInterval(fetchData, 10000);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [fetchData]);

  const stats = useMemo(() => {
    if (!habits.length) return null;

    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completed).length;
    
    // Calculate completion rate based on logs vs expected
    const today = new Date().toISOString().split('T')[0];
    const todaysLogs = logs.filter(log => log.completed_at.startsWith(today)).length;
    const completionRate = totalHabits > 0 ? Math.round((todaysLogs / totalHabits) * 100) : 0;

    // Calculate streak from logs
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const hasActivityToday = logs.some(log => log.completed_at.startsWith(todayStr));
    const hasActivityYesterday = logs.some(log => log.completed_at.startsWith(yesterdayStr));
    
    if (hasActivityToday || hasActivityYesterday) {
      currentStreak = 1;
      for (let i = 1; i < 365; i++) {
        const checkDate = new Date(Date.now() - i * 86400000).toISOString().split('T')[0];
        const hasActivity = logs.some(log => log.completed_at.startsWith(checkDate));
        if (hasActivity) {
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
      bestStreak: currentStreak, // Simplified - would need historical calculation
      totalCompleted: logs.length
    };
  }, [habits, logs]);

  // Get data based on selected time range
  const chartData = useMemo(() => {
    if (!logs.length) return [];

    const now = new Date();
    let days = 7;
    let labelFormat = 'day';

    if (timeRange === 'month') {
      days = 30;
      labelFormat = 'date';
    } else if (timeRange === 'year') {
      days = 365;
      labelFormat = 'month';
    }

    const data = [];
    
    if (timeRange === 'year') {
      // Group by month for year view
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
      // Daily view for week/month
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
  }, [logs, habits, timeRange]);

  // Monthly performance data (last 4 weeks)
  const monthlyData = useMemo(() => {
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

  const distributionData = useMemo(() => {
    const daily = habits.filter(h => h.frequency === 'daily').length;
    const weekly = habits.filter(h => h.frequency === 'weekly').length;
    
    if (daily === 0 && weekly === 0) return [];
    
    return [
      { name: 'Daily', value: daily || 0, color: '#10b981' },
      { name: 'Weekly', value: weekly || 0, color: '#3b82f6' }
    ];
  }, [habits]);

  if (loading && !habits.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const hasNoHabits = habits.length === 0;
  const hasNoLogs = logs.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              Your Progress
            </h1>
            <p className="mt-2 text-gray-600">Track your sustainability journey and habit consistency</p>
            {lastUpdated && (
              <p className="text-xs text-gray-400 mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Empty State - No Habits */}
        {hasNoHabits && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Habits Yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start tracking your eco-friendly habits to see your progress and build a sustainable lifestyle.
            </p>
            <Link
              to="/my-habits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Create Your First Habit
            </Link>
          </div>
        )}

        {/* Empty State - Habits exist but no logs yet */}
        {!hasNoHabits && hasNoLogs && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Building Your History</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You have {habits.length} habit(s) ready! Complete them to start tracking your progress over time.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5" />
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        {!hasNoHabits && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
              label="Completed Today"
              value={stats.completedToday}
              subtext={`of ${stats.totalHabits} habits`}
              trend={stats.completedToday > 0 ? 'Good job!' : 'Start now!'}
              trendUp={stats.completedToday > 0}
            />
            <StatCard
              icon={<Target className="h-6 w-6 text-blue-600" />}
              label="Completion Rate"
              value={`${stats.completionRate}%`}
              subtext="Today's progress"
              trend={stats.completionRate > 50 ? 'Great!' : 'Keep going!'}
              trendUp={stats.completionRate > 50}
            />
            <StatCard
              icon={<Flame className="h-6 w-6 text-orange-500" />}
              label="Current Streak"
              value={`${stats.currentStreak} days`}
              subtext={`Best: ${stats.bestStreak} days`}
              trend={stats.currentStreak > 0 ? '🔥 On fire!' : 'Start today!'}
              trendUp={stats.currentStreak > 0}
              highlight={stats.currentStreak > 3}
            />
            <StatCard
              icon={<Leaf className="h-6 w-6 text-green-600" />}
              label="Total Completed"
              value={stats.totalCompleted}
              subtext="All time"
              trend={stats.totalCompleted > 0 ? 'Making impact!' : 'Begin now!'}
              trendUp={true}
            />
          </div>
        )}

        {/* Charts */}
        {!hasNoHabits && mounted && (
          <>
            {/* Time Range Selector */}
            <div className="flex justify-end mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex gap-1">
                {(['week', 'month', 'year'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                      timeRange === range
                        ? 'bg-green-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Activity Chart - Dynamic based on time range */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-green-600" />
                      {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Yearly'} Activity
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {timeRange === 'week' ? 'Last 7 days' : timeRange === 'month' ? 'Last 30 days' : 'Last 12 months'} of completions
                    </p>
                  </div>
                </div>
                <div className="h-64 min-h-[256px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="label" 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completions" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="target" 
                          stroke="#e5e7eb" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No data for this period
                    </div>
                  )}
                </div>
              </div>

              {/* Habit Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      Habit Types
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Daily vs Weekly distribution</p>
                  </div>
                </div>
                <div className="h-64 min-h-[256px]">
                  {distributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          iconType="circle"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      No habits created
                    </div>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-600">
                      {habits.filter(h => h.frequency === 'daily').length}
                    </p>
                    <p className="text-sm text-green-700">Daily Habits</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-blue-600">
                      {habits.filter(h => h.frequency === 'weekly').length}
                    </p>
                    <p className="text-sm text-blue-700">Weekly Habits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Performance - Only show if we have logs */}
            {!hasNoLogs && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Monthly Performance
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Completion percentage by week</p>
                  </div>
                </div>
                <div className="h-64 min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="week" 
                        stroke="#6b7280" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        unit="%"
                      />
                      <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        />
                      <Bar 
                        dataKey="completed" 
                        name="Completion Rate"
                        fill="#8b5cf6" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {/* Insights Section */}
        {!hasNoHabits && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Sustainability Insights</h3>
                <p className="text-green-100 mb-4">
                  {stats && stats.currentStreak > 3 
                    ? "Amazing work! You're building strong eco-friendly habits. Your consistency is making a real impact on the planet."
                    : stats && stats.currentStreak > 0
                    ? "Good start! Keep going to build a streak and make a lasting impact."
                    : "Start completing your habits today to see your impact grow!"}
                </p>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>CO₂ Saved: ~{(stats?.totalCompleted || 0) * 0.5}kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span>Trees equivalent: ~{Math.floor((stats?.totalCompleted || 0) * 0.1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly subtext: string;
  readonly trend: string;
  readonly trendUp: boolean;
  readonly highlight?: boolean;
}

function StatCard({ icon, label, value, subtext, trend, trendUp, highlight }: Readonly<StatCardProps>) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md ${highlight ? 'ring-2 ring-orange-200' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {trend}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>
        <p className="text-xs text-gray-400 mt-1">{subtext}</p>
      </div>
    </div>
  );
}