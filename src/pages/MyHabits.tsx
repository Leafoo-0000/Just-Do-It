import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Plus, Filter, Edit2, Trash2, CheckCircle2, Sparkles, Lightbulb } from 'lucide-react';
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

// AI Suggestions data - cycles through these
const AI_SUGGESTIONS = [
  {
    id: 1,
    title: "Zero-Waste Shopping",
    description: "Bring reusable bags and containers for your next grocery trip to eliminate single-use plastics.",
    impact: "High",
    category: "Shopping"
  },
  {
    id: 2,
    title: "Meatless Mondays",
    description: "Skip meat one day a week to reduce your carbon footprint and discover delicious plant-based meals.",
    impact: "Medium",
    category: "Diet"
  },
  {
    id: 3,
    title: "5-Minute Shower Challenge",
    description: "Time your showers to stay under 5 minutes and save up to 12,000 gallons of water per year.",
    impact: "High",
    category: "Water"
  },
  {
    id: 4,
    title: "Digital Cleanup",
    description: "Delete unused files and emails today—digital storage consumes more energy than you might think.",
    impact: "Low",
    category: "Digital"
  },
  {
    id: 5,
    title: "Local Produce First",
    description: "Choose locally grown produce to cut transportation emissions and support your community.",
    impact: "Medium",
    category: "Food"
  }
];

export default function MyHabits() {
  const { user, profile } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // AI Suggestion state
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Cycle through suggestions every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSuggestionIndex((prev) => (prev + 1) % AI_SUGGESTIONS.length);
        setIsAnimating(false);
      }, 300); // Wait for fade out before changing
    }, 8000);

    return () => clearInterval(interval);
  }, []);

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
      setLoading(false);
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
          p_current_status: currentStatus
        });

      if (error) throw error;
      
      await fetchHabits();
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const currentSuggestion = AI_SUGGESTIONS[currentSuggestionIndex];

  // Get impact color
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
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

      {/* AI Suggestions Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white shadow-lg">
        {/* Animated background particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-1/2 -right-8 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Sparkles className="w-6 h-6 text-yellow-300" />
              </div>
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  AI Suggestion
                  <span className="px-2 py-0.5 text-xs font-medium bg-white/20 rounded-full backdrop-blur-sm">
                    Beta
                  </span>
                </h2>
                <p className="text-purple-100 text-sm">Personalized eco-friendly habit ideas</p>
              </div>
            </div>
            
            {/* Suggestion indicators */}
            <div className="flex gap-1.5">
              {AI_SUGGESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setCurrentSuggestionIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSuggestionIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to suggestion ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Suggestion Content with fade animation */}
          <div 
            className={`transition-all duration-300 transform ${
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Lightbulb className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold">{currentSuggestion.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getImpactColor(currentSuggestion.impact)}`}>
                    {currentSuggestion.impact} Impact
                  </span>
                </div>
                <p className="text-purple-50 leading-relaxed max-w-2xl">
                  {currentSuggestion.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm text-purple-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Category: {currentSuggestion.category}
                </span>
                <span>•</span>
                <span>Updates every 8s</span>
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-medium text-sm shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add This Habit
              </button>
            </div>
          </div>
        </div>
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
                    onClick={() => toggleHabit(habit.id, habit.completed)}
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