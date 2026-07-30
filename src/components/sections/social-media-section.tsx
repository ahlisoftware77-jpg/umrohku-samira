"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Facebook, Instagram, Youtube, Send, Share2, Sparkles, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialMediaSectionProps {
  data?: Record<string, any>;
}

export default function SocialMediaSection({ data }: SocialMediaSectionProps) {
  const badgeText = data?.badgeText || 'Komunitas & Media Sosial';
  const title = data?.title || 'Terhubung Bersama Kami di Media Sosial';
  const description = data?.description || 'Dapatkan informasi terbaru mengenai jadwal keberangkatan, galeri kegiatan jamaah, tips ibadah umrah & haji, serta promo spesial langsung dari media sosial kami.';

  const socials = [
    {
      name: 'Facebook',
      url: data?.facebookUrl || 'https://facebook.com',
      icon: <Facebook className="w-6 h-6" />,
      color: 'from-blue-600 to-blue-800 text-white',
      bgLight: 'bg-blue-50 text-blue-600 border-blue-200',
      handle: '@samiratravel'
    },
    {
      name: 'Instagram',
      url: data?.instagramUrl || 'https://instagram.com',
      icon: <Instagram className="w-6 h-6" />,
      color: 'from-pink-500 via-purple-500 to-orange-400 text-white',
      bgLight: 'bg-pink-50 text-pink-600 border-pink-200',
      handle: '@samiratravel_official'
    },
    {
      name: 'TikTok',
      url: data?.tiktokUrl || 'https://tiktok.com',
      icon: (
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.82.56-1.33 1.52-1.33 2.52.01.95.49 1.88 1.27 2.41 1.05.73 2.51.72 3.53-.05.74-.54 1.19-1.42 1.25-2.35.05-3.64.01-7.29.02-10.93z"/>
        </svg>
      ),
      color: 'from-gray-900 to-black text-white',
      bgLight: 'bg-gray-100 text-gray-900 border-gray-300',
      handle: '@samiratravel'
    },
    {
      name: 'YouTube',
      url: data?.youtubeUrl || 'https://youtube.com',
      icon: <Youtube className="w-6 h-6" />,
      color: 'from-red-600 to-rose-700 text-white',
      bgLight: 'bg-red-50 text-red-600 border-red-200',
      handle: 'Samira Travel Official'
    },
    {
      name: 'Telegram / Komunitas',
      url: data?.telegramUrl || 'https://t.me',
      icon: <Send className="w-6 h-6" />,
      color: 'from-sky-500 to-blue-500 text-white',
      bgLight: 'bg-sky-50 text-sky-600 border-sky-200',
      handle: 'Channel Sahabat Samira'
    }
  ];

  return (
    <section id="sosmed" className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white overflow-hidden relative">
      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" /> {badgeText}
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-4 leading-tight"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-base leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Social Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
          {socials.map((item, index) => (
            <motion.a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${item.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                  Ikuti
                </span>
              </div>

              <div>
                <h3 className="font-headline font-bold text-base text-primary mb-1 group-hover:text-accent transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {item.handle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-primary opacity-80 group-hover:opacity-100">
                <span>Kunjungi Profil</span>
                <Share2 className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
}
