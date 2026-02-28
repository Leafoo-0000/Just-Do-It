import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle2, Plus, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import AddHabitModal from '../components/AddHabitModal';

interface Habit {
  id: string;
  user_id: string;
  name: string;
  frequency: string;
  completed: boolean;
  reminder_enabled: boolean;
  created_at: string;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [stats, setStats] = useState({
    completedToday: 0,
    totalHabits: 0,
    weeklyConsistency: 0
  });

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      // Use the database function to get habits with completion status
      const { data, error } = await supabase
        .rpc('get_habits_with_status', {
          p_user_id: user.id
        });

      if (error) throw error;
      
      const habitsData = data || [];
      setHabits(habitsData);
      
      const completed = habitsData.filter((h: Habit) => h.completed).length;
      setStats({
        completedToday: completed,
        totalHabits: habitsData.length,
        weeklyConsistency: habitsData.length > 0 
          ? Math.round((completed / habitsData.length) * 100) 
          : 0
      });
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
    
    // Refresh every minute to check for day/week changes
    const interval = setInterval(fetchHabits, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleToggleHabit = async (habitId: string) => {
    if (!user) return;

    try {
      // Use the database function to toggle completion
      const { data: newStatus, error } = await supabase
        .rpc('toggle_habit_completion', {
          p_habit_id: habitId,
          p_user_id: user.id,
          p_current_status: false // Parameter kept for compatibility
        });

      if (error) throw error;
      
      // Refresh to get updated status
      await fetchHabits();
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleSaveHabit = async (habitData: {
    name: string;
    frequency: 'Daily' | 'Weekly';
    completed: boolean;
    reminder_enabled: boolean;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitData.name,
          frequency: habitData.frequency.toLowerCase(),
          completed: false, // Always start as incomplete
          reminder_enabled: habitData.reminder_enabled,
        });

      if (error) throw error;
      
      await fetchHabits();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Track your eco-friendly habits and make a positive impact.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Completed Today</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.completedToday}</p>
          </div>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Habits</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalHabits}</p>
          </div>
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="w-7 h-7 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Consistency</p>
            <p className="text-4xl font-bold text-gray-900 mt-2">{stats.weeklyConsistency}%</p>
          </div>
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Today's Habits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Today's Habits</h2>
            <p className="text-gray-500 mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Habit
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {habits.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Start building your eco-friendly routine by creating your first habit!
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Your First Habit
              </button>
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      habit.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {habit.completed && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <div>
                    <p className={`font-semibold text-lg ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {habit.name}
                    </p>
                    <p className="text-sm text-gray-500 capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        habit.frequency === 'daily' ? 'bg-blue-400' : 'bg-purple-400'
                      }`}></span>
                      {habit.frequency} • Resets {habit.frequency === 'daily' ? 'tomorrow' : 'next week'}
                    </p>
                  </div>
                </div>
                {habit.reminder_enabled && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                    Reminder on
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/my-habits"
          className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-green-900 text-lg mb-2 group-hover:text-green-800">Manage Habits</h3>
              <p className="text-green-700">View and edit all your habits</p>
            </div>
            <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-green-700" />
            </div>
          </div>
        </Link>

        <Link
          to="/progress"
          className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-blue-900 text-lg mb-2 group-hover:text-blue-800">View Progress</h3>
              <p className="text-blue-700">See your sustainability journey over time</p>
            </div>
            <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-blue-700" />
            </div>
          </div>
        </Link>
      </div>

      <AddHabitModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveHabit}
      />
    </div>
  );
}