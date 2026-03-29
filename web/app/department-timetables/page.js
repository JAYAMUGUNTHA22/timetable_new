import RequireRole from '@/components/RequireRole';
import DepartmentTimetables from '@/components/pages/DepartmentTimetables';

export default function DepartmentTimetablesPage() {
  return (
    <RequireRole role="faculty">
      <DepartmentTimetables />
    </RequireRole>
  );
}
