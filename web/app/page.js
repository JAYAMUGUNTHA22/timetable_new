'use client';

import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/pages/Login';
import Dashboard from '@/components/pages/Dashboard';
import FacultyDashboard from '@/components/pages/FacultyDashboard';
import StudentDashboard from '@/components/pages/StudentDashboard';

function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading">Loading...</div>;
  if (!user) return <Login />;
  if (user.role === 'admin') return <Dashboard />;
  if (user.role === 'faculty') return <FacultyDashboard />;
  if (user.role === 'student') return <StudentDashboard />;
  return <Dashboard />;
}

export default function Page() {
  return <HomeRouter />;
}
