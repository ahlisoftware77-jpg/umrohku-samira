"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Download, Share2, ChevronLeft, ChevronRight, Maximize2, Sparkles, FileText, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/lib/agents';

interface ProductKnowledgeSectionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function ProductKnowledgeSection({ agent, data }: ProductKnowledgeSectionProps) {
  const badgeText = data?.badgeText || 'E-Katalog Resmi 2025/2026';
  const title = data?.title || 'Product Knowledge Samira Travel';
  const description = data?.description || 'Katalog panduan komprehensif mengenai fasilitas layanan, pilihan paket ibadah umrah, akomodasi hotel bintang 5, serta syarat pendaftaran.';
  
  const structureText = data?.structure || `• Hal 01 - 05: Profil Resmi Samira Travel & Legalitas Kemenag
• Hal 06 - 15: Brosur & Spesifikasi Paket Umrah Reguler / VIP
• Hal 16 - 25: Akomodasi Hotel Makkah & Madinah Bintang 5
• Hal 26 - 35: Syarat Pendaftaran, Paspor & Bantuan Visa
• Hal 36 - 47: Program Solusi Pembiayaan Syariah (DP 20%)`;

  const totalPages = data?.totalPages ? parseInt(data.totalPages) : 47;
  const customCatalogUrl = data?.pdfUrl || data?.imageUrl;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);

  // Generate page images or use custom uploaded catalog image/PDF
  const pageImages = customCatalogUrl 
    ? [customCatalogUrl]
    : Array.from({ length: totalPages }, (_, i) => {
        const pageNum = (i + 1).toString().padStart(3, '0');
        return `/images/product/NEW PRODUCT KNOWLEDGE SAMIRA TRAVEL 2025-1_${pageNum} (Medium).jpg`;
      });

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  return (
    <section id="katalog" className="py-24 md:py-32 bg-slate-900 text-white relative overflow-hidden scroll-mt-44 md:scroll-mt-52">
      {/* Glow Effects */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 font-semibold text-xs uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {badgeText}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-headline font-bold text-white tracking-tight mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-300 text-base md:text-lg leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Content Grid: Catalog Flip Viewer & Catalog Structure Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Catalog Page Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-4"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-950/80 shadow-2xl backdrop-blur-md">
              {/* Viewer Top Toolbar */}
              <div className="p-3 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between px-5 text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Halaman <span className="text-amber-300 font-mono text-sm">{currentPage}</span> dari {totalPages}
                </span>

                <div className="flex items-center gap-2">
                  <a
                    href={pageImages[currentPage - 1]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" /> Ukuran Penuh
                  </a>
                </div>
              </div>

              {/* Main Catalog Page Image View */}
              <div className="relative aspect-[3/4] sm:aspect-[4/3] w-full bg-slate-950 flex items-center justify-center p-2 sm:p-4 group">
                <img
                  src={pageImages[currentPage - 1]}
                  alt={`Katalog Halaman ${currentPage}`}
                  className="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-[1.01]"
                />

                {/* Left/Right Navigation Overlay Buttons */}
                <button
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-400 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xl"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-amber-400 hover:text-slate-950 text-white border border-slate-700 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xl"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Viewer Footer Slider / Jump Bar */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className="rounded-xl border-slate-700 text-xs font-bold gap-1 text-slate-200 hover:bg-slate-800"
                  >
                    <ChevronLeft className="w-4 h-4" /> Sebelum
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border-slate-700 text-xs font-bold gap-1 text-slate-200 hover:bg-slate-800"
                  >
                    Lanjut <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Lompat ke:</span>
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                  >
                    {Array.from({ length: totalPages }, (_, idx) => (
                      <option key={idx + 1} value={idx + 1}>
                        Halaman {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Catalog Structure & Details Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Catalog Structure Card */}
            <Card className="rounded-3xl border-slate-800 bg-slate-950/90 text-white shadow-2xl overflow-hidden p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                <FileText className="w-4 h-4" /> Susunan Halaman Katalog
              </div>

              <h3 className="text-xl md:text-2xl font-headline font-bold text-white mb-4">
                Daftar Isi & Struktur E-Katalog
              </h3>

              <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-slate-300 text-xs md:text-sm font-mono whitespace-pre-line leading-relaxed mb-6">
                {structureText}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Informasi resmi terkini fasilitas penerbangan & hotel</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Panduan syarat pendaftaran paspor & administrasi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Tabel simulasi angsuran syariah dari Amitra</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="/product-knowledge"
                  className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-lg transition-all"
                >
                  <BookOpen className="w-4 h-4" /> Buka E-Book Flipbook Full
                </a>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
