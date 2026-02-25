import { useState } from 'react';
import { X } from 'lucide-react';
import type { AddHabitModalProps } from '@/types';

export default function AddHabitModal({ onClose, onSave }: AddHabitModalProps) {
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly'>('Daily');
  const [reminderEnabled, setReminderEnabled] = useState(false); // Add this state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave && habitName.trim()) {
      onSave({
        name: habitName,
        frequency,
        completed: false,
        reminder_enabled: reminderEnabled, // Include reminder in save
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 w-full max-w-lg shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-300">
          <h3 className="text-xl font-semibold text-gray-900">Add New Habit</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="habitName" className="block text-sm font-medium text-gray-900 mb-2">
                Habit Name
              </label>
              <input
                type="text"
                id="habitName"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:border-gray-500 transition-colors"
                placeholder="e.g., Use reusable bags for shopping"
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

            {/* Updated Reminder Toggle */}
            <div className="flex items-center justify-between py-4 border-t border-b border-gray-300">
              <label htmlFor="reminder" className="text-sm font-medium text-gray-900">
                Enable Reminders
              </label>
              <button
                type="button"
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={`relative inline-flex h-6 w-11 items-center transition-colors ${
                  reminderEnabled ? 'bg-gray-900' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-4">
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
                Save Habit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}