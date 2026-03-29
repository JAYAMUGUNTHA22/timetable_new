import RequireRole from '@/components/RequireRole';
import Faculty from '@/components/pages/Faculty';

export default function FacultyPage() {
  return (
    <RequireRole role="admin">
      <Faculty />
    </RequireRole>
  );
}
