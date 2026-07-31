"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Ban, 
  Zap, 
  Heart, 
  ArrowRight,
  Sparkles,
  Award,
  CalendarCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';

interface EmotionalCtaProps {
  agent?: Agent;
  data?: Record<string, any>;
}

const features = [
  { icon: <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />, text: "PASTI Berangkat", sub: "Seat & Hotel Ter-booking" },
  { icon: <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />, text: "PASTI Berasuransi", sub: "Proteksi Perjalanan Penuh" },
  { icon: <Ban className="w-5 h-5 text-amber-400 shrink-0" />, text: "TANPA Riba & Agunan", sub: "Akad Syariah Murni" },
  { icon: <Zap className="w-5 h-5 text-amber-400 shrink-0" />, text: "MUDAH Cicilannya", sub: "Bisa Bulanan / Musiman" },
  { icon: <Award className="w-5 h-5 text-amber-400 shrink-0" />, text: "Izin Resmi PPIU", sub: "Terakreditasi Kemenag" },
];

export default function EmotionalCta({ agent }: EmotionalCtaProps) {
  const isDefault = agent?.slug?.toLowerCase() === 'default';
  const whatsappNumber = (agent?.whatsapp || agent?.phone || (isDefault ? '6283815862300' : '6283815862300')).replace(/[^0-9]/g, '') || '6283815862300';

  return (
    <section id="pasti" className="py-16 sm:py-24 md:py-28 relative overflow-hidden bg-[#07172c] text-white w-full max-w-full">
      {/* High-contrast ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Main Promise & Guarantee Features) */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4 sm:mb-6 shadow-md border border-amber-300">
              <Sparkles className="w-4 h-4 fill-slate-950" /> MAU UMROH YANG PASTI & BERKAH?
            </div>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-md">
              Sudah <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-lg font-black inline-block shadow-sm">RINDU</span> Baitullah Tapi Tabungan Belum Cukup?
            </h2>
            
            <p className="text-white font-semibold text-sm sm:text-base md:text-lg mb-6 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-white/20 shadow-sm">
              Punya impian mulia ingin memberangkatkan diri & orang tua tercinta ke Tanah Suci? Bersama Samira Travel, Anda bisa <strong className="text-amber-300 underline font-black">Berangkat UMROH DULUAN, Bayar Belakangan!</strong>
            </p>

            {/* Feature Card */}
            <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-7 rounded-2xl sm:rounded-3xl border-2 border-amber-400/40 shadow-2xl relative overflow-hidden">
              <h3 className="text-base sm:text-xl font-headline font-black mb-4 flex items-center gap-2.5 text-amber-300">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 fill-red-500 shrink-0" /> 
                Solusi Ibadah Tenang, Mudah & Terjamin 100%
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-950 p-3.5 rounded-xl border border-amber-400/30 hover:border-amber-400 transition-colors shadow-sm">
                    {item.icon}
                    <div>
                      <span className="font-black text-xs sm:text-sm text-white block mb-0.5">{item.text}</span>
                      <span className="text-amber-300 font-bold text-[11px] sm:text-xs block">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column (Quote & High Impact CTA Card) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative z-10 bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 p-6 sm:p-10 rounded-2xl sm:rounded-3xl text-slate-950 shadow-2xl border-4 border-white overflow-hidden">
              <div className="inline-flex items-center gap-1.5 bg-slate-950 text-white px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 shadow-md">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-400" /> Kuota Terbatas Musim Ini
              </div>

              <blockquote className="text-xl sm:text-2xl md:text-3xl font-headline font-black italic leading-tight mb-4 text-slate-950 drop-shadow-xs">
                "Panggilan Allah Bukan Hanya Untuk Yang Mampu, Tapi Untuk Hamba Yang Rindu."
              </blockquote>

              <p className="text-xs sm:text-sm font-black text-slate-900 mb-6 italic">
                — Niatkan Sekarang, Allah Mudahkan Jalan-Nya 🤲
              </p>
              
              <div className="space-y-4">
                <Button asChild size="lg" className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-950 text-white hover:bg-white hover:text-slate-950 text-sm sm:text-base font-black shadow-2xl transition-all duration-300 group border-2 border-amber-300 hover:scale-105">
                  <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Assalamu'alaikum, saya ingin konsultasi Paket Umroh Pasti Berangkat`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    KONSULTASI & DAFTAR WA NOW! <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>

                <p className="text-center text-xs font-black text-slate-950">
                  ⚡ Layanan Fast Response 24 Jam · Konsultasi Gratis
                </p>
              </div>
            </div>

            {/* Glowing Accent Badge */}
            <div className="absolute -top-5 -right-5 w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-bounce border-4 border-white z-20">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
