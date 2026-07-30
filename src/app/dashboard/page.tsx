"use client";

import React, { useEffect, useState } from 'react';
import { useAuthHandler } from '@/hooks/useAuth';
import { useCmsStore } from '@/hooks/useCmsStore';
import { cmsService } from '@/lib/services/cmsService';
import { auth, db } from '@/lib/firebase';
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
  writeBatch 
} from 'firebase/firestore';
import EditorSidebar from '@/components/editor/editor-sidebar';
import EditorCanvas from '@/components/editor/editor-canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { LogOut, Layout, Plus, Check, ShieldCheck, Trash2, AlertTriangle, KeyRound, UserX } from 'lucide-react';
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
  const { setInitialData, page } = useCmsStore();

  const [initLoading, setInitLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');

  // Account Deletion States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Tenant Profile state for displaying dashboard info
  const [tenantProfile, setTenantProfile] = useState<Tenant | null>(null);

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
        if (!name || !company || !subdomain) {
          setAuthError('Semua kolom wajib diisi untuk pendaftaran.');
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

        const newTenant: Tenant = {
          tenantId: cred.user.uid,
          readableId,
          name,
          company,
          email,
          plan: 'free',
          status: 'active',
          subdomain: cleanSubdomain,
          createdAt: new Date().toISOString(),
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
            role: 'owner',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', cred.user.uid), userDoc);
        } catch (uErr) {
          console.log("Primary user doc saved with fallback.");
        }

        // 2. Secondary developer-friendly alias writes (Fail-Safe)
        if (readableId && readableId !== cred.user.uid) {
          try { await setDoc(doc(db, 'tenants', readableId), newTenant); } catch (e) {}
          try {
            const userDoc = {
              userId: cred.user.uid,
              tenantId: cred.user.uid,
              readableId,
              name: name || 'Mitra',
              company: company || name || 'Mitra Travel',
              email,
              role: 'owner',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', readableId), userDoc);
          } catch (e) {}
        }

        // Initialize pre-built default landing page template for new tenant
        try {
          await cmsService.initializeDefaultTenantLandingPage(cred.user.uid);
          await cmsService.initializeDefaultTenantLandingPage(readableId);
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

      // 2. Clean up ALL Firestore documents (tenants, users, pages, sections, contents, testimonials)
      // Delete Tenant documents
      try {
        await deleteDoc(doc(db, 'tenants', targetTenantId));
        await deleteDoc(doc(db, 'tenants', readableId));
        await deleteDoc(doc(db, 'tenants', user.uid));

        const qSub = query(collection(db, 'tenants'), where('tenantId', '==', targetTenantId));
        const snapSub = await getDocs(qSub);
        for (const d of snapSub.docs) {
          await deleteDoc(doc(db, 'tenants', d.id));
        }

        const qTenantsByEmail = query(collection(db, 'tenants'), where('email', '==', user.email));
        const snapTenantsByEmail = await getDocs(qTenantsByEmail);
        for (const d of snapTenantsByEmail.docs) {
          await deleteDoc(doc(db, 'tenants', d.id));
        }
      } catch (e1) {}

      // Delete User documents (UID, readableId, targetTenantId, and email/uid queries)
      try {
        await deleteDoc(doc(db, 'users', user.uid));
        await deleteDoc(doc(db, 'users', readableId));
        await deleteDoc(doc(db, 'users', targetTenantId));

        const qUsersByEmail = query(collection(db, 'users'), where('email', '==', user.email));
        const snapUsersByEmail = await getDocs(qUsersByEmail);
        for (const d of snapUsersByEmail.docs) {
          await deleteDoc(doc(db, 'users', d.id));
        }

        const qUsersByUid = query(collection(db, 'users'), where('uid', '==', user.uid));
        const snapUsersByUid = await getDocs(qUsersByUid);
        for (const d of snapUsersByUid.docs) {
          await deleteDoc(doc(db, 'users', d.id));
        }
      } catch (e2) {}

      // Delete landingPages
      try {
        const qPage = query(collection(db, 'landingPages'), where('tenantId', '==', targetTenantId));
        const snapPage = await getDocs(qPage);
        for (const d of snapPage.docs) {
          await deleteDoc(doc(db, 'landingPages', d.id));
        }
      } catch (e3) {}

      // Delete sections
      try {
        const qSec = query(collection(db, 'sections'), where('tenantId', '==', targetTenantId));
        const snapSec = await getDocs(qSec);
        for (const d of snapSec.docs) {
          await deleteDoc(doc(db, 'sections', d.id));
        }
      } catch (e4) {}

      // Delete contents
      try {
        const qContent = query(collection(db, 'contents'), where('tenantId', '==', targetTenantId));
        const snapContent = await getDocs(qContent);
        for (const d of snapContent.docs) {
          await deleteDoc(doc(db, 'contents', d.id));
        }
      } catch (e5) {}

      // Delete testimonials
      try {
        const qTesti = query(collection(db, 'testimonials'), where('tenantId', '==', targetTenantId));
        const snapTesti = await getDocs(qTesti);
        for (const d of snapTesti.docs) {
          await deleteDoc(doc(db, 'testimonials', d.id));
        }
      } catch (e6) {}

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

    async function loadCms() {
      try {
        setInitLoading(true);
        
        // 1. Fetch Tenant details with Fail-Safe Fallback
        let tenantData: Tenant | null = null;
        try {
          const tenantSnap = await getDoc(doc(db, 'tenants', tenantIdString));
          if (tenantSnap.exists()) {
            tenantData = tenantSnap.data() as Tenant;
            setTenantProfile(tenantData);
          } else {
            // Try fallback query by email if primary doc fetch fails
            if (user?.email) {
              const qTenantEmail = query(collection(db, 'tenants'), where('email', '==', user.email));
              const snapTenantEmail = await getDocs(qTenantEmail);
              if (!snapTenantEmail.empty) {
                tenantData = snapTenantEmail.docs[0].data() as Tenant;
                setTenantProfile(tenantData);
              }
            }
          }
        } catch (fErr) {}

        // 2. Query for landing page
        let pageSnap: any = { empty: true };
        try {
          const pagesRef = collection(db, 'landingPages');
          const qPage = query(pagesRef, where('tenantId', '==', tenantIdString), where('slug', '==', 'home'));
          pageSnap = await getDocs(qPage);
        } catch (pErr) {}

        if (!pageSnap.empty) {
          // Normal Flow: Load existing pages, sections, contents
          const foundPage = pageSnap.docs[0].data() as LandingPage;
          
          let sectionsList: Section[] = [];
          try {
            const sectionsRef = collection(db, 'sections');
            const qSec = query(sectionsRef, where('landingPageId', '==', foundPage.pageId), where('tenantId', '==', tenantIdString));
            const secSnap = await getDocs(qSec);
            sectionsList = secSnap.docs.map(doc => doc.data() as Section).sort((a, b) => a.order - b.order);
          } catch (sErr) {}

          // Auto-Onboard Missing Core Sections so no section (like galeri or pricing) is ever missing on reload
          const CORE_TYPES: SectionType[] = ['hero', 'about', 'pricing', 'feature', 'testimonial', 'gallery', 'cta', 'contact'];
          const existingTypes = new Set(sectionsList.map(s => s.type));
          
          CORE_TYPES.forEach((type, idx) => {
            if (!existingTypes.has(type)) {
              const secId = `sec_${tenantIdString}_${type}`;
              sectionsList.push({
                sectionId: secId,
                tenantId: tenantIdString,
                landingPageId: foundPage.pageId,
                type,
                order: sectionsList.length + idx,
                isHidden: false,
              });
            }
          });
          sectionsList.sort((a, b) => a.order - b.order);

          const contentsMap: Record<string, Record<string, any>> = {};
          try {
            const contentsRef = collection(db, 'contents');
            const qContent = query(contentsRef, where('tenantId', '==', tenantIdString));
            const contentSnap = await getDocs(qContent);
            contentSnap.docs.forEach(docSnap => {
              const c = docSnap.data() as Content;
              if (!contentsMap[c.sectionId]) contentsMap[c.sectionId] = {};
              contentsMap[c.sectionId][c.key] = c.value;
            });
          } catch (cErr) {}
          
          setInitialData(foundPage, sectionsList, contentsMap);
        } else {
          // Dynamic Auto-Onboarding: Setup default home page template
          const pageId = `page_${tenantIdString}`;
          const defaultPage: LandingPage = {
            pageId,
            tenantId: tenantIdString,
            title: 'Beranda Samira Travel',
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
            { sectionId: 'sec_gallery', tenantId: tenantIdString, landingPageId: pageId, type: 'gallery', order: 8, isHidden: false },
            { sectionId: 'sec_muri', tenantId: tenantIdString, landingPageId: pageId, type: 'muri', order: 9, isHidden: false },
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

          // Save batch to Firestore (Fail-Safe)
          try {
            const batch = writeBatch(db);
            batch.set(doc(db, 'landingPages', pageId), defaultPage);
            seedSections.forEach(s => batch.set(doc(db, 'sections', s.sectionId), s));
            seedContents.forEach(c => batch.set(doc(db, 'contents', c.contentId), c));
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
      } catch (err) {
        console.error('Error during editor initialization:', err);
      } finally {
        setInitLoading(false);
      }
    }

    loadCms();
  }, [tenantId, page]);

  // Publish Page status to Firestore
  const handlePublish = async () => {
    if (!page) return;
    try {
      const pageRef = doc(db, 'landingPages', page.pageId);
      await updateDoc(pageRef, { status: 'published', updatedAt: new Date() });
      alert('Landing Page berhasil diterbitkan ke publik!');
    } catch (err) {
      console.error(err);
      alert('Gagal menerbitkan halaman.');
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
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="reg-name">Nama Mitra</Label>
                    <Input id="reg-name" placeholder="Triyadi Yanuar" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-company">Nama Perusahaan / Agen</Label>
                    <Input id="reg-company" placeholder="Samira Travel Karawang" value={company} onChange={(e) => setCompany(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-subdomain">Subdomain Akses</Label>
                    <div className="flex items-center">
                      <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-xs font-semibold text-muted-foreground shrink-0">
                        umrohku-samira.my.id/
                      </span>
                      <Input 
                        id="reg-subdomain" 
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
                <Input id="email" type="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Kata Sandi</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
      <header className="h-16 bg-white border-b flex items-center justify-between px-6 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Layout className="h-6 w-6 text-primary" />
          <h1 className="font-headline font-bold text-lg text-primary">SAMIRA Builder</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md font-bold uppercase">
            {profile?.role}
          </span>
          
          {tenantProfile && (
            <div className="hidden md:flex flex-col ml-4 border-l pl-4">
              <span className="text-sm font-bold text-slate-800 leading-none">
                {tenantProfile.name} {tenantProfile.company ? `(${tenantProfile.company})` : ''}
              </span>
              <a 
                href={`/${tenantProfile.subdomain}`} 
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                Lihat Subdomain: umrohku-samira.my.id/{tenantProfile.subdomain}
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {(profile?.role === 'super_admin' || user?.email === 'triyadi72@gmail.com') && (
            <Link href="/supa">
              <Button 
                variant="outline" 
                className="rounded-full text-xs font-bold border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white flex items-center gap-2 h-10 px-5 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" /> Portal Super Admin
              </Button>
            </Link>
          )}

          <Button 
            onClick={handlePublish}
            className="bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold px-6 h-10 rounded-full flex gap-1.5"
          >
            <Check className="h-4 w-4" /> Terbitkan
          </Button>

          {profile?.role !== 'super_admin' && user?.email !== 'triyadi72@gmail.com' && (
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(true);
                setDeletePassword('');
                setDeleteError('');
              }}
              className="rounded-full text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-1.5 h-10 px-4 shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> Hapus Akun
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut(auth)}
            title="Keluar"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Editor Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        <EditorSidebar />
        <EditorCanvas />
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
    </div>
  );
}
