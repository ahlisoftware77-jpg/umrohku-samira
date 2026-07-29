
"use client";

import Image from 'next/image';
import { Award, HeartHandshake, Star, Users } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';

const stats = [
  {
    icon: <Users className="h-6 w-6 md:h-10 md:w-10" />,
    value: '12rb+',
    label: 'Jamaah Puas',
  },
  {
    icon: <Star className="h-6 w-6 md:h-10 md:w-10" />,
    value: '4.9',
    label: 'Rating Rata-rata',
  },
  {
    icon: <Award className="h-6 w-6 md:h-10 md:w-10" />,
    value: '50+',
    label: 'Penghargaan',
  },
  {
    icon: <HeartHandshake className="h-6 w-6 md:h-10 md:w-10" />,
    value: '15+',
    label: 'Tahun Pengalaman',
  },
];

export default function WhyChooseUs({ data }: { data?: Record<string, any> }) {
  const bgImage = PlaceHolderImages.find(p => p.id === 'why-choose-us-2');

  return (
    <section id="mengapa" className="relative py-12 md:py-32 overflow-hidden">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-primary/90"></div>
      
      <div className="container mx-auto relative z-10 px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: index * 0.15 }}
              className="text-center p-4 md:p-8 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 hover:bg-white/10 hover:-translate-y-2 flex flex-col items-center gap-2 md:gap-4 group"
            >
              <div className="bg-accent text-accent-foreground p-3 md:p-4 rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="mt-1 md:mt-2">
                <p className="text-2xl md:text-5xl font-bold font-headline text-white">{stat.value}</p>
                <h3 className="text-[10px] md:text-sm font-bold text-accent mt-1 md:mt-2 uppercase tracking-widest">{stat.label}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
