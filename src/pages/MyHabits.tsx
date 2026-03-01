import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Filter, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
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

export default function MyHabits() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .rpc('get_habits_with_status', {
          p_user_id: user.id
        });

      if (error) throw error;
      setHabits(data || []);
    } catch (err) {
      console.error('Error fetching habits:', err);
    } finally {
      setLoading(false); // <-- FIX: Stop loading spinner
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [user, filter]);

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
          completed: habitData.completed,
          reminder_enabled: habitData.reminder_enabled,
        });

      if (error) throw error;
      
      await fetchHabits();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habitId);

      if (error) throw error;
      setHabits(habits.filter(h => h.id !== habitId));
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const toggleHabit = async (habitId: string, currentStatus: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .rpc('toggle_habit_completion', {
          p_habit_id: habitId,
          p_user_id: user.id,
          p_current_status: currentStatus // <-- FIX: Pass actual status
        });

      if (error) throw error;
      
      await fetchHabits();
    } catch (err) {
      console.error('Error toggling habit:', err);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Habits</h1>
          <p className="text-gray-600 mt-1">
            Manage your eco-friendly habits, {profile?.full_name?.split(' ')[0] || 'User'}
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

      {/* Filter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-gray-700 font-medium">Filter:</span>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="All">All</option>
          <option value="Daily">Daily</option>
          <option value="Weekly">Weekly</option>
        </select>
      </div>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No habits found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'All' 
              ? "Create your first habit to get started!" 
              : `No ${filter.toLowerCase()} habits found. Try a different filter.`}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleHabit(habit.id, habit.completed)}  // <-- FIX: Pass current status
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      habit.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    {habit.completed && <CheckCircle2 className="w-5 h-5" />}
                  </button>
                  <div>
                    <h3 className={`font-semibold text-lg ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      {habit.name}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {habit.frequency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {habit.reminder_enabled && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      Reminder on
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddHabitModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveHabit}
      />
    </div>
  );
}