"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import SplitText from '@/components/ui/split-text';

export default function HeroSection({ data }: { data?: Record<string, any> }) {
  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  
  const badgeText = data?.badgeText || "Biro Perjalanan Haji & Umrah Terpercaya";
  const titleText = data?.title || "Mulailah Perjalanan Suci Anda Bersama SAMIRA";
  const descriptionText = data?.description || "Rasakan pengalaman ibadah yang lancar dan memperkaya spiritual dengan bimbingan ustadz ahli, akomodasi bintang 5, dan pelayanan sepenuh hati.";
  const primaryBtnText = data?.primaryBtnText || "Jelajahi Paket";
  const primaryBtnUrl = data?.primaryBtnUrl || "#paket";
  const secondaryBtnText = data?.secondaryBtnText || "Tentang Kami";
  const secondaryBtnUrl = data?.secondaryBtnUrl || "#tentang";

  const transitionEffect = data?.transitionEffect || 'zoom'; // 'fade' | 'zoom' | 'slide' | 'flip' | 'blur'

  const heroImage1 = PlaceHolderImages.find(p => p.id === 'hero-masjidil-haram-1');
  const heroImage2 = PlaceHolderImages.find(p => p.id === 'hero-masjidil-haram-2');
  const defaultImages = [heroImage1, heroImage2].filter((img): img is NonNullable<typeof img> => img !== undefined);

  // Support up to 5 background images
  const imageList: string[] = [];
  if (data?.images && Array.isArray(data.images) && data.images.length > 0) {
    imageList.push(...data.images.filter(Boolean));
  } else {
    [data?.bgImage, data?.bgImage1, data?.bgImage2, data?.bgImage3, data?.bgImage4, data?.bgImage5]
      .filter(Boolean)
      .forEach(url => {
        if (url && typeof url === 'string' && !imageList.includes(url)) {
          imageList.push(url);
        }
      });
  }

  const images = imageList.length > 0
    ? imageList.map((url, idx) => ({ id: String(idx), imageUrl: url, description: `Hero Slide ${idx + 1}`, imageHint: 'hero-image' }))
    : defaultImages;

  React.useEffect(() => {
    if (images.length < 2) return;
    const interval = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Framer Motion Animation Variants based on selected effect
  const getVariants = () => {
    switch (transitionEffect) {
      case 'slide':
        return {
          initial: { opacity: 0, x: '100%' },
          animate: { opacity: 1, x: '0%' },
          exit: { opacity: 0, x: '-100%' }
        };
      case 'flip':
        return {
          initial: { opacity: 0, rotateY: 45, scale: 0.98 },
          animate: { opacity: 1, rotateY: 0, scale: 1 },
          exit: { opacity: 0, rotateY: -45, scale: 0.98 }
        };
      case 'blur':
        return {
          initial: { opacity: 0, filter: 'blur(12px)' },
          animate: { opacity: 1, filter: 'blur(0px)' },
          exit: { opacity: 0, filter: 'blur(12px)' }
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 }
        };
      case 'zoom':
      default:
        return {
          initial: { opacity: 0, scale: 1.1 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 }
        };
    }
  };

  const variants = getVariants();
  const prevImageIndex = (activeImageIndex - 1 + images.length) % images.length;

  return (
    <section className="relative min-h-[100dvh] w-full flex items-center justify-center text-white overflow-hidden bg-[#061222] pt-20 pb-10">
      <div className="absolute inset-0 z-0 bg-[#061222]">
        {images.length > 0 ? (
          <>
            {/* Base Layer: Keeps previous image active underneath to eliminate any white background flash */}
            <div className="absolute inset-0 z-0">
              <Image
                src={images[prevImageIndex]?.imageUrl || images[0]?.imageUrl || ''}
                alt="Base Background"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            {/* Active Layer: Smooth cross-fade / transition animation on top */}
            <AnimatePresence initial={false}>
              <motion.div 
                key={activeImageIndex}
                initial={variants.initial}
                animate={variants.animate}
                exit={variants.exit}
                transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 z-10"
              >
                <Image
                  src={images[activeImageIndex]?.imageUrl || ''}
                  alt={images[activeImageIndex]?.description || 'Hero Image'}
                  fill
                  className={cn(
                    "object-cover",
                    transitionEffect === 'zoom' && "animate-zoom-slow"
                  )}
                  priority={activeImageIndex === 0}
                  data-ai-hint={images[activeImageIndex]?.imageHint}
                  sizes="100vw"
                />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <div className="absolute inset-0 bg-[#061222] flex items-center justify-center">
            <p className="text-white/50 font-bold">Memuat Gambar Hero...</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c223d]/80 via-[#061222]/40 to-[#05101d]/90 z-20 pointer-events-none"></div>
      </div>
      
      <div className="relative z-20 container mx-auto text-center flex flex-col justify-center items-center px-4 md:px-6">
        <div className="bg-accent/90 border border-white/20 text-accent-foreground font-bold rounded-full px-4 py-1.5 md:px-6 md:py-2 inline-block mx-auto text-xs md:text-sm mb-4 md:mb-6 shadow-2xl backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          {badgeText}
        </div>
        
        <SplitText
          tag="h1"
          text={titleText}
          className="font-headline text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold !leading-tight tracking-tight drop-shadow-2xl text-white"
          delay={40}
          duration={1.5}
          ease="power4.out"
          splitType="chars"
          from={{ opacity: 0, y: 50, rotateX: -90 }}
          to={{ opacity: 1, y: 0, rotateX: 0 }}
          textAlign="center"
        />
        
        <div className="mt-4 md:mt-8 max-w-3xl mx-auto px-2">
          <SplitText
            text={descriptionText}
            className="text-sm sm:text-base md:text-xl text-white/90 drop-shadow-lg font-medium"
            delay={30}
            duration={1}
            splitType="words"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
          />
        </div>

        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700 w-full sm:w-auto">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-white hover:text-primary h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 border-none w-full sm:w-auto">
                <Link href={primaryBtnUrl}>{primaryBtnText}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10 h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold rounded-full backdrop-blur-md transition-all hover:border-accent hover:text-accent border-2 w-full sm:w-auto">
                <Link href={secondaryBtnUrl}>{secondaryBtnText}</Link>
            </Button>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              className={cn(
                "h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer",
                activeImageIndex === idx ? "w-6 md:w-8 bg-accent" : "w-2 md:w-2.5 bg-white/50 hover:bg-white"
              )}
              aria-label={`Buka slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
