
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Sun, 
  Sparkles, 
  HandHeart, 
  Building2, 
  Moon, 
  Waves, 
  TrendingUp, 
  Heart, 
  Trophy, 
  Star, 
  Users 
} from 'lucide-react';

const reasons = [
  { icon: <ShieldCheck />, text: "Jihad Para Perempuan" },
  { icon: <Sun />, text: "Dijanjikan Surga" },
  { icon: <Sparkles />, text: "Keberkahan Hidup" },
  { icon: <HandHeart />, text: "Tanah Suci Mustajab Doa" },
  { icon: <Building2 />, text: "Pahala Berlipat di Haram" },
  { icon: <Moon />, text: "Umrah Ramadhan = Haji" },
  { icon: <Waves />, text: "Menghapuskan Dosa" },
  { icon: <TrendingUp />, text: "Rezeki Dilipatgandakan" },
  { icon: <Heart />, text: "Ketenangan Hati & Jiwa" },
  { icon: <Trophy />, text: "Pahala Berlipat di Nabawi" },
  { icon: <Star />, text: "Tamu Istimewa Allah" },
  { icon: <Users />, text: "Mempererat Ukhuwah" },
];

const cardColors = [
  {
    bg: "bg-gradient-to-br from-blue-50/90 via-white to-blue-50/30 dark:from-blue-950/20 dark:to-indigo-950/10",
    border: "border-blue-200/70 dark:border-blue-900/40",
    shadow: "rgba(59,130,246,0.15)",
    iconBg: "bg-gradient-to-br from-blue-600 to-blue-700 text-white",
  },
  {
    bg: "bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/30 dark:from-emerald-950/20 dark:to-teal-950/10",
    border: "border-emerald-200/70 dark:border-emerald-900/40",
    shadow: "rgba(16,185,129,0.15)",
    iconBg: "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white",
  },
  {
    bg: "bg-gradient-to-br from-violet-50/90 via-white to-violet-50/30 dark:from-violet-950/20 dark:to-purple-950/10",
    border: "border-violet-200/70 dark:border-violet-900/40",
    shadow: "rgba(139,92,246,0.15)",
    iconBg: "bg-gradient-to-br from-violet-600 to-violet-700 text-white",
  },
  {
    bg: "bg-gradient-to-br from-amber-50/90 via-white to-amber-50/30 dark:from-amber-950/20 dark:to-orange-950/10",
    border: "border-amber-200/70 dark:border-amber-900/40",
    shadow: "rgba(245,158,11,0.15)",
    iconBg: "bg-gradient-to-br from-amber-600 to-amber-700 text-white",
  },
  {
    bg: "bg-gradient-to-br from-rose-50/90 via-white to-rose-50/30 dark:from-rose-950/20 dark:to-pink-950/10",
    border: "border-rose-200/70 dark:border-rose-900/40",
    shadow: "rgba(244,63,94,0.15)",
    iconBg: "bg-gradient-to-br from-rose-600 to-rose-700 text-white",
  },
  {
    bg: "bg-gradient-to-br from-cyan-50/90 via-white to-cyan-50/30 dark:from-cyan-950/20 dark:to-sky-950/10",
    border: "border-cyan-200/70 dark:border-cyan-900/40",
    shadow: "rgba(6,182,212,0.15)",
    iconBg: "bg-gradient-to-br from-cyan-600 to-cyan-700 text-white",
  }
];

export default function WhyUmrah({ data }: { data?: Record<string, any> } = {}) {
  return (
    <section id="alasan" className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-slate-50/60 via-muted/20 to-slate-50/60 overflow-hidden w-full max-w-full">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl">
        <div className="text-center mb-7 sm:mb-12 md:mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-extrabold uppercase tracking-widest text-[10px] sm:text-xs mb-1.5 sm:mb-2 block"
          >
            ✨ Ibadah Penuh Berkah
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl md:text-5xl font-headline font-extrabold text-primary mb-2.5 sm:mb-4 leading-tight"
          >
            Alasan Kenapa Harus Umrah?
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: 60 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="h-1 bg-accent mx-auto mb-2.5 sm:mb-4 rounded-full"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium"
          >
            Keutamaan dan faedah melimpah bagi setiap hamba yang menunaikan ibadah di Tanah Suci.
          </motion.p>
        </div>

        {/* 2-Column Grid on Mobile for Slim, Elegant & Executive Look */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 md:gap-6">
          {reasons.map((reason, idx) => {
            const color = cardColors[idx % cardColors.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03, duration: 0.4 }}
                whileHover={{ 
                  y: -4, 
                  scale: 1.02,
                  boxShadow: `0 12px 20px -4px ${color.shadow}`
                }}
                className={`p-2.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border ${color.bg} ${color.border} flex items-center gap-2 sm:gap-4 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer group hover:-translate-y-0.5`}
              >
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-xs ${color.iconBg} transform group-hover:rotate-6 transition-transform duration-300 shrink-0 [&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 md:[&>svg]:w-6 md:[&>svg]:h-6`}>
                  {reason.icon}
                </div>
                <p className="font-bold text-primary dark:text-white leading-tight text-xs sm:text-sm md:text-base">
                  {reason.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
