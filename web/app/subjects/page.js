import RequireRole from '@/components/RequireRole';
import Subjects from '@/components/pages/Subjects';

export default function SubjectsPage() {
  return (
    <RequireRole role="admin">
      <Subjects />
    </RequireRole>
  );
}
