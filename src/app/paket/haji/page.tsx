
"use client";

import PackageDetailView from '@/components/templates/package-detail-view';
import { useTenantResolver } from '@/hooks/useTenantResolver';

export default function PackageHajiPage() {
  const { loading, agent } = useTenantResolver('default');

  if (loading || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return <PackageDetailView packageId="haji" agent={agent} />;
}
