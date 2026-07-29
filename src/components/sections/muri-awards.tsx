"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Award, Medal, Trophy } from 'lucide-react';

export default function MuriAwards({ data }: { data?: Record<string, any> }) {
  const muriImages = PlaceHolderImages.filter(img => img.id.startsWith('muri-'));

  return (
    <section id="muri" className="py-12 md:py-24 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent font-bold text-xs md:text-sm mb-4">
            <Trophy className="w-4 h-4" />
            Prestasi Nasional
          </div>
          
          <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary mt-2">
            Anugerah Rekor MURI
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
            Kebanggaan kami dalam melayani jamaah dengan standar kualitas tertinggi yang diakui secara nasional oleh Museum Rekor Dunia-Indonesia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {muriImages.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              className="group relative"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white transition-transform duration-500 group-hover:-translate-y-2 flex items-center justify-center p-2">
                <div className="relative w-full h-full">
                  <Image
                    src={img.imageUrl}
                    alt={img.description}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                  <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Medal className="w-4 h-4 text-accent" />
                      <span className="font-headline font-bold text-primary text-sm">Rekor MURI</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{img.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -z-10 -bottom-4 -right-4 w-full h-full border-2 border-accent/20 rounded-2xl transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all"
        >
          <div className="flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="font-bold text-primary/70 uppercase text-xs tracking-widest">Terbanyak</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="font-bold text-primary/70 uppercase text-xs tracking-widest">Tercepat</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="font-bold text-primary/70 uppercase text-xs tracking-widest">Terbaik</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
