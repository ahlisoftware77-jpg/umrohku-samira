
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
          {reasons.map((reason, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-primary/5 flex items-center gap-5 hover:shadow-xl hover:border-accent/50 transition-all duration-300 group"
            >
              <div className="bg-primary/5 p-4 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-inner shrink-0">
                {reason.icon}
              </div>
              <p className="font-bold text-primary group-hover:text-primary transition-colors leading-snug text-base md:text-lg">
                {reason.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
