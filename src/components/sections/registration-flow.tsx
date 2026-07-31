"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  MessageSquareQuote, 
  UserCheck, 
  Plane, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface RegistrationFlowProps {
  data?: Record<string, any>;
}

const defaultSteps = [
  {
    number: "01",
    title: "Pilih Paket Umrah",
    subtitle: "Rencana Ibadah",
    description: "Pilih jadwal keberangkatan, tipe kamar, dan fasilitas hotel sesuai keinginan Anda.",
    icon: <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
    badge: "Langkah 1"
  },
  {
    number: "02",
    title: "Konsultasi & Daftar",
    subtitle: "Kemudahan Layanan",
    description: "Hubungi konsultan kami via WhatsApp atau datang ke kantor cabang terdekat.",
    icon: <MessageSquareQuote className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
    badge: "Langkah 2"
  },
  {
    number: "03",
    title: "Bimbingan Manasik",
    subtitle: "Persiapan Ibadah",
    description: "Ikuti pembekalan manasik intensif sesuai Sunnah Rasulullah SAW sebelum berangkat.",
    icon: <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
    badge: "Langkah 3"
  },
  {
    number: "04",
    title: "Terbang ke Tanah Suci",
    subtitle: "Keberangkatan",
    description: "Terbang nyaman didampingi Muthawwif berpengalaman selama di Makkah & Madinah.",
    icon: <Plane className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
    badge: "Langkah 4"
  },
];

export default function RegistrationFlow({ data }: RegistrationFlowProps) {
  const badgeText = data?.badgeText || 'Cara Kerja & Alur Pendaftaran';
  const title = data?.title || '4 Langkah Mudah Menuju Tanah Suci';
  const description = data?.description || 'Proses pendaftaran Umrah & Haji yang transparan, praktis, dan didampingi tim profesional dari awal hingga kembali ke Tanah Air.';

  return (
    <section id="alur" className="py-14 sm:py-20 md:py-28 bg-gradient-to-b from-white via-slate-50/70 to-white overflow-hidden relative w-full max-w-full">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" /> {badgeText}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-headline font-extrabold text-primary mb-3 leading-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium"
          >
            {description}
          </motion.p>
        </div>

        {/* ── FLEXIBLE RESPONSIVE TIMELINE CARDS GRID ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-6 relative">
          
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-12 right-12 h-0.5 bg-gradient-to-r from-accent/30 via-primary/20 to-accent/30 -translate-y-8 pointer-events-none z-0" />

          {defaultSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-primary/40 z-10"
            >
              {/* Top Step Number & Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary via-[#0f3057] to-primary text-white font-headline font-black text-xs sm:text-sm flex items-center justify-center shadow-md border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </span>

                <span className="text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-foreground border border-accent/30">
                  {step.badge}
                </span>
              </div>

              {/* Icon Box */}
              <div className="p-3 rounded-xl bg-primary/5 text-primary w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {step.icon}
              </div>

              {/* Title & Content */}
              <div>
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                  {step.subtitle}
                </span>
                <h3 className="font-headline font-extrabold text-sm sm:text-lg text-primary leading-tight group-hover:text-accent transition-colors mb-2">
                  {step.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-xs font-extrabold text-primary/70 group-hover:text-primary transition-colors">
                <span>Langkah {idx + 1} dari 4</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-accent" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Trust Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 sm:mt-14 bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-headline font-extrabold text-xs sm:text-sm text-primary">Garansi Kepastian Keberangkatan & Izin PPIU Kemenag RI</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">100% Terdaftar Resmi & Didampingi Pembimbing Bersertifikat</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-accent shrink-0">
            <Clock className="w-4 h-4" /> Proses 100% Transparan
          </div>
        </motion.div>

      </div>
    </section>
  );
}
