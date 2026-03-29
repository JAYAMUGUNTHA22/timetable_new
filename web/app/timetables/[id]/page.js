import RequireRole from '@/components/RequireRole';
import TimetableView from '@/components/pages/TimetableView';

export default function TimetableViewPage() {
  return (
    <RequireRole role="admin">
      <TimetableView />
    </RequireRole>
  );
}
