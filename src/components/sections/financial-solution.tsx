"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, BadgePercent, ArrowRight, Sparkles, CheckCircle2, Clock, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';

interface FinancialSolutionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function FinancialSolution({ agent }: FinancialSolutionProps) {
  const isDefault = agent?.slug?.toLowerCase() === 'default';
  const whatsappNumber = (agent?.whatsapp || agent?.phone || (isDefault ? '6283815862300' : '6283815862300')).replace(/[^0-9]/g, '') || '6283815862300';

  return (
    <section id="pembiayaan" className="py-16 sm:py-24 md:py-28 bg-gradient-to-b from-slate-900 via-[#0a1e38] to-slate-900 text-white relative overflow-hidden w-full max-w-full">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 max-w-6xl">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#0f2847] via-[#0b1c33] to-[#071324] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-400/40">
          <div className="grid lg:grid-cols-12 items-stretch">
            
            {/* Left Column: Solution Details */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-14 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
              >
                <div className="inline-flex items-center gap-2 bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-full text-xs uppercase tracking-widest mb-4 shadow-md">
                  <Wallet className="w-4 h-4 fill-slate-950" /> Solusi Pembiayaan Syariah
                </div>
                
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-white mb-4 leading-tight">
                  Mau Umrah Tapi <span className="text-amber-400 underline decoration-amber-400/40">Terkendala Biaya?</span>
                </h2>
                
                <div className="bg-amber-400/10 border-l-4 border-amber-400 p-4 rounded-r-xl mb-6 backdrop-blur-md">
                  <p className="text-amber-300 font-black text-base sm:text-lg">
                    ✨ SOLUSI PASTI: UMROH DULUAN, BAYAR BELAKANGAN!
                  </p>
                  <p className="text-slate-200 mt-1 font-medium text-xs sm:text-sm">
                    Nikmati kemudahan ibadah tanpa beban dengan skema angsuran syariah resmi DSN-MUI.
                  </p>
                </div>

                <p className="text-slate-200 text-xs sm:text-base leading-relaxed mb-6 font-medium">
                  Cukup dengan <strong className="text-amber-300 font-black">DP Mulai 7 JUTA RUPIAH</strong> Anda sekeluarga sudah bisa berangkat ke Tanah Suci. Pembiayaan resmi bekerja sama dengan <strong className="text-white">AMITRA SYARIAH</strong> yang diawasi langsung oleh <strong className="text-emerald-400 font-bold">OJK & Dewan Syariah DSN-MUI</strong>.
                </p>

                {/* Key Benefits Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-8">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> 100% Bebas Riba
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" /> Proses Kilat &lt; 7 Hari
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Scale className="w-4 h-4 text-emerald-400 shrink-0" /> Akad Ijaroh Multijasa
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/10 flex items-center gap-2 text-xs font-bold text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" /> Pengawasan OJK
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black hover:from-amber-600 hover:to-amber-700 px-6 sm:px-8 text-xs sm:text-sm h-12 shadow-lg shadow-amber-500/25 transition-all border border-amber-300 hover:scale-105">
                    <a href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=Assalamu'alaikum, saya ingin konsultasi Solusi Pembiayaan Syariah DP 7 Juta`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Konsultasi Simulasi WA <ArrowRight className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Right Column: High Impact DP Badge & Gold Box */}
            <div className="lg:col-span-5 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 p-8 sm:p-12 flex flex-col justify-center items-center text-center text-slate-950 border-t-2 lg:border-t-0 lg:border-l-2 border-amber-300">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="space-y-6 max-w-xs"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-950 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border-2 border-white">
                  <BadgePercent className="w-10 h-10 sm:w-12 sm:h-12" />
                </div>
                
                <div>
                  <span className="bg-slate-950 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2 shadow-sm">
                    Uang Muka Ringan
                  </span>
                  <h3 className="text-slate-950 text-4xl sm:text-6xl font-headline font-black mb-1 leading-none drop-shadow-xs">
                    DP 7 JT
                  </h3>
                  <p className="text-slate-900 font-extrabold tracking-widest uppercase text-xs sm:text-sm">
                    BISA LANGSUNG BERANGKAT
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-950/20">
                  <div className="flex items-center justify-center gap-2.5 text-slate-950">
                    <ShieldCheck className="w-6 h-6 text-slate-950 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-black leading-tight text-left">
                      RESMI DIAWASI OLEH <br /> OJK & DEWAN SYARIAH MUI
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
