"use client";

import { use } from 'react';
import KemitraanTemplate from '@/components/templates/kemitraan-template';
import { useTenantResolver } from '@/hooks/useTenantResolver';
import LoadingScreen from '@/components/ui/loading-screen';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantKemitraanPage({ params }: PageProps) {
  const { tenant: tenantSlug } = use(params);
  const { loading, agent } = useTenantResolver(tenantSlug);

  if (loading) {
    return <LoadingScreen message="Memuat halaman kemitraan..." />;
  }

  return <KemitraanTemplate agent={agent || undefined} />;
}
