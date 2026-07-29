"use client";

import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Award, 
  HeartHandshake, 
  Globe, 
  Crown, 
  MapPin
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const values = [
  {
    icon: <ShieldCheck className="w-8 h-8 text-accent" />,
    title: "Integritas",
    description: "Menjunjung tinggi kejujuran dan transparansi dalam setiap layanan perjalanan ibadah."
  },
  {
    icon: <HeartHandshake className="w-8 h-8 text-accent" />,
    title: "Pelayanan Sepenuh Hati",
    description: "Mengutamakan kenyamanan dan kepuasan jamaah sebagai prioritas utama kami."
  },
  {
    icon: <Award className="w-8 h-8 text-accent" />,
    title: "Profesionalisme",
    description: "Didukung oleh tim ahli dan berpengalaman di bidang perjalanan religi."
  }
];

const products = [
  {
    icon: <MapPin className="w-10 h-10 text-primary" />,
    title: "Jasa Perjalanan Ibadah Umroh",
    description: "Umroh bersama Samira Travel adalah jaminan kekhusyukan dan kenyamanan. Kami memastikan setiap detail perjalanan Anda telah diurus dengan profesional, sehingga Anda dapat fokus sepenuhnya pada ibadah."
  },
  {
    icon: <Crown className="w-10 h-10 text-primary" />,
    title: "Jasa Perjalanan Ibadah Haji Khusus & Furoda",
    description: "Bagi Anda yang merindukan pelaksanaan Haji tanpa penantian panjang, Samira Travel menyediakan layanan Haji Khusus dan Haji Furoda dengan fasilitas eksklusif dan pendampingan total."
  },
  {
    icon: <Globe className="w-10 h-10 text-primary" />,
    title: "Jasa Perjalanan Halal Tour",
    description: "Nikmati keindahan budaya dan sejarah dunia tanpa mengorbankan nilai-nilai keislaman Anda. Halal Tour Samira Travel menjamin perjalanan yang aman, nyaman dan sesuai Syariah."
  }
];

export default function TentangKamiPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-masjidil-haram-1');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[60vh] md:h-[70vh] flex items-center justify-center text-white overflow-hidden py-20">
          {heroImage && (
            <div className="absolute inset-0 z-0">
              <Image
                src={heroImage.imageUrl}
                alt="Tentang Samira Travel"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-primary/80 backdrop-blur-sm"></div>
            </div>
          )}
          <div className="relative z-10 container mx-auto px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-headline font-bold mb-6"
            >
              Tentang Samira Travel
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-white/90 max-w-4xl mx-auto leading-relaxed"
            >
              PT. Samira Ali Wisata (Samira Travel) adalah perusahaan jasa penyelenggara perjalanan Ibadah Haji & Umroh yang berkomitmen melayani tamu Allah dengan sepenuh hati, sesuai dengan tuntunan Sunnah Rasullah SAW.
            </motion.p>
          </div>
        </section>

        {/* Profil Perusahaan & Legalitas */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-accent font-bold uppercase tracking-widest text-sm mb-2">Profil &amp; Legalitas</p>
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6">PT. Samira Ali Wisata</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Samira Travel didirikan oleh <strong>Ust. Fauzi Wahyu Muntoro</strong> pada tahun 2014. Kami hadir dengan komitmen kuat untuk menjadi mitra terpercaya bagi umat Islam dalam menjalankan ibadah ke Tanah Suci.
                  </p>
                  <p>
                    Sebagai penyelenggara yang amanah, Samira Travel telah mengantongi legalitas resmi sejak tahun 2016 dengan Izin Kemenag RI sebagai Penyelenggara Perjalanan Ibadah Umrah (PPIU) atas nama <strong>PT. Samira Ali Wisata</strong>.
                  </p>
                  
                  <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 mt-8 space-y-4">
                    <h4 className="font-bold text-primary mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-accent" /> Legalitas Resmi Kemenag RI
                    </h4>
                    <div className="grid gap-4">
                      <div className="flex flex-col md:flex-row md:justify-between border-b border-primary/10 pb-3 gap-1">
                        <span className="text-sm font-medium">Izin PPIU (Umrah):</span>
                        <span className="font-bold text-primary">No. D834/2016</span>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between border-b border-primary/10 pb-3 gap-1">
                        <span className="text-sm font-medium">Izin PIHK (Haji Khusus):</span>
                        <span className="font-bold text-primary">No. 16092100475620002</span>
                      </div>
                      <div className="text-[11px] italic text-muted-foreground mt-2">
                        * Izin PIHK didapatkan pada 25 Februari 2022.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-white border-8 border-white"
                >
                  <img
                    src="/images/INSPIRASI UMROH.png"
                    alt="Inspirasi Umroh Samira Travel"
                    className="w-full h-auto block"
                  />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 text-center"
                >
                  <h4 className="text-xl font-headline font-bold text-primary">H. Fauzi Wahyu Muntoro</h4>
                  <p className="text-accent font-bold text-sm tracking-widest uppercase mt-1">Founder &amp; CEO SAMIRA Travel</p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Produk Samira Travel Section */}
        <section className="py-24 bg-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-accent font-bold uppercase tracking-widest text-sm mb-2">Produk Kami</p>
              <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6">
                Produk Samira Travel
              </h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-muted-foreground text-lg max-w-4xl mx-auto"
              >
                Wujudkan impian ibadah Anda bersama Samira Travel. Kami menyediakan berbagai produk yang dirancang khusus untuk memenuhi kebutuhan spiritual dan kenyamanan Anda sekeluarga.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-muted/30 p-8 rounded-[2rem] border border-primary/5 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {product.icon}
                  </div>
                  <h3 className="text-2xl font-headline font-bold text-primary mb-4 leading-tight group-hover:text-accent transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Nilai Perusahaan */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-16">
              Nilai-Nilai Utama Kami
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {values.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="group"
                >
                  <div className="mb-6 inline-flex p-4 bg-white rounded-2xl group-hover:bg-accent/20 transition-colors duration-300 shadow-sm">
                    {val.icon}
                  </div>
                  <h4 className="text-2xl font-headline font-bold text-primary mb-3">{val.title}</h4>
                  <p className="text-muted-foreground">{val.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
