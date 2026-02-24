import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import MyHabits from '@/pages/MyHabits';

// Placeholder components for future routes
const Progress = () => (
  <div className="flex min-h-screen bg-gray-50 ml-64 p-8">
    <div className="bg-white border border-gray-300 p-8 w-full">
      <h2 className="text-2xl font-bold text-gray-900">Progress</h2>
      <p className="text-gray-600 mt-4">Analytics coming soon...</p>
    </div>
  </div>
);

const Profile = () => (
  <div className="flex min-h-screen bg-gray-50 ml-64 p-8">
    <div className="bg-white border border-gray-300 p-8 w-full">
      <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      <p className="text-gray-600 mt-4">Profile settings coming soon...</p>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/my-habits" element={<MyHabits />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;