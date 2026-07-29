"use client";

import React, { useEffect, useState } from 'react';
import { getAgent, Agent } from '@/lib/agents';
import HomeTemplate from '@/components/templates/home-template';
import DynamicHomeTemplate from '@/components/templates/dynamic-home-template';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Tenant, LandingPage, Section, Content } from '@/types/cms';

export default function Home() {
  const defaultAgent = getAgent('default');

  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState<Tenant | null>(null);
  const [pageData, setPageData] = useState<LandingPage | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [contents, setContents] = useState<Record<string, Record<string, any>>>({});
  const [useDynamic, setUseDynamic] = useState(false);

  useEffect(() => {
    async function loadPublicHomePage() {
      try {
        setLoading(true);

        // 1. Try to find main tenant in Firestore (by subdomain 'triyadi' or 'default')
        let foundTenant: Tenant | null = null;
        let mainTenantId = 'default';

        try {
          const tenantsRef = collection(db, 'tenants');
          const qSub = query(tenantsRef, where('subdomain', 'in', ['default', 'triyadi', 'main']));
          const subSnap = await getDocs(qSub);
          
          if (!subSnap.empty) {
            foundTenant = subSnap.docs[0].data() as Tenant;
            mainTenantId = foundTenant.tenantId;
          } else {
            const snapDoc = await getDoc(doc(db, 'tenants', 'default'));
            if (snapDoc.exists()) {
              foundTenant = snapDoc.data() as Tenant;
              mainTenantId = foundTenant.tenantId;
            }
          }
        } catch (tErr) {}

        if (foundTenant && mainTenantId) {
          // 2. Try to fetch home landing page
          let pageSnap: any = { empty: true };
          try {
            const pagesRef = collection(db, 'landingPages');
            const qPage = query(
              pagesRef,
              where('tenantId', '==', mainTenantId),
              where('slug', '==', 'home')
            );
            pageSnap = await getDocs(qPage);
          } catch (pErr) {}

          if (!pageSnap.empty) {
            const foundPage = pageSnap.docs[0].data() as LandingPage;
            
            // 3. Fetch sections
            let sectionsList: Section[] = [];
            try {
              const sectionsRef = collection(db, 'sections');
              const qSec = query(sectionsRef, where('landingPageId', '==', foundPage.pageId));
              const secSnap = await getDocs(qSec);
              sectionsList = secSnap.docs.map(d => d.data() as Section).sort((a, b) => a.order - b.order);
            } catch (sErr) {}

            // 4. Fetch contents
            const contentsMap: Record<string, Record<string, any>> = {};
            if (sectionsList.length > 0) {
              try {
                const contentsRef = collection(db, 'contents');
                const qContent = query(contentsRef, where('tenantId', '==', mainTenantId));
                const contentSnap = await getDocs(qContent);
                contentSnap.docs.forEach(d => {
                  const c = d.data() as Content;
                  if (!contentsMap[c.sectionId]) contentsMap[c.sectionId] = {};
                  contentsMap[c.sectionId][c.key] = c.value;
                });
              } catch (cErr) {}
            }

            setTenantData(foundTenant);
            setPageData(foundPage);
            setSections(sectionsList);
            setContents(contentsMap);
            setUseDynamic(true);
          }
        }
      } catch (err) {
        setUseDynamic(false);
      } finally {
        setLoading(false);
      }
    }

    loadPublicHomePage();
  }, []);

  if (useDynamic && tenantData && pageData) {
    return (
      <DynamicHomeTemplate 
        tenant={tenantData} 
        page={pageData} 
        sections={sections} 
        contents={contents} 
      />
    );
  }

  return <HomeTemplate agent={defaultAgent} />;
}
