"use client";

import { use } from 'react';
import ContactTemplate from '@/components/templates/contact-template';
import { useTenantResolver } from '@/hooks/useTenantResolver';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function TenantContactPage({ params }: PageProps) {
  const { tenant: tenantSlug } = use(params);
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

  return <ContactTemplate agent={agent} />;
}
