import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import AddHabitModal from '@/components/AddHabitModal';
import { CheckCircle, Circle, Plus } from 'lucide-react';
import { getHabits, updateHabit, addHabit as addHabitToSupabase } from '@/lib/supabase';
import type { Habit } from '@/types';

// Toggle between users to test
const BASIL_USER_ID = '3cc74c07-e3a2-4c58-ae62-a5c7206f52d3';
const TINA_USER_ID = '80d677f8-46de-467e-85ce-c4aaaab6dcbd';

// Change this to test different users
const CURRENT_USER_ID = BASIL_USER_ID; // or TINA_USER_ID

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits from Supabase on load
  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      setLoading(true);
      const data = await getHabits(CURRENT_USER_ID);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }

  const toggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newCompleted = !habit.completed;
    
    // Optimistic update
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: newCompleted } : h
    ));

    try {
      await updateHabit(id, { completed: newCompleted });
    } catch (err) {
      // Revert on error
      setHabits(habits.map(h => 
        h.id === id ? { ...h, completed: habit.completed } : h
      ));
      setError('Failed to update habit');
    }
  };

  const addHabit = async (newHabit: Omit<Habit, 'id'>) => {
    try {
      const habit = await addHabitToSupabase(newHabit, CURRENT_USER_ID);
      setHabits([...habits, habit]);
    } catch (err) {
      setError('Failed to add habit');
    }
  };

  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const consistency = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopNavbar pageTitle="Dashboard" />
        <main className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700">
              {error}
            </div>
          )}
          
          {/* Rest of your Dashboard JSX remains the same */}
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-300 p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">Habits Completed Today</p>
              <p className="text-4xl font-bold text-gray-900">
                {completedCount}/{totalCount}
              </p>
              <div className="mt-3 w-full bg-gray-200 h-2">
                <div 
                  className="bg-gray-900 h-2 transition-all duration-500"
                  style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-300 p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">Weekly Consistency %</p>
              <p className="text-4xl font-bold text-gray-900">{consistency}%</p>
              <p className="text-xs text-gray-500 mt-2">Keep it up! You're building great habits.</p>
            </div>

            <div className="bg-white border border-gray-300 p-6 shadow-sm">
              <p className="text-sm text-gray-600 mb-2 font-medium">Sustainability Score</p>
              <p className="text-4xl font-bold text-gray-900">850</p>
              <p className="text-xs text-green-600 mt-2 font-medium">+12 points this week</p>
            </div>
          </div>

          {/* Today's Habits Section */}
          <div className="bg-white border border-gray-300 shadow-sm">
            <div className="p-6 border-b border-gray-300 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Today's Habits</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add New Habit
              </button>
            </div>

            <div className="divide-y divide-gray-300">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleHabit(habit.id)}
                      className="w-6 h-6 flex items-center justify-center focus:outline-none"
                    >
                      {habit.completed ? (
                        <CheckCircle className="w-6 h-6 text-gray-900" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    <div>
                      <p className={`font-medium transition-all ${
                        habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                      }`}>
                        {habit.name}
                      </p>
                      <p className="text-sm text-gray-600">{habit.frequency}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleHabit(habit.id)}
                    className={`px-4 py-2 border transition-colors font-medium ${
                      habit.completed 
                        ? 'border-gray-300 text-gray-500 bg-gray-100' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {habit.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <AddHabitModal 
          onClose={() => setIsModalOpen(false)} 
          onSave={addHabit}
        />
      )}
    </div>
  );
}