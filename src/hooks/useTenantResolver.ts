import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAgent, Agent } from '@/lib/agents';
import { Tenant, SYSTEM_PLANS } from '@/types/cms';

export function useTenantResolver(tenantSlug: string) {
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTenant() {
      if (!tenantSlug) return;
      
      try {
        setLoading(true);
        let foundTenant: Tenant | null = null;
        let activeTenantId = tenantSlug.toLowerCase();

        const tenantsRef = collection(db, 'tenants');
        const qSubdomain = query(tenantsRef, where('subdomain', '==', tenantSlug.toLowerCase()));
        const subSnap = await getDocs(qSubdomain);
        
        if (!subSnap.empty) {
          foundTenant = subSnap.docs[0].data() as Tenant;
        } else {
          const tenantDocRef = doc(db, 'tenants', tenantSlug);
          const tenantSnap = await getDoc(tenantDocRef);
          if (tenantSnap.exists()) {
            foundTenant = tenantSnap.data() as Tenant;
          }
        }

        if (foundTenant && foundTenant.status === 'suspended') {
          setLoading(false);
          setError('suspended');
          return;
        }

        if (!foundTenant) {
          const agentStatic = getAgent(tenantSlug);
          if (agentStatic && agentStatic.slug.toLowerCase() === tenantSlug.toLowerCase()) {
            foundTenant = {
              tenantId: activeTenantId,
              name: agentStatic.name,
              company: agentStatic.displayName,
              email: agentStatic.email,
              subdomain: tenantSlug.toLowerCase(),
              status: 'active',
              plan: 'pro',
              limits: SYSTEM_PLANS.pro.limits,
              createdAt: new Date().toISOString(),
            };
          } else {
            setLoading(false);
            setError('not-found');
            return;
          }
        }

        setTenant(foundTenant);
        activeTenantId = foundTenant.tenantId;
        
        const isDefaultTenant = tenantSlug.toLowerCase() === 'default' || tenantSlug.toLowerCase() === 'triyadi';
        
        // Try to fetch custom contact information from contents collection
        let phone = '';
        let address = '';
        let mapEmbedUrl = '';
        let pdfUrl = '';
        let email = '';

        try {
          const contentsRef = collection(db, 'contents');
          const qContent = query(contentsRef, where('tenantId', '==', activeTenantId));
          const contentSnap = await getDocs(qContent);
          
          contentSnap.docs.forEach(docSnap => {
            const c = docSnap.data();
            if (c.key === 'phone' && c.value) phone = c.value;
            if (c.key === 'whatsapp' && c.value && !phone) phone = c.value;
            if (c.key === 'address' && c.value) address = c.value;
            if (c.key === 'mapUrl' && c.value) mapEmbedUrl = c.value;
            if (c.key === 'pdfUrl' && c.value) pdfUrl = c.value;
            if (c.key === 'email' && c.value) email = c.value;
          });
        } catch (err) {
          console.error('Failed to fetch tenant contents:', err);
        }

        // Clean phone fallback if it is Triyadi's phone and we are not the default tenant
        if (!isDefaultTenant && (phone === '6283815862300' || phone === '083815862300')) {
          phone = '';
        }

        let displayAddress = address;
        if (!displayAddress) {
          displayAddress = isDefaultTenant 
            ? 'Jl. Malaka Merah No.7/6, Duren Sawit, Jakarta Timur'
            : (foundTenant.company || 'Kantor Cabang Mitra');
        }
        
        // Build Agent object for templates
        setAgent({
          slug: foundTenant.subdomain || 'default',
          tenantId: foundTenant.tenantId,
          name: foundTenant.name,
          displayName: foundTenant.company || foundTenant.name,
          email: email || foundTenant.email,
          phone: phone || '',
          whatsapp: (phone || '').replace(/[^0-9]/g, ''), 
          address: displayAddress,
          photoUrl: '/images/pp1.jpg',
          mapEmbedUrl: mapEmbedUrl || '',
          pdfUrl: pdfUrl || ''
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [tenantSlug]);

  return { loading, tenant, agent, error };
}
