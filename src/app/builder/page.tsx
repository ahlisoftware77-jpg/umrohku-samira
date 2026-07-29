"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BuilderPlan } from '@/types/cms';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Layout, 
  BookOpen, 
  Clock, 
  Check,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function BuilderLandingPage() {
  const waNumber = '6283815862300';
  const waMessage = encodeURIComponent('Halo Admin, saya ingin bertanya tentang Layanan Pembuatan Website & Landing Page Umrah Samira.');

  const [plans, setPlans] = useState<BuilderPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const defaultPlans: BuilderPlan[] = [
    {
      planId: 'free',
      name: 'Gratis Selamanya',
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

  useEffect(() => {
    async function fetchPlans() {
      try {
        const snap = await getDocs(collection(db, 'plans'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as BuilderPlan);
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setPlans(list);
        } else {
          setPlans(defaultPlans);
        }
      } catch (err) {
        // Quiet fallback to default plans for unauthenticated public visitors
        setPlans(defaultPlans);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Background Subtle Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-400/20 via-amber-200/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top Floating Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-200/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold font-headline shadow-md shadow-amber-500/20">
              S
            </div>
            <div>
              <span className="font-headline font-bold text-lg text-slate-950 tracking-tight">SAMIRA <span className="text-amber-600">Builder</span></span>
              <span className="block text-[10px] text-slate-500 font-medium -mt-1">Landing Page Platform</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="text-xs font-bold text-slate-700 hover:text-slate-950 px-3 py-2 transition-colors hidden sm:block"
            >
              Masuk Akun
            </Link>
            <Link 
              href="/dashboard?mode=register"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105"
            >
              <Zap className="w-3.5 h-3.5" /> Buat Website Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 z-10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs uppercase tracking-wider mb-6 shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
            Platform Landing Page Umrah #1 Untuk Mitra & Agen
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-6xl font-headline font-bold text-slate-950 tracking-tight leading-tight mb-6"
          >
            Miliki Website Umrah Profesional <br className="hidden sm:block" />
            <span className="text-amber-600 underline decoration-amber-300 decoration-wavy">
              Hanya Dalam 1 Menit
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-700 text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-medium"
          >
            Tingkatkan kepercayaan calon jamaah! Lengkap dengan E-Katalog 2025/2026 interaktif, paket ibadah, form konsultasi WA, dan subdomain gratis atas nama Anda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard?mode=register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-13 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm md:text-base shadow-lg shadow-amber-500/25 transition-all hover:scale-105"
            >
              <Zap className="w-5 h-5 fill-slate-950" /> Buat Website Sekarang (Gratis)
            </Link>

            <a
              href={`https://wa.me/${waNumber}?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-13 px-6 rounded-2xl border border-amber-300 bg-white hover:bg-amber-50 text-slate-900 font-semibold text-sm transition-colors shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Tanya Konsultan Builder
            </a>
          </motion.div>

          {/* Social Proof Stats */}
          <div className="mt-12 pt-8 border-t border-amber-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-amber-600">1 Menit</p>
              <p className="text-xs text-slate-600 font-medium">Proses Aktivasi Langsung</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">100%</p>
              <p className="text-xs text-slate-600 font-medium">Integrasi WhatsApp Anda</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">47 Halaman</p>
              <p className="text-xs text-slate-600 font-medium">E-Katalog Flipbook 2025</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">Rp 0,-</p>
              <p className="text-xs text-slate-600 font-medium">Paket Mulai Bebas Biaya</p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-white relative z-10 border-y border-amber-200/60 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-4xl font-headline font-bold text-slate-950 mb-4">
              Segala Yang Anda Butuhkan Untuk Memasarkan Umrah
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium">
              Didesain khusus untuk memenuhi kebutuhan agen & biro perjalanan umrah agar lebih cepat closing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Langsung Siap Pakai Dalam 1 Menit</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Begitu mendaftar, sistem otomatis membuatkan 8 seksi lengkap (Hero, Paket, E-Katalog, Peta, Form WA, dll).
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Terintegrasi Chat WhatsApp</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Semua calon jamaah yang mengisi form atau mengklik tombol konsultasi akan langsung masuk ke WhatsApp HP Anda.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mb-5">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">E-Katalog Flipbook 47 Halaman</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Sudah termasuk viewer buku katalog interaktif 2025/2026 yang dapat di-flip dan di-download dalam bentuk PDF.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Subdomain Kustom Pemilik Akun</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Dapatkan nama alamat web resmi kustom Anda sendiri (contoh: <code className="text-amber-800 font-bold bg-amber-100 px-1 rounded">namamitra.samiratravel.id</code>).
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mb-5">
                <Layout className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">CMS Visual Live Editor</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Ubah judul, warna, deskripsi, foto, dan susunan seksi secara langsung di layar editor drag & drop yang sangat mudah.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-xl transition-all duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950 mb-2">Akses Publik 100% Bebas Hambatan</h3>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Website Anda dapat diakses oleh siapapun di seluruh dunia 24/7 tanpa perlu login dengan performa tinggi.
              </p>
            </Card>

          </div>
        </div>
      </section>

      {/* Pricing / Plan Table Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-4xl font-headline font-bold text-slate-950 mb-3">
              Pilih Paket Layanan Website Anda
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Mulai gratis sekarang dan tingkatkan fitur sesuai kebutuhan bisnis travel Anda.
            </p>
          </div>

          {loadingPlans ? (
            <div className="py-16 flex items-center justify-center flex-col">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Memuat paket layanan terbaru...</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${plans.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 items-stretch`}>
              {plans.map((p) => {
                const isPopular = p.isPopular;
                return (
                  <div 
                    key={p.planId}
                    className={`rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 ${
                      isPopular 
                        ? 'bg-amber-50/90 border-2 border-amber-400 shadow-2xl' 
                        : 'bg-white border border-amber-200/90'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-4 py-1 rounded-bl-xl shadow-md">
                        PALING POPULER
                      </div>
                    )}

                    <div>
                      <span className={`inline-block px-3 py-1 rounded-full font-bold text-xs mb-4 border ${
                        isPopular ? 'bg-amber-200 text-amber-900 border-amber-300' : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {p.badge || p.name.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-950 mb-2">{p.name}</h3>
                      <p className="text-xs text-slate-600 mb-6">{p.description}</p>

                      <div className={`text-3xl font-bold mb-6 ${isPopular ? 'text-amber-700' : 'text-slate-950'}`}>
                        {p.price} <span className="text-xs font-normal text-slate-500">{p.period}</span>
                      </div>

                      <div className="space-y-3 border-t border-slate-200/80 pt-6 text-xs text-slate-800 font-medium">
                        {p.features?.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-amber-600' : 'text-emerald-600'}`} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8">
                      <Link
                        href="/dashboard?mode=register"
                        className={`w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-xs transition-all ${
                          isPopular 
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02]' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                        }`}
                      >
                        {isPopular ? <Zap className="w-4 h-4" /> : null} Pilih Paket Ini
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Final Call To Action */}
      <section className="py-20 bg-gradient-to-b from-amber-100/60 to-slate-50 border-t border-amber-200/80 text-center relative z-10">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-slate-950 mb-6">
            Siap Melipatgandakan Pendaftaran Umrah Anda?
          </h2>
          <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-8 font-medium">
            Daftar sekarang dalam 1 menit dan miliki website landing page umrah profesional milik Anda sendiri hari ini.
          </p>

          <Link
            href="/dashboard?mode=register"
            className="inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-2xl shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5 fill-slate-950" /> Buat Website Umrah Anda Sekarang
          </Link>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 relative z-10 bg-white">
        <div className="container mx-auto px-4">
          <p>© 2026 SAMIRA Builder Platform. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  );
}
