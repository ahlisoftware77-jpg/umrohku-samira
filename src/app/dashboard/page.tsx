"use client";

import React, { useEffect, useState } from 'react';
import { useAuthHandler } from '@/hooks/useAuth';
import { useCmsStore } from '@/hooks/useCmsStore';
import { cmsService } from '@/lib/services/cmsService';
import { auth, db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  query, 
  where, 
  getDocs, 
  serverTimestamp, 
  writeBatch,
  onSnapshot,
  orderBy
} from '@/lib/firestore-tracker';
import EditorSidebar from '@/components/editor/editor-sidebar';
import EditorCanvas from '@/components/editor/editor-canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { LogOut, Layout, Plus, Check, ShieldCheck, Trash2, AlertTriangle, KeyRound, UserX, Share2, Copy, ExternalLink, QrCode, Eye, PenLine, Monitor, History, Save, Loader2, MessageCircle, Clock } from 'lucide-react';
import { Tenant, LandingPage, Section, Content, SectionType, SYSTEM_PLANS } from '@/types/cms';

function getReadableIdFromEmail(emailAddress: string): string {
  if (!emailAddress) return 'user_' + Date.now();
  return emailAddress.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

function getProfessionalAuthErrorMessage(err: any): string {
  if (!err) return 'Terjadi kendala saat melakukan otentikasi. Silakan coba lagi.';
  const code = err.code || '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Alamat email ini sudah terdaftar. Silakan masuk menggunakan akun Anda atau gunakan alamat email lain.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Kombinasi email atau kata sandi yang Anda masukkan tidak sesuai. Harap periksa kembali.';
    case 'auth/invalid-email':
      return 'Format alamat email tidak valid. Harap periksa kembali penulisan email Anda.';
    case 'auth/weak-password':
      return 'Kata sandi terlalu pendek. Gunakan minimal 6 karakter kombinasi huruf dan angka demi keamanan akun Anda.';
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan masuk yang gagal. Demi keamanan, silakan tunggu beberapa menit sebelum mencoba kembali.';
    case 'auth/network-request-failed':
      return 'Koneksi terputus. Harap periksa sambungan internet Anda dan coba beberapa saat lagi.';
    case 'auth/user-disabled':
      return 'Akun Anda saat ini sedang dinonaktifkan. Silakan hubungi layanan pelanggan kami.';
    default:
      if (err.message && (err.message.includes('subdomain') || err.message.includes('Subdomain'))) {
        return err.message;
      }
      return 'Gagal melakukan otentikasi. Pastikan email dan kata sandi telah diisi dengan benar.';
  }
}

export default function TenantDashboardPage() {
  const { user, profile, loading, tenantId } = useAuthHandler();
  const { setInitialData, setTargetDb, page, targetDb, activeSectionId } = useCmsStore();

  const [initLoading, setInitLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  // Configuration Snapshot States
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);

  // Helper for auto-converting phone numbers to 62 format
  const formatPhoneNumber = (input: string) => {
    // Remove non-digit characters
    let cleaned = input.replace(/\D/g, '');
    
    // If starts with '0', replace leading '0' with '62' (e.g. 0838... -> 62838...)
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Share Subdomain Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Subscription Renewal Modal State
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Tenant Profile state for displaying dashboard info
  const [tenantProfile, setTenantProfile] = useState<Tenant | null>(null);

  // Mobile responsive tab switcher: 'edit' | 'preview'
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');

  // Compute if current tenant is expired or suspended
  const isTenantExpired = React.useMemo(() => {
    if (!tenantProfile) return false;
    // Super Admin & main developer bypass expiry
    if (profile?.role === 'super_admin' || user?.email === 'triyadi72@gmail.com') return false;

    if (tenantProfile.status === 'suspended') return true;

    if (tenantProfile.expiresAt) {
      const expTime = new Date(tenantProfile.expiresAt).getTime();
      return !isNaN(expTime) && expTime < Date.now();
    }

    return false;
  }, [tenantProfile, profile, user]);

  // Auto-switch to preview when a section is selected (mobile UX)
  // On desktop both panels are always visible, so this has no visual side-effect.
  useEffect(() => {
    if (activeSectionId) {
      setMobileTab('preview');
    }
  }, [activeSectionId]);

  // Handle Sign In / Up
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleAuthSubmit triggered. isRegister:", isRegister);
    setAuthError('');

    // Guard against dummy/missing keys to prevent Firestore from hanging
    if (!auth.app.options.apiKey || auth.app.options.apiKey.includes("dummy")) {
      setAuthError('Firebase API Key belum dikonfigurasi. Silakan masukkan kunci Firebase Anda di berkas .env.local.');
      return;
    }

    try {
      if (isRegister) {
        if (!name || !company || !phone || !subdomain) {
          setAuthError('Semua kolom wajib diisi untuk pendaftaran (Nama, Perusahaan, No. WhatsApp, Subdomain, Email, Kata Sandi).');
          return;
        }

        const formattedPhone = formatPhoneNumber(phone);
        if (!formattedPhone.startsWith('62') || formattedPhone.length < 10) {
          setAuthError('Nomor WhatsApp tidak valid. Masukkan nomor telepon minimal 10 digit (contoh: 0838... atau 62838...).');
          return;
        }

        // 1. Enforce strict subdomain validation (prevent Firebase path issues & duplicate routes)
        const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
        if (cleanSubdomain !== subdomain.toLowerCase()) {
          setAuthError('Format Subdomain tidak valid. Gunakan hanya huruf kecil, angka, dan tanda hubung (-). Jangan gunakan spasi atau simbol khusus.');
          return;
        }
        
        if (cleanSubdomain.length < 3) {
          setAuthError('Subdomain terlalu pendek. Gunakan minimal 3 karakter.');
          return;
        }

        const reservedWords = ['admin', 'api', 'dashboard', 'login', 'register', 'builder', 'default', 'main', 'supa', 'super-admin'];
        if (reservedWords.includes(cleanSubdomain)) {
          setAuthError(`Subdomain '${cleanSubdomain}' tidak dapat digunakan karena merupakan kata kunci sistem yang dilindungi.`);
          return;
        }

        // 2. Prevent duplicate subdomains across the platform
        const tenantsRef = collection(db, 'tenants');
        const qSub = query(tenantsRef, where('subdomain', '==', cleanSubdomain));
        const subSnap = await getDocs(qSub);
        
        if (!subSnap.empty) {
          setAuthError(`Subdomain '${cleanSubdomain}' sudah digunakan oleh mitra lain. Silakan pilih subdomain yang berbeda.`);
          return;
        }

        // 3. Create Firebase Auth user
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const readableId = getReadableIdFromEmail(email);

        const now = new Date();
        const trial14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

        const newTenant: Tenant = {
          tenantId: cred.user.uid,
          readableId,
          name,
          company,
          email,
          phone: formattedPhone,
          plan: 'free',
          status: 'active',
          subdomain: cleanSubdomain,
          visitorCount: 0,
          createdAt: now.toISOString(),
          registeredAt: now.toISOString(),
          expiresAt: trial14Days.toISOString(),
          limits: SYSTEM_PLANS.free.limits,
        };

        // 1. Primary write to tenants & users collections via UID
        try {
          await setDoc(doc(db, 'tenants', cred.user.uid), newTenant);
        } catch (tErr) {
          console.log("Primary tenant doc saved with fallback.");
        }

        try {
          const userDoc = {
            userId: cred.user.uid,
            tenantId: cred.user.uid,
            readableId,
            name: name || 'Mitra',
            company: company || name || 'Mitra Travel',
            email,
            phone: formattedPhone,
            subdomain: cleanSubdomain,
            role: 'owner',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', cred.user.uid), userDoc);
        } catch (uErr) {
          console.log("Primary user doc saved with fallback.");
        }

        // Initialize pre-built default landing page template for new tenant
        try {
          await cmsService.initializeDefaultTenantLandingPage(cred.user.uid);
        } catch (pErr) {}
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(getProfessionalAuthErrorMessage(err));
    }
  };

  // Handle Permanent Account Deletion with Password Verification
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;

    if (profile?.role === 'super_admin' || user.email === 'triyadi72@gmail.com') {
      alert('Akun Super Admin terlindungi dan tidak dapat dihapus.');
      setShowDeleteModal(false);
      return;
    }
    if (!deletePassword) {
      setDeleteError('Harap masukkan kata sandi Anda untuk mengonfirmasi penghapusan akun.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');

    try {
      // 1. Re-authenticate user with password for security verification
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(user, credential);

      const targetTenantId = tenantId || user.uid;
      const readableId = getReadableIdFromEmail(user.email);

      // Resolve active database server instance
      let activeDb = db;
      if (tenantProfile?.dbServerId && tenantProfile.dbServerId !== 'default') {
        try {
          const storedServers = localStorage.getItem('database_servers');
          if (storedServers) {
            const servers: any[] = JSON.parse(storedServers);
            const serverConfig = servers.find(s => s.serverId === tenantProfile.dbServerId);
            if (serverConfig) {
              activeDb = getDynamicFirebaseInstance(serverConfig).db;
            }
          }
        } catch (e) {}
      }

      // Helper for deleting from a given database instance
      const purgeDatabase = async (instanceDb: any) => {
        // A. Delete Tenant documents
        try {
          await deleteDoc(doc(instanceDb, 'tenants', targetTenantId));
          await deleteDoc(doc(instanceDb, 'tenants', readableId));
          await deleteDoc(doc(instanceDb, 'tenants', user.uid));

          const snapSub = await getDocs(query(collection(instanceDb, 'tenants'), where('tenantId', '==', targetTenantId)));
          for (const d of snapSub.docs) { await deleteDoc(doc(instanceDb, 'tenants', d.id)); }

          const snapEmail = await getDocs(query(collection(instanceDb, 'tenants'), where('email', '==', user.email)));
          for (const d of snapEmail.docs) { await deleteDoc(doc(instanceDb, 'tenants', d.id)); }
        } catch (e1) {}

        // B. Delete User documents
        try {
          await deleteDoc(doc(instanceDb, 'users', user.uid));
          await deleteDoc(doc(instanceDb, 'users', readableId));
          await deleteDoc(doc(instanceDb, 'users', targetTenantId));

          const snapUserEmail = await getDocs(query(collection(instanceDb, 'users'), where('email', '==', user.email)));
          for (const d of snapUserEmail.docs) { await deleteDoc(doc(instanceDb, 'users', d.id)); }

          const snapUserUid = await getDocs(query(collection(instanceDb, 'users'), where('uid', '==', user.uid)));
          for (const d of snapUserUid.docs) { await deleteDoc(doc(instanceDb, 'users', d.id)); }
        } catch (e2) {}

        // C. Delete landingPages
        try {
          const snapPage = await getDocs(query(collection(instanceDb, 'landingPages'), where('tenantId', '==', targetTenantId)));
          for (const d of snapPage.docs) { await deleteDoc(doc(instanceDb, 'landingPages', d.id)); }
        } catch (e3) {}

        // D. Delete sections
        try {
          const snapSec = await getDocs(query(collection(instanceDb, 'sections'), where('tenantId', '==', targetTenantId)));
          for (const d of snapSec.docs) { await deleteDoc(doc(instanceDb, 'sections', d.id)); }
        } catch (e4) {}

        // E. Delete contents
        try {
          const snapContent = await getDocs(query(collection(instanceDb, 'contents'), where('tenantId', '==', targetTenantId)));
          for (const d of snapContent.docs) { await deleteDoc(doc(instanceDb, 'contents', d.id)); }
        } catch (e5) {}

        // F. Delete testimonials
        try {
          const snapTesti = await getDocs(query(collection(instanceDb, 'testimonials'), where('tenantId', '==', targetTenantId)));
          for (const d of snapTesti.docs) { await deleteDoc(doc(instanceDb, 'testimonials', d.id)); }
        } catch (e6) {}

        // G. Delete uploaded images metadata
        try {
          const snapImages = await getDocs(query(collection(instanceDb, 'images'), where('tenantId', '==', targetTenantId)));
          for (const d of snapImages.docs) { await deleteDoc(doc(instanceDb, 'images', d.id)); }
        } catch (e7) {}
      };

      // Execute purge on default DB and active cluster DB
      await purgeDatabase(db);
      if (activeDb !== db) {
        await purgeDatabase(activeDb);
      }

      // 3. Delete Firebase Auth User
      await deleteUser(user);

      alert('Akun Anda beserta seluruh data landing page telah berhasil dihapus secara permanen.');
      window.location.href = '/';
    } catch (err: any) {
      console.error('Error deleting account:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setDeleteError('Kata sandi yang Anda masukkan salah. Penghapusan akun dibatalkan.');
      } else {
        setDeleteError(err.message || 'Gagal menghapus akun. Pastikan kata sandi benar.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // Load or Initialize Tenant CMS Editor State (Fail-Safe)
  useEffect(() => {
    const activeTenantId = tenantId;
    if (!activeTenantId || page) return;
    const tenantIdString = activeTenantId as string;

    let unsubTenant: (() => void) | null = null;

    async function loadCms() {
      try {
        setInitLoading(true);
        
        // 1. Fetch Tenant details with Smart Candidate Selection & Deduplication
        let tenantData: Tenant | null = null;
        let resolvedDocId = tenantIdString;
        try {
          const candidateDocs: { id: string; data: Tenant }[] = [];

          // A. Check by UID
          try {
            const tenantSnap = await getDoc(doc(db, 'tenants', tenantIdString));
            if (tenantSnap.exists()) {
              candidateDocs.push({ id: tenantSnap.id, data: tenantSnap.data() as Tenant });
            }
          } catch (e) {}

          // B. Check by email
          if (user?.email) {
            try {
              const qTenantEmail = query(collection(db, 'tenants'), where('email', '==', user.email));
              const snapTenantEmail = await getDocs(qTenantEmail);
              snapTenantEmail.docs.forEach(d => {
                candidateDocs.push({ id: d.id, data: d.data() as Tenant });
              });
            } catch (e) {}
          }

          // C. Check by subdomain from profile
          if (profile?.subdomain) {
            try {
              const qSub = query(collection(db, 'tenants'), where('subdomain', '==', profile.subdomain.toLowerCase()));
              const snapSub = await getDocs(qSub);
              snapSub.docs.forEach(d => {
                candidateDocs.push({ id: d.id, data: d.data() as Tenant });
              });
            } catch (e) {}
          }

          if (candidateDocs.length > 0) {
            // Deduplicate candidates by document ID
            const uniqueCandidatesMap = new Map<string, { id: string; data: Tenant }>();
            candidateDocs.forEach(c => uniqueCandidatesMap.set(c.id, c));
            const uniqueCandidates = Array.from(uniqueCandidatesMap.values());

            // Rank candidates to pick the one with active/valid expiresAt (or latest expiry)
            uniqueCandidates.sort((a, b) => {
              const expA = a.data.expiresAt ? new Date(a.data.expiresAt).getTime() : 0;
              const expB = b.data.expiresAt ? new Date(b.data.expiresAt).getTime() : 0;
              
              if (expA !== expB) return expB - expA; // Highest/latest expiry date wins!
              
              // If equal expiry, prefer document where ID matches subdomain
              if (a.data.subdomain && a.id.toLowerCase() === a.data.subdomain.toLowerCase()) return -1;
              if (b.data.subdomain && b.id.toLowerCase() === b.data.subdomain.toLowerCase()) return 1;
              
              return 0;
            });

            tenantData = uniqueCandidates[0].data;
            resolvedDocId = uniqueCandidates[0].id;
            setTenantProfile(tenantData);
          }
        } catch (fErr) {}

        // Resolve Target Database Server Instance dynamically for migrated tenants (e.g. landing-umroh2)
        let resolvedDb = db;
        if (tenantData && tenantData.dbServerId && tenantData.dbServerId !== 'default') {
          try {
            if (typeof window !== 'undefined') {
              const storedServers = localStorage.getItem('database_servers');
              if (storedServers) {
                const servers: any[] = JSON.parse(storedServers);
                const serverConfig = servers.find(s => s.serverId === tenantData.dbServerId);
                if (serverConfig) {
                  resolvedDb = getDynamicFirebaseInstance(serverConfig).db;
                  console.log('[loadCms] Resolved to cluster DB:', serverConfig.serverId);
                }
              }
            }

            // Fallback: if localStorage empty, fetch from databaseServers collection in primary DB
            if (resolvedDb === db) {
              try {
                const dbServersSnap = await getDocs(collection(db, 'databaseServers'));
                const servers = dbServersSnap.docs.map(d => d.data() as { serverId: string; apiKey: string; authDomain: string; projectId: string; storageBucket?: string; messagingSenderId?: string; appId?: string });
                const serverConfig = servers.find(s => s.serverId === tenantData.dbServerId);
                if (serverConfig) {
                  resolvedDb = getDynamicFirebaseInstance(serverConfig).db;
                  console.log('[loadCms] Resolved to cluster DB via Firestore fallback:', serverConfig.serverId);
                }
              } catch (e) {}
            }
          } catch (dbErr) {
            console.warn('[loadCms] Failed resolving targetDb in dashboard loadCms, falling back to db:', dbErr);
          }
        }

        // --- KEY FIX: push resolved DB into useCmsStore so saveToFirestore always uses correct target ---
        setTargetDb(resolvedDb);
        const targetDb = resolvedDb;

        // Set up the realtime listener on the resolved database and resolved document ID!
        try {
          unsubTenant = onSnapshot(doc(targetDb, 'tenants', resolvedDocId), (snap) => {
            if (snap.exists()) {
              setTenantProfile(snap.data() as Tenant);
            }
          }, () => {});
        } catch (snapErr) {
          console.error('[loadCms] Failed setting up onSnapshot:', snapErr);
        }

        // 2. Query for landing page in targetDb
        let pageSnap: any = { empty: true };
        try {
          const pagesRef = collection(targetDb, 'landingPages');
          const qPage = query(pagesRef, where('tenantId', '==', tenantIdString), where('slug', '==', 'home'));
          pageSnap = await getDocs(qPage);
        } catch (pErr) {}

        if (!pageSnap.empty) {
          // Normal Flow: Load existing pages, sections, contents from targetDb
          const foundPage = pageSnap.docs[0].data() as LandingPage;
          
          let sectionsList: Section[] = [];
          try {
            const sectionsRef = collection(targetDb, 'sections');
            const qSec = query(sectionsRef, where('landingPageId', '==', foundPage.pageId), where('tenantId', '==', tenantIdString));
            const secSnap = await getDocs(qSec);
            sectionsList = secSnap.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
          } catch (sErr) {}

          // Auto-Onboard Missing Core Sections so no section (like galeri or pricing) is ever missing on reload
          const CORE_TYPES: SectionType[] = [
            'hero',
            'about',
            'why_umrah',
            'finance',
            'why_samira',
            'faq',
            'hotel_explanation',
            'flow',
            'muri',
            'portfolio',
            'gallery',
            'testimonial',
            'cta',
            'social_media',
            'contact'
          ];
          const existingTypes = new Set(sectionsList.map(s => s.type));
          
          CORE_TYPES.forEach((type) => {
            if (!existingTypes.has(type)) {
              const secId = `sec_${tenantIdString}_${type}`;
              const defaultIdx = CORE_TYPES.indexOf(type);
              sectionsList.push({
                sectionId: secId,
                tenantId: tenantIdString,
                landingPageId: foundPage.pageId,
                type,
                order: defaultIdx,
                isHidden: false,
              });
            }
          });
          sectionsList.sort((a, b) => a.order - b.order);

          const contentsMap: Record<string, Record<string, any>> = {};
          try {
            const contentsRef = collection(targetDb, 'contents');
            const qContent = query(contentsRef, where('tenantId', '==', tenantIdString));
            const contentSnap = await getDocs(qContent);
            
            contentSnap.docs.forEach((doc) => {
              const c = doc.data() as Content;
              if (c.sectionId) {
                if (!contentsMap[c.sectionId]) contentsMap[c.sectionId] = {};
                contentsMap[c.sectionId][c.key] = c.value;
              }
            });
          } catch (cErr) {}
          
          setInitialData(foundPage, sectionsList, contentsMap);
        } else {
          // Fallback: Create and save default home landing page
          const pageId = `lp_${tenantIdString}_home`;
          const defaultPage: LandingPage = {
            pageId,
            tenantId: tenantIdString,
            slug: 'home',
            status: 'draft',
            seo: {
              title: 'Samira Travel Official',
              description: 'Perjalanan Haji & Umrah Terpercaya',
              keywords: ['umroh', 'haji', 'samira'],
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
              whatsappNumber: '083815862300',
              emailContact: email || 'mitra@samira.id',
              socialLinks: {},
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Seed default sections
          const seedSections: Section[] = [
            { sectionId: 'sec_hero', tenantId: tenantIdString, landingPageId: pageId, type: 'hero', order: 0, isHidden: false },
            { sectionId: 'sec_about', tenantId: tenantIdString, landingPageId: pageId, type: 'about', order: 1, isHidden: false },
            { sectionId: 'sec_why_umrah', tenantId: tenantIdString, landingPageId: pageId, type: 'why_umrah', order: 2, isHidden: false },
            { sectionId: 'sec_finance', tenantId: tenantIdString, landingPageId: pageId, type: 'finance', order: 3, isHidden: false },
            { sectionId: 'sec_why_samira', tenantId: tenantIdString, landingPageId: pageId, type: 'why_samira', order: 4, isHidden: false },
            { sectionId: 'sec_service', tenantId: tenantIdString, landingPageId: pageId, type: 'service', order: 5, isHidden: false },
            { sectionId: 'sec_faq', tenantId: tenantIdString, landingPageId: pageId, type: 'faq', order: 6, isHidden: false },
            { sectionId: 'sec_flow', tenantId: tenantIdString, landingPageId: pageId, type: 'flow', order: 7, isHidden: false },
            { sectionId: 'sec_muri', tenantId: tenantIdString, landingPageId: pageId, type: 'muri', order: 8, isHidden: false },
            { sectionId: 'sec_gallery', tenantId: tenantIdString, landingPageId: pageId, type: 'gallery', order: 9, isHidden: false },
            { sectionId: 'sec_testimonial', tenantId: tenantIdString, landingPageId: pageId, type: 'testimonial', order: 10, isHidden: false },
            { sectionId: 'sec_cta', tenantId: tenantIdString, landingPageId: pageId, type: 'cta', order: 11, isHidden: false },
            { sectionId: 'sec_contact', tenantId: tenantIdString, landingPageId: pageId, type: 'contact', order: 12, isHidden: false }
          ];

          // Seed default contents
          const seedContents: Content[] = [
            { contentId: `${tenantIdString}_sec_hero_title`, tenantId: tenantIdString, sectionId: 'sec_hero', key: 'title', value: 'Mulailah Perjalanan Suci Anda Bersama SAMIRA' },
            { contentId: `${tenantIdString}_sec_hero_badgeText`, tenantId: tenantIdString, sectionId: 'sec_hero', key: 'badgeText', value: 'Biro Perjalanan Terpercaya' },
            { contentId: `${tenantIdString}_sec_hero_description`, tenantId: tenantIdString, sectionId: 'sec_hero', key: 'description', value: 'Rasakan pengalaman ibadah yang nyaman dengan bimbingan terbaik.' },
            
            { contentId: `${tenantIdString}_sec_about_title`, tenantId: tenantIdString, sectionId: 'sec_about', key: 'title', value: 'Pilihan Terbaik untuk Perjalanan Spiritual Anda' },
            { contentId: `${tenantIdString}_sec_about_badgeText`, tenantId: tenantIdString, sectionId: 'sec_about', key: 'badgeText', value: 'Tentang Kami' },
            { contentId: `${tenantIdString}_sec_about_description`, tenantId: tenantIdString, sectionId: 'sec_about', key: 'description', value: 'Kami menyediakan akomodasi hotel dekat dengan masjid dan pemandu mutawwif ahli.' },

            { contentId: `${tenantIdString}_sec_why_umrah_title`, tenantId: tenantIdString, sectionId: 'sec_why_umrah', key: 'title', value: '12 Alasan Mengapa Harus Umroh' },
            { contentId: `${tenantIdString}_sec_why_umrah_badgeText`, tenantId: tenantIdString, sectionId: 'sec_why_umrah', key: 'badgeText', value: 'Keutamaan' },

            { contentId: `${tenantIdString}_sec_finance_title`, tenantId: tenantIdString, sectionId: 'sec_finance', key: 'title', value: 'Mau Umroh Tapi Terkendala Biaya?' },
            { contentId: `${tenantIdString}_sec_finance_badgeText`, tenantId: tenantIdString, sectionId: 'sec_finance', key: 'badgeText', value: 'Solusi Pembiayaan' },

            { contentId: `${tenantIdString}_sec_why_samira_title`, tenantId: tenantIdString, sectionId: 'sec_why_samira', key: 'title', value: 'Mengapa Umroh Bersama Samira Travel' },
            { contentId: `${tenantIdString}_sec_why_samira_badgeText`, tenantId: tenantIdString, sectionId: 'sec_why_samira', key: 'badgeText', value: 'Keunggulan Mitra' },

            { contentId: `${tenantIdString}_sec_service_title`, tenantId: tenantIdString, sectionId: 'sec_service', key: 'title', value: 'Paket Umrah & Haji Terpopuler 2026' },
            { contentId: `${tenantIdString}_sec_service_badgeText`, tenantId: tenantIdString, sectionId: 'sec_service', key: 'badgeText', value: 'Pilihan Paket Utama' },
            { contentId: `${tenantIdString}_sec_service_description`, tenantId: tenantIdString, sectionId: 'sec_service', key: 'description', value: 'Temukan pilihan paket ibadah umrah yang dirancang khusus untuk kenyamanan dan kekhusyukan ibadah keluarga Anda.' },

            { contentId: `${tenantIdString}_sec_faq_title`, tenantId: tenantIdString, sectionId: 'sec_faq', key: 'title', value: 'PENJELASAN PAKET UMROH SAMIRA' },
            { contentId: `${tenantIdString}_sec_faq_badgeText`, tenantId: tenantIdString, sectionId: 'sec_faq', key: 'badgeText', value: 'Informasi Akomodasi' },

            { contentId: `${tenantIdString}_sec_flow_title`, tenantId: tenantIdString, sectionId: 'sec_flow', key: 'title', value: 'Proses Pendaftaran Mudah' },
            { contentId: `${tenantIdString}_sec_flow_badgeText`, tenantId: tenantIdString, sectionId: 'sec_flow', key: 'badgeText', value: 'Cara Kerja' },
            { contentId: `${tenantIdString}_sec_flow_description`, tenantId: tenantIdString, sectionId: 'sec_flow', key: 'description', value: 'Sederhana, cepat, dan transparan dalam 4 langkah mudah.' },

            { contentId: `${tenantIdString}_sec_gallery_title`, tenantId: tenantIdString, sectionId: 'sec_gallery', key: 'title', value: 'Momen Indah Ibadah Jamaah' },
            { contentId: `${tenantIdString}_sec_gallery_badgeText`, tenantId: tenantIdString, sectionId: 'sec_gallery', key: 'badgeText', value: 'Dokumentasi Kegiatan' },

            { contentId: `${tenantIdString}_sec_muri_title`, tenantId: tenantIdString, sectionId: 'sec_muri', key: 'title', value: 'Anugrah Rekor MURI' },
            { contentId: `${tenantIdString}_sec_muri_badgeText`, tenantId: tenantIdString, sectionId: 'sec_muri', key: 'badgeText', value: 'Rekor MURI' },

            { contentId: `${tenantIdString}_sec_testimonial_title`, tenantId: tenantIdString, sectionId: 'sec_testimonial', key: 'title', value: 'Apa Kata Jamaah Yang Telah Beribadah Bersama Kami' },
            { contentId: `${tenantIdString}_sec_testimonial_badgeText`, tenantId: tenantIdString, sectionId: 'sec_testimonial', key: 'badgeText', value: 'Kisah Jamaah' },

            { contentId: `${tenantIdString}_sec_cta_title`, tenantId: tenantIdString, sectionId: 'sec_cta', key: 'title', value: 'Siap Menunaikan Ibadah Umrah Tahun Ini?' },
            { contentId: `${tenantIdString}_sec_cta_description`, tenantId: tenantIdString, sectionId: 'sec_cta', key: 'description', value: 'Dapatkan diskon khusus pendaftaran awal dan konsultasi gratis dengan konsultan ibadah kami.' },

            { contentId: `${tenantIdString}_sec_contact_title`, tenantId: tenantIdString, sectionId: 'sec_contact', key: 'title', value: 'Konsultasi Perjalanan Umrah Anda' },
            { contentId: `${tenantIdString}_sec_contact_badgeText`, tenantId: tenantIdString, sectionId: 'sec_contact', key: 'badgeText', value: 'Hubungi Kami' }
          ];

          // Save batch to targetDb Firestore (Fail-Safe)
          try {
            const batch = writeBatch(targetDb);
            batch.set(doc(targetDb, 'landingPages', pageId), defaultPage);
            seedSections.forEach(s => batch.set(doc(targetDb, 'sections', s.sectionId), s));
            seedContents.forEach(c => batch.set(doc(targetDb, 'contents', c.contentId), c));
            await batch.commit();
          } catch (bErr) {}

          // Load local state
          const contentsMap: Record<string, Record<string, any>> = {
            sec_hero: { title: 'Mulailah Perjalanan Suci Anda Bersama SAMIRA', badgeText: 'Biro Perjalanan Terpercaya', description: 'Rasakan pengalaman ibadah yang nyaman dengan bimbingan terbaik.' },
            sec_about: { title: 'Pilihan Terbaik untuk Perjalanan Spiritual Anda', badgeText: 'Tentang Kami', description: 'Kami menyediakan akomodasi hotel dekat dengan masjid dan pemandu mutawwif ahli.' },
            sec_why_umrah: { title: '12 Alasan Mengapa Harus Umroh', badgeText: 'Keutamaan' },
            sec_finance: { title: 'Mau Umroh Tapi Terkendala Biaya?', badgeText: 'Solusi Pembiayaan' },
            sec_why_samira: { title: 'Mengapa Umroh Bersama Samira Travel', badgeText: 'Keunggulan Mitra' },
            sec_service: { title: 'Paket Umrah & Haji Terpopuler 2026', badgeText: 'Pilihan Paket Utama', description: 'Temukan pilihan paket ibadah umrah yang dirancang khusus untuk kenyamanan dan kekhusyukan ibadah keluarga Anda.' },
            sec_faq: { title: 'PENJELASAN PAKET UMROH SAMIRA', badgeText: 'Informasi Akomodasi' },
            sec_flow: { title: 'Proses Pendaftaran Mudah', badgeText: 'Cara Kerja', description: 'Sederhana, cepat, dan transparan dalam 4 langkah mudah.' },
            sec_gallery: { title: 'Momen Indah Ibadah Jamaah', badgeText: 'Dokumentasi Kegiatan' },
            sec_muri: { title: 'Anugrah Rekor MURI', badgeText: 'Rekor MURI' },
            sec_testimonial: { title: 'Apa Kata Jamaah Yang Telah Beribadah Bersama Kami', badgeText: 'Kisah Jamaah' },
            sec_cta: { title: 'Siap Menunaikan Ibadah Umrah Tahun Ini?', description: 'Dapatkan diskon khusus pendaftaran awal dan konsultasi gratis dengan konsultan ibadah kami.' },
            sec_contact: { title: 'Konsultasi Perjalanan Umrah Anda', badgeText: 'Hubungi Kami' }
          };
          setInitialData(defaultPage, seedSections, contentsMap);
        }

        // 5. Pre-load snapshots
        try {
          const snapRef = collection(resolvedDb, 'tenants', tenantIdString, 'configSnapshots');
          const snapQuery = query(snapRef, orderBy('createdAt', 'desc'));
          const querySnap = await getDocs(snapQuery);
          const list = querySnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : doc.data().createdAt
          }));
          setSnapshots(list);
        } catch (sErr) {}
      } catch (err) {
        console.error('Error during editor initialization:', err);
      } finally {
        setInitLoading(false);
      }
    }

    loadCms();

    return () => {
      if (unsubTenant) unsubTenant();
    };
  }, [tenantId, page]);

  // Publish Page status to Firestore
  const handlePublish = async () => {
    if (!page) return;
    try {
      // Use targetDb from store (already resolved to cluster or default in loadCms)
      const pageRef = doc(targetDb, 'landingPages', page.pageId);
      await updateDoc(pageRef, { status: 'published', updatedAt: new Date() });
      alert('Landing Page berhasil diterbitkan ke publik!');
    } catch (err) {
      console.error(err);
      alert('Gagal menerbitkan halaman.');
    }
  };

  // Fetch snapshots from targetDb subcollection under tenants
  const handleLoadSnapshots = async () => {
    if (!tenantId || !targetDb) return;
    try {
      setIsLoadingSnapshots(true);
      const snapRef = collection(targetDb, 'tenants', tenantId as string, 'configSnapshots');
      const snapQuery = query(snapRef, orderBy('createdAt', 'desc'));
      const querySnap = await getDocs(snapQuery);
      const list = querySnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toLocaleString() : doc.data().createdAt
      }));
      setSnapshots(list);
    } catch (err) {
      console.error('Failed loading snapshots:', err);
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  // Create new configuration snapshot in targetDb
  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId || !targetDb || !page) return;
    const label = snapshotLabel.trim() || `Cadangan Pengaturan ${new Date().toLocaleString()}`;
    
    try {
      setIsCreatingSnapshot(true);
      
      const { sections: currentSections, contents: currentContents } = useCmsStore.getState();
      const snapshotId = `snap_${Date.now()}`;
      
      const snapDocRef = doc(targetDb, 'tenants', tenantId as string, 'configSnapshots', snapshotId);
      
      await setDoc(snapDocRef, {
        snapshotId,
        tenantId,
        label,
        createdAt: serverTimestamp(),
        sections: currentSections,
        contents: currentContents,
      });
      
      setSnapshotLabel('');
      await handleLoadSnapshots();
      alert('✅ Snapshot pengaturan berhasil dibuat!');
    } catch (err: any) {
      console.error('Failed creating snapshot:', err);
      alert('Gagal membuat snapshot: ' + err.message);
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Restore sections and contents state from a snapshot
  const handleRestoreSnapshot = async (snapshot: any) => {
    if (!confirm(`Apakah Anda yakin ingin memulihkan layout dan isi halaman dari cadangan "${snapshot.label}"?\n\nSemua perubahan yang belum terbit akan tertimpa.`)) return;

    try {
      // 1. Update CMS Store local state
      const { setInitialData, page: storePage } = useCmsStore.getState();
      if (!storePage) return;
      
      // Update store and write directly to targetDb Firestore
      setInitialData(storePage, snapshot.sections, snapshot.contents);
      
      // Force autosave right away
      const { saveToFirestore } = useCmsStore.getState();
      await saveToFirestore();
      
      setIsSnapshotModalOpen(false);
      alert('✅ Layout dan konten berhasil dipulihkan dari snapshot!');
      
      // Refresh page display
      window.location.reload();
    } catch (err: any) {
      console.error('Failed restoring snapshot:', err);
      alert('Gagal memulihkan snapshot: ' + err.message);
    }
  };

  // Delete a snapshot
  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus snapshot cadangan ini secara permanen?')) return;
    
    try {
      const snapDocRef = doc(targetDb, 'tenants', tenantId as string, 'configSnapshots', snapshotId);
      await deleteDoc(snapDocRef);
      await handleLoadSnapshots();
    } catch (err: any) {
      console.error('Failed deleting snapshot:', err);
      alert('Gagal menghapus snapshot: ' + err.message);
    }
  };

  if (loading || initLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Menghubungkan ke layanan CMS...</p>
      </div>
    );
  }

  // Not Logged In - Render Auth Screen
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
        <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground p-8 text-center">
            <CardTitle className="text-2xl font-headline font-bold">SAMIRA CMS Builder</CardTitle>
            <CardDescription className="text-white/80">
              {isRegister ? 'Buat akun mitra untuk mendesain Landing Page' : 'Masuk untuk mengelola Landing Page Anda'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAuthSubmit} className="space-y-4" autoComplete="on">
              {isRegister && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="reg-name">Nama Mitra</Label>
                    <Input 
                      id="reg-name" 
                      name="name" 
                      autoComplete="name" 
                      placeholder="Triyadi Yanuar" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-company">Nama Perusahaan / Agen</Label>
                    <Input 
                      id="reg-company" 
                      name="organization" 
                      autoComplete="organization" 
                      placeholder="Samira Travel Karawang" 
                      value={company} 
                      onChange={(e) => setCompany(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-phone">Nomor WhatsApp / HP</Label>
                    <Input 
                      id="reg-phone" 
                      name="tel" 
                      type="tel"
                      autoComplete="tel" 
                      placeholder="083812345678 (otomatis jadi 62838...)" 
                      value={phone} 
                      onChange={handlePhoneChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-subdomain">Subdomain Akses</Label>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-xs font-semibold text-muted-foreground shrink-0">
                        umrohku-samira.my.id/
                      </span>
                      <Input 
                        id="reg-subdomain" 
                        name="username" 
                        autoComplete="username" 
                        placeholder="triyadi" 
                        value={subdomain} 
                        onChange={(e) => setSubdomain(e.target.value)} 
                        required 
                        className="rounded-l-none" 
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  placeholder="nama@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete={isRegister ? "new-password" : "current-password"} 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              {authError && <p className="text-xs text-destructive font-medium">{authError}</p>}

              <Button type="submit" className="w-full h-11 bg-primary text-white rounded-full font-bold hover:bg-accent hover:text-accent-foreground transition-all">
                {isRegister ? 'Daftar Sekarang' : 'Masuk Dashboard'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthError('');
                }}
                className="text-xs font-bold text-accent hover:underline"
              >
                {isRegister ? 'Sudah punya akun? Masuk di sini' : 'Belum punya akun? Daftar di sini'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mapped Builder Workspace
  return (
    <div className="h-screen bg-muted/20 flex flex-col overflow-hidden">
      {/* Editor Navbar header */}
      <header className="h-14 md:h-16 bg-white border-b flex items-center justify-between px-3 md:px-6 z-40 shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <Layout className="h-5 w-5 md:h-6 md:w-6 text-primary shrink-0" />
          <h1 className="font-headline font-bold text-base md:text-lg text-primary whitespace-nowrap">SAMIRA Builder</h1>
          <span className="text-[10px] md:text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md font-bold uppercase hidden sm:block">
            {profile?.role}
          </span>
          
          {tenantProfile && (
            <div className="hidden lg:flex items-center gap-3 ml-4 border-l pl-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800 leading-none">
                  {tenantProfile.name} {tenantProfile.company ? `(${tenantProfile.company})` : ''}
                </span>
                <a 
                  href={`/${tenantProfile.subdomain}`} 
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
                >
                  Lihat: umrohku-samira.my.id/{tenantProfile.subdomain}
                </a>
              </div>

              {/* Realtime Visitor Counter Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs font-sans">
                <Eye className="h-3.5 w-3.5 text-amber-500 animate-pulse shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">
                  {(tenantProfile.visitorCount || 0).toLocaleString()} <span className="font-medium text-amber-700/80 text-[11px]">Pengunjung</span>
                </span>
              </div>

              {/* Subscription Active Period & Renewal Badge */}
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs hover:bg-emerald-100 transition-colors cursor-pointer"
                title="Klik untuk melihat rincian masa aktif & perpanjangan langganan"
              >
                <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">
                  {tenantProfile.expiresAt ? (
                    <>
                      Sisa Masa Aktif: {Math.max(0, Math.ceil((new Date(tenantProfile.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Hari
                    </>
                  ) : (
                    'Sisa Masa Aktif: Gratis 14 Hari'
                  )}
                </span>
                <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full ml-1">
                  Perpanjang
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          {(profile?.role === 'super_admin' || user?.email === 'triyadi72@gmail.com') && (
            <Link href="/supa">
              <Button 
                variant="outline" 
                className="rounded-full text-xs font-bold border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white hidden md:flex items-center gap-2 h-9 px-4 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" /> <span className="hidden lg:block">Portal Super Admin</span>
              </Button>
            </Link>
          )}

          {tenantProfile && (
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              className="rounded-full text-xs font-bold border-primary/30 text-primary hover:bg-primary hover:text-white hidden sm:flex items-center gap-1.5 h-9 px-3 shadow-sm"
            >
              <Share2 className="h-4 w-4" /> <span className="hidden lg:block">Bagikan</span>
            </Button>
          )}

          {tenantProfile && (
            <Button
              onClick={() => {
                handleLoadSnapshots();
                setIsSnapshotModalOpen(true);
              }}
              variant="outline"
              className="rounded-full text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 hidden sm:flex items-center gap-1.5 h-9 px-3.5 shadow-sm"
              title="Kelola Cadangan & Riwayat Pengaturan"
            >
              <History className="h-4 w-4 shrink-0 text-indigo-500" />
              <span className="hidden lg:block">Snapshot</span>
            </Button>
          )}

          <Button 
            onClick={handlePublish}
            className="bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold px-4 md:px-6 h-9 rounded-full flex gap-1.5 text-xs md:text-sm"
          >
            <Check className="h-4 w-4" /> <span className="hidden sm:block">Terbitkan</span>
          </Button>

          {profile?.role !== 'super_admin' && user?.email !== 'triyadi72@gmail.com' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(true);
                setDeletePassword('');
                setDeleteError('');
              }}
              className="rounded-full text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hidden md:flex items-center gap-1.5 h-9 px-3 shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9"
            onClick={async () => {
              await signOut(auth);
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/dashboard';
              }
            }}
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Subdomain & Account Info Banner */}
      {tenantProfile && (
        <div className="md:hidden bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between gap-2 border-b border-slate-800 shadow-md">
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-amber-300 truncate">
                {tenantProfile.name}
              </span>
              {tenantProfile.company && (
                <span className="text-[10px] text-slate-400 truncate">
                  ({tenantProfile.company})
                </span>
              )}
            </div>
            <a
              href={`/${tenantProfile.subdomain}`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono text-slate-300 hover:text-white truncate flex items-center gap-1 mt-0.5"
            >
              <ExternalLink className="h-3 w-3 shrink-0 text-amber-400" /> umrohku-samira.my.id/{tenantProfile.subdomain}
            </a>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsSubscriptionModalOpen(true)}
                className="text-[9px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 flex items-center gap-1 leading-none cursor-pointer"
              >
                <Clock className="h-2.5 w-2.5 shrink-0 text-emerald-400" />
                <span>
                  {tenantProfile.expiresAt ? (
                    `Sisa Masa Aktif: ${Math.max(0, Math.ceil((new Date(tenantProfile.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Hari`
                  ) : (
                    'Sisa Masa Aktif: Gratis 14 Hari'
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Realtime Visitor Counter Badge */}
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] font-bold">
              <Eye className="h-3 w-3 text-amber-400 animate-pulse" />
              <span>{(tenantProfile.visitorCount || 0).toLocaleString()}</span>
            </div>

            {/* Button Bagikan */}
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold text-xs rounded-full h-7.5 px-3 flex items-center gap-1 shadow-md"
            >
              <Share2 className="h-3 w-3" /> Bagikan
            </Button>

            {/* Button Snapshot */}
            <Button
              onClick={() => {
                handleLoadSnapshots();
                setIsSnapshotModalOpen(true);
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-700 font-extrabold text-xs rounded-full h-7.5 px-3 flex items-center gap-1 shadow-md"
            >
              <History className="h-3 w-3" /> Snapshot
            </Button>
          </div>
        </div>
      )}

      {/* Editor Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Sidebar: full screen on mobile when mobileTab='edit', hidden when mobileTab='preview' */}
        <div className={`
          h-full flex flex-col
          md:w-80 md:shrink-0 md:block
          ${mobileTab === 'edit' ? 'flex w-full' : 'hidden'}
          md:flex
        `}>
          <EditorSidebar />
        </div>

        {/* Canvas: full screen on mobile when mobileTab='preview', hidden when mobileTab='edit' */}
        <div className={`
          h-full flex-1 min-w-0
          ${mobileTab === 'preview' ? 'flex' : 'hidden'}
          md:flex
        `}>
          <EditorCanvas />
        </div>
      </div>

      {/* Mobile Bottom Tab Bar – only visible on mobile/tablet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg flex">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-bold transition-colors ${
            mobileTab === 'edit'
              ? 'text-primary bg-primary/5 border-t-2 border-primary'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <PenLine className="h-5 w-5" />
          Edit Konten
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-bold transition-colors ${
            mobileTab === 'preview'
              ? 'text-primary bg-primary/5 border-t-2 border-primary'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Monitor className="h-5 w-5" />
          Pratinjau Web
        </button>
      </div>

      {/* Modal Dialog Hapus Akun Mandiri */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full rounded-3xl bg-white border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-red-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-2xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Hapus Akun Permanen</CardTitle>
                  <CardDescription className="text-xs text-white/80">
                    Verifikasi keamanan dengan kata sandi Anda.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 leading-relaxed font-medium space-y-1">
                <p className="font-bold flex items-center gap-1 text-red-900">
                  <UserX className="h-4 w-4 text-red-600" /> Peringatan Tindakan Permanen:
                </p>
                <p>
                  Seluruh profil akun Anda, subdomain, desain Landing Page, seksi, serta testimoni jamaah akan <strong>dihapus secara permanen dari basis data</strong>. Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-primary" /> Masukkan Kata Sandi Anda untuk Konfirmasi *
                  </Label>
                  <Input 
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="rounded-2xl text-xs h-10 border-slate-300 focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                {deleteError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {deleteError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeletingAccount}
                    className="rounded-full text-xs font-bold h-9 px-4 border-slate-300"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isDeletingAccount}
                    className="rounded-full text-xs font-bold h-9 px-5 bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center gap-1.5"
                  >
                    {isDeletingAccount ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" /> Hapus Akun Permanen
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Modal Dialog Bagikan Subdomain */}
      {showShareModal && tenantProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none overflow-hidden">
            <CardHeader className="bg-primary text-white p-6 relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Share2 className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-xl font-headline font-bold">Bagikan Landing Page</CardTitle>
                  <CardDescription className="text-white/80 text-xs mt-0.5">
                    Sebarkan tautan website resmi Anda kepada calon jamaah & pelanggan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Tautan URL Subdomain Card */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Tautan Subdomain Resmi Anda</Label>
                <div className="flex gap-2">
                  <Input 
                    readOnly
                    value={`https://umrohku-samira.my.id/${tenantProfile.subdomain}`}
                    className="font-mono text-xs bg-slate-50 font-semibold text-primary rounded-2xl h-11 border-slate-200"
                  />
                  <Button 
                    onClick={() => {
                      const shareUrl = `https://umrohku-samira.my.id/${tenantProfile.subdomain}`;
                      navigator.clipboard.writeText(shareUrl);
                      setCopiedShare(true);
                      setTimeout(() => setCopiedShare(false), 2500);
                    }}
                    className="rounded-2xl h-11 px-4 bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold text-xs shrink-0 flex gap-1.5"
                  >
                    {copiedShare ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copiedShare ? 'Tersalin!' : 'Salin Link'}
                  </Button>
                </div>
              </div>

              {/* Quick Share Buttons */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Bagikan Langsung ke Media Sosial</Label>
                <div className="grid grid-cols-3 gap-3">
                  {/* WhatsApp */}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Assalamu'alaikum, buka landing page resmi Umroh & Haji kami di:\nhttps://umrohku-samira.my.id/${tenantProfile.subdomain}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold gap-1.5"
                  >
                    <span className="text-lg">💬</span>
                    <span>WhatsApp</span>
                  </a>

                  {/* Facebook */}
                  <a 
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://umrohku-samira.my.id/${tenantProfile.subdomain}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold gap-1.5"
                  >
                    <span className="text-lg">📘</span>
                    <span>Facebook</span>
                  </a>

                  {/* Buka Web */}
                  <a 
                    href={`/${tenantProfile.subdomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 hover:bg-primary hover:text-white transition-all text-xs font-bold gap-1.5"
                  >
                    <ExternalLink className="h-5 w-5" />
                    <span>Buka Web</span>
                  </a>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <div className="inline-flex items-center gap-2 p-3 bg-slate-50 border rounded-2xl mb-2">
                  <QrCode className="h-6 w-6 text-primary" />
                  <span className="text-xs font-bold text-slate-700">QR Code Halaman Website</span>
                </div>
                <div className="flex justify-center p-3 bg-white border border-slate-200 rounded-2xl w-fit mx-auto shadow-sm">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`https://umrohku-samira.my.id/${tenantProfile.subdomain}`)}`} 
                    alt="QR Code Subdomain" 
                    className="w-36 h-36"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">Scan QR Code ini untuk membuka website langsung di HP</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={() => setShowShareModal(false)}
                  className="rounded-full px-6 font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Dialog Snapshot Settings & Backup History */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none overflow-hidden animate-in fade-in zoom-in duration-200">
            <CardHeader className="bg-indigo-600 text-white p-6 relative">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <History className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline font-bold">Snapshot & Riwayat Pengaturan</CardTitle>
                  <CardDescription className="text-white/80 text-xs mt-0.5">
                    Cadangkan dan pulihkan seluruh layout seksi serta konten halaman kapan saja secara aman.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Form Create New Snapshot */}
              <form onSubmit={handleCreateSnapshot} className="space-y-2 pb-4 border-b">
                <Label className="text-xs font-bold text-slate-700">Buat Cadangan Pengaturan Baru</Label>
                <div className="flex gap-2">
                  <Input 
                    value={snapshotLabel}
                    onChange={(e) => setSnapshotLabel(e.target.value)}
                    placeholder="Contoh: Sebelum bersihkan duplikat / Desain A"
                    className="text-xs rounded-2xl h-10 border-slate-200"
                    required
                    disabled={isCreatingSnapshot}
                  />
                  <Button 
                    type="submit"
                    disabled={isCreatingSnapshot}
                    className="rounded-2xl h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-sm"
                  >
                    {isCreatingSnapshot ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan
                  </Button>
                </div>
              </form>

              {/* List Existing Snapshots */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Daftar Riwayat Cadangan ({snapshots.length})</Label>
                {isLoadingSnapshots ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Memuat riwayat cadangan...
                  </div>
                ) : snapshots.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed text-xs text-slate-500">
                    Belum ada snapshot tersimpan. Silakan simpan cadangan pertama Anda di atas.
                  </div>
                ) : (
                  <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                    {snapshots.map((snap) => (
                      <div key={snap.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 border rounded-2xl flex items-center justify-between gap-3 transition-colors">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate" title={snap.label}>
                            {snap.label}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            ⏰ {snap.createdAt} • {(snap.sections || []).length} Seksi
                          </p>
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            type="button"
                            onClick={() => handleRestoreSnapshot(snap)}
                            className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-full font-bold text-[10px] h-7 px-3 border border-indigo-200 transition-all"
                          >
                            Restore
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleDeleteSnapshot(snap.id)}
                            variant="ghost"
                            className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full font-bold text-[10px] h-7 w-7 p-0 shrink-0"
                            title="Hapus Cadangan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button 
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="rounded-full px-6 font-bold text-xs bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscription Active Period & Renewal Info Modal */}
      {isSubscriptionModalOpen && tenantProfile && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-headline font-bold">Informasi Langganan & Masa Aktif</CardTitle>
                    <CardDescription className="text-slate-300 text-xs">
                      Detail status akun, sisa hari aktif, dan opsi perpanjangan.
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="text-slate-400 hover:text-white rounded-full"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 border rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Status Masa Aktif</span>
                  <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    {tenantProfile.status === 'suspended' 
                      ? 'Tidak Aktif' 
                      : (tenantProfile.plan && tenantProfile.plan !== 'free' 
                          ? `Aktif (${tenantProfile.plan.toUpperCase()})` 
                          : 'Aktif (Masa Trial)')}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Sisa Masa Aktif</span>
                  <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                    {tenantProfile.expiresAt ? (
                      `${Math.max(0, Math.ceil((new Date(tenantProfile.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Hari`
                    ) : (
                      'Gratis 14 Hari'
                    )}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl text-left space-y-1.5">
                <span className="text-xs font-bold text-amber-900 block">🗓️ Tanggal Berakhir Masa Aktif:</span>
                <p className="text-xs font-mono font-bold text-amber-800">
                  {tenantProfile.expiresAt ? new Date(tenantProfile.expiresAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : '14 Hari Sejak Pendaftaran'}
                </p>
                <p className="text-[11px] text-amber-700 leading-relaxed pt-1 border-t border-amber-200">
                  Layanan gratis aktif selama 14 hari pertama. Lakukan perpanjangan langganan secara berkala untuk menjaga website dan subdomain Anda tetap terpublikasi 24/7.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=6283815862300&text=${encodeURIComponent(
                    `Halo Admin Samira, saya ingin memperpanjang masa aktif langganan akun website:\nNama: ${tenantProfile.name || '-'}\nSubdomain: ${tenantProfile.subdomain || '-'}\nEmail: ${tenantProfile.email || '-'}\nMohon informasi perpanjangan langganan.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
                >
                  <Clock className="w-4 h-4" /> Perpanjang Masa Aktif Langganan
                </a>

                <Button 
                  onClick={() => setIsSubscriptionModalOpen(false)}
                  className="w-full rounded-2xl py-3 font-bold text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
                >
                  Tutup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expired / Suspended Account Modal Overlay */}
      {isTenantExpired && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none overflow-hidden text-center">
            <CardHeader className="bg-amber-600 text-white p-6 relative">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/20">
                <AlertTriangle className="h-8 w-8 text-amber-200 animate-bounce" />
              </div>
              <CardTitle className="text-xl font-headline font-bold">Masa Aktif Halaman Berakhir</CardTitle>
              <CardDescription className="text-white/90 text-xs mt-1">
                Masa aktif langganan untuk subdomain <strong className="underline">{tenantProfile?.subdomain}</strong> telah selesai.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span>Status Subdomain:</span>
                  <span className="bg-amber-600 text-white px-2.5 py-0.5 rounded-full uppercase text-[10px] font-extrabold">Tidak Aktif</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Subdomain Anda saat ini sedang tidak aktif. Untuk mempublikasikan kembali website Anda, silakan lakukan perpanjangan langganan di bawah ini.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href={`https://api.whatsapp.com/send?phone=6283815862300&text=${encodeURIComponent(
                    `Halo Admin Samira, saya ingin memperpanjang masa aktif akun landing page:\nNama: ${tenantProfile?.name || '-'}\nSubdomain: ${tenantProfile?.subdomain || '-'}\nEmail: ${tenantProfile?.email || '-'}\nMohon diproses perpanjangan langganan.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95"
                >
                  <Clock className="w-4 h-4" /> Perpanjang Langganan
                </a>
              </div>

              <div className="pt-3 border-t flex justify-center">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await signOut(auth);
                    if (typeof window !== 'undefined') {
                      localStorage.clear();
                      sessionStorage.clear();
                      window.location.href = '/dashboard';
                    }
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-red-600 rounded-full px-4"
                >
                  <LogOut className="h-4 w-4 mr-1.5" /> Keluar Akun
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Floating Developer Support WhatsApp Widget */}
      {user && (
        <a
          href={`https://api.whatsapp.com/send?phone=6283815862300&text=${encodeURIComponent(
            `Assalamu'alaikum Pengembang Samira Builder, saya ingin bertanya mengenai dashboard mitra:\nNama Mitra: ${tenantProfile?.name || '-'}\nSubdomain: ${tenantProfile?.subdomain || '-'}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-20 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 md:py-3.5 md:px-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 group border border-emerald-500/20"
          title="Hubungi Layanan Support Pengembang"
        >
          <MessageCircle className="h-5 w-5 shrink-0 text-white animate-pulse" />
          <div className="flex flex-col items-start leading-none max-w-0 overflow-hidden group-hover:max-w-[200px] transition-all duration-300 ease-out whitespace-nowrap hidden md:flex">
            <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-200 mb-0.5">Layanan Support</span>
            <span className="text-[11px] font-extrabold">Hubungi Developer</span>
          </div>
          <span className="text-[10px] font-extrabold md:hidden whitespace-nowrap">Support</span>
        </a>
      )}
    </div>
  );
}
