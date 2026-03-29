import RequireRole from '@/components/RequireRole';
import FacultyDashboard from '@/components/pages/FacultyDashboard';

export default function FacultyDashboardPage() {
  return (
    <RequireRole role="faculty">
      <FacultyDashboard />
    </RequireRole>
  );
}
