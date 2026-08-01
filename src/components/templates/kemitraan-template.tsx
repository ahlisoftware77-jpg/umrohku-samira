"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Handshake, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Gift, 
  Briefcase, 
  Users, 
  TrendingUp, 
  FileText, 
  Send, 
  Building2, 
  Plane, 
  BookOpen, 
  AlertTriangle,
  ChevronRight,
  GraduationCap,
  BadgeCheck,
  Check,
  HelpCircle,
  Clock,
  Shirt,
  IdCard,
  Layers,
  PhoneCall,
  DollarSign
} from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Agent, getAgent } from '@/lib/agents';

interface KemitraanTemplateProps {
  agent?: Agent;
}

const targetAudiences = [
  { icon: <Building2 className="w-5 h-5 text-amber-400" />, title: "DKM & Pengurus Masjid", desc: "Jamaah masjid, musholla, & majelis ta'lim" },
  { icon: <GraduationCap className="w-5 h-5 text-amber-400" />, title: "Pesantren & KBIH", desc: "Pimpinan pesantren, yayasan, & KBIH" },
  { icon: <Users className="w-5 h-5 text-amber-400" />, title: "Tokoh Agama & Ustadz", desc: "Habib, kyai, ustadz, & guru mengaji" },
  { icon: <Briefcase className="w-5 h-5 text-amber-400" />, title: "Karyawan & PNS", desc: "Pegawai swasta, PNS, & pensiunan" },
  { icon: <TrendingUp className="w-5 h-5 text-amber-400" />, title: "Ibu Rumah Tangga", desc: "Praktisi online & usaha sampingan" },
  { icon: <BadgeCheck className="w-5 h-5 text-amber-400" />, title: "Tenaga Kesehatan", desc: "Dokter, perawat, bidan, & apoteker" },
  { icon: <Handshake className="w-5 h-5 text-amber-400" />, title: "Marketer & Konsultan", desc: "Konsultan muslim & praktisi digital" },
  { icon: <Sparkles className="w-5 h-5 text-amber-400" />, title: "Seluruh Umat Muslim", desc: "Masyarakat muslim Indonesia & dunia" },
];

const benefitsList = [
  { title: "Registrasi SISKOPATUH Resmi", desc: "Jamaah Anda terdaftar resmi di sistem SISKOPATUH Kementerian Agama RI." },
  { title: "Paket Custom By Request", desc: "Dapat dibuatkan paket umrah sesuai budget & kebutuhan kelompok jamaah Anda." },
  { title: "Surat Legalitas Hak Usaha", desc: "Mendapatkan Surat Perjanjian Kerjasama Perwakilan/Mitra Cabang Samira Resmi." },
  { title: "Peluang Umrah GRATIS", desc: "Bawa 33 jamaah sekaligus di tanggal sama = FREE 1 pax Umrah sebagai Tour Leader + Komisi Utuh!" },
  { title: "Komisi / Ujrah Tinggi", desc: "Komisi menarik dibayarkan langsung saat jamaah melakukan booking seat." },
  { title: "Kepastian Terbang 100%", desc: "Tanggal keberangkatan & seat pesawat (Saudi Airlines, Lion Air, dll) sudah ter-booking di awal." },
  { title: "Marketing Kit Lengkap", desc: "Dapatkan Baju Seragam Mitra, Spanduk, Brosur 1 Rim, ID Card, & Kartu Nama." },
  { title: "Bimbingan & Training Pro", desc: "Pelatihan Product Knowledge, Service Excellence, serta Strategi Pemasaran Online & Offline." },
];

const kemitraanAirlines = [
  { name: 'Saudia Airlines', logo: '/images/MASKAPAI/saudia3.png', fallback: '/images/MASKAPAI/saudia1.jpg', tag: 'Direct Saudi Arabia', desc: 'Jakarta / Medan ➔ Jeddah & Madinah' },
  { name: 'Garuda Indonesia', logo: '/images/MASKAPAI/LOGO GARUDA.png', tag: 'Bintang 5 Flag Carrier', desc: 'CGK / SUB / UPG ➔ Jeddah & Madinah' },
  { name: 'Batik Air', logo: '/images/MASKAPAI/batikair.jpg', tag: 'Premium Full Service', desc: 'Direct Flight Umrah Indonesia' },
  { name: 'Lion Air Umrah', logo: '/images/MASKAPAI/Lion_Air-Logo.wine.png', tag: 'Airbus A330-900NEO', desc: 'Direct dari 12+ Bandara Daerah' },
  { name: 'Turkish Airlines', logo: '/images/MASKAPAI/turki-air.jpg', tag: 'Best Europe Carrier', desc: 'Jakarta ➔ Istanbul ➔ Jeddah' },
  { name: 'Saudia Express', logo: '/images/MASKAPAI/saudia1.jpg', tag: 'Royal Middle East', desc: 'Musholla In-Flight & Halal Food' },
];

const tickerItems = [
  '🇸🇦 Saudia Airlines Direct Flight',
  '🇮🇩 Garuda Indonesia Bintang 5',
  '🦚 Batik Air Premium Full Service',
  '🦁 Lion Air Airbus A330-900NEO',
  '🇹🇷 Turkish Airlines Umrah Plus',
  '🕋 100% Kepastian Seat Terbooking Diawal',
  '📦 Bagasi 30kg + Air Zamzam 5 Liter Gratis'
];

export default function KemitraanTemplate({ agent: providedAgent }: KemitraanTemplateProps) {
  const agent = providedAgent || getAgent('default');
  const rawPhone = agent?.whatsapp || agent?.phone || '6283815862300';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';

  const waRegisterUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Assalamu'alaikum,%20saya%20tertarik%20mendaftar%20jadi%20Mitra%20Travelpreneur%20Samira%20Travel.%20Mohon%20bantuan%20persyaratannya.`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      <Header agent={agent} />

      <main className="flex-grow pt-24 md:pt-32 pb-20">
        
        {/* 1. Hero Section: Program Kemitraan Travelpreneur */}
        <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#061426] via-primary to-[#061426]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-6 shadow-lg border border-amber-300"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" /> PROGRAM KEMITRAAN TRAVELPRENEUR SAMIRA 2025/2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-headline font-black text-white leading-tight mb-6 tracking-tight drop-shadow-md max-w-4xl mx-auto"
            >
              Raih Kesuksesan & Keberkahan Bersama <span className="text-amber-400 underline decoration-amber-400/40">Samira Travel</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-200 text-sm sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 font-medium"
            >
              Peluang Bisnis Travel Umrah Syariah tanpa beban, <strong>No MLM & No Money Games</strong>. Dapatkan kesempatan <strong>UMROH GRATIS</strong> serta potensi komisi berlimpah dengan bimbingan lengkap dari Samira Travel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-amber-500/25 hover:scale-105 border border-amber-300 transition-all">
                <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Handshake className="w-5 h-5" /> DAFTAR KEMITRAAN SEKARANG <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-white/30 text-white hover:bg-white/10 font-black text-sm sm:text-base backdrop-blur-md">
                <a href="#syarat">Lihat Syarat & Ketentuan</a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* 2. Interactive Reflection Questions Box */}
        <section className="py-12 md:py-16 bg-[#07172c] relative">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="bg-gradient-to-br from-[#0f2847] via-[#0b1c33] to-[#071324] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-white">
              <h2 className="text-xl sm:text-2xl font-headline font-black text-amber-300 mb-6 text-center flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-400 shrink-0" />
                Jawablah 3 Pertanyaan Ini Secara Jujur:
              </h2>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-sm sm:text-base text-white">1. Apakah Anda ingin pergi Umrah secara GRATIS?</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-sm sm:text-base text-white">2. Apakah Anda ingin memiliki Bisnis Travel Umrah sendiri?</span>
                </div>
                <div className="flex items-center gap-3 bg-slate-950/70 p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <span className="font-extrabold text-sm sm:text-base text-white">3. Apakah Anda ingin mendapat penghasilan tambahan yang halal & berkah?</span>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-5 rounded-2xl text-slate-950 text-center shadow-lg">
                <p className="font-black text-sm sm:text-lg leading-snug">
                  Jika jawaban Anda <span className="underline uppercase font-black">"YA"</span>, maka memilih menjadi Mitra Samira Travel adalah keputusan terbaik untuk mewujudkan impian Anda! 🤲
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. Legalitas & Keunggulan Program Kemitraan */}
        <section className="py-16 md:py-24 bg-slate-900">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            {/* Legalities Card Banner */}
            <div className="bg-slate-950 border-2 border-emerald-500/40 p-6 sm:p-8 rounded-3xl mb-16 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 inline-block">
                    Izin Resmi Kemenag RI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-headline font-black text-white">PT. SAMIRA ALI WISATA</h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    PPIU No. <strong className="text-emerald-400">16092100475620005</strong> · PIHK No. <strong className="text-amber-400">160922100475620002</strong>
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right shrink-0">
                <span className="text-xs text-slate-400 block mb-1">Keamanan & Keberkahan Terjamin</span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                  No MLM · No Money Game (Pure Syariah)
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-amber-400 font-black uppercase tracking-widest text-xs mb-2">Fasilitas & Keuntungan</p>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-white leading-tight">
                8 Keunggulan Utama Kemitraan Samira Travel
              </h2>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefitsList.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-white/10 hover:border-amber-400/50 transition-all hover:-translate-y-1 shadow-lg">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-black text-sm mb-4 border border-amber-400/20">
                    0{idx + 1}
                  </div>
                  <h3 className="font-headline font-extrabold text-base text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 3.3. Skema Ujrah & Komisi Kemitraan (public/images/ujroh.jpeg) */}
        <section id="ujrah" className="py-16 md:py-24 bg-gradient-to-b from-slate-900 via-[#07192e] to-[#05101d] text-white relative">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            {/* Header Title */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3 shadow-lg">
                <DollarSign className="w-4 h-4 fill-slate-950" /> POTENSI PENGHASILAN BERKAH & TRANSPARAN
              </div>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-white leading-tight mb-3">
                Skema Ujrah & Komisi Langsung Kemitraan Samira
              </h2>
              <p className="text-xs sm:text-base text-slate-300 font-medium max-w-2xl mx-auto">
                Sistem akad ujrah syariah yang adil, jujur, dan langsung cair untuk setiap jamaah yang Anda daftarkan tanpa potongan tersembunyi.
              </p>
            </div>

            {/* Main Showcase Card Grid */}
            <div className="bg-gradient-to-br from-[#0c223d] via-[#091b30] to-[#061222] rounded-3xl border-2 border-amber-400/40 p-6 sm:p-10 shadow-2xl overflow-hidden mb-12">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                
                {/* Image Left Column */}
                <div className="lg:col-span-6 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 shadow-2xl group bg-slate-950">
                    <img 
                      src="/images/ujroh.jpeg" 
                      alt="Tabel Skema Ujrah Komisi Samira Travel" 
                      className="w-full h-auto object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                      📜 Tabel Resmi Ujrah Samira Travel
                    </div>
                  </div>
                  <p className="text-[11px] text-center text-slate-400 italic">
                    *Gambar skema ujrah komisi resmi Samira Travel (Klik/Perbesar untuk detail).
                  </p>
                </div>

                {/* Content Right Column */}
                <div className="lg:col-span-6 space-y-5">
                  <div className="inline-block bg-amber-400/10 text-amber-300 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-400/30">
                    ✨ Keuntungan Komisi Kemitraan Syariah
                  </div>

                  <h3 className="text-xl sm:text-2xl font-headline font-black text-white leading-snug">
                    Ujrah Komisi Langsung & Hadiah Umrah GRATIS Tour Leader
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                    Di Samira Travel, setiap ikhtiar Anda mensyiarkan umrah akan mendapatkan apresiasi ujrah terbaik yang langsung ditransfer saat jamaah melakukan booking seat.
                  </p>

                  <div className="space-y-3">
                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white text-xs sm:text-sm block font-extrabold">Ujrah Langsung Per Jamaah</strong>
                        <span className="text-[11px] sm:text-xs text-slate-300">Komisi menarik langsung cair untuk setiap 1 jamaah yang mendaftar melalui Anda.</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-400/40 flex items-start gap-3">
                      <Gift className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-amber-300 text-xs sm:text-sm block font-extrabold">Bonus FREE 1 Pax Umrah Tour Leader</strong>
                        <span className="text-[11px] sm:text-xs text-slate-300">Bawa 33 jamaah sekaligus di tanggal yang sama = Berangkat Umrah GRATIS sebagai Tour Leader + Ujrah komisi tetap utuh!</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-white/10 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white text-xs sm:text-sm block font-extrabold">Murni Akad Syariah (No MLM)</strong>
                        <span className="text-[11px] sm:text-xs text-slate-300">Tanpa potongan berbelit, tanpa skema piramida, 100% transparan & berkah.</span>
                      </div>
                    </div>
                  </div>

                  <Button asChild size="lg" className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-sm shadow-xl hover:scale-102 transition-all">
                    <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                      <PhoneCall className="w-4 h-4" /> KONSULTASI SKEMA UJRAH VIA WA <ChevronRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

              </div>
            </div>

            {/* Commission Simulation Table Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 text-center">
                <span className="text-xs text-slate-400 block mb-1">Pencapaian 1 Jamaah</span>
                <strong className="text-lg font-black text-emerald-400 block mb-1">Ujrah Langsung Cair</strong>
                <span className="text-[11px] text-slate-400">Komisi pertama Anda langsung ditransfer saat jamaah DP.</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 text-center">
                <span className="text-xs text-slate-400 block mb-1">Pencapaian 5 Jamaah</span>
                <strong className="text-lg font-black text-amber-300 block mb-1">Jutaan Rupiah</strong>
                <span className="text-[11px] text-slate-400">Penghasilan tambahan berkah untuk keluarga dari rumah.</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-white/10 text-center">
                <span className="text-xs text-slate-400 block mb-1">Pencapaian 10 Jamaah</span>
                <strong className="text-lg font-black text-amber-400 block mb-1">Puluhan Juta Rupiah</strong>
                <span className="text-[11px] text-slate-400">Hasil nyata dari konsistensi mensyiarkan baitullah.</span>
              </div>

              <div className="bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 p-5 rounded-2xl text-center shadow-lg border border-amber-300">
                <span className="text-xs text-slate-900 font-extrabold block mb-1">Pencapaian 33 Jamaah</span>
                <strong className="text-lg font-black text-slate-950 block mb-1">UMRAH GRATIS + FULL UJRAH</strong>
                <span className="text-[11px] text-slate-900 font-bold">Terbang sebagai Tour Leader & komisi utuh!</span>
              </div>
            </div>

            {/* Special Promo Bonus Kurma Banner */}
            <div className="mt-12 bg-gradient-to-br from-[#0c223d] via-[#091b30] to-[#061222] border-2 border-amber-400/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center max-w-3xl mx-auto mb-6">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-2 shadow-md">
                  🎁 BONUS PROMO KURMA SPESIAL MITRA & JAMAAH
                </span>
                <h3 className="text-xl sm:text-2xl font-headline font-black text-white">
                  Bonus Hadiah Kurma Pilihan Setiap Pembelian / Pendaftaran
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/30 text-center flex flex-col items-center">
                  <span className="text-amber-400 font-black text-xs uppercase mb-1">🌴 5 Majol</span>
                  <strong className="text-white text-sm font-extrabold mb-1">Beli 5 Box Majol</strong>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE 1 SAFARA
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/30 text-center flex flex-col items-center">
                  <span className="text-amber-400 font-black text-xs uppercase mb-1">🌴 7 Sukari</span>
                  <strong className="text-white text-sm font-extrabold mb-1">Beli 7 Box Sukari</strong>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE 1 SAFARA
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/30 text-center flex flex-col items-center">
                  <span className="text-amber-400 font-black text-xs uppercase mb-1">🌴 10 Safawi</span>
                  <strong className="text-white text-sm font-extrabold mb-1">Beli 10 Box Safawi</strong>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    FREE 1 SAFAWI
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 3.5. Running Text Maskapai Partner Section */}
        <section className="py-14 md:py-20 bg-gradient-to-r from-[#05101d] via-[#091f3a] to-[#05101d] border-y border-amber-400/30 overflow-hidden relative">
          <style jsx>{`
            @keyframes marqueeLeft {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            @keyframes marqueeRight {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0%); }
            }
            .animate-marquee-left {
              display: flex;
              width: max-content;
              animation: marqueeLeft 28s linear infinite;
            }
            .animate-marquee-right {
              display: flex;
              width: max-content;
              animation: marqueeRight 32s linear infinite;
            }
            .animate-marquee-left:hover, .animate-marquee-right:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="container mx-auto px-4 md:px-6 max-w-6xl text-center mb-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3 shadow-lg border border-amber-300">
              <Plane className="w-4 h-4 fill-slate-950 text-slate-950" /> MITRA MASKAPAI PENERBANGAN RESMI
            </div>
            <h2 className="text-2xl sm:text-4xl font-headline font-black text-white leading-tight mb-2">
              Kerjasama Resmi Maskapai Bintang 5 Dunia
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto font-medium">
              Seluruh penerbangan jamaah kemitraan Samira Travel menggunakan armada penerbangan langsung (direct flight) terbaik & terpercaya.
            </p>
          </div>

          {/* Running Text Banner Ticker Top */}
          <div className="bg-amber-400 text-slate-950 py-2.5 font-black text-xs uppercase tracking-widest overflow-hidden mb-6 border-y border-amber-300 shadow-md">
            <div className="animate-marquee-left flex items-center gap-8 whitespace-nowrap">
              {[...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-3">
                  <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold">SAMIRA PARTNER</span>
                  <span>{item}</span>
                  <span className="text-slate-900 font-extrabold">•</span>
                </span>
              ))}
            </div>
          </div>

          {/* Running Logo Cards Marquee Row 1 */}
          <div className="relative w-full overflow-hidden py-3">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#05101d] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#05101d] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-left flex items-center gap-4 sm:gap-6">
              {[...kemitraanAirlines, ...kemitraanAirlines].map((air, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-300 shadow-xl flex items-center gap-4 min-w-[280px] sm:min-w-[320px] max-w-[340px] hover:scale-105 transition-transform cursor-pointer shrink-0"
                >
                  <div className="w-20 sm:w-24 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 border border-slate-200 shrink-0">
                    <img 
                      src={air.logo} 
                      alt={air.name} 
                      className="max-h-10 w-auto object-contain"
                      onError={(e) => {
                        if (air.fallback) {
                          (e.target as HTMLImageElement).src = air.fallback;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      {air.tag}
                    </span>
                    <strong className="text-slate-950 font-extrabold text-sm block truncate">{air.name}</strong>
                    <span className="text-[11px] text-slate-600 font-medium block truncate">{air.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Running Logo Cards Marquee Row 2 (Reverse Direction) */}
          <div className="relative w-full overflow-hidden py-3 mt-2">
            <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-[#05101d] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-[#05101d] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-right flex items-center gap-4 sm:gap-6">
              {[...kemitraanAirlines.slice().reverse(), ...kemitraanAirlines.slice().reverse()].map((air, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950/90 p-4 sm:p-5 rounded-2xl border-2 border-amber-400/40 shadow-xl flex items-center gap-4 min-w-[280px] sm:min-w-[320px] max-w-[340px] hover:border-amber-400 hover:scale-105 transition-all cursor-pointer shrink-0"
                >
                  <div className="w-20 sm:w-24 h-12 bg-white rounded-xl flex items-center justify-center p-1.5 border border-amber-300 shrink-0">
                    <img 
                      src={air.logo} 
                      alt={air.name} 
                      className="max-h-10 w-auto object-contain"
                      onError={(e) => {
                        if (air.fallback) {
                          (e.target as HTMLImageElement).src = air.fallback;
                        }
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30 inline-block mb-1">
                      {air.tag}
                    </span>
                    <strong className="text-white font-extrabold text-sm block truncate">{air.name}</strong>
                    <span className="text-[11px] text-slate-300 font-medium block truncate">{air.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Syarat & Perlengkapan Kemitraan */}
        <section id="syarat" className="py-16 md:py-24 bg-[#07172c] relative">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Requirements Left Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4 fill-slate-950" /> Persyaratan Kemitraan
                </div>

                <h2 className="text-2xl sm:text-4xl font-headline font-black text-white leading-tight">
                  Syarat Mudah Jadi Mitra (Berlaku Seluruh Indonesia)
                </h2>

                <p className="text-slate-200 text-xs sm:text-base leading-relaxed font-medium">
                  Siapa saja dan di mana saja Anda berada, proses pendaftaran Mitra Samira Travel sangat praktis dan bisa dilakukan secara online dari rumah:
                </p>

                <div className="space-y-3">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block font-extrabold">1. Identitas Diri (KTP)</strong>
                      <span className="text-xs text-slate-300">Fotokopi / Foto KTP asli yang difoto jelas lalu dikirim via WhatsApp.</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-white/10 flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white text-sm block font-extrabold">2. Pasfoto Berwarna</strong>
                      <span className="text-xs text-slate-300">Pasfoto terbaru ukuran 4×6 (1 lembar).</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-amber-400/40 flex items-start gap-3">
                    <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 text-sm block font-extrabold">3. Biaya Pendaftaran Kemitraan: Rp 1.550.000,-</strong>
                      <span className="text-xs text-slate-300">Dibayarkan langsung ke Kasir Samira atau transfer ke Rekening Resmi Perusahaan <strong>a/n PT Samira Ali Wisata</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* Financial Safety Warning */}
                <div className="bg-red-950/60 border-2 border-red-500/40 p-4 sm:p-5 rounded-2xl flex items-start gap-3 text-red-200 text-xs leading-relaxed">
                  <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-300 font-extrabold block text-sm mb-1">PERINGATAN KEAMANAN TRANSAKSI:</strong>
                    Kami tidak bertanggung jawab apabila transaksi keuangan dilakukan di luar rekening resmi perusahaan. Pembayaran sah hanya jika masuk ke rekening <strong>PT. SAMIRA ALI WISATA</strong>.
                  </div>
                </div>
              </div>

              {/* Marketing Kit Right Card */}
              <div className="lg:col-span-5 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-6 sm:p-8 rounded-3xl text-slate-950 shadow-2xl border-4 border-white">
                <div className="w-12 h-12 bg-slate-950 text-amber-400 rounded-2xl flex items-center justify-center mb-4">
                  <Shirt className="w-6 h-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-headline font-black mb-2 text-slate-950">
                  Perlengkapan & Tool Kit Kemitraan
                </h3>

                <p className="text-xs sm:text-sm text-slate-900 mb-6 font-bold leading-relaxed">
                  Setiap Mitra yang terdaftar akan menerima Starter Kit usaha resmi untuk menunjang kegiatan promosi & branding:
                </p>

                <ul className="space-y-3 text-xs sm:text-sm font-extrabold text-slate-950 mb-8">
                  <li className="flex items-center gap-2 bg-slate-950/10 p-2.5 rounded-xl border border-slate-950/10">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" /> Baju Seragam Mitra Samira Resmi
                  </li>
                  <li className="flex items-center gap-2 bg-slate-950/10 p-2.5 rounded-xl border border-slate-950/10">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" /> Spanduk Promosi Perwakilan / Mitra
                  </li>
                  <li className="flex items-center gap-2 bg-slate-950/10 p-2.5 rounded-xl border border-slate-950/10">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" /> Brosur Cetak Terbaru (1 Rim / 500 Lembar)
                  </li>
                  <li className="flex items-center gap-2 bg-slate-950/10 p-2.5 rounded-xl border border-slate-950/10">
                    <CheckCircle2 className="w-4 h-4 text-slate-950" /> ID Card Resmi & Kartu Nama Mitra
                  </li>
                </ul>

                <Button asChild size="lg" className="w-full h-14 rounded-2xl bg-slate-950 text-white hover:bg-white hover:text-slate-950 font-black text-sm shadow-xl transition-all border border-amber-300">
                  <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    <PhoneCall className="w-4 h-4" /> KONSULTASI PENDAFTARAN MITRA
                  </a>
                </Button>
              </div>

            </div>
          </div>
        </section>

        {/* 5. Target Audience (Peluang Usaha Cocok Untuk Siapa?) */}
        <section className="py-16 md:py-24 bg-slate-900">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-amber-400 font-black uppercase tracking-widest text-xs mb-2">Terbuka Untuk Umum</p>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-white leading-tight">
                Peluang Kemitraan Ini Sangat Cocok Untuk:
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {targetAudiences.map((item, idx) => (
                <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-white/10 flex items-start gap-3.5 hover:border-amber-400/40 transition-colors">
                  <div className="p-3 bg-amber-400/10 rounded-xl border border-amber-400/20 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-extrabold text-sm text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. High Impact Final Registration CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-[#061426] via-primary to-[#061426] text-white text-center relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
            <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 shadow-md">
              ⚡ PENDAFTARAN BISA DILAKUKAN SECARA ONLINE 24/7
            </span>

            <h2 className="text-3xl sm:text-5xl font-headline font-black text-white leading-tight mb-4 drop-shadow-md">
              Siap Menjadi Travelpreneur & Meraih Umrah Gratis?
            </h2>

            <p className="text-slate-200 text-sm sm:text-lg mb-8 max-w-2xl mx-auto font-medium">
              Jangan lewatkan peluang bisnis syariah penuh keberkahan ini. Hubungi Konsultan Samira Travel sekarang dan kami siap membantu seluruh prosesnya!
            </p>

            <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black text-base sm:text-lg shadow-2xl hover:scale-105 transition-all border border-amber-300">
              <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" /> DAFTAR KEMITRAAN VIA WA NOW <ChevronRight className="w-5 h-5" />
              </a>
            </Button>
          </div>
        </section>

      </main>

      <Footer agent={agent} />
    </div>
  );
}
