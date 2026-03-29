import RequireRole from '@/components/RequireRole';
import FacultySchedule from '@/components/pages/FacultySchedule';

export default function FacultySchedulePage() {
  return (
    <RequireRole role="faculty">
      <FacultySchedule />
    </RequireRole>
  );
}
