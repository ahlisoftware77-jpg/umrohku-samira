"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Award, Medal, Trophy, Star, ShieldCheck, Sparkles, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function MuriAwards({ data }: { data?: Record<string, any> }) {
  const muriImages = PlaceHolderImages.filter(img => img.id.startsWith('muri-'));
  const [selectedMuriIndex, setSelectedMuriIndex] = useState<number | null>(null);

  // ── Mobile Back Button Interceptor for MURI Lightbox ──
  useEffect(() => {
    if (selectedMuriIndex === null) return;

    const stateId = `muri_lightbox_${Date.now()}`;
    window.history.pushState({ isMuriLightbox: true, stateId }, '');

    let closedViaPopstate = false;

    const handlePopState = () => {
      closedViaPopstate = true;
      setSelectedMuriIndex(null);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!closedViaPopstate && window.history.state?.isMuriLightbox) {
        window.history.back();
      }
    };
  }, [selectedMuriIndex !== null]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedMuriIndex === null || muriImages.length === 0) return;
    setSelectedMuriIndex((prev) => (prev !== null ? (prev - 1 + muriImages.length) % muriImages.length : 0));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedMuriIndex === null || muriImages.length === 0) return;
    setSelectedMuriIndex((prev) => (prev !== null ? (prev + 1) % muriImages.length : 0));
  };

  const selectedCertificate = selectedMuriIndex !== null ? muriImages[selectedMuriIndex] ?? null : null;

  return (
    <section id="muri" className="py-16 sm:py-24 md:py-32 bg-gradient-to-br from-[#071326] via-[#0d2340] to-[#06101f] text-white overflow-hidden relative w-full max-w-full">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-300 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-lg"
          >
            <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" /> Prestasi Nasional Bersejarah
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-white mb-4 leading-tight drop-shadow-md"
          >
            {data?.title || 'Anugerah Rekor MURI Indonesia'}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-xs"
          >
            {data?.description || 'Kebanggaan dan bukti nyata pengakuan resmi secara nasional oleh Museum Rekor Dunia-Indonesia (MURI) atas dedikasi pelayanan jamaah Umrah & Haji terbanyak & terbaik.'}
          </motion.p>
        </div>

        {/* ── MURI CERTIFICATES GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-14 md:mb-20">
          {muriImages.map((img, idx) => (
            <motion.div
              key={img.id}
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              onClick={() => setSelectedMuriIndex(idx)}
              className="group relative bg-gradient-to-b from-[#122b4d] to-[#0a182c] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-amber-400/35 shadow-2xl hover:border-amber-400 hover:shadow-amber-400/20 transition-all duration-500 cursor-pointer overflow-hidden transform hover:-translate-y-2"
            >
              {/* Top Certificate Image */}
              <div className="relative aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-white/95 p-2 shadow-inner border border-amber-300/30">
                <div className="relative w-full h-full">
                  <Image
                    src={img.imageUrl}
                    alt={img.description}
                    fill
                    className="object-contain transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-1 border border-amber-300">
                  <Medal className="w-3.5 h-3.5 fill-slate-950" /> Rekor MURI
                </div>

                {/* Hover Zoom Icon */}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Certificate Caption */}
              <div className="p-3 sm:p-4 text-center">
                <h3 className="font-headline font-black text-sm sm:text-base text-amber-300 mb-1 group-hover:text-white transition-colors">
                  {img.description || 'Piagam Penghargaan Rekor MURI'}
                </h3>
                <p className="text-[11px] text-slate-300 font-medium">
                  Klik untuk memperbesar & membaca sertifikat resmi
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── NATIONAL ACCREDITATIONS & STATS BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-amber-400/30 shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center"
        >
          <div className="p-3">
            <div className="text-2xl sm:text-4xl font-headline font-black text-amber-400 mb-1">3x</div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Rekor MURI Indonesia</div>
          </div>

          <div className="p-3">
            <div className="text-2xl sm:text-4xl font-headline font-black text-emerald-400 mb-1">200.000+</div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Jamaah Terlayani</div>
          </div>

          <div className="p-3">
            <div className="text-2xl sm:text-4xl font-headline font-black text-amber-400 mb-1">PPIU RI</div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Izin Resmi Kemenag</div>
          </div>

          <div className="p-3">
            <div className="text-2xl sm:text-4xl font-headline font-black text-emerald-400 mb-1">5.0 / 5.0</div>
            <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Kepuasan Jamaah</div>
          </div>
        </motion.div>

      </div>

      {/* ── MURI CERTIFICATE LIGHTBOX MODAL ── */}
      <Dialog open={selectedMuriIndex !== null} onOpenChange={(open) => !open && setSelectedMuriIndex(null)}>
        <DialogContent className="w-screen max-w-none h-screen max-h-none p-0 overflow-hidden border-none bg-black/98 backdrop-blur-2xl rounded-none flex flex-col justify-between select-none">
          
          {/* Top Control Bar */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <DialogHeader className="p-0 m-0">
              <DialogTitle className="text-xs sm:text-sm font-bold text-white/90 flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-black border border-amber-300">
                  {selectedMuriIndex !== null ? `Rekor MURI ${selectedMuriIndex + 1} dari ${muriImages.length}` : ''}
                </span>
              </DialogTitle>
              <DialogDescription className="sr-only">Detail Piagam Rekor MURI Indonesia HD</DialogDescription>
            </DialogHeader>

            <button 
              onClick={() => setSelectedMuriIndex(null)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-all duration-300 shadow-xl border border-white/20"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Tutup</span>
            </button>
          </div>

          {/* Main Swipable Image Container */}
          <div className="relative w-full flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedCertificate && (
                <motion.div
                  key={selectedCertificate.id}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipeThreshold = 50;
                    if (offset.x < -swipeThreshold || velocity.x < -300) {
                      handleNext();
                    } else if (offset.x > swipeThreshold || velocity.x > 300) {
                      handlePrev();
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="relative w-full h-[80vh] sm:h-[85vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
                >
                  <Image
                    src={selectedCertificate.imageUrl}
                    alt={selectedCertificate.description}
                    fill
                    className="object-contain p-2 sm:p-4"
                    priority
                    quality={95}
                  />

                  <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-2xl text-center text-white border border-amber-400/30 shadow-2xl">
                    <span className="text-xs text-amber-400 uppercase font-black tracking-widest block mb-1">
                      {selectedCertificate.description}
                    </span>
                    <p className="text-xs text-slate-200 font-medium">
                      Penghargaan Resmi Museum Rekor Dunia-Indonesia (MURI)
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav Arrows */}
            <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-30">
              <button 
                onClick={handlePrev}
                className="bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-white rounded-full h-11 w-11 sm:h-14 sm:w-14 shadow-2xl pointer-events-auto border border-white/20 flex items-center justify-center transition-all"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
              <button 
                onClick={handleNext}
                className="bg-white/15 hover:bg-amber-400 hover:text-slate-950 text-white rounded-full h-11 w-11 sm:h-14 sm:w-14 shadow-2xl pointer-events-auto border border-white/20 flex items-center justify-center transition-all"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </section>
  );
}
