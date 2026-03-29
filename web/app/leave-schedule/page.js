import RequireRole from '@/components/RequireRole';
import LeaveSchedule from '@/components/pages/LeaveSchedule';

export default function LeaveSchedulePage() {
  return (
    <RequireRole role="faculty">
      <LeaveSchedule />
    </RequireRole>
  );
}
