
"use client";

import * as React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BadgeCheck, Building2, UsersRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <BadgeCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
    title: "Agen Perjalanan Terpercaya",
    description: "Kami terdaftar secara resmi di Kementerian Agama Republik Indonesia, memberikan jaminan keamanan ibadah Anda."
  },
  {
    icon: <Building2 className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
    title: "Hotel Nyaman",
    description: "Akomodasi hotel strategis di dekat masjid, memudahkan Anda untuk beribadah setiap waktu."
  },
  {
    icon: <UsersRound className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
    title: "Pemandu Berpengalaman",
    description: "Dibimbing oleh ustadz bersertifikat, memastikan ibadah Anda sesuai dengan tuntunan syariah."
  }
];

const aboutImages = [
  { src: '/images/b1.jpeg', alt: 'Dokumentasi Samira 1' },
  { src: '/images/b2.jpeg', alt: 'Dokumentasi Samira 2' }
];

export default function AboutUs({ data }: { data?: Record<string, any> }) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isMounted, setIsMounted] = React.useState(false);

  const badgeText = data?.badgeText || "Tentang Kami";
  const titleText = data?.title || "Pilihan Terbaik untuk Perjalanan Spiritual Anda";
  const descriptionText = data?.description || "Kami adalah biro perjalanan Umrah dan Haji yang berkomitmen memberikan layanan terbaik, aman, dan sesuai syariah.";

  const defaultFeatures = [
    {
      icon: <BadgeCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
      title: "Agen Perjalanan Terpercaya",
      description: "Kami terdaftar secara resmi di Kementerian Agama Republik Indonesia, memberikan jaminan keamanan ibadah Anda."
    },
    {
      icon: <Building2 className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
      title: "Hotel Nyaman",
      description: "Akomodasi hotel strategis di dekat masjid, memudahkan Anda untuk beribadah setiap waktu."
    },
    {
      icon: <UsersRound className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
      title: "Pemandu Berpengalaman",
      description: "Dibimbing oleh ustadz bersertifikat, memastikan ibadah Anda sesuai dengan tuntunan syariah."
    }
  ];

  const features = data?.features && Array.isArray(data.features)
    ? data.features.map((f: any, idx: number) => ({
        icon: idx === 0 ? <BadgeCheck className="h-5 w-5 md:h-6 md:w-6 text-accent" /> :
              idx === 1 ? <Building2 className="h-5 w-5 md:h-6 md:w-6 text-accent" /> :
              <UsersRound className="h-5 w-5 md:h-6 md:w-6 text-accent" />,
        title: f.title,
        description: f.description
      }))
    : defaultFeatures;

  const defaultImages = [
    { src: '/images/b1.jpeg', alt: 'Dokumentasi Samira 1' },
    { src: '/images/b2.jpeg', alt: 'Dokumentasi Samira 2' }
  ];

  const rawImages: string[] = Array.isArray(data?.images) && data.images.length > 0
    ? data.images
    : (data?.imageUrl ? [data.imageUrl] : []);

  const aboutImages = rawImages.length > 0
    ? rawImages.map((src: string, idx: number) => ({ src, alt: `Dokumentasi ${idx + 1}` }))
    : defaultImages;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % aboutImages.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + aboutImages.length) % aboutImages.length);
  };

  return (
    <section id="tentang" className="py-12 lg:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative order-2 md:order-1"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl group bg-white border-8 border-white">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <img
                    src={aboutImages[activeIndex].src}
                    alt={aboutImages[activeIndex].alt}
                    className="w-full h-auto block object-contain rounded-[1.8rem]"
                  />
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePrev}
                  className="bg-white/90 hover:bg-accent hover:text-accent-foreground text-primary rounded-full h-10 w-10 md:h-12 md:w-12 shadow-xl pointer-events-auto"
                >
                  <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNext}
                  className="bg-white/90 hover:bg-accent hover:text-accent-foreground text-primary rounded-full h-10 w-10 md:h-12 md:w-12 shadow-xl pointer-events-auto"
                >
                  <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                </Button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {aboutImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => {
                      setDirection(idx > activeIndex ? 1 : -1);
                      setActiveIndex(idx);
                    }}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      activeIndex === idx ? "w-6 bg-accent" : "w-1.5 bg-primary/20"
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-center md:text-left order-1 md:order-2"
          >
            <p className="font-semibold text-accent font-headline text-sm md:text-base uppercase tracking-widest">{badgeText}</p>
            <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary mt-2">
              {titleText}
            </h2>
            <p className="mt-6 text-sm md:text-lg text-muted-foreground leading-relaxed">
              {descriptionText}
            </p>
            
            <div className="w-full mt-8">
              {isMounted ? (
                <Accordion type="single" collapsible defaultValue="item-0">
                  {features.map((feature, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-primary/10">
                      <AccordionTrigger className="font-headline text-lg md:text-xl text-primary hover:no-underline py-5">
                        <div className="flex items-center gap-4 text-left">
                          <div className="bg-muted p-2 rounded-lg">{feature.icon}</div>
                          <span>{feature.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-sm md:text-base text-muted-foreground pl-14 text-left leading-relaxed">
                        {feature.description}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="space-y-4">
                  {features.map((feature, index) => (
                    <div key={index} className="border-b border-primary/10 py-5 flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-lg opacity-50">{feature.icon}</div>
                      <div className="h-6 w-48 bg-muted animate-pulse rounded"></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
