"use client";

import React, { use, useState, useEffect } from 'react';
import { db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { LandingPage } from '@/types/cms';

import { loadGoogleFont } from '@/lib/fonts';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}

export default function TenantLayout({ children, params }: LayoutProps) {
  const { tenant: tenantSlug } = use(params);
  const [theme, setTheme] = useState<{ 
    primaryColor: string; 
    secondaryColor: string;
    borderRadius?: string;
    fontFamily?: string;
  } | null>(null);

  useEffect(() => {
    async function loadTheme() {
      if (!tenantSlug) return;
      try {
        // 1. Resolve tenant details from primary DB first
        const tenantsRef = collection(db, 'tenants');
        const qSub = query(tenantsRef, where('subdomain', '==', tenantSlug.toLowerCase()));
        const subSnap = await getDocs(qSub);

        let tenantData = subSnap.empty ? null : subSnap.docs[0].data();
        let tenantIdResolved = tenantData ? (tenantData.tenantId || tenantData.uid) : tenantSlug.toLowerCase();
        
        if (!tenantData) {
          try {
            const docRef = doc(db, 'tenants', tenantSlug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              tenantData = docSnap.data();
              tenantIdResolved = tenantData.tenantId || tenantData.uid || tenantSlug;
            }
          } catch (dErr) {}
        }

        // 2. Resolve database instance (default or cluster)
        let activeDb = db;
        if (tenantData && tenantData.dbServerId && tenantData.dbServerId !== 'default') {
          try {
            const dbServersSnap = await getDocs(collection(db, 'databaseServers'));
            const servers = dbServersSnap.docs.map(d => d.data() as any);
            const serverConfig = servers.find(s => s.serverId === tenantData.dbServerId);
            if (serverConfig) {
              activeDb = getDynamicFirebaseInstance(serverConfig).db;
            }
          } catch (dbErr) {
            console.error('Failed to resolve active db in layout:', dbErr);
          }
        }

        // 3. Fetch theme from resolved DB landingPage config
        const pagesRef = collection(activeDb, 'landingPages');
        const qPage = query(pagesRef, where('tenantId', '==', tenantIdResolved));
        const pageSnap = await getDocs(qPage);
        
        if (!pageSnap.empty) {
          const pageData = pageSnap.docs[0].data() as LandingPage;
          if (pageData.theme) {
            setTheme({
              primaryColor: pageData.theme.primaryColor || '#0A1E3B',
              secondaryColor: pageData.theme.secondaryColor || '#D4AF37',
              borderRadius: pageData.theme.borderRadius || 'lg',
              fontFamily: pageData.theme.fontFamily || 'PT Sans',
            });
            return;
          }
        }

        // Fallback: try querying by slug
        const qPageSlug = query(pagesRef, where('tenantId', '==', tenantSlug.toLowerCase()));
        const pageSnapSlug = await getDocs(qPageSlug);
        if (!pageSnapSlug.empty) {
          const pageData = pageSnapSlug.docs[0].data() as LandingPage;
          if (pageData.theme) {
            setTheme({
              primaryColor: pageData.theme.primaryColor || '#0A1E3B',
              secondaryColor: pageData.theme.secondaryColor || '#D4AF37',
              borderRadius: pageData.theme.borderRadius || 'lg',
              fontFamily: pageData.theme.fontFamily || 'PT Sans',
            });
          }
        }
      } catch (err) {
        console.error('Failed to load layout theme:', err);
      }
    }
    loadTheme();
  }, [tenantSlug]);

  const primary = theme?.primaryColor || '#0A1E3B';
  const secondary = theme?.secondaryColor || '#D4AF37';
  const radius = theme?.borderRadius || 'lg';
  const font = theme?.fontFamily || 'PT Sans';

  useEffect(() => {
    if (font) {
      loadGoogleFont(font);
    }
  }, [font]);

  const borderRadiusValue = radius === 'none' ? '0px' :
                            radius === 'sm' ? '0.25rem' :
                            radius === 'md' ? '0.5rem' :
                            radius === 'lg' ? '1rem' :
                            radius === 'xl' ? '1.5rem' :
                            radius === 'full' ? '9999px' : '1rem';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --primary-color: ${primary};
          --secondary-color: ${secondary};
          --border-radius-theme: ${borderRadiusValue};
        }
        
        body, p, button, input, textarea, select, h1, h2, h3, h4, h5, h6, .font-headline, .font-sans, span {
          font-family: '${font}', sans-serif !important;
        }
        
        .bg-primary {
          background-color: var(--primary-color) !important;
        }
        .text-primary {
          color: var(--primary-color) !important;
        }
        .border-primary {
          border-color: var(--primary-color) !important;
        }
        .bg-accent {
          background-color: var(--secondary-color) !important;
        }
        .text-accent {
          color: var(--secondary-color) !important;
        }
        .border-accent {
          border-color: var(--secondary-color) !important;
        }
        
        /* Apply dynamic border radius */
        .rounded-3xl, .rounded-\\[2\\.5rem\\], .rounded-2xl, .rounded-xl {
          border-radius: var(--border-radius-theme) !important;
        }
        
        /* Class utilities adjustments */
        .border-primary\\/20 {
          border-color: rgba(${hexToRgb(primary)}, 0.2) !important;
        }
        .bg-primary\\/10 {
          background-color: rgba(${hexToRgb(primary)}, 0.1) !important;
        }
        .bg-accent\\/10 {
          background-color: rgba(${hexToRgb(secondary)}, 0.1) !important;
        }
        .border-accent\\/20 {
          border-color: rgba(${hexToRgb(secondary)}, 0.2) !important;
        }
      `}} />
      {children}
    </>
  );
}

function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 10;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 30;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 59;
  return `${r}, ${g}, ${b}`;
}
