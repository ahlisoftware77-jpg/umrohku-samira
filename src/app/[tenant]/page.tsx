"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAgent, Agent } from '@/lib/agents';
import HomeTemplate from '@/components/templates/home-template';
import DynamicHomeTemplate from '@/components/templates/dynamic-home-template';
import { Tenant, LandingPage, Section, Content, SectionType, SYSTEM_PLANS } from '@/types/cms';
import LoadingScreen from '@/components/ui/loading-screen';

interface PageProps {
  params: Promise<{ tenant: string }>;
}

export default function DynamicTenantPage({ params }: PageProps) {
  const { tenant: tenantSlug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [pageData, setPageData] = useState<LandingPage | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [contents, setContents] = useState<Record<string, Record<string, any>>>({});
  
  // Fallback to static agents if not found in Firestore
  const [useStaticFallback, setUseStaticFallback] = useState(false);
  const [staticAgent, setStaticAgent] = useState<Agent | null>(null);

  useEffect(() => {
    async function loadTenant() {
      try {
        setLoading(true);
        
        // 1. Resolve possible tenant IDs (subdomain, tenantId, etc.)
        const possibleTenantIds = Array.from(new Set([
          tenantSlug.toLowerCase(),
          tenantSlug
        ])).filter(Boolean);

        let foundTenant: Tenant | null = null;
        let activeTenantId = tenantSlug.toLowerCase();

        try {
          const tenantsRef = collection(db, 'tenants');
          const qSubdomain = query(tenantsRef, where('subdomain', '==', tenantSlug.toLowerCase()));
          const subSnap = await getDocs(qSubdomain);
          
          if (!subSnap.empty) {
            const data = subSnap.docs[0].data() as Tenant;
            foundTenant = { ...data, firestoreDocId: subSnap.docs[0].id };
            if (data.tenantId) possibleTenantIds.push(data.tenantId);
            if (data.readableId) possibleTenantIds.push(data.readableId);
            if (data.email) {
              const emailId = data.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
              possibleTenantIds.push(emailId);
            }
            activeTenantId = data.tenantId || activeTenantId;
          } else {
            const tenantDocRef = doc(db, 'tenants', tenantSlug);
            const tenantSnap = await getDoc(tenantDocRef);
            if (tenantSnap.exists()) {
              const data = tenantSnap.data() as Tenant;
              foundTenant = { ...data, firestoreDocId: tenantSnap.id };
              if (data.tenantId) possibleTenantIds.push(data.tenantId);
              if (data.readableId) possibleTenantIds.push(data.readableId);
              if (data.email) {
                const emailId = data.email.toLowerCase().replace(/[^a-z0-9]/g, '_');
                possibleTenantIds.push(emailId);
              }
              activeTenantId = data.tenantId || activeTenantId;
            }
          }
        } catch (tErr) {}

        if (foundTenant && foundTenant.status === 'suspended') {
          setLoading(false);
          return;
        }

        // Fallback default tenant object if not found in tenants collection
        if (!foundTenant) {
          const agentStatic = getAgent(tenantSlug);
          
          // Ensure we don't accidentally use the 'default' fallback agent for missing routes
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
              visitorCount: 0,
              createdAt: new Date().toISOString(),
            };
          } else {
            // Strictly enforce 404 for missing non-static tenants
            setLoading(false);
            return;
          }
        }

        const validTenant: Tenant = foundTenant;
        setTenantData(validTenant);

        // Auto-increment visitor counter once per browser session
        try {
          const sessionKey = `visited_tenant_${validTenant.subdomain}`;
          if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, 'true');
            
            const docIdToUpdate = (validTenant as any).firestoreDocId || validTenant.tenantId || validTenant.subdomain;
            updateDoc(doc(db, 'tenants', docIdToUpdate), {
              visitorCount: increment(1)
            }).catch(async () => {
              try {
                const qSub = query(collection(db, 'tenants'), where('subdomain', '==', validTenant.subdomain));
                const snapSub = await getDocs(qSub);
                if (!snapSub.empty) {
                  await updateDoc(doc(db, 'tenants', snapSub.docs[0].id), {
                    visitorCount: increment(1)
                  });
                }
              } catch (e) {}
            });
          }
        } catch (vErr) {}

        // 2. Fetch landingPage document for ANY of possibleTenantIds
        let foundPage: LandingPage | null = null;
        try {
          const pagesRef = collection(db, 'landingPages');
          for (const tid of possibleTenantIds) {
            const qPage = query(pagesRef, where('tenantId', '==', tid));
            const pageSnap = await getDocs(qPage);
            if (!pageSnap.empty) {
              foundPage = pageSnap.docs[0].data() as LandingPage;
              break;
            }
          }
        } catch (pErr) {}

        // If landingPage is not found in Firestore yet, create default landingPage object for this tenant
        if (!foundPage) {
          foundPage = {
            pageId: `${activeTenantId}_home`,
            tenantId: activeTenantId,
            title: validTenant.name,
            slug: 'home',
            status: 'published',
            seo: { title: validTenant.name, description: 'Biro Perjalanan Umrah & Haji', keywords: [] },
            theme: { primaryColor: '#0A1E3B', secondaryColor: '#D4AF37', fontFamily: 'PT Sans', borderRadius: 'lg', shadow: 'lg', spacing: 'normal', containerWidth: 'xl', darkMode: false },
            globalSettings: { whatsappNumber: '083815862300', emailContact: validTenant.email, socialLinks: {} },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        const validPage: LandingPage = foundPage;
        setPageData(validPage);

        // 3. Fetch sections for pageId or tenantId
        let sectionsList: Section[] = [];
        try {
          const sectionsRef = collection(db, 'sections');
          const qSec = query(sectionsRef, where('landingPageId', '==', validPage.pageId));
          const secSnap = await getDocs(qSec);
          if (!secSnap.empty) {
            sectionsList = secSnap.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
          } else {
            // Fallback query by tenantId
            for (const tid of possibleTenantIds) {
              const qSecT = query(sectionsRef, where('tenantId', '==', tid));
              const secSnapT = await getDocs(qSecT);
              if (!secSnapT.empty) {
                sectionsList = secSnapT.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
                break;
              }
            }
          }
        } catch (sErr) {}

        // Auto-Onboard All Core Sections if missing
        const CORE_TYPES: SectionType[] = [
          'hero',
          'about',
          'why_umrah',
          'finance',
          'why_samira',
          'pricing',
          'portfolio',
          'hotel_explanation',
          'faq',
          'flow',
          'muri',
          'gallery',
          'testimonial',
          'cta',
          'social_media',
          'contact'
        ];
        const existingTypes = new Set(sectionsList.map(s => s.type));

        CORE_TYPES.forEach((type) => {
          if (!existingTypes.has(type)) {
            const secId = `sec_${activeTenantId}_${type}`;
            const defaultIdx = CORE_TYPES.indexOf(type);
            sectionsList.push({
              sectionId: secId,
              tenantId: activeTenantId,
              landingPageId: validPage.pageId,
              type,
              order: defaultIdx,
              isHidden: false,
            });
          }
        });
        sectionsList.sort((a, b) => a.order - b.order);
        setSections(sectionsList);

        // 4. Fetch contents for ALL possibleTenantIds
        try {
          const contentsRef = collection(db, 'contents');
          const contentsMap: Record<string, Record<string, any>> = {};

          for (const tid of possibleTenantIds) {
            const qContent = query(contentsRef, where('tenantId', '==', tid));
            const cSnap = await getDocs(qContent);
            if (!cSnap.empty) {
              cSnap.docs.forEach(docSnap => {
                const c = docSnap.data() as Content;
                if (!contentsMap[c.sectionId]) contentsMap[c.sectionId] = {};
                contentsMap[c.sectionId][c.key] = c.value;
              });
            }
          }
          setContents(contentsMap);
        } catch (cErr) {}
      } catch (error) {
        console.error('Error loading tenant published data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTenant();
  }, [tenantSlug]);

  if (loading) {
    return <LoadingScreen message="Memuat halaman..." />;
  }

  if (useStaticFallback && staticAgent) {
    return <HomeTemplate agent={staticAgent} />;
  }

  if (tenantData && pageData) {
    return (
      <DynamicHomeTemplate 
        tenant={tenantData} 
        page={pageData} 
        sections={sections} 
        contents={contents} 
      />
    );
  }

  // Not found or suspended UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-headline font-bold text-primary mb-4">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">
          Maaf, halaman mitra travel yang Anda cari tidak terdaftar atau sedang tidak aktif saat ini.
        </p>
        <button 
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-all"
        >
          Kembali ke Beranda Utama
        </button>
      </div>
    </div>
  );
}
