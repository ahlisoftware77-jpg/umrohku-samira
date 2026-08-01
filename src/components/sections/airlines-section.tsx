"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plane, ShieldCheck, CheckCircle2, Sparkles, MapPin, Luggage, Utensils, Compass, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';

interface AirlinesSectionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export const AIRLINES_DATA = [
  {
    id: 'saudia',
    name: 'Saudia Airlines',
    fullName: 'Saudi Arabian Airlines',
    logo: '/images/MASKAPAI/saudia3.png',
    fallbackLogo: '/images/MASKAPAI/saudia1.jpg',
    tag: 'Maskapai Nasional Kerajaan Arab Saudi',
    flightType: 'Direct Direct Flight (Tanpa Transit)',
    aircraft: 'Boeing 777-300ER / Boeing 787 Dreamliner',
    routes: 'Jakarta (CGK), Surabaya (SUB), Medan (KNO) ➔ Jeddah & Madinah',
    features: [
      'Layanan Musholla Khusus Shalat Berjamaah di Pesawat',
      'Pilihan Menu Makanan Halal Nusantara & Khas Timur Tengah',
      'Audio Al-Qur\'an Lengkap & Doa Safar Otomatis',
      'Gratis Bagasi 30kg + 5 Liter Air Zamzam'
    ],
    badgeColor: 'bg-emerald-500 text-slate-950',
    borderColor: 'border-emerald-500/40'
  },
  {
    id: 'garuda',
    name: 'Garuda Indonesia',
    fullName: 'Garuda Indonesia (National Flag Carrier)',
    logo: '/images/MASKAPAI/LOGO GARUDA.png',
    tag: 'Maskapai Bintang 5 Kebanggaan Indonesia',
    flightType: 'Direct Flight Langsung Kemenag RI',
    aircraft: 'Airbus A330-900neo / Boeing 777-300ER',
    routes: 'Jakarta (CGK), Surabaya (SUB), Solo (SOC), Makassar (UPG) ➔ Jeddah & Madinah',
    features: [
      'Pelayanan Awak Kabin Bintang 5 Ramah & Berbahasa Indonesia',
      'Hiburan Audio Video On Demand dengan Konten Islami',
      'Kursi Ergonomis dengan Legroom Nyaman Untuk Jamaah Lansia',
      'Gratis Bagasi 30kg + 5 Liter Air Zamzam Resmi'
    ],
    badgeColor: 'bg-sky-400 text-slate-950',
    borderColor: 'border-sky-400/40'
  },
  {
    id: 'batik',
    name: 'Batik Air',
    fullName: 'Batik Air (Full Service Charter)',
    logo: '/images/MASKAPAI/batikair.jpg',
    tag: 'Layanan Premium Full Service Indonesia',
    flightType: 'Direct Direct Flight Umrah',
    aircraft: 'Airbus A330-300 / Boeing 737 MAX',
    routes: 'Jakarta (CGK), Medan (KNO), Banda Aceh (BTJ) ➔ Jeddah & Madinah',
    features: [
      'Jadwal Keberangkatan Tepat Waktu & Nyaman',
      'Ruang Kaki (Legroom) Luas & Empuk',
      'Makanan & Minuman Halal Hangat Selama Penerbangan',
      'Gratis Bagasi 30kg + 5 Liter Air Zamzam'
    ],
    badgeColor: 'bg-amber-400 text-slate-950',
    borderColor: 'border-amber-400/40'
  },
  {
    id: 'lion',
    name: 'Lion Air Umrah',
    fullName: 'Lion Air Premium Umrah Flight',
    logo: '/images/MASKAPAI/Lion_Air-Logo.wine.png',
    tag: 'Penerbangan Langsung dari 12+ Bandara Daerah',
    flightType: 'Direct Flight Armada Airbus Terbaru',
    aircraft: 'Airbus A330-900NEO Wide Body',
    routes: 'Surabaya, Solo, Palembang, Padang, Pekanbaru, Kertajati ➔ Jeddah & Madinah',
    features: [
      'Terbang Langsung dari Kota Terdekat Tanpa Transit Jakarta',
      'Armada Airbus A330-900NEO Kebersihan & Sirkulasi HEPA Filter',
      'Fasilitas Makanan & Minuman Halal 2x Selama Penerbangan',
      'Gratis Bagasi 30kg + 5 Liter Air Zamzam'
    ],
    badgeColor: 'bg-red-500 text-white',
    borderColor: 'border-red-500/40'
  },
  {
    id: 'turkish',
    name: 'Turkish Airlines',
    fullName: 'Turkish Airlines (Umrah Plus)',
    logo: '/images/MASKAPAI/turki-air.jpg',
    tag: 'Maskapai Terbaik Eropa (Paket Umrah Plus Turki)',
    flightType: 'Transit City Tour Istanbul',
    aircraft: 'Boeing 787-9 Dreamliner / Airbus A350-900',
    routes: 'Jakarta (CGK) ➔ Istanbul (IST) ➔ Jeddah & Madinah',
    features: [
      'Pengalaman Wisata Sejarah Islam & City Tour di Istanbul',
      'Katering Penerbangan Terbaik Dunia (Best In-Flight Catering)',
      'Fasilitas Wi-Fi & Hiburan Internasional Terlengkap',
      'Gratis Bagasi 30kg + 5 Liter Air Zamzam'
    ],
    badgeColor: 'bg-purple-400 text-slate-950',
    borderColor: 'border-purple-400/40'
  }
];

export default function AirlinesSection({ agent, data }: AirlinesSectionProps) {
  const badgeText = data?.badgeText || 'Maskapai Penerbangan Resmi Partner Samira';
  const title = data?.title || 'Terbang Nyaman & Nyaman ke Tanah Suci';
  const description = data?.description || 'Samira Travel bekerja sama dengan maskapai penerbangan bintang lima nasional & internasional terbaik untuk menjamin kepastian jadwal, keamanan, dan kenyamanan ibadah Anda sekeluarga.';

  const isDefault = agent?.slug?.toLowerCase() === 'default';
  const rawPhone = agent?.whatsapp || agent?.phone || (isDefault ? '6283815862300' : '6283815862300');
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';

  const [activeAirline, setActiveAirline] = useState<string>('saudia');

  return (
    <section id="maskapai" className="py-16 sm:py-24 md:py-28 bg-gradient-to-b from-[#061426] via-[#091f3a] to-[#061426] text-white relative overflow-hidden w-full max-w-full">
      {/* Background Glow Effects */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-4 shadow-md border border-amber-300"
          >
            <Plane className="w-4 h-4 text-slate-950 fill-slate-950" />
            {badgeText}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-white tracking-tight mb-4 leading-tight drop-shadow-md"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-200 text-xs sm:text-base md:text-lg leading-relaxed font-medium max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        {/* Airline Selection Tabs / Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {AIRLINES_DATA.map((air) => (
            <button
              key={air.id}
              onClick={() => setActiveAirline(air.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-300 flex items-center gap-2 cursor-pointer border ${
                activeAirline === air.id
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg scale-105'
                  : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-amber-400/40 hover:text-white'
              }`}
            >
              <Plane className={`w-4 h-4 ${activeAirline === air.id ? 'text-slate-950' : 'text-amber-400'}`} />
              {air.name}
            </button>
          ))}
        </div>

        {/* Selected Airline Featured Detail Card */}
        {AIRLINES_DATA.filter(air => air.id === activeAirline).map((air) => (
          <motion.div
            key={air.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-[#0e2746] via-[#0a1c33] to-[#061324] rounded-3xl p-6 sm:p-10 border-2 border-amber-400/40 shadow-2xl mb-14 overflow-hidden relative"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Logo & Badge */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="bg-white p-5 rounded-2xl border-2 border-amber-300 shadow-xl mb-4 max-w-[260px] w-full flex items-center justify-center min-h-[100px]">
                  <img
                    src={air.logo}
                    alt={air.name}
                    className="max-h-16 w-auto object-contain"
                    onError={(e) => {
                      if (air.fallbackLogo) {
                        (e.target as HTMLImageElement).src = air.fallbackLogo;
                      }
                    }}
                  />
                </div>

                <span className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-2 shadow-sm ${air.badgeColor}`}>
                  {air.tag}
                </span>

                <h3 className="text-xl sm:text-2xl font-headline font-black text-white mb-1">
                  {air.fullName}
                </h3>

                <p className="text-xs text-amber-300 font-extrabold flex items-center gap-1.5 mt-1">
                  <Compass className="w-4 h-4 shrink-0" /> Armada: {air.aircraft}
                </p>
              </div>

              {/* Right Column: Route & Key Features */}
              <div className="lg:col-span-7 space-y-4">
                {/* Flight Route Box */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/15">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Rute Penerbangan Utama:</span>
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-white">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{air.routes}</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                    ✈️ {air.flightType}
                  </div>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {air.features.map((feat, idx) => (
                    <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-white/10 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200 font-semibold leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        ))}

        {/* All Airlines Logos Grid Showcase */}
        <div className="bg-slate-950/80 p-6 sm:p-8 rounded-3xl border border-white/15 shadow-xl">
          <div className="text-center mb-6">
            <h4 className="text-sm sm:text-base font-headline font-black uppercase tracking-wider text-amber-300">
              Mitra Maskapai Resmi Samira Travel
            </h4>
            <p className="text-xs text-slate-400">Seluruh maskapai memenuhi standar keselamatan penerbangan internasional IATA</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 items-center justify-center">
            {AIRLINES_DATA.map((air) => (
              <div
                key={air.id}
                onClick={() => setActiveAirline(air.id)}
                className={`bg-white p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[90px] group ${
                  activeAirline === air.id ? 'border-amber-400 shadow-xl scale-105' : 'border-slate-200 hover:border-amber-400/60 hover:scale-102'
                }`}
              >
                <img
                  src={air.logo}
                  alt={air.name}
                  className="max-h-10 w-auto object-contain transition-transform group-hover:scale-105"
                  onError={(e) => {
                    if (air.fallbackLogo) {
                      (e.target as HTMLImageElement).src = air.fallbackLogo;
                    }
                  }}
                />
                <span className="text-[10px] font-extrabold text-slate-800 mt-2 truncate max-w-full">{air.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flight Guarantees Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white text-xs block font-black">100% Kepastian Seat</strong>
              <span className="text-[10px] text-slate-400">Tiket ter-booking diawal</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Utensils className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white text-xs block font-black">Menu Makanan Halal</strong>
              <span className="text-[10px] text-slate-400">Sesuai lidah Nusantara</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Luggage className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <strong className="text-white text-xs block font-black">Bagasi 30kg + Zamzam</strong>
              <span className="text-[10px] text-slate-400">Air Zamzam 5 Liter gratis</span>
            </div>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
            <Plane className="w-6 h-6 text-sky-400 shrink-0" />
            <div>
              <strong className="text-white text-xs block font-black">Tim Handling Bandara</strong>
              <span className="text-[10px] text-slate-400">Pendampingan 24 jam</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
