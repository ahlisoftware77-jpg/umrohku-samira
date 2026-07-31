"use client";

import React, { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db, getDynamicFirebaseInstance } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';
import { Tenant, TestimonialItem } from '@/types/cms';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Star, CheckCircle2, MessageSquare, HeartHandshake, Sparkles, Send, Camera, X, Loader2, Upload, Search, ArrowLeft, Filter, Plus } from 'lucide-react';

interface PageProps {
  params: Promise<{ tenantId: string }>;
}

// Upload to Cloudinary using unsigned preset (no secret needed)
async function uploadToCloudinary(file: File, tenantId: string): Promise<string> {
  let cloudName = 'landing-umroh';
  let uploadPreset = 'ml_default';

  try {
    const snap = await getDoc(doc(db, 'systemSettings', 'global'));
    if (snap.exists()) {
      const d = snap.data();
      if (d?.cloudinary?.cloudName) cloudName = d.cloudinary.cloudName;
      if (d?.cloudinary?.uploadPreset) uploadPreset = d.cloudinary.uploadPreset;
    }
  } catch (_) {}

  const folder = `tenant/${tenantId}/testimonials`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Upload gagal');
  const data = await res.json();
  return data.secure_url as string;
}

// Fallback: convert to Data URL for local storage
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Default sample testimonials when none are found in database
const defaultSamples = [
  {
    testimonialId: 'sample_1',
    name: 'Hj. Fatmawati & Keluarga',
    role: 'Jamaah Umrah Reguler - Jakarta',
    comment: 'Pelayanannya sangat profesional, pembimbingnya sabar dan jelas. Ibadah menjadi lebih tenang dan fokus. Hotel sangat dekat masjid.',
    rating: 5,
    createdAt: new Date().toISOString()
  },
  {
    testimonialId: 'sample_2',
    name: 'Bpk. Triyadi Yanuar',
    role: 'Jamaah Umrah Plus Turkey - Surabaya',
    comment: 'Sangat memuaskan! Jadwal penerbangan tepat waktu, bus AC eksekutif bersih, dan konsumsi makanan khas Indonesia selalu tersedia.',
    rating: 5,
    createdAt: new Date().toISOString()
  },
  {
    testimonialId: 'sample_3',
    name: 'Ibu Ira Fransisca',
    role: 'Jamaah Umrah VIP - Bandung',
    comment: 'Pengalaman umrah pertama yang sangat berkesan. Semua fasilitas sesuai dengan yang dijanjikan. Terima kasih SAMIRA!',
    rating: 5,
    createdAt: new Date().toISOString()
  }
];

export default function PublicTestimonialPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.tenantId;

  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'all' || searchParams.get('tab') === 'list' ? 'list' : 'list';

  const [activeTab, setActiveTab] = useState<'list' | 'form'>(initialView);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [targetDbInstance, setTargetDbInstance] = useState<any>(db);
  const [loading, setLoading] = useState(true);

  // Testimonials List state
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState<number>(0); // 0 = all ratings

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Photo states
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadTenantAndTestimonials() {
      try {
        setLoading(true);
        const qId = query(collection(db, 'tenants'), where('tenantId', '==', targetId));
        let snap = await getDocs(qId);

        if (snap.empty) {
          const qSub = query(collection(db, 'tenants'), where('subdomain', '==', targetId));
          snap = await getDocs(qSub);
        }

        let foundTenant: Tenant | null = null;
        if (!snap.empty) {
          foundTenant = snap.docs[0].data() as Tenant;
          setTenant(foundTenant);
        }

        // Resolve Target Database Server Instance dynamically for cluster tenants (e.g. umroh2)
        let resolvedTargetDb = db;
        if (foundTenant && foundTenant.dbServerId && foundTenant.dbServerId !== 'default') {
          try {
            const dbServersSnap = await getDocs(collection(db, 'databaseServers'));
            const servers = dbServersSnap.docs.map(d => d.data() as any);
            const serverConfig = servers.find(s => s.serverId === foundTenant?.dbServerId);
            if (serverConfig) {
              resolvedTargetDb = getDynamicFirebaseInstance(serverConfig).db;
            }
          } catch (e) {}
        }
        setTargetDbInstance(resolvedTargetDb);

        // Fetch testimonials for this tenant from resolved targetDb
        const activeTenantId = foundTenant?.tenantId || targetId;
        const qTesti = query(
          collection(resolvedTargetDb, 'testimonials'),
          where('tenantId', '==', activeTenantId)
        );
        const snapTesti = await getDocs(qTesti);
        const loadedItems = snapTesti.docs
          .map(d => d.data() as TestimonialItem)
          .filter(t => !t.status || t.status === 'approved');

        setTestimonialsList(loadedItems);
      } catch (err) {
        console.error('Error fetching tenant & testimonials:', err);
      } finally {
        setLoading(false);
      }
    }

    if (targetId) loadTenantAndTestimonials();
  }, [targetId]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(previewUrl);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    if (!name || !comment) {
      alert('Harap isi nama dan ulasan Anda!');
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl: string | undefined;
      if (photoFile) {
        setIsUploadingPhoto(true);
        try {
          avatarUrl = await uploadToCloudinary(photoFile, tenant.tenantId);
        } catch (_) {
          try {
            avatarUrl = await fileToDataUrl(photoFile);
          } catch (__) {}
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      const testimonialId = `testi_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const newTestimonial: TestimonialItem = {
        testimonialId,
        tenantId: tenant.tenantId,
        name,
        role: role || 'Jamaah Umrah',
        comment,
        rating,
        ...(avatarUrl ? { avatarUrl } : {}),
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(targetDbInstance, 'testimonials', testimonialId), newTestimonial);
      setTestimonialsList(prev => [newTestimonial, ...prev]);
      setIsSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengirim testimoni: ' + (err.message || 'Terjadi kesalahan jaringan'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combine DB list or fallback samples for display
  const allDisplayItems = testimonialsList.length > 0 ? testimonialsList : (defaultSamples as any[]);

  // Filter list by search query & rating selector
  const filteredTestimonials = allDisplayItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRating = selectedRating === 0 || item.rating === selectedRating;

    return matchesSearch && matchesRating;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-400 border-t-transparent" />
          <p className="text-xs text-slate-400 animate-pulse">Menghubungkan ke Borang Testimoni Mitra...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-white font-sans">
        <Card className="max-w-md w-full rounded-3xl bg-slate-900 border-slate-800 text-slate-100 p-6 text-center space-y-4">
          <MessageSquare className="h-12 w-12 text-amber-400 mx-auto opacity-60" />
          <CardTitle className="text-xl font-bold">Mitra Tidak Ditemukan</CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Halaman testimoni yang Anda tuju tidak ditemukan atau tautan sudah tidak aktif.
          </CardDescription>
        </Card>
      </div>
    );
  }

  const subdomainLink = `/${tenant.subdomain || targetId}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans relative overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-primary/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        {/* Navigation Bar Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <Link
            href={subdomainLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-amber-300 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Website Utama
          </Link>

          {/* Tab Switcher */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-full shadow-inner">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'list'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌟 Semua Testimoni ({allDisplayItems.length})
            </button>
            <button
              onClick={() => { setActiveTab('form'); setIsSubmitted(false); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'form'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ✍️ Tulis Testimoni
            </button>
          </div>
        </div>

        {/* Partner Branding Header */}
        <div className="text-center space-y-2 py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" /> Testimoni & Kesan Jamaah Resmi
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
            {tenant.name}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            {tenant.company} • Pengalaman jujur dari para jamaah yang telah menunaikan ibadah suci Haji & Umrah bersama kami.
          </p>
        </div>

        {/* TAB 1: LIST / FULL VIEW ALL TESTIMONIALS */}
        {activeTab === 'list' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-900/90 p-3.5 rounded-3xl border border-slate-800/80 shadow-xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kata kunci ulasan atau nama jamaah..."
                  className="bg-slate-950 border-slate-800 text-slate-100 rounded-2xl text-xs h-10 pl-10 placeholder:text-slate-600 focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Rating Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedRating(0)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors ${
                    selectedRating === 0
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  Semua ({allDisplayItems.length})
                </button>
                <button
                  onClick={() => setSelectedRating(5)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap flex items-center gap-1 transition-colors ${
                    selectedRating === 5
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 5 Stars
                </button>
              </div>
            </div>

            {/* Grid of Testimonials */}
            {filteredTestimonials.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTestimonials.map((item, idx) => (
                  <Card key={item.testimonialId || idx} className="rounded-3xl bg-slate-900/80 border-slate-800/80 text-slate-100 shadow-lg hover:border-amber-400/30 transition-all flex flex-col justify-between p-5 space-y-4">
                    <div className="space-y-3">
                      {/* Rating Stars */}
                      <div className="flex text-amber-400 gap-1">
                        {[...Array(item.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>

                      {/* Comment Quote */}
                      <blockquote className="text-xs md:text-sm text-slate-200 leading-relaxed italic">
                        &ldquo;{item.comment}&rdquo;
                      </blockquote>
                    </div>

                    {/* Author Footer */}
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/40 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-amber-300">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs md:text-sm text-amber-300 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{item.role || 'Jamaah Umrah'}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl bg-slate-900/60 border-slate-800 text-center p-8 space-y-3">
                <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Tidak ada testimoni yang cocok dengan kriteria pencarian.</p>
                <Button
                  onClick={() => { setSearchQuery(''); setSelectedRating(0); }}
                  variant="outline"
                  className="rounded-full text-xs font-bold border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Reset Filter
                </Button>
              </Card>
            )}

            {/* Bottom Call to Action */}
            <div className="text-center pt-4">
              <Button
                onClick={() => { setActiveTab('form'); setIsSubmitted(false); }}
                className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 font-extrabold rounded-full px-6 h-11 text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-xl hover:opacity-90 transition-transform transform hover:scale-105"
              >
                <Plus className="h-4 w-4" /> Tulis Testimoni Anda Sekarang
              </Button>
            </div>
          </div>
        )}

        {/* TAB 2: FORM FOR SUBMITTING A NEW TESTIMONIAL */}
        {activeTab === 'form' && (
          <div className="max-w-xl mx-auto animate-in fade-in duration-300">
            <Card className="rounded-3xl bg-slate-900/90 border-slate-800 text-slate-100 shadow-2xl backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                {isSubmitted ? (
                  <div className="text-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Jazakallah Khair!</h2>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                      Terima kasih banyak atas ulasan & testimoni yang Anda berikan. Testimoni Anda telah berhasil terikat secara resmi pada akun <strong className="text-amber-300">{tenant.name}</strong> dan tampil di website.
                    </p>
                    <div className="flex justify-center gap-2 pt-2">
                      <Button 
                        onClick={() => setActiveTab('list')}
                        className="bg-amber-400 text-slate-950 hover:bg-amber-300 font-extrabold rounded-full px-6 text-xs h-9 shadow-lg"
                      >
                        🌟 Lihat Semua Testimoni
                      </Button>
                      <Button 
                        onClick={() => { setIsSubmitted(false); setName(''); setComment(''); setRole(''); clearPhoto(); }}
                        variant="outline"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 font-bold rounded-full px-5 text-xs h-9"
                      >
                        + Kirim Lagi
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Rating Selector */}
                    <div className="space-y-2 text-center pb-3 border-b border-slate-800">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Beri Rating Pengalaman Ibadah Anda
                      </Label>
                      <div className="flex justify-center items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-300">
                        {rating === 5 ? '⭐️⭐️⭐️⭐️⭐️ Sangat Memuaskan (5/5)' : `${rating} Bintang`}
                      </span>
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Camera className="h-3.5 w-3.5 text-amber-400" /> Foto Jamaah (Opsional)
                      </Label>

                      {photoPreview ? (
                        <div className="flex items-center gap-3 p-3 bg-slate-950/60 border border-slate-700 rounded-2xl">
                          <div className="relative shrink-0">
                            <img
                              src={photoPreview}
                              alt="Preview foto"
                              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/40"
                            />
                            {isUploadingPhoto && (
                              <div className="absolute inset-0 bg-slate-950/70 rounded-full flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 font-medium truncate">{photoFile?.name}</p>
                            <p className="text-[10px] text-slate-500">Foto akan tampil di kartu testimoni website</p>
                          </div>
                          <button
                            type="button"
                            onClick={clearPhoto}
                            className="shrink-0 h-7 w-7 rounded-full bg-slate-800 hover:bg-red-900/40 hover:text-red-400 flex items-center justify-center text-slate-400 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center gap-2 p-4 border border-dashed border-slate-700 rounded-2xl bg-slate-950/40 cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/5 transition-colors group">
                          <div className="h-10 w-10 rounded-full bg-slate-800 group-hover:bg-amber-400/10 flex items-center justify-center transition-colors">
                            <Upload className="h-5 w-5 text-slate-500 group-hover:text-amber-400 transition-colors" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">Klik untuk pilih foto</p>
                            <p className="text-[10px] text-slate-600">JPG, PNG, WEBP • Maks 5MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={handlePhotoChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* Jamaah Name */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Nama Lengkap Jamaah *</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Contoh: Hj. Fatmawati & Keluarga"
                        required
                        className="bg-slate-950 border-slate-800 text-slate-100 rounded-2xl text-xs h-10 placeholder:text-slate-600 focus:border-amber-400"
                      />
                    </div>

                    {/* Role / City */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Paket Ibadah / Kota Asal</Label>
                      <Input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Contoh: Jamaah Umrah Reguler 2025 - Jakarta"
                        className="bg-slate-950 border-slate-800 text-slate-100 rounded-2xl text-xs h-10 placeholder:text-slate-600 focus:border-amber-400"
                      />
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-300">Isi Pengalaman & Testimoni Anda *</Label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Ceritakan kesan ibadah, pelayanan ustaz pembimbing, hotel, bus, dan konsumsi Anda..."
                        required
                        rows={4}
                        className="bg-slate-950 border-slate-800 text-slate-100 rounded-2xl text-xs placeholder:text-slate-600 focus:border-amber-400 leading-relaxed"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 text-slate-950 hover:opacity-90 font-extrabold rounded-full h-11 text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> {isUploadingPhoto ? 'Mengunggah Foto...' : 'Menyimpan...'}</>
                      ) : (
                        <><Send className="h-4 w-4" /> Kirimkan Testimoni Saya</>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-4">
          <HeartHandshake className="h-3.5 w-3.5 text-amber-400" /> Sistem Testimoni Resmi Terisolasi Multi-Tenant Samira
        </p>
      </div>
    </div>
  );
}
