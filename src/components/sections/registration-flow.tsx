"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  CreditCard, 
  Package, 
  CalendarCheck, 
  Plane, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertTriangle,
  BadgeCheck,
  Truck,
  UserCheck
} from 'lucide-react';

interface RegistrationFlowProps {
  data?: Record<string, any>;
}

export interface FlowStep {
  title: string;
  subtitle: string;
  description: string;
  iconName?: string; // lucide icon name for serialization
  isHighlighted?: boolean;
}

export const DEFAULT_STEPS: FlowStep[] = [
  {
    title: "Kirim Dokumen KTP & KK",
    subtitle: "Pendaftaran Awal",
    description: "Calon jamaah cukup mengirimkan foto KTP dan Kartu Keluarga (KK) melalui WhatsApp atau Instagram resmi Samira Travel untuk memulai proses pendaftaran.",
    iconName: "FileCheck",
  },
  {
    title: "Pembayaran Koper Rp 1.500.000",
    subtitle: "Biaya Pendaftaran",
    description: "Setelah dokumen diterima, lakukan pembayaran biaya pendaftaran awal sebesar Rp 1.500.000 untuk mendapatkan koper eksklusif Samira Travel.",
    iconName: "CreditCard",
  },
  {
    title: "Koper Dikirim ke Rumah",
    subtitle: "Gratis Tanpa Biaya Tambahan",
    description: "Insya Allah, koper resmi Samira Travel langsung dikirim ke rumah jamaah tanpa biaya tambahan. Bisa juga diambil langsung oleh Mitra di kantor cabang atau kantor pusat.",
    iconName: "Truck",
  },
  {
    title: "Pilih Jadwal Keberangkatan",
    subtitle: "Tentukan Tanggal",
    description: "Jamaah memilih tanggal keberangkatan yang tersedia sesuai preferensi, termasuk jenis paket, maskapai, dan hotel yang diinginkan.",
    iconName: "CalendarCheck",
  },
  {
    title: "Booking Seat & Pelunasan H-30",
    subtitle: "Amankan Seat Anda",
    description: "Setelah menentukan jadwal, segera lakukan booking seat dan pelunasan maksimal H-30 (30 hari sebelum keberangkatan) untuk mengamankan kursi Anda.",
    iconName: "BadgeCheck",
    isHighlighted: true,
  },
  {
    title: "Terbang ke Tanah Suci",
    subtitle: "Bismillah Berangkat",
    description: "Terbang nyaman dengan penerbangan direct, didampingi Muthawwif berpengalaman selama di Makkah & Madinah hingga kembali ke Tanah Air.",
    iconName: "Plane",
  },
];

// Icon resolver — maps icon name string to JSX element
const ICON_MAP: Record<string, React.ReactNode> = {
  FileCheck: <FileCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  CreditCard: <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  Truck: <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  CalendarCheck: <CalendarCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  BadgeCheck: <BadgeCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  Plane: <Plane className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  Package: <Package className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
  UserCheck: <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />,
};

export default function RegistrationFlow({ data }: RegistrationFlowProps) {
  const badgeText = data?.badgeText || 'Cara Kerja & Alur Pendaftaran';
  const title = data?.title || '6 Langkah Mudah Menuju Tanah Suci';
  const description = data?.description || 'Proses pendaftaran Umrah Samira Travel yang transparan, praktis, dan mudah — mulai dari kirim KTP hingga terbang ke Tanah Suci. Didampingi tim profesional dari awal hingga akhir.';
  
  // Use custom steps from CMS data if available, otherwise use defaults
  const steps: FlowStep[] = (Array.isArray(data?.steps) && data.steps.length > 0)
    ? data.steps
    : DEFAULT_STEPS;
  const totalSteps = steps.length;


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
        <div className={`grid grid-cols-2 ${totalSteps <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 sm:gap-5 md:gap-6 relative`}>
          
          {steps.map((step, idx) => {
            const stepNumber = String(idx + 1).padStart(2, '0');
            const isHL = step.isHighlighted;
            const icon = ICON_MAP[step.iconName || ''] || ICON_MAP['FileCheck'];

            return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-primary/40 z-10 ${
                isHL ? 'ring-2 ring-amber-400/60 border-amber-300/80 bg-amber-50/30' : ''
              }`}
            >
              {/* Highlight badge for important steps */}
              {isHL && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-bl-xl">
                  ⚠️ Penting
                </div>
              )}

              {/* Top Step Number & Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl font-headline font-black text-sm sm:text-base flex items-center justify-center shadow-md border group-hover:scale-110 transition-transform duration-300 ${
                  isHL 
                    ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20' 
                    : 'bg-slate-900 text-amber-400 border-slate-700 shadow-slate-900/30'
                }`}>
                  {stepNumber}
                </span>

                <span className="text-[9px] sm:text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-accent/15 text-accent-foreground border border-accent/30">
                  Langkah {idx + 1}
                </span>
              </div>

              {/* Icon Box */}
              <div className={`p-3 rounded-xl w-fit mb-4 transition-colors duration-300 ${
                isHL 
                  ? 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                  : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
              }`}>
                {icon}
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
                <span>Langkah {idx + 1} dari {totalSteps}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-accent" />
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* ── IMPORTANT NOTE: H-30 Pelunasan Warning ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 sm:mt-12 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-amber-300/70 max-w-4xl mx-auto shadow-md"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shadow-md shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 space-y-2.5">
              <h4 className="font-headline font-black text-sm sm:text-base text-amber-900 flex items-center gap-2">
                ⚠️ Informasi Penting — Pelunasan H-30
              </h4>
              <div className="space-y-2 text-[11px] sm:text-xs text-amber-950/80 font-medium leading-relaxed">
                <p>
                  Setelah calon jamaah menentukan tanggal keberangkatan, <strong className="text-amber-900">pelunasan wajib dilakukan maksimal H-30 (30 hari sebelum keberangkatan)</strong> untuk mengamankan seat Anda.
                </p>
                <p>
                  Jika dalam waktu <strong className="text-amber-900">1 bulan belum ada pelunasan</strong> dan hanya melakukan pembayaran pendaftaran awal Rp 1.500.000, maka <strong className="text-amber-900">seat jamaah dapat digeser oleh calon jamaah lainnya</strong> yang telah melunasi terlebih dahulu.
                </p>
                <div className="flex items-center gap-2 pt-1.5 border-t border-amber-200/80 mt-2.5">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-extrabold text-amber-800">Segera lunasi H-30 untuk menjamin kursi keberangkatan Anda!</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Trust Guarantee Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-6 sm:mt-8 bg-slate-100/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-2xs"
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
