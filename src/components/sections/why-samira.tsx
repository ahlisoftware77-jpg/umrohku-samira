"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Check, 
  ShieldCheck, 
  Plane, 
  Building2, 
  Map, 
  Calendar, 
  ArrowRight, 
  Award, 
  Building, 
  QrCode, 
  Wifi, 
  Compass, 
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    title: "Berizin Resmi dan Terpercaya",
    description: "Samira Travel memiliki izin resmi dari Kementerian Agama RI sebagai Penyelenggara Perjalanan Ibadah Umrah (PPIU) dan Penyelenggara Haji Khusus (PIHK). Keamanan Anda terjamin.",
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    title: "Tiket Pesawat Booking Duluan",
    description: "Samira Travel selalu memesan dan mengamankan kursi pesawat terbang terlebih dahulu sebelum paket ditawarkan kepada jamaah. Tanggal keberangkatan Anda 100% pasti.",
    icon: <Plane className="w-6 h-6" />
  },
  {
    title: "Fasilitas Perjalanan Nyaman",
    description: "Hotel bintang 4 & 5 terbaik dengan jarak super dekat dengan pelataran Masjidil Haram & Nabawi. Didukung bus AC eksekutif terbaru selama ziarah.",
    icon: <Building2 className="w-6 h-6" />
  },
  {
    title: "Banyak Pilihan Bandara Utama",
    description: "Dapatkan kemudahan berangkat langsung dari kota terdekat Anda seperti Jakarta, Surabaya, Medan, Makassar, Solo, Palembang, dan kota besar lainnya.",
    icon: <Map className="w-6 h-6" />
  }
];

export default function WhySamira({ agent }: { agent?: { slug: string } }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-muted/20 overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <p className="text-accent font-bold uppercase tracking-widest text-sm mb-3">Keunggulan Layanan</p>
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6 leading-tight">
            Mengapa Umroh Bersama Samira Travel?
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Semua standar pelayanan terbaik kami dedikasikan penuh demi menjaga kekhusyukan dan kenyamanan ibadah Anda sekeluarga di Tanah Suci.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Interactive Feature Selection */}
          <div className="lg:col-span-6 space-y-4">
            {features.map((feature, idx) => {
              const isActive = activeIdx === idx;
              return (
                <motion.div
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex gap-5 items-start ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-[8px_8px_0px_0px_rgba(212,175,55,1)] translate-x-1' 
                      : 'bg-white hover:bg-muted/30 border-primary/5 shadow-sm'
                  }`}
                  whileHover={{ scale: isActive ? 1 : 1.01 }}
                  layout
                >
                  <div className={`p-3 rounded-xl transition-colors shrink-0 shadow-inner ${
                    isActive ? 'bg-accent text-accent-foreground' : 'bg-primary/5 text-primary'
                  }`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className={`text-lg md:text-xl font-bold font-headline mb-2 ${
                      isActive ? 'text-white' : 'text-primary'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-xs md:text-sm leading-relaxed ${
                      isActive ? 'text-white/80 font-light' : 'text-muted-foreground'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            <div className="mt-8 pt-4 text-center lg:text-left">
              <Link 
                href={agent?.slug && agent.slug !== 'default' ? `/${agent.slug}/tentang` : "/tentang"} 
                className="group text-primary font-bold hover:text-accent transition-colors border-b-2 border-accent pb-1 inline-flex items-center gap-2"
              >
                Selengkapnya Tentang Kami
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Column: Realistic 3D Mockup Cards Showcase */}
          <div className="lg:col-span-6 flex justify-center items-center relative min-h-[420px] md:min-h-[460px] perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 to-transparent rounded-[3rem] blur-3xl -z-10"></div>
            
            <AnimatePresence mode="wait">
              {activeIdx === 0 && (
                <motion.div
                  key="cert-mockup"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.9 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-[380px] bg-gradient-to-br from-amber-50 to-orange-50 border-4 border-double border-amber-300 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center text-primary relative overflow-hidden"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-bl-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-accent transform rotate-12" />
                  </div>
                  
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 shadow-md mt-4">
                    <ShieldCheck className="w-9 h-9 text-accent" />
                  </div>
                  
                  <h4 className="font-headline font-bold text-lg tracking-wider text-primary">KEMENTERIAN AGAMA RI</h4>
                  <p className="text-[10px] font-bold text-accent tracking-widest uppercase mb-4">Sertifikat Resmi Penyelenggara</p>
                  
                  <div className="w-full border-t border-dashed border-amber-300 my-2"></div>
                  
                  <div className="space-y-3 py-3 w-full text-xs">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Izin PPIU (Umrah)</p>
                      <p className="font-bold text-primary text-sm mt-0.5">Kemenag RI No. D834 / 2016</p>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Izin PIHK (Haji Khusus)</p>
                      <p className="font-bold text-primary text-sm mt-0.5">No. 16092100475620002</p>
                    </div>
                  </div>
                  
                  <div className="w-full border-t border-dashed border-amber-300 my-2"></div>
                  
                  <div className="flex items-center gap-1.5 bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-bold mt-2 shadow-inner uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5 text-accent" /> 100% Legal &amp; Amanah
                  </div>
                </motion.div>
              )}

              {activeIdx === 1 && (
                <motion.div
                  key="ticket-mockup"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.9 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-[420px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl text-slate-800"
                >
                  <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Plane className="w-5 h-5 text-accent" />
                      <span className="font-bold text-xs uppercase tracking-wider">Boarding Pass / E-Ticket</span>
                    </div>
                    <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-center text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Jakarta</p>
                        <h4 className="text-2xl font-black text-primary">CGK</h4>
                        <p className="text-[9px] text-slate-500">Soekarno-Hatta</p>
                      </div>
                      <div className="flex-1 flex flex-col items-center px-4 relative">
                        <span className="text-[9px] text-accent font-bold uppercase mb-1">Direct Flight</span>
                        <div className="w-full h-0.5 bg-dashed bg-slate-300 relative">
                          <Plane className="w-4 h-4 text-primary absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-90" />
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1">SV-821 / Garuda</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Jeddah</p>
                        <h4 className="text-2xl font-black text-primary">JED</h4>
                        <p className="text-[9px] text-slate-500">King Abdulaziz</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 border-t border-b border-slate-100 py-3 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">TANGGAL</span>
                        <span className="font-bold text-primary">Pasti Berangkat</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">KELAS</span>
                        <span className="font-bold text-primary">Executive</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block font-semibold">KURSI</span>
                        <span className="font-bold text-primary">Secured</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-slate-55 p-3 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2">
                        <QrCode className="w-10 h-10 text-primary" />
                        <div className="text-[10px]">
                          <p className="font-bold text-primary">SAMIRA TRAVEL BOOKING</p>
                          <p className="text-slate-400">Scan for departure details</p>
                        </div>
                      </div>
                      <div className="h-6 w-px bg-slate-200"></div>
                      <p className="text-xs font-black text-emerald-600 tracking-wider">DEPARTURE OK</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeIdx === 2 && (
                <motion.div
                  key="hotel-mockup"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.9 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-[380px] bg-white border border-slate-150 rounded-3xl overflow-hidden shadow-2xl text-slate-800 relative group"
                >
                  <div className="relative h-44 w-full">
                    <Image
                      src="/images/penjelasan hotel.jpeg"
                      alt="Hotel Akomodasi Samira"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-primary text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Building className="w-3 h-3 text-accent" /> Premium Hotel
                    </div>
                    
                    <div className="absolute bottom-3 left-3 text-white">
                      <h4 className="font-bold text-lg leading-tight font-headline">Akomodasi Bintang 5 &amp; 4</h4>
                      <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" /> Pelataran Depan Masjid
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-5 space-y-3.5 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="font-semibold text-slate-500">Mekkah:</span>
                      <span className="font-bold text-primary flex items-center gap-1">Anjum / Swissotel (Bintang 5)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="font-semibold text-slate-500">Madinah:</span>
                      <span className="font-bold text-primary">Rove / Leader Al Muna (Bintang 4)</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                      <span className="font-semibold text-slate-500">Transportasi:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Bus AC Eksekutif VIP</span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5">
                      <span className="font-semibold text-slate-500">Katering:</span>
                      <span className="font-bold text-primary">Menu Nusantara (3x Sehari)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeIdx === 3 && (
                <motion.div
                  key="map-mockup"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.9 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 30, scale: 0.9 }}
                  transition={{ duration: 0.6 }}
                  className="w-full max-w-[380px] bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 shadow-2xl text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-accent/5 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-accent text-accent-foreground p-2 rounded-xl">
                      <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-wider uppercase font-headline">Rute Keberangkatan</h4>
                      <p className="text-[9px] text-white/50">Pilih bandara terdekat dari rumah Anda</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-xs font-bold">Jakarta (CGK)</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Tersedia</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-xs font-bold">Surabaya (SUB)</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Tersedia</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-xs font-bold">Medan (KNO)</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Tersedia</span>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent"></span>
                        <span className="text-xs font-bold">Makassar (UPG)</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">Tersedia</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 text-[10px] text-white/50 text-center flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" /> Jadwal terbang terjadwal sepanjang tahun.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
