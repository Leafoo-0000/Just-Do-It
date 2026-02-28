import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Dashboard from './pages/Dashboard';
import MyHabits from './pages/MyHabits';
import Login from './pages/Login';
import Signup from './pages/Signup';

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to="/dashboard" /> : <Signup />} 
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-habits"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MyHabits />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <div className="text-center text-gray-500 mt-20">Progress page coming soon...</div>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <div className="text-center text-gray-500 mt-20">Profile page coming soon...</div>
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return <AppContent />;
}