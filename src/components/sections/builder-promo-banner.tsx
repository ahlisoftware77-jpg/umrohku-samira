"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Zap, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BuilderPromoBanner() {
  const waNumber = '6283815862300';
  const waMessage = encodeURIComponent('Halo Admin, saya ingin mendaftar dan membuat Website Landing Page Umrah Samira Travel untuk akun saya.');

  return (
    <section className="py-16 bg-gradient-to-b from-amber-500/10 via-slate-50 to-amber-50/30 text-slate-900 relative overflow-hidden my-8 border-y border-amber-200/60">
      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto rounded-3xl bg-white/95 border-2 border-amber-400/40 p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden text-slate-900">
          
          {/* Subtle Top Badge Line */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-amber-100 pb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Platform Builder Khusus Mitra & Agen Samira Travel
            </div>
            
            <span className="text-xs text-slate-600 flex items-center gap-1 font-mono font-semibold">
              <Globe className="w-3.5 h-3.5 text-emerald-600" /> Subdomain Langsung Aktif
            </span>
          </div>

          {/* Main Hero Promo Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Text Column */}
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl md:text-4xl font-headline font-bold text-slate-950 leading-tight">
                Ingin Memiliki <span className="text-amber-600 underline decoration-amber-300 decoration-wavy">Website & Landing Page Umrah</span> Sendiri?
              </h2>

              <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                Tingkatkan kepercayaan jamaah dan lipatgandakan pendaftaran Anda! Buat website landing page profesional hanya dalam <span className="text-amber-700 font-bold">1 Menit</span> tanpa perlu keahlian coding.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Subdomain Kustom Pemilik Akun</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Interactive E-Katalog 2025/2026</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Terintegrasi Langsung WA Anda</span>
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Desain Mewah & 100% Publik</span>
                </div>
              </div>
            </div>

            {/* Action Card Column */}
            <div className="lg:col-span-5 flex flex-col gap-3 justify-center bg-amber-50/80 p-6 rounded-2xl border border-amber-200/90 shadow-lg">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" /> Mulai Buat Landing Page
              </h3>
              <p className="text-xs text-slate-600 leading-normal">
                Dapatkan template komplit langsung aktif saat Anda pertama kali mendaftar.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="/builder"
                  className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                >
                  ⚡ Pelajari & Buat Website Umrah <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="/dashboard?mode=register"
                  className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl border border-amber-300 bg-white hover:bg-amber-100/50 text-amber-950 font-bold text-xs transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Langsung Mendaftar Gratis
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
