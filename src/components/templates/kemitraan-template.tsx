"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  PhoneCall,
  DollarSign,
  Calculator,
  ChevronDown,
  Maximize2,
  Minimize2,
  Sparkle
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
  { icon: <Building2 className="w-5 h-5 text-amber-600" />, title: "DKM & Pengurus Masjid", desc: "Jamaah masjid, musholla, & majelis ta'lim" },
  { icon: <GraduationCap className="w-5 h-5 text-amber-600" />, title: "Pesantren & KBIH", desc: "Pimpinan pesantren, yayasan, & KBIH" },
  { icon: <Users className="w-5 h-5 text-amber-600" />, title: "Tokoh Agama & Ustadz", desc: "Habib, kyai, ustadz, & guru mengaji" },
  { icon: <Briefcase className="w-5 h-5 text-amber-600" />, title: "Karyawan & PNS", desc: "Pegawai swasta, PNS, & pensiunan" },
  { icon: <TrendingUp className="w-5 h-5 text-amber-600" />, title: "Ibu Rumah Tangga", desc: "Praktisi online & usaha sampingan" },
  { icon: <BadgeCheck className="w-5 h-5 text-amber-600" />, title: "Tenaga Kesehatan", desc: "Dokter, perawat, bidan, & apoteker" },
  { icon: <Handshake className="w-5 h-5 text-amber-600" />, title: "Marketer & Konsultan", desc: "Konsultan muslim & praktisi digital" },
  { icon: <Sparkles className="w-5 h-5 text-amber-600" />, title: "Seluruh Umat Muslim", desc: "Masyarakat muslim Indonesia & dunia" },
];

const benefitsList = [
  { title: "Registrasi SISKOPATUH Resmi", desc: "Jamaah Anda terdaftar resmi di sistem SISKOPATUH Kementerian Agama RI." },
  { title: "Paket Custom By Request", desc: "Dapat dibuatkan paket umrah sesuai budget & kebutuhan kelompok jamaah Anda." },
  { title: "Surat Legalitas Hak Usaha", desc: "Mendapatkan Surat Perjanjian Kerjasama Perwakilan/Mitra Cabang Samira Resmi." },
  { title: "Peluang Umrah GRATIS", desc: "Bawa 33 jamaah sekaligus di tanggal sama = FREE 1 Orang Umrah Tour Leader + Ujrah Utuh!" },
  { title: "Komisi / Ujrah Tinggi", desc: "Komisi menarik dibayarkan langsung saat jamaah melakukan booking seat." },
  { title: "Kepastian Terbang 100%", desc: "Tanggal keberangkatan & seat pesawat (Saudi Airlines, Lion Air, dll) sudah ter-booking di awal." },
  { title: "Marketing Kit Lengkap", desc: "Dapatkan Baju Seragam Mitra, Spanduk, Brosur 1 Rim, ID Card, & Kartu Nama." },
  { title: "Bimbingan & Training Pro", desc: "Pelatihan Product Knowledge, Service Excellence, serta Pemasaran Online & Offline." },
];

const kemitraanAirlines = [
  { name: 'Saudia Airlines', logo: '/images/MASKAPAI/saudia3.png', fallback: '/images/MASKAPAI/saudia1.jpg', tag: 'Direct Flight Saudi Arabia', desc: 'Jakarta / Medan ➔ Jeddah & Madinah' },
  { name: 'Garuda Indonesia', logo: '/images/MASKAPAI/LOGO GARUDA.png', tag: 'Bintang 5 Flag Carrier', desc: 'CGK / SUB / UPG ➔ Jeddah & Madinah' },
  { name: 'Batik Air', logo: '/images/MASKAPAI/batikair.jpg', tag: 'Premium Full Service', desc: 'Direct Flight Umrah Indonesia' },
  { name: 'Lion Air Umrah', logo: '/images/MASKAPAI/Lion_Air-Logo.wine.png', tag: 'Airbus A330-900NEO Wide Body', desc: 'Direct dari 12+ Bandara Daerah' },
  { name: 'Turkish Airlines', logo: '/images/MASKAPAI/turki-air.jpg', tag: 'Best Europe Carrier (Plus Turki)', desc: 'Jakarta ➔ Istanbul ➔ Jeddah' },
  { name: 'Saudia Royal', logo: '/images/MASKAPAI/saudia1.jpg', tag: 'Royal Middle East', desc: 'Musholla In-Flight & Halal Food' },
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

const faqs = [
  {
    q: "Apakah pendaftaran mitra bisa dilakukan dari luar kota / luar Jawa?",
    a: "Sangat bisa! Pendaftaran mitra Samira Travel berlaku untuk seluruh wilayah Indonesia & luar negeri. Seluruh proses pendaftaran dan pengiriman Starter Kit dapat dilakukan secara online."
  },
  {
    q: "Apakah ada target bulanan atau sanksi jika tidak dapat jamaah?",
    a: "Tidak ada target bulanan minimal! Kemitraan Samira Travel dirancang tanpa tekanan. Anda dapat mengembangkannya secara fleksibel sesuai waktu luang Anda."
  },
  {
    q: "Kapan komisi / ujrah mitra dibayarkan?",
    a: "Ujrah komisi langsung dicairkan saat jamaah yang Anda daftarkan melakukan pembayaran DP/booking seat resmi ke rekening perusahaan."
  },
  {
    q: "Bagaimana cara mendapatkan bonus Umrah GRATIS (Tour Leader)?",
    a: "Jika Anda berhasil mendaftarkan 33 jamaah sekaligus pada tanggal keberangkatan yang sama, Anda berhak mendapatkan 1 tiket/pax Umrah GRATIS sebagai Tour Leader, dan komisi ujrah 33 jamaah tetap cair utuh!"
  }
];

export default function KemitraanTemplate({ agent: providedAgent }: KemitraanTemplateProps) {
  const agent = providedAgent || getAgent('default');
  const rawPhone = agent?.whatsapp || agent?.phone || '6283815862300';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';

  const waRegisterUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Assalamu'alaikum,%20saya%20tertarik%20mendaftar%20jadi%20Mitra%20Travelpreneur%20Samira%20Travel.%20Mohon%20bantuan%20persyaratannya.`;

  // Interactive Calculator State
  const [jamaahCount, setJamaahCount] = useState<number>(5);
  const [activeTab, setActiveTab] = useState<'syarat' | 'kit' | 'keamanan'>('syarat');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [isZoomImage, setIsZoomImage] = useState<boolean>(false);
  const [isZoomPerlengkapan, setIsZoomPerlengkapan] = useState<boolean>(false);

  // Interactive Answers State
  const [answers, setAnswers] = useState<Record<number, boolean>>({ 1: true, 2: true, 3: true });

  // Calculate Rewards dynamically based on jamaahCount
  const getRewardInfo = (count: number) => {
    let bonusText = "Ujrah Komisi Per Jamaah Direct";
    let extraBonus = "Fasilitas & Pendampingan Full Admin";

    if (count >= 33) {
      bonusText = "🎉 GRATIS 1 ORANG TIKET UMRAH (Tour Leader) + FULL UJRAH UTUH!";
      extraBonus = "Fasilitas VIP Tour Leader + Sertifikat Pendamping Resmi";
    } else if (count >= 10) {
      bonusText = "🎁 BONUS GRATIS 1 ORANG PAKET SAFAWI!";
      extraBonus = "Komisi Puluhan Juta Rupiah + Spanduk Rombongan Khusus";
    } else if (count >= 7) {
      bonusText = "🎁 BONUS GRATIS 1 ORANG PAKET SAFARA!";
      extraBonus = "Bonus Reward Keberangkatan Rombongan Sukari";
    } else if (count >= 5) {
      bonusText = "🎁 BONUS GRATIS 1 ORANG PAKET SAFARA!";
      extraBonus = "Bonus Reward Keberangkatan Rombongan Majol";
    }

    return { bonusText, extraBonus };
  };

  const currentReward = getRewardInfo(jamaahCount);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      <Header agent={agent} />

      <main className="flex-grow pt-24 md:pt-32 pb-20">
        
        {/* LAYER 1: Hero Section (Light Luxury Theme with Staggered Entrance) */}
        <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-[#f8fafc] via-[#fffdf5] to-[#f1f5f9] border-b border-amber-200/60">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-6 shadow-md border border-amber-300"
            >
              <Sparkles className="w-4 h-4 fill-slate-950 animate-pulse" /> PROGRAM KEMITRAAN TRAVELPRENEUR SAMIRA 2025/2026
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-3xl sm:text-5xl md:text-6xl font-headline font-black text-slate-900 leading-tight mb-6 tracking-tight drop-shadow-xs max-w-4xl mx-auto"
            >
              Raih Kesuksesan & Keberkahan Bersama <span className="text-amber-600 underline decoration-amber-400/60">Samira Travel</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-slate-600 text-sm sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 font-medium"
            >
              Peluang Bisnis Travel Umrah Syariah tanpa beban, <strong>No MLM & No Money Game</strong>. Dapatkan kesempatan <strong>UMROH GRATIS</strong> serta potensi komisi berlimpah dengan bimbingan resmi dari Samira Travel.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 hover:scale-105 border border-amber-300 transition-all">
                <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Handshake className="w-5 h-5" /> DAFTAR KEMITRAAN SEKARANG <ChevronRight className="w-4 h-4" />
                </a>
              </Button>

              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl border-slate-300 bg-white text-slate-800 hover:bg-slate-100 font-black text-sm sm:text-base shadow-sm">
                <a href="#kalkulator">
                  <Calculator className="w-4 h-4 text-amber-600 mr-2" /> Hitung Simulasi Komisi
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* LAYER 2: Interactive Reflection Questions Layer */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-12 md:py-16 bg-white relative border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <Card className="bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border-2 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-xl text-slate-900">
              <h2 className="text-xl sm:text-2xl font-headline font-black text-slate-900 mb-6 text-center flex items-center justify-center gap-2">
                <HelpCircle className="w-6 h-6 text-amber-600 shrink-0" />
                Jawablah 3 Pertanyaan Ini Secara Jujur:
              </h2>

              <div className="space-y-4 mb-8">
                {[
                  { id: 1, text: "Apakah Anda ingin pergi Umrah secara GRATIS?" },
                  { id: 2, text: "Apakah Anda ingin memiliki Bisnis Travel Umrah Syariah sendiri?" },
                  { id: 3, text: "Apakah Anda ingin mendapat penghasilan tambahan yang halal & berkah?" },
                ].map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={() => setAnswers(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm ${
                      answers[item.id] 
                        ? 'bg-emerald-50/80 border-emerald-500/80 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className={`w-6 h-6 shrink-0 transition-colors ${answers[item.id] ? 'text-emerald-600' : 'text-slate-300'}`} />
                      <span className="font-extrabold text-sm sm:text-base">{item.id}. {item.text}</span>
                    </div>
                    <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider transition-colors ${answers[item.id] ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {answers[item.id] ? 'YA (PASTI)' : 'TIDAK'}
                    </span>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-5 rounded-2xl text-slate-950 text-center shadow-md"
              >
                <p className="font-black text-sm sm:text-lg leading-snug">
                  Jika jawaban Anda <span className="underline uppercase font-black text-slate-950">"YA"</span>, maka memilih menjadi Mitra Samira Travel adalah keputusan terbaik untuk masa depan Anda! 🤲
                </p>
              </motion.div>
            </Card>
          </div>
        </motion.section>

        {/* LAYER 3: Legalitas & 8 Keunggulan Layer */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-white border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            {/* Legalities Banner */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-slate-50 border-2 border-emerald-500/40 p-6 sm:p-8 rounded-3xl mb-16 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 inline-block">
                    Izin Resmi Kemenag RI
                  </span>
                  <h3 className="text-xl sm:text-2xl font-headline font-black text-slate-900">PT. SAMIRA ALI WISATA</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    PPIU No. <strong className="text-emerald-700">16092100475620005</strong> · PIHK No. <strong className="text-amber-700">160922100475620002</strong>
                  </p>
                </div>
              </div>

              <div className="text-center md:text-right shrink-0">
                <span className="text-xs text-slate-500 block mb-1">Keamanan & Keberkahan Terjamin</span>
                <span className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300">
                  No MLM · No Money Game (Pure Syariah)
                </span>
              </div>
            </motion.div>

            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-amber-600 font-black uppercase tracking-widest text-xs mb-2">Fasilitas & Keuntungan</p>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight">
                8 Keunggulan Utama Kemitraan Samira Travel
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefitsList.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-900 font-black text-sm mb-4 flex items-center justify-center border border-amber-300">
                    0{idx + 1}
                  </div>
                  <h3 className="font-headline font-extrabold text-base text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>

          </div>
        </motion.section>

        {/* LAYER 4: Interactive Ujrah & Bonus Calculator Layer */}
        <motion.section 
          id="kalkulator" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-slate-50 relative border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs uppercase tracking-widest mb-3 border border-emerald-300">
                <Calculator className="w-4 h-4 text-emerald-700 animate-bounce" /> KALKULATOR REWARD & KOMISI INTERAKTIF
              </div>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight mb-2">
                Simulasi Keuntungan & Reward Keberangkatan
              </h2>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                Geser jumlah jamaah di bawah ini untuk melihat potensi bonus & reward gratis keberangkatan yang Anda dapatkan:
              </p>
            </div>

            <Card className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-2xl">
              
              {/* Slider Input */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">Jumlah Jamaah Yang Didaftarkan:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setJamaahCount(Math.max(1, jamaahCount - 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 font-black text-lg text-slate-800 hover:bg-amber-400 transition-colors active:scale-95"
                    >
                      -
                    </button>
                    <span className="text-2xl sm:text-4xl font-headline font-black text-amber-600 bg-amber-50 px-5 py-1 rounded-2xl border border-amber-300 min-w-[90px] text-center shadow-inner">
                      {jamaahCount} <span className="text-xs text-slate-600 font-bold">Jamaah</span>
                    </span>
                    <button
                      onClick={() => setJamaahCount(Math.min(50, jamaahCount + 1))}
                      className="w-9 h-9 rounded-xl bg-slate-100 font-black text-lg text-slate-800 hover:bg-amber-400 transition-colors active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={jamaahCount} 
                  onChange={(e) => setJamaahCount(parseInt(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500 shadow-inner"
                />

                <div className="flex justify-between text-[11px] text-slate-600 font-bold mt-2">
                  <span>1 Jamaah</span>
                  <span>5 (Bonus Safara)</span>
                  <span>7 (Bonus Safara)</span>
                  <span>10 (Bonus Safawi)</span>
                  <span>33 (UMRAH GRATIS)</span>
                  <span>50 Jamaah</span>
                </div>
              </div>

              {/* Dynamic Output Box with Motion Animation */}
              <motion.div 
                key={jamaahCount}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-[#0c223d] via-primary to-[#061222] text-white p-6 sm:p-8 rounded-2xl shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">Status Reward Keberangkatan:</span>
                  <span className="bg-emerald-500 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-md">
                    {jamaahCount >= 33 ? '🏆 SUPER VIP TOUR LEADER' : (jamaahCount >= 5 ? '🎁 REWARD SPESIAL ACTIVE' : '✅ UJRAH STANDARD ACTIVE')}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-300 block mb-1">Potensi Reward & Bonus Utama:</span>
                  <h4 className="text-lg sm:text-2xl font-headline font-black text-amber-300 leading-snug">
                    {currentReward.bonusText}
                  </h4>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-300 block">Fasilitas Tambahan Mitra:</span>
                    <strong className="text-xs sm:text-sm font-extrabold text-white">{currentReward.extraBonus}</strong>
                  </div>
                  <Button asChild size="sm" className="bg-amber-400 hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md shrink-0 hover:scale-105 transition-transform">
                    <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer">Klaim Promo WA</a>
                  </Button>
                </div>
              </motion.div>

            </Card>
          </div>
        </motion.section>

        {/* LAYER 5: Skema Ujrah Official Image Layer (with Lightbox Zoom) */}
        <motion.section 
          id="ujrah" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-white relative border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-widest mb-3 border border-amber-300">
                <DollarSign className="w-4 h-4 text-amber-700" /> SKEMA UJRAH SYARIAH TRANSPARAN
              </div>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight mb-2">
                Tabel Resmi Ujrah & Komisi Samira Travel
              </h2>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                Setiap hasil usaha mensyiarkan umrah dibayarkan secara adil, transparan, dan langsung ke rekening Anda:
              </p>
            </div>

            {/* Card with Image & Zoom Lightbox Toggle */}
            <div className="bg-slate-50 rounded-3xl border-2 border-slate-200/90 p-6 sm:p-10 shadow-xl mb-12">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                
                {/* Image Left */}
                <div className="lg:col-span-6 space-y-3">
                  <motion.div 
                    whileHover={{ scale: 1.02, rotate: 0.5 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-white group cursor-pointer" 
                    onClick={() => setIsZoomImage(true)}
                  >
                    <img 
                      src="/images/ujroh.jpeg" 
                      alt="Tabel Ujrah Samira Travel" 
                      className="w-full h-auto object-cover transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5" /> Klik Untuk Perbesar
                    </div>
                  </motion.div>
                </div>

                {/* Content Right */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300 inline-block">
                    ✅ 100% Akad Syariah Murni (Tanpa Potongan)
                  </span>

                  <h3 className="text-xl sm:text-2xl font-headline font-black text-slate-900">
                    Jaminan Kebebasan & Transparansi Hasil Usaha
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <motion.div whileHover={{ x: 4 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-extrabold block text-sm">Langsung Cair Saat Booking Seat</strong>
                        <span>Komisi ujrah tidak perlu menunggu keberangkatan, langsung cair saat jamaah bayar DP.</span>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ x: 4 }} className="bg-white p-3.5 rounded-2xl border border-amber-300 flex items-start gap-3 shadow-xs">
                      <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-extrabold block text-sm">Bawa 33 Jamaah = UMRAH GRATIS</strong>
                        <span>Menjadi Tour Leader resmi kelompok jamaah Anda sendiri + Komisi utuh tetap dibayarkan!</span>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ x: 4 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-start gap-3 shadow-xs">
                      <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-900 font-extrabold block text-sm">Tanpa Target Minimum & Sanksi</strong>
                        <span>Bebas dijalankan dari rumah kapan saja tanpa beban sistem piramida MLM.</span>
                      </div>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>

            {/* Lightbox Modal Zoom for Image */}
            <AnimatePresence>
              {isZoomImage && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsZoomImage(false)}
                  className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative max-w-4xl w-full bg-white p-2 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <img src="/images/ujroh.jpeg" alt="Tabel Ujrah Zoom" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
                    <button 
                      onClick={() => setIsZoomImage(false)}
                      className="absolute top-4 right-4 bg-slate-900 text-white rounded-full p-2 hover:bg-amber-500 transition-colors shadow-lg"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.section>

        {/* LAYER 6: Interactive Syarat & Tool Kit Tabs Layer */}
        <motion.section 
          id="syarat" 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-slate-50 border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 shadow-sm border border-amber-300">
                📋 PANDUAN LENGKAP KEMITRAAN
              </span>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight">
                Persyaratan, Tools & Keamanan Transaksi
              </h2>
            </div>

            {/* Tab Controls */}
            <div className="flex justify-center gap-2 mb-8">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('syarat')}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer border ${
                  activeTab === 'syarat'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📝 Persyaratan Registrasi
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('kit')}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer border ${
                  activeTab === 'kit'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👕 Starter Kit & Tool Kit Usaha
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab('keamanan')}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer border ${
                  activeTab === 'keamanan'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🛡️ Keamanan Rekening Resmi
              </motion.button>
            </div>

            {/* Tab Contents with AnimatePresence */}
            <Card className="bg-white border-2 border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'syarat' && (
                  <motion.div
                    key="syarat"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-headline font-black text-slate-900 mb-4">Syarat Registrasi Mitra (Seluruh Indonesia)</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <strong className="text-slate-900 font-extrabold text-sm block mb-1">1. Identitas KTP</strong>
                        <p className="text-xs text-slate-600">Fotokopi / Foto KTP asli yang difoto jelas lalu dikirim via WhatsApp.</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                        <strong className="text-slate-900 font-extrabold text-sm block mb-1">2. Pasfoto Terbaru</strong>
                        <p className="text-xs text-slate-600">Pasfoto berwarna ukuran 4×6 sebanyak 1 lembar.</p>
                      </div>
                      <div className="bg-amber-50 p-5 rounded-2xl border-2 border-amber-400">
                        <strong className="text-amber-900 font-extrabold text-sm block mb-1">3. Biaya Registrasi: Rp 1.550.000,-</strong>
                        <p className="text-xs text-slate-700">Dibayarkan langsung ke Kasir atau transfer ke rekening resmi PT Samira Ali Wisata.</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'kit' && (
                  <motion.div
                    key="kit"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <h3 className="text-xl font-headline font-black text-slate-900 mb-4">Fasilitas Starter Kit Usaha Resmi Mitra</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center gap-3">
                        <Shirt className="w-6 h-6 text-amber-700 shrink-0" />
                        <span className="text-xs font-black text-slate-900">Baju Seragam Mitra Samira</span>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center gap-3">
                        <FileText className="w-6 h-6 text-amber-700 shrink-0" />
                        <span className="text-xs font-black text-slate-900">Spanduk Promosi Resmi</span>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-amber-700 shrink-0" />
                        <span className="text-xs font-black text-slate-900">Brosur Cetak (1 Rim / 500 Lembar)</span>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-center gap-3">
                        <IdCard className="w-6 h-6 text-amber-700 shrink-0" />
                        <span className="text-xs font-black text-slate-900">ID Card Resmi & Kartu Nama</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'keamanan' && (
                  <motion.div
                    key="keamanan"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 border-2 border-red-400 p-6 rounded-2xl text-red-950 space-y-2"
                  >
                    <h4 className="font-extrabold text-base flex items-center gap-2 text-red-900">
                      <AlertTriangle className="w-5 h-5 text-red-600" /> PERINGATAN HUKUM KEAMANAN TRANSAKSI:
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Kami <strong>TIDAK BERTANGGUNG JAWAB</strong> apabila transaksi keuangan dilakukan di luar nomor rekening resmi perusahaan. Seluruh pembayaran registrasi kemitraan maupun pendaftaran DP jamaah dianggap sah hanya jika masuk ke Rekening Resmi Perusahaan <strong>a/n PT. SAMIRA ALI WISATA</strong>.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>

          </div>
        </motion.section>

        {/* LAYER 6.5: Fasilitas Perlengkapan Umrah Premium Showcase (public/images/perlengkapan.jpeg) */}
        <motion.section 
          id="perlengkapan"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-white border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs uppercase tracking-widest mb-3 border border-amber-300">
                <Gift className="w-4 h-4 text-amber-700" /> FASILITAS PERLENGKAPAN JAMAAH EXCLUSIVE
              </div>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight mb-2">
                Fasilitas Perlengkapan Umrah Premium Samira
              </h2>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                Setiap jamaah yang Anda daftarkan mendapatkan 1 set perlengkapan ibadah eksklusif berstandar internasional dengan batik khas Samira Travel:
              </p>
            </div>

            <div className="bg-slate-50 rounded-3xl border-2 border-amber-300 p-6 sm:p-10 shadow-xl">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                
                {/* Image Showcase Left */}
                <div className="lg:col-span-6 space-y-3">
                  <motion.div 
                    whileHover={{ scale: 1.02, rotate: -0.5 }}
                    transition={{ duration: 0.3 }}
                    className="relative rounded-2xl overflow-hidden border-2 border-amber-400 shadow-xl bg-white group cursor-pointer" 
                    onClick={() => setIsZoomPerlengkapan(true)}
                  >
                    <img 
                      src="/images/perlengkapan.jpeg" 
                      alt="Fasilitas Perlengkapan Umrah Samira Travel" 
                      className="w-full h-auto object-cover transition-transform duration-300"
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-md">
                      <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Perbesar Gambar Perlengkapan
                    </div>
                  </motion.div>
                </div>

                {/* Detailed Features Right */}
                <div className="lg:col-span-6 space-y-4">
                  <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full border border-amber-300 inline-block shadow-sm">
                    🧳 Full Set High-Quality Executive Equipment
                  </span>

                  <h3 className="text-xl sm:text-2xl font-headline font-black text-slate-900">
                    Rincian Perlengkapan Berstandar Premium:
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-700 font-medium">
                    <motion.div whileHover={{ y: -2 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <strong className="text-amber-700 font-extrabold flex items-center gap-1.5 text-sm">
                        🧳 Koper Hardcase Exclusive
                      </strong>
                      <p className="text-xs text-slate-600">Koper 4 roda anti-pecah dengan kunci kombinasi & batik khas Samira.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <strong className="text-amber-700 font-extrabold flex items-center gap-1.5 text-sm">
                        💼 Tas Paspor & Kabin
                      </strong>
                      <p className="text-xs text-slate-600">Tas selempang dokumen penting agar paspor & tiket aman dan mudah diakses.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <strong className="text-amber-700 font-extrabold flex items-center gap-1.5 text-sm">
                        👔 Seragam Batik Official
                      </strong>
                      <p className="text-xs text-slate-600">Batik resmi bahan dingin premium untuk identitas kompak rombongan.</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <strong className="text-amber-700 font-extrabold flex items-center gap-1.5 text-sm">
                        🤍 Kain Ihram / Bergo Syar'i
                      </strong>
                      <p className="text-xs text-slate-600">Kain ihram katun lembut (pria) / Bergo ibadah dingin syar'i (wanita).</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-1 sm:col-span-2">
                      <strong className="text-emerald-700 font-extrabold flex items-center gap-1.5 text-sm">
                        📖 Buku Doa, Buku Manasik & ID Card Boarding
                      </strong>
                      <p className="text-xs text-slate-600">Buku saku doa tawaf & sai serta ID card identitas jamaah berlisensi resmi.</p>
                    </motion.div>
                  </div>
                </div>

              </div>
            </div>

            {/* Lightbox Zoom for Perlengkapan Image */}
            <AnimatePresence>
              {isZoomPerlengkapan && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsZoomPerlengkapan(false)}
                  className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                >
                  <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="relative max-w-4xl w-full bg-white p-2 rounded-2xl overflow-hidden shadow-2xl"
                  >
                    <img src="/images/perlengkapan.jpeg" alt="Perlengkapan Zoom" className="w-full h-auto max-h-[85vh] object-contain rounded-xl" />
                    <button 
                      onClick={() => setIsZoomPerlengkapan(false)}
                      className="absolute top-4 right-4 bg-slate-900 text-white rounded-full p-2 hover:bg-amber-500 transition-colors shadow-lg"
                    >
                      <Minimize2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.section>

        {/* LAYER 7: Target Audience Grid Layer */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-white border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-amber-600 font-black uppercase tracking-widest text-xs mb-2">Terbuka Untuk Umum</p>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight">
                Peluang Kemitraan Ini Sangat Cocok Untuk:
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {targetAudiences.map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.07 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-start gap-3.5 hover:border-amber-400 transition-colors shadow-xs"
                >
                  <div className="p-3 bg-amber-100 rounded-xl border border-amber-300 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-headline font-extrabold text-sm text-slate-900 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* LAYER 8: Hal Yang Sering Ditanyakan (FAQ Accordion Layer) */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-slate-50 border-b"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 shadow-sm border border-amber-300">
                ❓ PERTANYAAN POPULER MITRA
              </span>
              <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900">
                Hal Yang Sering Ditanyakan (FAQ)
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="bg-white rounded-2xl border-2 border-slate-200/90 overflow-hidden shadow-sm cursor-pointer transition-all hover:border-amber-400"
                >
                  <div className="p-5 flex items-center justify-between gap-4">
                    <strong className="font-extrabold text-sm sm:text-base text-slate-900">{faq.q}</strong>
                    <ChevronDown className={`w-5 h-5 text-amber-600 shrink-0 transition-transform ${expandedFaq === idx ? 'rotate-180' : ''}`} />
                  </div>
                  <AnimatePresence>
                    {expandedFaq === idx && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 font-medium leading-relaxed bg-slate-50/50"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* LAYER 9: Running Marquee Airlines Layer (Posisi Di Akhir Sebelum CTA) */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="py-14 md:py-20 bg-gradient-to-r from-amber-500/10 via-white to-amber-500/10 border-y border-amber-300 overflow-hidden relative"
        >
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3 shadow-md border border-amber-300">
              <Plane className="w-4 h-4 fill-slate-950 text-slate-950" /> MITRA MASKAPAI PENERBANGAN RESMI
            </div>
            <h2 className="text-2xl sm:text-4xl font-headline font-black text-slate-900 leading-tight mb-2">
              Kerjasama Resmi Maskapai Bintang 5 Dunia
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium">
              Seluruh penerbangan jamaah kemitraan Samira Travel menggunakan armada penerbangan langsung (direct flight) berlisensi resmi.
            </p>
          </div>

          {/* Running Ticker Banner Top */}
          <div className="bg-amber-400 text-slate-950 py-2.5 font-black text-xs uppercase tracking-widest overflow-hidden mb-6 border-y border-amber-300 shadow-sm">
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
          <div className="relative w-full overflow-hidden py-2">
            <div className="animate-marquee-left flex items-center gap-4 sm:gap-6">
              {[...kemitraanAirlines, ...kemitraanAirlines].map((air, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-lg flex items-center gap-4 min-w-[280px] sm:min-w-[320px] max-w-[340px] hover:scale-105 transition-transform cursor-pointer shrink-0"
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

          {/* Running Logo Cards Marquee Row 2 (Reverse) */}
          <div className="relative w-full overflow-hidden py-2 mt-2">
            <div className="animate-marquee-right flex items-center gap-4 sm:gap-6">
              {[...kemitraanAirlines.slice().reverse(), ...kemitraanAirlines.slice().reverse()].map((air, idx) => (
                <div 
                  key={idx} 
                  className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 shadow-lg flex items-center gap-4 min-w-[280px] sm:min-w-[320px] max-w-[340px] hover:scale-105 transition-transform cursor-pointer shrink-0"
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
                    <span className="text-[10px] font-black text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                      {air.tag}
                    </span>
                    <strong className="text-slate-950 font-extrabold text-sm block truncate">{air.name}</strong>
                    <span className="text-[11px] text-slate-600 font-medium block truncate">{air.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* LAYER 10: High Impact Light CTA Banner Layer */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="py-16 md:py-24 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 text-slate-950 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="container mx-auto px-4 md:px-6 max-w-4xl relative z-10">
            <span className="bg-slate-950 text-amber-300 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-4 shadow-md">
              ⚡ PENDAFTARAN MITRA BISA DILAKUKAN ONLINE 24/7
            </span>

            <h2 className="text-3xl sm:text-5xl font-headline font-black text-slate-950 leading-tight mb-4 drop-shadow-xs">
              Siap Menjadi Travelpreneur & Meraih Umrah Gratis?
            </h2>

            <p className="text-slate-900 text-sm sm:text-lg mb-8 max-w-2xl mx-auto font-bold">
              Jangan lewatkan peluang bisnis syariah penuh keberkahan ini. Hubungi Konsultan Samira Travel sekarang dan kami siap membantu seluruh prosesnya!
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-slate-950 text-white font-black text-base sm:text-lg shadow-2xl hover:bg-white hover:text-slate-950 transition-all border border-amber-300">
                <a href={waRegisterUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Send className="w-5 h-5 text-amber-400" /> DAFTAR KEMITRAAN VIA WA NOW <ChevronRight className="w-5 h-5" />
                </a>
              </Button>
            </motion.div>
          </div>
        </motion.section>

      </main>

      <Footer agent={agent} />
    </div>
  );
}
