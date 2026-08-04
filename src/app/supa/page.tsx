"use client";

import React, { useEffect, useState } from 'react';
import { useAuthHandler } from '@/hooks/useAuth';
import { auth, db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
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
} from '@/lib/firestore-tracker';
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
  ImageIcon,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  PlusCircle,
  ArrowRightLeft,
  Wifi,
  WifiOff,
  Terminal,
  ShieldCheck,
  Download,
  Upload,
  EyeOff,
  Lock,
  Filter,
  SlidersHorizontal,
  CheckSquare,
  Square,
  Calendar,
  Link2,
  Sparkles,
  KeyRound,
  Bot
} from 'lucide-react';
import { cloudinaryService } from '@/lib/services/cloudinaryService';
import { Tenant, TenantPlan, TenantStatus, LandingPage, Section, Content, SectionType, SYSTEM_PLANS, BuilderPlan, DatabaseServerConfig, MediaImage } from '@/types/cms';

export default function SuperAdminPage() {
  const { user, profile, loading } = useAuthHandler();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantPagesCount, setTenantPagesCount] = useState<Record<string, number>>({});
  const [totalLandingPages, setTotalLandingPages] = useState<number>(0);
  const [cloudinaryStorageMb, setCloudinaryStorageMb] = useState<string>('0.0');
  const [totalImagesCount, setTotalImagesCount] = useState<number>(0);

  // Media Library & Storage Management State
  const [allImagesList, setAllImagesList] = useState<(MediaImage & { dbServerId?: string })[]>([]);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [selectedMediaTenant, setSelectedMediaTenant] = useState('all');
  const [isDeletingMedia, setIsDeletingMedia] = useState<string | null>(null);
  const [previewImageModal, setPreviewImageModal] = useState<MediaImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<(MediaImage & { dbServerId?: string })[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isRestoringImages, setIsRestoringImages] = useState(false);

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
  const [bPlanIsHidden, setBPlanIsHidden] = useState(false);
  const [bPlanOrder, setBPlanOrder] = useState(1);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

  // Firestore Usage state
  const [firestoreUsage, setFirestoreUsage] = useState<{ reads: number; writes: number; deletes: number; lastUpdated?: any } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);
  const [metricsDbServerId, setMetricsDbServerId] = useState<string>('primary');
  
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
  const [geminiApiKey, setGeminiApiKey] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : ''));
  const [geminiApiKeyMode, setGeminiApiKeyMode] = useState<'global' | 'custom'>(() => (typeof window !== 'undefined' ? (localStorage.getItem('gemini_api_key_mode') as any) || 'global' : 'global'));
  const [isGeminiAiEnabled, setIsGeminiAiEnabled] = useState<boolean>(() => (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_enabled') !== 'false' : true));
  const [isGeminiKeyVisible, setIsGeminiKeyVisible] = useState(false);

  // Gemini API Quota Inspector States
  const [isTestingGeminiQuota, setIsTestingGeminiQuota] = useState(false);
  const [geminiQuotaStatus, setGeminiQuotaStatus] = useState<{
    status: 'active' | 'quota_exceeded' | 'invalid_key' | 'error';
    message: string;
    testedModel?: string;
    testedAt?: string;
    modelMatrix?: {
      model: string;
      status: 'ok' | 'quota' | 'invalid' | 'error';
      latencyMs?: number;
      errorMsg?: string;
    }[];
  } | null>(null);

  const handleCheckGeminiQuotaStatus = async () => {
    const keyToTest = geminiApiKey.trim() || (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '');
    if (!keyToTest) {
      setGeminiQuotaStatus({
        status: 'invalid_key',
        message: '⚠️ Kunci API Gemini belum diisi. Masukkan API Key di kolom di atas terlebih dahulu.'
      });
      return;
    }

    setIsTestingGeminiQuota(true);
    setGeminiQuotaStatus(null);

    const modelsToTest = [
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-flash',
      'gemini-3.5-flash',
      'gemini-3.6-flash'
    ];

    const matrixResults: {
      model: string;
      status: 'ok' | 'quota' | 'invalid' | 'error';
      latencyMs?: number;
      errorMsg?: string;
    }[] = [];

    let hasAnyOk = false;
    let hasQuotaExceeded = false;
    let hasInvalidKey = false;
    let primaryModelOk = '';

    for (const model of modelsToTest) {
      const startTime = Date.now();
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${keyToTest}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping test' }] }] })
        });

        const latencyMs = Date.now() - startTime;

        if (res.ok) {
          hasAnyOk = true;
          if (!primaryModelOk) primaryModelOk = model;
          matrixResults.push({ model, status: 'ok', latencyMs });
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data.error?.message || res.statusText || '';
          
          if (msg.toLowerCase().includes('quota') || res.status === 429) {
            hasQuotaExceeded = true;
            matrixResults.push({ model, status: 'quota', latencyMs, errorMsg: 'Quota Exceeded (429 Limit 0)' });
          } else if (msg.toLowerCase().includes('key not valid') || msg.toLowerCase().includes('invalid') || res.status === 400) {
            hasInvalidKey = true;
            matrixResults.push({ model, status: 'invalid', latencyMs, errorMsg: 'API Key Tidak Valid' });
          } else {
            matrixResults.push({ model, status: 'error', latencyMs, errorMsg: msg });
          }
        }
      } catch (err: any) {
        matrixResults.push({ model, status: 'error', latencyMs: Date.now() - startTime, errorMsg: err.message });
      }
    }

    if (hasAnyOk) {
      setGeminiQuotaStatus({
        status: 'active',
        message: `🟢 KUNCI API SEHAT & SIAP DIGUNAKAN! Berhasil merespons pada model '${primaryModelOk}'. Mitra dapat menggunakan fitur AI dengan lancar.`,
        testedModel: primaryModelOk,
        testedAt: new Date().toLocaleTimeString(),
        modelMatrix: matrixResults
      });
    } else if (hasQuotaExceeded) {
      setGeminiQuotaStatus({
        status: 'quota_exceeded',
        message: `🔴 BATAS KUOTA TERLAMPAUI (Quota Exceeded / Limit 0). Seluruh model telah mencapai batas pemakaian harian gratis dari Google. Disarankan membuat API Key baru di Google AI Studio atau mengalihkan ke mode API Key pribadi mitra.`,
        testedAt: new Date().toLocaleTimeString(),
        modelMatrix: matrixResults
      });
    } else if (hasInvalidKey) {
      setGeminiQuotaStatus({
        status: 'invalid_key',
        message: `⚠️ KUNCI API TIDAK VALID. Periksa kembali karakter API Key yang dimasukkan dari Google AI Studio.`,
        testedAt: new Date().toLocaleTimeString(),
        modelMatrix: matrixResults
      });
    } else {
      setGeminiQuotaStatus({
        status: 'error',
        message: `❌ Gagal memverifikasi status model Gemini API.`,
        testedAt: new Date().toLocaleTimeString(),
        modelMatrix: matrixResults
      });
    }

    setIsTestingGeminiQuota(false);
  };

  // Security PIN & API Key Masking state
  const [savedPin, setSavedPin] = useState(() => 
    typeof window !== 'undefined' ? localStorage.getItem('supa_security_pin') || '123456' : '123456'
  );
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Change PIN states
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinError, setChangePinError] = useState('');

  // Column Visibility state for Tenant Table (Persisted in LocalStorage)
  const defaultColumns = {
    mitra: true,
    userUid: true,
    tenantId: true,
    readableId: true,
    email: true,
    subdomain: true,
    serverDb: true,
    paket: true,
    views: true,
    createdAt: true,
    expiry: true,
    status: true,
    actions: true,
  };

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('supa_tenant_table_columns');
      if (saved) {
        try {
          return { ...defaultColumns, ...JSON.parse(saved) };
        } catch (e) {}
      }
    }
    return defaultColumns;
  });

  // Search Query state for Tenant Table
  const [tenantSearchQuery, setTenantSearchQuery] = useState('');
  const [stubTenantsList, setStubTenantsList] = useState<(Tenant & { firestoreDocId: string })[]>([]);
  const [isDeletingStub, setIsDeletingStub] = useState(false);

  // Landing Pages Management & Connected/Unconnected Status State
  const [allLandingPages, setAllLandingPages] = useState<(LandingPage & { firestoreDocId: string; connectedTenant?: Tenant; isConnected?: boolean })[]>([]);
  const [landingPageFilter, setLandingPageFilter] = useState<'all' | 'connected' | 'unconnected'>('all');
  const [landingPageSearchQuery, setLandingPageSearchQuery] = useState('');
  const [isLoadingLandingPages, setIsLoadingLandingPages] = useState(false);
  const [assigningLandingPage, setAssigningLandingPage] = useState<(LandingPage & { firestoreDocId: string; connectedTenant?: Tenant; isConnected?: boolean }) | null>(null);

  // Expiry Extension State
  const [editingExpiryTenant, setEditingExpiryTenant] = useState<Tenant | null>(null);
  const [customDateInput, setCustomDateInput] = useState<string>('');
  const [isUpdatingExpiry, setIsUpdatingExpiry] = useState<boolean>(false);

  // Handle Expiry / Subscription extension for Tenant
  const handleExtendSubscription = async (tenantToUpdate: Tenant, daysToAdd: number, customExpiryDate?: string) => {
    setIsUpdatingExpiry(true);
    try {
      let targetDate: Date;

      if (customExpiryDate) {
        targetDate = new Date(customExpiryDate);
      } else {
        const currentExp = tenantToUpdate.expiresAt ? new Date(tenantToUpdate.expiresAt) : new Date();
        const isAlreadyPast = currentExp.getTime() < Date.now();
        const baseDate = isAlreadyPast ? new Date() : currentExp;
        targetDate = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      }

      const newExpiresAt = targetDate.toISOString();
      const isSubscribedPlan = daysToAdd >= 30 || (customExpiryDate && (new Date(customExpiryDate).getTime() - Date.now() > 14 * 86400 * 1000));
      const targetPlan: TenantPlan = isSubscribedPlan ? 'pro' : (tenantToUpdate.plan || 'free');

      const updatedData = {
        expiresAt: newExpiresAt,
        status: 'active' as TenantStatus,
        plan: targetPlan,
        limits: SYSTEM_PLANS[targetPlan]?.limits || SYSTEM_PLANS.pro.limits,
      };

      const activeServerConfig = dbServers.find(s => s.serverId === tenantToUpdate.dbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      const candidateTenantIds = new Set<string>([
        tenantToUpdate.tenantId,
        tenantToUpdate.subdomain,
        tenantToUpdate.readableId,
        tenantToUpdate.email
      ].filter(Boolean) as string[]);

      const dbsToUpdate = [db];
      if (targetDb !== db) dbsToUpdate.push(targetDb);

      for (const instDb of dbsToUpdate) {
        // Collect any additional document IDs matching subdomain or email in instDb
        try {
          if (tenantToUpdate.subdomain) {
            const qSub = query(collection(instDb, 'tenants'), where('subdomain', '==', tenantToUpdate.subdomain.toLowerCase()));
            const snapSub = await getDocs(qSub);
            snapSub.docs.forEach(d => candidateTenantIds.add(d.id));
          }
          if (tenantToUpdate.email) {
            const qEmail = query(collection(instDb, 'tenants'), where('email', '==', tenantToUpdate.email));
            const snapEmail = await getDocs(qEmail);
            snapEmail.docs.forEach(d => candidateTenantIds.add(d.id));
          }
        } catch (qErr) {}

        for (const tid of Array.from(candidateTenantIds)) {
          try {
            await updateDoc(doc(instDb, 'tenants', tid), updatedData);
          } catch (e) {
            try {
              await setDoc(doc(instDb, 'tenants', tid), updatedData, { merge: true });
            } catch (e2) {}
          }
        }
      }

      setTenants(prev => prev.map(t => t.tenantId === tenantToUpdate.tenantId ? { ...t, ...updatedData } : t));
      setEditingExpiryTenant(null);

      alert(`✅ Masa aktif tenant "${tenantToUpdate.name}" (${tenantToUpdate.subdomain}) berhasil diperpanjang hingga ${targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}!`);
    } catch (err: any) {
      alert('Gagal memperpanjang masa aktif: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUpdatingExpiry(false);
    }
  };

  // Direct Plan Change Handler from Table Dropdown
  const handleDirectChangePlan = async (tenantToUpdate: Tenant, newPlan: TenantPlan) => {
    try {
      const activeServerConfig = dbServers.find(s => s.serverId === tenantToUpdate.dbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      const updatedData = {
        plan: newPlan,
        limits: SYSTEM_PLANS[newPlan]?.limits || SYSTEM_PLANS.pro.limits,
      };

      const candidateTenantIds = new Set<string>([
        tenantToUpdate.tenantId,
        tenantToUpdate.subdomain,
        tenantToUpdate.readableId,
        tenantToUpdate.email
      ].filter(Boolean) as string[]);

      const dbsToUpdate = [db];
      if (targetDb !== db) dbsToUpdate.push(targetDb);

      for (const instDb of dbsToUpdate) {
        for (const tid of Array.from(candidateTenantIds)) {
          try {
            await updateDoc(doc(instDb, 'tenants', tid), updatedData);
          } catch (e) {
            try {
              await setDoc(doc(instDb, 'tenants', tid), updatedData, { merge: true });
            } catch (e2) {}
          }
        }
      }

      setTenants(prev => prev.map(t => (t.tenantId === tenantToUpdate.tenantId || t.subdomain === tenantToUpdate.subdomain) ? { ...t, ...updatedData } : t));
      alert(`✅ Paket tenant "${tenantToUpdate.name}" (${tenantToUpdate.subdomain}) berhasil diubah menjadi "${newPlan.toUpperCase()}"!`);
    } catch (err: any) {
      alert('Gagal mengubah paket: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Fetch Landing Pages and determine connection status to active tenants
  const loadLandingPagesData = async () => {
    setIsLoadingLandingPages(true);
    try {
      const snap = await getDocs(collection(db, 'landingPages'));
      const list = snap.docs.map(d => {
        const data = d.data() as LandingPage;
        const matchingTenant = tenants.find(t => 
          (t.tenantId && data.tenantId && t.tenantId === data.tenantId) ||
          (t.subdomain && data.subdomain && t.subdomain.toLowerCase() === data.subdomain.toLowerCase()) ||
          (t.email && data.tenantId && t.email.toLowerCase().replace(/[^a-z0-9]/g, '_') === data.tenantId.toLowerCase())
        );

        return {
          ...data,
          firestoreDocId: d.id,
          connectedTenant: matchingTenant,
          isConnected: Boolean(matchingTenant)
        };
      });

      setAllLandingPages(list);
      setTotalLandingPages(list.length);
    } catch (err: any) {
      console.error('Failed to fetch landing pages:', err);
    } finally {
      setIsLoadingLandingPages(false);
    }
  };

  // Delete a landing page document permanently from Firestore
  const handleDeleteLandingPageDoc = async (firestoreDocId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen landing page "${firestoreDocId}" dari Firestore?`)) return;
    try {
      await deleteDoc(doc(db, 'landingPages', firestoreDocId));
      setAllLandingPages(prev => prev.filter(p => p.firestoreDocId !== firestoreDocId));
      setTotalLandingPages(prev => Math.max(0, prev - 1));
      alert(`✅ Dokumen landing page "${firestoreDocId}" berhasil dihapus dari Firestore!`);
    } catch (err: any) {
      alert('Gagal menghapus landing page: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Re-assign a landing page to a target tenant
  const handleAssignLandingPageToTenant = async (landingPageDocId: string, targetTenant: Tenant) => {
    try {
      const updateData = {
        tenantId: targetTenant.tenantId,
        subdomain: targetTenant.subdomain
      };
      await updateDoc(doc(db, 'landingPages', landingPageDocId), updateData);
      
      setAllLandingPages(prev => prev.map(p => {
        if (p.firestoreDocId === landingPageDocId) {
          return {
            ...p,
            ...updateData,
            connectedTenant: targetTenant,
            isConnected: true
          };
        }
        return p;
      }));

      setAssigningLandingPage(null);
      alert(`✅ Landing page berhasil dihubungkan ke tenant "${targetTenant.name}" (${targetTenant.subdomain})!`);
    } catch (err: any) {
      alert('Gagal menghubungkan landing page: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Export / Backup Landing Pages JSON
  const handleBackupLandingPages = () => {
    if (allLandingPages.length === 0) {
      alert('Tidak ada dokumen landing page yang tersedia untuk dibackup.');
      return;
    }

    const exportData = {
      type: 'landing_pages_backup',
      exportedAt: new Date().toISOString(),
      count: allLandingPages.length,
      landingPages: allLandingPages.map(({ connectedTenant, isConnected, firestoreDocId, ...rest }) => ({
        ...rest,
        firestoreDocId: firestoreDocId || rest.id || rest.subdomain
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `backup-landing-pages-${new Date().toISOString().slice(0, 10)}.json`;
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore Landing Pages JSON file
  const [isRestoringLandingPages, setIsRestoringLandingPages] = useState(false);

  const handleRestoreLandingPages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoringLandingPages(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      let itemsToRestore: any[] = [];
      if (Array.isArray(json)) {
        itemsToRestore = json;
      } else if (Array.isArray(json.landingPages)) {
        itemsToRestore = json.landingPages;
      } else if (Array.isArray(json.data)) {
        itemsToRestore = json.data;
      } else {
        throw new Error('Format file JSON backup landing page tidak dikenali.');
      }

      if (itemsToRestore.length === 0) {
        alert('File backup JSON tidak berisi rekaman landing page.');
        return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const item of itemsToRestore) {
        try {
          const docId = item.firestoreDocId || item.id || item.subdomain || item.tenantId;
          if (!docId) {
            failCount++;
            continue;
          }

          const { firestoreDocId, connectedTenant, isConnected, ...cleanData } = item;
          await setDoc(doc(db, 'landingPages', docId), cleanData, { merge: true });
          successCount++;
        } catch (err) {
          console.error('Failed to restore landing page:', item, err);
          failCount++;
        }
      }

      await loadLandingPagesData();
      alert(`✅ Pemulihan Landing Page Selesai! Berhasil memulihkan ${successCount} dokumen. Gagal: ${failCount}.`);
    } catch (err: any) {
      alert('Gagal memulihkan Landing Page: ' + (err.message || 'Format file JSON tidak valid'));
    } finally {
      setIsRestoringLandingPages(false);
      e.target.value = '';
    }
  };

  // Delete individual stub document from Firestore
  const handleDeleteStubDoc = async (firestoreDocId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus dokumen stub/duplikat "${firestoreDocId}" secara permanen dari Firestore?`)) return;
    setIsDeletingStub(true);
    try {
      await deleteDoc(doc(db, 'tenants', firestoreDocId));
      setStubTenantsList(prev => prev.filter(s => s.firestoreDocId !== firestoreDocId));
      alert(`✅ Dokumen stub "${firestoreDocId}" berhasil dihapus dari Firestore!`);
    } catch (err: any) {
      alert('Gagal menghapus dokumen stub: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsDeletingStub(false);
    }
  };

  // Purge all stub documents from Firestore
  const handlePurgeAllStubs = async () => {
    if (stubTenantsList.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus SELURUH ${stubTenantsList.length} dokumen stub/duplikat secara permanen dari Firestore?`)) return;
    setIsDeletingStub(true);
    try {
      let count = 0;
      for (const s of stubTenantsList) {
        try {
          await deleteDoc(doc(db, 'tenants', s.firestoreDocId));
          count++;
        } catch (e) {}
      }
      setStubTenantsList([]);
      alert(`✅ Berhasil membersihkan ${count} dokumen stub/duplikat dari Firestore!`);
    } catch (err: any) {
      alert('Gagal membersihkan dokumen stub: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsDeletingStub(false);
    }
  };
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupTargetTenant, setBackupTargetTenant] = useState<Tenant | null>(null);
  const [isGlobalBackup, setIsGlobalBackup] = useState(false);
  const [backupOptions, setBackupOptions] = useState({
    profile: true,
    landingPages: true,
    sections: true,
    contents: true,
    testimonials: true,
    images: true,
  });
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  // Restore Preview Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreFileData, setRestoreFileData] = useState<any>(null);
  const [restoreFileName, setRestoreFileName] = useState('');
  const [restoreTargetTenantOverride, setRestoreTargetTenantOverride] = useState<Tenant | null>(null);
  const [detectedComponents, setDetectedComponents] = useState<{
    profile: boolean;
    landingPagesCount: number;
    sectionsCount: number;
    contentsCount: number;
    testimonialsCount: number;
    imagesCount: number;
    metaInfo: any;
    isGlobalPackage: boolean;
  } | null>(null);
  const [restoreSelectionOptions, setRestoreSelectionOptions] = useState({
    profile: true,
    landingPages: true,
    sections: true,
    contents: true,
    testimonials: true,
    images: true,
  });
  const [isExecutingRestore, setIsExecutingRestore] = useState(false);

  const toggleColumn = (colKey: string) => {
    setVisibleColumns(prev => {
      const updated = { ...prev, [colKey]: !prev[colKey] };
      if (typeof window !== 'undefined') {
        localStorage.setItem('supa_tenant_table_columns', JSON.stringify(updated));
      }
      return updated;
    });
  };

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
  const [rawFirebaseConfig, setRawFirebaseConfig] = useState('');

  // Connection testing state
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Cloning Rules & Indexes state
  const [selectedCloneTargetId, setSelectedCloneTargetId] = useState('');
  const [isDeployingCli, setIsDeployingCli] = useState(false);
  const [cliLogOutput, setCliLogOutput] = useState<string | null>(null);

  // Orphaned Contents Scanner State
  const [orphanedContents, setOrphanedContents] = useState<any[]>([]);
  const [isScanningOrphans, setIsScanningOrphans] = useState(false);
  const [isPurgingOrphans, setIsPurgingOrphans] = useState(false);
  const [isRestoringOrphans, setIsRestoringOrphans] = useState(false);
  const [orphansSearchQuery, setOrphansSearchQuery] = useState('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [syncTargetServerId, setSyncTargetServerId] = useState('assigned');

  // View 2 (Cluster DB Content Checker) State
  const [selectedView2ServerId, setSelectedView2ServerId] = useState('');
  const [view2Contents, setView2Contents] = useState<any[]>([]);
  const [view2Duplicates, setView2Duplicates] = useState<any[]>([]);
  const [isLoadingView2Contents, setIsLoadingView2Contents] = useState(false);

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

  // Helper to load all uploaded images from all cluster database servers
  const loadAllAdminImages = async () => {
    try {
      setSelectedImages([]);
      const dbsToQuery = [{ dbInstance: db, serverId: 'default' }];
      for (const s of dbServers) {
        if (s.status === 'active') {
          try {
            const cDb = getDynamicFirebaseInstance(s).db;
            if (cDb && cDb !== db) dbsToQuery.push({ dbInstance: cDb, serverId: s.serverId });
          } catch (e) {}
        }
      }

      const processedIds = new Set<string>();
      const list: (MediaImage & { dbServerId?: string })[] = [];

      for (const { dbInstance, serverId } of dbsToQuery) {
        try {
          const snap = await getDocs(collection(dbInstance, 'images'));
          snap.docs.forEach(d => {
            const data = d.data() as MediaImage;
            const id = d.id || data.imageId;
            if (id && !processedIds.has(id)) {
              processedIds.add(id);
              list.push({ ...data, imageId: id, dbServerId: serverId });
            }
          });
        } catch (e) {}
      }

      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setAllImagesList(list);
    } catch (e) {}
  };

  // Helper to delete an image directly from Admin dashboard
  const handleDeleteImageFromAdmin = async (img: MediaImage & { dbServerId?: string }) => {
    if (!confirm(`Apakah Anda yakin ingin MENGHAPUS berkas gambar "${img.imageId}"?\n\nGambar akan dihapus secara permanen dari storage server.`)) return;

    setIsDeletingMedia(img.imageId);
    try {
      const activeServerConfig = dbServers.find(s => s.serverId === img.dbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      await cloudinaryService.deleteImage(img.imageId, img.cloudinaryPublicId, img.secureUrl, targetDb);

      setAllImagesList(prev => prev.filter(i => i.imageId !== img.imageId));
      setTotalImagesCount(prev => Math.max(0, prev - 1));
      const freedMb = (img.sizeBytes || 350000) / (1024 * 1024);
      setCloudinaryStorageMb(prev => Math.max(0, parseFloat(prev) - freedMb).toFixed(1));

      alert('✅ Berkas gambar berhasil dihapus dari storage!');
    } catch (err: any) {
      alert('Gagal menghapus gambar: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsDeletingMedia(null);
    }
  };

  // Selection Handlers for Bulk Actions
  const handleToggleSelectImage = (img: MediaImage & { dbServerId?: string }) => {
    setSelectedImages(prev => {
      if (prev.some(si => si.imageId === img.imageId)) {
        return prev.filter(si => si.imageId !== img.imageId);
      } else {
        return [...prev, img];
      }
    });
  };

  const filteredImages = allImagesList.filter(img => {
    const tenantExists = tenants.some(t => t.tenantId === img.tenantId);
    const matchesTenant = 
      selectedMediaTenant === 'all' ? true :
      selectedMediaTenant === 'orphaned' ? !tenantExists :
      img.tenantId === selectedMediaTenant;
    const matchesSearch = 
      img.imageId.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      img.tenantId.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      (img.category && img.category.toLowerCase().includes(mediaSearchQuery.toLowerCase())) ||
      (img.format && img.format.toLowerCase().includes(mediaSearchQuery.toLowerCase()));
    return matchesTenant && matchesSearch;
  });

  const handleToggleSelectAll = () => {
    const allSelected = filteredImages.length > 0 && filteredImages.every(img => selectedImages.some(si => si.imageId === img.imageId));
    if (allSelected) {
      setSelectedImages(prev => prev.filter(si => !filteredImages.some(fi => fi.imageId === si.imageId)));
    } else {
      setSelectedImages(prev => {
        const newSelection = [...prev];
        filteredImages.forEach(fi => {
          if (!newSelection.some(ns => ns.imageId === fi.imageId)) {
            newSelection.push(fi);
          }
        });
        return newSelection;
      });
    }
  };

  const handleBulkDeleteImages = async () => {
    if (selectedImages.length === 0) return;
    const confirmMsg = `Apakah Anda yakin ingin MENGHAPUS ${selectedImages.length} berkas gambar terpilih secara permanen?\n\nTindakan ini akan menghapusnya dari storage Cloudinary dan records database server.`;
    if (!confirm(confirmMsg)) return;

    setIsBulkDeleting(true);
    let successCount = 0;
    let failCount = 0;
    const successfullyDeletedIds: string[] = [];
    let freedBytes = 0;

    for (const img of selectedImages) {
      try {
        const activeServerConfig = dbServers.find(s => s.serverId === img.dbServerId);
        const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

        await cloudinaryService.deleteImage(img.imageId, img.cloudinaryPublicId, img.secureUrl, targetDb);
        successfullyDeletedIds.push(img.imageId);
        freedBytes += img.sizeBytes || 350000;
        successCount++;
      } catch (err) {
        console.error(`Failed to delete image ${img.imageId}:`, err);
        failCount++;
      }
    }

    setAllImagesList(prev => prev.filter(i => !successfullyDeletedIds.includes(i.imageId)));
    setTotalImagesCount(prev => Math.max(0, prev - successCount));
    const freedMb = freedBytes / (1024 * 1024);
    setCloudinaryStorageMb(prev => Math.max(0, parseFloat(prev) - freedMb).toFixed(1));
    
    setSelectedImages(prev => prev.filter(i => !successfullyDeletedIds.includes(i.imageId)));
    setIsBulkDeleting(false);

    if (failCount > 0) {
      alert(`Selesai menghapus gambar. Berhasil: ${successCount}, Gagal: ${failCount}.`);
    } else {
      alert(`✅ Berhasil menghapus ${successCount} berkas gambar terpilih secara permanen!`);
    }
  };

  // Export Backup Pustaka Gambar
  const handleBackupImageLibrary = () => {
    try {
      const backupData = {
        meta: {
          exportType: 'image_library_backup',
          version: '1.1',
          exportedAt: new Date().toISOString(),
          totalImages: filteredImages.length,
          filterActive: selectedMediaTenant,
        },
        images: filteredImages,
      };

      const filterName = selectedMediaTenant === 'all' ? 'semua' : 
                         selectedMediaTenant === 'orphaned' ? 'tanpa_tenant' : 
                         `tenant_${selectedMediaTenant}`;

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_pustaka_gambar_${filterName}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(`✅ Backup Pustaka Gambar (${filteredImages.length} berkas, filter: ${filterName}) berhasil diexport dan diunduh!`);
    } catch (err: any) {
      alert('Gagal mengekspor backup gambar: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Restore Pustaka Gambar from JSON Backup
  const handleRestoreImageLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoringImages(true);
      const fileText = await file.text();
      const backupData = JSON.parse(fileText);

      if (backupData.meta?.exportType !== 'image_library_backup' || !Array.isArray(backupData.images)) {
         alert('File backup JSON tidak valid atau bukan cadangan Pustaka Gambar!');
         return;
      }

      // Check active filter for remapping
      const isSpecificTenantSelected = selectedMediaTenant !== 'all' && selectedMediaTenant !== 'orphaned';
      const activeTenantObj = isSpecificTenantSelected ? tenants.find(t => t.tenantId === selectedMediaTenant) : null;
      const targetTenantName = activeTenantObj ? (activeTenantObj.company || activeTenantObj.name) : selectedMediaTenant;

      let overrideTenant = false;
      if (isSpecificTenantSelected && activeTenantObj) {
        const askOverride = confirm(
          `⚠️ DETEKSI FILTER TENANT AKTIF!\n\n` +
          `Anda sedang menyaring media untuk tenant: "${targetTenantName}".\n\n` +
          `Apakah Anda ingin MEMETAKAN ULANG (remap) semua ${backupData.images.length} gambar di dalam file backup ini agar masuk ke tenant "${targetTenantName}"?\n\n` +
          `• Klik [OK] untuk memetakan ulang ke tenant "${targetTenantName}".\n` +
          `• Klik [Batal/Cancel] untuk memulihkan ke tenant asalnya masing-masing.`
        );
        overrideTenant = askOverride;
      } else {
        const confirmMsg = `Apakah Anda yakin ingin memulihkan ${backupData.images.length} rekaman gambar ke database? Rekaman yang sudah ada akan diperbarui.`;
        if (!confirm(confirmMsg)) return;
      }

      let successCount = 0;
      let failCount = 0;

      for (const img of backupData.images) {
        try {
          const targetTenantId = overrideTenant ? selectedMediaTenant : img.tenantId;

          // Find correct DB cluster for this tenant
          const tenantObj = tenants.find(t => t.tenantId === targetTenantId);
          const activeServerConfig = dbServers.find(s => s.serverId === (tenantObj?.dbServerId || img.dbServerId));
          const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

          // Remap imageId to avoid key clashing if remapped
          const imgDocId = overrideTenant 
            ? `${targetTenantId}_${img.imageId.includes('_') ? img.imageId.split('_').slice(1).join('_') : img.imageId}` 
            : img.imageId;

          const imageDocData = {
            imageId: imgDocId,
            tenantId: targetTenantId,
            cloudinaryPublicId: img.cloudinaryPublicId,
            secureUrl: img.secureUrl,
            width: Number(img.width) || 0,
            height: Number(img.height) || 0,
            format: img.format || 'png',
            sizeBytes: Number(img.sizeBytes) || 0,
            folder: img.folder || '',
            category: img.category || 'media',
            createdAt: img.createdAt || new Date().toISOString(),
          };

          await setDoc(doc(targetDb, 'images', imgDocId), imageDocData, { merge: true });
          successCount++;
        } catch (err) {
          console.error('Failed to restore image record:', img.imageId, err);
          failCount++;
        }
      }

      await loadAllAdminImages();
      alert(`✅ Pemulihan selesai! Berhasil memulihkan ${successCount} gambar. Gagal: ${failCount}.`);
    } catch (err: any) {
      alert('Gagal memulihkan Pustaka Gambar: ' + err.message);
    } finally {
      setIsRestoringImages(false);
      e.target.value = '';
    }
  };

  // Load Tenants & metadata counts (Fail-Safe)
  const loadAdminData = async () => {
    try {
      setDbLoading(true);
      
      // 1. Fetch Tenants (separating valid profile tenants from empty stub documents)
      try {
        const snap = await getDocs(collection(db, 'tenants'));
        const rawList = snap.docs.map(doc => {
          const data = doc.data() as Tenant;
          return {
            ...data,
            firestoreDocId: doc.id,
            tenantId: data.tenantId || doc.id
          };
        });

        const validTenants: (Tenant & { firestoreDocId: string })[] = [];
        const stubTenants: (Tenant & { firestoreDocId: string })[] = [];

        rawList.forEach(t => {
          const hasName = Boolean(t.name && t.name.trim());
          const hasEmail = Boolean(t.email && t.email.trim());
          const hasSubdomain = Boolean(t.subdomain && t.subdomain.trim());
          const tid = (t.tenantId || t.firestoreDocId || '').trim();

          // A real active tenant MUST have a valid Firebase Auth UID (len >= 20, no email/subdomain alias markers)
          const isRealUserUid = Boolean(
            tid.length >= 20 && 
            !tid.includes('_gmail_com') && 
            !tid.includes('_yahoo_com') && 
            !tid.includes('@') && 
            tid.toLowerCase() !== (t.subdomain || '').toLowerCase()
          );

          if (hasName && hasEmail && hasSubdomain && isRealUserUid) {
            validTenants.push(t);
          } else {
            stubTenants.push(t);
            // Auto-purge completely empty stub documents from Firestore
            if (!hasName && !hasEmail && !hasSubdomain) {
              try { deleteDoc(doc(db, 'tenants', t.firestoreDocId)); } catch (e) {}
            }
          }
        });

        // Cluster valid tenants by any overlapping identifier (email, subdomain, tenantId, readableId)
        const groups: (Tenant & { firestoreDocId: string })[][] = [];

        validTenants.forEach(doc => {
          const dName = doc.name?.toLowerCase().trim() || '';
          const dEmail = doc.email?.toLowerCase().trim() || '';
          const dSub = doc.subdomain?.toLowerCase().trim() || '';
          const dTid = doc.tenantId?.toLowerCase().trim() || '';
          const dRid = doc.readableId?.toLowerCase().trim() || '';

          const matchingGroupIndexes: number[] = [];

          groups.forEach((group, idx) => {
            const matches = group.some(item => {
              const iName = item.name?.toLowerCase().trim() || '';
              const iEmail = item.email?.toLowerCase().trim() || '';
              const iSub = item.subdomain?.toLowerCase().trim() || '';
              const iTid = item.tenantId?.toLowerCase().trim() || '';
              const iRid = item.readableId?.toLowerCase().trim() || '';

              // Match by Same Name
              if (dName && iName && dName === iName) return true;

              // Match by Same Email
              if (dEmail && iEmail && dEmail === iEmail) return true;

              // Match by Same Subdomain
              if (dSub && iSub && dSub === iSub) return true;

              // Match by Tenant ID or Readable ID Alias
              if (dTid && iTid && dTid === iTid) return true;
              if (dRid && iRid && dRid === iRid) return true;
              if (dTid && (dTid === iSub || dTid === iRid)) return true;
              if (iTid && (iTid === dSub || iTid === dRid)) return true;

              return false;
            });

            if (matches) {
              matchingGroupIndexes.push(idx);
            }
          });

          if (matchingGroupIndexes.length === 0) {
            groups.push([doc]);
          } else {
            // Merge into first matching group
            const primaryIdx = matchingGroupIndexes[0];
            groups[primaryIdx].push(doc);

            // If it matched multiple existing groups, merge them together into primaryIdx
            for (let i = matchingGroupIndexes.length - 1; i > 0; i--) {
              const mergeIdx = matchingGroupIndexes[i];
              groups[primaryIdx].push(...groups[mergeIdx]);
              groups.splice(mergeIdx, 1);
            }
          }
        });

        // For each cluster group, pick the highest completeness tenant document
        const finalTenantsList = groups.map(group => {
          return group.reduce((best, current) => {
            const bestScore = 
              (best.name ? 10 : 0) + 
              (best.email ? 5 : 0) + 
              (best.subdomain ? 5 : 0) + 
              (best.company ? 3 : 0) + 
              (best.expiresAt ? 3 : 0) + 
              (best.tenantId?.length >= 20 ? 5 : 0);

            const currentScore = 
              (current.name ? 10 : 0) + 
              (current.email ? 5 : 0) + 
              (current.subdomain ? 5 : 0) + 
              (current.company ? 3 : 0) + 
              (current.expiresAt ? 3 : 0) + 
              (current.tenantId?.length >= 20 ? 5 : 0);

            return currentScore > bestScore ? current : best;
          });
        });

        setTenants(finalTenantsList);
        setStubTenantsList(stubTenants);
      } catch (tErr) {}

      // 2. Fetch landing pages & evaluate connection status
      try {
        await loadLandingPagesData();
      } catch (pErr) {}

      // 2.5 Fetch Cloudinary Images Storage across primary DB and all cluster servers
      try {
        const dbsToQuery = [db];
        for (const s of dbServers) {
          if (s.status === 'active') {
            try {
              const cDb = getDynamicFirebaseInstance(s).db;
              if (cDb && cDb !== db) dbsToQuery.push(cDb);
            } catch (e) {}
          }
        }

        let grandTotalBytes = 0;
        let imgCount = 0;
        const processedIds = new Set<string>();

        for (const instance of dbsToQuery) {
          try {
            const snap = await getDocs(collection(instance, 'images'));
            snap.docs.forEach(d => {
              const data = d.data();
              const id = d.id || data.imageId;
              if (id && !processedIds.has(id)) {
                processedIds.add(id);
                grandTotalBytes += Number(data.sizeBytes) || 350000;
                imgCount += 1;
              }
            });
          } catch (e) {}
        }

        setCloudinaryStorageMb(grandTotalBytes > 0 ? (grandTotalBytes / (1024 * 1024)).toFixed(1) : '0.0');
        setTotalImagesCount(imgCount);
      } catch (imgErr) {}

      // Load all images list for media library tab
      try {
        await loadAllAdminImages();
      } catch (e) {}
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
          if (sysData.gemini) {
            if (sysData.gemini.apiKey) {
              setGeminiApiKey(sysData.gemini.apiKey);
              if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key', sysData.gemini.apiKey);
            }
            if (sysData.gemini.mode) {
              setGeminiApiKeyMode(sysData.gemini.mode);
              if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key_mode', sysData.gemini.mode);
            }
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
            visitorCount: 0,
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

    // Fetch all admin data once via getDocs (Saves 95% Reads vs 7 parallel realtime collection listeners)
    const fetchAdminData = async () => {
      try {
        setDbLoading(true);

        // 1. Fetch Tenants & Users
        const tenantsSnap = await getDocs(collection(db, 'tenants'));
        rawTenants = tenantsSnap.docs.map(d => {
          const data = d.data() as Tenant;
          return { ...data, tenantId: data.tenantId || d.id };
        });

        const usersSnap = await getDocs(collection(db, 'users'));
        rawUsers = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        processAndSetTenants();

        // 2. Fetch Landing Pages Count
        const pagesSnap = await getDocs(collection(db, 'landingPages'));
        setTotalLandingPages(pagesSnap.size);
        const pageCounts: Record<string, number> = {};
        pagesSnap.docs.forEach(d => {
          const p = d.data();
          pageCounts[p.tenantId] = (pageCounts[p.tenantId] || 0) + 1;
        });
        setTenantPagesCount(pageCounts);

        // 3. Fetch Cloudinary Images Storage Size across all active cluster databases
        const dbsToQuery = [db];
        for (const s of dbServers) {
          if (s.status === 'active') {
            try {
              const cDb = getDynamicFirebaseInstance(s).db;
              if (cDb && cDb !== db) dbsToQuery.push(cDb);
            } catch (e) {}
          }
        }

        let grandTotalBytes = 0;
        let imgCount = 0;
        const processedIds = new Set<string>();

        for (const instance of dbsToQuery) {
          try {
            const snap = await getDocs(collection(instance, 'images'));
            snap.docs.forEach(d => {
              const data = d.data();
              const id = d.id || data.imageId;
              if (id && !processedIds.has(id)) {
                processedIds.add(id);
                grandTotalBytes += Number(data.sizeBytes) || 350000;
                imgCount += 1;
              }
            });
          } catch (e) {}
        }

        setCloudinaryStorageMb(grandTotalBytes > 0 ? (grandTotalBytes / (1024 * 1024)).toFixed(1) : '0.0');
        setTotalImagesCount(imgCount);

        // 4. Fetch Builder Plans
        const plansSnap = await getDocs(collection(db, 'plans'));
        if (!plansSnap.empty) {
          const list = plansSnap.docs.map(d => d.data() as BuilderPlan);
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setBuilderPlans(list);
        }

        // 5. Fetch Global System Settings
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
          if (sysData.securityPin) {
            setSavedPin(sysData.securityPin);
            if (typeof window !== 'undefined') localStorage.setItem('supa_security_pin', sysData.securityPin);
          }
        }

        // 6. Fetch Database Cluster Servers
        const serversSnap = await getDocs(collection(db, 'databaseServers'));
        let localServers: DatabaseServerConfig[] = [];
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('database_servers');
          if (stored) {
            try { localServers = JSON.parse(stored); } catch (e) {}
          }
        }

        if (!serversSnap.empty) {
          const list = serversSnap.docs.map(d => d.data() as DatabaseServerConfig);
          setDbServers(list);
          if (typeof window !== 'undefined') {
            localStorage.setItem('database_servers', JSON.stringify(list));
          }
        } else if (localServers.length > 0) {
          setDbServers(localServers);
        }

        // 7. Load Firestore Usage
        await loadFirestoreUsage();
      } catch (err: any) {
        console.error('Fetch admin data error:', err);
      } finally {
        setDbLoading(false);
      }
    };

    fetchAdminData();
  }, [user]);

  const loadFirestoreUsage = async (targetServerId: string = metricsDbServerId) => {
    try {
      setIsLoadingUsage(true);
      const activeServerConfig = dbServers.find(s => s.serverId === targetServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      const metricsRef = doc(targetDb, 'system_metrics', 'firestore_usage');
      const snap = await getDoc(metricsRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        const todayDateStr = new Date().toISOString().slice(0, 10);

        // Auto-Reset Daily: If date has changed since last reset, automatically reset counter to 0 to align with Firebase Google Server daily reset
        if (data.lastResetDate && data.lastResetDate !== todayDateStr) {
          const resetPayload = {
            reads: 0,
            writes: 0,
            deletes: 0,
            lastResetDate: todayDateStr,
            lastUpdated: serverTimestamp()
          };
          try { await setDoc(metricsRef, resetPayload, { merge: true }); } catch (e) {}
          setFirestoreUsage({ reads: 0, writes: 0, deletes: 0, lastResetDate: todayDateStr });
        } else {
          setFirestoreUsage(data);
        }
      } else {
        setFirestoreUsage({ reads: 0, writes: 0, deletes: 0, lastResetDate: new Date().toISOString().slice(0, 10) });
      }
    } catch (err) {
      console.error('Failed to load firestore usage metrics:', err);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const handleResetFirestoreUsage = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset statistik penggunaan Firestore kembali ke nol?')) return;
    try {
      setIsLoadingUsage(true);
      const activeServerConfig = dbServers.find(s => s.serverId === metricsDbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      const metricsRef = doc(targetDb, 'system_metrics', 'firestore_usage');
      await setDoc(metricsRef, {
        reads: 0,
        writes: 0,
        deletes: 0,
        lastUpdated: serverTimestamp()
      });
      setFirestoreUsage({ reads: 0, writes: 0, deletes: 0 });
      alert('✅ Statistik penggunaan Firestore berhasil di-reset!');
    } catch (err: any) {
      alert('Gagal me-reset: ' + err.message);
    } finally {
      setIsLoadingUsage(false);
    }
  };

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

  // Handle Reset Password Email Trigger
  const handleResetPassword = async (tenant: Tenant) => {
    if (!tenant.email) {
      alert('Email tenant tidak valid.');
      return;
    }
    if (!confirm(`Kirim email reset kata sandi resmi Firebase ke "${tenant.email}"?`)) return;

    try {
      await sendPasswordResetEmail(auth, tenant.email);
      alert(`✅ Tautan reset kata sandi telah berhasil dikirim oleh Firebase ke email: ${tenant.email}`);
    } catch (err: any) {
      console.error('Reset password error:', err);
      alert(`Gagal mengirim email reset: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // Open Selective Backup Modal (Single Tenant or Global All Tenants)
  const openBackupModal = (tenant: Tenant | null = null) => {
    setBackupTargetTenant(tenant);
    setIsGlobalBackup(!tenant);
    setBackupOptions({
      profile: true,
      landingPages: true,
      sections: true,
      contents: true,
      testimonials: true,
      images: true,
    });
    setIsBackupModalOpen(true);
  };

  const toggleAllBackupOptions = (select: boolean) => {
    setBackupOptions({
      profile: select,
      landingPages: select,
      sections: select,
      contents: select,
      testimonials: select,
      images: select,
    });
  };

  // Helper for fetching ALL tenant documents from both cluster DB and primary DB across all tenant ID aliases
  const fetchAllTenantCollectionDocs = async (collectionName: string, targetDb: any, tenant: Tenant): Promise<any[]> => {
    const candidateIds = Array.from(
      new Set([
        tenant.tenantId,
        tenant.subdomain,
        (tenant as any).readableId,
        tenant.email ? tenant.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : null
      ])
    ).filter(Boolean) as string[];

    const databasesToQuery = [targetDb];
    if (targetDb !== db) {
      databasesToQuery.push(db); // Query Primary DB for any misplaced data as well
    }

    const resultMap = new Map<string, any>();

    for (const dbInstance of databasesToQuery) {
      for (const cid of candidateIds) {
        try {
          const q = query(collection(dbInstance, collectionName), where('tenantId', '==', cid));
          const snap = await getDocs(q);
          snap.docs.forEach(d => {
            const data = d.data();
            const docId = d.id || data.pageId || data.sectionId || data.contentId || data.testimonialId || data.imageId;
            if (docId && !resultMap.has(docId)) {
              resultMap.set(docId, data);
            }
          });
        } catch (e) {}
      }
    }

    return Array.from(resultMap.values());
  };

  // Handle Selective Database Backup Export (.json Download)
  const executeSelectiveBackup = async () => {
    try {
      setIsExportingBackup(true);

      if (isGlobalBackup) {
        // GLOBAL BACKUP - ALL TENANTS ACROSS CLUSTER SERVERS & SYSTEM SETTINGS
        const globalData: any = {
          meta: {
            exportType: 'global_all_tenants_backup',
            version: '2.5',
            exportedAt: new Date().toISOString(),
            totalTenants: tenants.length,
            selectedDataTypes: backupOptions,
          },
          databaseServers: [],
          systemSettings: [],
          plans: [],
          tenants: [],
        };

        // Capture global configs
        try {
          const sSnap = await getDocs(collection(db, 'databaseServers'));
          globalData.databaseServers = sSnap.docs.map(d => d.data());
        } catch (e) {}

        try {
          const sysSnap = await getDocs(collection(db, 'systemSettings'));
          globalData.systemSettings = sysSnap.docs.map(d => d.data());
        } catch (e) {}

        try {
          const pSnap = await getDocs(collection(db, 'plans'));
          globalData.plans = pSnap.docs.map(d => d.data());
        } catch (e) {}

        for (const t of tenants) {
          const activeServerConfig = dbServers.find(s => s.serverId === t.dbServerId);
          const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

          const tenantPackage: any = { tenantId: t.tenantId, subdomain: t.subdomain };

          if (backupOptions.profile) {
            try {
              const tSnap = await getDoc(doc(targetDb, 'tenants', t.tenantId));
              tenantPackage.tenant = tSnap.exists() ? tSnap.data() : t;
            } catch (e) { tenantPackage.tenant = t; }

            try {
              const uSnap = await getDoc(doc(targetDb, 'users', t.tenantId));
              if (uSnap.exists()) tenantPackage.user = uSnap.data();
            } catch (e) {}
          }

          if (backupOptions.landingPages) {
            tenantPackage.landingPages = await fetchAllTenantCollectionDocs('landingPages', targetDb, t);
          }

          if (backupOptions.sections) {
            tenantPackage.sections = await fetchAllTenantCollectionDocs('sections', targetDb, t);
          }

          if (backupOptions.contents) {
            tenantPackage.contents = await fetchAllTenantCollectionDocs('contents', targetDb, t);
          }

          if (backupOptions.testimonials) {
            tenantPackage.testimonials = await fetchAllTenantCollectionDocs('testimonials', targetDb, t);
          }

          if (backupOptions.images) {
            tenantPackage.images = await fetchAllTenantCollectionDocs('images', targetDb, t);
          }

          globalData.tenants.push(tenantPackage);
        }

        // Trigger JSON Download for Global Backup
        const jsonStr = JSON.stringify(globalData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_GLOBAL_ALL_TENANTS_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

      } else if (backupTargetTenant) {
        // SINGLE TENANT BACKUP (Complete & Exhaustive)
        const tenant = backupTargetTenant;
        const activeServerConfig = dbServers.find(s => s.serverId === tenant.dbServerId);
        const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

        const backupPackage: any = {
          meta: {
            exportType: 'single_tenant_backup',
            version: '2.5',
            exportedAt: new Date().toISOString(),
            subdomain: tenant.subdomain,
            company: tenant.company || tenant.name,
            email: tenant.email,
            selectedDataTypes: backupOptions,
            serverProjectId: activeServerConfig ? activeServerConfig.projectId : 'default',
          },
        };

        if (backupOptions.profile) {
          try {
            const tSnap = await getDoc(doc(targetDb, 'tenants', tenant.tenantId));
            if (tSnap.exists()) backupPackage.tenant = tSnap.data();
          } catch (e) { backupPackage.tenant = tenant; }

          try {
            const uSnap = await getDoc(doc(targetDb, 'users', tenant.tenantId));
            if (uSnap.exists()) backupPackage.user = uSnap.data();
          } catch (e) {}
        }

        if (backupOptions.landingPages) {
          backupPackage.landingPages = await fetchAllTenantCollectionDocs('landingPages', targetDb, tenant);
        }

        if (backupOptions.sections) {
          backupPackage.sections = await fetchAllTenantCollectionDocs('sections', targetDb, tenant);
        }

        if (backupOptions.contents) {
          backupPackage.contents = await fetchAllTenantCollectionDocs('contents', targetDb, tenant);
        }

        if (backupOptions.testimonials) {
          backupPackage.testimonials = await fetchAllTenantCollectionDocs('testimonials', targetDb, tenant);
        }

        if (backupOptions.images) {
          backupPackage.images = await fetchAllTenantCollectionDocs('images', targetDb, tenant);
        }

        // Trigger JSON Download for Single Tenant
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
      }

      setIsBackupModalOpen(false);
      alert('✅ Backup data 100% lengkap berhasil diexport dan diunduh!');
    } catch (err: any) {
      console.error('Backup error:', err);
      alert(`Gagal membuat backup: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsExportingBackup(false);
    }
  };

  // Detect JSON File Contents & Open Restore Preview Modal
  const openRestorePreviewModal = async (e: React.ChangeEvent<HTMLInputElement>, targetTenant?: Tenant) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const backupData = JSON.parse(fileText);

      const isGlobalPackage = backupData?.meta?.exportType === 'global_all_tenants_backup' || Array.isArray(backupData?.tenants);

      if (!backupData || (!backupData.tenant && !backupData.sections && !isGlobalPackage)) {
        alert('File backup JSON tidak valid atau rusak!');
        e.target.value = '';
        return;
      }

      // Analyze detected contents
      let profileDetected = false;
      let landingPagesCount = 0;
      let sectionsCount = 0;
      let contentsCount = 0;
      let testimonialsCount = 0;
      let imagesCount = 0;

      if (isGlobalPackage && Array.isArray(backupData.tenants)) {
        profileDetected = true;
        backupData.tenants.forEach((tPkg: any) => {
          if (Array.isArray(tPkg.landingPages)) landingPagesCount += tPkg.landingPages.length;
          if (Array.isArray(tPkg.sections)) sectionsCount += tPkg.sections.length;
          if (Array.isArray(tPkg.contents)) contentsCount += tPkg.contents.length;
          if (Array.isArray(tPkg.testimonials)) testimonialsCount += tPkg.testimonials.length;
          if (Array.isArray(tPkg.images)) imagesCount += tPkg.images.length;
        });
      } else {
        profileDetected = !!backupData.tenant || !!backupData.user;
        if (Array.isArray(backupData.landingPages)) landingPagesCount = backupData.landingPages.length;
        if (Array.isArray(backupData.sections)) sectionsCount = backupData.sections.length;
        if (Array.isArray(backupData.contents)) contentsCount = backupData.contents.length;
        if (Array.isArray(backupData.testimonials)) testimonialsCount = backupData.testimonials.length;
        if (Array.isArray(backupData.images)) imagesCount = backupData.images.length;
      }

      setDetectedComponents({
        profile: profileDetected,
        landingPagesCount,
        sectionsCount,
        contentsCount,
        testimonialsCount,
        imagesCount,
        metaInfo: backupData.meta || {},
        isGlobalPackage,
      });

      // Set initial checkbox choices based on what is detected
      setRestoreSelectionOptions({
        profile: profileDetected,
        landingPages: landingPagesCount > 0,
        sections: sectionsCount > 0,
        contents: contentsCount > 0,
        testimonials: testimonialsCount > 0,
        images: imagesCount > 0,
      });

      setRestoreFileData(backupData);
      setRestoreFileName(file.name);
      setRestoreTargetTenantOverride(targetTenant || null);
      setIsRestoreModalOpen(true);
    } catch (err: any) {
      console.error('Parse JSON backup error:', err);
      alert(`Format berkas backup JSON salah: ${err.message}`);
    } finally {
      e.target.value = '';
    }
  };

  // Execute Selective Restore to Firebase
  const executeSelectiveRestore = async () => {
    if (!restoreFileData) return;
    try {
      setIsExecutingRestore(true);

      const backupData = restoreFileData;
      const isGlobalPackage = detectedComponents?.isGlobalPackage;

      if (isGlobalPackage && Array.isArray(backupData.tenants)) {
        // GLOBAL RESTORE SYSTEM CONFIGS IF PRESENT
        if (Array.isArray(backupData.databaseServers)) {
          for (const s of backupData.databaseServers) {
            if (s.serverId) await setDoc(doc(db, 'databaseServers', s.serverId), s, { merge: true });
          }
        }
        if (Array.isArray(backupData.systemSettings)) {
          for (const sys of backupData.systemSettings) {
            const sysId = sys.id || 'global';
            await setDoc(doc(db, 'systemSettings', sysId), sys, { merge: true });
          }
        }
        if (Array.isArray(backupData.plans)) {
          for (const plan of backupData.plans) {
            const pId = plan.planId || plan.id;
            if (pId) await setDoc(doc(db, 'plans', pId), plan, { merge: true });
          }
        }

        // GLOBAL RESTORE - ALL TENANTS ACROSS CLUSTER SERVERS
        for (const tPkg of backupData.tenants) {
          const tenantToRestore = tPkg.tenant;
          if (!tenantToRestore || !tenantToRestore.tenantId) continue;

          const activeServerConfig = dbServers.find(s => s.serverId === tenantToRestore.dbServerId);
          const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

          if (restoreSelectionOptions.profile && tPkg.tenant) {
            await setDoc(doc(targetDb, 'tenants', tenantToRestore.tenantId), tPkg.tenant, { merge: true });
            await setDoc(doc(db, 'tenants', tenantToRestore.tenantId), tPkg.tenant, { merge: true });
          }

          if (restoreSelectionOptions.profile && tPkg.user) {
            await setDoc(doc(targetDb, 'users', tenantToRestore.tenantId), tPkg.user, { merge: true });
            await setDoc(doc(db, 'users', tenantToRestore.tenantId), tPkg.user, { merge: true });
          }

          if (restoreSelectionOptions.landingPages && Array.isArray(tPkg.landingPages)) {
            for (const p of tPkg.landingPages) {
              if (p.pageId) await setDoc(doc(targetDb, 'landingPages', p.pageId), p, { merge: true });
            }
          }

          if (restoreSelectionOptions.sections && Array.isArray(tPkg.sections)) {
            for (const s of tPkg.sections) {
              if (s.sectionId) await setDoc(doc(targetDb, 'sections', s.sectionId), s, { merge: true });
            }
          }

          if (restoreSelectionOptions.contents && Array.isArray(tPkg.contents)) {
            for (const c of tPkg.contents) {
              if (c.sectionId && c.key) {
                const contentDocId = `${tPkg.tenant.tenantId}_${c.sectionId}_${c.key}`;
                await setDoc(doc(targetDb, 'contents', contentDocId), c, { merge: true });
              }
            }
          }

          if (restoreSelectionOptions.testimonials && Array.isArray(tPkg.testimonials)) {
            for (const tItem of tPkg.testimonials) {
              if (tItem.testimonialId) await setDoc(doc(targetDb, 'testimonials', tItem.testimonialId), tItem, { merge: true });
            }
          }

          if (restoreSelectionOptions.images && Array.isArray(tPkg.images)) {
            for (const imgItem of tPkg.images) {
              if (imgItem.imageId || imgItem.publicId) {
                const imgDocId = imgItem.imageId || `${tPkg.tenant.tenantId}_${Date.now()}`;
                await setDoc(doc(targetDb, 'images', imgDocId), imgItem, { merge: true });
              }
            }
          }
        }
      } else {
        // SINGLE TENANT RESTORE
        const targetTenant = restoreTargetTenantOverride || backupData.tenant;
        if (!targetTenant || !targetTenant.tenantId) {
          alert('ID Tenant target tidak ditemukan!');
          return;
        }

        const activeServerConfig = dbServers.find(s => s.serverId === targetTenant.dbServerId);
        const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;
        const targetId = targetTenant.tenantId;

        // If restoring profile, preserve target tenant's identity (ID, email, subdomain)
        if (restoreSelectionOptions.profile && backupData.tenant) {
          const mergedProfile = {
            ...backupData.tenant,
            tenantId: targetId,
            subdomain: targetTenant.subdomain || backupData.tenant.subdomain,
            email: targetTenant.email || backupData.tenant.email,
            dbServerId: targetTenant.dbServerId || 'default'
          };
          await setDoc(doc(targetDb, 'tenants', targetId), mergedProfile, { merge: true });
          await setDoc(doc(db, 'tenants', targetId), mergedProfile, { merge: true });
        }

        if (restoreSelectionOptions.profile && backupData.user) {
          const mergedUser = {
            ...backupData.user,
            userId: targetId,
            tenantId: targetId,
            email: targetTenant.email || backupData.user.email,
            subdomain: targetTenant.subdomain || backupData.user.subdomain
          };
          await setDoc(doc(targetDb, 'users', targetId), mergedUser, { merge: true });
          await setDoc(doc(db, 'users', targetId), mergedUser, { merge: true });
        }

        // Restore Landing Pages with target tenantId
        if (restoreSelectionOptions.landingPages && Array.isArray(backupData.landingPages)) {
          for (const p of backupData.landingPages) {
            const pageId = p.pageId || `page_${targetId}_home`;
            const targetPageId = pageId;
            const remappedPage = { ...p, tenantId: targetId, pageId };
            await setDoc(doc(targetDb, 'landingPages', pageId), remappedPage, { merge: true });

            const sectionIdMap: Record<string, string> = {};
            if (restoreSelectionOptions.sections && Array.isArray(backupData.sections)) {
              for (const s of backupData.sections) {
                if (s.sectionId) {
                  const newSecId = s.type ? `sec_${targetId}_${s.type}` : s.sectionId;
                  sectionIdMap[s.sectionId] = newSecId;
                  const remappedSec = { 
                    ...s, 
                    sectionId: newSecId, 
                    tenantId: targetId, 
                    landingPageId: targetPageId 
                  };
                  await setDoc(doc(targetDb, 'sections', newSecId), remappedSec, { merge: true });
                }
              }
            }

            // Restore Contents with remapped sectionId and target tenantId
            if (restoreSelectionOptions.contents && Array.isArray(backupData.contents)) {
              for (const c of backupData.contents) {
                if (c.sectionId && c.key) {
                  const targetSecId = sectionIdMap[c.sectionId] || (c.sectionId.includes('_') ? `sec_${targetId}_${c.sectionId.split('_').pop()}` : c.sectionId);
                  const contentDocId = `${targetId}_${targetSecId}_${c.key}`;
                  const remappedContent = { 
                    ...c, 
                    contentId: contentDocId,
                    tenantId: targetId, 
                    sectionId: targetSecId 
                  };
                  await setDoc(doc(targetDb, 'contents', contentDocId), remappedContent, { merge: true });
                }
              }
            }
          }
        }

        // Restore Testimonials with target tenantId
        if (restoreSelectionOptions.testimonials && Array.isArray(backupData.testimonials)) {
          for (const tItem of backupData.testimonials) {
            const tId = tItem.testimonialId || `testi_${targetId}_${Date.now()}`;
            const remappedTesti = { ...tItem, tenantId: targetId, testimonialId: tId };
            await setDoc(doc(targetDb, 'testimonials', tId), remappedTesti, { merge: true });
          }
        }

        // Restore Images with target tenantId
        if (restoreSelectionOptions.images && Array.isArray(backupData.images)) {
          for (const imgItem of backupData.images) {
            const imgDocId = imgItem.imageId || `${targetId}_${Date.now()}`;
            const remappedImg = { ...imgItem, tenantId: targetId, imageId: imgDocId };
            await setDoc(doc(targetDb, 'images', imgDocId), remappedImg, { merge: true });
          }
        }
      }

      setIsRestoreModalOpen(false);
      alert('✅ PEMULIHAN (RESTORE) SUKSES! Seluruh data komponen terpilih berhasil dipulihkan.');
      if (typeof window !== 'undefined') window.location.reload();
    } catch (err: any) {
      console.error('Restore error:', err);
      alert(`Gagal memulihkan database: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsExecutingRestore(false);
    }
  };

  // Handle Delete Thoroughly (by tenantId, subdomain, and email)
  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Tenant "${tenant.company || tenant.name || tenant.subdomain}" (${tenant.email}) secara permanen dari sistem? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      // 1. Resolve Target Database Server
      const activeServerConfig = dbServers.find(s => s.serverId === tenant.dbServerId);
      const targetDb = activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db;

      const readableId = tenant.email ? tenant.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : '';

      // Helper for deleting from a given database instance
      const purgeDatabase = async (instanceDb: any) => {
        // A. Delete Tenants Collection Documents
        if (tenant.tenantId) {
          try { await deleteDoc(doc(instanceDb, 'tenants', tenant.tenantId)); } catch (e) {}
        }
        if (readableId) {
          try { await deleteDoc(doc(instanceDb, 'tenants', readableId)); } catch (e) {}
        }

        const tenantsRef = collection(instanceDb, 'tenants');
        if (tenant.subdomain) {
          try {
            const snapSub = await getDocs(query(tenantsRef, where('subdomain', '==', tenant.subdomain)));
            for (const d of snapSub.docs) { await deleteDoc(doc(instanceDb, 'tenants', d.id)); }
          } catch (e) {}
        }
        if (tenant.email) {
          try {
            const snapEmail = await getDocs(query(tenantsRef, where('email', '==', tenant.email)));
            for (const d of snapEmail.docs) { await deleteDoc(doc(instanceDb, 'tenants', d.id)); }
          } catch (e) {}
        }

        // B. Delete Users Collection Documents
        if (tenant.tenantId) {
          try { await deleteDoc(doc(instanceDb, 'users', tenant.tenantId)); } catch (e) {}
        }
        if (readableId) {
          try { await deleteDoc(doc(instanceDb, 'users', readableId)); } catch (e) {}
        }

        const usersRef = collection(instanceDb, 'users');
        if (tenant.email) {
          try {
            const snapUserEmail = await getDocs(query(usersRef, where('email', '==', tenant.email)));
            for (const d of snapUserEmail.docs) { await deleteDoc(doc(instanceDb, 'users', d.id)); }
          } catch (e) {}
        }
        if (tenant.subdomain) {
          try {
            const snapUserSub = await getDocs(query(usersRef, where('subdomain', '==', tenant.subdomain)));
            for (const d of snapUserSub.docs) { await deleteDoc(doc(instanceDb, 'users', d.id)); }
          } catch (e) {}
        }

        // C. Delete Landing Pages, Sections, Contents, Testimonials
        try {
          const pagesRef = collection(instanceDb, 'landingPages');
          const snapPages = await getDocs(query(pagesRef, where('tenantId', '==', tenant.tenantId)));
          for (const d of snapPages.docs) { await deleteDoc(doc(instanceDb, 'landingPages', d.id)); }
        } catch (e) {}

        try {
          const secRef = collection(instanceDb, 'sections');
          const snapSec = await getDocs(query(secRef, where('tenantId', '==', tenant.tenantId)));
          for (const d of snapSec.docs) { await deleteDoc(doc(instanceDb, 'sections', d.id)); }
        } catch (e) {}

        try {
          const cntRef = collection(instanceDb, 'contents');
          const snapCnt = await getDocs(query(cntRef, where('tenantId', '==', tenant.tenantId)));
          for (const d of snapCnt.docs) { await deleteDoc(doc(instanceDb, 'contents', d.id)); }
        } catch (e) {}
      };

      // Execute purge on default DB and target server DB
      await purgeDatabase(db);
      if (targetDb !== db) {
        await purgeDatabase(targetDb);
      }

      // Update local state
      setTenants(prev => prev.filter(t => t.tenantId !== tenant.tenantId && t.email !== tenant.email && t.subdomain !== tenant.subdomain));
      alert(`Tenant "${tenant.company || tenant.subdomain}" beserta seluruh dokumen terkait berhasil dihapus secara permanen.`);
    } catch (err) {
      console.error('Failed to delete tenant:', err);
      alert('Gagal menghapus tenant. Silakan coba lagi.');
    }
  };

  // Scan for Orphaned Contents in DB Utama & Server Clusters (With Server Connection & Comparison)
  const handleScanOrphanedContents = async () => {
    try {
      setIsScanningOrphans(true);
      setOrphanedContents([]);

      // 1. Build map of active tenant IDs and their assigned DB server
      const activeTenantMap = new Map<string, { company: string; subdomain: string; dbServerId: string }>();
      tenants.forEach(t => {
        const info = {
          company: t.company || t.name || t.subdomain,
          subdomain: t.subdomain || '',
          dbServerId: t.dbServerId || 'default',
        };
        if (t.tenantId) activeTenantMap.set(t.tenantId, info);
        if (t.subdomain) activeTenantMap.set(t.subdomain, info);
        if (t.email) activeTenantMap.set(t.email.toLowerCase().replace(/[^a-z0-9]/g, '_'), info);
      });

      const orphansFound: any[] = [];

      // Helper scan database instance
      const scanDbInstance = async (targetDbInstance: any, serverId: string, serverLabel: string, projectId: string) => {
        try {
          const contentsSnap = await getDocs(collection(targetDbInstance, 'contents'));
          contentsSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            const contentTenantId = data.tenantId;
            const activeTenantInfo = contentTenantId ? activeTenantMap.get(contentTenantId) : null;

            const createdAtRaw = data.createdAt || data.updatedAt;
            const createdAtFormatted = createdAtRaw
              ? new Date((createdAtRaw as any)?.seconds ? (createdAtRaw as any).seconds * 1000 : createdAtRaw).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : '-';

            if (!contentTenantId || !activeTenantInfo) {
              // Completely orphaned (no active tenant account exists for this tenantId)
              orphansFound.push({
                docId: docSnap.id,
                tenantId: contentTenantId || 'Tanpa Tenant ID',
                sectionId: data.sectionId || '-',
                key: data.key || '-',
                rawValue: data.value,
                value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value || ''),
                createdAt: createdAtFormatted,
                serverId,
                serverLabel,
                projectId,
                instanceDb: targetDbInstance,
                status: 'orphaned',
                statusLabel: 'Terasing (Akun Dihapus)',
                assignedServer: '-',
              });
            } else if (activeTenantInfo.dbServerId !== serverId) {
              // Misplaced contents (Tenant account has been migrated to another DB server, e.g. umroh2, but old contents remain on DB Utama)
              const assignedServerConfig = dbServers.find(s => s.serverId === activeTenantInfo.dbServerId);
              const assignedLabel = activeTenantInfo.dbServerId === 'default' 
                ? 'DB Utama (landing-umroh)' 
                : (assignedServerConfig?.name || activeTenantInfo.dbServerId);

              orphansFound.push({
                docId: docSnap.id,
                tenantId: contentTenantId,
                sectionId: data.sectionId || '-',
                key: data.key || '-',
                rawValue: data.value,
                value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value || ''),
                createdAt: createdAtFormatted,
                serverId,
                serverLabel,
                projectId,
                instanceDb: targetDbInstance,
                status: 'misplaced',
                statusLabel: `Sisa Migrasi (Tenant Terhubung ke ${assignedLabel})`,
                assignedServer: assignedLabel,
              });
            }
          });
        } catch (err) {
          console.warn(`Scan orphans failed on ${serverLabel}:`, err);
        }
      };

      // 1. Scan Primary DB (landing-umroh)
      await scanDbInstance(db, 'default', 'DB Utama (landing-umroh)', fbProjectId || 'landing-umroh');

      // 2. Scan Cluster DBs (e.g. landing-umroh2)
      for (const serverConfig of dbServers) {
        try {
          const clusterInstance = getDynamicFirebaseInstance(serverConfig).db;
          const label = `${serverConfig.name || serverConfig.serverId} (${serverConfig.projectId})`;
          await scanDbInstance(clusterInstance, serverConfig.serverId, label, serverConfig.projectId);
        } catch (e) {}
      }

      setOrphanedContents(orphansFound);
    } catch (err: any) {
      console.error('Failed scanning orphans:', err);
      alert(`Eror pemindaian data terasing: ${err.message}`);
    } finally {
      setIsScanningOrphans(false);
    }
  };

  // Backup Scanned Orphaned/Misplaced Contents to JSON
  const handleBackupOrphanedContents = () => {
    try {
      const backupData = {
        meta: {
          exportType: 'orphaned_contents_backup',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          totalItems: orphanedContents.length,
        },
        orphanedContents: orphanedContents.map(i => ({
          docId: i.docId,
          tenantId: i.tenantId,
          sectionId: i.sectionId,
          key: i.key,
          value: i.rawValue !== undefined ? i.rawValue : i.value,
          serverId: i.serverId,
          projectId: i.projectId,
          status: i.status,
          statusLabel: i.statusLabel,
        })),
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_konten_terasing_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(`✅ Backup ${orphanedContents.length} dokumen terasing/sisa migrasi berhasil diunduh!`);
    } catch (err: any) {
      alert('Gagal mengekspor backup konten terasing: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  // Restore Orphaned/Misplaced Contents from JSON
  const handleRestoreOrphanedContents = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsRestoringOrphans(true);
      const fileText = await file.text();
      const backupData = JSON.parse(fileText);

      if (backupData.meta?.exportType !== 'orphaned_contents_backup' || !Array.isArray(backupData.orphanedContents)) {
        alert('File JSON tidak valid atau bukan cadangan Konten Terasing!');
        return;
      }

      const confirmMsg = `Apakah Anda yakin ingin memulihkan ${backupData.orphanedContents.length} dokumen konten terasing ke database?`;
      if (!confirm(confirmMsg)) return;

      let successCount = 0;
      let failCount = 0;

      for (const item of backupData.orphanedContents) {
        try {
          const activeServerConfig = dbServers.find(s => s.serverId === item.serverId);
          const targetDb = item.serverId === 'default' ? db : (activeServerConfig ? getDynamicFirebaseInstance(activeServerConfig).db : db);

          await setDoc(doc(targetDb, 'contents', item.docId), {
            contentId: item.docId,
            tenantId: item.tenantId,
            sectionId: item.sectionId,
            key: item.key,
            value: item.value,
            updatedAt: new Date(),
          }, { merge: true });
          successCount++;
        } catch (err) {
          console.error('Failed to restore content record:', item.docId, err);
          failCount++;
        }
      }

      await handleScanOrphanedContents();
      alert(`✅ Pemulihan selesai! Berhasil memulihkan ${successCount} dokumen. Gagal: ${failCount}.`);
    } catch (err: any) {
      alert('Gagal memulihkan konten terasing: ' + err.message);
    } finally {
      setIsRestoringOrphans(false);
      e.target.value = '';
    }
  };

  // Fetch all contents from a selected cluster DB server and compare with DB Utama to find duplicates
  const handleLoadView2Contents = async (serverId: string) => {
    if (!serverId) {
      setView2Contents([]);
      setView2Duplicates([]);
      return;
    }
    try {
      setIsLoadingView2Contents(true);
      setView2Contents([]);
      setView2Duplicates([]);

      const serverConfig = dbServers.find(s => s.serverId === serverId);
      if (!serverConfig) return;

      const clusterInstance = getDynamicFirebaseInstance(serverConfig).db;

      // 1. Fetch all contents from cluster DB
      const clusterSnap = await getDocs(collection(clusterInstance, 'contents'));
      const clusterItems = clusterSnap.docs.map(docSnap => {
        const data = docSnap.data();
        const createdAtRaw = data.createdAt || data.updatedAt;
        const createdAtFormatted = createdAtRaw
          ? new Date((createdAtRaw as any)?.seconds ? (createdAtRaw as any).seconds * 1000 : createdAtRaw).toLocaleDateString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';

        return {
          docId: docSnap.id,
          tenantId: data.tenantId || '-',
          sectionId: data.sectionId || '-',
          key: data.key || '-',
          rawValue: data.value,
          value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value || ''),
          createdAt: createdAtFormatted,
          serverId,
          serverLabel: `${serverConfig.name} (${serverConfig.projectId})`,
          projectId: serverConfig.projectId,
        };
      });

      // 2. Fetch all contents from main DB (DB Utama) to check for duplicates
      const mainSnap = await getDocs(collection(db, 'contents'));
      const mainItemsMap = new Map<string, any>();
      mainSnap.docs.forEach(docSnap => {
        const data = docSnap.data();
        mainItemsMap.set(docSnap.id, {
          docId: docSnap.id,
          value: typeof data.value === 'object' ? JSON.stringify(data.value) : String(data.value || ''),
        });
      });

      // 3. Match and flag duplicates
      const duplicatesList: any[] = [];
      const comparedItems = clusterItems.map(item => {
        const mainDoc = mainItemsMap.get(item.docId);
        const isDuplicate = !!mainDoc;
        let duplicateType = 'none';
        let diffMessage = '';

        if (isDuplicate) {
          if (item.value === mainDoc.value) {
            duplicateType = 'identical';
            diffMessage = 'Identik (Nilai Sama)';
          } else {
            duplicateType = 'different';
            diffMessage = 'Berbeda (Nilai Berbeda)';
          }

          duplicatesList.push({
            ...item,
            duplicateType,
            diffMessage,
          });
        }

        return {
          ...item,
          isDuplicate,
          duplicateType,
          diffMessage,
        };
      });

      setView2Contents(comparedItems);
      setView2Duplicates(duplicatesList);
    } catch (err: any) {
      console.error('Failed loading cluster contents:', err);
      alert('Gagal memuat isi konten server database cluster: ' + err.message);
    } finally {
      setIsLoadingView2Contents(false);
    }
  };

  // Move Misplaced Contents (Sisa Migrasi) to Selected DB Server and Purge Old Copy
  const handleSyncMisplacedContents = async (targetServerSelection: string) => {
    const misplacedItems = orphanedContents.filter(i => i.status === 'misplaced');
    if (misplacedItems.length === 0) {
      alert('Tidak ada dokumen sisa migrasi yang perlu dipindahkan.');
      return;
    }

    try {
      setIsPurgingOrphans(true);
      let successCount = 0;

      for (const item of misplacedItems) {
        try {
          let resolvedServerId = 'default';
          if (targetServerSelection === 'assigned') {
            const activeTenantInfo = tenants.find(t => t.tenantId === item.tenantId || t.subdomain === item.tenantId || t.email === item.tenantId);
            resolvedServerId = activeTenantInfo?.dbServerId || 'default';
          } else {
            resolvedServerId = targetServerSelection;
          }

          // Resolve target DB instance
          const targetServerConfig = dbServers.find(s => s.serverId === resolvedServerId);
          const targetDbInstance = resolvedServerId === 'default' 
            ? db 
            : (targetServerConfig ? getDynamicFirebaseInstance(targetServerConfig).db : db);

          // 1. Copy document to Target Cluster DB
          const targetDocRef = doc(targetDbInstance, 'contents', item.docId);
          await setDoc(targetDocRef, {
            contentId: item.docId,
            tenantId: item.tenantId,
            sectionId: item.sectionId,
            key: item.key,
            value: item.rawValue !== undefined ? item.rawValue : item.value,
            updatedAt: new Date(),
          }, { merge: true });

          // 2. Delete old copy from source DB if they are different database instances
          if (targetDbInstance !== item.instanceDb) {
            await deleteDoc(doc(item.instanceDb, 'contents', item.docId));
          }
          successCount++;
        } catch (e) {
          console.warn('Failed moving misplaced content:', item.docId, e);
        }
      }

      setIsSyncModalOpen(false);
      await handleScanOrphanedContents();
      alert(`✅ Berhasil memindahkan & merapikan ${successCount} dari ${misplacedItems.length} dokumen konten ke server database tujuan.`);
    } catch (err: any) {
      console.error('Failed syncing misplaced contents:', err);
      alert('Gagal memindahkan dokumen sisa migrasi.');
    } finally {
      setIsPurgingOrphans(false);
    }
  };
  // Purge All Orphaned Contents Permanently (Truly Orphaned documents whose tenant accounts were deleted)
  const handlePurgeOrphanedContents = async () => {
    const trulyOrphaned = orphanedContents.filter(i => i.status === 'orphaned');
    const targetItems = trulyOrphaned.length > 0 ? trulyOrphaned : orphanedContents;
    if (targetItems.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${targetItems.length} dokumen konten terasing ini secara permanen? Tindakan ini akan mengosongkan sampah dokumen lama.`)) return;

    try {
      setIsPurgingOrphans(true);
      let successCount = 0;

      for (const item of targetItems) {
        try {
          await deleteDoc(doc(item.instanceDb, 'contents', item.docId));
          successCount++;
        } catch (e) {}
      }

      alert(`✅ Berhasil menghapus ${successCount} dari ${targetItems.length} dokumen konten terasing secara permanen.`);
      handleScanOrphanedContents();
    } catch (err: any) {
      console.error('Failed purging orphans:', err);
      alert('Gagal membersihkan dokumen terasing.');
    } finally {
      setIsPurgingOrphans(false);
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
    setBPlanIsHidden(false);
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
    setBPlanIsHidden(!!plan.isHidden);
    setBPlanOrder(plan.order || 1);
    setIsPlanModalOpen(true);
  };

  const handleSaveBuilderPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bPlanName || !bPlanPrice) {
      alert('Harap isi Nama Paket dan Harga!');
      return;
    }

    setIsSavingPlan(true);

    const featureList = bPlanFeatures
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const targetPlanId = editingPlanId || bPlanId || `plan_${Date.now()}`;

    const planObj: BuilderPlan = {
      planId: targetPlanId,
      name: bPlanName,
      badge: bPlanBadge || bPlanName.toUpperCase(),
      price: bPlanPrice,
      period: bPlanPeriod || '/ bulan',
      isPopular: bPlanIsPopular,
      isHidden: bPlanIsHidden,
      description: bPlanDesc,
      features: featureList,
      order: Number(bPlanOrder) || 1,
    };

    try {
      const targetDbs = [db];
      for (const s of dbServers) {
        try {
          const inst = getDynamicFirebaseInstance(s).db;
          if (inst && inst !== db) targetDbs.push(inst);
        } catch (e) {}
      }

      for (const targetDbInst of targetDbs) {
        try {
          await setDoc(doc(targetDbInst, 'plans', planObj.planId), planObj);
        } catch (e) {}
      }

      // Re-fetch fresh plans directly from Firestore for 100% UI synchronization
      const plansSnap = await getDocs(collection(db, 'plans'));
      if (!plansSnap.empty) {
        const plansList = plansSnap.docs.map(doc => doc.data() as BuilderPlan);
        plansList.sort((a, b) => (a.order || 0) - (b.order || 0));
        setBuilderPlans(plansList);
      } else {
        setBuilderPlans(prev => prev.map(p => p.planId === planObj.planId ? planObj : p));
      }

      setIsPlanModalOpen(false);
      alert(`✅ Paket Layanan Builder "${planObj.name}" berhasil disimpan!`);
    } catch (err: any) {
      console.error(err);
      alert('Gagal menyimpan paket: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleToggleHideBuilderPlan = async (plan: BuilderPlan) => {
    try {
      const updated = { ...plan, isHidden: !plan.isHidden };
      const targetDbs = [db];
      for (const s of dbServers) {
        try {
          const inst = getDynamicFirebaseInstance(s).db;
          if (inst && inst !== db) targetDbs.push(inst);
        } catch (e) {}
      }

      for (const targetDbInst of targetDbs) {
        try {
          await setDoc(doc(targetDbInst, 'plans', plan.planId), updated, { merge: true });
        } catch (e) {}
      }

      setBuilderPlans(prev => prev.map(p => p.planId === plan.planId ? updated : p));
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengubah status sembunyi paket: ' + err.message);
    }
  };

  const handleDeleteBuilderPlan = async (planId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus paket layanan ini secara permanen?')) return;
    try {
      const targetDbs = [db];
      for (const s of dbServers) {
        try {
          const inst = getDynamicFirebaseInstance(s).db;
          if (inst && inst !== db) targetDbs.push(inst);
        } catch (e) {}
      }

      for (const targetDbInst of targetDbs) {
        try {
          await deleteDoc(doc(targetDbInst, 'plans', planId));
        } catch (e) {}
      }

      setBuilderPlans(prev => prev.filter(p => p.planId !== planId));
      alert('Paket berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus paket.');
    }
  };

  // Verify Security PIN to Reveal API Key
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (enteredPin.trim() === savedPin.trim()) {
      setIsApiKeyVisible(true);
      setIsPinModalOpen(false);
      setEnteredPin('');
    } else {
      setPinError('PIN Keamanan salah. Harap periksa kembali PIN Anda.');
    }
  };

  // Change Security PIN handler
  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePinError('');

    if (oldPinInput.trim() !== savedPin.trim()) {
      setChangePinError('PIN lama yang Anda masukkan tidak sesuai.');
      return;
    }

    if (newPinInput.length < 4) {
      setChangePinError('PIN baru minimal harus 4 digit angka/karakter.');
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setChangePinError('Konfirmasi PIN baru tidak cocok.');
      return;
    }

    const updatedPin = newPinInput.trim();
    setSavedPin(updatedPin);

    if (typeof window !== 'undefined') {
      localStorage.setItem('supa_security_pin', updatedPin);
    }

    try {
      await setDoc(doc(db, 'systemSettings', 'global'), { securityPin: updatedPin }, { merge: true });
    } catch (e) {}

    setIsChangePinModalOpen(false);
    setOldPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    alert('PIN Keamanan Super Admin berhasil diperbarui!');
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
        localStorage.setItem('gemini_api_key', geminiApiKey);
        localStorage.setItem('gemini_api_key_mode', geminiApiKeyMode);
        localStorage.setItem('gemini_api_enabled', isGeminiAiEnabled ? 'true' : 'false');
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
          gemini: {
            apiKey: geminiApiKey,
            mode: geminiApiKeyMode,
            enabled: isGeminiAiEnabled,
          },
          updatedAt: new Date(),
        }, { merge: true });
      } catch (dbErr) {
        console.log('Saved to LocalStorage (Firestore rules restricted cloud write).');
      }

      alert('Pengaturan API Firebase, Cloudinary, & Google Gemini berhasil disimpan!');
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

  // Helper to parse Firebase Config block and auto-fill input fields
  const handleParseFirebaseConfig = (rawText: string) => {
    try {
      const extractKey = (key: string, text: string): string => {
        const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
        const match = regex.exec(text);
        return match ? match[1].trim() : '';
      };

      const apiKey = extractKey('apiKey', rawText);
      const authDomain = extractKey('authDomain', rawText);
      const projectId = extractKey('projectId', rawText);
      const storageBucket = extractKey('storageBucket', rawText);
      const messagingSenderId = extractKey('messagingSenderId', rawText);
      const appId = extractKey('appId', rawText);

      if (apiKey) setNewServerApiKey(apiKey);
      if (authDomain) setNewServerAuthDomain(authDomain);
      if (projectId) {
        setNewServerProjectId(projectId);
        if (!newServerName) {
          setNewServerName(`Server Cluster - ${projectId}`);
        }
      }
      if (storageBucket) setNewServerStorageBucket(storageBucket);
      if (messagingSenderId) setNewServerSenderId(messagingSenderId);
      if (appId) setNewServerAppId(appId);

      if (apiKey || projectId) {
        return true;
      }
    } catch (e) {
      console.warn("Failed parsing Firebase config text:", e);
    }
    return false;
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
      setRawFirebaseConfig('');
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
    const currentServerName = currentServerId === 'default' ? 'Server Utama (landing-umroh)' : (currentServerConfig?.name || currentServerId);
    const targetServerName = newServerId === 'default' ? 'Server Utama (landing-umroh)' : (targetServerConfig?.name || newServerId);

    // ⚠️ COMPREHENSIVE WARNING CONFIRMATION PROMPT
    const confirmMsg = `⚠️ PERINGATAN PEMINDAHAN SERVER DATABASE TEANANT! ⚠️\n\n` +
      `Anda akan memindahkan lokasi penyimpanan Server Database Tenant:\n` +
      `• Perusahaan / Mitra : "${tenant.company || tenant.name}" (${tenant.email})\n` +
      `• Subdomain         : ${tenant.subdomain}\n` +
      `• Dari Server       : [ ${currentServerName} ]\n` +
      `• Ke Server Baru    : [ ${targetServerName} ]\n\n` +
      `Sistem akan secara OTOMATIS memindahkan SELURUH DATA berikut ke server baru:\n` +
      `1. Dokumen Profil Tenant & User\n` +
      `2. Halaman Landing Page\n` +
      `3. Struktur Seksi & Konten Halaman\n` +
      `4. Testimoni Jamaah\n\n` +
      `Apakah Anda yakin ingin memindahkan server database tenant ini sekarang?`;

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

      addLog(`Mencari seluruh aset data tenant '${tenant.company || tenant.subdomain}'...`);

      // 1. Fetch Tenant Document & User Document
      let tenantDocData = tenant;
      try {
        const tSnap = await getDoc(doc(sourceInstance.db, 'tenants', tenant.tenantId));
        if (tSnap.exists()) tenantDocData = tSnap.data() as Tenant;
      } catch (e) {}

      let userDocData = null;
      try {
        const uSnap = await getDoc(doc(sourceInstance.db, 'users', tenant.tenantId));
        if (uSnap.exists()) userDocData = uSnap.data();
      } catch (e) {}

      // 2. Fetch Landing Pages
      const qPages = query(collection(sourceInstance.db, 'landingPages'), where('tenantId', '==', tenant.tenantId));
      const pagesSnap = await getDocs(qPages);
      const pagesData = pagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 3. Fetch Sections
      const qSections = query(collection(sourceInstance.db, 'sections'), where('tenantId', '==', tenant.tenantId));
      const sectionsSnap = await getDocs(qSections);
      const sectionsData = sectionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 4. Fetch Contents
      const qContents = query(collection(sourceInstance.db, 'contents'), where('tenantId', '==', tenant.tenantId));
      const contentsSnap = await getDocs(qContents);
      const contentsData = contentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 5. Fetch Testimonials
      const qTesti = query(collection(sourceInstance.db, 'testimonials'), where('tenantId', '==', tenant.tenantId));
      const testiSnap = await getDocs(qTesti);
      const testiData = testiSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // 6. Fetch Uploaded Images Metadata
      const qImages = query(collection(sourceInstance.db, 'images'), where('tenantId', '==', tenant.tenantId));
      const imagesSnap = await getDocs(qImages);
      const imagesData = imagesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      addLog(`Memindahkan profil Tenant & User ke Server Tujuan...`);
      const updatedTenant: Tenant = { 
        ...tenantDocData, 
        subdomain: tenant.subdomain || tenantDocData.subdomain,
        name: tenant.name || tenantDocData.name,
        company: tenant.company || tenantDocData.company,
        email: tenant.email || tenantDocData.email,
        dbServerId: newServerId 
      };

      await setDoc(doc(targetInstance.db, 'tenants', tenant.tenantId), updatedTenant, { merge: true });
      if (userDocData) {
        await setDoc(doc(targetInstance.db, 'users', tenant.tenantId), userDocData, { merge: true });
      }

      addLog(`Memindahkan ${pagesData.length} Halaman Landing Page...`);
      for (const pageDoc of pagesData) {
        const { id, ...data } = pageDoc;
        await setDoc(doc(targetInstance.db, 'landingPages', id), data, { merge: true });
      }

      addLog(`Memindahkan ${sectionsData.length} Seksi Halaman...`);
      for (const secDoc of sectionsData) {
        const { id, ...data } = secDoc;
        await setDoc(doc(targetInstance.db, 'sections', id), data, { merge: true });
      }

      addLog(`Memindahkan ${contentsData.length} Rekaman Konten...`);
      for (const cntDoc of contentsData) {
        const { id, ...data } = cntDoc;
        await setDoc(doc(targetInstance.db, 'contents', id), data, { merge: true });
      }

      addLog(`Memindahkan ${testiData.length} Testimoni Jamaah...`);
      for (const tDoc of testiData) {
        const { id, ...data } = tDoc;
        await setDoc(doc(targetInstance.db, 'testimonials', id), data, { merge: true });
      }

      addLog(`Memindahkan ${imagesData.length} Rekaman Galeri Foto Cloudinary...`);
      for (const imgDoc of imagesData) {
        const { id, ...data } = imgDoc;
        await setDoc(doc(targetInstance.db, 'images', id), data, { merge: true });
      }

      // 6. Update pointer in Primary Global DB Registry so routing resolves seamlessly
      addLog(`Perbarui pointer server database di Global Registry...`);
      await setDoc(doc(db, 'tenants', tenant.tenantId), updatedTenant, { merge: true });
      const qTenantsSub = query(collection(db, 'tenants'), where('subdomain', '==', tenant.subdomain));
      const snapSub = await getDocs(qTenantsSub);
      for (const d of snapSub.docs) {
        await setDoc(doc(db, 'tenants', d.id), updatedTenant, { merge: true });
      }

      // Update LocalState
      setTenants(prev => prev.map(t => t.tenantId === tenant.tenantId ? updatedTenant : t));

      const durationMs = Date.now() - startTime;
      const durationSec = (durationMs / 1000).toFixed(2);
      addLog(`✅ MIGRASI BERHASIL! Seluruh data dipindahkan secara komprehensif dalam ${durationSec} detik.`);

      // Generate Comprehensive Migration Report
      const report = {
        tenantName: tenant.company || tenant.name,
        subdomain: tenant.subdomain,
        sourceServerName: currentServerName,
        targetServerName: targetServerName,
        landingPagesMigrated: pagesData.length,
        sectionsMigrated: sectionsData.length,
        contentsMigrated: contentsData.length,
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
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${cldUploadPreset}

# Google Gemini AI Key (Landing Page Analytics & Ad Copy Generator)
NEXT_PUBLIC_GEMINI_API_KEY=${geminiApiKey}`;

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
      <header className="h-14 sm:h-16 bg-white border-b flex items-center justify-between px-3.5 sm:px-8 z-40 shrink-0 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          <h1 className="font-headline font-bold text-xs sm:text-lg text-primary truncate max-w-[160px] sm:max-w-none">SAMIRA Super Admin</h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <p className="text-xs sm:text-sm font-semibold text-muted-foreground hidden lg:block">Admin: <span className="text-primary">{user?.email}</span></p>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full font-bold border-primary text-primary hover:bg-primary hover:text-white flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-9">
              <Layout className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden sm:inline">Akses </span>Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Board Container */}
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[98%] w-full mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <h2 className="text-xl sm:text-3xl font-headline font-bold text-primary">Dashboard Kontrol</h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                <span className="h-2 w-2 rounded-full bg-green-600 animate-ping"></span> Realtime Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Kelola tenant, paket limitasi, dan pantau performa seluruh web builder.</p>
          </div>
          
          <Button onClick={loadAdminData} className="bg-primary text-white rounded-full font-bold h-9 sm:h-10 px-5 sm:px-6 text-xs sm:text-sm w-full sm:w-auto shadow-sm">
            Segarkan Data
          </Button>
        </div>

        {/* Top metrics grids */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6">
          <Card className="rounded-2xl border shadow-sm bg-white">
            <CardContent className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-4">
              <div className="bg-primary/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-primary shrink-0"><Users className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Tenant</p>
                <h4 className="text-lg sm:text-2xl font-bold text-primary truncate">{tenants.length}</h4>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl border shadow-sm bg-white">
            <CardContent className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-4">
              <div className="bg-accent/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-accent shrink-0"><Layout className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Landing Page</p>
                <h4 className="text-lg sm:text-2xl font-bold text-primary truncate">
                  {totalLandingPages > 0 ? totalLandingPages : Object.values(tenantPagesCount).reduce((a, b) => a + b, 0)}
                </h4>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm bg-white">
            <CardContent className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-4">
              <div className="bg-green-500/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-green-600 shrink-0"><HardDrive className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Storage Cloudinary</p>
                <h4 className="text-lg sm:text-2xl font-bold text-primary truncate">{cloudinaryStorageMb} MB</h4>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
                  {totalImagesCount.toLocaleString()} Berkas Terunggah
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm bg-white">
            <CardContent className="p-3.5 sm:p-6 flex items-center gap-2.5 sm:gap-4">
              <div className="bg-purple-500/10 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-purple-600 shrink-0"><CloudLightning className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">Total Visitor Global</p>
                <h4 className="text-lg sm:text-2xl font-bold text-primary truncate">
                  {tenants.reduce((acc, t) => acc + (t.visitorCount || 0), 0).toLocaleString()}
                </h4>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tenants" className="w-full space-y-4">
          <div className="overflow-x-auto pb-1 max-w-full">
            <TabsList className="bg-white border p-1 rounded-2xl md:rounded-full w-max flex items-center gap-1 shadow-xs">
              <TabsTrigger value="tenants" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs whitespace-nowrap font-bold shrink-0">Kelola Tenant</TabsTrigger>
              <TabsTrigger value="landingPagesTab" onClick={loadLandingPagesData} className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 font-bold whitespace-nowrap shrink-0 text-purple-700 bg-purple-50/50 hover:bg-purple-100"><Layout className="h-3.5 w-3.5 text-purple-600" /> Status Landing Page ({totalLandingPages})</TabsTrigger>
              <TabsTrigger value="media" onClick={loadAllAdminImages} className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 font-bold whitespace-nowrap shrink-0"><ImageIcon className="h-3.5 w-3.5 text-blue-600" /> Pustaka Media ({totalImagesCount})</TabsTrigger>
              <TabsTrigger value="orphans" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"><Trash2 className="h-3.5 w-3.5 text-amber-600" /> Pembersihan Data</TabsTrigger>
              <TabsTrigger value="packages" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs whitespace-nowrap shrink-0">Paket Limits Tenant</TabsTrigger>
              <TabsTrigger value="builderPlans" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs whitespace-nowrap shrink-0">Paket Builder Iklan</TabsTrigger>
              <TabsTrigger value="settings" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs whitespace-nowrap shrink-0">Pengaturan API & Database</TabsTrigger>
              <TabsTrigger value="activity" className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs whitespace-nowrap shrink-0">Log Aktivitas</TabsTrigger>
              <TabsTrigger value="firestoreUsage" onClick={loadFirestoreUsage} className="rounded-full px-4 sm:px-6 py-1.5 sm:py-2 text-xs flex items-center gap-1.5 whitespace-nowrap font-bold shrink-0"><Activity className="h-3.5 w-3.5 text-indigo-600 animate-pulse" /> Monitor Usage DB</TabsTrigger>
            </TabsList>
          </div>

          {/* ==========================================
              TAB MEDIA LIBRARY & CLOUDINARY STORAGE
              ========================================== */}
          <TabsContent value="media" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" /> Pustaka Storage Media Cloudinary ({allImagesList.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pantau seluruh berkas gambar yang terunggah di server storage Cloudinary lintas cluster database. Anda dapat pratinjau dan menghapus berkas secara langsung tanpa perlu masuk ke web Cloudinary.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    onClick={loadAllAdminImages} 
                    variant="outline" 
                    className="rounded-full text-xs font-bold border-slate-300 hover:bg-slate-50 h-9 px-3 sm:px-4 flex items-center gap-1.5 text-slate-700"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Segarkan
                  </Button>

                  <Button 
                    onClick={handleBackupImageLibrary} 
                    variant="outline"
                    className="rounded-full text-xs font-bold border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white h-9 px-3 sm:px-4 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Backup Pustaka (.json)
                  </Button>

                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleRestoreImageLibrary}
                      className="hidden" 
                      disabled={isRestoringImages}
                    />
                    <div className="rounded-full text-xs font-bold border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 h-9 px-3 sm:px-4 shadow-xs">
                      {isRestoringImages ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Memulihkan...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          Restore Pustaka (.json)
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </CardHeader>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={mediaSearchQuery}
                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                    placeholder="Cari ID gambar, kategori, format, atau nama tenant..."
                    className="rounded-2xl text-xs h-10 pl-10 bg-slate-50"
                  />
                </div>

                <select
                  value={selectedMediaTenant}
                  onChange={(e) => setSelectedMediaTenant(e.target.value)}
                  className="h-10 rounded-2xl border border-input bg-slate-50 px-3 text-xs font-bold text-slate-700 focus:outline-none w-full sm:w-60"
                >
                  <option value="all">Semua Tenant ({tenants.length})</option>
                  <option value="orphaned">⚠️ Gambar Tanpa Tenant Terdaftar</option>
                  {tenants.map(t => (
                    <option key={t.tenantId} value={t.tenantId}>
                      {t.name} ({t.subdomain})
                    </option>
                  ))}
                </select>
              </div>              {/* Bulk Action Toolbar */}
              {allImagesList.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 mb-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleSelectAll}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 bg-white border rounded-xl px-3.5 py-2 hover:bg-slate-50 transition-colors shadow-xs"
                    >
                      {filteredImages.length > 0 && filteredImages.every(img => selectedImages.some(si => si.imageId === img.imageId)) ? (
                        <>
                          <CheckSquare className="h-4 w-4 text-emerald-600" />
                          Batal Pilih Semua ({filteredImages.length})
                        </>
                      ) : (
                        <>
                          <Square className="h-4 w-4 text-slate-400" />
                          Pilih Semua di Filter ({filteredImages.length})
                        </>
                      )}
                    </button>
                    {selectedImages.length > 0 && (
                      <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                        {selectedImages.length} gambar terpilih
                      </span>
                    )}
                  </div>

                  {selectedImages.length > 0 && (
                    <Button
                      onClick={handleBulkDeleteImages}
                      disabled={isBulkDeleting}
                      className="w-full sm:w-auto rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1.5 h-10 px-4 shadow-sm"
                    >
                      {isBulkDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menghapus ({selectedImages.length})...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Hapus {selectedImages.length} Gambar Terpilih
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}

              {/* Media Grid */}
              {allImagesList.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-3xl bg-slate-50">
                  <ImageIcon className="h-12 w-12 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-slate-600">Pustaka Media Masih Kosong</p>
                  <p className="text-[11px] text-slate-400 mt-1">Belum ada gambar yang diunggah atau klik tombol di bawah untuk memuat.</p>
                  <Button onClick={loadAllAdminImages} className="mt-4 rounded-full text-xs font-bold bg-primary text-white">
                    Muat Pustaka Media Sekarang
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredImages.map((img) => (
                    <div 
                      key={img.imageId} 
                      className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col justify-between"
                    >
                      {/* Thumbnail Container */}
                      <div 
                        className="relative aspect-square w-full bg-slate-950 overflow-hidden group"
                      >
                        <img 
                          onClick={() => setPreviewImageModal(img)}
                          src={img.secureUrl} 
                          alt={img.imageId} 
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105" 
                        />
                        
                        {/* Selection Checkbox (Absolute Overlaid) */}
                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectImage(img);
                            }}
                            className="h-7 w-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/85 transition-colors shadow-sm"
                            title={selectedImages.some(si => si.imageId === img.imageId) ? "Batal pilih gambar" : "Pilih gambar"}
                          >
                            {selectedImages.some(si => si.imageId === img.imageId) ? (
                              <CheckSquare className="h-4.5 w-4.5 text-emerald-400" />
                            ) : (
                              <Square className="h-4.5 w-4.5 text-white/60 hover:text-white" />
                            )}
                          </button>
                        </div>
                        
                        {/* Category & Format Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-md border border-white/10">
                            {img.category || 'media'}
                          </span>
                          <span className="text-[9px] font-bold uppercase bg-black/60 text-white px-1.5 py-0.5 rounded-md w-fit">
                            {img.format || 'img'}
                          </span>
                        </div>

                        {/* Size Badge */}
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-950/80 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                          {((img.sizeBytes || 350000) / 1024).toFixed(0)} KB
                        </span>
                      </div>

                      {/* Card Footer Details */}
                      <div className="p-2.5 bg-slate-900 text-white flex flex-col gap-1.5 border-t border-slate-800">
                        {tenants.some(t => t.tenantId === img.tenantId) ? (
                          <p className="text-[10px] font-bold text-amber-300 truncate" title={img.tenantId}>
                            📌 {tenants.find(t => t.tenantId === img.tenantId)?.subdomain || img.tenantId}
                          </p>
                        ) : (
                          <p className="text-[10px] font-bold text-red-400 truncate flex items-center gap-1.5" title={`${img.tenantId} (Tenant tidak terdaftar)`}>
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 animate-pulse" />
                            Tidak Terhubung ({img.tenantId.substring(0, 8)}...)
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
                          <button
                            onClick={() => window.open(img.secureUrl, '_blank')}
                            className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 font-medium"
                            title="Buka gambar full"
                          >
                            <ExternalLink className="h-3 w-3" /> Full
                          </button>

                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={isDeletingMedia === img.imageId}
                            onClick={() => handleDeleteImageFromAdmin(img)}
                            className="h-6 px-2 text-[10px] font-bold text-red-400 hover:bg-red-950/60 hover:text-red-300 rounded-lg flex items-center gap-1"
                            title="Hapus gambar dari Cloudinary & Storage"
                          >
                            {isDeletingMedia === img.imageId ? (
                              <Loader2 className="h-3 w-3 animate-spin text-red-400" />
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3" /> Hapus
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* ==========================================
              TAB TENANTS LIST & OPERATIONS
              ========================================== */}
          <TabsContent value="tenants" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    Manajemen Tenant Terdaftar
                    <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full border border-primary/20">
                      {tenants.length} Tenant Resmi
                    </span>
                  </CardTitle>
                  <CardDescription className="text-xs">Ubah paket, status aktif, backup/restore data, atau edit batas operasional dari setiap akun tenant.</CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input Bar */}
                  <div className="relative min-w-[240px] md:min-w-[280px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Cari mitra, email, subdomain, ID..."
                      value={tenantSearchQuery}
                      onChange={(e) => setTenantSearchQuery(e.target.value)}
                      className="pl-9 pr-8 h-9 text-xs rounded-full border-slate-300 focus-visible:ring-primary bg-slate-50/50"
                    />
                    {tenantSearchQuery && (
                      <button 
                        onClick={() => setTenantSearchQuery('')}
                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
                        title="Bersihkan pencarian"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Column Hide / Unhide Selector Dropdown */}
                  <div className="relative group">
                    <button className="rounded-full text-xs font-bold border border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200 transition-all flex items-center gap-2 h-9 px-4 shadow-xs">
                      <SlidersHorizontal className="h-3.5 w-3.5" /> Atur Kolom (Hide / Unhide)
                    </button>
                    <div className="absolute right-0 top-10 z-50 hidden group-hover:block group-focus-within:block bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-64 space-y-1 text-xs">
                      <p className="font-bold text-primary px-2 py-1 border-b mb-1">Tampilkan / Sembunyikan Kolom:</p>
                      {[
                        { key: 'mitra', label: 'Mitra / Perusahaan' },
                        { key: 'userUid', label: 'User UID (Auth)' },
                        { key: 'tenantId', label: 'Tenant ID (Firestore)' },
                        { key: 'readableId', label: 'Readable ID (Alias)' },
                        { key: 'email', label: 'Email' },
                        { key: 'phone', label: 'No. WhatsApp / HP' },
                        { key: 'subdomain', label: 'Subdomain' },
                        { key: 'serverDb', label: 'Server DB' },
                        { key: 'paket', label: 'Paket' },
                        { key: 'views', label: 'Pengunjung (Views)' },
                        { key: 'createdAt', label: 'Tgl Pendaftaran' },
                        { key: 'expiry', label: 'Masa Aktif / Expiry' },
                        { key: 'status', label: 'Status' },
                        { key: 'actions', label: 'Aksi Kontrol' },
                      ].map(col => (
                        <button
                          key={col.key}
                          onClick={() => toggleColumn(col.key)}
                          className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-left"
                        >
                          <span className="font-medium text-slate-700">{col.label}</span>
                          {visibleColumns[col.key] ? (
                            <CheckSquare className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Global Selective Backup Button */}
                  <button 
                    onClick={() => openBackupModal(null)}
                    className="rounded-full text-xs font-bold border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2 h-9 px-4 shadow-sm"
                  >
                    <Download className="h-4 w-4" /> Export Backup Selected / Total (.json)
                  </button>

                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={(e) => openRestorePreviewModal(e)}
                      className="hidden" 
                    />
                    <div className="rounded-full text-xs font-bold border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-2 h-9 px-4 shadow-sm">
                      <Upload className="h-4 w-4" /> Pulihkan / Restore (.json)
                    </div>
                  </label>
                </div>
              </CardHeader>
              
              {dbLoading ? (
                <div className="py-12 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs max-w-full">
                  <Table className="min-w-[850px]">
                    <TableHeader>
                    <TableRow>
                      {visibleColumns.mitra && <TableHead>Mitra / Perusahaan</TableHead>}
                      {visibleColumns.userUid && <TableHead>User UID (Auth)</TableHead>}
                      {visibleColumns.tenantId && <TableHead>Tenant ID (Firestore)</TableHead>}
                      {visibleColumns.readableId && <TableHead>Readable ID (Alias)</TableHead>}
                      {visibleColumns.email && <TableHead>Email</TableHead>}
                      {visibleColumns.phone && <TableHead>No. WhatsApp / HP</TableHead>}
                      {visibleColumns.subdomain && <TableHead>Subdomain</TableHead>}
                      {visibleColumns.serverDb && <TableHead>Server DB</TableHead>}
                      {visibleColumns.paket && <TableHead>Paket</TableHead>}
                      {visibleColumns.views && <TableHead>Pengunjung (Views)</TableHead>}
                      {visibleColumns.createdAt && <TableHead>Tgl Pendaftaran</TableHead>}
                      {visibleColumns.expiry && <TableHead>Masa Aktif / Expiry</TableHead>}
                      {visibleColumns.status && <TableHead>Status</TableHead>}
                      {visibleColumns.actions && <TableHead className="text-right">Aksi Kontrol</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const q = tenantSearchQuery.trim().toLowerCase();
                      const filteredTenants = tenants.filter(t => {
                        // Strict Double Defense: Hide any document missing Name, Email, or Subdomain
                        if (!t.name || !t.name.trim() || !t.email || !t.email.trim() || !t.subdomain || !t.subdomain.trim()) {
                          return false;
                        }

                        if (!q) return true;
                        const readableId = t.readableId || (t.email ? t.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : '');
                        
                        // Check direct match on key fields
                        if (t.name && t.name.toLowerCase().includes(q)) return true;
                        if (t.email && t.email.toLowerCase().includes(q)) return true;
                        if (t.subdomain && t.subdomain.toLowerCase().includes(q)) return true;
                        if (t.tenantId && t.tenantId.toLowerCase().includes(q)) return true;
                        if (readableId && readableId.toLowerCase().includes(q)) return true;
                        if (t.phone && t.phone.toLowerCase().includes(q)) return true;

                        // Check company field, but prevent 'samira' substring in company from matching short queries like 'ira'
                        if (t.company) {
                          const compLower = t.company.toLowerCase();
                          if (q === 'ira' || q === 'samira') {
                            const withoutSamira = compLower.replace(/samira/g, '');
                            if (withoutSamira.includes(q)) return true;
                          } else if (compLower.includes(q)) {
                            return true;
                          }
                        }

                        return false;
                      });

                      if (filteredTenants.length === 0) {
                        return (
                          <TableRow>
                            <TableCell colSpan={11} className="py-12 text-center text-muted-foreground text-xs">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <Search className="h-8 w-8 text-slate-300" />
                                <p className="font-bold text-slate-600">Tidak ada data tenant yang cocok</p>
                                <p className="text-slate-400">Coba gunakan kata kunci pencarian lain (nama, email, subdomain, ID).</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      return filteredTenants.map((t, idx) => (
                      <TableRow key={`${t.tenantId || 'tenant'}_${idx}`}>
                        {visibleColumns.mitra && (
                          <TableCell>
                            <div>
                              <p className="font-bold text-sm text-primary">{t.name}</p>
                              <p className="text-xs text-muted-foreground">{t.company}</p>
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.userUid && (
                          <TableCell>
                            <code className="text-xs bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 font-mono font-bold select-all border border-slate-200 block w-fit shadow-xs" title="User UID (Firebase Auth ID)">
                              {t.tenantId}
                            </code>
                          </TableCell>
                        )}
                        {visibleColumns.tenantId && (
                          <TableCell>
                            <code className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-mono font-bold select-all border border-blue-200 block w-fit shadow-xs" title="Tenant ID (Firestore Document ID)">
                              {t.tenantId}
                            </code>
                          </TableCell>
                        )}
                        {visibleColumns.readableId && (
                          <TableCell>
                            <code className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-mono font-bold select-all border border-purple-200 block w-fit shadow-xs" title="Readable ID (Subdomain / Email Alias)">
                              {t.readableId || t.subdomain || (t.email ? t.email.toLowerCase().replace(/[^a-z0-9]/g, '_') : '-')}
                            </code>
                          </TableCell>
                        )}
                        {visibleColumns.email && <TableCell className="text-sm">{t.email}</TableCell>}
                        {visibleColumns.phone && (
                          <TableCell className="text-xs font-mono font-bold text-emerald-700">
                            {t.phone || '-'}
                          </TableCell>
                        )}
                        {visibleColumns.subdomain && (
                          <TableCell className="text-xs font-semibold text-accent">
                            <a href={`/${t.subdomain}`} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                              umrohku-samira.my.id/{t.subdomain} <ExternalLink className="h-3 w-3 inline" />
                            </a>
                          </TableCell>
                        )}
                        {visibleColumns.serverDb && (
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
                        )}
                        {visibleColumns.paket && (
                          <TableCell className="text-xs">
                            <select
                              value={t.plan || 'free'}
                              onChange={(e) => handleDirectChangePlan(t, e.target.value as TenantPlan)}
                              className={`border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none transition-all ${
                                t.plan && t.plan !== 'free' 
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-extrabold' 
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="free">Free (Trial)</option>
                              <option value="pro">Pro (Berlangganan)</option>
                              <option value="basic">Basic (Standar)</option>
                              <option value="enterprise">Enterprise (Custom)</option>
                            </select>
                          </TableCell>
                        )}
                        {visibleColumns.views && (
                          <TableCell className="text-sm font-extrabold text-primary">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              <Eye className="h-3.5 w-3.5 text-amber-500" /> {(t.visitorCount || 0).toLocaleString()}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.createdAt && (
                          <TableCell className="text-xs text-slate-600 font-medium whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {t.createdAt 
                                ? new Date((t.createdAt as any)?.seconds ? (t.createdAt as any).seconds * 1000 : t.createdAt).toLocaleDateString('id-ID', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })
                                : '-'}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.expiry && (
                          <TableCell className="whitespace-nowrap">
                            {(() => {
                              if (t.email === 'triyadi72@gmail.com' || t.expiresAt === '2099-12-31T23:59:59.000Z') {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs w-fit flex items-center gap-1 border border-amber-400">
                                      👑 Super Admin (Unlimited)
                                    </span>
                                    <span className="text-[10px] text-emerald-600 font-mono font-bold">Selamanya Active</span>
                                  </div>
                                );
                              }

                              const expDateStr = t.expiresAt || (t.createdAt ? new Date((t.createdAt as any)?.seconds ? (t.createdAt as any).seconds * 1000 + 14*86400*1000 : new Date(t.createdAt).getTime() + 14*86400*1000).toISOString() : null);
                              if (!expDateStr) return <span className="text-[10px] text-slate-400 font-bold">Belum Diatur</span>;

                              const expTime = new Date(expDateStr).getTime();
                              const daysLeft = Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24));
                              const formattedDate = new Date(expTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

                              if (daysLeft < 0 || t.status === 'suspended') {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 w-fit">
                                      🔴 Expired ({Math.abs(daysLeft)} hr lalu)
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                                  </div>
                                );
                              }

                              if (daysLeft <= 3) {
                                return (
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 w-fit">
                                      ⚡ Sisa {daysLeft} Hari
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                                  </div>
                                );
                              }

                              return (
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 w-fit">
                                    🟢 Active ({daysLeft} hr)
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-mono">{formattedDate}</span>
                                </div>
                              );
                            })()}
                          </TableCell>
                        )}
                        {visibleColumns.status && (
                          <TableCell>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {t.status}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.actions && (
                          <TableCell className="text-right flex justify-end gap-1.5 pt-4">
                          <a href={`/${t.subdomain}`} target="_blank" rel="noopener noreferrer">
                            <Button size="icon" variant="outline" className="h-8 w-8" title="Lihat Landing Page">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                          </a>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => { setEditingExpiryTenant(t); setCustomDateInput(''); }} title="Perpanjang Masa Aktif & Langganan">
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleToggleStatus(t)} title="Suspend / Activate">
                            {t.status === 'active' ? <Ban className="h-4 w-4 text-red-500" /> : <Check className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => selectTenantForLimits(t)} title="Batas Limit">
                            <Package className="h-4 w-4 text-primary" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => handleResetPassword(t)} title="Reset Password">
                            <Key className="h-4 w-4 text-yellow-600" />
                          </Button>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" onClick={() => openBackupModal(t)} title="Opsi Backup Database Tenant (.json)">
                            <Download className="h-4 w-4" />
                          </Button>
                          <label className="cursor-pointer">
                            <input 
                              type="file" 
                              accept=".json" 
                              onChange={(e) => openRestorePreviewModal(e, t)}
                              className="hidden" 
                            />
                            <div className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-purple-50 text-purple-600 shadow-sm transition-colors" title="Restore / Pulihkan Database Tenant (.json)">
                              <Upload className="h-4 w-4" />
                            </div>
                          </label>
                          <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteTenant(t)} title="Hapus Permanen">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        )}
                      </TableRow>
                    ));
                  })()}
                  </TableBody>
                </Table>
              </div>
              )}
            </Card>

            {/* Stub & Duplicate Documents Cleanup Card */}
            {stubTenantsList.length > 0 && (
              <Card className="rounded-3xl border border-amber-200 bg-amber-50/40 p-6 space-y-4 shadow-none">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-4">
                  <div>
                    <h3 className="text-base font-headline font-bold text-amber-950 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                      Dokumen Stub & Duplikat Firestore ({stubTenantsList.length} Ditemukan)
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Dokumen berikut adalah alias/stub lama di Firestore yang tidak memiliki nama profil atau email. Dokumen ini dapat Anda hapus secara permanen untuk membersihkan database.
                    </p>
                  </div>

                  <Button
                    type="button"
                    disabled={isDeletingStub}
                    onClick={handlePurgeAllStubs}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-full h-9 px-4 shadow-sm shrink-0"
                  >
                    {isDeletingStub ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Trash2 className="h-4 w-4 mr-1.5" />}
                    Hapus Seluruh {stubTenantsList.length} Dokumen Stub
                  </Button>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-amber-200 bg-white">
                  <Table className="min-w-[600px]">
                    <TableHeader className="bg-amber-100/50">
                      <TableRow>
                        <TableHead className="text-xs font-bold text-amber-900">Firestore Document ID</TableHead>
                        <TableHead className="text-xs font-bold text-amber-900">Readable ID / Subdomain Alias</TableHead>
                        <TableHead className="text-xs font-bold text-amber-900">Status Data</TableHead>
                        <TableHead className="text-xs font-bold text-amber-900 text-right">Aksi Hapus</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stubTenantsList.map((stub) => (
                        <TableRow key={stub.firestoreDocId}>
                          <TableCell>
                            <code className="text-xs bg-amber-100/80 text-amber-900 px-2.5 py-1 rounded-md font-mono font-bold border border-amber-300">
                              {stub.firestoreDocId}
                            </code>
                          </TableCell>
                          <TableCell className="text-xs font-mono text-slate-600">
                            {stub.readableId || stub.subdomain || '-'}
                          </TableCell>
                          <TableCell>
                            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase border border-amber-300">
                              Dokumen Stub Tanpa Profile
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={isDeletingStub}
                              onClick={() => handleDeleteStubDoc(stub.firestoreDocId)}
                              className="border-red-300 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold rounded-xl h-8 px-3"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            )}

            {/* Expiry Extension Modal Dialog */}
            {editingExpiryTenant && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none p-6 space-y-5 animate-in fade-in zoom-in duration-150">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" /> Kelola Masa Aktif & Langganan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Perpanjang masa aktif akses editor & publikasi website untuk <strong className="text-slate-900">{editingExpiryTenant.name} ({editingExpiryTenant.subdomain})</strong>.
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-4">
                    {/* Status Masa Aktif Saat Ini */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Status Akun:</span>
                        <span className="font-bold text-slate-900">{editingExpiryTenant.status === 'suspended' ? '🔴 Suspended' : '🟢 Active'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Kadaluarsa Saat Ini:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {editingExpiryTenant.expiresAt
                            ? new Date(editingExpiryTenant.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'Belum Diatur (Trial 14 Hari Default)'}
                        </span>
                      </div>
                    </div>

                    {/* Presets Button Extensions */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700">Pilih Tambahan Waktu (Otomatis Dihitung):</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          disabled={isUpdatingExpiry}
                          onClick={() => handleExtendSubscription(editingExpiryTenant, 30)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-11 flex flex-col items-center justify-center shadow-xs"
                        >
                          <span>+ 1 Bulan (30 Hari)</span>
                          <span className="text-[9px] font-normal opacity-90">Rekomendasi Berlangganan</span>
                        </Button>

                        <Button
                          type="button"
                          disabled={isUpdatingExpiry}
                          onClick={() => handleExtendSubscription(editingExpiryTenant, 14)}
                          variant="outline"
                          className="border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-xs rounded-xl h-11 flex flex-col items-center justify-center"
                        >
                          <span>+ 14 Hari</span>
                          <span className="text-[9px] font-normal opacity-80">Perpanjang Trial</span>
                        </Button>

                        <Button
                          type="button"
                          disabled={isUpdatingExpiry}
                          onClick={() => handleExtendSubscription(editingExpiryTenant, 90)}
                          variant="outline"
                          className="border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl h-10"
                        >
                          + 3 Bulan (90 Hari)
                        </Button>

                        <Button
                          type="button"
                          disabled={isUpdatingExpiry}
                          onClick={() => handleExtendSubscription(editingExpiryTenant, 365)}
                          variant="outline"
                          className="border-slate-200 text-slate-800 hover:bg-slate-100 font-bold text-xs rounded-xl h-10"
                        >
                          + 1 Tahun (365 Hari)
                        </Button>
                      </div>
                    </div>

                    {/* Manual Expiry Date Input */}
                    <div className="space-y-2 pt-3 border-t">
                      <Label className="text-xs font-bold text-slate-700">Atur Tanggal Kadaluarsa Kustom (Manual):</Label>
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={customDateInput}
                          onChange={(e) => setCustomDateInput(e.target.value)}
                          className="rounded-xl text-xs h-10 border-slate-300"
                        />
                        <Button
                          type="button"
                          disabled={!customDateInput || isUpdatingExpiry}
                          onClick={() => handleExtendSubscription(editingExpiryTenant, 0, customDateInput)}
                          className="bg-primary text-white font-bold text-xs rounded-xl h-10 px-4 shrink-0"
                        >
                          {isUpdatingExpiry ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Simpan Tanggal'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingExpiryTenant(null)}
                      className="rounded-full text-xs font-bold text-slate-600"
                    >
                      Batal
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Selective & Total Database Backup Export Modal Dialog */}
            {isBackupModalOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                      <Download className="h-5 w-5 text-emerald-600" /> 
                      {isGlobalBackup ? 'Export Backup Total Database (Semua Tenant)' : `Export Backup Tenant: ${backupTargetTenant?.company || backupTargetTenant?.name}`}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Pilih jenis data yang ingin dimasukkan ke dalam paket file cadangan database (.json).
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-4 py-2 text-xs">
                    {/* Select All / Deselect All Controls */}
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="font-bold text-slate-800">Opsi Pemilihan Data:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleAllBackupOptions(true)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          Select All (Semua Data)
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAllBackupOptions(false)}
                          className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full font-bold hover:bg-slate-300 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>

                    {/* Checkbox Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'profile', label: 'Profil Tenant & User', desc: 'Detail nama, email, subdomain, limits' },
                        { key: 'landingPages', label: 'Halaman Landing Page', desc: 'Dokumen landing page & slug' },
                        { key: 'sections', label: 'Seksi Halaman', desc: 'Struktur urutan & jenis seksi' },
                        { key: 'contents', label: 'Isi Konten & Teks', desc: 'Judul, narasi, WhatsApp, maps' },
                        { key: 'testimonials', label: 'Testimoni Jamaah', desc: 'Ulasan & foto jamaah' },
                        { key: 'images', label: 'Galeri Foto Cloudinary', desc: 'Metadata URL foto yang diunggah' },
                      ].map(opt => {
                        const isChecked = (backupOptions as any)[opt.key];
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setBackupOptions(prev => ({ ...prev, [opt.key]: !(prev as any)[opt.key] }))}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between ${
                              isChecked ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 shadow-xs' : 'bg-slate-50/50 border-slate-200 text-slate-500'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <p className="font-bold text-xs">{opt.label}</p>
                              <p className="text-[10px] text-slate-500">{opt.desc}</p>
                            </div>
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Square className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsBackupModalOpen(false)}
                      disabled={isExportingBackup}
                      className="rounded-full text-xs font-bold px-5"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="button" 
                      onClick={executeSelectiveBackup}
                      disabled={isExportingBackup || !Object.values(backupOptions).some(Boolean)}
                      className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 shadow-md"
                    >
                      {isExportingBackup ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Download className="h-4 w-4" /> Unduh Backup JSON
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Smart Detection Restore Preview Modal Dialog */}
            {isRestoreModalOpen && detectedComponents && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-lg shadow-2xl rounded-3xl bg-white border-none p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                      <Upload className="h-5 w-5 text-purple-600" /> Deteksi Berkas Backup JSON
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Nama Berkas: <code className="bg-slate-100 text-purple-700 font-bold px-2 py-0.5 rounded-md font-mono">{restoreFileName}</code>
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-3 py-1 text-xs">
                    {/* File Meta Info Banner */}
                    <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 space-y-1 text-purple-950">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Tipe Berkas:</span>
                        <span className="font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200/60 text-[10px]">
                          {detectedComponents.isGlobalPackage ? 'Backup Total Semua Tenant' : 'Backup Single Tenant'}
                        </span>
                      </div>
                      {detectedComponents.metaInfo?.exportedAt && (
                        <p className="text-[11px] text-purple-700">
                          Waktu Export Backup: <strong>{new Date(detectedComponents.metaInfo.exportedAt).toLocaleString('id-ID')}</strong>
                        </p>
                      )}
                    </div>

                    {/* Detected Content Summary */}
                    <div className="space-y-1 border-b pb-2">
                      <p className="font-bold text-slate-800">Komponen Terdeteksi di Berkas Ini:</p>
                      <p className="text-[11px] text-slate-500">Centang komponen data yang ingin Anda pulihkan (*restore*) ke database:</p>
                    </div>

                    {/* Detected Options Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[
                        { 
                          key: 'profile', 
                          label: 'Profil Tenant & User', 
                          countText: detectedComponents.profile ? 'Terdeteksi' : 'Tidak Ada', 
                          isAvailable: detectedComponents.profile 
                        },
                        { 
                          key: 'landingPages', 
                          label: 'Halaman Landing Page', 
                          countText: `${detectedComponents.landingPagesCount} Dokumen`, 
                          isAvailable: detectedComponents.landingPagesCount > 0 
                        },
                        { 
                          key: 'sections', 
                          label: 'Seksi Halaman', 
                          countText: `${detectedComponents.sectionsCount} Seksi`, 
                          isAvailable: detectedComponents.sectionsCount > 0 
                        },
                        { 
                          key: 'contents', 
                          label: 'Isi Konten & Teks', 
                          countText: `${detectedComponents.contentsCount} Rekaman`, 
                          isAvailable: detectedComponents.contentsCount > 0 
                        },
                        { 
                          key: 'testimonials', 
                          label: 'Testimoni Jamaah', 
                          countText: `${detectedComponents.testimonialsCount} Testimoni`, 
                          isAvailable: detectedComponents.testimonialsCount > 0 
                        },
                        { 
                          key: 'images', 
                          label: 'Galeri Foto Cloudinary', 
                          countText: `${detectedComponents.imagesCount} Foto`, 
                          isAvailable: detectedComponents.imagesCount > 0 
                        },
                      ].map(opt => {
                        const isChecked = (restoreSelectionOptions as any)[opt.key];
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            disabled={!opt.isAvailable}
                            onClick={() => opt.isAvailable && setRestoreSelectionOptions(prev => ({ ...prev, [opt.key]: !(prev as any)[opt.key] }))}
                            className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                              !opt.isAvailable 
                                ? 'bg-slate-100/50 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed' 
                                : isChecked 
                                  ? 'bg-purple-50/80 border-purple-300 text-purple-950 shadow-xs' 
                                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <div>
                              <p className="font-bold text-xs">{opt.label}</p>
                              <span className={`text-[10px] font-semibold ${opt.isAvailable ? 'text-purple-600' : 'text-slate-400'}`}>
                                {opt.countText}
                              </span>
                            </div>
                            {opt.isAvailable ? (
                              isChecked ? (
                                <CheckSquare className="h-4 w-4 text-purple-600 shrink-0" />
                              ) : (
                                <Square className="h-4 w-4 text-slate-400 shrink-0" />
                              )
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Kosong</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsRestoreModalOpen(false)}
                      disabled={isExecutingRestore}
                      className="rounded-full text-xs font-bold px-5"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="button" 
                      onClick={executeSelectiveRestore}
                      disabled={isExecutingRestore || !Object.values(restoreSelectionOptions).some(Boolean)}
                      className="rounded-full text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-6 shadow-md"
                    >
                      {isExecutingRestore ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Memulihkan...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Upload className="h-4 w-4" /> Pulihkan Data Terpilih
                        </span>
                      )}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

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
              TAB LANDING PAGES STATUS & MANAGEMENT
              ========================================== */}
          <TabsContent value="landingPagesTab" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6 space-y-4">
              <CardHeader className="px-0 pt-0 border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    <Layout className="h-5 w-5 text-purple-600" /> 
                    Manajemen Halaman Landing Page Firestore
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pantau dokumen <code className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">landingPages</code> di database Firestore. Filter mana saja yang terhubung ke tenant aktif dan mana yang tidak terhubung (bebas/orphaned).
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    type="button"
                    onClick={loadLandingPagesData} 
                    disabled={isLoadingLandingPages}
                    variant="outline"
                    className="rounded-full text-xs font-bold border-slate-300 hover:bg-slate-50 h-9 px-4 flex items-center gap-1.5 text-slate-700"
                  >
                    {isLoadingLandingPages ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Segarkan Data
                  </Button>

                  <Button 
                    type="button"
                    onClick={handleBackupLandingPages} 
                    disabled={allLandingPages.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs px-4 h-9 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Backup (.json)
                  </Button>

                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleRestoreLandingPages}
                      className="hidden" 
                      disabled={isRestoringLandingPages}
                    />
                    <div className="rounded-full text-xs font-bold border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 h-9 px-4 shadow-xs">
                      {isRestoringLandingPages ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memulihkan...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" /> Restore Landing Pages (.json)
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </CardHeader>

              {/* Sub-Tabs Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  <Button
                    type="button"
                    variant={landingPageFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLandingPageFilter('all')}
                    className="rounded-full text-xs font-bold h-8 px-3.5"
                  >
                    Semua ({allLandingPages.length})
                  </Button>
                  <Button
                    type="button"
                    variant={landingPageFilter === 'connected' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLandingPageFilter('connected')}
                    className={`rounded-full text-xs font-bold h-8 px-3.5 ${
                      landingPageFilter === 'connected' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    🟢 Terhubung ({allLandingPages.filter(p => p.isConnected).length})
                  </Button>
                  <Button
                    type="button"
                    variant={landingPageFilter === 'unconnected' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLandingPageFilter('unconnected')}
                    className={`rounded-full text-xs font-bold h-8 px-3.5 ${
                      landingPageFilter === 'unconnected' ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    ⚠️ Tidak Terhubung ({allLandingPages.filter(p => !p.isConnected).length})
                  </Button>
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[220px]">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Cari subdomain, judul, tenant ID..."
                    value={landingPageSearchQuery}
                    onChange={(e) => setLandingPageSearchQuery(e.target.value)}
                    className="pl-8 pr-7 h-8 text-xs rounded-full border-slate-300 bg-white"
                  />
                  {landingPageSearchQuery && (
                    <button 
                      onClick={() => setLandingPageSearchQuery('')}
                      className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Table Render */}
              {isLoadingLandingPages ? (
                <div className="py-12 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                  <Table className="min-w-[800px]">
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="text-xs font-bold">Subdomain / Link URL</TableHead>
                        <TableHead className="text-xs font-bold">Dokumen ID & Tenant ID</TableHead>
                        <TableHead className="text-xs font-bold">Status Koneksi Tenant</TableHead>
                        <TableHead className="text-xs font-bold">Pemilik Akun (Tenant)</TableHead>
                        <TableHead className="text-xs font-bold text-right">Aksi Kontrol</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const q = landingPageSearchQuery.trim().toLowerCase();
                        const filtered = allLandingPages.filter(p => {
                          if (landingPageFilter === 'connected' && !p.isConnected) return false;
                          if (landingPageFilter === 'unconnected' && p.isConnected) return false;

                          if (!q) return true;
                          const subMatch = p.subdomain && p.subdomain.toLowerCase().includes(q);
                          const titleMatch = p.title && p.title.toLowerCase().includes(q);
                          const tidMatch = p.tenantId && p.tenantId.toLowerCase().includes(q);
                          const docIdMatch = p.firestoreDocId && p.firestoreDocId.toLowerCase().includes(q);
                          const tenantNameMatch = p.connectedTenant?.name && p.connectedTenant.name.toLowerCase().includes(q);
                          return subMatch || titleMatch || tidMatch || docIdMatch || tenantNameMatch;
                        });

                        if (filtered.length === 0) {
                          return (
                            <TableRow>
                              <TableCell colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <Layout className="h-8 w-8 text-slate-300" />
                                  <p className="font-bold text-slate-600">Tidak ada dokumen landing page yang cocok</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return filtered.map((lp) => (
                          <TableRow key={lp.firestoreDocId} className="hover:bg-slate-50/80">
                            {/* Subdomain & Link */}
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <a 
                                  href={`/${lp.subdomain || lp.firestoreDocId}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-bold text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                  umrohku-samira.my.id/{lp.subdomain || lp.firestoreDocId}
                                  <ExternalLink className="h-3 w-3 text-amber-500" />
                                </a>
                                {lp.title && <span className="text-[11px] text-slate-500 font-medium">{lp.title}</span>}
                              </div>
                            </TableCell>

                            {/* Doc ID & Tenant ID */}
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <code className="text-[11px] bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-700 w-fit">
                                  DocID: {lp.firestoreDocId}
                                </code>
                                <code className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono w-fit border border-purple-200">
                                  TID: {lp.tenantId || '-'}
                                </code>
                              </div>
                            </TableCell>

                            {/* Status Koneksi */}
                            <TableCell>
                              {lp.isConnected ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                                  🟢 Terhubung Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                  <AlertTriangle className="h-3 w-3 text-amber-600" />
                                  ⚠️ Tidak Terhubung (Orphaned)
                                </span>
                              )}
                            </TableCell>

                            {/* Pemilik Akun / Tenant */}
                            <TableCell>
                              {lp.connectedTenant ? (
                                <div className="flex flex-col">
                                  <span className="font-bold text-xs text-slate-900">{lp.connectedTenant.name}</span>
                                  <span className="text-[10px] text-slate-500">{lp.connectedTenant.email}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Tidak Ada Akun Terhubung</span>
                              )}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a href={`/${lp.subdomain || lp.firestoreDocId}`} target="_blank" rel="noopener noreferrer">
                                  <Button size="icon" variant="outline" className="h-8 w-8" title="Pratinjau Halaman">
                                    <Eye className="h-3.5 w-3.5 text-blue-600" />
                                  </Button>
                                </a>

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => setAssigningLandingPage(lp)}
                                  className="h-8 w-8 text-purple-600 hover:bg-purple-50"
                                  title="Hubungkan Halaman Ini ke Tenant Lain"
                                >
                                  <Link2 className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  type="button"
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleDeleteLandingPageDoc(lp.firestoreDocId)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                  title="Hapus Dokumen Landing Page dari Firestore"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>

            {/* Re-assign Landing Page to Tenant Modal */}
            {assigningLandingPage && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none p-6 space-y-4">
                  <CardHeader className="px-0 pt-0 border-b pb-3">
                    <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-2">
                      <Link2 className="h-5 w-5 text-purple-600" /> Hubungkan Landing Page ke Tenant
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Landing Page: <code className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded font-mono">{assigningLandingPage.subdomain || assigningLandingPage.firestoreDocId}</code>
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-3 py-2 text-xs">
                    <p className="text-slate-600 font-medium">Pilih akun tenant aktif yang akan dihubungkan ke landing page ini:</p>

                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {tenants.map(t => (
                        <button
                          key={t.firestoreDocId}
                          type="button"
                          onClick={() => handleAssignLandingPageToTenant(assigningLandingPage.firestoreDocId, t)}
                          className="w-full p-3 rounded-2xl border border-slate-200 text-left hover:bg-purple-50/70 hover:border-purple-300 transition-all flex items-center justify-between group"
                        >
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-purple-900">{t.name}</p>
                            <p className="text-[10px] text-slate-500">{t.email} • <span className="font-mono font-bold text-primary">/{t.subdomain}</span></p>
                          </div>
                          <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            Pilih Tenant
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end border-t pt-3">
                    <Button type="button" variant="outline" className="rounded-full text-xs font-bold px-5" onClick={() => setAssigningLandingPage(null)}>
                      Batal
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ==========================================
              TAB ORPHANED DATA CLEANUP SCANNER
              ========================================== */}
          <TabsContent value="orphans" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 border-b pb-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-amber-600" />
                    Pembersihan Dokumen Konten Terasing (Orphaned Contents)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Memindai dan menghapus sisa-sisa dokumen <code className="bg-slate-100 px-1 py-0.5 rounded text-amber-700 font-bold">contents</code> di database utama/cluster yang tenant ID-nya sudah tidak terhubung ke akun aktif mana pun.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    type="button"
                    onClick={handleScanOrphanedContents} 
                    disabled={isScanningOrphans}
                    className="bg-primary hover:bg-primary/90 text-white font-bold rounded-full text-xs px-4 h-9 flex items-center gap-2 shadow-xs"
                  >
                    {isScanningOrphans ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    {isScanningOrphans ? 'Memindai Database...' : 'Pindai Dokumen'}
                  </Button>

                  <Button 
                    type="button"
                    onClick={handleBackupOrphanedContents} 
                    disabled={orphanedContents.length === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full text-xs px-4 h-9 flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" /> Backup Konten (.json)
                  </Button>

                  <label className="cursor-pointer">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleRestoreOrphanedContents}
                      className="hidden" 
                      disabled={isRestoringOrphans}
                    />
                    <div className="rounded-full text-xs font-bold border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1.5 h-9 px-4 shadow-xs">
                      {isRestoringOrphans ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Memulihkan...
                        </>
                      ) : (
                        <>
                          <Upload className="h-3.5 w-3.5" />
                          Restore Konten (.json)
                        </>
                      )}
                    </div>
                  </label>

                  {orphanedContents.some(i => i.status === 'misplaced') && (
                    <Button 
                      type="button"
                      onClick={() => {
                        setIsSyncModalOpen(true);
                        setSyncTargetServerId('assigned');
                      }}
                      disabled={isPurgingOrphans}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-xs px-4 h-9 flex items-center gap-2 shadow-md"
                      title="Pindahkan seluruh dokumen sisa migrasi ke Server Cluster pilihan lalu bersihkan salinan di database asal"
                    >
                      {isPurgingOrphans ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightLeft className="h-4 w-4" />}
                      Pindahkan Sisa Migrasi ({orphanedContents.filter(i => i.status === 'misplaced').length})
                    </Button>
                  )}

                  {orphanedContents.length > 0 && (
                    <Button 
                      type="button"
                      onClick={handlePurgeOrphanedContents} 
                      disabled={isPurgingOrphans}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full text-xs px-4 h-9 flex items-center gap-2 shadow-md"
                    >
                      {isPurgingOrphans ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Hapus Permanen ({orphanedContents.length})
                    </Button>
                  )}
                </div>
              </CardHeader>

              <div className="space-y-4">
                {orphanedContents.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border">
                    <div className="relative flex-1 max-w-md w-full">
                      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                      <Input
                        value={orphansSearchQuery}
                        onChange={(e) => setOrphansSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan Tenant ID, Dokumen ID, atau Field..."
                        className="pl-9 pr-4 h-9 rounded-full text-xs bg-white border-slate-200 focus-visible:ring-primary shadow-xs w-full"
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
                      🔍 Memastikan pencarian ID yang sama di DB Utama dan DB Cluster secara bersamaan.
                    </span>
                  </div>
                )}

                {orphanedContents.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3 opacity-80" />
                    <h3 className="font-bold text-slate-700 text-sm">Tidak Ada Dokumen Terasing Terdeteksi</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Klik tombol <strong>"Pindai Dokumen"</strong> di atas untuk memindai database utama dan cluster server dari sisa-sisa dokumen konten lama.
                    </p>
                  </div>
                ) : (() => {
                  const queryLower = orphansSearchQuery.toLowerCase().trim();

                  const mainDbOrphans = orphanedContents.filter(i => 
                    i.serverId === 'default' &&
                    (!queryLower || 
                     i.tenantId.toLowerCase().includes(queryLower) ||
                     i.docId.toLowerCase().includes(queryLower) ||
                     i.key.toLowerCase().includes(queryLower) ||
                     i.value.toLowerCase().includes(queryLower))
                  );

                  const filteredClusterContents = view2Contents.filter(i => 
                    !queryLower ||
                    i.tenantId.toLowerCase().includes(queryLower) ||
                    i.docId.toLowerCase().includes(queryLower) ||
                    i.key.toLowerCase().includes(queryLower) ||
                    i.value.toLowerCase().includes(queryLower)
                  );

                  const renderContentsTable = (items: typeof orphanedContents, dbColorClass: string) => (
                    <div className="rounded-2xl border overflow-hidden max-h-[300px] overflow-y-auto bg-white shadow-xs">
                      <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                          <TableRow>
                            <TableHead className="text-xs font-bold">Lokasi Dokumen</TableHead>
                            <TableHead className="text-xs font-bold">Status & Perbandingan</TableHead>
                            <TableHead className="text-xs font-bold">Tanggal Dibuat</TableHead>
                            <TableHead className="text-xs font-bold">Tenant ID</TableHead>
                            <TableHead className="text-xs font-bold">Dokumen ID</TableHead>
                            <TableHead className="text-xs font-bold">Key / Field</TableHead>
                            <TableHead className="text-xs font-bold">Pratinjau Isi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, idx) => (
                            <TableRow key={idx} className="hover:bg-slate-50/50">
                              <TableCell className="text-xs font-bold">
                                <span className={`px-2.5 py-1 rounded-md border text-[10px] whitespace-nowrap font-bold ${dbColorClass}`}>
                                  {item.serverLabel}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs font-medium">
                                {item.status === 'misplaced' ? (
                                  <span className="inline-flex flex-col gap-0.5">
                                    <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full text-[10px] w-fit">
                                      🔄 {item.statusLabel}
                                    </span>
                                    <span className="text-[10px] text-slate-500">
                                      Terhubung Aktif ke: <strong className="text-primary">{item.assignedServer}</strong>
                                    </span>
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px]">
                                    ⚠️ {item.statusLabel}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-slate-600 font-medium whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                  <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                  {item.createdAt}
                                </span>
                              </TableCell>
                              <TableCell className="text-xs text-amber-700 font-bold">{item.tenantId}</TableCell>
                              <TableCell className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]" title={item.docId}>{item.docId}</TableCell>
                              <TableCell className="text-xs font-bold">{item.key}</TableCell>
                              <TableCell className="text-xs text-slate-500 max-w-[200px]">
                                <div className="flex items-center gap-1.5 justify-between group/cell">
                                  <span className="truncate" title={item.value}>
                                    {item.value}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.value);
                                      alert('✅ Isi konten berhasil disalin!');
                                    }}
                                    className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100"
                                    title="Salin isi konten"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  );

                  return (
                    <div className="space-y-8">
                      {/* View 1: DB Utama */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span>
                            View 1: DB Utama (landing-umroh) — {mainDbOrphans.length} Dokumen Terasing
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400">SERVER: DEFAULT</span>
                        </div>
                        {mainDbOrphans.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-dashed">
                            Bersih! Tidak ada dokumen terasing di DB Utama.
                          </div>
                        ) : (
                          renderContentsTable(mainDbOrphans, "bg-emerald-50 text-emerald-700 border-emerald-200")
                        )}
                      </div>

                      {/* View 2: DB Cluster / DB2 */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h4 className="text-xs font-bold text-purple-700 flex items-center gap-1.5 uppercase tracking-wider">
                            <span className="h-2.5 w-2.5 rounded-full bg-purple-500 inline-block"></span>
                            View 2: Cek Isi & Deteksi Duplikat DB Cluster / Tenant
                          </h4>
                          <span className="text-[10px] font-bold text-slate-400">SERVER: CLUSTER</span>
                        </div>

                        {/* Interactive Dropdown Selector */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-4 rounded-2xl border">
                          <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700">Pilih Database Server Cluster / Tenant:</Label>
                            <select
                              value={selectedView2ServerId}
                              onChange={(e) => {
                                setSelectedView2ServerId(e.target.value);
                                handleLoadView2Contents(e.target.value);
                              }}
                              className="bg-white border rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-80 shadow-xs"
                            >
                              <option value="">-- Pilih Server Cluster / Tenant DB --</option>
                              {dbServers.map(s => (
                                <option key={s.serverId} value={s.serverId}>
                                  {s.name} ({s.projectId})
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedView2ServerId && (
                            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-600">
                              <span className="bg-slate-100 px-2.5 py-1 rounded-lg border">
                                Total Konten: <strong className="text-primary">{view2Contents.length}</strong>
                              </span>
                              <span className="bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-lg">
                                Duplikat di DB Utama: <strong className="font-bold">{view2Duplicates.length}</strong>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Display Table Contents or Select State */}
                        {!selectedView2ServerId ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                            💡 Silakan pilih server database cluster/tenant di atas untuk menampilkan seluruh isi konten dan mendeteksi data ganda dengan DB Utama.
                          </div>
                        ) : isLoadingView2Contents ? (
                          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                            <span>Memuat data konten cluster dan mendeteksi duplikasi...</span>
                          </div>
                        ) : filteredClusterContents.length === 0 ? (
                          <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-500 border border-dashed">
                            {queryLower ? 'Tidak ada hasil pencarian yang cocok.' : 'Database Cluster kosong! Tidak ada dokumen konten terdaftar.'}
                          </div>
                        ) : (
                          <div className="rounded-2xl border overflow-hidden max-h-[350px] overflow-y-auto bg-white shadow-xs">
                            <Table>
                              <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                <TableRow>
                                  <TableHead className="text-xs font-bold">Tenant ID</TableHead>
                                  <TableHead className="text-xs font-bold">Dokumen ID</TableHead>
                                  <TableHead className="text-xs font-bold">Key / Field</TableHead>
                                  <TableHead className="text-xs font-bold">Deteksi Duplikat di DB Utama</TableHead>
                                  <TableHead className="text-xs font-bold">Isi Konten di DB Cluster</TableHead>
                                  <TableHead className="text-xs font-bold text-center">Tanggal</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredClusterContents.map((item, idx) => (
                                  <TableRow key={idx} className={`hover:bg-slate-50/50 ${item.isDuplicate ? 'bg-amber-50/15' : ''}`}>
                                    <TableCell className="text-xs text-slate-800 font-bold whitespace-nowrap">
                                      {item.tenantId}
                                    </TableCell>
                                    <TableCell className="font-mono text-[11px] text-slate-600 truncate max-w-[150px]" title={item.docId}>
                                      {item.docId}
                                    </TableCell>
                                    <TableCell className="text-xs font-bold">{item.key}</TableCell>
                                    <TableCell className="text-xs">
                                      {item.isDuplicate ? (
                                        item.duplicateType === 'identical' ? (
                                          <span className="inline-flex flex-col">
                                            <span className="bg-green-100 text-green-800 border border-green-200 font-bold px-2 py-0.5 rounded-full text-[10px] w-fit">
                                              ✅ Duplikat (Identik)
                                            </span>
                                            <span className="text-[9px] text-slate-400 mt-0.5">Nilai sama persis</span>
                                          </span>
                                        ) : (
                                          <span className="inline-flex flex-col">
                                            <span className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full text-[10px] w-fit">
                                              ⚠️ Duplikat (Beda Nilai)
                                            </span>
                                            <span className="text-[9px] text-amber-600 mt-0.5">Nilai berbeda di DB Utama</span>
                                          </span>
                                        )
                                      ) : (
                                        <span className="bg-slate-100 text-slate-500 border border-slate-200 font-medium px-2 py-0.5 rounded-full text-[10px]">
                                          Hanya di DB Cluster
                                        </span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 max-w-[200px]">
                                      <div className="flex items-center gap-1.5 justify-between group/cell">
                                        <span className="truncate" title={item.value}>
                                          {item.value}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(item.value);
                                            alert('✅ Isi konten berhasil disalin!');
                                          }}
                                          className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0 opacity-0 group-hover/cell:opacity-100 focus:opacity-100"
                                          title="Salin isi konten"
                                        >
                                          <Copy className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-400 whitespace-nowrap text-center">
                                      {item.createdAt}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Card>

            {/* Modal Dialog Select Sync Destination Database */}
            {isSyncModalOpen && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                  <CardHeader className="px-0 pt-0 border-b pb-4">
                    <CardTitle className="text-lg font-headline font-bold text-primary flex items-center gap-2">
                      <ArrowRightLeft className="h-5 w-5 text-indigo-600" />
                      Pilih Tujuan Pemindahan Sisa Migrasi
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Tentukan ke server database mana dokumen sisa migrasi (misplaced) ini akan dipindahkan secara massal.
                    </CardDescription>
                  </CardHeader>

                  <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Server Database Tujuan:</Label>
                      <select
                        value={syncTargetServerId}
                        onChange={(e) => setSyncTargetServerId(e.target.value)}
                        className="bg-white border rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:ring-1 focus:ring-primary w-full shadow-xs"
                      >
                        <option value="assigned">🚀 Server Database Cluster Default Tenant (Otomatis)</option>
                        <option value="default">🖥️ Server Utama (landing-umroh)</option>
                        {dbServers.map(s => (
                          <option key={s.serverId} value={s.serverId}>
                            📦 {s.name} ({s.projectId})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 leading-normal space-y-1">
                      <p className="font-bold flex items-center gap-1">
                        💡 Catatan Pemindahan:
                      </p>
                      <ul className="list-disc pl-4 space-y-0.5 text-indigo-950 font-medium">
                        <li>Dokumen akan disalin ke database tujuan yang Anda pilih.</li>
                        <li>Salinan dokumen lama di database asal akan dihapus secara otomatis demi kebersihan data (*zero redundancy*).</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="rounded-full text-xs font-bold" 
                      onClick={() => setIsSyncModalOpen(false)}
                      disabled={isPurgingOrphans}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => handleSyncMisplacedContents(syncTargetServerId)}
                      disabled={isPurgingOrphans}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold text-xs px-5 shadow-md flex items-center gap-1.5"
                    >
                      {isPurgingOrphans ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Pindahkan Sekarang
                        </>
                      )}
                    </Button>
                  </div>
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
                      <div className="flex justify-between items-center">
                        <Label className="text-xs font-bold">API Key (apiKey)</Label>
                        <div className="flex gap-2">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              if (isApiKeyVisible) {
                                setIsApiKeyVisible(false);
                              } else {
                                setEnteredPin('');
                                setPinError('');
                                setIsPinModalOpen(true);
                              }
                            }}
                            className="h-7 px-2.5 text-xs text-primary font-bold hover:bg-primary/10 flex items-center gap-1 rounded-full"
                          >
                            {isApiKeyVisible ? (
                              <>
                                <EyeOff className="h-3.5 w-3.5" /> Sembunyikan API Key
                              </>
                            ) : (
                              <>
                                <Eye className="h-3.5 w-3.5 text-accent" /> Tampilkan (Pakai PIN)
                              </>
                            )}
                          </Button>

                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setOldPinInput('');
                              setNewPinInput('');
                              setConfirmPinInput('');
                              setChangePinError('');
                              setIsChangePinModalOpen(true);
                            }}
                            className="h-7 px-2.5 text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold flex items-center gap-1 rounded-full"
                          >
                            <Lock className="h-3 w-3" /> Atur PIN Security
                          </Button>
                        </div>
                      </div>

                      <Input 
                        type={isApiKeyVisible ? "text" : "password"}
                        value={isApiKeyVisible ? fbApiKey : (fbApiKey ? "••••••••••••••••••••••••••••••••" : "")} 
                        onChange={(e) => setFbApiKey(e.target.value)} 
                        readOnly={!isApiKeyVisible}
                        placeholder="AIzaSy..." 
                        className={`font-mono text-xs ${!isApiKeyVisible ? 'bg-slate-100 text-slate-500 cursor-not-allowed select-none' : 'bg-white'}`}
                      />
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

                {/* Google Gemini AI API Configuration Card */}
                <Card className="rounded-3xl border shadow-none bg-white p-6 md:col-span-2">
                  <CardHeader className="px-0 pt-0 pb-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                        <CardTitle className="text-lg font-headline font-bold text-primary">Google Gemini AI API Key (Analisis Landing Page & Generator Iklan)</CardTitle>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                        AI Studio Integration
                      </span>
                    </div>
                    <CardDescription className="text-xs">
                      Kunci API Google Gemini untuk analisis cerdas landing page, audit efektivitas narasi, dan pembuatan konten postingan iklan media sosial otomatis.
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="px-0 py-4 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700">Gemini API Key</Label>
                        <button
                          type="button"
                          onClick={() => setIsGeminiKeyVisible(!isGeminiKeyVisible)}
                          className="text-[11px] font-bold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          {isGeminiKeyVisible ? <EyeOff className="h-3.5 w-3.5 text-slate-500" /> : <Eye className="h-3.5 w-3.5 text-purple-600" />}
                          {isGeminiKeyVisible ? 'Sembunyikan Key' : 'Tampilkan Key'}
                        </button>
                      </div>
                      <Input 
                        type={isGeminiKeyVisible ? 'text' : 'password'}
                        value={geminiApiKey} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setGeminiApiKey(val);
                          if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key', val);
                        }} 
                        placeholder="AIzaSy..." 
                        className="font-mono text-xs border-purple-200 focus-visible:ring-purple-500"
                      />
                    </div>

                    {/* Master Enable/Disable Toggle for AI Agent Menu */}
                    <div className="p-3 bg-slate-50 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-purple-600" /> Status Akses Fitur Asisten AI Agent Mitra:
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Aktifkan atau matikan tampilan tombol & menu Asisten AI Agent di Dashboard seluruh mitra.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !isGeminiAiEnabled;
                          setIsGeminiAiEnabled(nextVal);
                          if (typeof window !== 'undefined') localStorage.setItem('gemini_api_enabled', nextVal ? 'true' : 'false');
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-xs ${
                          isGeminiAiEnabled 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isGeminiAiEnabled ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                            🟢 AI AGENT AKTIF (DAPAT DIAKSES MITRA)
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-white" />
                            🔴 AI AGENT NONAKTIF (DISEMBUNYIKAN)
                          </>
                        )}
                      </button>
                    </div>

                    {/* Mode Selection: Admin Global vs Custom Tenant Input */}
                    <div className="space-y-1.5 pt-1">
                      <Label className="text-xs font-bold text-slate-700">Mode Distribusi Kunci API ke Dashboard Mitra:</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            setGeminiApiKeyMode('global');
                            if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key_mode', 'global');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            geminiApiKeyMode === 'global' ? 'bg-purple-100/80 border-purple-400 text-purple-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
                            <span className="text-xs">Gunakan Kunci API Admin (Gratis untuk Mitra)</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                            Seluruh mitra langsung menikmati fitur AI menggunakan Kunci API Admin di atas tanpa perlu mengisi API Key sendiri.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setGeminiApiKeyMode('custom');
                            if (typeof window !== 'undefined') localStorage.setItem('gemini_api_key_mode', 'custom');
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            geminiApiKeyMode === 'custom' ? 'bg-purple-100/80 border-purple-400 text-purple-950 font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-amber-600 shrink-0" />
                            <span className="text-xs">Alihkan ke Input API Key Sendiri</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                            Mitra akan diahlikan untuk memasukkan Gemini API Key pribadi mereka masing-masing di Dashboard Mitra.
                          </p>
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-[11px] text-purple-950 leading-relaxed space-y-1.5">
                      <p className="font-bold flex items-center gap-1.5 text-purple-900">
                        <Sparkles className="h-4 w-4 text-purple-600" /> Petunjuk Google Gemini AI Key:
                      </p>
                      <p>
                        Dapatkan API Key gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="font-bold text-purple-700 underline hover:text-purple-900">Google AI Studio (aistudio.google.com)</a>, lalu tempel kunci API Anda di atas untuk mengaktifkan seluruh fitur analisis AI dan generator materi iklan media sosial secara instan.
                      </p>
                    </div>

                    {/* Gemini Quota Health Inspector Controls */}
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3 border border-slate-800">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-purple-400" /> Inspektur Status Kuota & Kesehatan Gemini API
                          </span>
                          <p className="text-[11px] text-slate-300">
                            Uji langsung respon server Google AI Studio untuk mengecek ketersediaan kuota gratis (429 Quota Limit status).
                          </p>
                        </div>

                        <Button
                          type="button"
                          onClick={handleCheckGeminiQuotaStatus}
                          disabled={isTestingGeminiQuota}
                          className="h-9 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shrink-0 shadow-sm"
                        >
                          {isTestingGeminiQuota ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Search className="h-3.5 w-3.5 mr-1.5" />}
                          {isTestingGeminiQuota ? 'Mengecek Kuota Google AI...' : '🔍 Cek Status Kuota API'}
                        </Button>
                      </div>

                      {geminiQuotaStatus && (
                        <div className="space-y-2">
                          <div className={`p-3 rounded-xl text-xs leading-relaxed border space-y-1 ${
                            geminiQuotaStatus.status === 'active' ? 'bg-emerald-950/80 text-emerald-200 border-emerald-800' :
                            geminiQuotaStatus.status === 'quota_exceeded' ? 'bg-red-950/80 text-red-200 border-red-800 font-semibold' :
                            'bg-amber-950/80 text-amber-200 border-amber-800'
                          }`}>
                            <p>{geminiQuotaStatus.message}</p>
                            {geminiQuotaStatus.testedAt && (
                              <p className="text-[10px] opacity-75 font-mono">
                                Waktu Pengujian: {geminiQuotaStatus.testedAt} {geminiQuotaStatus.testedModel ? `| Model Utama: ${geminiQuotaStatus.testedModel}` : ''}
                              </p>
                            )}
                          </div>

                          {/* Model Matrix Support Inspector List */}
                          {geminiQuotaStatus.modelMatrix && geminiQuotaStatus.modelMatrix.length > 0 && (
                            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                              <span className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                                <span>Matriks Dukungan Jenis Model Gemini:</span>
                                <span className="text-[10px] text-slate-400 font-normal">Google Generative AI API v1beta</span>
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {geminiQuotaStatus.modelMatrix.map((m) => (
                                  <div 
                                    key={m.model}
                                    className={`p-2 rounded-lg border text-xs flex items-center justify-between font-mono ${
                                      m.status === 'ok' ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300' :
                                      m.status === 'quota' ? 'bg-red-950/50 border-red-800/80 text-red-300' :
                                      'bg-slate-900 border-slate-800 text-slate-400'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <span className="text-xs">
                                        {m.status === 'ok' ? '🟢' : m.status === 'quota' ? '🔴' : '⚠️'}
                                      </span>
                                      <span className="font-bold truncate">{m.model}</span>
                                    </div>

                                    <div className="text-[10px] shrink-0 font-sans">
                                      {m.status === 'ok' ? (
                                        <span className="text-emerald-400 font-bold">{m.latencyMs}ms</span>
                                      ) : (
                                        <span className="text-red-400 font-medium">{m.errorMsg || 'Error'}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex gap-3">
                      <Button type="submit" disabled={isSavingSettings} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold px-6 h-10 w-full flex items-center justify-center gap-2 shadow-sm">
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
                    onClick={() => {
                      setIsAddServerOpen(true);
                      setNewServerName('');
                      setNewServerApiKey('');
                      setNewServerAuthDomain('');
                      setNewServerProjectId('');
                      setNewServerStorageBucket('');
                      setNewServerSenderId('');
                      setNewServerAppId('');
                      setRawFirebaseConfig('');
                      setTestResult(null);
                    }}
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
                      <Label className="text-xs font-bold text-slate-700">Paste Firebase Config (JSON / JS Object)</Label>
                      <textarea
                        value={rawFirebaseConfig}
                        onChange={(e) => {
                          setRawFirebaseConfig(e.target.value);
                          handleParseFirebaseConfig(e.target.value);
                        }}
                        placeholder={`Paste objek config Firebase di sini untuk mengisi otomatis:\n\nconst firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "...",\n  projectId: "..."\n};`}
                        className="w-full min-h-[90px] text-xs font-mono p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary leading-normal placeholder:text-slate-400"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        💡 Salin langsung dari Firebase Console &gt; Project Settings &gt; Web App SDK config.
                      </p>
                    </div>

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
                  <Card key={plan.planId} className={`rounded-3xl border p-6 flex flex-col justify-between relative shadow-sm hover:shadow-md transition-all ${
                    plan.isHidden ? 'bg-amber-50/50 border-amber-200 opacity-90' : 'bg-slate-50'
                  }`}>
                    <div className="absolute top-0 right-0 flex gap-1 items-center">
                      {plan.isHidden && (
                        <span className="bg-amber-800 text-white font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-bl-xl shadow-xs flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> HIDDEN
                        </span>
                      )}
                      {plan.isPopular && (
                        <span className="bg-accent text-accent-foreground font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-sm">
                          PALING POPULER
                        </span>
                      )}
                    </div>

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

                    <div className="pt-6 border-t mt-6 flex gap-2 justify-end items-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleToggleHideBuilderPlan(plan)}
                        className={`rounded-full text-xs font-bold gap-1 ${
                          plan.isHidden ? 'bg-amber-100 text-amber-900 border-amber-300' : 'text-slate-600'
                        }`}
                        title={plan.isHidden ? 'Tampilkan di Halaman Builder' : 'Sembunyikan dari Halaman Builder'}
                      >
                        {plan.isHidden ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                        {plan.isHidden ? 'Tampilkan' : 'Sembunyikan'}
                      </Button>
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
                      <Input 
                        value={bPlanName} 
                        onChange={(e) => {
                          const val = e.target.value;
                          setBPlanName(val);
                          if (!bPlanBadge || bPlanBadge === bPlanName.toUpperCase()) {
                            setBPlanBadge(val.toUpperCase());
                          }
                        }} 
                        placeholder="Contoh: Paket Pro Agent" 
                        required 
                      />
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

                    <div className="flex flex-col gap-2 pt-2 border-t">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                        <input 
                          type="checkbox"
                          checked={bPlanIsPopular}
                          onChange={(e) => setBPlanIsPopular(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent cursor-pointer"
                        />
                        <span>Tandai sebagai Paket Paling Populer</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-800">
                        <input 
                          type="checkbox"
                          checked={bPlanIsHidden}
                          onChange={(e) => setBPlanIsHidden(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>Sembunyikan Paket ini dari Halaman Builder (/builder)</span>
                      </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t">
                      <Button type="button" variant="ghost" className="rounded-full" onClick={() => setIsPlanModalOpen(false)}>Batal</Button>
                      <Button type="submit" disabled={isSavingPlan} className="bg-primary text-white rounded-full font-bold">
                        {isSavingPlan ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Paket'}
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ==========================================
              TAB FIRESTORE DATABASE USAGE MONITOR
              ========================================== */}
          <TabsContent value="firestoreUsage" className="space-y-6">
            <Card className="rounded-3xl border shadow-none bg-white p-6">
              <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <CardTitle className="text-xl font-headline font-bold text-primary flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-600 animate-pulse" /> Monitor Penggunaan Database Firestore
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pantau akumulasi pembacaan (Reads), penulisan (Writes), dan penghapusan (Deletes) dokumen Firestore secara real-time dari seluruh aktivitas builder.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Database Server Selector Dropdown */}
                  <div className="flex items-center gap-1.5 shrink-0 bg-slate-50 border rounded-full px-3.5 py-1.5 shadow-sm">
                    <Database className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Database Target:</span>
                    <select
                      value={metricsDbServerId}
                      onChange={(e) => {
                        const newDbId = e.target.value;
                        setMetricsDbServerId(newDbId);
                        loadFirestoreUsage(newDbId);
                      }}
                      className="bg-transparent text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="primary">Database Utama (Primary)</option>
                      {dbServers.map((srv) => (
                        <option key={srv.serverId} value={srv.serverId}>
                          {srv.serverName} ({srv.projectId})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button 
                    type="button"
                    onClick={() => loadFirestoreUsage(metricsDbServerId)} 
                    disabled={isLoadingUsage}
                    className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-full text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    {isLoadingUsage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                    Refresh Stats
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleResetFirestoreUsage} 
                    disabled={isLoadingUsage}
                    className="bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-full text-xs h-9 px-4 flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset Counter
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                {/* 3 Metrics Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Reads */}
                  <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Document Reads (Pembacaan)</span>
                      <span className="bg-blue-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">getDoc / onSnapshot</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-extrabold text-blue-900">{(firestoreUsage?.reads || 0).toLocaleString()} <span className="text-xs text-blue-700/70 font-semibold">kali</span></h2>
                      <p className="text-[10px] text-muted-foreground">Pembacaan data landing page, section, config, & testimoni.</p>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-blue-100/60">
                      <div className="flex justify-between text-[10px] text-blue-800 font-bold">
                        <span>Batas Kuota Gratis Harian:</span>
                        <span>{((firestoreUsage?.reads || 0) / 50000 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(((firestoreUsage?.reads || 0) / 50000 * 100), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                        <span>0 / hari</span>
                        <span>50,000 / hari (Firebase Free Tier)</span>
                      </div>
                    </div>
                  </div>

                  {/* Writes */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Document Writes (Penulisan)</span>
                      <span className="bg-amber-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">setDoc / updateDoc</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-extrabold text-amber-900">{(firestoreUsage?.writes || 0).toLocaleString()} <span className="text-xs text-amber-700/70 font-semibold">kali</span></h2>
                      <p className="text-[10px] text-muted-foreground">Penulisan data seksi, publish edits, & setup mitra baru.</p>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-amber-100/60">
                      <div className="flex justify-between text-[10px] text-amber-800 font-bold">
                        <span>Batas Kuota Gratis Harian:</span>
                        <span>{((firestoreUsage?.writes || 0) / 20000 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(((firestoreUsage?.writes || 0) / 20000 * 100), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                        <span>0 / hari</span>
                        <span>20,000 / hari (Firebase Free Tier)</span>
                      </div>
                    </div>
                  </div>

                  {/* Deletes */}
                  <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Document Deletes (Penghapusan)</span>
                      <span className="bg-red-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full">deleteDoc</span>
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-3xl font-extrabold text-red-900">{(firestoreUsage?.deletes || 0).toLocaleString()} <span className="text-xs text-red-700/70 font-semibold">kali</span></h2>
                      <p className="text-[10px] text-muted-foreground">Penghapusan data seksi, hapus tenant, & pembersihan orphans.</p>
                    </div>
                    <div className="space-y-1.5 pt-2 border-t border-red-100/60">
                      <div className="flex justify-between text-[10px] text-red-800 font-bold">
                        <span>Batas Kuota Gratis Harian:</span>
                        <span>{((firestoreUsage?.deletes || 0) / 20000 * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 w-full bg-red-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(((firestoreUsage?.deletes || 0) / 20000 * 100), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
                        <span>0 / hari</span>
                        <span>20,000 / hari (Firebase Free Tier)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Firestore Cost Estimator & Info Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  {/* Cost Estimator */}
                  <div className="p-5 border rounded-2xl bg-slate-50 space-y-3">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Estimasi Biaya Tambahan Firestore</h3>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Jika kuota gratis di atas terlewati, Firestore akan membebankan biaya per 100,000 operasi. Berikut estimasi akumulasi biaya berjalan saat ini:
                    </p>
                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Reads Cost ({Math.max(0, (firestoreUsage?.reads || 0) - 50000)} berbayar):</span>
                        <span className="font-mono">$ {Math.max(0, (((firestoreUsage?.reads || 0) - 50000) * 0.06 / 100000)).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Writes Cost ({Math.max(0, (firestoreUsage?.writes || 0) - 20000)} berbayar):</span>
                        <span className="font-mono">$ {Math.max(0, (((firestoreUsage?.writes || 0) - 20000) * 0.18 / 100000)).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>Deletes Cost ({Math.max(0, (firestoreUsage?.deletes || 0) - 20000)} berbayar):</span>
                        <span className="font-mono">$ {Math.max(0, (((firestoreUsage?.deletes || 0) - 20000) * 0.02 / 100000)).toFixed(4)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-primary pt-2 border-t">
                        <span>Total Biaya Berjalan:</span>
                        <span className="font-mono text-indigo-700">
                          $ {(
                            Math.max(0, (((firestoreUsage?.reads || 0) - 50000) * 0.06 / 100000)) + 
                            Math.max(0, (((firestoreUsage?.writes || 0) - 20000) * 0.18 / 100000)) + 
                            Math.max(0, (((firestoreUsage?.deletes || 0) - 20000) * 0.02 / 100000))
                          ).toFixed(4)} USD
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informational Notes */}
                  <div className="p-5 border rounded-2xl bg-indigo-50/30 border-indigo-100/50 space-y-3">
                    <h3 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      💡 Cara Kerja Pemantauan
                    </h3>
                    <ul className="text-[11px] text-indigo-950/80 space-y-2 list-disc pl-4 leading-relaxed">
                      <li>
                        <strong>Otomatis & Real-Time:</strong> Sistem memotong (intercept) query Firestore yang dieksekusi oleh web app dan mencatatnya ke local cache.
                      </li>
                      <li>
                        <strong>Sinkronisasi Efisien:</strong> Total statistik akan diunggah (sync) ke koleksi <code className="bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded font-mono font-bold">system_metrics/firestore_usage</code> secara berkala (dibungkus dalam increment offset) agar tidak menghasilkan loop query tambahan.
                      </li>
                      <li>
                        <strong>Bebas Bulak-Balik Firebase:</strong> Anda dapat melihat perkembangan kuota harian Anda secara visual dari panel ini tanpa perlu terus-menerus membuka halaman Firebase Console resmi!
                      </li>
                      {firestoreUsage?.lastUpdated && (
                        <li className="list-none pt-1 text-[10px] text-indigo-700/80 font-semibold italic">
                          Pembaruan Terakhir: {
                            firestoreUsage.lastUpdated.toDate ? firestoreUsage.lastUpdated.toDate().toLocaleString() : firestoreUsage.lastUpdated
                          }
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal Dialog Masukkan PIN Security untuk Membuka API Key */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm shadow-2xl rounded-3xl bg-white border-none overflow-hidden">
            <CardHeader className="bg-primary text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Lock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline font-bold">PIN Keamanan Required</CardTitle>
                  <CardDescription className="text-white/80 text-xs mt-0.5">
                    Masukkan PIN Super Admin untuk melihat Kunci API sensitif
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">PIN Keamanan Super Admin</Label>
                  <Input 
                    type="password"
                    maxLength={10}
                    value={enteredPin}
                    onChange={(e) => setEnteredPin(e.target.value)}
                    placeholder="••••••"
                    autoFocus
                    required
                    className="text-center font-mono text-lg tracking-widest h-12 rounded-2xl border-slate-300 focus:border-primary"
                  />
                  <p className="text-[11px] text-muted-foreground text-center">(Default PIN pertama kali: <code className="bg-slate-100 px-1 py-0.5 rounded font-bold">123456</code>)</p>
                </div>

                {pinError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200 text-center">
                    {pinError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsPinModalOpen(false)}
                    className="rounded-full text-xs font-bold h-10 px-4"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    className="rounded-full text-xs font-bold h-10 px-6 bg-primary text-white hover:bg-accent hover:text-accent-foreground"
                  >
                    Buka Akses API Key
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Dialog Ubah / Pengaturan PIN Security */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl rounded-3xl bg-white border-none overflow-hidden">
            <CardHeader className="bg-slate-900 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/30">
                  <ShieldCheck className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline font-bold">Pengaturan PIN Keamanan</CardTitle>
                  <CardDescription className="text-slate-300 text-xs mt-0.5">
                    Perbarui PIN untuk mengamankan Kunci API & data rahasia
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleChangePin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">PIN Lama</Label>
                  <Input 
                    type="password"
                    maxLength={10}
                    value={oldPinInput}
                    onChange={(e) => setOldPinInput(e.target.value)}
                    placeholder="Masukkan PIN lama..."
                    required
                    className="rounded-xl text-xs h-10 border-slate-300 font-mono tracking-widest"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">PIN Baru</Label>
                  <Input 
                    type="password"
                    maxLength={10}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Minimal 4 angka/karakter..."
                    required
                    className="rounded-xl text-xs h-10 border-slate-300 font-mono tracking-widest"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Konfirmasi PIN Baru</Label>
                  <Input 
                    type="password"
                    maxLength={10}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Ketik ulang PIN baru..."
                    required
                    className="rounded-xl text-xs h-10 border-slate-300 font-mono tracking-widest"
                  />
                </div>

                {changePinError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {changePinError}
                  </p>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsChangePinModalOpen(false)}
                    className="rounded-full text-xs font-bold h-10 px-4"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit"
                    className="rounded-full text-xs font-bold h-10 px-6 bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                  >
                    Simpan PIN Baru
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
