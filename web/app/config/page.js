import RequireRole from '@/components/RequireRole';
import AcademicConfig from '@/components/pages/AcademicConfig';

export default function ConfigPage() {
  return (
    <RequireRole role="admin">
      <AcademicConfig />
    </RequireRole>
  );
}
