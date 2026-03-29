import RequireRole from '@/components/RequireRole';
import Timetables from '@/components/pages/Timetables';

export default function TimetablesPage() {
  return (
    <RequireRole role="admin">
      <Timetables />
    </RequireRole>
  );
}
