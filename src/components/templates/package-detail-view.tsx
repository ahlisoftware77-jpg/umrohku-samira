
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle,
  Calendar, 
  Hotel, 
  Clock,
  FileText,
  ArrowRight,
  BookOpen,
  Star,
  Plane,
  MapPin,
  Users,
  Shield,
  Wifi,
  Coffee,
  Bus,
  Camera,
  Award,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PaymentInfo from '@/components/sections/payment-info';
import { motion, AnimatePresence } from 'framer-motion';
import { Agent, getAgent } from '@/lib/agents';
import { getPackage } from '@/lib/packages';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const commonRequirements = [
  'Paspor dengan nama minimal 2 kata yang masih berlaku minimal 8 bulan sebelum tanggal keberangkatan',
  'FC KTP & Kartu Keluarga',
  'DP Rp. 1.500.000, tidak dapat dikembalikan (Non Refundable)',
  'Booking Seat Rp. 10.000.000.',
  'Dokumen dan Pelunasan 1,5 bulan sebelum tanggal keberangkatan',
  'Foto berwarna dengan latar belakang putih posisi muka/kepala 80% dan untuk wanita berjilbab tidak memakai warna putih.',
  'Ukuran 3x4 = 2 lembar & Softcopy Foto',
  'Copy sertifikat vaksin covid-19 (dosis 1 & 2)'
];

const standardExclusions = [
  'Biaya Pembuatan Passport',
  'Biaya Vaksin Meningitis',
  'Handling dan Perlengkapan Umroh Rp. 1.500.000',
  'Akomodasi / Hotel transit (jika diperlukan)',
  'Tiket Pesawat / Biaya Perjalanan Domestik',
  'Kelebihan Bagasi sesuai Ketentuan Penerbangan',
  'Tour/Makan/Minum tambahan diluar program',
  'Telephone Bill, Payview TV, Mini Bar, dan semua pemakaian fasilitas/layanan di hotel',
  'Biaya-biaya yang bersifat pribadi, dan atau yang bukan merupakan fasilitas program',
  'Biaya Tambahan (apabila ada) yang dikeluarkan oleh Pemerintah KSA untuk penerbitan Visa Umroh',
  'Biaya surat Kesehatan baru (Apabila ada) sebagai syarat untuk penerbitan Visa Umroh'
];

const packageTiers = [
  {
    name: 'Safara',
    stars: 3,
    badge: 'Ekonomis',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    makkah: 'Hotel bintang 3 — jarak ±900m (±13 menit jalan kaki)',
    madinah: 'Hotel bintang 3 — jarak ±500m (±10 menit jalan kaki)',
    gradient: 'from-blue-50 to-slate-50',
    icon: '🏨',
  },
  {
    name: 'Safawi',
    stars: 4,
    badge: 'Populer',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    makkah: 'Hotel bintang 4 — jarak ±750m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4 — jarak ±250m (±5 menit jalan kaki)',
    gradient: 'from-emerald-50 to-teal-50',
    icon: '🌟',
  },
  {
    name: 'Sukari',
    stars: 5,
    badge: 'Premium',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-200',
    makkah: 'Hotel bintang 5 — jarak ±300m (±5 menit jalan kaki)',
    madinah: 'Hotel bintang 4 — jarak ±150m (±3 menit jalan kaki)',
    gradient: 'from-violet-50 to-purple-50',
    icon: '💎',
  },
  {
    name: 'Majol',
    stars: 5,
    badge: 'VIP',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    makkah: 'Hotel bintang 5 — Depan pelataran (Zamzam Tower)',
    madinah: 'Hotel bintang 5 — Depan pelataran Masjid Nabawi',
    gradient: 'from-amber-50 to-orange-50',
    icon: '👑',
  }
];

const facilityIcons: Record<string, React.ReactNode> = {
  pesawat: <Plane className="w-5 h-5" />,
  hotel: <Hotel className="w-5 h-5" />,
  makan: <Coffee className="w-5 h-5" />,
  bus: <Bus className="w-5 h-5" />,
  visa: <Shield className="w-5 h-5" />,
  wifi: <Wifi className="w-5 h-5" />,
  perlengkapan: <Award className="w-5 h-5" />,
  dokumentasi: <Camera className="w-5 h-5" />,
  default: <CheckCircle2 className="w-5 h-5" />,
};

const getFacilityIcon = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('pesawat') || lower.includes('tiket')) return facilityIcons.pesawat;
  if (lower.includes('hotel')) return facilityIcons.hotel;
  if (lower.includes('makan') || lower.includes('minum') || lower.includes('konsumsi')) return facilityIcons.makan;
  if (lower.includes('bus') || lower.includes('transportasi')) return facilityIcons.bus;
  if (lower.includes('visa') || lower.includes('asuransi')) return facilityIcons.visa;
  if (lower.includes('wifi')) return facilityIcons.wifi;
  if (lower.includes('perlengkapan') || lower.includes('tas')) return facilityIcons.perlengkapan;
  return facilityIcons.default;
};

const brochureImagesList = [
  '/images/b1.jpeg', '/images/b2.jpeg', '/images/b3.jpeg', '/images/b4.jpeg',
  '/images/b5.jpeg', '/images/b6.jpeg', '/images/b7.jpeg', '/images/b8.jpeg',
];

interface PackageDetailViewProps {
  packageId: string;
  agent?: Agent;
}

type TabKey = 'itinerary' | 'facilities' | 'hotels' | 'requirements';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'itinerary', label: 'Jadwal', icon: <Calendar className="w-4 h-4" /> },
  { key: 'facilities', label: 'Fasilitas', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'hotels', label: 'Akomodasi', icon: <Hotel className="w-4 h-4" /> },
  { key: 'requirements', label: 'Persyaratan', icon: <FileText className="w-4 h-4" /> },
];

export default function PackageDetailView({ packageId, agent: providedAgent }: PackageDetailViewProps) {
  const router = useRouter();
  const pkg = getPackage(packageId);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('itinerary');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const agent = providedAgent || getAgent('default');
  const agentSlug = agent?.slug || 'default';
  const prefix = agentSlug === 'default' ? '' : `/${agentSlug}`;

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Paket tidak ditemukan</h1>
        <Button onClick={() => router.push(`${prefix}/`)}>Kembali ke Beranda</Button>
      </div>
    );
  }

  const image = PlaceHolderImages.find(p => p.id === pkg.imageId);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Header agent={agent} />
      <main className="flex-1 pt-20">

        {/* ── HERO BANNER ── */}
        <div className="relative h-[45vh] md:h-[65vh] w-full overflow-hidden">
          {image && (
            <Image src={image.imageUrl} alt={pkg.title} fill className="object-cover scale-105" priority />
          )}
          {/* Deep gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-transparent" />

          {/* Breadcrumb */}
          <div className="absolute top-6 left-6 flex items-center gap-2 text-white/80 text-sm">
            <button onClick={() => router.push(`${prefix}/`)} className="hover:text-white transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Beranda
            </button>
            <ChevronRight className="w-3 h-3 opacity-50" />
            <span className="text-white font-semibold">{pkg.title}</span>
          </div>

          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute bottom-0 left-0 right-0 p-6 md:p-12"
          >
            <div className="container mx-auto max-w-6xl">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-accent/90 backdrop-blur-md text-accent-foreground px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow">
                  ✨ Paket Unggulan
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> {pkg.duration}
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Grup & Individu
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-headline font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
                {pkg.title}
              </h1>
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("w-5 h-5", i < 4 ? "fill-accent text-accent" : "fill-white/30 text-white/30")} />
                ))}
                <span className="text-white/80 text-sm ml-2">4.9 / 5.0 — 2.400+ Jamaah</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="container mx-auto max-w-6xl px-4 py-10">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Description Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-1 block">Deskripsi Paket</span>
                      <h2 className="text-xl md:text-2xl font-headline font-bold text-primary leading-tight">
                        Perjalanan Suci yang Tak Terlupakan
                      </h2>
                    </div>
                    <Button
                      onClick={() => setIsBrochureOpen(true)}
                      variant="outline"
                      className="rounded-2xl gap-2 shrink-0 border-primary/20 hover:border-primary hover:bg-primary hover:text-white transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Lihat Brosur</span>
                    </Button>
                  </div>

                  <p className="text-gray-600 leading-relaxed text-sm md:text-base mb-6">{pkg.description}</p>

                  {/* Quick stats row */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                    {[
                      { icon: <Plane className="w-5 h-5 text-primary" />, label: 'Pesawat', val: 'Langsung' },
                      { icon: <MapPin className="w-5 h-5 text-primary" />, label: 'Destinasi', val: 'Makkah & Madinah' },
                      { icon: <Shield className="w-5 h-5 text-primary" />, label: 'Asuransi', val: 'Termasuk' },
                    ].map((stat, i) => (
                      <div key={i} className="text-center">
                        <div className="flex justify-center mb-2 p-2 bg-primary/5 rounded-xl w-fit mx-auto">
                          {stat.icon}
                        </div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                        <div className="text-sm font-bold text-primary">{stat.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── TABS ── */}
              {isMounted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  {/* Tab header */}
                  <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          "flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 -mb-px",
                          activeTab === tab.key
                            ? "border-primary text-primary bg-primary/3"
                            : "border-transparent text-gray-500 hover:text-primary hover:bg-gray-50"
                        )}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="p-6 md:p-8"
                    >

                      {/* ── JADWAL ── */}
                      {activeTab === 'itinerary' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-primary">Itinerari Perjalanan</h3>
                              <p className="text-xs text-gray-500">Jadwal kegiatan selama {pkg.duration}</p>
                            </div>
                          </div>
                          <div className="relative">
                            {/* Vertical line */}
                            <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/40 to-transparent" />
                            <div className="space-y-0">
                              {pkg.itinerary.map((item, idx) => (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="flex gap-4 pb-6 last:pb-0"
                                >
                                  {/* Day dot */}
                                  <div className="relative shrink-0">
                                    <div className={cn(
                                      "w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-extrabold shadow-sm",
                                      idx === 0 ? "bg-primary text-white" : idx === pkg.itinerary.length - 1 ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                                    )}>
                                      {item.day}
                                    </div>
                                  </div>
                                  {/* Activity */}
                                  <div className={cn(
                                    "flex-1 p-4 rounded-2xl border transition-all",
                                    idx === 0 ? "bg-primary/5 border-primary/20" : "bg-gray-50 border-gray-100 hover:border-primary/20 hover:bg-primary/3"
                                  )}>
                                    <div className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-1">Hari ke-{item.day}</div>
                                    <p className="text-sm text-gray-700 leading-relaxed">{item.activity}</p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── FASILITAS ── */}
                      {activeTab === 'facilities' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-xl">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-primary">Rincian Fasilitas</h3>
                              <p className="text-xs text-gray-500">Apa saja yang Anda dapatkan dalam paket ini</p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Inclusions */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <h4 className="font-bold text-gray-800">Sudah Termasuk</h4>
                              </div>
                              <div className="space-y-2">
                                {pkg.inclusions.map((inc, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 hover:border-emerald-200 transition-all"
                                  >
                                    <div className="shrink-0 mt-0.5 text-emerald-600">
                                      {getFacilityIcon(inc)}
                                    </div>
                                    <span className="text-sm text-gray-700 leading-snug">{inc}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Exclusions */}
                            <div>
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 rounded-full bg-rose-400" />
                                <h4 className="font-bold text-gray-800">Belum Termasuk</h4>
                              </div>
                              <div className="space-y-2">
                                {standardExclusions.map((exc, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex items-start gap-3 p-3 bg-rose-50/60 rounded-xl border border-rose-100 hover:border-rose-200 transition-all"
                                  >
                                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span className="text-sm text-gray-600 leading-snug">{exc}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ── AKOMODASI ── */}
                      {activeTab === 'hotels' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-violet-50 rounded-xl">
                              <Hotel className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-primary">Pilihan Akomodasi</h3>
                              <p className="text-xs text-gray-500">Hotel tersedia di Makkah & Madinah sesuai pilihan paket</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            {packageTiers.map((tier, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className={cn("relative rounded-2xl border p-5 bg-gradient-to-r", tier.gradient, "border-gray-200 hover:shadow-md transition-all overflow-hidden")}
                              >
                                {/* Background pattern */}
                                <div className="absolute top-0 right-0 text-6xl opacity-10 pr-4 pt-2 select-none">{tier.icon}</div>

                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="text-3xl">{tier.icon}</div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-extrabold text-gray-900 text-lg">{tier.name}</h4>
                                        <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", tier.badgeColor)}>
                                          {tier.badge}
                                        </span>
                                      </div>
                                      <div className="flex gap-0.5 mb-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star key={i} className={cn("w-3.5 h-3.5", i < tier.stars ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                                  <div className="flex items-start gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Makkah</div>
                                      <div className="text-xs text-gray-700 leading-relaxed">{tier.makkah}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">Madinah</div>
                                      <div className="text-xs text-gray-700 leading-relaxed">{tier.madinah}</div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── PERSYARATAN ── */}
                      {activeTab === 'requirements' && (
                        <div>
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 rounded-xl">
                              <FileText className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-primary">Dokumen & Persyaratan</h3>
                              <p className="text-xs text-gray-500">Siapkan semua dokumen berikut sebelum mendaftar</p>
                            </div>
                          </div>

                          {/* Important notice */}
                          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
                            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-800">
                              <strong>Penting:</strong> Pastikan seluruh dokumen sudah disiapkan minimal <strong>6 minggu</strong> sebelum tanggal keberangkatan untuk kelancaran proses visa dan administrasi.
                            </div>
                          </div>

                          <div className="space-y-3">
                            {commonRequirements.map((req, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06 }}
                                className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-primary/3 hover:border-primary/20 transition-all group"
                              >
                                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                                  {i + 1}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{req}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="bg-white rounded-3xl p-20 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Memuat Detail Paket...</p>
                </div>
              )}
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-5">

                {/* Price Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative bg-primary rounded-3xl overflow-hidden shadow-2xl"
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-accent/20 rounded-full" />

                  <div className="relative p-8">
                    <p className="text-white/60 font-bold uppercase text-xs tracking-widest mb-1">Mulai dari</p>
                    <h3 className="text-4xl md:text-5xl font-extrabold font-headline text-accent mb-1">{pkg.price}</h3>
                    <p className="text-white/50 text-xs mb-8">/ orang · sudah termasuk pajak</p>

                    <div className="space-y-3 mb-8">
                      {[
                        { icon: <Clock className="w-4 h-4" />, text: pkg.duration },
                        { icon: <Users className="w-4 h-4" />, text: 'Grup & Individu tersedia' },
                        { icon: <Shield className="w-4 h-4" />, text: 'Asuransi perjalanan termasuk' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/80 text-sm">
                          <div className="text-accent">{item.icon}</div>
                          {item.text}
                        </div>
                      ))}
                    </div>

                    {agent.whatsapp ? (
                      <Button asChild className="w-full bg-accent text-accent-foreground h-14 rounded-2xl font-bold text-base hover:bg-white hover:text-primary transition-all shadow-lg shadow-accent/20">
                        <Link href={`https://wa.me/${agent.whatsapp}?text=Assalamu'alaikum, saya ingin mengetahui lebih lanjut tentang Paket ${pkg.title}`}>
                          Bismillah, Daftar Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button className="w-full bg-accent/30 text-white/50 h-14 rounded-2xl font-bold text-base cursor-not-allowed">
                        Pendaftaran Belum Aktif
                      </Button>
                    )}

                    <p className="text-center text-white/40 text-xs mt-4">
                      Konsultasi gratis · Tidak ada biaya tersembunyi
                    </p>
                  </div>
                </motion.div>

                {/* Brochure Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <button
                    onClick={() => setIsBrochureOpen(true)}
                    className="w-full group bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary transition-all">
                      <BookOpen className="w-6 h-6 text-primary group-hover:text-white transition-all" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-800 text-sm">Lihat Brosur Lengkap</div>
                      <div className="text-xs text-gray-500">8 halaman brosur visual</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary ml-auto transition-all" />
                  </button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl border border-gray-100 p-5"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Kepercayaan Jamaah</h4>
                  <div className="space-y-3">
                    {[
                      { icon: '🏆', text: 'Rekor MURI 2024', sub: 'Biro umroh terpercaya' },
                      { icon: '🛡️', text: 'Izin Kemenag Resmi', sub: 'No. 760 / 2019' },
                      { icon: '⭐', text: '2.400+ Jamaah', sub: 'Berangkat bersama kami' },
                    ].map((b, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-2xl">{b.icon}</span>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{b.text}</div>
                          <div className="text-xs text-gray-500">{b.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        <PaymentInfo />
      </main>

      {/* Brochure Dialog */}
      <Dialog open={isBrochureOpen} onOpenChange={setIsBrochureOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-bold text-primary">Brosur Paket {pkg.title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 mt-2">
            {brochureImagesList.map((img, i) => (
              <img key={i} src={img} alt={`Brosur ${i + 1}`} className="w-full h-auto rounded-2xl shadow-sm" />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Footer agent={agent} />
    </div>
  );
}
