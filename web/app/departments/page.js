import RequireRole from '@/components/RequireRole';
import Departments from '@/components/pages/Departments';

export default function DepartmentsPage() {
  return (
    <RequireRole role="admin">
      <Departments />
    </RequireRole>
  );
}
