import RequireRole from '@/components/RequireRole';
import StudentHolidays from '@/components/pages/StudentHolidays';

export default function StudentHolidaysPage() {
  return (
    <RequireRole role="student">
      <StudentHolidays />
    </RequireRole>
  );
}
