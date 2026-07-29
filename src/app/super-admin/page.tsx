"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/supa');
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-4 text-sm text-muted-foreground animate-pulse">Mengalihkan ke Portal Super Admin (/supa)...</p>
    </div>
  );
}
