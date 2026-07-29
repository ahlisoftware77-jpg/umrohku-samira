
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  CheckCircle2, 
  Calendar, 
  Hotel, 
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  BookOpen,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import PaymentInfo from '@/components/sections/payment-info';
import { motion } from 'framer-motion';
import { Agent, getAgent } from '@/lib/agents';
import { getPackage } from '@/lib/packages';
import Link from 'next/link';

const commonRequirements = [
  'Paspor dengan nama minimal 2 kata yang masih berlaku minimal 8 bulan sebelum tanggal keberangkatan',
  'FC KTP & Kartu Keluarga',
  'DP Rp. 1.500.000, tidak dapat dikembalikan (Non Refundable)',
  'Booking Seat Rp. 10.000.000.',
  'Dokumen dan Pelunasan 1,5 bulan sebelum tanggal keberangkatan',
  'Foto berwarna dengan latar belakang putih posisi muka/kepala 80% and untuk wanita berjilbab tidak memakai warna putih.',
  'Ukuran 3x4 = 2 lembar & Softcopy Foto',
  'Copy sertifikat vaksin covid-19 (dosis 1 & 2)'
];

const standardExclusions = [
  'Biaya Pembuatan Passport',
  'Biaya Vaksin Meningitis',
  'Handling dan Perlengkapan Umroh Rp. 1.500.000',
  'Akomodasi / Hotel transit (jika diperlukan)',
  'Tiket Pesawat / Biaya Perjalanan Domestik',
  'Kelebihan Bagasi sesuai Ketentuan Penerbangan',
  'Tour/Makan/Minum tambahan diluar program',
  'Telephone Bill, Payview TV, Mini Bar, and semua pemakaian fasilitas/layanan di hotel',
  'Biaya-biaya yang bersifat pribadi, and atau yang bukan merupakan fasilitas program',
  'Biaya Tambahan (apabila ada) yang dikeluarkan oleh Pemerintah KSA (Kerajaan Saudi Arabia) untuk penerbitan Visa Umroh',
  'Biaya surat Kesehatan baru (Apabila ada) sebagai syarat untuk penerbitan Visa Umroh'
];

const packageTiers = [
  {
    name: 'Safara',
    stars: 3,
    makkah: 'Hotel bintang 3, jarak 900m (±13 menit jalan kaki)',
    madinah: 'Hotel bintang 3, jarak 500m (±10 menit jalan kaki)',
  },
  {
    name: 'Safawi',
    stars: 4,
    makkah: 'Hotel bintang 4, jarak 750m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 250m (±5 menit jalan kaki)',
  },
  {
    name: 'Sukari',
    stars: 5,
    makkah: 'Hotel bintang 5, jarak 300m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 150m (±5 menit jalan kaki)',
  },
  {
    name: 'Majol',
    stars: 5,
    makkah: 'Hotel bintang 5, Depan pelataran (Zamzam Tower)',
    madinah: 'Hotel bintang 5, Depan pelataran Masjid Nabawi',
  }
];

const brochureImagesList = [
  '/images/b1.jpeg', '/images/b2.jpeg', '/images/b3.jpeg', '/images/b4.jpeg',
  '/images/b5.jpeg', '/images/b6.jpeg', '/images/b7.jpeg', '/images/b8.jpeg',
];

interface PackageDetailViewProps {
  packageId: string;
  agent?: Agent;
}

export default function PackageDetailView({ packageId, agent: providedAgent }: PackageDetailViewProps) {
  const router = useRouter();
  const pkg = getPackage(packageId);
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const agent = providedAgent || getAgent('default');
  const agentSlug = agent?.slug || 'default';
  const prefix = agentSlug === 'default' ? '' : `/${agentSlug}`;

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Paket tidak ditemukan</h1>
        <Button onClick={() => router.push(`${prefix}/`)}>Kembali ke Beranda</Button>
      </div>
    );
  }

  const image = PlaceHolderImages.find(p => p.id === pkg.imageId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header agent={agent} />
      <main className="flex-1 pt-24 pb-20">
        <div className="container mx-auto px-4">
          <button onClick={() => router.push(`${prefix}/`)} className="flex items-center text-primary font-bold mb-6 hover:text-accent group">
            <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1" /> Kembali ke Beranda
          </button>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                {image && (
                  <div className="relative h-[300px] md:h-[450px] w-full rounded-2xl overflow-hidden shadow-2xl mb-6">
                    <Image src={image.imageUrl} alt={pkg.title} fill className="object-cover" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">Paket Unggulan</span>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium"><Clock className="w-3 h-3 inline mr-1" /> {pkg.duration}</span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-headline font-bold">{pkg.title}</h1>
                    </div>
                  </div>
                )}
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-border">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl md:text-2xl font-headline font-bold text-primary">Deskripsi Paket</h2>
                    <Button onClick={() => setIsBrochureOpen(true)} variant="outline" className="rounded-full gap-2"><BookOpen className="w-4 h-4" /> Lihat Brosur</Button>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{pkg.description}</p>
                </div>
              </motion.div>

              {isMounted ? (
                <Tabs defaultValue="itinerary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-primary/10 rounded-2xl p-2 h-auto gap-2">
                    <TabsTrigger value="itinerary" className="rounded-xl font-bold py-3"><Calendar className="mr-2 w-4 h-4" /> Jadwal</TabsTrigger>
                    <TabsTrigger value="facilities" className="rounded-xl font-bold py-3"><CheckCircle2 className="mr-2 w-4 h-4" /> Fasilitas</TabsTrigger>
                    <TabsTrigger value="hotels" className="rounded-xl font-bold py-3"><Hotel className="mr-2 w-4 h-4" /> Akomodasi</TabsTrigger>
                    <TabsTrigger value="requirements" className="rounded-xl font-bold py-3"><FileText className="mr-2 w-4 h-4" /> Persyaratan</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="itinerary" className="mt-8">
                    <Card className="p-6 md:p-10 rounded-2xl">
                      {pkg.itinerary.map((item, idx) => (
                        <div key={idx} className="flex gap-6 pb-6 last:pb-0">
                          <div className="font-bold text-primary shrink-0">Hari {item.day}</div>
                          <div className="text-muted-foreground">{item.activity}</div>
                        </div>
                      ))}
                    </Card>
                  </TabsContent>
                  <TabsContent value="facilities" className="mt-8">
                    <Card className="p-6 grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-bold mb-4">Harga Termasuk</h4>
                        <ul className="space-y-2">{pkg.inclusions.map((inc, i) => <li key={i} className="text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-accent" /> {inc}</li>)}</ul>
                      </div>
                      <div>
                        <h4 className="font-bold mb-4">Harga Belum Termasuk</h4>
                        <ul className="space-y-2">{standardExclusions.map((exc, i) => <li key={i} className="text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 text-destructive" /> {exc}</li>)}</ul>
                      </div>
                    </Card>
                  </TabsContent>
                  <TabsContent value="hotels" className="mt-8 space-y-6">
                    {packageTiers.map((tier, idx) => (
                      <Card key={idx} className="p-4 flex justify-between items-center">
                        <div><h5 className="font-bold">{tier.name}</h5><p className="text-xs text-muted-foreground">Makkah: {tier.makkah}</p></div>
                        <div className="flex">{Array.from({length: tier.stars}).map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}</div>
                      </Card>
                    ))}
                  </TabsContent>
                  <TabsContent value="requirements" className="mt-8">
                    <Card className="p-6">
                      <ul className="space-y-2">{commonRequirements.map((req, i) => <li key={i} className="text-sm flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" /> {req}</li>)}</ul>
                    </Card>
                  </TabsContent>
                </Tabs>
              ) : <div className="p-20 text-center animate-pulse">Memuat Detail...</div>}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <Card className="p-8 bg-primary text-white rounded-2xl shadow-xl">
                  <p className="text-white/60 font-bold uppercase text-xs mb-2">Harga Paket</p>
                  <h3 className="text-4xl font-bold font-headline text-accent mb-6">{pkg.price}</h3>
                  {agent.whatsapp ? (
                    <Button asChild className="w-full bg-accent text-accent-foreground h-14 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all">
                      <Link href={`https://wa.me/${agent.whatsapp}`}>Bismillah Daftar <ArrowRight className="ml-2 w-5 h-5" /></Link>
                    </Button>
                  ) : (
                    <Button className="w-full bg-accent/40 text-white/50 h-14 rounded-xl font-bold text-lg cursor-not-allowed" onClick={() => alert('Hubungi kantor pusat kami. Nomor WhatsApp admin mitra belum dikonfigurasi.')}>
                      Pendaftaran Belum Aktif
                    </Button>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
        <PaymentInfo />
      </main>

      <Dialog open={isBrochureOpen} onOpenChange={setIsBrochureOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Brosur Paket</DialogTitle></DialogHeader>
          <div className="grid gap-4">{brochureImagesList.map((img, i) => <img key={i} src={img} alt="Brosur" className="w-full h-auto rounded-lg" />)}</div>
        </DialogContent>
      </Dialog>
      <Footer agent={agent} />
    </div>
  );
}
