"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Maximize2, ChevronLeft, ChevronRight, ImageIcon, Search, Hand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MediaImage } from '@/types/cms';

interface GallerySectionProps {
  agent?: Agent;
  data?: Record<string, any>;
  isFullPage?: boolean;
}

export default function GallerySection({ agent, data, isFullPage = false }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dbGalleryImages, setDbGalleryImages] = useState<string[]>([]);

  // ── Mobile Hardware Back Button Interceptor to Close Lightbox Modal ──
  useEffect(() => {
    if (selectedIndex === null) return;

    const stateId = `gallery_lightbox_${Date.now()}`;
    window.history.pushState({ isGalleryLightbox: true, stateId }, '');

    let closedViaPopstate = false;

    const handlePopState = () => {
      closedViaPopstate = true;
      setSelectedIndex(null);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!closedViaPopstate && window.history.state?.isGalleryLightbox) {
        window.history.back();
      }
    };
  }, [selectedIndex]);

  // Fetch all gallery-category Cloudinary photos for this tenant from Firestore
  useEffect(() => {
    async function loadTenantUploadedImages() {
      const tenantIdKey = agent?.tenantId;
      if (!tenantIdKey) return;

      try {
        const q = query(
          collection(db, 'images'), 
          where('tenantId', '==', tenantIdKey),
          where('category', '==', 'gallery')
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const list = snap.docs.map(d => d.data() as MediaImage);
        
        const getTimestamp = (createdAt: any): number => {
          if (!createdAt) return 0;
          if (typeof createdAt === 'string') return new Date(createdAt).getTime() || 0;
          if (typeof createdAt === 'number') return createdAt;
          if (createdAt.seconds !== undefined) return createdAt.seconds * 1000;
          return 0;
        };
        list.sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt));

        const validUrls = list
          .map(img => img.secureUrl)
          .filter(url => Boolean(url) && url.startsWith('https://') && !url.startsWith('data:'));
          
        if (validUrls.length > 0) {
          setDbGalleryImages(Array.from(new Set(validUrls)));
        }
      } catch (err) {
        console.error('GallerySection: failed to load gallery images from Firestore:', err);
      }
    }

    loadTenantUploadedImages();
  }, [agent?.tenantId]);

  const customSectionImages = useMemo(() => {
    const raw = data?.galleryImages || data?.images || [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((item: any) => {
      if (typeof item === 'string') {
        return item.trim() !== '' && !item.startsWith('data:');
      }
      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return item.url.trim() !== '' && !item.url.startsWith('data:');
      }
      return false;
    });
  }, [data?.galleryImages, data?.images]);
  
  const allImages = useMemo(() => {
    const limit = isFullPage ? 100 : 24;
    if (customSectionImages.length > 0) return customSectionImages.slice(0, limit);
    if (dbGalleryImages.length > 0) return dbGalleryImages.slice(0, limit);
    
    // Default placeholders
    return PlaceHolderImages
      .filter(img => (img.id.startsWith('gallery-') || img.id.startsWith('hero-') || img.id.startsWith('package-')) && img.imageUrl !== "")
      .map(img => img.imageUrl);
  }, [customSectionImages, dbGalleryImages]);

  // Optimize Cloudinary URLs
  const optimizeImageUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_scale,w_1200,q_auto,f_auto/${parts[1]}`;
      }
    }
    return url;
  };

  // Build gallery items with category tags
  const galleryItems = useMemo(() => {
    return allImages.map((item, idx) => {
      const isObject = typeof item !== 'string';
      const rawUrl = isObject ? item.url : item;
      const url = optimizeImageUrl(rawUrl);
      
      let category = isObject && item.category ? item.category : 'kebersamaan';
      let title = isObject && item.title ? item.title : 'Kebersamaan Jamaah';
      let description = isObject && item.description ? item.description : 'Momen indah perjalanan ibadah bersama Samira Travel.';
      
      // Smart categorization fallback
      if (!isObject) {
        if (url.toLowerCase().includes('makkah') || url.toLowerCase().includes('haram') || idx % 3 === 0) {
          category = 'ibadah';
          title = 'Kekhusyukan Ibadah';
        } else if (url.toLowerCase().includes('madinah') || url.toLowerCase().includes('nabawi') || idx % 3 === 1) {
          category = 'ziarah';
          title = 'Ziarah & Perjalanan Religi';
        }
      } else {
        if (!item.category) {
          if (url.toLowerCase().includes('makkah') || url.toLowerCase().includes('haram') || idx % 3 === 0) {
            category = 'ibadah';
          } else if (url.toLowerCase().includes('madinah') || url.toLowerCase().includes('nabawi') || idx % 3 === 1) {
            category = 'ziarah';
          }
        }
        if (!item.title) {
          if (category === 'ibadah') title = 'Kekhusyukan Ibadah';
          else if (category === 'ziarah') title = 'Ziarah & Perjalanan Religi';
          else title = 'Kebersamaan Jamaah';
        }
        if (!item.description) {
          description = 'Momen indah perjalanan ibadah bersama Samira Travel.';
        }
      }
      
      return {
        image: url,
        category,
        title,
        description
      };
    });
  }, [allImages]);

  // Dynamic Categories Generator with Photo Counter Badges
  const categoriesList = useMemo(() => {
    const baseMap: Record<string, { label: string; count: number }> = {
      all: { label: 'Semua Foto', count: galleryItems.length },
      ibadah: { label: 'Momen Ibadah', count: 0 },
      ziarah: { label: 'Ziarah & Religi', count: 0 },
      kebersamaan: { label: 'Kebersamaan Jamaah', count: 0 },
    };

    galleryItems.forEach(item => {
      const catKey = (item.category || 'kebersamaan').toLowerCase();
      if (baseMap[catKey]) {
        baseMap[catKey].count += 1;
      } else {
        const formattedLabel = catKey.charAt(0).toUpperCase() + catKey.slice(1).replace(/-/g, ' ');
        baseMap[catKey] = { label: formattedLabel, count: 1 };
      }
    });

    return Object.keys(baseMap)
      .filter(key => key === 'all' || baseMap[key].count > 0)
      .map(key => ({
        id: key,
        label: baseMap[key].label,
        count: baseMap[key].count
      }));
  }, [galleryItems]);

  // Flexible Filtered Items based on selected category & search query
  const filteredItems = useMemo(() => {
    return galleryItems.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = q === '' || 
        item.title.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [galleryItems, activeCategory, searchQuery]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || filteredItems.length === 0) return;
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null || filteredItems.length === 0) return;
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, filteredItems.length]);

  const selectedImage = selectedIndex !== null ? filteredItems[selectedIndex] ?? null : null;

  return (
    <section id="galeri" className="py-16 md:py-28 bg-white overflow-hidden w-full max-w-full">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="font-semibold text-accent font-headline text-xs md:text-base uppercase tracking-widest mb-2">
            {data?.badgeText || 'Galeri Dokumentasi'}
          </p>
          <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary">
            {data?.title || 'Kenangan Indah di Tanah Suci'}
          </h2>
          <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-xs md:text-base text-muted-foreground">
            {data?.description || 'Kumpulan potret nyata kebahagiaan dan kekhusyukan para jamaah selama menjalankan ibadah Umrah dan Haji bersama Samira Travel.'}
          </p>
        </div>

        {/* Flexible Category Filter Pills & Search Input */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-8 md:mb-12">
          {/* Scrollable Pills for Mobile & Desktop */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none w-full md:w-auto pb-2 md:pb-0 px-1 snap-x max-w-full">
            {categoriesList.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setSelectedIndex(null);
                  }}
                  className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 border whitespace-nowrap shrink-0 snap-start flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 scale-105' 
                      : 'bg-slate-50 text-gray-600 border-gray-200/80 hover:bg-slate-100 hover:text-primary'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-accent text-accent-foreground' : 'bg-gray-200/70 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Flexible Search Filter Input */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari foto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Smooth Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={`${item.image}-${idx}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-slate-100 shadow-xs cursor-pointer group bg-slate-50"
                onClick={() => setSelectedIndex(idx)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Smooth Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 sm:p-5">
                  <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-white/20 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[8px] sm:text-[9px] font-extrabold text-accent uppercase tracking-widest bg-accent/20 px-2 py-0.5 rounded-full border border-accent/30">
                      {categoriesList.find(c => c.id === item.category)?.label || item.category}
                    </span>
                    <h4 className="font-bold text-white text-xs sm:text-base mt-1 sm:mt-2 font-headline leading-tight truncate">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-white/70 mt-0.5 font-light leading-relaxed truncate hidden sm:block">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Tidak ada foto yang cocok dengan pencarian atau kategori ini.</p>
          </div>
        )}
      </div>

      {/* ── ENLARGED FULLSCREEN LIGHTBOX DIALOG WITH SWIPE GESTURE SUPPORT ── */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="w-screen max-w-none h-screen max-h-none p-0 overflow-hidden border-none bg-black/98 backdrop-blur-2xl rounded-none flex flex-col justify-between select-none">
          
          {/* Top Control Bar: Photo Counter, Swipe Hint, Close Button */}
          <div className="absolute top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
            <DialogHeader className="p-0 m-0">
              <DialogTitle className="text-xs sm:text-sm font-bold text-white/90 flex items-center gap-2">
                <span className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-extrabold border border-accent/30">
                  {selectedIndex !== null ? `${selectedIndex + 1} / ${filteredItems.length}` : ''}
                </span>
                <span className="hidden sm:inline text-white/60 text-xs">· Swipe ⬅️ ➡️ untuk melihat foto lain</span>
              </DialogTitle>
              <DialogDescription className="sr-only">Tampilan Foto Dokumentasi HD Resolusi Penuh</DialogDescription>
            </DialogHeader>

            <button 
              onClick={() => setSelectedIndex(null)}
              className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-all duration-300 shadow-xl border border-white/20"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Tutup</span>
            </button>
          </div>

          {/* Main Swipable Image Preview Container */}
          <div className="relative w-full flex-1 flex items-center justify-center p-1 sm:p-4 overflow-hidden">
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.div
                  key={selectedImage.image}
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
                  className="relative w-full h-[80vh] sm:h-[84vh] md:h-[88vh] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
                >
                  <Image
                    src={selectedImage.image}
                    alt={selectedImage.title}
                    fill
                    className="object-contain p-1 sm:p-3 md:p-6"
                    priority
                    quality={95}
                  />

                  {/* Photo Caption Overlay at Bottom */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-6 sm:right-6 bg-black/75 backdrop-blur-md p-3 sm:p-5 rounded-2xl text-center text-white border border-white/10 shadow-2xl pointer-events-none">
                    <span className="text-[10px] sm:text-xs text-accent uppercase font-extrabold tracking-widest block mb-0.5">
                      {selectedImage.title}
                    </span>
                    <p className="text-[11px] sm:text-xs md:text-sm text-white/90 font-light leading-relaxed max-w-2xl mx-auto line-clamp-2">
                      {selectedImage.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left and Right Nav Floating Buttons (Desktop & Touch) */}
            <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-6 pointer-events-none z-30">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrev}
                className="bg-white/15 hover:bg-accent hover:text-accent-foreground text-white rounded-full h-11 w-11 sm:h-14 sm:w-14 md:h-16 md:w-16 shadow-2xl pointer-events-auto border border-white/20 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext}
                className="bg-white/15 hover:bg-accent hover:text-accent-foreground text-white rounded-full h-10 w-10 sm:h-14 sm:w-14 md:h-16 md:w-16 shadow-2xl pointer-events-auto border border-white/20 transition-all hover:scale-110 active:scale-95"
              >
                <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10" />
                <span className="sr-only">Selanjutnya</span>
              </Button>
            </div>
          </div>

          {/* Bottom Mobile Swipe Hint Bar */}
          <div className="sm:hidden pb-3 text-center text-white/50 text-[10px] flex items-center justify-center gap-1">
            <Hand className="w-3 h-3 animate-pulse" />
            <span>Usap (Swipe) foto ke kiri / kanan untuk mengganti foto</span>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
