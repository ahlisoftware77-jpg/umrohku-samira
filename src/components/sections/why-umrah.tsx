
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
  { icon: <ShieldCheck className="w-6 h-6" />, text: "Jihad Para Perempuan" },
  { icon: <Sun className="w-6 h-6" />, text: "Di Janjikan Surga" },
  { icon: <Sparkles className="w-6 h-6" />, text: "Keberkahan Hidup" },
  { icon: <HandHeart className="w-6 h-6" />, text: "Tanah Suci Mustajabnya Doa" },
  { icon: <Building2 className="w-6 h-6" />, text: "Pahala Berlipat Shalat di Masjidil Haram" },
  { icon: <Moon className="w-6 h-6" />, text: "Umroh saat Ramadhan Seperti Haji" },
  { icon: <Waves className="w-6 h-6" />, text: "Menghapuskan Dosa" },
  { icon: <TrendingUp className="w-6 h-6" />, text: "Rezekinya akan di Lipatgandakan" },
  { icon: <Heart className="w-6 h-6" />, text: "Ketenangan Hati" },
  { icon: <Trophy className="w-6 h-6" />, text: "Pahala Berlipat Shalat di Masjid Nabawi" },
  { icon: <Star className="w-6 h-6" />, text: "Tamu Istimewa Allah SWT" },
  { icon: <Users className="w-6 h-6" />, text: "Mempererat Ukhuwah Islam" },
];

const cardColors = [
  {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10",
    border: "border-blue-200/60 dark:border-blue-900/40",
    shadow: "rgba(59,130,246,0.18)",
    iconBg: "bg-blue-600 text-white",
  },
  {
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10",
    border: "border-emerald-200/60 dark:border-emerald-900/40",
    shadow: "rgba(16,185,129,0.18)",
    iconBg: "bg-emerald-600 text-white",
  },
  {
    bg: "bg-gradient-to-br from-violet-50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/10",
    border: "border-violet-200/60 dark:border-violet-900/40",
    shadow: "rgba(139,92,246,0.18)",
    iconBg: "bg-violet-600 text-white",
  },
  {
    bg: "bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10",
    border: "border-amber-200/60 dark:border-amber-900/40",
    shadow: "rgba(245,158,11,0.18)",
    iconBg: "bg-amber-600 text-white",
  },
  {
    bg: "bg-gradient-to-br from-rose-50 to-pink-50/50 dark:from-rose-950/20 dark:to-pink-950/10",
    border: "border-rose-200/60 dark:border-rose-900/40",
    shadow: "rgba(244,63,94,0.18)",
    iconBg: "bg-rose-600 text-white",
  },
  {
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50/50 dark:from-cyan-950/20 dark:to-sky-950/10",
    border: "border-cyan-200/60 dark:border-cyan-900/40",
    shadow: "rgba(6,182,212,0.18)",
    iconBg: "bg-cyan-600 text-white",
  }
];

export default function WhyUmrah() {
  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-accent font-bold uppercase tracking-widest text-sm mb-4"
          >
            Ibadah Penuh Berkah
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6"
          >
            Alasan Kenapa harus Umroh ?
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: 80 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 bg-accent mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Umroh memiliki banyak faedah bagi yang mengerjakannya!
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, idx) => {
            const color = cardColors[idx % cardColors.length];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04, duration: 0.5 }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  boxShadow: `0 20px 25px -5px ${color.shadow}, 0 8px 10px -6px ${color.shadow}`
                }}
                className={`p-6 rounded-2xl border ${color.bg} ${color.border} flex items-center gap-5 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(10,30,59,0.05)] hover:shadow-lg cursor-pointer group`}
              >
                <div className={`p-4 rounded-xl shadow-md ${color.iconBg} transform group-hover:rotate-12 transition-transform duration-300 shrink-0`}>
                  {reason.icon}
                </div>
                <p className="font-bold text-primary dark:text-white leading-snug text-base md:text-lg">
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
