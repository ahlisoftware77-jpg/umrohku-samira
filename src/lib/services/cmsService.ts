import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LandingPage, Section, Content, PageRevision, SectionType } from '@/types/cms';

export const cmsService = {
  // ==========================================
  // LANDING PAGE OPERATIONS
  // ==========================================
  async getPageBySlug(tenantId: string, slug: string): Promise<LandingPage | null> {
    try {
      const q = query(
        collection(db, 'landingPages'), 
        where('tenantId', '==', tenantId), 
        where('slug', '==', slug)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return snap.docs[0].data() as LandingPage;
    } catch (err) {
      return null;
    }
  },

  async createPage(page: Omit<LandingPage, 'createdAt' | 'updatedAt'>): Promise<LandingPage> {
    const docRef = doc(db, 'landingPages', page.pageId);
    const newPage = {
      ...page,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(docRef, newPage);
    } catch (err) {}
    return newPage as unknown as LandingPage;
  },

  // ==========================================
  // SECTIONS & CONTENTS OPERATIONS
  // ==========================================
  async getSections(landingPageId: string): Promise<Section[]> {
    try {
      const q = query(
        collection(db, 'sections'), 
        where('landingPageId', '==', landingPageId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
    } catch (err) {
      return [];
    }
  },

  async saveSections(sections: Section[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      sections.forEach(sec => {
        const docRef = doc(db, 'sections', sec.sectionId);
        batch.set(docRef, sec);
      });
      await batch.commit();
    } catch (err) {}
  },

  async getContents(tenantId: string, sectionIds: string[]): Promise<Content[]> {
    if (sectionIds.length === 0) return [];
    
    try {
      const chunks = [];
      for (let i = 0; i < sectionIds.length; i += 30) {
        chunks.push(sectionIds.slice(i, i + 30));
      }
      
      let allContents: Content[] = [];
      for (const chunk of chunks) {
        const q = query(
          collection(db, 'contents'),
          where('tenantId', '==', tenantId),
          where('sectionId', 'in', chunk)
        );
        const snap = await getDocs(q);
        allContents = allContents.concat(snap.docs.map(doc => doc.data() as Content));
      }
      return allContents;
    } catch (err) {
      return [];
    }
  },

  async saveContents(contents: Content[]): Promise<void> {
    try {
      const batch = writeBatch(db);
      contents.forEach(content => {
        const docRef = doc(db, 'contents', content.contentId);
        batch.set(docRef, content);
      });
      await batch.commit();
    } catch (err) {}
  },

  // ==========================================
  // REALTIME LISTENER FOR BUILDER CANVAS WITH FAIL-SAFE ERROR HANDLERS
  // ==========================================
  subscribeToLandingPage(
    tenantId: string,
    landingPageId: string,
    onUpdate: (data: { page: LandingPage | null; sections: Section[]; contents: Record<string, Record<string, any>> }) => void
  ) {
    const pageRef = doc(db, 'landingPages', landingPageId);
    
    // Listen for page metadata changes with silent error callback
    return onSnapshot(
      pageRef, 
      async (pageSnap) => {
        if (!pageSnap.exists()) {
          onUpdate({ page: null, sections: [], contents: {} });
          return;
        }
        const pageData = pageSnap.data() as LandingPage;
        
        // Query sections
        const sectionsQuery = query(
          collection(db, 'sections'),
          where('landingPageId', '==', landingPageId)
        );
        
        const unsubscribeSections = onSnapshot(
          sectionsQuery, 
          async (secSnap) => {
            const sectionsList = secSnap.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
            const sectionIds = sectionsList.map(s => s.sectionId);
            
            if (sectionIds.length === 0) {
              onUpdate({ page: pageData, sections: [], contents: {} });
              return;
            }

            // Listen for contents
            const contentsQuery = query(
              collection(db, 'contents'),
              where('tenantId', '==', tenantId)
            );
            
            const unsubscribeContents = onSnapshot(
              contentsQuery, 
              (contentSnap) => {
                const contentsList = contentSnap.docs.map(doc => doc.data() as Content);
                const contentsMap: Record<string, Record<string, any>> = {};
                contentsList.forEach(c => {
                  if (!contentsMap[c.sectionId]) {
                    contentsMap[c.sectionId] = {};
                  }
                  contentsMap[c.sectionId][c.key] = c.value;
                });
                
                onUpdate({
                  page: pageData,
                  sections: sectionsList,
                  contents: contentsMap
                });
              },
              (err) => {
                console.warn('Silent contents snapshot error handler:', err.message);
              }
            );
            
            return unsubscribeContents;
          },
          (err) => {
            console.warn('Silent sections snapshot error handler:', err.message);
          }
        );

        return unsubscribeSections;
      },
      (err) => {
        console.warn('Silent page snapshot error handler:', err.message);
      }
    );
  },

  // ==========================================
  // REVISIONS OPERATIONS
  // ==========================================
  async saveRevision(revision: Omit<PageRevision, 'createdAt'>): Promise<void> {
    try {
      const docRef = doc(db, 'revisions', revision.revisionId);
      await setDoc(docRef, {
        ...revision,
        createdAt: serverTimestamp(),
      });
    } catch (err) {}
  },

  async getRevisions(landingPageId: string): Promise<PageRevision[]> {
    try {
      const q = query(
        collection(db, 'revisions'),
        where('landingPageId', '==', landingPageId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => doc.data() as PageRevision);
    } catch (err) {
      return [];
    }
  },

  // ==========================================
  // INITIALIZE DEFAULT TEMPLATE FOR NEW USERS
  // ==========================================
  async initializeDefaultTenantLandingPage(tenantId: string): Promise<LandingPage> {
    const tenantDocRef = doc(db, 'tenants', tenantId);
    let tenantEmail = 'info@samiratravel.co.id';
    let tenantCompany = 'Mitra Samira Travel';
    let tenantName = 'Mitra';
    
    try {
      const tenantSnap = await getDoc(tenantDocRef);
      if (tenantSnap.exists()) {
        const tenantData = tenantSnap.data();
        if (tenantData.email) tenantEmail = tenantData.email;
        if (tenantData.company) tenantCompany = tenantData.company;
        if (tenantData.name) tenantName = tenantData.name;
      }
    } catch (err) {
      console.error('Failed to pre-fetch tenant details for seeding:', err);
    }

    const pageId = `${tenantId}_home`;
    const pageRef = doc(db, 'landingPages', pageId);

    const defaultPage: LandingPage = {
      pageId,
      tenantId,
      title: 'Samira Travel Official',
      slug: 'home',
      status: 'published',
      seo: {
        title: 'Samira Travel - Perjalanan Umroh Nyaman',
        description: 'Biro perjalanan Umrah & Haji terpercaya dengan bimbingan ibadah syariah.',
        keywords: ['umrah', 'haji', 'samira travel', 'paket umroh'],
      },
      theme: {
        primaryColor: '#0A1E3B',
        secondaryColor: '#D4AF37',
        fontFamily: 'PT Sans',
        borderRadius: 'lg',
        shadow: 'lg',
        spacing: 'normal',
        containerWidth: 'xl',
        darkMode: false,
      },
      globalSettings: {
        whatsappNumber: '', // Empty by default for subdomains
        emailContact: tenantEmail,
        socialLinks: {},
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      try {
        await setDoc(pageRef, defaultPage);
      } catch (pageErr) {}

      // Seed Default Sections & Contents (Fail-Safe Individual Writes)
      const sectionTypes: SectionType[] = [
        'hero', 'about', 'pricing', 'feature', 'testimonial', 'gallery', 'portfolio', 'cta', 'contact'
      ];

      for (let idx = 0; idx < sectionTypes.length; idx++) {
        const type = sectionTypes[idx];
        const secId = `sec_${tenantId}_${type}`;
        const secRef = doc(db, 'sections', secId);
        const secObj: Section = {
          sectionId: secId,
          tenantId,
          landingPageId: pageId,
          type,
          order: idx,
          isHidden: false,
        };

        try { await setDoc(secRef, secObj); } catch (sErr) {}

        let contentObj: Record<string, any> = {};

        if (type === 'hero') {
          contentObj = {
            badgeText: 'Biro Perjalanan Haji & Umrah Terpercaya',
            title: 'Mulailah Perjalanan Suci Anda Bersama SAMIRA',
            description: 'Rasakan pengalaman ibadah yang lancar dan memperkaya spiritual dengan bimbingan ustadz ahli, akomodasi bintang 5, dan pelayanan sepenuh hati.',
            primaryBtnText: 'Jelajahi Paket',
            primaryBtnUrl: '#paket',
          };
        } else if (type === 'about') {
          contentObj = {
            badgeText: 'Tentang Kami',
            title: 'Pilihan Terbaik untuk Perjalanan Spiritual Anda',
            description: 'Kami adalah biro perjalanan Umrah dan Haji yang berkomitmen memberikan layanan terbaik, aman, dan sesuai syariah.',
          };
        } else if (type === 'feature') {
          contentObj = {
            badgeText: 'Keunggulan Layanan',
            title: 'Mengapa Memilih Samira Travel?',
            description: 'Jaminan fasilitas dan kemudahan komprehensif dari keberangkatan hingga kepulangan.',
          };
        } else if (type === 'service') {
          contentObj = {
            badgeText: 'Pilihan Paket Utama',
            title: 'Paket Umrah & Haji Terpopuler 2026',
            description: 'Temukan pilihan paket ibadah umrah yang dirancang khusus untuk kenyamanan dan kekhusyukan ibadah keluarga Anda.',
          };
        } else if (type === 'portfolio') {
          contentObj = {
            badgeText: 'E-Katalog Resmi 2025/2026',
            title: 'Product Knowledge Samira Travel',
            description: 'Katalog panduan komprehensif mengenai fasilitas layanan, pilihan paket ibadah umrah, akomodasi hotel bintang 5, serta syarat pendaftaran.',
            structure: `• Hal 01 - 05: Profil Resmi Samira Travel & Legalitas Kemenag\n• Hal 06 - 15: Brosur & Spesifikasi Paket Umrah Reguler / VIP\n• Hal 16 - 25: Akomodasi Hotel Makkah & Madinah Bintang 5\n• Hal 26 - 35: Syarat Pendaftaran, Paspor & Bantuan Visa\n• Hal 36 - 47: Program Solusi Pembiayaan Syariah (DP 20%)`,
            totalPages: '47',
          };
        } else if (type === 'testimonial') {
          contentObj = {
            badgeText: 'Kisah Jamaah',
            title: 'Apa Kata Jamaah Yang Telah Beribadah Bersama Kami',
            description: 'Pengalaman spiritual berkesan dari para jamaah yang telah menunaikan umrah.',
          };
        } else if (type === 'contact') {
          contentObj = {
            badgeText: 'Hubungi Kami & Konsultasi Gratis',
            title: 'Konsultasi Perjalanan Umrah & Haji Anda',
            description: 'Tim konsultan profesional kami siap melayani pertanyaan dan bantuan pendaftaran 24 jam.',
            phone: '', // Empty phone so they enter their own
            email: tenantEmail,
            hours: 'Senin - Sabtu: 08.30 - 17.30 WIB',
            address: tenantCompany,
          };
        } else if (type === 'cta') {
          contentObj = {
            badgeText: 'Pendaftaran Dibuka',
            title: 'Siap Menunaikan Ibadah Umrah Tahun Ini?',
            description: 'Dapatkan diskon khusus pendaftaran awal dan konsultasi gratis dengan konsultan ibadah kami.',
            primaryBtnText: 'Daftar Sekarang via WhatsApp',
          };
        }

        // Seed flat documents for each key in contentObj to match useCmsStore schema
        for (const key of Object.keys(contentObj)) {
          const contentId = `${tenantId}_${secId}_${key}`;
          const contentRef = doc(db, 'contents', contentId);
          try {
            await setDoc(contentRef, {
              contentId,
              tenantId,
              sectionId: secId,
              key,
              value: contentObj[key]
            });
          } catch (cErr) {}
        }
      }
    } catch (err) {
      // Quiet fail-safe fallback
    }

    return defaultPage;
  }
};
export default cmsService;
