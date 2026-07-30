
"use client";

import { FileCheck, MessageSquareQuote, Plane, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <FileCheck className="h-10 w-10 md:h-12 md:w-12 text-accent" />,
    title: "Pilih Paket",
    description: "Lihat paket kami dan pilih yang paling sesuai untuk Anda.",
  },
  {
    icon: <MessageSquareQuote className="h-10 w-10 md:h-12 md:w-12 text-accent" />,
    title: "Minta Penawaran",
    description: "Hubungi tim kami untuk konsultasi dan mendaftar paket pilihan Anda.",
  },
  {
    icon: <UserCheck className="h-10 w-10 md:h-12 md:w-12 text-accent" />,
    title: "Konfirmasi",
    description: "Ikuti bimbingan manasik untuk persiapan ibadah yang matang.",
  },
  {
    icon: <Plane className="h-10 w-10 md:h-12 md:w-12 text-accent" />,
    title: "Keberangkatan",
    description: "Berangkat ke Tanah Suci sesuai jadwal yang telah ditentukan.",
  },
];

export default function RegistrationFlow({ data }: { data?: Record<string, any> }) {
  return (
    <section id="alur" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="text-center mb-12"
        >
          <p className="font-semibold text-accent font-headline text-sm md:text-base tracking-widest uppercase mb-2">{data?.badgeText || 'Cara Kerja'}</p>
          
          <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary tracking-tight">
            {data?.title || 'Proses Pendaftaran Mudah'}
          </h2>

          <p className="mt-4 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground">
            {data?.description || 'Sederhana, cepat, dan transparan dalam 4 langkah mudah.'}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 max-w-4xl mx-auto mt-12 md:mt-16">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: index * 0.15 }}
              className="flex flex-col items-center text-center p-2 group"
            >
              <div className="flex-shrink-0 w-24 h-24 md:w-28 md:h-28 flex items-center justify-center bg-[#f0f6fc] dark:bg-slate-800 rounded-full group-hover:scale-105 transition-transform duration-300">
                {step.icon}
              </div>
              <h3 className="font-bold font-headline text-xl md:text-2xl text-primary mt-6">{step.title}</h3>
              <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed max-w-xs md:max-w-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
