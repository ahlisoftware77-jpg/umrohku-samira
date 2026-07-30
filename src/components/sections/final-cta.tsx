
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/agents';

interface FinalCtaProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function FinalCta({ agent, data }: FinalCtaProps) {
  const ctaImage = PlaceHolderImages.find(p => p.id === 'cta-bg');
  const imageUrl = data?.bgImage || data?.imageUrl || ctaImage?.imageUrl;
  const titleText = data?.title || "Siap Memulai Perjalanan Suci Anda?";
  const descriptionText = data?.description || "Biarkan kami membantu mewujudkan impian Anda mengunjungi tanah suci dengan bimbingan terbaik, aman, dan penuh keberkahan.";
  const primaryBtnText = data?.primaryBtnText || "Lihat Semua Paket";
  
  const isDefault = agent?.slug?.toLowerCase() === 'default';
  const whatsappNumber = agent?.whatsapp || (isDefault ? '6283815862300' : '');
  const prefix = agent?.slug === 'default' ? '' : `/agent/${agent?.slug}`;

  return (
    <section id="daftar" className="relative py-16 md:py-36 text-white overflow-hidden">
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt="CTA Background"
            fill
            className="object-cover scale-105"
          />
          <div className="absolute inset-0 bg-primary/85 backdrop-blur-[2px]"></div>
        </div>
      )}
      
      <div className="relative container mx-auto text-center z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <h2 className="text-2xl md:text-6xl font-headline font-bold drop-shadow-lg text-white">
            {titleText}
          </h2>
          
          <p className="mt-4 md:mt-6 max-w-2xl mx-auto text-white/90 text-sm md:text-xl font-medium drop-shadow-md px-2">
            {descriptionText}
          </p>
          
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4 md:gap-6 w-full max-w-md mx-auto sm:max-w-none">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-white hover:text-primary h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 w-full sm:w-auto">
              <Link href={`${prefix}/#paket`}>{primaryBtnText}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 h-12 md:h-14 px-8 md:px-10 text-base md:text-lg font-bold rounded-full backdrop-blur-md transition-all hover:border-accent hover:text-accent w-full sm:w-auto">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">Hubungi Konsultan Kami</a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
