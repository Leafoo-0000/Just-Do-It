import { useState } from 'react';
import { X } from 'lucide-react';
import type { Habit } from '@/types';

interface EditHabitModalProps {
  habit: Habit;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Habit>) => void;
}

export default function EditHabitModal({ habit, onClose, onSave }: EditHabitModalProps) {
  const [name, setName] = useState(habit.name);
  const [frequency, setFrequency] = useState(habit.frequency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(habit.id, { name, frequency });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h3 className="text-xl font-semibold text-gray-900">Edit Habit</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="habitName" className="block text-sm font-medium text-gray-900 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                id="habitName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Frequency
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value="Daily"
                    checked={frequency === 'Daily'}
                    onChange={(e) => setFrequency(e.target.value as 'Daily')}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="text-gray-900">Daily</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="frequency"
                    value="Weekly"
                    checked={frequency === 'Weekly'}
                    onChange={(e) => setFrequency(e.target.value as 'Weekly')}
                    className="w-4 h-4 accent-gray-900"
                  />
                  <span className="text-gray-900">Weekly</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gray-900 text-white border border-gray-900 hover:bg-gray-800 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}