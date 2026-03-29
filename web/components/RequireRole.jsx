'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || (role && user.role !== role)) {
      router.replace('/');
    }
  }, [user, loading, role, router]);

  if (loading) return null;
  if (!user || (role && user.role !== role)) return null;
  return children;
}
