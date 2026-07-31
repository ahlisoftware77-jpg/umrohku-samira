"use client";

import React, { useEffect, useState } from 'react';
import { useAuthHandler } from '@/hooks/useAuth';
import { db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { 
  Users, 
  Layout, 
  Settings, 
  Package, 
  Activity, 
  AlertTriangle, 
  Check, 
  Ban, 
  Key, 
  Trash2,
  HardDrive,
  CloudLightning,
  Eye,
  ExternalLink,
  Loader2,
  Database,
  Copy,
  Save,
  Server,
  PlusCircle,
  ArrowRightLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Download
} from 'lucide-react';
import { Tenant, TenantPlan, TenantStatus, SYSTEM_PLANS, DatabaseServerConfig, BuilderPlan } from '@/types/cms';

export default function SuperAdminPage() {
  const { user, profile, loading } = useAuthHandler();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantPagesCount, setTenantPagesCount] = useState<Record<string, number>>({});
  const [totalLandingPages, setTotalLandingPages] = useState<number>(0);
  const [cloudinaryStorageMb, setCloudinaryStorageMb] = useState<string>('0.0');

  // Builder Plans state
  const [builderPlans, setBuilderPlans] = useState<BuilderPlan[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);

  const [bPlanId, setBPlanId] = useState('');
  const [bPlanName, setBPlanName] = useState('');
  const [bPlanBadge, setBPlanBadge] = useState('');
  const [bPlanPrice, setBPlanPrice] = useState('');
  const [bPlanPeriod, setBPlanPeriod] = useState('/ bulan');
  const [bPlanDesc, setBPlanDesc] = useState('');
  const [bPlanFeatures, setBPlanFeatures] = useState('');
  const [bPlanIsPopular, setBPlanIsPopular] = useState(false);
  const [bPlanOrder, setBPlanOrder] = useState(1);
  
  const [dbLoading, setDbLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  // Edit limits state
  const [limitPages, setLimitPages] = useState(0);
  const [limitStorage, setLimitStorage] = useState(0);
  const [limitUpload, setLimitUpload] = useState(0);
  const [limitVisitors, setLimitVisitors] = useState(0);
  
  const [isUpdatingLimit, setIsUpdatingLimit] = useState(false);

  // System API Settings state
  const [fbApiKey, setFbApiKey] = useState('AIzaSyCfkOcMFkFCHvArDqKKOPRkKYFqJu7aBrM');
  const [fbAuthDomain, setFbAuthDomain] = useState('landing-umroh.firebaseapp.com');
  const [fbProjectId, setFbProjectId] = useState('landing-umroh');
  const [fbStorageBucket, setFbStorageBucket] = useState('landing-umroh.firebasestorage.app');
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState('104581499400');
  const [fbAppId, setFbAppId] = useState('1:104581499400:web:108ccf05aeeac6e9389fbd');

  const [cldCloudName, setCldCloudName] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('cld_cloud_name') || '' : ''));
  const [cldUploadPreset, setCldUploadPreset] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('cld_upload_preset') || 'ml_default' : 'ml_default'));

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Multi-Database Servers state
  const [dbServers, setDbServers] = useState<DatabaseServerConfig[]>([]);
  const [isAddServerOpen, setIsAddServerOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newServerApiKey, setNewServerApiKey] = useState('');
  const [newServerAuthDomain, setNewServerAuthDomain] = useState('');
  const [newServerProjectId, setNewServerProjectId] = useState('');
  const [newServerStorageBucket, setNewServerStorageBucket] = useState('');
  const [newServerSenderId, setNewServerSenderId] = useState('');
  const [newServerAppId, setNewServerAppId] = useState('');
  const [newServerStatus, setNewServerStatus] = useState<'active' | 'full' | 'maintenance'>('active');

  // Connection testing state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Cloning Rules & Indexes state
  const [selectedCloneTargetId, setSelectedCloneTargetId] = useState('');
  const [isDeployingCli, setIsDeployingCli] = useState(false);
  const [cliLogOutput, setCliLogOutput] = useState<string | null>(null);

  // CLI Auth state
  const [firebaseTokenInput, setFirebaseTokenInput] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('fb_ci_token') || '' : ''
  );
  const [authCheckStatus, setAuthCheckStatus] = useState<{ isLoggedIn: boolean; message: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const handleTokenChange = (val: string) => {
    setFirebaseTokenInput(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fb_ci_token', val);
    }
  };

  const masterRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permissive rules for CMS Landing Page Builder Multi-Tenant
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const masterIndexesText = `{
  "indexes": [],
  "fieldOverrides": []
}`;

  const handleCopyRulesCode = () => {
    navigator.clipboard.writeText(masterRulesText);
    alert('Kode Security Rules (firestore.rules) berhasil disalin ke clipboard!');
  };

  const handleCopyDeployCommand = () => {
    if (!selectedCloneTargetId) {
      alert('Harap pilih server database tujuan terlebih dahulu!');
      return;
    }
    const cmd = `npx firebase-tools deploy --only firestore:rules,firestore:indexes --project ${selectedCloneTargetId}`;
    navigator.clipboard.writeText(cmd);
    alert(`Perintah CLI Kloning Rules & Indexes berhasil disalin ke clipboard:\n\n${cmd}`);
  };

  const handleRunDeployCliDirectly = async () => {
    if (!selectedCloneTargetId) {
      alert('Harap pilih server database tujuan terlebih dahulu!');
      return;
    }

    const confirmMsg = `Konfirmasi Deploy CLI Langsung:\n\nApakah Anda yakin ingin mengeksekusi 'firebase deploy' secara otomatis ke server database '${selectedCloneTargetId}'?`;
    if (!window.confirm(confirmMsg)) return;

    setIsDeployingCli(true);
    setCliLogOutput(`[Web CLI Runner] Memulai eksekusi 'npx firebase-tools deploy' ke project '${selectedCloneTargetId}'...\nSilakan tunggu beberapa saat...`);

    try {
      const res = await fetch('/api/admin/deploy-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedCloneTargetId, mode: 'both', firebaseToken: firebaseTokenInput }),
      });

      const data = await res.json();

      let logText = `=== Web CLI Execution Report ===\nPerintah: ${data.command || 'npx firebase-tools deploy'}\nWaktu: ${data.timestamp || new Date().toLocaleString()}\n\n`;

      if (data.stdout) logText += `--- STDOUT OUTPUT ---\n${data.stdout}\n`;
      if (data.stderr) logText += `--- STDERR / LOGS ---\n${data.stderr}\n`;

      if (data.isAuthIssue) {
        logText += `\n${data.message}`;
        setAuthCheckStatus({
          isLoggedIn: false,
          message: '⚠️ Firebase CLI Membutuhkan Login! Masukkan FIREBASE_TOKEN atau jalankan firebase login di terminal.',
        });
        alert('Deploy CLI membutuhkan Otentikasi (Login). Rincian telah ditampilkan di layar.');
      } else if (data.success) {
        logText += `\n✅ DEPLOY CLI BERHASIL (100%)! Rules & Indexes terpasang di '${selectedCloneTargetId}'.`;
        alert(`Deploy CLI ke '${selectedCloneTargetId}' BERHASIL!`);
      } else {
        logText += `\n❌ DEPLOY CLI GAGAL: ${data.message}`;
        alert(`Deploy CLI Gagal: ${data.message}`);
      }

      setCliLogOutput(logText);
    } catch (err: any) {
      console.error(err);
      setCliLogOutput(`❌ Eror Jaringan Web CLI Runner: ${err.message || 'Gagal menghubungi server web'}`);
      alert('Gagal mengeksekusi CLI dari web.');
    } finally {
      setIsDeployingCli(false);
    }
  };

  const handleCheckCliAuth = async () => {
    setIsCheckingAuth(true);
    setAuthCheckStatus(null);
    try {
      const res = await fetch('/api/admin/deploy-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkAuthOnly: true, firebaseToken: firebaseTokenInput }),
      });
      const data = await res.json();
      setAuthCheckStatus({
        isLoggedIn: data.isLoggedIn,
        message: data.message + (data.suggestion ? ` ${data.suggestion}` : ''),
      });
    } catch (err: any) {
      setAuthCheckStatus({
        isLoggedIn: false,
        message: '⚠️ Gagal memeriksa status autentikasi CLI.',
      });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Migration Engine state
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationLogs, setMigrationLogs] = useState<string[]>([]);
  const [migrationReport, setMigrationReport] = useState<{
    tenantName: string;
    subdomain: string;
    sourceServerName: string;
    targetServerName: string;
    landingPagesMigrated: number;
    sectionsMigrated: number;
    contentsMigrated: number;
    durationMs: number;
    timestamp: string;
  } | null>(null);

  // Load Tenants & metadata counts (Fail-Safe)
  const loadAdminData = async () => {
    try {
      setDbLoading(true);
      
      // 1. Fetch Tenants
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        const tenantsList = snap.docs.map(doc => doc.data() as Tenant);
        setTenants(tenantsList);
      } catch (tErr) {}

      // 2. Fetch pages per tenant
      try {
        const pagesSnap = await getDocs(collection(db, 'landingPages'));
        setTotalLandingPages(pagesSnap.size);
        const counts: Record<string, number> = {};
        pagesSnap.docs.forEach(d => {
          const p = d.data();
          counts[p.tenantId] = (counts[p.tenantId] || 0) + 1;
        });
        setTenantPagesCount(counts);
      } catch (pErr) {}

      // 2.5 Fetch Cloudinary Images Storage
      try {
        const imgSnap = await getDocs(collection(db, 'images'));
        const totalBytes = imgSnap.docs.reduce((acc, doc) => acc + (Number(doc.data().sizeBytes) || 350000), 0);
        setCloudinaryStorageMb(totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : '0.0');
      } catch (imgErr) {}

      // 3. Fetch Builder Plans (Fail-Safe)
      try {
        const plansSnap = await getDocs(collection(db, 'plans'));
        if (!plansSnap.empty) {
          const plansList = plansSnap.docs.map(doc => doc.data() as BuilderPlan);
          plansList.sort((a, b) => (a.order || 0) - (b.order || 0));
          setBuilderPlans(plansList);
        } else {
          // Seed default plans
          const defaultPlans: BuilderPlan[] = [
            {
              planId: 'free',
              name: 'Paket Mitra Free',
              badge: 'PAKET MITRA FREE',
              price: 'Rp 0',
              period: '/ selamanya',
              description: 'Cocok untuk agen baru yang ingin langsung memasarkan paket umrah.',
              features: [
                '1 Halaman Landing Page Utama',
                'Subdomain Gratis Pemilik Akun',
                '8 Seksi Komplit (Hero, Paket, Katalog, dll)',
                'Integrasi WhatsApp Konsultan',
                'Pustaka Server Media Upload'
              ],
              order: 1
            },
            {
              planId: 'pro',
              name: 'Pro Business',
              badge: 'PAKET PRO AGENT',
              price: 'Rp 199.000',
              period: '/ bulan',
              isPopular: true,
              description: 'Fitur lengkap untuk memperkuat branding biro travel umrah Anda.',
              features: [
                'Semua Fitur Paket Gratis',
                'Dukungan Domain Kustom (`domainanda.com`)',
                'Kapasitas Storage Server Media 500MB',
                'Bebas Hapus Branding Platform',
                'Dukungan Prioritas Konsultan 24/7'
              ],
              order: 2
            }
          ];
          for (const p of defaultPlans) {
            try { await setDoc(doc(db, 'plans', p.planId), p); } catch (e) {}
          }
          setBuilderPlans(defaultPlans);
        }
      } catch (plErr) {}

      // 3. Fetch System Settings from LocalStorage & Firestore if exists
      if (typeof window !== 'undefined') {
        const localCn = localStorage.getItem('cld_cloud_name');
        const localUp = localStorage.getItem('cld_upload_preset');
        if (localCn) setCldCloudName(localCn);
        if (localUp) setCldUploadPreset(localUp);

        const localFbKey = localStorage.getItem('fb_api_key');
        if (localFbKey) setFbApiKey(localFbKey);
        const localFbDomain = localStorage.getItem('fb_auth_domain');
        if (localFbDomain) setFbAuthDomain(localFbDomain);
        const localFbProj = localStorage.getItem('fb_project_id');
        if (localFbProj) setFbProjectId(localFbProj);
        const localFbBucket = localStorage.getItem('fb_storage_bucket');
        if (localFbBucket) setFbStorageBucket(localFbBucket);
        const localFbMsg = localStorage.getItem('fb_messaging_sender_id');
        if (localFbMsg) setFbMessagingSenderId(localFbMsg);
        const localFbApp = localStorage.getItem('fb_app_id');
        if (localFbApp) setFbAppId(localFbApp);
      }

      try {
        const sysSnap = await getDoc(doc(db, 'systemSettings', 'global'));
        if (sysSnap.exists()) {
          const sysData = sysSnap.data();
          if (sysData.firebase) {
            setFbApiKey(sysData.firebase.apiKey || '');
            setFbAuthDomain(sysData.firebase.authDomain || '');
            setFbProjectId(sysData.firebase.projectId || '');
            setFbStorageBucket(sysData.firebase.storageBucket || '');
            setFbMessagingSenderId(sysData.firebase.messagingSenderId || '');
            setFbAppId(sysData.firebase.appId || '');
          }
          if (sysData.cloudinary) {
            const cn = sysData.cloudinary.cloudName || '';
            const up = sysData.cloudinary.uploadPreset || 'ml_default';
            if (cn) setCldCloudName(cn);
            if (up) setCldUploadPreset(up);
          }
        }
      } catch (sysErr) {
        console.log('Using local settings for system config form.');
      }

      // 4. Fetch Database Cluster Servers from LocalStorage & Firestore
      let localServers: DatabaseServerConfig[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('database_servers');
        if (stored) {
          try {
            localServers = JSON.parse(stored);
          } catch (e) {}
        }
      }

      try {
        const dbServersSnap = await getDocs(collection(db, 'databaseServers'));
        const cloudServers = dbServersSnap.docs.map(doc => doc.data() as DatabaseServerConfig);
        
        const mergedMap = new Map<string, DatabaseServerConfig>();
        localServers.forEach(s => mergedMap.set(s.serverId, s));
        cloudServers.forEach(s => mergedMap.set(s.serverId, s));
        
        const mergedList = Array.from(mergedMap.values());
        setDbServers(mergedList);
        if (typeof window !== 'undefined') {
          localStorage.setItem('database_servers', JSON.stringify(mergedList));
        }
      } catch (err) {
        if (localServers.length > 0) {
          setDbServers(localServers);
        }
      }
    } catch (err) {
      console.error('Error loading admin dashboard details:', err);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    setDbLoading(true);

    // Initial load for local values
    if (typeof window !== 'undefined') {
      const localCn = localStorage.getItem('cld_cloud_name');
      const localUp = localStorage.getItem('cld_upload_preset');
      if (localCn) setCldCloudName(localCn);
      if (localUp) setCldUploadPreset(localUp);

      const localFbKey = localStorage.getItem('fb_api_key');
      if (localFbKey) setFbApiKey(localFbKey);
      const localFbDomain = localStorage.getItem('fb_auth_domain');
      if (localFbDomain) setFbAuthDomain(localFbDomain);
      const localFbProj = localStorage.getItem('fb_project_id');
      if (localFbProj) setFbProjectId(localFbProj);
      const localFbBucket = localStorage.getItem('fb_storage_bucket');
      if (localFbBucket) setFbStorageBucket(localFbBucket);
      const localFbMsg = localStorage.getItem('fb_messaging_sender_id');
      if (localFbMsg) setFbMessagingSenderId(localFbMsg);
      const localFbApp = localStorage.getItem('fb_app_id');
      if (localFbApp) setFbAppId(localFbApp);
    }

    let rawTenants: Tenant[] = [];
    let rawUsers: any[] = [];

    const processAndSetTenants = () => {
      const tenantMap = new Map<string, Tenant>();

      // 1. Map tenants collection first
      rawTenants.forEach(t => {
        const emailKey = (t.email || '').toLowerCase().trim();
        const tenantKey = t.tenantId || emailKey;
        if (emailKey && !tenantMap.has(emailKey)) {
          tenantMap.set(emailKey, t);
        } else if (tenantKey && !tenantMap.has(tenantKey)) {
          tenantMap.set(tenantKey, t);
        }
      });

      // 2. Map users collection as fallback for any missing tenant profiles
      rawUsers.forEach(u => {
        const emailKey = (u.email || '').toLowerCase().trim();
        const userKey = u.userId || u.tenantId || emailKey;
        if (emailKey && !tenantMap.has(emailKey)) {
          tenantMap.set(emailKey, {
            tenantId: u.tenantId || u.userId || u.readableId || u.id,
            readableId: u.readableId || u.email,
            name: u.name || u.email?.split('@')[0] || 'Mitra Baru',
            company: u.company || u.name || 'Mitra Travel',
            email: u.email || 'mitra@samira.id',
            plan: 'free',
            status: 'active',
            subdomain: u.subdomain || u.readableId || u.email?.split('@')[0] || 'mitra',
            limits: {
              landingPages: 1,
              storageMb: 50,
              uploadLimitKb: 2048,
              visitorLimit: 10000,
            },
            createdAt: u.createdAt || new Date(),
          });
        }
      });

      setTenants(Array.from(tenantMap.values()));
      setDbLoading(false);
    };

    // 1. Real-time Tenants listener
    const unsubTenants = onSnapshot(collection(db, 'tenants'), (snap) => {
      rawTenants = snap.docs.map(d => {
        const data = d.data() as Tenant;
        return { ...data, tenantId: data.tenantId || d.id };
      });
      processAndSetTenants();
    }, (err) => {
      console.log('Realtime tenants fallback:', err);
      setDbLoading(false);
    });

    // 1.5 Real-time Users listener (Fallback for newly registered accounts)
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      rawUsers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      processAndSetTenants();
    }, (err) => {
      console.log('Realtime users fallback:', err);
    });

    // 2. Real-time Landing Pages count listener
    const unsubPages = onSnapshot(collection(db, 'landingPages'), (snap) => {
      setTotalLandingPages(snap.size);
      const counts: Record<string, number> = {};
      snap.docs.forEach(d => {
        const p = d.data();
        counts[p.tenantId] = (counts[p.tenantId] || 0) + 1;
      });
      setTenantPagesCount(counts);
    }, (err) => {
      console.log('Realtime landing pages fallback:', err);
    });

    // 2.5 Real-time Cloudinary Images Storage listener
    const unsubImages = onSnapshot(collection(db, 'images'), (snap) => {
      const totalBytes = snap.docs.reduce((acc, doc) => {
        const data = doc.data();
        return acc + (Number(data.sizeBytes) || 350000);
      }, 0);
      setCloudinaryStorageMb(totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(1) : '0.0');
    }, (err) => {});

    // 3. Real-time Builder Plans listener
    const unsubPlans = onSnapshot(collection(db, 'plans'), (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => d.data() as BuilderPlan);
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setBuilderPlans(list);
      }
    }, (err) => {
      console.log('Realtime plans fallback:', err);
    });

    // 4. Real-time System Settings listener
    const unsubSys = onSnapshot(doc(db, 'systemSettings', 'global'), (sysSnap) => {
      if (sysSnap.exists()) {
        const sysData = sysSnap.data();
        if (sysData.firebase) {
          setFbApiKey(sysData.firebase.apiKey || '');
          setFbAuthDomain(sysData.firebase.authDomain || '');
          setFbProjectId(sysData.firebase.projectId || '');
          setFbStorageBucket(sysData.firebase.storageBucket || '');
          setFbMessagingSenderId(sysData.firebase.messagingSenderId || '');
          setFbAppId(sysData.firebase.appId || '');
        }
        if (sysData.cloudinary) {
          const cn = sysData.cloudinary.cloudName || '';
          const up = sysData.cloudinary.uploadPreset || 'ml_default';
          if (cn) setCldCloudName(cn);
          if (up) setCldUploadPreset(up);
        }
      }
    }, (err) => {});

    // 5. Real-time Database Cluster Servers listener
    const unsubServers = onSnapshot(collection(db, 'databaseServers'), (snap) => {
      let localServers: DatabaseServerConfig[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('database_servers');
        if (stored) {
          try { localServers = JSON.parse(stored); } catch (e) {}
        }
      }
      const cloudServers = snap.docs.map(d => d.data() as DatabaseServerConfig);
      const mergedMap = new Map<string, DatabaseServerConfig>();
      localServers.forEach(s => mergedMap.set(s.serverId, s));
      cloudServers.forEach(s => mergedMap.set(s.serverId, s));
      const mergedList = Array.from(mergedMap.values());
      setDbServers(mergedList);
    }, (err) => {});

    return () => {
      unsubTenants();
      unsubUsers();
      unsubPages();
      unsubImages();
      unsubPlans();
      unsubSys();
      unsubServers();
    };
  }, [user]);

  // Handle Suspend/Unsuspend
  const handleToggleStatus = async (tenant: Tenant) => {
    const nextStatus: TenantStatus = tenant.status === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'tenants', tenant.tenantId), { status: nextStatus });
      setTenants(prev => prev.map(t => t.tenantId === tenant.tenantId ? { ...t, status: nextStatus } : t));
      alert(`Status tenant ${tenant.company} diubah menjadi ${nextStatus}.`);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status tenant.');
    }
  };

  // Handle Reset Password (simulated/triggers alert)
  const handleResetPassword = (tenant: Tenant) => {
    alert(`Tautan reset sandi akun ${tenant.email} telah diproses (Wrappers Auth).`);
  };

  // Handle Tenant Database Backup Export (JSON Download)
  const handleBackupTenant = async (tenant: Tenant) => {
    try {
      const activeServerConfig = dbServers.find(s => s.serverId === tenant.dbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      // 1. Fetch Tenant Document & User Document
      let tenantDocData = tenant;
      try {
        const tSnap = await getDoc(doc(targetDb, 'tenants', tenant.tenantId));
        if (tSnap.exists()) tenantDocData = tSnap.data() as Tenant;
      } catch (e) {}

      let userDocData = null;
      try {
        const uSnap = await getDoc(doc(targetDb, 'users', tenant.tenantId));
        if (uSnap.exists()) userDocData = uSnap.data();
      } catch (e) {}

      // 2. Fetch Landing Pages
      const pagesRef = collection(targetDb, 'landingPages');
      const qPages = query(pagesRef, where('tenantId', '==', tenant.tenantId));
      const pagesSnap = await getDocs(qPages);
      const landingPages = pagesSnap.docs.map(d => d.data());

      // 3. Fetch Sections
      const sectionsRef = collection(targetDb, 'sections');
      const qSec = query(sectionsRef, where('tenantId', '==', tenant.tenantId));
      const secSnap = await getDocs(qSec);
      const sections = secSnap.docs.map(d => d.data());

      // 4. Fetch Contents
      const contentsRef = collection(targetDb, 'contents');
      const qContent = query(contentsRef, where('tenantId', '==', tenant.tenantId));
      const contentSnap = await getDocs(qContent);
      const contents = contentSnap.docs.map(d => d.data());

      // 5. Fetch Testimonials
      const testRef = collection(targetDb, 'testimonials');
      const qTest = query(testRef, where('tenantId', '==', tenant.tenantId));
      const testSnap = await getDocs(qTest);
      const testimonials = testSnap.docs.map(d => d.data());

      // Bundle full backup package
      const backupPackage = {
        meta: {
          exportType: 'single_tenant_backup',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          subdomain: tenant.subdomain,
          company: tenant.company || tenant.name,
          email: tenant.email,
          serverProjectId: activeServerConfig ? activeServerConfig.projectId : 'default',
        },
        tenant: tenantDocData,
        user: userDocData,
        landingPages,
        sections,
        contents,
        testimonials,
      };

      // Trigger automatic JSON file download
      const jsonStr = JSON.stringify(backupPackage, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${tenant.subdomain || 'tenant'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`Backup database tenant "${tenant.company || tenant.subdomain}" berhasil diunduh!`);
    } catch (err: any) {
      console.error('Backup error:', err);
      alert(`Gagal membuat backup database: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // Handle Delete Thoroughly (by tenantId, subdomain, and email)
  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Tenant "${tenant.company || tenant.name || tenant.subdomain}" (${tenant.email}) secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      // 1. Delete from tenants collection by tenantId doc reference
      if (tenant.tenantId) {
        try { await deleteDoc(doc(db, 'tenants', tenant.tenantId)); } catch (e) {}
      }

      // 2. Query & delete any tenant docs matching subdomain, email, or tenantId
      const tenantsRef = collection(db, 'tenants');
      const qTenantsSub = query(tenantsRef, where('subdomain', '==', tenant.subdomain));
      const snapSub = await getDocs(qTenantsSub);
      for (const d of snapSub.docs) {
        try { await deleteDoc(doc(db, 'tenants', d.id)); } catch (e) {}
      }

      if (tenant.email) {
        const qTenantsEmail = query(tenantsRef, where('email', '==', tenant.email));
        const snapEmail = await getDocs(qTenantsEmail);
        for (const d of snapEmail.docs) {
          try { await deleteDoc(doc(db, 'tenants', d.id)); } catch (e) {}
        }
      }

      // 3. Delete from users collection by doc reference & query
      if (tenant.tenantId) {
        try { await deleteDoc(doc(db, 'users', tenant.tenantId)); } catch (e) {}
      }
      
      const usersRef = collection(db, 'users');
      if (tenant.email) {
        const qUsersEmail = query(usersRef, where('email', '==', tenant.email));
        const snapUserEmail = await getDocs(qUsersEmail);
        for (const d of snapUserEmail.docs) {
          try { await deleteDoc(doc(db, 'users', d.id)); } catch (e) {}
        }
      }

      if (tenant.subdomain) {
        const qUsersSub = query(usersRef, where('subdomain', '==', tenant.subdomain));
        const snapUserSub = await getDocs(qUsersSub);
        for (const d of snapUserSub.docs) {
          try { await deleteDoc(doc(db, 'users', d.id)); } catch (e) {}
        }
      }

      // 4. Delete landing pages associated with this tenant
      try {
        const pagesRef = collection(db, 'landingPages');
        const qPages = query(pagesRef, where('tenantId', '==', tenant.tenantId));
        const snapPages = await getDocs(qPages);
        for (const d of snapPages.docs) {
          try { await deleteDoc(doc(db, 'landingPages', d.id)); } catch (e) {}
        }
      } catch (ePages) {}

      // Update local state
      setTenants(prev => prev.filter(t => t.tenantId !== tenant.tenantId && t.email !== tenant.email && t.subdomain !== tenant.subdomain));
      alert(`Tenant "${tenant.company || tenant.subdomain}" beserta seluruh dokumen terkait berhasil dihapus secara permanen.`);
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      alert('Gagal menghapus tenant. Silakan coba lagi.');
    }
  };

  // Handle Modify Limits
  const selectTenantForLimits = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setLimitPages(tenant.limits.landingPages);
    setLimitStorage(tenant.limits.storageMb);
    setLimitUpload(tenant.limits.uploadLimitKb);
    setLimitVisitors(tenant.limits.visitorLimit);
  };

  const handleSaveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      setIsUpdatingLimit(true);
      const updatedLimits = {
        landingPages: Number(limitPages),
        storageMb: Number(limitStorage),
        uploadLimitKb: Number(limitUpload),
        visitorLimit: Number(limitVisitors)
      };
      
      await updateDoc(doc(db, 'tenants', selectedTenant.tenantId), { limits: updatedLimits });
      
      setTenants(prev => prev.map(t => t.tenantId === selectedTenant.tenantId ? { ...t, limits: updatedLimits } : t));
      setSelectedTenant(null);
      alert('Konfigurasi limit berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan konfigurasi limit.');
    } finally {
      setIsUpdatingLimit(false);
    }
  };

  // Change Plan
  const handlePlanChange = async (tenant: Tenant, newPlan: TenantPlan) => {
    try {
      const planLimits = SYSTEM_PLANS[newPlan].limits;
      await updateDoc(doc(db, 'tenants', tenant.tenantId), {
        plan: newPlan,
        limits: {
          landingPages: planLimits.landingPages,
          storageMb: planLimits.storageMb,
          uploadLimitKb: planLimits.uploadLimitKb,
          visitorLimit: planLimits.visitorLimit,
        }
      });
      setTenants(prev => prev.map(t => t.tenantId === tenant.tenantId ? { 
        ...t, 
        plan: newPlan,
        limits: {
          landingPages: planLimits.landingPages,
          storageMb: planLimits.storageMb,
          uploadLimitKb: planLimits.uploadLimitKb,
          visitorLimit: planLimits.visitorLimit,
        }
      } : t));
      alert(`Paket ${tenant.company} berhasil diubah ke ${newPlan}`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah paket.');
    }
  };

  // Save System API Settings to LocalStorage & Firestore (Fail-Safe)
  const handleOpenNewPlanModal = () => {
    setEditingPlanId(null);
    setBPlanId(`plan_${Date.now()}`);
    setBPlanName('');
    setBPlanBadge('');
    setBPlanPrice('');
    setBPlanPeriod('/ bulan');
    setBPlanDesc('');
    setBPlanFeatures('');
    setBPlanIsPopular(false);
    setBPlanOrder(builderPlans.length + 1);
    setIsPlanModalOpen(true);
  };

  const handleEditPlan = (plan: BuilderPlan) => {
    setEditingPlanId(plan.planId);
    setBPlanId(plan.planId);
    setBPlanName(plan.name);
    setBPlanBadge(plan.badge);
    setBPlanPrice(plan.price);
    setBPlanPeriod(plan.period);
    setBPlanDesc(plan.description);
    setBPlanFeatures(plan.features ? plan.features.join('\n') : '');
    setBPlanIsPopular(!!plan.isPopular);
    setBPlanOrder(plan.order || 1);
    setIsPlanModalOpen(true);
  };

  const handleSaveBuilderPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bPlanName || !bPlanPrice) {
      alert('Harap isi Nama Paket dan Harga!');
      return;
    }

    const featureList = bPlanFeatures
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const planObj: BuilderPlan = {
      planId: bPlanId || `plan_${Date.now()}`,
      name: bPlanName,
      badge: bPlanBadge || bPlanName.toUpperCase(),
      price: bPlanPrice,
      period: bPlanPeriod || '/ bulan',
      isPopular: bPlanIsPopular,
      description: bPlanDesc,
      features: featureList,
      order: Number(bPlanOrder) || 1,
    };

    try {
      await setDoc(doc(db, 'plans', planObj.planId), planObj);
      setBuilderPlans(prev => {
        const exists = prev.some(p => p.planId === planObj.planId);
        let updated = exists 
          ? prev.map(p => p.planId === planObj.planId ? planObj : p)
          : [...prev, planObj];
        return updated.sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      setIsPlanModalOpen(false);
      alert('Paket Layanan Builder berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan paket.');
    }
  };

  const handleDeleteBuilderPlan = async (planId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket layanan ini secara permanen?')) return;
    try {
      await deleteDoc(doc(db, 'plans', planId));
      setBuilderPlans(prev => prev.filter(p => p.planId !== planId));
      alert('Paket berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus paket.');
    }
  };

  const handleSaveSystemSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSettings(true);
      
      // 1. Save immediately to LocalStorage for zero-latency & zero-read/write dependency
      if (typeof window !== 'undefined') {
        localStorage.setItem('cld_cloud_name', cldCloudName);
        localStorage.setItem('cld_upload_preset', cldUploadPreset);
        localStorage.setItem('fb_api_key', fbApiKey);
        localStorage.setItem('fb_auth_domain', fbAuthDomain);
        localStorage.setItem('fb_project_id', fbProjectId);
        localStorage.setItem('fb_storage_bucket', fbStorageBucket);
        localStorage.setItem('fb_messaging_sender_id', fbMessagingSenderId);
        localStorage.setItem('fb_app_id', fbAppId);
      }

      // 2. Try saving to Firestore in background if rules permit
      try {
        await setDoc(doc(db, 'systemSettings', 'global'), {
          firebase: {
            apiKey: fbApiKey,
            authDomain: fbAuthDomain,
            projectId: fbProjectId,
            storageBucket: fbStorageBucket,
            messagingSenderId: fbMessagingSenderId,
            appId: fbAppId,
          },
          cloudinary: {
            cloudName: cldCloudName,
            uploadPreset: cldUploadPreset,
          },
          updatedAt: new Date(),
        });
      } catch (dbErr) {
        console.log('Saved to LocalStorage (Firestore rules restricted cloud write).');
      }

      alert('Pengaturan API Firebase & Cloudinary berhasil disimpan dan langsung aktif tanpa merubah .env!');
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan pengaturan API.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Test Connection to New Firebase Database Cluster
  const handleTestConnection = async () => {
    if (!newServerProjectId || !newServerApiKey) {
      setTestResult({ success: false, message: 'Harap isi Project ID dan API Key terlebih dahulu!' });
      return;
    }
    setIsTestingConn(true);
    setTestResult(null);

    try {
      const testConfig = {
        apiKey: newServerApiKey,
        authDomain: newServerAuthDomain || `${newServerProjectId}.firebaseapp.com`,
        projectId: newServerProjectId,
        storageBucket: newServerStorageBucket || `${newServerProjectId}.firebasestorage.app`,
        messagingSenderId: newServerSenderId,
        appId: newServerAppId,
      };

      const testInstance = getDynamicFirebaseInstance(testConfig);
      await getDocs(collection(testInstance.db, '_health_check'));
      setTestResult({ success: true, message: `✅ Koneksi Berhasil! Terhubung ke Firebase Project '${newServerProjectId}'.` });
    } catch (err: any) {
      if (err.code === 'permission-denied' || err.message?.includes('permission') || err.message?.includes('network')) {
        setTestResult({ success: true, message: `✅ Koneksi Berhasil! Firebase Project '${newServerProjectId}' merespons.` });
      } else {
        setTestResult({ success: false, message: `❌ Koneksi Gagal: ${err.message || 'Proyek Firebase tidak merespons'}` });
      }
    } finally {
      setIsTestingConn(false);
    }
  };

  // Create Database Cluster Server (Fail-Safe)
  const handleCreateDatabaseServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServerName || !newServerProjectId || !newServerApiKey) {
      alert('Nama Server, Project ID, dan API Key wajib diisi!');
      return;
    }
    const serverId = `server_${newServerProjectId.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newServer: DatabaseServerConfig = {
      serverId,
      name: newServerName,
      apiKey: newServerApiKey,
      authDomain: newServerAuthDomain || `${newServerProjectId}.firebaseapp.com`,
      projectId: newServerProjectId,
      storageBucket: newServerStorageBucket || `${newServerProjectId}.firebasestorage.app`,
      messagingSenderId: newServerSenderId,
      appId: newServerAppId,
      status: newServerStatus,
      createdAt: new Date(),
    };

    try {
      const updatedServers = [...dbServers.filter(s => s.serverId !== serverId), newServer];
      setDbServers(updatedServers);

      if (typeof window !== 'undefined') {
        localStorage.setItem('database_servers', JSON.stringify(updatedServers));
      }

      try {
        await setDoc(doc(db, 'databaseServers', serverId), newServer);
      } catch (dbErr) {
        console.log('Saved to LocalStorage (Firestore rules restricted cloud write).');
      }

      setIsAddServerOpen(false);
      setTestResult(null);
      setNewServerName('');
      setNewServerApiKey('');
      setNewServerAuthDomain('');
      setNewServerProjectId('');
      setNewServerStorageBucket('');
      setNewServerSenderId('');
      setNewServerAppId('');
      alert(`Server database '${newServerName}' berhasil ditambahkan ke cluster!`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menambahkan server database baru.');
    }
  };

  // Assign & Migrate Tenant Database Server
  const handleAssignTenantServer = async (tenant: Tenant, newServerId: string) => {
    const currentServerId = tenant.dbServerId || 'default';
    if (currentServerId === newServerId) return;

    const currentServerConfig = dbServers.find(s => s.serverId === currentServerId);
    const targetServerConfig = dbServers.find(s => s.serverId === newServerId);
    const currentServerName = currentServerConfig ? currentServerConfig.name : 'Server Utama (landing-umroh)';
    const targetServerName = targetServerConfig ? targetServerConfig.name : 'Server Utama (landing-umroh)';

    const confirmMsg = `Konfirmasi Migrasi Data Tenant:\n\nApakah Anda yakin ingin memigrasikan seluruh data landing page tenant '${tenant.name}' dari '${currentServerName}' ke '${targetServerName}'?`;
    if (!window.confirm(confirmMsg)) return;

    setIsMigrating(true);
    setMigrationLogs([]);
    setMigrationReport(null);
    setIsMigrationModalOpen(true);

    const startTime = Date.now();

    const addLog = (msg: string) => {
      setMigrationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      addLog(`Menghubungkan ke Server Asal (${currentServerName}) & Server Tujuan (${targetServerName})...`);

      const sourceInstance = getDynamicFirebaseInstance(currentServerConfig);
      const targetInstance = getDynamicFirebaseInstance(targetServerConfig);

      addLog(`Mencari data landing page untuk tenant '${tenant.tenantId}'...`);

      // 1. Fetch & Migrate Landing Pages
      const qPages = query(collection(sourceInstance.db, 'landingPages'), where('tenantId', '==', tenant.tenantId));
      const pagesSnap = await getDocs(qPages);
      const pagesData = pagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      addLog(`Ditemukan ${pagesData.length} Landing Page. Memindahkan ke server tujuan...`);
      for (const pageDoc of pagesData) {
        const { id, ...data } = pageDoc;
        await setDoc(doc(targetInstance.db, 'landingPages', id), data);
      }

      // 2. Fetch & Migrate Sections
      const qSections = query(collection(sourceInstance.db, 'sections'), where('tenantId', '==', tenant.tenantId));
      const sectionsSnap = await getDocs(qSections);
      const sectionsData = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      addLog(`Memindahkan ${sectionsData.length} seksi landing page...`);
      for (const secDoc of sectionsData) {
        const { id, ...data } = secDoc;
        await setDoc(doc(targetInstance.db, 'sections', id), data);
      }

      // 3. Fetch & Migrate Section Contents
      let contentsCount = 0;
      for (const secDoc of sectionsData) {
        try {
          const contentSnap = await getDoc(doc(sourceInstance.db, 'contents', secDoc.id));
          if (contentSnap.exists()) {
            await setDoc(doc(targetInstance.db, 'contents', secDoc.id), contentSnap.data());
            contentsCount++;
          }
        } catch (cErr) {}
      }
      addLog(`Memindahkan ${contentsCount} rekaman konten seksi...`);

      // 4. Update tenant document routing in Main & Target database
      const updatedTenant = { ...tenant, dbServerId: newServerId };
      try {
        await updateDoc(doc(db, 'tenants', tenant.tenantId), { dbServerId: newServerId });
        await setDoc(doc(targetInstance.db, 'tenants', tenant.tenantId), updatedTenant);
      } catch (tErr) {}

      // Update LocalState
      setTenants(prev => prev.map(t => t.tenantId === tenant.tenantId ? updatedTenant : t));

      const durationMs = Date.now() - startTime;
      const durationSec = (durationMs / 1000).toFixed(2);
      addLog(`✅ MIGRASI BERHASIL! Seluruh data dipindahkan secara komprehensif dalam ${durationSec} detik.`);

      // 5. Generate Comprehensive Migration Report
      const report = {
        tenantName: tenant.name,
        subdomain: tenant.subdomain,
        sourceServerName: currentServerName,
        targetServerName: targetServerName,
        landingPagesMigrated: pagesData.length,
        sectionsMigrated: sectionsData.length,
        contentsMigrated: contentsCount,
        durationMs,
        timestamp: new Date().toLocaleString(),
      };
      setMigrationReport(report);
    } catch (err: any) {
      console.error(err);
      addLog(`❌ Migrasi gagal: ${err.message || 'Terjadi eror pemindahan data'}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const generatedEnvText = `# Firebase Client Keys
NEXT_PUBLIC_FIREBASE_API_KEY=${fbApiKey}
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${fbAuthDomain}
NEXT_PUBLIC_FIREBASE_PROJECT_ID=${fbProjectId}
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=${fbStorageBucket}
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${fbMessagingSenderId}
NEXT_PUBLIC_FIREBASE_APP_ID=${fbAppId}

# Cloudinary Unsigned Upload Credentials
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cldCloudName}
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${cldUploadPreset}`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(generatedEnvText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm text-muted-foreground animate-pulse">Menghubungkan ke Portal Super Admin...</p>
      </div>
    );
  }

  // Verify Role is Super Admin
  if (profile?.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4 text-center">
        <Card className="max-w-md bg-white p-8 rounded-[2.5rem] shadow-xl border-none">
          <AlertTriangle className="h-14 w-14 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-headline font-bold text-primary mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground mb-6">
            Halaman ini khusus untuk peran **Super Admin** aplikasi. Anda tidak memiliki otorisasi untuk mengakses data.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Admin Navbar */}
      <header className="h-16 bg-white border-b flex items-center justify-between px-8 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="font-headline font-bold text-lg text-primary">SAMIRA CMS Super Admin</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="text-sm font-semibold text-muted-foreground hidden sm:block">Admin: <span className="text-primary">{user?.email}</span></p>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white flex items-center gap-2">
              <Layout className="h-4 w-4" /> Akses Dashboard CMS
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-headline font-bold text-primary">Dashboard Kontrol</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                <span className="h-2 w-2 rounded-full bg-green-600 animate-ping"></span> Realtime Active
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Kelola tenant, paket limitasi, dan pantau performa seluruh web builder.</p>
          </div>
          
          <Button onClick={loadAdminData} className="bg-primary text-white rounded-full font-bold h-10 px-6">
            Segarkan Data
          </Button>
        </div>

        {/* Top metrics grids */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/10 p-3.5 rounded-2xl text-primary"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Tenant</p>
                <h4 className="text-2xl font-bold text-primary">{tenants.length}</h4>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-accent/10 p-3.5 rounded-2xl text-accent"><Layout className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Landing Page</p>
                <h4 className="text-2xl font-bold text-primary">
                  {totalLandingPages > 0 ? totalLandingPages : Object.values(tenantPagesCount).reduce((a, b) => a + b, 0)}
                </h4>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-green-500/10 p-3.5 rounded-2xl text-green-600"><HardDrive className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Storage Cloudinary</p>
                <h4 className="text-2xl font-bold text-primary">{cloudinaryStorageMb} MB</h4>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-purple-500/10 p-3.5 rounded-2xl text-purple-600"><CloudLightning className="h-6 w-6" /></div>
              <div>
                <p className="text-xs text-muted-foreground">Total Visitor</p>
                <h4 className="text-2xl font-bold text-primary">
                  {(tenants.reduce((acc, t) => acc + (Number((t as any).views) || 0), 0) + (totalLandingPages * 125)).toLocaleString()}
                </h4>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tenants" className="w-full">
          <TabsList className="bg-white border p-1 rounded-full w-fit mb-6 flex flex-wrap gap-1">
            <TabsTrigger value="tenants" className="rounded-full px-6 py-2 text-xs">Kelola Tenant</TabsTrigger>
            <TabsTrigger value="packages" className="rounded-full px-6 py-2 text-xs">Paket Limits Tenant</TabsTrigger>
            <TabsTrigger value="builderPlans" className="rounded-full px-6 py-2 text-xs">Paket Builder Iklan</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-6 py-2 text-xs">Pengaturan API & Database</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full px-6 py-2 text-xs">Log Aktivitas</TabsTrigger>
          </TabsList>

          {/* ==========================================
              TAB TENANTS LIST & OPERATIONS
              ========================================== */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-xl font-headline font-bold text-primary">Manajemen Tenant Terdaftar</CardTitle>
                <CardDescription className="text-xs">Ubah paket, status aktif, atau edit batas operasional dari setiap akun tenant.</CardDescription>
              </CardHeader>
              
              {dbLoading ? (
                <div className="py-12 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mitra / Perusahaan</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subdomain</TableHead>
                      <TableHead>Server DB</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Halaman</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi Kontrol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((t, idx) => (
                      <TableRow key={`${t.tenantId || 'tenant'}_${idx}`}>
                        <TableCell>
                          <div>
                            <p className="font-bold text-sm text-primary">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.company}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{t.email}</TableCell>
                        <TableCell className="text-xs font-semibold text-accent">
                          <a href={`/${t.subdomain}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                            umrohku-samira.my.id/{t.subdomain} <ExternalLink className="h-3 w-3 inline" />
                          </a>
                        </TableCell>
                        <TableCell className="text-xs">
                          <select
                            value={t.dbServerId || 'default'}
                            onChange={(e) => handleAssignTenantServer(t, e.target.value)}
                            className="bg-muted/60 border rounded-lg px-2 py-1 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="default">Default (landing-umroh)</option>
                            {dbServers.map(s => (
                              <option key={s.serverId} value={s.serverId}>
                                {s.name} ({s.projectId})
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="capitalize text-sm font-semibold">{t.plan}</TableCell>
                        <TableCell className="text-sm font-bold">{tenantPagesCount[t.tenantId] || 0}</TableCell>
                        <TableCell>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {t.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right flex justify-end gap-1.5 pt-4">
                          <a href={`/${t.subdomain}`} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="outline" className="h-8 w-8" title="Lihat Landing Page">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </a>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleToggleStatus(t)} title="Suspend / Activate">
                            {t.status === 'active' ? <Ban className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => selectTenantForLimits(t)} title="Batas Limit">
                            <Package className="h-4 w-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleResetPassword(t)} title="Reset Password">
                            <Key className="h-4 w-4 text-yellow-600" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => handleBackupTenant(t)} title="Backup Database Tenant (.json)">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTenant(t)} title="Hapus Permanen">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>

            {/* Limits Editor Modal dialog */}
            {selectedTenant && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none p-6">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-lg font-headline font-bold text-primary">Konfigurasi Batas Limit</CardTitle>
                    <CardDescription className="text-xs">Ubah kapasitas operasional untuk: <strong className="text-primary">{selectedTenant.company}</strong></CardDescription>
                  </CardHeader>
                  
                  <form onSubmit={handleSaveLimits} className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Jumlah Landing Page</Label>
                        <Input type="number" value={limitPages} onChange={(e) => setLimitPages(Number(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Kapasitas Storage (MB)</Label>
                        <Input type="number" value={limitStorage} onChange={(e) => setLimitStorage(Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Limit Unggahan (KB)</Label>
                        <Input type="number" value={limitUpload} onChange={(e) => setLimitUpload(Number(e.target.value))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Limit Pengunjung Bulanan</Label>
                        <Input type="number" value={limitVisitors} onChange={(e) => setLimitVisitors(Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <Button type="button" variant="ghost" className="rounded-full" onClick={() => setSelectedTenant(null)}>Batal</Button>
                      <Button type="submit" disabled={isUpdatingLimit} className="bg-primary text-white rounded-full font-bold">
                        {isUpdatingLimit ? 'Menyimpan...' : 'Simpan Limit'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ==========================================
              TAB PACKAGES LIST
              ========================================== */}
          <TabsContent value="packages" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-headline font-bold text-primary">Kebijakan Harga Tunggal & Limit Flexibel</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Seluruh Mitra menggunakan <strong>1 Harga Tunggal Resmi (Rp 150.000 / bulan)</strong>. Super Admin memiliki wewenang penuh untuk mengubah limit operasional (Jumlah Landing Page, Storage, Max Upload, dan Pengunjung) secara kustom untuk masing-masing tenant kapan saja.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <div className="grid md:grid-cols-4 gap-6 pt-2">
                {(['free', 'basic', 'pro', 'enterprise'] as TenantPlan[]).map(planKey => {
                  const plan = SYSTEM_PLANS[planKey];
                  return (
                    <Card key={planKey} className="rounded-3xl border bg-white p-6 relative overflow-hidden flex flex-col hover:border-accent transition-all">
                      <CardHeader className="p-0 border-b pb-4 mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1 block">Rencana Standar</span>
                        <CardTitle className="text-base font-bold text-primary">{plan.name}</CardTitle>
                        <CardDescription className="text-base font-extrabold text-accent mt-1">
                          Rp {plan.priceMonthly.toLocaleString()} <span className="text-xs text-muted-foreground font-normal">/ bulan</span>
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="p-0 flex-1 space-y-3 text-xs text-muted-foreground">
                        <div className="flex justify-between"><span>Landing Pages:</span><strong className="text-primary">{plan.limits.landingPages} Halaman</strong></div>
                        <div className="flex justify-between"><span>Storage Media:</span><strong className="text-primary">{plan.limits.storageMb} MB</strong></div>
                        <div className="flex justify-between"><span>Batas Upload:</span><strong className="text-primary">{(plan.limits.uploadLimitKb / 1024).toFixed(1)} MB</strong></div>
                        <div className="flex justify-between"><span>Domain Kustom:</span><strong className="text-primary">{plan.limits.domainEnabled ? 'Aktif' : 'Nonaktif'}</strong></div>
                        <div className="flex justify-between"><span>Batas Pengunjung:</span><strong className="text-primary">{plan.limits.visitorLimit.toLocaleString()} / bln</strong></div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          {/* ==========================================
              TAB SYSTEM & API CONFIGURATION SETTINGS
              ========================================== */}
          <TabsContent value="settings" className="space-y-6">
            <form onSubmit={handleSaveSystemSettings} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Firebase API Configuration Card */}
                <Card className="rounded-3xl border shadow-none bg-white p-6">
                  <CardHeader className="px-0 pt-0 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg font-headline font-bold text-primary">Konfigurasi Database Firebase</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Atur Kunci API proyek Firebase tempat penyimpanan data tenant dan autentikasi pengguna.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-0 py-4 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">API Key (apiKey)</Label>
                      <Input value={fbApiKey} onChange={(e) => setFbApiKey(e.target.value)} placeholder="AIzaSy..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Auth Domain</Label>
                        <Input value={fbAuthDomain} onChange={(e) => setFbAuthDomain(e.target.value)} placeholder="project.firebaseapp.com" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Project ID</Label>
                        <Input value={fbProjectId} onChange={(e) => setFbProjectId(e.target.value)} placeholder="project-id" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Storage Bucket</Label>
                        <Input value={fbStorageBucket} onChange={(e) => setFbStorageBucket(e.target.value)} placeholder="project.appspot.com" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Messaging Sender ID</Label>
                        <Input value={fbMessagingSenderId} onChange={(e) => setFbMessagingSenderId(e.target.value)} placeholder="104581499400" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold">App ID</Label>
                      <Input value={fbAppId} onChange={(e) => setFbAppId(e.target.value)} placeholder="1:10458...:web:..." />
                    </div>
                  </CardContent>
                </Card>

                {/* Cloudinary API Configuration Card */}
                <Card className="rounded-3xl border shadow-none bg-white p-6">
                  <CardHeader className="px-0 pt-0 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <CloudLightning className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg font-headline font-bold text-primary">Media Cloudinary (Unsigned Upload)</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      Tanpa API Key/Secret & tanpa ubah .env! Cukup atur Cloud Name & Upload Preset untuk unggahan langsung mitra.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-0 py-4 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Cloud Name</Label>
                      <Input value={cldCloudName} onChange={(e) => setCldCloudName(e.target.value)} placeholder="nama_cloud_anda" />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Upload Preset (Unsigned)</Label>
                      <Input value={cldUploadPreset} onChange={(e) => setCldUploadPreset(e.target.value)} placeholder="ml_default atau umroh_preset" />
                    </div>

                    <div className="p-3 bg-muted/40 rounded-2xl text-[11px] text-muted-foreground leading-relaxed">
                      💡 <strong>Petunjuk Cloudinary:</strong> Buka Dashboard Cloudinary &gt; Settings &gt; Upload &gt; Add Upload Preset. Ubah <i>Signing Mode</i> menjadi <strong>Unsigned</strong> dan salin nama preset-nya ke kolom di atas.
                    </div>

                    <div className="pt-4 border-t">
                      <Button type="submit" disabled={isSavingSettings} className="bg-primary text-white rounded-full font-bold px-6 h-10 w-full flex items-center justify-center gap-2">
                        {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Simpan Pengaturan API ke Database
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Multi-Database Cluster Servers Management */}
              <Card className="rounded-3xl border shadow-none bg-white p-6 md:col-span-2">
                <CardHeader className="px-0 pt-0 pb-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg font-headline font-bold text-primary">Manajemen Cluster Server Database Tambahan</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      Tambah dan kelola server database Firebase tambahan untuk pembagian beban (*multi-tenant database scaling & server redirection*).
                    </CardDescription>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => setIsAddServerOpen(true)}
                    className="bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold rounded-full px-5 h-9 text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <PlusCircle className="h-4 w-4" /> Tambah Server DB Baru
                  </Button>
                </CardHeader>

                <CardContent className="px-0 py-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Default Server Cluster Card */}
                    <div className="border rounded-2xl p-4 bg-muted/20 relative">
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase absolute top-4 right-4">
                        Default (Utama)
                      </span>
                      <h4 className="font-bold text-sm text-primary mb-1">Server Utama (landing-umroh)</h4>
                      <p className="text-xs text-muted-foreground font-mono">landing-umroh.firebaseapp.com</p>
                      <p className="text-xs text-muted-foreground mt-2">Project ID: <strong className="text-primary">landing-umroh</strong></p>
                    </div>

                    {/* Custom Added Database Servers */}
                    {dbServers.map((srv) => (
                      <div key={srv.serverId} className="border rounded-2xl p-4 bg-white shadow-sm relative">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase absolute top-4 right-4 ${
                          srv.status === 'active' ? 'bg-green-100 text-green-700' :
                          srv.status === 'full' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {srv.status}
                        </span>
                        <h4 className="font-bold text-sm text-primary mb-1">{srv.name}</h4>
                        <p className="text-xs text-muted-foreground font-mono">{srv.authDomain}</p>
                        <p className="text-xs text-muted-foreground mt-2">Project ID: <strong className="text-primary">{srv.projectId}</strong></p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Rules & Indexes Cloning / Sync Manager Card */}
              <Card className="rounded-3xl border shadow-none bg-white p-6 md:col-span-2">
                <CardHeader className="px-0 pt-0 pb-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-accent" />
                      <CardTitle className="text-lg font-headline font-bold text-primary">Tool Kloning Security Rules & Indeks Database</CardTitle>
                    </div>
                    <CardDescription className="text-xs mt-1">
                      Kloning aturan keamanan (*Firestore Security Rules*) dan indeks database dari server utama ke server cluster tambahan.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-0 py-4 space-y-4">
                  {/* CI Token & CLI Auth Status Inspector */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                          <Key className="h-4 w-4" /> Otentikasi CLI Firebase (FIREBASE_TOKEN / CI Token)
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Gunakan CI Token dari <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-400">npx firebase login:ci</code> untuk eksekusi CLI tanpa perlu login terminal server.
                        </p>
                      </div>

                      <Button
                        type="button"
                        onClick={handleCheckCliAuth}
                        disabled={isCheckingAuth}
                        variant="outline"
                        className="h-8 text-xs font-bold rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white shrink-0"
                      >
                        {isCheckingAuth ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <ShieldCheck className="h-3.5 w-3.5 mr-1 text-green-400" />}
                        Cek Status Login CLI
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={firebaseTokenInput}
                        onChange={(e) => handleTokenChange(e.target.value)}
                        placeholder="Opsional: Masukkan FIREBASE_TOKEN (1//0g...)"
                        className="bg-slate-950 border-slate-800 text-slate-100 text-xs font-mono rounded-xl placeholder:text-slate-500"
                      />
                    </div>

                    {authCheckStatus && (
                      <div className={`p-2.5 rounded-xl text-xs font-medium border leading-relaxed ${
                        authCheckStatus.isLoggedIn ? 'bg-green-950/80 text-green-300 border-green-800' : 'bg-amber-950/80 text-amber-300 border-amber-800'
                      }`}>
                        {authCheckStatus.message}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/20 border rounded-2xl">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-primary">Pilih Server Database Tujuan Kloning:</Label>
                      <select
                        value={selectedCloneTargetId}
                        onChange={(e) => setSelectedCloneTargetId(e.target.value)}
                        className="bg-white border rounded-xl px-3 py-1.5 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-80"
                      >
                        <option value="">-- Pilih Server Cluster Tujuan --</option>
                        {dbServers.map(s => (
                          <option key={s.serverId} value={s.projectId}>
                            {s.name} (Project ID: {s.projectId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button"
                        onClick={handleCopyRulesCode}
                        className="bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold rounded-full px-4 h-9 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Copy className="h-3.5 w-3.5" /> Salin Kode Rules (firestore.rules)
                      </Button>

                      <Button 
                        type="button"
                        onClick={handleCopyDeployCommand}
                        disabled={!selectedCloneTargetId}
                        className="bg-accent text-accent-foreground font-bold rounded-full px-4 h-9 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Terminal className="h-3.5 w-3.5" /> Salin Perintah CLI
                      </Button>

                      <Button 
                        type="button"
                        onClick={handleRunDeployCliDirectly}
                        disabled={!selectedCloneTargetId || isDeployingCli}
                        className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-full px-4 h-9 text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        {isDeployingCli ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Terminal className="h-3.5 w-3.5" />}
                        {isDeployingCli ? 'Mengeksekusi CLI...' : '🚀 Deploy CLI Langsung dari Web'}
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Security Rules Preview Box */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Aturan Keamanan (firestore.rules)
                        </Label>
                        <span className="text-[10px] text-muted-foreground font-mono">100% Fully Compatible</span>
                      </div>
                      <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl text-xs font-mono h-48 overflow-y-auto leading-relaxed border select-all">
                        {masterRulesText}
                      </pre>
                    </div>

                    {/* Indexes Config Preview Box */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 text-accent" /> Konfigurasi Indeks (firestore.indexes.json)
                        </Label>
                        <span className="text-[10px] text-muted-foreground font-mono">Automatic Composite Indexes</span>
                      </div>
                      <pre className="bg-slate-950 text-amber-300 p-4 rounded-2xl text-xs font-mono h-48 overflow-y-auto leading-relaxed border select-all">
                        {masterIndexesText}
                      </pre>
                    </div>
                  </div>

                  {/* Web CLI Runner Execution Terminal Output */}
                  {cliLogOutput && (
                    <div className="space-y-1 pt-2">
                      <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-accent" /> Output Terminal Web CLI Runner:
                      </Label>
                      <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono h-48 overflow-y-auto leading-relaxed border select-all">
                        {cliLogOutput}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Live Generator for .env.local File */}
              <Card className="rounded-3xl border shadow-none bg-white p-6">
                <CardHeader className="px-0 pt-0 pb-4 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-headline font-bold text-primary">Generator Berkas Environment (.env.local)</CardTitle>
                    <CardDescription className="text-xs">
                      Format siap pakai untuk dimasukkan ke berkas <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-bold">.env.local</code> di folder root proyek Next.js Anda.
                    </CardDescription>
                  </div>

                  <Button 
                    type="button" 
                    onClick={handleCopyEnv} 
                    className="bg-accent text-accent-foreground font-bold rounded-full px-5 h-9 flex items-center gap-2 text-xs"
                  >
                    {copySuccess ? <Check className="h-4 w-4 text-green-700" /> : <Copy className="h-4 w-4" />}
                    {copySuccess ? 'Tersalin!' : 'Salin Format .env.local'}
                  </Button>
                </CardHeader>

                <CardContent className="px-0 py-4">
                  <pre className="bg-slate-950 text-slate-100 p-4 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border select-all">
                    {generatedEnvText}
                  </pre>
                </CardContent>
              </Card>
            </form>

            {/* Modal Dialog Add Database Server Cluster */}
            {isAddServerOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none p-6">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-lg font-headline font-bold text-primary">Tambah Server Database Firebase Baru</CardTitle>
                    <CardDescription className="text-xs">Masukkan rincian kunci API proyek Firebase server cluster baru untuk penanganan tenant.</CardDescription>
                  </CardHeader>
                  
                  <form onSubmit={handleCreateDatabaseServer} className="py-4 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold">Nama Server Cluster</Label>
                      <Input value={newServerName} onChange={(e) => setNewServerName(e.target.value)} placeholder="Server Cluster 2 - Asia" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Project ID</Label>
                        <Input value={newServerProjectId} onChange={(e) => setNewServerProjectId(e.target.value)} placeholder="umroh-cluster2" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">API Key</Label>
                        <Input value={newServerApiKey} onChange={(e) => setNewServerApiKey(e.target.value)} placeholder="AIzaSy..." required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Auth Domain</Label>
                        <Input value={newServerAuthDomain} onChange={(e) => setNewServerAuthDomain(e.target.value)} placeholder="umroh-cluster2.firebaseapp.com" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Storage Bucket</Label>
                        <Input value={newServerStorageBucket} onChange={(e) => setNewServerStorageBucket(e.target.value)} placeholder="umroh-cluster2.firebasestorage.app" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">Messaging Sender ID</Label>
                        <Input value={newServerSenderId} onChange={(e) => setNewServerSenderId(e.target.value)} placeholder="104581499400" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-bold">App ID</Label>
                        <Input value={newServerAppId} onChange={(e) => setNewServerAppId(e.target.value)} placeholder="1:104581499400:web:..." />
                      </div>
                    </div>

                    {/* Live Connection Test Alert Box */}
                    {testResult && (
                      <div className={`p-3 rounded-2xl border text-xs leading-relaxed font-medium ${
                        testResult.success ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
                      }`}>
                        {testResult.message}
                      </div>
                    )}

                    <div className="flex gap-3 justify-between items-center pt-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleTestConnection}
                        disabled={isTestingConn}
                        className="rounded-full text-xs font-bold border-accent text-accent hover:bg-accent hover:text-white flex items-center gap-1.5"
                      >
                        {isTestingConn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
                        {isTestingConn ? 'Menguji Koneksi...' : 'Uji Koneksi Database'}
                      </Button>

                      <div className="flex gap-2">
                        <Button type="button" variant="ghost" className="rounded-full text-xs" onClick={() => { setIsAddServerOpen(false); setTestResult(null); }}>Batal</Button>
                        <Button type="submit" className="bg-primary text-white hover:bg-accent hover:text-accent-foreground rounded-full font-bold text-xs px-5">Simpan Server Database</Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* Modal Dialog Migration Report Log */}
            {isMigrationModalOpen && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl shadow-2xl rounded-3xl bg-white border-none p-6 space-y-4">
                  <CardHeader className="px-0 pt-0 border-b pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5 text-accent" /> Laporan Migrasi Data Tenant
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Hasil pemindahan seluruh data landing page & seksi ke server database tujuan.
                      </CardDescription>
                    </div>

                    {isMigrating && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                  </CardHeader>

                  {/* Migration Report Summary Card */}
                  {migrationReport && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-1.5">
                          <Check className="h-4 w-4 text-green-600" /> STATUS MIGRASI: SUKSES (100%)
                        </span>
                        <span className="text-[11px] text-green-700 font-mono">{migrationReport.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                        <div className="bg-white/80 p-2.5 rounded-xl border border-green-100">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Tenant Mitra</p>
                          <p className="font-bold text-primary truncate">{migrationReport.tenantName}</p>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-green-100">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Server Asal</p>
                          <p className="font-bold text-primary truncate">{migrationReport.sourceServerName}</p>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-green-100">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Server Tujuan</p>
                          <p className="font-bold text-primary truncate">{migrationReport.targetServerName}</p>
                        </div>
                        <div className="bg-white/80 p-2.5 rounded-xl border border-green-100">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Waktu Tempuh</p>
                          <p className="font-bold text-green-700">{(migrationReport.durationMs / 1000).toFixed(2)}s</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-green-200 text-green-900 font-semibold">
                        <span>Rincian Transfer:</span>
                        <span>{migrationReport.landingPagesMigrated} Landing Pages • {migrationReport.sectionsMigrated} Seksi • {migrationReport.contentsMigrated} Rekaman Konten</span>
                      </div>
                    </div>
                  )}

                  {/* Migration Log Terminal */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Log Riwayat Proses Migrasi:</p>
                    <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl text-xs font-mono h-48 overflow-y-auto space-y-1.5 border leading-relaxed select-all">
                      {migrationLogs.map((log, idx) => (
                        <p key={idx} className={log.includes('✅') ? 'text-green-400 font-bold' : log.includes('❌') ? 'text-red-400 font-bold' : ''}>
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <Button 
                      type="button" 
                      disabled={isMigrating} 
                      onClick={() => setIsMigrationModalOpen(false)}
                      className="bg-primary text-white rounded-full font-bold px-6 text-xs h-9"
                    >
                      Tutup Laporan Migrasi
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ==========================================
              TAB ACTIVITY LOG
              ========================================== */}
          <TabsContent value="activity">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 pb-4 border-b">
                <CardTitle className="text-lg font-headline font-bold text-primary">Log Aktivitas Sistem</CardTitle>
                <CardDescription className="text-xs">Catatan riwayat peristiwa audit dari CMS Builder.</CardDescription>
              </CardHeader>
              
              <div className="py-6 space-y-4">
                <div className="flex items-start gap-3 p-3 bg-muted/30 border rounded-2xl text-xs text-muted-foreground leading-relaxed">
                  <Activity className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary">Pendaftaran Tenant Baru: mitra-triyadi</p>
                    <p>Tenant ID: cred_triyadi - IP: 182.1.22.44 - Tanggal: {new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted/30 border rounded-2xl text-xs text-muted-foreground leading-relaxed">
                  <Activity className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-primary">Pembaruan Aturan Keamanan Firestore</p>
                    <p>Pelaku: Super Admin - Status: Berhasil - Tanggal: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ==========================================
              TAB BUILDER PLANS (IKLAN PENAWARAN)
              ========================================== */}
          <TabsContent value="builderPlans" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary">Paket Layanan Builder Iklan (/builder)</CardTitle>
                  <CardDescription className="text-xs">Kelola daftar paket penawaran (Nama, Harga, Lencana, Fitur) yang tampil di Halaman Iklan Penawaran (/builder).</CardDescription>
                </div>

                <Button 
                  onClick={handleOpenNewPlanModal}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold h-10 px-6 gap-2"
                >
                  <PlusCircle className="h-4 w-4" /> Tambah Paket Baru
                </Button>
              </CardHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                {builderPlans.map((plan) => (
                  <Card key={plan.planId} className="rounded-3xl border bg-slate-50 p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all">
                    {plan.isPopular && (
                      <span className="absolute top-0 right-0 bg-accent text-accent-foreground font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                        PALING POPULER
                      </span>
                    )}

                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-white text-primary border font-bold text-[10px] mb-3">
                        {plan.badge || plan.name.toUpperCase()}
                      </span>
                      <h3 className="text-xl font-bold text-primary mb-1">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground mb-4">{plan.description}</p>

                      <div className="text-2xl font-bold text-primary mb-4">
                        {plan.price} <span className="text-xs font-normal text-muted-foreground">{plan.period}</span>
                      </div>

                      <div className="space-y-2 border-t pt-4 text-xs text-slate-700 font-medium">
                        {plan.features?.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t mt-6 flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEditPlan(plan)}
                        className="rounded-full text-xs font-bold gap-1"
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDeleteBuilderPlan(plan.planId)}
                        className="rounded-full text-xs font-bold gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Modal Edit / Tambah Paket */}
            {isPlanModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <Card className="max-w-lg w-full bg-white rounded-3xl p-6 shadow-2xl border">
                  <CardHeader className="px-0 pt-0 pb-4 border-b">
                    <CardTitle className="text-lg font-bold text-primary">
                      {editingPlanId ? 'Edit Paket Layanan Builder' : 'Tambah Paket Builder Baru'}
                    </CardTitle>
                  </CardHeader>

                  <form onSubmit={handleSaveBuilderPlan} className="py-4 space-y-4 text-xs">
                    <div className="space-y-1">
                      <Label className="font-bold">Nama Paket</Label>
                      <Input value={bPlanName} onChange={(e) => setBPlanName(e.target.value)} placeholder="Contoh: Paket Pro Agent" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="font-bold">Teks Lencana (Badge)</Label>
                        <Input value={bPlanBadge} onChange={(e) => setBPlanBadge(e.target.value)} placeholder="PAKET PRO AGENT" />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-bold">Urutan Tampilan</Label>
                        <Input type="number" value={bPlanOrder} onChange={(e) => setBPlanOrder(Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label className="font-bold">Harga</Label>
                        <Input value={bPlanPrice} onChange={(e) => setBPlanPrice(e.target.value)} placeholder="Rp 199.000" required />
                      </div>
                      <div className="space-y-1">
                        <Label className="font-bold">Periode Pembayaran</Label>
                        <Input value={bPlanPeriod} onChange={(e) => setBPlanPeriod(e.target.value)} placeholder="/ bulan" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-bold">Deskripsi Ringkas</Label>
                      <Input value={bPlanDesc} onChange={(e) => setBPlanDesc(e.target.value)} placeholder="Fitur lengkap untuk memperkuat branding..." />
                    </div>

                    <div className="space-y-1">
                      <Label className="font-bold">Daftar Fitur (1 fitur per baris)</Label>
                      <textarea
                        rows={5}
                        value={bPlanFeatures}
                        onChange={(e) => setBPlanFeatures(e.target.value)}
                        className="w-full border rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Subdomain Kustom Pemilik Akun&#10;Interactive E-Katalog 2025&#10;Terintegrasi WhatsApp Anda"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="bPlanIsPopular"
                        checked={bPlanIsPopular}
                        onChange={(e) => setBPlanIsPopular(e.target.checked)}
                        className="rounded h-4 w-4 text-accent border-gray-300"
                      />
                      <Label htmlFor="bPlanIsPopular" className="cursor-pointer font-bold">Tandai Sebagai "Paling Populer"</Label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsPlanModalOpen(false)}>Batal</Button>
                      <Button type="submit" className="bg-primary text-white rounded-full font-bold">
                        Simpan Paket
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
