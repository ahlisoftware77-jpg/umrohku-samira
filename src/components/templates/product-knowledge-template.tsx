
"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  BookOpen,
  Download,
  Share2,
  Search,
  ZoomIn,
  ZoomOut,
  Grid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/agents';

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { 
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full aspect-[16/9] bg-muted rounded-xl animate-pulse">
      <div className="text-center">
        <BookOpen className="w-16 h-16 text-primary/20 mx-auto mb-4" />
        <p className="text-muted-foreground font-bold text-xl">Menyiapkan Katalog Interaktif...</p>
      </div>
    </div>
  )
});

interface ProductKnowledgeTemplateProps {
  agent: Agent;
}

export default function ProductKnowledgeTemplate({ agent }: ProductKnowledgeTemplateProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bookRef = useRef<any>(null);
  const fullContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      
      if (bookRef.current) {
        setTimeout(() => {
          bookRef.current.pageFlip()?.update();
        }, 100);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const totalPages = 47;
  const pageImages = Array.from({ length: totalPages }, (_, i) => {
    const pageNum = (i + 1).toString().padStart(3, '0');
    return `/images/product/NEW PRODUCT KNOWLEDGE SAMIRA TRAVEL 2025-1_${pageNum} (Medium).jpg`;
  });

  const onPage = (e: any) => {
    setCurrentPage(e.data);
  };

  const nextPrevPage = (direction: 'next' | 'prev') => {
    if (bookRef.current) {
      if (direction === 'next') {
        bookRef.current.pageFlip().flipNext();
      } else {
        bookRef.current.pageFlip().flipPrev();
      }
    }
  };

  const toggleFullscreen = () => {
    if (!fullContainerRef.current) return;
    if (!document.fullscreenElement) {
      fullContainerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#e8f1f2]">
      <Header agent={agent} />
      
      <main className="flex-1 pt-44 md:pt-52 pb-16">
        <div className="w-full max-w-[1600px] mx-auto px-4">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-headline font-bold text-primary">Product Knowledge Samira Travel 2025</h1>
              <p className="text-xs text-muted-foreground">Katalog Lengkap Panduan Layanan & Fasilitas</p>
            </div>
            <div className="flex items-center gap-2">
              {agent.pdfUrl ? (
                <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white">
                  <a href={agent.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                    <Download className="w-4 h-4" /> Download PDF
                  </a>
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white opacity-60" onClick={() => alert('PDF Katalog belum diunggah oleh admin mitra.')}>
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'Katalog Samira Travel',
                      text: `Lihat Product Knowledge Samira Travel dari mitra kami ${agent.displayName}.`,
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tautan halaman berhasil disalin ke papan klip!');
                  }
                }}
              >
                <Share2 className="w-4 h-4" /> Bagikan
              </Button>
            </div>
          </div>

          <div className="relative group w-full" ref={fullContainerRef}>
            <div className={cn(
              "bg-[#5c6d70] p-1 md:p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border-[#cad5d6] transition-all flex flex-col",
              isFullscreen 
                ? "fixed inset-0 z-[100] border-0 rounded-none bg-[#1a1a1a] w-screen h-screen" 
                : "rounded-xl border-[12px] w-full"
            )}>
              <div className={cn(
                "relative bg-[#1a1a1a] overflow-hidden rounded-lg flex justify-center items-center py-2 md:py-4 flex-1",
                isFullscreen ? "h-full" : "min-h-[400px]"
              )}>
                <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-black/40 z-30 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.8)]"></div>
                
                {isMounted && (
                  <HTMLFlipBook
                    width={1000} 
                    height={1414} 
                    size="stretch"
                    minWidth={300}
                    maxWidth={1500}
                    minHeight={424}
                    maxHeight={2121}
                    maxShadowOpacity={0.7}
                    showCover={true}
                    mobileScrollSupport={true}
                    onFlip={onPage}
                    ref={bookRef}
                    className="samira-professional-book"
                    style={{ backgroundColor: 'transparent' }}
                    startPage={0}
                    drawShadow={true}
                    flippingTime={1000}
                    usePortrait={false}
                    startZIndex={0}
                    autoSize={true}
                    clickEventForward={true}
                    useMouseEvents={true}
                    swipeDistance={30}
                    showPageCorners={true}
                    disableFlipByClick={false}
                  >
                    {pageImages.map((image, index) => (
                      <div key={index} className="page bg-white relative shadow-2xl">
                        <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={`Halaman ${index + 1}`}
                            fill
                            className="object-contain"
                            priority={index < 4}
                            unoptimized
                          />
                        </div>
                        <div className={cn(
                          "absolute bottom-4 text-[10px] font-bold text-muted-foreground/50 px-2",
                          index % 2 === 0 ? "right-4" : "left-4"
                        )}>
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </HTMLFlipBook>
                )}

                <button 
                  onClick={() => nextPrevPage('prev')}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all disabled:opacity-0"
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={() => nextPrevPage('next')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-40 p-3 rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-all disabled:opacity-0"
                  disabled={currentPage === totalPages - 1}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              <div className="bg-[#2a2a2a] text-white px-4 py-3 flex items-center justify-between rounded-b-lg border-t border-white/5 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold tracking-widest text-white/60 uppercase">Halaman</span>
                  <div className="bg-black/40 px-3 py-1 rounded text-sm font-mono font-bold border border-white/10">
                    {currentPage === 0 ? "1" : (currentPage % 2 === 0 ? `${currentPage}-${currentPage + 1}` : `${currentPage + 1}`)} / {totalPages}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8">
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/70 hover:text-white hover:bg-white/10 h-8 w-8"
                    onClick={toggleFullscreen}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button asChild className="rounded-full bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold px-10 h-14 shadow-xl">
              <a href={`https://wa.me/${agent.whatsapp}`} target="_blank" rel="noopener noreferrer">
                Konsultasi Pendaftaran Melalui WhatsApp
              </a>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">Hubungi kami jika ada bagian katalog yang ingin Anda tanyakan lebih lanjut.</p>
          </div>
        </div>
      </main>

      <Footer agent={agent} />
    </div>
  );
}
