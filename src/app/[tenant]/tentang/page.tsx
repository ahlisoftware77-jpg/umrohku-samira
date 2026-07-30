"use client";

import { use } from 'react';
import AboutTemplate from '@/components/templates/about-template';
import { useTenantResolver } from '@/hooks/useTenantResolver';
import LoadingScreen from '@/components/ui/loading-screen';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantAboutPage({ params }: PageProps) {
  const { tenant: tenantSlug } = use(params);
  const { loading, agent, error } = useTenantResolver(tenantSlug);

  if (loading) {
    return <LoadingScreen message="Memuat halaman tentang..." />;
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-lg">Halaman Tidak Ditemukan</p>
      </div>
    );
  }

  return <AboutTemplate agent={agent} />;
}
