import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, Award, Edit2, Check, X, Flame, Target, TrendingUp } from 'lucide-react';
import { useStats } from '../hooks/useStats';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Use shared stats hook
  const { stats, loading: statsLoading } = useStats(user?.id);

  // Update fullName when profile changes
  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage('');

    try {
      const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          avatar_initials: initials 
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setIsEditing(false);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setIsEditing(false);
    setMessage('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2 text-sm lg:text-base">Manage your account information</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Avatar & Name Section */}
        <div className="p-6 lg:p-8 bg-gradient-to-br from-green-50 to-blue-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 lg:gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl lg:text-3xl font-bold shadow-lg flex-shrink-0">
              {profile?.avatar_initials || user?.email?.[0].toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 text-center sm:text-left w-full">
              {isEditing ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 text-left">
                    Full Name
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your full name"
                    />
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'No name set'}
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm lg:text-base">{user?.email}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-3 inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 lg:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
          {/* Email */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-gray-900 font-medium mt-1 text-sm lg:text-base truncate">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-gray-900 font-medium mt-1 text-sm lg:text-base">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide">Sustainability Score</p>
              <p className="text-2xl lg:text-3xl font-bold text-green-600 mt-1">
                {profile?.sustainability_score || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Keep completing habits to increase!</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-500 uppercase tracking-wide">User ID</p>
              <p className="text-gray-900 font-medium mt-1 text-xs font-mono">
                {user?.id?.slice(0, 8)}...{user?.id?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Using shared stats */}
      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
            <Target className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
          </div>
          <p className="text-xl lg:text-4xl font-bold text-green-600">
            {statsLoading ? '...' : stats.totalCompleted}
          </p>
          <p className="text-xs lg:text-base text-gray-500 mt-1 lg:mt-2">Completed</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
            <Flame className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600" />
          </div>
          <p className="text-xl lg:text-4xl font-bold text-orange-600">
            {statsLoading ? '...' : stats.currentStreak}
          </p>
          <p className="text-xs lg:text-base text-gray-500 mt-1 lg:mt-2">Day Streak</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 text-center hover:shadow-md transition-shadow">
          <div className="w-8 h-8 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
            <TrendingUp className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
          </div>
          <p className="text-xl lg:text-4xl font-bold text-purple-600">
            {statsLoading ? '...' : `${stats.completionRate}%`}
          </p>
          <p className="text-xs lg:text-base text-gray-500 mt-1 lg:mt-2">Completion Rate</p>
        </div>
      </div>
    </div>
  );
}