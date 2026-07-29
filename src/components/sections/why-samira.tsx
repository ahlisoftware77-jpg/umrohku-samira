
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "Berizin Resmi dan Terpercaya",
    description: "Samira Travel memiliki izin resmi dari Kementerian Agama RI sebagai Penyelenggara Umrah (PPIU) dan Penyelenggara Haji Khusus (PIHK)"
  },
  {
    title: "Pesawat Sudah Di Booking Sebelum Dipromosikan Ke Jamaah",
    description: "Samira Travel Selalu Melakukan Booking Pesawat Terlebih Dahulu Sebelum Paket Umroh Di Terbitkan."
  },
  {
    title: "Fasilitas Perjalanan Yang Nyaman",
    description: "Bus eksekutif atau kendaraan terbaik ternyaman di kelasnya. Hotel yang di pilih dalam paket umroh adalah hotel dengan jarak yang dekat dengan masjid dan memiliki reputasi layanan catering yang baik."
  },
  {
    title: "Keberangkatan dari Kota-kota Besar di Indonesia",
    description: "memberangkatkan jamaah umroh bukan hanya dari Jakarta saja , tapi juga dari kota kota besar di Indonesia."
  }
];

export default function WhySamira() {
  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary leading-tight mb-4">
              Mengapa Umroh Bersama Samira Travel?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10">
              Semua pelayanan Samira Travel diaplikasikan untuk kenyamanan ibadah Anda & Keluarga.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4 md:gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-50 rounded-lg flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-headline font-bold text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center lg:text-left">
              <Link 
                href="/tentang" 
                className="text-primary font-bold hover:text-accent transition-colors border-b-2 border-accent pb-1 inline-flex items-center gap-2"
              >
                Selengkapnya Tentang Kami
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex justify-center items-center"
          >
            <div className="relative w-full max-w-[300px] md:max-w-[500px] aspect-square">
              <Image
                src="/images/PROFIL INSTAGRAM.png"
                alt="Samira Travel Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
