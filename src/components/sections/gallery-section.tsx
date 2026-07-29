"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import CircularGallery from '@/components/ui/circular-gallery';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Maximize2, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { MediaImage } from '@/types/cms';

interface GallerySectionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function GallerySection({ agent, data }: GallerySectionProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [dbGalleryImages, setDbGalleryImages] = useState<string[]>([]);

  // Fetch all gallery-category Cloudinary photos for this tenant from Firestore images collection
  useEffect(() => {
    async function loadTenantUploadedImages() {
      const tenantIdKey = agent?.tenantId;
      if (!tenantIdKey) return;

      try {
        // ONLY fetch images explicitly categorized as 'gallery' to avoid showing package/pricing images
        const q = query(
          collection(db, 'images'), 
          where('tenantId', '==', tenantIdKey),
          where('category', '==', 'gallery')
        );
        const snap = await getDocs(q);
        if (snap.empty) return;

        const list = snap.docs.map(d => d.data() as MediaImage);
        
        // Safe sort: createdAt can be Firestore Timestamp object OR ISO string
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

  // Priority logic:
  // 1. data.galleryImages (set by editor, saved to Firestore contents)
  // 2. dbGalleryImages (images uploaded with category='gallery' for this tenant)
  // 3. Placeholder images (default local images)
  const customSectionImages = useMemo(() => {
    const raw = data?.galleryImages || data?.images || [];
    if (!Array.isArray(raw)) return [];
    return raw.filter((url: any) => typeof url === 'string' && url.trim() !== '' && !url.startsWith('data:'));
  }, [data?.galleryImages, data?.images]);
  
  const allImages = useMemo(() => {
    // Priority 1: editor-configured gallery images
    if (customSectionImages.length > 0) {
      console.log(`[GallerySection ${agent?.slug || 'unknown'}] Using customSectionImages:`, customSectionImages);
      return customSectionImages.slice(0, 20);
    }
    // Priority 2: Cloudinary gallery uploads
    if (dbGalleryImages.length > 0) {
      console.log(`[GallerySection ${agent?.slug || 'unknown'}] Using dbGalleryImages:`, dbGalleryImages);
      return dbGalleryImages.slice(0, 20);
    }
    console.log(`[GallerySection ${agent?.slug || 'unknown'}] Using placeholders`);
    return [];
  }, [customSectionImages, dbGalleryImages, agent?.slug]);

  useEffect(() => {
    console.log(`[GallerySection ${agent?.slug || 'unknown'}] Data prop:`, data);
    console.log(`[GallerySection ${agent?.slug || 'unknown'}] agent.tenantId:`, agent?.tenantId);
  }, [data, agent?.tenantId, agent?.slug]);


  // Optimize Cloudinary URLs on the fly for fast CDN delivery and smaller footprint
  const optimizeImageUrl = (url: string) => {
    if (!url) return '';
    // If it's a Cloudinary URL, inject resize & compression transformations (width=800, auto format, auto quality)
    if (url.includes('res.cloudinary.com')) {
      const parts = url.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_scale,w_800,q_auto,f_auto/${parts[1]}`;
      }
    }
    return url;
  };

  const galleryItems = useMemo(() => {
    return allImages.length > 0
      ? allImages.map(imgUrl => ({
          image: optimizeImageUrl(imgUrl),
          text: ""
        }))
      : PlaceHolderImages
          .filter(img => img.id.startsWith('gallery-') && img.imageUrl !== "")
          .map(img => ({
            image: img.imageUrl,
            text: ""
          }));
  }, [allImages]);

  // Reset preview modal index whenever gallery items change
  useEffect(() => {
    setSelectedIndex(null);
  }, [allImages.length]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null ? (prev - 1 + galleryItems.length) % galleryItems.length : 0));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev !== null ? (prev + 1) % galleryItems.length : 0));
  };

  const handleItemClick = (item: { image: string; text: string }) => {
    const index = galleryItems.findIndex(i => i.image === item.image);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  };

  const selectedImage = selectedIndex !== null ? galleryItems[selectedIndex] ?? null : null;

  return (
    <section id="galeri" className="py-12 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="text-center mb-8 md:mb-16"
        >
          <p className="font-semibold text-accent font-headline text-sm md:text-base uppercase tracking-widest">
            {data?.badgeText || 'Galeri Dokumentasi'}
          </p>
          
          <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary mt-2">
            {data?.title || 'Kenangan Indah di Tanah Suci'}
          </h2>

          <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
            {data?.description || (
              <>
                {agent?.slug !== 'default' && <span>Dokumentasi perjalanan bersama {agent?.name}. </span>}
                Geser galeri melingkar di bawah untuk melihat momen-momen khusyuk. Klik pada foto untuk melihat dalam ukuran penuh.
              </>
            )}
          </p>
        </motion.div>
        
        {/* 3D Circular WebGL Gallery */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="relative h-[450px] md:h-[650px] w-full bg-primary/5 rounded-2xl md:rounded-[2rem] overflow-hidden border border-primary/10 shadow-2xl"
        >
          {galleryItems.length > 0 ? (
            <CircularGallery 
              items={galleryItems} 
              bend={0}
              textColor="transparent"
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
              onItemClick={handleItemClick}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Memuat foto dokumentasi...
            </div>
          )}
          
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none"></div>
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-t-t from-background to-transparent pointer-events-none"></div>
          
          <div className="absolute bottom-6 right-6 hidden md:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-primary text-xs font-bold animate-pulse pointer-events-none">
            <Maximize2 className="w-3 h-3" /> Klik Foto untuk Zoom
          </div>
        </motion.div>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] p-0 overflow-hidden border-none bg-black/95 backdrop-blur-xl">
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
          
          <div className="relative w-full h-[70vh] md:h-[85vh] flex items-center justify-center p-4 md:p-8">
            <AnimatePresence mode="wait">
              {selectedImage && (
                <motion.div
                  key={selectedImage.image}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 30, stiffness: 200 }}
                  className="relative w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedImage.image}
                      alt="Dokumentasi Samira"
                      fill
                      className="object-contain"
                      priority
                      quality={90}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

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
