import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  TrendingUp,
  Calendar,
  Target,
  Flame,
  CheckCircle2,
  Award,
  Leaf,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProgressData } from './hooks/useProgressData';
import { StatCard } from './components/StatCard';
import { WeeklyChart } from './components/WeeklyChart';
import { DistributionChart } from './components/DistributionChart';
import { MonthlyChart } from './components/MonthlyChart';

export default function Progress() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [mounted, setMounted] = useState(false);

  const {
    habits,
    logs,
    loading,
    lastUpdated,
    stats,
    fetchData,
    getChartData,
    monthlyData,
    distributionData
  } = useProgressData(user?.id);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = getChartData(timeRange);

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
              <WeeklyChart data={chartData} timeRange={timeRange} />
              <DistributionChart data={distributionData} habits={habits} />
            </div>

            {!hasNoLogs && <MonthlyChart data={monthlyData} />}
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