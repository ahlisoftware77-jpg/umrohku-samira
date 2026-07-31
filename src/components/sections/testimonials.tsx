
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Quote, Sparkles, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Agent } from '@/lib/agents';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { TestimonialItem } from '@/types/cms';

interface TestimonialsProps {
  agent?: Agent;
  data?: Record<string, any>;
}

const customerTestimonials = [
  {
    name: 'Hj. Fatmawati',
    city: 'Jakarta',
    quote: 'Pelayanannya sangat profesional, pembimbingnya sabar dan jelas. Ibadah menjadi lebih tenang dan fokus. Hotel sangat dekat masjid.',
    rating: 5
  },
  {
    name: 'Bpk. Triyadi Yanuar',
    city: 'Surabaya',
    quote: 'Sangat memuaskan! Jadwal penerbangan tepat waktu, bus AC eksekutif bersih, dan konsumsi makanan khas Indonesia selalu tersedia.',
    rating: 5
  },
  {
    name: 'Ibu Ira Fransisca',
    city: 'Bandung',
    quote: 'Pengalaman umrah pertama yang sangat berkesan. Semua fasilitas sesuai dengan yang dijanjikan. Terima kasih SAMIRA!',
    rating: 5
  },
];

export default function Testimonials({ agent, data }: TestimonialsProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [dbTestimonials, setDbTestimonials] = useState<TestimonialItem[]>([]);
  const [uploadedOwnerPhoto, setUploadedOwnerPhoto] = useState<string | null>(null);
  const ownerImage = PlaceHolderImages.find(p => p.id === 'owner-photo');

  const badgeText = data?.badgeText || 'Apa Kata Mereka?';
  const title = data?.title || 'Testimoni Jamaah Kami';

  // Fetch submitted testimonials & latest Cloudinary uploaded owner photo for this specific tenantId
  useEffect(() => {
    async function loadTenantTestimonials() {
      const activeTenantId = agent?.tenantId || agent?.slug;
      if (!activeTenantId) return;

      try {
        const qTesti = query(
          collection(db, 'testimonials'),
          where('tenantId', '==', activeTenantId)
        );
        const snap = await getDocs(qTesti);
        const list = snap.docs
          .map(doc => doc.data() as TestimonialItem)
          .filter(t => !t.status || t.status === 'approved');
        setDbTestimonials(list);
      } catch (err) {}

      try {
        const qImg = query(
          collection(db, 'images'),
          where('tenantId', '==', activeTenantId)
        );
        const snapImg = await getDocs(qImg);
        if (!snapImg.empty) {
          const list = snapImg.docs.map(doc => doc.data());
          if (list[0]?.secureUrl) {
            setUploadedOwnerPhoto(list[0].secureUrl);
          }
        }
      } catch (imgErr) {}
    }

    loadTenantTestimonials();
  }, [agent?.tenantId, agent?.slug]);

  const displayOwnerPhoto = 
    data?.ownerPhotoUrl || 
    data?.imageUrl || 
    data?.bgImage || 
    uploadedOwnerPhoto || 
    agent?.photoUrl || 
    ownerImage?.imageUrl || 
    '/images/pp1.jpg';

  // Combine custom editor inputs + db submitted testimonials + default fallback
  const customEditorTestimonials = [];
  if (data?.testi1_name) {
    customEditorTestimonials.push({
      name: data.testi1_name,
      city: data.testi1_role || 'Jamaah Umrah',
      quote: data.testi1_comment || '',
      rating: 5,
      avatarUrl: data.testi1_photo || null,
    });
  }
  if (data?.testi2_name) {
    customEditorTestimonials.push({
      name: data.testi2_name,
      city: data.testi2_role || 'Jamaah Umrah',
      quote: data.testi2_comment || '',
      rating: 5,
      avatarUrl: data.testi2_photo || null,
    });
  }
  if (data?.testi3_name) {
    customEditorTestimonials.push({
      name: data.testi3_name,
      city: data.testi3_role || 'Jamaah Umrah',
      quote: data.testi3_comment || '',
      rating: 5,
      avatarUrl: data.testi3_photo || null,
    });
  }

  const dbFormatted = dbTestimonials.map(t => ({
    name: t.name,
    city: t.role,
    quote: t.comment,
    rating: t.rating || 5,
    avatarUrl: t.avatarUrl || null,
  }));

  const activeTestimonialsList = [
    ...dbFormatted,
    ...customEditorTestimonials,
    ...(dbFormatted.length === 0 && customEditorTestimonials.length === 0 ? customerTestimonials.map(t => ({ ...t, avatarUrl: null })) : [])
  ];

  // Limit landing page carousel to maximum 10 items
  const displayTestimonialsList = activeTestimonialsList.slice(0, 10);
  const hasMoreTestimonials = activeTestimonialsList.length > 10;

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      api.scrollNext();
    }, 5000);

    api.on("select", onSelect);
    
    return () => {
      clearInterval(interval);
    };
  }, [api, onSelect]);

  return (
    <section id="testimoni" className="relative py-16 md:py-32 bg-primary overflow-hidden">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <clipPath id="arch-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0 C0.35,0,0.205,0.08,0.105,0.204 C0.026,0.324,0,0.444,0,0.604 V1 H1 V0.604 C1,0.444,0.974,0.324,0.895,0.204 C0.795,0.08,0.65,0,0.5,0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex flex-col items-center mb-10 lg:mb-0"
          >
            <div className="relative w-full max-w-[240px] md:max-w-[400px] flex flex-col items-center">
              <div className="relative aspect-[4/5] overflow-hidden group w-full">
                <div 
                  className="absolute inset-0 z-10"
                  style={{ clipPath: "url(#arch-clip)" }}
                >
                  <Image
                    src={displayOwnerPhoto}
                    alt={`${data?.ownerName || agent?.name || 'Ira Fransisca'} - Mitra Samira`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 240px, 400px"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent"></div>
                </div>
                
                <svg 
                  viewBox="0 0 400 500" 
                  className="absolute inset-0 w-full h-full pointer-events-none fill-none stroke-accent stroke-[6] md:stroke-[8] z-20"
                  preserveAspectRatio="none"
                >
                  <path d="M200 4C140 4 82 44 42 104C12 164 4 224 4 304V496H396V304C396 224 388 164 358 104C318 44 260 4 200 4Z" />
                </svg>
              </div>
              
              <div className="mt-6 md:mt-10 text-center bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10 w-full">
                <h3 className="text-xl md:text-3xl font-headline font-bold text-accent">{data?.ownerName || agent?.name || 'Triyadi Yanuar'}</h3>
                <p className="text-white/80 text-[10px] md:text-sm tracking-[0.2em] uppercase font-bold mt-2 border-t border-white/10 pt-2 mx-auto inline-block">{data?.ownerTitle || agent?.displayName || 'Mitra Samira Karawang'}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-white w-full max-w-full overflow-hidden"
          >
            <div className="mb-6 md:mb-10 text-center lg:text-left">
              <p className="font-bold text-accent tracking-[0.2em] uppercase text-[9px] md:text-sm mb-2 md:mb-4">{badgeText}</p>
              <h2 className="text-xl md:text-5xl font-headline font-bold text-white mb-3 md:mb-6 leading-tight">
                {title}
              </h2>
            </div>

            <Carousel
              setApi={setApi}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent>
                {displayTestimonialsList.map((testimonial, index) => (
                  <CarouselItem key={index}>
                    <div className="space-y-3 md:space-y-8 p-1">
                      <div className="flex text-accent gap-0.5 md:gap-1 justify-center lg:justify-start">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 md:w-5 md:h-5 fill-current" />
                        ))}
                      </div>

                      <div className="relative">
                        <Quote className="absolute -top-3 md:-top-6 -left-1 md:-left-4 w-6 h-6 md:w-12 md:h-12 text-white/10 rotate-180" />
                        <blockquote className="text-sm md:text-3xl font-body leading-relaxed text-white/90 italic pl-5 md:pl-8">
                          &ldquo;{testimonial.quote}&rdquo;
                        </blockquote>
                      </div>

                      <div className="flex items-center gap-3 justify-center lg:justify-start pt-3 md:pt-6 border-t border-white/10">
                        {/* Avatar photo or initials fallback */}
                        {(testimonial as any).avatarUrl ? (
                          <img
                            src={(testimonial as any).avatarUrl}
                            alt={testimonial.name}
                            className="w-8 h-8 md:w-12 md:h-12 rounded-full object-cover border-2 border-accent/60 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center shrink-0">
                            <span className="text-xs md:text-base font-bold text-accent">
                              {testimonial.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm md:text-xl font-headline text-accent">{testimonial.name}</p>
                          <p className="text-[10px] md:text-sm text-white/50">{testimonial.city}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <div className="flex gap-1.5 mt-6 md:mt-12 justify-center lg:justify-start">
              {displayTestimonialsList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => api?.scrollTo(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${current === idx ? 'w-6 bg-accent' : 'w-1.5 bg-white/20'}`}
                  aria-label={`Lihat testimoni ${idx + 1}`}
                />
              ))}
            </div>

            {/* If testimonials count exceeds 10, show 'Lihat Selengkapnya Testimoni' link */}
            {hasMoreTestimonials && (
              <div className="mt-8 md:mt-10 flex justify-center lg:justify-start">
                <Link
                  href={`/testimoni/${agent?.tenantId || agent?.slug || 'mitra'}?view=all`}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-accent text-accent-foreground font-extrabold text-xs md:text-sm shadow-xl hover:bg-white hover:text-primary transition-all duration-300 transform hover:scale-105"
                >
                  <Sparkles className="h-4 w-4" />
                  Lihat Selengkapnya Testimoni ({activeTestimonialsList.length})
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
