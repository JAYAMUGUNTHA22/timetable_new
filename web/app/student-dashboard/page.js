import RequireRole from '@/components/RequireRole';
import StudentDashboard from '@/components/pages/StudentDashboard';

export default function StudentDashboardPage() {
  return (
    <RequireRole role="student">
      <StudentDashboard />
    </RequireRole>
  );
}
