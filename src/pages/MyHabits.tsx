import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import AddHabitModal from '@/components/AddHabitModal';
import { Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import type { Habit } from '@/types';

export default function MyHabits() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Daily' | 'Weekly'>('All');
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: 'Use reusable water bottle', frequency: 'Daily', completed: true },
    { id: '2', name: 'Bike to work', frequency: 'Daily', completed: true },
    { id: '3', name: 'Meal prep with local produce', frequency: 'Weekly', completed: false },
    { id: '4', name: 'Turn off lights when leaving room', frequency: 'Daily', completed: false },
    { id: '5', name: 'Compost food waste', frequency: 'Daily', completed: true },
    { id: '6', name: "Shop at farmer's market", frequency: 'Weekly', completed: false },
  ]);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => 
      h.id === id ? { ...h, completed: !h.completed } : h
    ));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const addHabit = (newHabit: Omit<Habit, 'id'>) => {
    const habit: Habit = {
      ...newHabit,
      id: Date.now().toString(),
    };
    setHabits([...habits, habit]);
  };

  const filteredHabits = filter === 'All' 
    ? habits 
    : habits.filter(h => h.frequency === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <TopNavbar pageTitle="My Habits" />

        <main className="p-8">
          {/* Header with Filter and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <label htmlFor="filter" className="text-gray-700 font-medium">
                Filter:
              </label>
              <select
                id="filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'All' | 'Daily' | 'Weekly')}
                className="px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              >
                <option>All</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Habit
            </button>
          </div>

          {/* Habits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHabits.map((habit) => (
              <div key={habit.id} className="bg-white border border-gray-300 p-6 shadow-sm">
                <div className="flex items-start gap-4 mb-4">
                  <button 
                    onClick={() => toggleHabit(habit.id)}
                    className="w-6 h-6 flex items-center justify-center mt-1 focus:outline-none"
                  >
                    {habit.completed ? (
                      <CheckCircle className="w-6 h-6 text-gray-900" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 transition-all ${
                      habit.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                    }`}>
                      {habit.name}
                    </h3>
                    <p className="text-sm text-gray-600">{habit.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteHabit(habit.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredHabits.length === 0 && (
            <div className="text-center py-12 bg-white border border-gray-300">
              <p className="text-gray-500">No habits found. Create your first habit!</p>
            </div>
          )}
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