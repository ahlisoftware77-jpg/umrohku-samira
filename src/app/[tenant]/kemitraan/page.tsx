"use client";

import { use } from 'react';
import KemitraanTemplate from '@/components/templates/kemitraan-template';
import { useTenantResolver } from '@/hooks/useTenantResolver';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantKemitraanPage({ params }: PageProps) {
  const { tenant: tenantSlug } = use(params);
  const { loading, agent } = useTenantResolver(tenantSlug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return <KemitraanTemplate agent={agent || undefined} />;
}
