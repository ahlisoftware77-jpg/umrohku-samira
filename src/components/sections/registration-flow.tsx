
"use client";

import { FileCheck, MessageSquareQuote, Plane, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <FileCheck className="h-8 w-8 md:h-10 md:w-10 text-accent" />,
    title: "Pilih Paket",
    description: "Lihat paket kami dan pilih yang paling sesuai untuk Anda.",
  },
  {
    icon: <MessageSquareQuote className="h-8 w-8 md:h-10 md:w-10 text-accent" />,
    title: "Minta Penawaran",
    description: "Hubungi tim kami untuk konsultasi dan mendaftar paket pilihan Anda.",
  },
  {
    icon: <UserCheck className="h-8 w-8 md:h-10 md:w-10 text-accent" />,
    title: "Konfirmasi",
    description: "Ikuti bimbingan manasik untuk persiapan ibadah yang matang.",
  },
  {
    icon: <Plane className="h-8 w-8 md:h-10 md:w-10 text-accent" />,
    title: "Keberangkatan",
    description: "Berangkat ke Tanah Suci sesuai jadwal yang telah ditentukan.",
  },
];

export default function RegistrationFlow({ data }: { data?: Record<string, any> }) {
  return (
    <section id="alur" className="py-12 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="text-center mb-10 md:mb-12"
        >
          <p className="font-semibold text-accent font-headline text-sm md:text-base">Cara Kerja</p>
          
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary mt-2">
            Proses Pendaftaran Mudah
          </h2>

          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
            Sederhana, cepat, dan transparan dalam 4 langkah mudah.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: index * 0.2 }}
              className="flex flex-col items-center text-center p-4 rounded-xl transition-colors group"
            >
              <div className="flex-shrink-0 relative z-10 w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-muted rounded-full group-hover:bg-accent/20 transition-colors duration-300">
                {step.icon}
              </div>
              <div className="mt-4 md:mt-6">
                <h3 className="font-semibold font-headline text-lg md:text-xl text-primary">{step.title}</h3>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
