import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
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

        // Auto-increment visitor counter once per browser session per subdomain
        if (foundTenant && (foundTenant.tenantId || foundTenant.subdomain)) {
          const sessionKey = `visited_tenant_${foundTenant.subdomain}`;
          if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'true');
            const newCount = (foundTenant.visitorCount || 0) + 1;
            foundTenant.visitorCount = newCount;
            
            try {
              // Try updating by primary doc ID or query by subdomain
              const targetDocId = foundTenant.tenantId || foundTenant.subdomain;
              await updateDoc(doc(db, 'tenants', targetDocId), {
                visitorCount: increment(1)
              });
            } catch (vErr) {
              // Fallback query update if primary doc ID update fails
              try {
                const qSub = query(collection(db, 'tenants'), where('subdomain', '==', foundTenant.subdomain));
                const snapSub = await getDocs(qSub);
                if (!snapSub.empty) {
                  await updateDoc(doc(db, 'tenants', snapSub.docs[0].id), {
                    visitorCount: increment(1)
                  });
                }
              } catch (e) {}
            }
          }
        }
        
        const isDefaultTenant = tenantSlug.toLowerCase() === 'default';
        
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
          
          // First pass: collect all values — prefer from contact section if found
          const allValues: Record<string, string> = {};
          const contactValues: Record<string, string> = {};
          
          contentSnap.docs.forEach(docSnap => {
            const c = docSnap.data();
            const isContactSection = c.sectionId && (
              c.sectionId.includes('contact') || c.sectionId.endsWith('_contact')
            );
            
            if (c.key === 'phone' && c.value) { allValues.phone = c.value; if (isContactSection) contactValues.phone = c.value; }
            if (c.key === 'whatsapp' && c.value) { allValues.whatsapp = c.value; if (isContactSection) contactValues.whatsapp = c.value; }
            if (c.key === 'address' && c.value) { allValues.address = c.value; if (isContactSection) contactValues.address = c.value; }
            if (c.key === 'mapUrl' && c.value) { allValues.mapUrl = c.value; if (isContactSection) contactValues.mapUrl = c.value; }
            if (c.key === 'pdfUrl' && c.value) { allValues.pdfUrl = c.value; if (isContactSection) contactValues.pdfUrl = c.value; }
            if (c.key === 'email' && c.value) { allValues.email = c.value; if (isContactSection) contactValues.email = c.value; }
          });
          
          // Prefer contact section values, fall back to any section values
          phone = contactValues.phone || contactValues.whatsapp || allValues.phone || allValues.whatsapp || '';
          address = contactValues.address || allValues.address || '';
          mapEmbedUrl = contactValues.mapUrl || allValues.mapUrl || '';
          pdfUrl = allValues.pdfUrl || '';
          email = contactValues.email || allValues.email || '';
        } catch (err) {
          console.error('Failed to fetch tenant contents:', err);
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
          pdfUrl: pdfUrl || '',
          visitorCount: foundTenant.visitorCount || 0
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [tenantSlug]);

  // Realtime subscription to tenant visitorCount changes
  useEffect(() => {
    if (!tenant?.tenantId) return;

    const unsub = onSnapshot(doc(db, 'tenants', tenant.tenantId), (snap) => {
      if (snap.exists()) {
        const liveData = snap.data() as Tenant;
        const liveCount = liveData.visitorCount || 0;
        
        setTenant(prev => prev ? { ...prev, visitorCount: liveCount } : prev);
        setAgent(prev => prev ? { ...prev, visitorCount: liveCount } : prev);
      }
    }, (err) => {});

    return () => unsub();
  }, [tenant?.tenantId]);

  return { loading, tenant, agent, error };
}
