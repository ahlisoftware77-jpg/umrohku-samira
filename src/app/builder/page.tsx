"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BuilderPlan } from '@/types/cms';
import { 
  Sparkles, 
  Globe, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  MessageSquare, 
  Layout, 
  BookOpen, 
  Clock, 
  Check,
  Loader2,
  ChevronRight,
  Star
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
      name: 'Uji Coba Gratis',
      badge: 'GRATIS 14 HARI PERTAMA',
      price: 'Rp 0',
      period: '/ 14 hari pertama',
      description: 'Uji coba gratis seluruh fitur selama 14 hari pertama untuk langsung memasarkan paket umrah Anda.',
      features: [
        'Akses Gratis 14 Hari Pertama',
        '1 Halaman Landing Page Utama',
        'Subdomain Pemilik Akun Gratis',
        '13 Seksi Komplit Siap Pakai (Hero, Paket, Katalog 47 Hal, Pembiayaan, MURI, Hotel, dll)',
        'Integrasi Form WhatsApp Konsultan',
        'Pustaka Server Media Upload'
      ],
      order: 1
    },
    {
      planId: 'pro',
      name: 'Pro Agent Samira',
      badge: 'PAKET PRO BERLANGGANAN',
      price: 'Rp 199.000',
      period: '/ bulan',
      isPopular: true,
      description: 'Perpanjang dan buka fitur lengkap untuk memperkuat branding biro travel umrah Anda.',
      features: [
        'Semua Fitur Uji Coba Gratis',
        'Perpanjangan Masa Aktif Langganan',
        'Dukungan Domain Kustom (`domainanda.com`)',
        'Kapasitas Storage Server Media 500MB',
        'Bebas Hapus Branding Platform',
        'Dukungan Prioritas Konsultan'
      ],
      order: 2
    }
  ];

  useEffect(() => {
    async function fetchPlans() {
      try {
        const snap = await getDocs(collection(db, 'plans'));
        if (!snap.empty) {
          const list = snap.docs.map(d => d.data() as BuilderPlan).filter(p => !p.isHidden);
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setPlans(list);
        } else {
          setPlans(defaultPlans.filter(p => !p.isHidden));
        }
      } catch (err) {
        setPlans(defaultPlans.filter(p => !p.isHidden));
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  // Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const scaleUpVariants: Variants = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: 'easeOut' } 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      
      {/* Background Animated Subtle Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-amber-400/20 via-amber-200/10 to-transparent rounded-full blur-3xl pointer-events-none z-0 animate-pulse duration-1000" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Top Floating Navbar with Entrance Motion */}
      <motion.header 
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-amber-200/60 shadow-sm"
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold font-headline shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
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
              className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" /> Buat Website Gratis
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 z-10">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 font-extrabold text-xs uppercase tracking-wider mb-6 shadow-sm hover:shadow transition-shadow"
          >
            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
            Platform Landing Page Umrah #1 Untuk Mitra & Agen
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="text-3xl md:text-6xl font-headline font-extrabold text-slate-950 tracking-tight leading-tight mb-6"
          >
            Miliki Website Umrah Profesional <br className="hidden sm:block" />
            <span className="text-amber-600 underline decoration-amber-300 decoration-wavy bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 bg-clip-text text-transparent">
              Hanya Dalam 1 Menit
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-slate-700 text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-medium"
          >
            Tingkatkan kepercayaan calon jamaah! Lengkap dengan E-Katalog 2025/2026 interaktif, paket ibadah, form konsultasi WA, dan subdomain gratis atas nama Anda.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard?mode=register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm md:text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-slate-950" /> Buat Website Sekarang (Gratis)
            </Link>

            <a
              href={`https://api.whatsapp.com/send?phone=${waNumber}&text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 hover:shadow-emerald-500/50 border border-emerald-400/40 transition-all transform hover:scale-105 active:scale-95 group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-out" />
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                <MessageSquare className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Konsultasi Gratis WA</span>
                <span className="block text-xs md:text-sm font-extrabold">Tanya Konsultan Builder</span>
              </div>
            </a>
          </motion.div>

          {/* Social Proof Stats with Staggered Transition */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 pt-8 border-t border-amber-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          >
            <div className="p-3 rounded-2xl hover:bg-white/60 transition-colors">
              <p className="text-2xl md:text-3xl font-extrabold text-amber-600">1 Menit</p>
              <p className="text-xs text-slate-600 font-semibold">Proses Aktivasi Langsung</p>
            </div>
            <div className="p-3 rounded-2xl hover:bg-white/60 transition-colors">
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600">100%</p>
              <p className="text-xs text-slate-600 font-semibold">Integrasi WhatsApp Anda</p>
            </div>
            <div className="p-3 rounded-2xl hover:bg-white/60 transition-colors">
              <p className="text-2xl md:text-3xl font-extrabold text-amber-600">47 Halaman</p>
              <p className="text-xs text-slate-600 font-semibold">E-Katalog Flipbook 2025</p>
            </div>
            <div className="p-3 rounded-2xl hover:bg-white/60 transition-colors">
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600">Rp 0,-</p>
              <p className="text-xs text-slate-600 font-semibold">Paket Mulai Bebas Biaya</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Feature Showcase Grid with Scroll Reveal */}
      <section className="py-20 bg-white relative z-10 border-y border-amber-200/60 shadow-sm">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-slate-950 mb-4">
              Segala Yang Anda Butuhkan Untuk Memasarkan Umrah
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-medium">
              Didesain khusus untuk memenuhi kebutuhan agen & biro perjalanan umrah agar lebih cepat closing.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Slide In From Left + Clock Rotate */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, rotate: -1.5, scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-400/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mb-5 group-hover:rotate-180 transition-transform duration-700">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-amber-700 transition-colors">13 Seksi Komplit Siap Pakai Dalam 1 Menit</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Begitu mendaftar, sistem otomatis membuatkan 13 seksi lengkap (Banner Hero, Paket Umrah, Pembiayaan, E-Katalog 47 Hal, Rekor MURI, Galeri, Hotel, Peta, dll).
                </p>
              </Card>
            </motion.div>

            {/* Feature 2: Slide Up From Bottom + WA Pulse Bounce */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="h-full"
            >
              <Card className="h-full bg-slate-50 border-emerald-200/80 text-slate-900 rounded-3xl p-6 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-400/20 hover:bg-emerald-50/30 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-125 transition-transform duration-300 shadow-sm">
                  <MessageSquare className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-emerald-700 transition-colors">Terintegrasi Chat WhatsApp</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Semua calon jamaah yang mengisi form atau mengklik tombol konsultasi akan langsung masuk ke WhatsApp HP Anda.
                </p>
              </Card>
            </motion.div>

            {/* Feature 3: Slide In From Right + 3D Book Tilt */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, rotateY: 10, scale: 1.02 }}
              className="h-full"
              style={{ perspective: 1000 }}
            >
              <Card className="h-full bg-slate-50 border-amber-200/80 text-slate-900 rounded-3xl p-6 hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center mb-5 group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-amber-800 transition-colors">E-Katalog Flipbook 47 Halaman</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Sudah termasuk viewer buku katalog interaktif 2025/2026 yang dapat di-flip dan di-download dalam bentuk PDF.
                </p>
              </Card>
            </motion.div>

            {/* Feature 4: Scale/Zoom In + Globe Spin */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, rotate: 1.5, scale: 1.02 }}
              className="h-full"
            >
              <Card className="h-full bg-slate-50 border-teal-200/80 text-slate-900 rounded-3xl p-6 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-400/20 hover:bg-teal-50/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-teal-100 border border-teal-300 text-teal-700 flex items-center justify-center mb-5 group-hover:rotate-90 transition-transform duration-500">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-teal-800 transition-colors">Subdomain Kustom Pemilik Akun</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Dapatkan nama alamat web resmi gratis kustom Anda sendiri (contoh: <code className="text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded">umrohku-samira.my.id/namamitra</code>).
                </p>
              </Card>
            </motion.div>

            {/* Feature 5: Drop Down From Top + Layout Expand Bounce */}
            <motion.div 
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -10, scale: 1.04 }}
              className="h-full"
            >
              <Card className="h-full bg-slate-50 border-indigo-200/80 text-slate-900 rounded-3xl p-6 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-400/20 hover:bg-indigo-50/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 border border-indigo-300 text-indigo-700 flex items-center justify-center mb-5 group-hover:scale-125 group-hover:rotate-6 transition-transform duration-300">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-indigo-800 transition-colors">CMS Visual Live Editor</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Ubah judul, warna, deskripsi, foto, dan susunan seksi secara langsung di layar editor drag & drop yang sangat mudah.
                </p>
              </Card>
            </motion.div>

            {/* Feature 6: 3D Rotate Entrance + Shield Ring Glow */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -12, scale: 1.03 }}
              className="h-full"
            >
              <Card className="h-full bg-slate-50 border-emerald-200/80 text-slate-900 rounded-3xl p-6 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-125 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-950 mb-2 group-hover:text-emerald-800 transition-colors">Akses Publik 100% Bebas Hambatan</h3>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                  Website Anda dapat diakses oleh siapapun di seluruh dunia 24/7 tanpa perlu login dengan performa tinggi.
                </p>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* High-Impact Subdomain Clarification Section with Scale Entrance */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="py-16 bg-gradient-to-br from-slate-950 via-primary to-slate-900 text-white relative z-10 border-y border-amber-500/30 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Globe className="w-10 h-10 animate-pulse" />
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Seputar Subdomain Website Anda
              </div>
              
              <h3 className="text-2xl md:text-3xl font-headline font-bold text-white leading-tight">
                Apa itu Subdomain & Kenapa Sangat Praktis Bagi Agen?
              </h3>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
                <strong className="text-amber-300 underline decoration-amber-400">Subdomain</strong> adalah alamat identitas resmi website Anda (contoh: <code className="bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded-md border border-amber-400/30">umrohku-samira.my.id/namamitra</code>) yang <strong className="text-emerald-400">langsung aktif 100% secara gratis</strong> begitu mendaftar tanpa sewa domain terpisah!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <motion.div whileHover={{ scale: 1.03 }} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-amber-400/40 transition-colors">
                  <span className="text-xs font-extrabold text-amber-400 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 1. Bebas Pilih Nama
                  </span>
                  <p className="text-[11px] text-slate-300 leading-tight">Gunakan nama travel/agen Anda sendiri (misal: <code className="text-amber-300 font-mono">/salma_travel</code>).</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-emerald-400/40 transition-colors">
                  <span className="text-xs font-extrabold text-emerald-400 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 2. Langsung Aktif 24/7
                  </span>
                  <p className="text-[11px] text-slate-300 leading-tight">Bisa langsung disebar ke calon jamaah di WA, TikTok, Instagram & brosur.</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1 hover:border-amber-400/40 transition-colors">
                  <span className="text-xs font-extrabold text-amber-400 block flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> 3. Bebas Biaya Sewa
                  </span>
                  <p className="text-[11px] text-slate-300 leading-tight">Hemat biaya jutaan rupiah tanpa repot urus koding atau sewa hosting.</p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Pricing / Plan Table Section with Animated Cards */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl md:text-4xl font-headline font-extrabold text-slate-950 mb-3">
              Pilih Paket Layanan Website Anda
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Mulai gratis sekarang dan tingkatkan fitur sesuai kebutuhan bisnis travel Anda.
            </p>
          </motion.div>

          {loadingPlans ? (
            <div className="py-16 flex items-center justify-center flex-col">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Memuat paket layanan terbaru...</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className={`grid grid-cols-1 ${plans.length > 2 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-8 items-stretch`}
            >
              {plans.map((p) => {
                const isPopular = p.isPopular;
                return (
                  <motion.div 
                    key={p.planId}
                    variants={itemVariants}
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
                    className={`rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden transition-all duration-300 ${
                      isPopular 
                        ? 'bg-amber-50/90 border-2 border-amber-400 shadow-2xl ring-4 ring-amber-400/20' 
                        : 'bg-white border border-amber-200/90'
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-slate-950" /> PALING POPULER
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

                      <div className={`text-3xl font-extrabold mb-6 ${isPopular ? 'text-amber-700' : 'text-slate-950'}`}>
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
                        className={`w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl font-extrabold text-xs transition-all ${
                          isPopular 
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md active:scale-95'
                        }`}
                      >
                        {isPopular ? <Zap className="w-4 h-4 fill-slate-950" /> : null} Pilih Paket Ini <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Final Call To Action */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="py-20 bg-gradient-to-b from-amber-100/60 to-slate-50 border-t border-amber-200/80 text-center relative z-10"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-slate-950 mb-6">
            Siap Melipatgandakan Pendaftaran Umrah Anda?
          </h2>
          <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-8 font-medium">
            Daftar sekarang dalam 1 menit dan miliki website landing page umrah profesional milik Anda sendiri hari ini.
          </p>

          <Link
            href="/dashboard?mode=register"
            className="inline-flex items-center justify-center gap-2.5 h-14 px-10 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-base shadow-2xl shadow-amber-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-5 h-5 fill-slate-950" /> Buat Website Umrah Anda Sekarang
          </Link>
        </div>
      </motion.section>

      {/* Floating WhatsApp Consultant Quick Button with Hover Lift & Pulse */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <a
          href={`https://api.whatsapp.com/send?phone=${waNumber}&text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 px-5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 text-white font-extrabold text-xs shadow-2xl shadow-emerald-600/50 hover:shadow-emerald-500/80 border border-emerald-400/50 transition-all transform hover:scale-110 active:scale-95 group"
          title="Tanya Konsultan Builder via WhatsApp"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
            <MessageSquare className="w-4 h-4 text-white animate-bounce" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <span className="block text-[9px] text-emerald-100 uppercase tracking-wider font-bold">Konsultasi WA</span>
            <span className="block text-xs font-extrabold">Tanya Konsultan Builder</span>
          </div>
        </a>
      </motion.div>

      {/* Simple Footer */}
      <footer className="py-8 border-t border-slate-200 text-center text-xs text-slate-500 relative z-10 bg-white">
        <div className="container mx-auto px-4">
          <p>© 2026 SAMIRA Builder Platform. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  );
}
