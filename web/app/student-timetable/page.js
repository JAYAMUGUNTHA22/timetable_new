import RequireRole from '@/components/RequireRole';
import StudentTimetable from '@/components/pages/StudentTimetable';

export default function StudentTimetablePage() {
  return (
    <RequireRole role="student">
      <StudentTimetable />
    </RequireRole>
  );
}
