"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Send, 
  Sparkles, 
  MessageCircle, 
  Users, 
  ArrowUpRight, 
  Flame 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialMediaSectionProps {
  data?: Record<string, any>;
}

export default function SocialMediaSection({ data }: SocialMediaSectionProps) {
  const badgeText = data?.badgeText || 'Komunitas & Media Sosial';
  const title = data?.title || 'Bergabung dalam Komunitas & Media Sosial';
  const description = data?.description || 'Dapatkan informasi jadwal keberangkatan terbaru, kajian singkat, galeri momen Tanah Suci, serta kesempatan berkonsultasi langsung dengan jamaah & alumni.';

  const socials = [
    {
      name: 'WhatsApp Group',
      category: 'Komunitas VIP',
      url: data?.whatsappUrl || data?.whatsappGroup || 'https://wa.me/6283815862300',
      icon: <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'from-emerald-500 to-green-600 text-white',
      badge: '25K+ Jamaah',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      handle: 'Grup WA Jamaah',
      desc: 'Info jadwal & konsultasi langsung'
    },
    {
      name: 'Instagram',
      category: 'Galeri Visual',
      url: data?.instagramUrl || 'https://instagram.com',
      icon: <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'from-pink-500 via-purple-500 to-orange-400 text-white',
      badge: 'Official HD',
      badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
      handle: '@samiratravel_official',
      desc: 'Foto & Reel dokumentasi harian'
    },
    {
      name: 'TikTok',
      category: 'Video Singkat',
      url: data?.tiktokUrl || 'https://tiktok.com',
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.33 1.52-1.33 2.52.01.95.49 1.88 1.27 2.41 1.05.73 2.51.72 3.53-.05.74-.54 1.19-1.42 1.25-2.35.05-3.64.01-7.29.02-10.93z"/>
        </svg>
      ),
      color: 'from-gray-900 via-slate-800 to-black text-white',
      badge: 'Trending',
      badgeColor: 'bg-gray-100 text-gray-800 border-gray-300',
      handle: '@samiratravel',
      desc: 'Liputan kegiatan & tips umrah'
    },
    {
      name: 'YouTube',
      category: 'Dokumenter',
      url: data?.youtubeUrl || 'https://youtube.com',
      icon: <Youtube className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'from-red-600 to-rose-700 text-white',
      badge: 'Vlog Full HD',
      badgeColor: 'bg-red-100 text-red-800 border-red-300',
      handle: 'Samira Travel Official',
      desc: 'Manasik lengkap & kajian religi'
    },
    {
      name: 'Telegram Channel',
      category: 'Kajian & Broadcast',
      url: data?.telegramUrl || 'https://t.me',
      icon: <Send className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'from-sky-500 to-blue-600 text-white',
      badge: 'Broadcast',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
      handle: 'Sahabat Samira Travel',
      desc: 'Pengumuman promo & doa harian'
    }
  ];

  return (
    <section id="sosmed" className="py-14 sm:py-20 md:py-28 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 overflow-hidden relative w-full max-w-full">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
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

        {/* ── BANNER BANNER KOMUNITAS UTAMA (VIP COMMUNITY BANNER) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12 bg-gradient-to-br from-[#0a1e3b] via-[#0f2a4a] to-[#071527] rounded-2xl sm:rounded-3xl p-6 sm:p-9 text-white relative overflow-hidden shadow-2xl border-2 border-amber-400/40"
        >
          {/* Subtle background glows for high depth & luxury feel */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-slate-950" /> Komunitas VIP Jamaah
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Users className="w-3.5 h-3.5 text-emerald-300" /> 25.000+ Member Aktif
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-black text-white mb-3 leading-tight drop-shadow-md">
                Bergabung dalam Komunitas WhatsApp & Telegram Jamaah
              </h3>
              <p className="text-slate-100 text-sm sm:text-base font-medium leading-relaxed drop-shadow-xs">
                Dapatkan broadcast jadwal manasik, panduan doa Umrah/Haji harian, info kuota promo langsung, serta tempat silaturahmi sesama alumni jamaah.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
              <Button asChild className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 text-white font-extrabold text-xs sm:text-sm h-12 px-6 rounded-xl shadow-lg shadow-emerald-600/35 hover:from-emerald-600 hover:to-emerald-700 hover:scale-105 border border-emerald-300/40 transition-all">
                <a href={data?.whatsappUrl || data?.whatsappGroup || 'https://wa.me/6283815862300'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <MessageCircle className="w-4 h-4 fill-white/20" /> Join Grup WA Jamaah
                </a>
              </Button>

              <Button asChild className="bg-sky-600 hover:bg-sky-500 text-white border border-sky-400/50 font-extrabold text-xs sm:text-sm h-12 px-5 rounded-xl shadow-md transition-all hover:scale-105">
                <a href={data?.telegramUrl || 'https://t.me'} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Telegram Channel
                </a>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── GRID CHANNEL MEDIA SOSIAL (FLEXIBLE RESPONSIVE CARDS) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 md:gap-6">
          {socials.map((item, index) => (
            <motion.a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:border-primary/40"
            >
              {/* Top Row: Icon & Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${item.color} shadow-md group-hover:scale-110 transition-transform duration-300 shrink-0`}>
                  {item.icon}
                </div>
                <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${item.badgeColor} truncate shrink-0`}>
                  {item.badge}
                </span>
              </div>

              {/* Channel Info */}
              <div className="mb-3">
                <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">
                  {item.category}
                </span>
                <h4 className="font-headline font-extrabold text-xs sm:text-base text-primary leading-tight group-hover:text-accent transition-colors truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5 font-medium">
                  {item.handle}
                </p>
              </div>

              {/* Bottom Visit Link */}
              <div className="pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs font-bold text-primary opacity-80 group-hover:opacity-100 transition-opacity">
                <span>Kunjungi</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
