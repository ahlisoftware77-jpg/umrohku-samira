"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Maximize2, ChevronLeft, ChevronRight, ImageIcon, Camera, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MediaImage } from '@/types/cms';

interface GallerySectionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

const CATEGORIES = [
  { id: 'all', label: 'Semua Foto' },
  { id: 'ibadah', label: 'Momen Ibadah' },
  { id: 'ziarah', label: 'Ziarah & Perjalanan' },
  { id: 'kebersamaan', label: 'Kebersamaan Jamaah' }
];

export default function GallerySection({ agent, data }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dbGalleryImages, setDbGalleryImages] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    return raw.filter((url: any) => typeof url === 'string' && url.trim() !== '' && !url.startsWith('data:'));
  }, [data?.galleryImages, data?.images]);
  
  const allImages = useMemo(() => {
    if (customSectionImages.length > 0) return customSectionImages.slice(0, 24);
    if (dbGalleryImages.length > 0) return dbGalleryImages.slice(0, 24);
    
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
        return `${parts[0]}/upload/c_scale,w_800,q_auto,f_auto/${parts[1]}`;
      }
    }
    return url;
  };

  // Build gallery items with category tags
  const galleryItems = useMemo(() => {
    return allImages.map((imgUrl, idx) => {
      const url = optimizeImageUrl(imgUrl);
      let category = 'kebersamaan';
      let title = 'Kebersamaan Jamaah';
      
      // Smart categorization
      if (url.toLowerCase().includes('makkah') || url.toLowerCase().includes('haram') || idx % 3 === 0) {
        category = 'ibadah';
        title = 'Kekhusyukan Ibadah';
      } else if (url.toLowerCase().includes('madinah') || url.toLowerCase().includes('nabawi') || idx % 3 === 1) {
        category = 'ziarah';
        title = 'Ziarah & Perjalanan Religi';
      }
      
      return {
        image: url,
        category,
        title,
        description: `Momen indah perjalanan ibadah bersama Samira Travel.`
      };
    });
  }, [allImages]);

  // Filtered Items based on selected category
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return galleryItems;
    return galleryItems.filter(item => item.category === activeCategory);
  }, [galleryItems, activeCategory]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredItems.length : 0));
  };

  const selectedImage = selectedIndex !== null ? filteredItems[selectedIndex] ?? null : null;

  return (
    <section id="galeri" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-semibold text-accent font-headline text-sm md:text-base uppercase tracking-widest mb-3">
            {data?.badgeText || 'Galeri Dokumentasi'}
          </p>
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary">
            {data?.title || 'Kenangan Indah di Tanah Suci'}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            {data?.description || 'Kumpulan potret nyata kebahagiaan dan kekhusyukan para jamaah selama menjalankan ibadah Umrah dan Haji bersama Samira Travel.'}
          </p>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2.5 md:gap-3 mb-12">
          {CATEGORIES.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id);
                  setSelectedIndex(null);
                }}
                className={`relative px-5 py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-300 border ${
                  isActive 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/10' 
                    : 'bg-slate-50 text-muted-foreground border-slate-200/60 hover:bg-slate-100 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Smooth Grid Layout */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                layout
                key={item.image}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group bg-slate-50"
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Smooth Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/20 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Maximize2 className="w-4 h-4 text-white" />
                  </div>
                  
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[9px] font-extrabold text-accent uppercase tracking-widest bg-accent/20 px-2 py-0.5 rounded-full border border-accent/30">
                      {CATEGORIES.find(c => c.id === item.category)?.label}
                    </span>
                    <h4 className="font-bold text-white text-base mt-2 font-headline leading-tight">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-white/70 mt-1 font-light leading-relaxed truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
            <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm font-medium">Belum ada foto dalam kategori ini.</p>
          </div>
        )}
      </div>

      {/* Lightbox Slider Dialog with Spring transitions */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[85vw] p-0 overflow-hidden border-none bg-black/95 backdrop-blur-xl">
          <DialogHeader className="absolute top-4 right-4 z-50">
             <DialogTitle className="sr-only">Detail Foto Dokumentasi</DialogTitle>
             <DialogDescription className="sr-only">
               Menampilkan foto dokumentasi dalam mode resolusi penuh dengan navigasi untuk melihat gambar lainnya.
             </DialogDescription>
             <button 
              onClick={() => setSelectedIndex(null)}
              className="p-2.5 rounded-full bg-white/10 text-white hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-xl border border-white/20"
             >
               <X className="w-6 h-6" />
               <span className="sr-only">Tutup</span>
             </button>
          </DialogHeader>
          
          <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center p-4 md:p-8">
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.div
                  key={selectedImage.image}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 180 }}
                  className="relative w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedImage.image}
                      alt={selectedImage.title}
                      fill
                      className="object-contain"
                      priority
                      quality={95}
                    />
                  </div>
                  
                  {/* Photo details caption */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-center text-white">
                    <span className="text-[10px] text-accent uppercase font-bold tracking-widest">
                      {selectedImage.title}
                    </span>
                    <p className="text-xs md:text-sm text-white/80 mt-1 max-w-xl mx-auto font-light leading-relaxed">
                      {selectedImage.description}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Left and Right Nav Buttons */}
            <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handlePrev}
                className="bg-white/10 hover:bg-accent hover:text-accent-foreground text-white rounded-full h-12 w-12 md:h-16 md:w-16 shadow-2xl pointer-events-auto border border-white/10"
              >
                <ChevronLeft className="h-8 w-8 md:h-10 md:w-10" />
                <span className="sr-only">Sebelumnya</span>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNext}
                className="bg-white/10 hover:bg-accent hover:text-accent-foreground text-white rounded-full h-12 w-12 md:h-16 md:w-16 shadow-2xl pointer-events-auto border border-white/10"
              >
                <ChevronRight className="h-8 w-8 md:h-10 md:w-10" />
                <span className="sr-only">Selanjutnya</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
