import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import AddHabitModal from '@/components/AddHabitModal';
import EditHabitModal from '@/components/EditHabitModal';
import { Plus, Pencil, Trash2, CheckCircle, Circle } from 'lucide-react';
import { getHabits, addHabit as addHabitToSupabase, updateHabit, deleteHabit } from '@/lib/supabase';
import type { Habit } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function MyHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [filter, setFilter] = useState<'All' | 'Daily' | 'Weekly'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  async function fetchHabits() {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getHabits(user.id);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setLoading(false);
    }
  }

  const filteredHabits = habits.filter(habit => 
    filter === 'All' || habit.frequency === filter
  );

  const handleAddHabit = async (newHabit: Omit<Habit, 'id' | 'created_at'>) => {
    if (!user) return;
    
    try {
      const habit = await addHabitToSupabase(newHabit, user.id);
      setHabits([...habits, habit]);
      setIsAddModalOpen(false);
    } catch (err) {
      setError('Failed to add habit');
    }
  };

  const handleUpdateHabit = async (id: string, updates: Partial<Habit>) => {
    try {
      await updateHabit(id, updates);
      setHabits(habits.map(h => h.id === id ? { ...h, ...updates } : h));
      setEditingHabit(null);
    } catch (err) {
      setError('Failed to update habit');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    
    try {
      await deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError('Failed to delete habit');
    }
  };

  const toggleHabit = async (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const newCompleted = !habit.completed;
    
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: newCompleted } : h
    ));

    try {
      await updateHabit(id, { completed: newCompleted });
    } catch (err) {
      setHabits(habits.map(h => 
        h.id === id ? { ...h, completed: habit.completed } : h
      ));
      setError('Failed to update habit');
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700">
              {error}
            </div>
          )}
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Filter:</span>
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value as 'All' | 'Daily' | 'Weekly')}
                className="border border-gray-300 rounded px-3 py-2 bg-white"
              >
                <option value="All">All</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHabits.map((habit) => (
              <div key={habit.id} className="bg-white border border-gray-300 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleHabit(habit.id)} className="focus:outline-none">
                      {habit.completed ? (
                        <CheckCircle className="w-6 h-6 text-gray-900" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    <div>
                      <h3 className={`font-semibold ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {habit.name}
                      </h3>
                      <p className="text-sm text-gray-600">{habit.frequency}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setEditingHabit(habit)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredHabits.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No habits found. Create your first habit!
            </div>
          )}
        </main>
      </div>
      
      {isAddModalOpen && (
        <AddHabitModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={handleAddHabit} 
        />
      )}
      
      {editingHabit && (
        <EditHabitModal 
          habit={editingHabit}
          onClose={() => setEditingHabit(null)} 
          onSave={handleUpdateHabit} 
        />
      )}
    </div>
  );
}