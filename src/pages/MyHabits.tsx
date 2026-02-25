import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import AddHabitModal from '@/components/AddHabitModal';
import EditHabitModal from '@/components/EditHabitModal';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { getHabits, updateHabit, deleteHabit, addHabit as addHabitToSupabase } from '@/lib/supabase';
import type { Habit } from '@/types';

const CURRENT_USER_ID = '3cc74c07-e3a2-4c58-ae62-a5c7206f52d3';
 
export default function MyHabits() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState<'All' | 'Daily' | 'Weekly'>('All');
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setHabits(habits.map(h => h.id === id ? { ...h, completed: newCompleted } : h));
    try {
      await updateHabit(id, { completed: newCompleted });
    } catch (err) {
      setHabits(habits.map(h => h.id === id ? { ...h, completed: habit.completed } : h));
      setError('Failed to update habit');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;
    try {
      await deleteHabit(id);
      setHabits(habits.filter(h => h.id !== id));
    } catch (err) {
      setError('Failed to delete habit');
    }
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsEditModalOpen(true);
  };

  const saveEdit = async (id: string, updates: Partial<Habit>) => {
    try {
      const updated = await updateHabit(id, updates);
      setHabits(habits.map(h => h.id === id ? updated : h));
      setIsEditModalOpen(false);
      setEditingHabit(null);
    } catch (err) {
      setError('Failed to update habit');
    }
  };

  const addHabit = async (newHabit: Omit<Habit, 'id'>) => {
    try {
      const habit = await addHabitToSupabase(newHabit, CURRENT_USER_ID);
      setHabits([...habits, habit]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Add habit error:', err);
      setError('Failed to add habit');
    }
  };

  const filteredHabits = filter === 'All' ? habits : habits.filter(h => h.frequency === filter);

  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <TopNavbar pageTitle="My Habits" />
        <main className="p-8">
          {error && <div className="mb-4 p-4 bg-red-50 border border-red-300 text-red-700">{error}</div>}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <label htmlFor="filter" className="text-gray-700 font-medium">Filter:</label>
              <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value as 'All' | 'Daily' | 'Weekly')} className="px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors">
                <option>All</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 transition-colors font-medium">
              <Plus className="w-4 h-4" /> Add Habit
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHabits.map((habit) => (
              <div key={habit.id} className="bg-white border border-gray-300 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <button onClick={() => toggleHabit(habit.id)} className="w-6 h-6 flex items-center justify-center mt-1 focus:outline-none">
                    {habit.completed ? <CheckCircle className="w-6 h-6 text-gray-900" /> : <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 transition-all ${habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{habit.name}</h3>
                    <p className="text-sm text-gray-600">{habit.frequency}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(habit)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(habit.id)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-red-600 hover:bg-red-50 transition-colors font-medium">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredHabits.length === 0 && <div className="text-center py-12 bg-white border border-gray-300"><p className="text-gray-500">No habits found. Create your first habit!</p></div>}
        </main>
      </div>
      {isAddModalOpen && <AddHabitModal onClose={() => setIsAddModalOpen(false)} onSave={addHabit} />}
      {isEditModalOpen && editingHabit && <EditHabitModal habit={editingHabit} onClose={() => { setIsEditModalOpen(false); setEditingHabit(null); }} onSave={saveEdit} />}
    </div>
  );
}