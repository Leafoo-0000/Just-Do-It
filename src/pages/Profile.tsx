import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Calendar, Award, Edit2, Check, X } from 'lucide-react';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
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
        <div className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-b border-gray-200">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-green-600 text-white rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">
              {profile?.avatar_initials || user?.email?.[0].toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your full name"
                    />
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
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile?.full_name || 'No name set'}
                  </h2>
                  <p className="text-gray-500 mt-1">{user?.email}</p>
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
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-gray-900 font-medium mt-1">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
              <p className="text-gray-900 font-medium mt-1">
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
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Sustainability Score</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {profile?.sustainability_score || 0}
              </p>
              <p className="text-xs text-gray-400 mt-1">Keep completing habits to increase!</p>
            </div>
          </div>

          {/* User ID */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">User ID</p>
              <p className="text-gray-900 font-medium mt-1 text-xs font-mono">
                {user?.id?.slice(0, 8)}...{user?.id?.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-green-600">0</p>
          <p className="text-gray-500 mt-2">Habits Completed</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-blue-600">0</p>
          <p className="text-gray-500 mt-2">Day Streak</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-4xl font-bold text-purple-600">0%</p>
          <p className="text-gray-500 mt-2">Completion Rate</p>
        </div>
      </div>
    </div>
  );
}