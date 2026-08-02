"use client";

import { use } from 'react';
import PackageDetailView from '@/components/templates/package-detail-view';
import { useTenantResolver } from '@/hooks/useTenantResolver';

interface PageProps {
  params: Promise<{ tenant: string; type: string }>;
}

export default function TenantPackagePage({ params }: PageProps) {
  const { tenant: tenantSlug, type } = use(params);
  const { loading, agent, error } = useTenantResolver(tenantSlug);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div></div>;
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col">
        <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
        <p className="text-lg">Halaman Tidak Ditemukan</p>
      </div>
    );
  }

  // Define packages based on route type
  const packageType = type.toLowerCase();
  
  if (packageType === 'reguler' || packageType === 'pkg1') {
    return <PackageDetailView agent={agent} packageId="reguler" />;
  }
  
  if (packageType === 'plus' || packageType === 'pkg2') {
    return <PackageDetailView agent={agent} packageId="plus" />;
  }
  
  if (packageType === 'ramadan' || packageType === 'pkg3') {
    return <PackageDetailView agent={agent} packageId="ramadan" />;
  }
  
  if (packageType === 'haji' || packageType === 'pkg4') {
    return <PackageDetailView agent={agent} packageId="haji" />;
  }

  // Fallback for any custom packageId
  return <PackageDetailView agent={agent} packageId={type} />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background flex-col">
      <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
      <p className="text-lg">Paket Tidak Ditemukan</p>
    </div>
  );
}
