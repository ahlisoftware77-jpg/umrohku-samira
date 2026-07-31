import { create } from 'zustand';
import { doc, getDoc, updateDoc, writeBatch, collection, deleteDoc, getDocs, query, where } from 'firebase/firestore';
import { db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { LandingPage, Section, Content, SectionType } from '@/types/cms';

interface CmsState {
  page: LandingPage | null;
  sections: Section[];
  contents: Record<string, Record<string, any>>;
  activeSectionId: string | null;
  
  // History stack for Undo/Redo
  history: { sections: Section[]; contents: Record<string, Record<string, any>> }[];
  historyIndex: number;
  
  // Status flags
  isSaving: boolean;
  
  // Actions
  setInitialData: (page: LandingPage, sections: Section[], contents: Record<string, Record<string, any>>) => void;
  setActiveSectionId: (id: string | null) => void;
  updateContent: (sectionId: string, key: string, value: any) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  applyPresetLayout: (presetKey: string) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  pushHistory: (sections: Section[], contents: Record<string, Record<string, any>>) => void;
  
  // Save Action
  saveToFirestore: () => Promise<void>;
  updateTheme: (theme: Partial<LandingPage['theme']>) => void;
  updateSeo: (seo: Partial<LandingPage['seo']>) => void;
}

export const useCmsStore = create<CmsState>((set, get) => {
  let autosaveTimeout: NodeJS.Timeout | null = null;

  const triggerAutosave = () => {
    if (autosaveTimeout) clearTimeout(autosaveTimeout);
    set({ isSaving: true });
    autosaveTimeout = setTimeout(async () => {
      try {
        await get().saveToFirestore();
      } catch (err) {
        console.error('Autosave failed:', err);
      } finally {
        set({ isSaving: false });
      }
    }, 1500); // Save after 1.5 seconds of inactivity
  };

  return {
    page: null,
    sections: [],
    contents: {},
    activeSectionId: null,
    history: [],
    historyIndex: -1,
    isSaving: false,

    setInitialData: (page, sections, contents) => {
      set({
        page,
        sections,
        contents,
        history: [{ sections, contents }],
        historyIndex: 0
      });
    },

    setActiveSectionId: (id) => set({ activeSectionId: id }),

    updateContent: (sectionId, key, value) => {
      // Guard: never store undefined keys or values — they would break Firestore
      if (!key || key === 'undefined' || value === undefined) return;
      const { contents, sections } = get();
      const newContents = {
        ...contents,
        [sectionId]: {
          ...(contents[sectionId] || {}),
          [key]: value
        }
      };

      set({ contents: newContents });
      get().pushHistory(sections, newContents);
      triggerAutosave();
    },

    addSection: (type) => {
      const { sections, page } = get();
      if (!page) return;
      
      const newSectionId = `sec_${Date.now()}`;
      const newSection: Section = {
        sectionId: newSectionId,
        tenantId: page.tenantId,
        landingPageId: page.pageId,
        type,
        order: sections.length,
        isHidden: false
      };

      const newSections = [...sections, newSection];
      set({ sections: newSections, activeSectionId: newSectionId });
      get().pushHistory(newSections, get().contents);
      triggerAutosave();
    },

    removeSection: (sectionId) => {
      const { sections, contents } = get();
      const newSections = sections
        .filter(s => s.sectionId !== sectionId)
        .map((s, idx) => ({ ...s, order: idx })); // Rescale orders
      
      const newContents = { ...contents };
      delete newContents[sectionId];

      set({ 
        sections: newSections, 
        contents: newContents,
        activeSectionId: get().activeSectionId === sectionId ? null : get().activeSectionId
      });
      get().pushHistory(newSections, newContents);
      triggerAutosave();
    },

    duplicateSection: (sectionId) => {
      const { sections, contents, page } = get();
      const targetSec = sections.find(s => s.sectionId === sectionId);
      if (!page || !targetSec) return;

      const newSectionId = `sec_${Date.now()}`;
      const duplicatedSec: Section = {
        ...targetSec,
        sectionId: newSectionId,
        order: targetSec.order + 1
      };

      const newSections = [...sections];
      newSections.splice(targetSec.order + 1, 0, duplicatedSec);
      
      // Update orders for downstream sections
      const orderedSections = newSections.map((s, idx) => ({ ...s, order: idx }));

      const newContents = {
        ...contents,
        [newSectionId]: { ...(contents[sectionId] || {}) }
      };

      set({ sections: orderedSections, contents: newContents });
      get().pushHistory(orderedSections, newContents);
      triggerAutosave();
    },

    reorderSections: (startIndex, endIndex) => {
      const { sections, contents } = get();
      const newSections = [...sections];
      const [removed] = newSections.splice(startIndex, 1);
      newSections.splice(endIndex, 0, removed);

      const orderedSections = newSections.map((s, idx) => ({ ...s, order: idx }));
      
      set({ sections: orderedSections });
      get().pushHistory(orderedSections, contents);
      triggerAutosave();
    },

    toggleSectionVisibility: (sectionId) => {
      const { sections, contents } = get();
      const updatedSections = sections.map(s => 
        s.sectionId === sectionId ? { ...s, isHidden: !s.isHidden } : s
      );

      set({ sections: updatedSections });
      get().pushHistory(updatedSections, contents);
      triggerAutosave();
    },

    applyPresetLayout: (presetKey: string) => {
      const { page, sections: currentSections, contents: currentContents } = get();
      if (!page) return;

      let sectionTypes: SectionType[] = [];
      switch (presetKey) {
        case 'lengkap':
          sectionTypes = ['hero', 'about', 'why_umrah', 'finance', 'why_samira', 'pricing', 'faq', 'flow', 'muri', 'gallery', 'testimonial', 'cta', 'contact'];
          break;
        case 'promo':
          sectionTypes = ['hero', 'pricing', 'feature', 'cta', 'contact', 'finance'];
          break;
        case 'dokumentasi':
          sectionTypes = ['hero', 'about', 'feature', 'gallery', 'testimonial', 'contact', 'muri'];
          break;
        case 'minimal':
          sectionTypes = ['hero', 'about', 'pricing', 'contact'];
          break;
        default:
          sectionTypes = ['hero', 'about', 'why_umrah', 'finance', 'why_samira', 'pricing', 'faq', 'flow', 'muri', 'gallery', 'testimonial', 'cta', 'contact'];
          break;
      }

      const timestamp = Date.now();
      const newSections: Section[] = [];
      const newContents: Record<string, Record<string, any>> = { ...currentContents };
      const processedExistingSectionIds = new Set<string>();

      // Helper for initial default section contents
      const getDefaultContentForType = (t: string) => {
        switch (t) {
          case 'hero':
            return {
              badgeText: 'Biro Perjalanan Haji & Umrah Terpercaya',
              title: 'Mulailah Perjalanan Suci Anda Bersama SAMIRA',
              description: 'Rasakan pengalaman ibadah yang lancar dan memperkaya spiritual dengan bimbingan ustadz ahli, akomodasi bintang 5, dan pelayanan sepenuh hati.',
              primaryBtnText: 'Jelajahi Paket',
              primaryBtnUrl: '#paket',
            };
          case 'about':
            return {
              badgeText: 'Tentang Kami',
              title: 'Pilihan Terbaik untuk Perjalanan Spiritual Anda',
              description: 'Kami adalah biro perjalanan Umrah dan Haji yang berkomitmen memberikan layanan terbaik, aman, dan sesuai syariah.',
            };
          case 'pricing':
          case 'service':
            return {
              badgeText: 'Pilihan Paket Utama',
              title: 'Paket Umrah & Haji Terpopuler 2026',
              description: 'Temukan pilihan paket ibadah umrah yang dirancang khusus untuk kenyamanan dan kekhusyukan ibadah keluarga Anda.',
            };
          case 'feature':
            return {
              badgeText: 'Keunggulan Layanan',
              title: 'Mengapa Memilih Samira Travel?',
              description: 'Jaminan fasilitas dan kemudahan komprehensif dari keberangkatan hingga kepulangan.',
            };
          case 'testimonial':
            return {
              badgeText: 'Kisah Jamaah',
              title: 'Apa Kata Jamaah Yang Telah Beribadah Bersama Kami',
              description: 'Pengalaman spiritual berkesan dari para jamaah yang telah menunaikan umrah.',
            };
          case 'gallery':
            return {
              badgeText: 'Dokumentasi Kegiatan',
              title: 'Momen Indah Ibadah Jamaah',
              description: 'Galeri kenangan perjalanan suci di Tanah Suci Makkah dan Madinah.',
            };
          case 'cta':
            return {
              badgeText: 'Pendaftaran Dibuka',
              title: 'Siap Menunaikan Ibadah Umrah Tahun Ini?',
              description: 'Dapatkan diskon khusus pendaftaran awal dan konsultasi gratis dengan konsultan ibadah kami.',
              primaryBtnText: 'Daftar Sekarang via WhatsApp',
            };
          case 'contact':
            return {
              badgeText: 'Hubungi Kami',
              title: 'Konsultasi Perjalanan Umrah Anda',
              description: 'Tim konsultan kami siap melayani pertanyaan dan bantuan pendaftaran 24/7.',
            };
          case 'why_umrah':
            return {
              badgeText: 'Keutamaan',
              title: '12 Alasan Harus Umroh',
            };
          case 'why_samira':
            return {
              badgeText: 'Keunggulan Mitra',
              title: 'Mengapa Umroh Bersama Samira Travel',
            };
          case 'finance':
            return {
              badgeText: 'Solusi Pembiayaan',
              title: 'Mau Umroh Tapi Terkendala Biaya?',
            };
          case 'muri':
            return {
              badgeText: 'Rekor MURI',
              title: 'Anugrah Rekor MURI',
            };
          case 'faq':
            return {
              badgeText: 'Informasi Akomodasi',
              title: 'PENJELASAN PAKET UMROH SAMIRA',
            };
          default:
            return {};
        }
      };

      // 1. Process target preset section types in specified layout order, preserving existing user data!
      sectionTypes.forEach((type, idx) => {
        const existingSection = currentSections.find(
          s => s.type === type && !processedExistingSectionIds.has(s.sectionId)
        );

        if (existingSection) {
          processedExistingSectionIds.add(existingSection.sectionId);
          newSections.push({
            ...existingSection,
            order: idx,
            isHidden: false, // Ensure visible in this preset
          });
        } else {
          // Create new section with deterministic stable ID so it is never lost on reload!
          const stableSecId = `sec_${page.tenantId}_${type}`;
          newSections.push({
            sectionId: stableSecId,
            tenantId: page.tenantId,
            landingPageId: page.pageId,
            type,
            order: idx,
            isHidden: false,
          });
          if (!newContents[stableSecId]) {
            newContents[stableSecId] = getDefaultContentForType(type);
          }
        }
      });

      // 2. Keep any remaining existing sections that were not in the preset, but set them as hidden
      // so no user-filled data is ever lost!
      let nextOrder = sectionTypes.length;
      currentSections.forEach((existingSec) => {
        if (!processedExistingSectionIds.has(existingSec.sectionId)) {
          newSections.push({
            ...existingSec,
            order: nextOrder++,
            isHidden: true,
          });
        }
      });

      set({
        sections: newSections,
        contents: newContents,
        activeSectionId: null,
      });

      get().pushHistory(newSections, newContents);
      get().saveToFirestore();
    },

    pushHistory: (sections, contents) => {
      const { history, historyIndex } = get();
      const cleanHistory = history.slice(0, historyIndex + 1);
      
      // Limit history to 50 revisions to save memory
      if (cleanHistory.length >= 50) {
        cleanHistory.shift();
      }

      set({
        history: [...cleanHistory, { sections, contents }],
        historyIndex: cleanHistory.length
      });
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        set({
          sections: history[nextIndex].sections,
          contents: history[nextIndex].contents,
          historyIndex: nextIndex
        });
        triggerAutosave();
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          sections: history[nextIndex].sections,
          contents: history[nextIndex].contents,
          historyIndex: nextIndex
        });
        triggerAutosave();
      }
    },

    saveToFirestore: async () => {
      const { page, sections, contents } = get();
      if (!page) return;

      try {
        // Resolve Target Database Server Instance dynamically for migrated tenants (e.g. landing-umroh2)
        let targetDb = db;
        try {
          // Fetch tenant doc to get assigned dbServerId
          const tenantDocSnap = await getDoc(doc(db, 'tenants', page.tenantId));
          const tenantDbServerId = tenantDocSnap.exists() ? tenantDocSnap.data()?.dbServerId : null;

          if (tenantDbServerId && tenantDbServerId !== 'default') {
            let servers: any[] = [];
            if (typeof window !== 'undefined') {
              const storedServers = localStorage.getItem('database_servers');
              if (storedServers) {
                try { servers = JSON.parse(storedServers); } catch (e) {}
              }
            }

            // Fallback to Firestore databaseServers collection if local storage is empty
            if (servers.length === 0) {
              try {
                const dbServersSnap = await getDocs(collection(db, 'databaseServers'));
                servers = dbServersSnap.docs.map(d => d.data());
              } catch (e) {}
            }

            const serverConfig = servers.find(s => s.serverId === tenantDbServerId);
            if (serverConfig) {
              targetDb = getDynamicFirebaseInstance(serverConfig).db;
              console.log(`[saveToFirestore] Dynamic DB resolved to Cluster: ${serverConfig.name || serverConfig.projectId}`);
            }
          }
        } catch (dbErr) {
          console.warn('[saveToFirestore] Failed resolving targetDb for save, falling back to default db:', dbErr);
        }

        const batch = writeBatch(targetDb);

        // 1. Save page meta data (theme, seo, globalSettings, updatedAt)
        const pageRef = doc(targetDb, 'landingPages', page.pageId);
        batch.set(pageRef, { 
          updatedAt: new Date(),
          theme: page.theme,
          seo: page.seo,
          globalSettings: page.globalSettings
        }, { merge: true });

        // 2. Delete obsolete sections from Firestore no longer present in current state
        try {
          const sectionsRef = collection(targetDb, 'sections');
          const qOldSec = query(sectionsRef, where('landingPageId', '==', page.pageId));
          const oldSecSnap = await getDocs(qOldSec);
          const currentSecIds = new Set(sections.map(s => s.sectionId));

          oldSecSnap.docs.forEach(oldDoc => {
            if (!currentSecIds.has(oldDoc.id)) {
              batch.delete(doc(targetDb, 'sections', oldDoc.id));
            }
          });
        } catch (sDelErr) {}

        // 3. Save all current sections order & layout config
        sections.forEach(sec => {
          const secRef = doc(targetDb, 'sections', sec.sectionId);
          batch.set(secRef, sec);
        });

        // 4. Save contents
        // IMPORTANT: Filter out Data URLs (base64) from array fields & flatten any nested arrays before saving.
        // Nested arrays cause Firestore WriteBatch.set() to crash with invalid data error.
        const sanitizeValue = (value: any): any => {
          if (Array.isArray(value)) {
            // Flat 1D array by recursively unwrapping nested arrays
            const flat = value.flat(Infinity);
            const filtered = flat.filter((item: any) => {
              if (item === undefined || item === null) return false;
              if (typeof item === 'string' && item.startsWith('data:')) return false; // strip Data URLs
              return true;
            });
            return filtered;
          }
          return value;
        };

        Object.keys(contents).forEach(secId => {
          const sectionContent = contents[secId];
          if (!sectionContent || typeof sectionContent !== 'object') return;
          Object.keys(sectionContent).forEach(key => {
            // Guard: skip invalid keys (undefined as string, empty string)
            if (!key || key === 'undefined') return;

            const rawValue = sectionContent[key];
            // Guard: skip undefined or null values — Firestore doesn't accept them
            if (rawValue === undefined || rawValue === null) return;
            // Skip fields that are purely Data URL blobs to avoid exceeding Firestore 1MB limit
            if (typeof rawValue === 'string' && rawValue.startsWith('data:')) return;
            
            const sanitized = sanitizeValue(rawValue);
            // Skip empty arrays that resulted from all Data URLs being filtered
            if (Array.isArray(sanitized) && sanitized.length === 0 && Array.isArray(rawValue) && rawValue.length > 0) return;

            const contentId = `${page.tenantId}_${secId}_${key}`;
            const contentRef = doc(targetDb, 'contents', contentId);
            batch.set(contentRef, {
              contentId,
              tenantId: page.tenantId,
              sectionId: secId,
              key,
              value: sanitized
            });
          });
        });

        await batch.commit();
        console.log('Autosaved to targetDb Firestore successfully.');
      } catch (err) {
        console.error('Autosave failed:', err);
      }
    },

    updateTheme: (themeUpdates) => {
      const { page } = get();
      if (!page) return;
      const updatedPage = {
        ...page,
        theme: {
          ...page.theme,
          ...themeUpdates
        }
      };
      set({ page: updatedPage });
      get().pushHistory(get().sections, get().contents);
      triggerAutosave();
    },

    updateSeo: (seoUpdates) => {
      const { page } = get();
      if (!page) return;
      const updatedPage = {
        ...page,
        seo: {
          ...page.seo,
          ...seoUpdates
        }
      };
      set({ page: updatedPage });
      get().pushHistory(get().sections, get().contents);
      triggerAutosave();
    }
  };
});
