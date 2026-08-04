"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Gift, ArrowRight } from 'lucide-react';
import { Agent } from '@/lib/agents';
import { Button } from '@/components/ui/button';

interface MitraPromoSectionProps {
  data?: Record<string, any>;
  agent?: Agent;
}

export default function MitraPromoSection({ data, agent }: MitraPromoSectionProps) {
  const badgeText = data?.badgeText || '🎁 PROMO REWARD KEBERANGKATAN MITRA';
  const title = data?.title || 'Program Bonus Gratis Keberangkatan Rombongan';
  const description = data?.description || 'Dapatkan bonus GRATIS 1 Tiket Keberangkatan Umrah untuk setiap pencapaian target rombongan jamaah Mitra:';

  const card1Title = data?.card1_title || 'Daftar 5 Jamaah Majol';
  const card1Badge = data?.card1_badge || '✨ GRATIS 1 ORANG SAFARA';
  const card1Desc = data?.card1_desc || 'Bonus 1 Tiket Keberangkatan Paket Safara';

  const card2Title = data?.card2_title || 'Daftar 7 Jamaah Sukari';
  const card2Badge = data?.card2_badge || '✨ GRATIS 1 ORANG SAFARA';
  const card2Desc = data?.card2_desc || 'Bonus 1 Tiket Keberangkatan Paket Safara';

  const card3Title = data?.card3_title || 'Daftar 10 Jamaah Safawi';
  const card3Badge = data?.card3_badge || '✨ GRATIS 1 ORANG SAFAWI';
  const card3Desc = data?.card3_desc || 'Bonus 1 Tiket Keberangkatan Paket Safawi';

  const ctaText = data?.ctaText || 'Konsultasi Promo Reward Mitra';
  const targetUrl = data?.targetUrl || (agent?.whatsapp ? `https://api.whatsapp.com/send?phone=${agent.whatsapp}&text=${encodeURIComponent('Halo, saya ingin bertanya tentang Promo Reward Keberangkatan Rombongan Mitra Samira.')}` : '');

  return (
    <section id="mitra-promo" className="py-16 md:py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
      {/* Glow background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3.5 shadow-lg border border-amber-300">
            <Gift className="w-3.5 h-3.5 text-slate-950" /> {badgeText}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-white leading-tight drop-shadow-md">
            {title}
          </h2>
          <p className="text-xs sm:text-base text-amber-100/90 mt-3 font-medium leading-relaxed">
            {description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/90 border-2 border-amber-400/50 hover:border-amber-400 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl flex flex-col items-center text-center group hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-4 border border-amber-400/40 text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🕋
            </div>
            <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Target 1</span>
            <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">{card1Title}</strong>
            <div className="bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
              {card1Badge}
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 font-bold mt-4 leading-snug drop-shadow-sm">
              {card1Desc}
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/90 border-2 border-amber-400/50 hover:border-amber-400 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl flex flex-col items-center text-center group hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-4 border border-amber-400/40 text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🕋
            </div>
            <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Target 2</span>
            <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">{card2Title}</strong>
            <div className="bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
              {card2Badge}
            </div>
            <p className="text-xs sm:text-sm text-emerald-200 font-bold mt-4 leading-snug drop-shadow-sm">
              {card2Desc}
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-slate-900/90 border-2 border-amber-400/50 hover:border-amber-400 p-6 sm:p-8 rounded-3xl transition-all duration-300 shadow-xl flex flex-col items-center text-center group hover:-translate-y-1"
          >
            <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-4 border border-amber-400/40 text-2xl shadow-inner group-hover:scale-110 transition-transform">
              🕋
            </div>
            <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Target 3</span>
            <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">{card3Title}</strong>
            <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
              {card3Badge}
            </div>
            <p className="text-xs sm:text-sm text-amber-200 font-bold mt-4 leading-snug drop-shadow-sm">
              {card3Desc}
            </p>
          </motion.div>
        </div>

        {targetUrl && (
          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base px-8 h-12 rounded-full shadow-2xl hover:scale-105 transition-all gap-2"
            >
              <a href={targetUrl} target="_blank" rel="noopener noreferrer">
                <span>{ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
