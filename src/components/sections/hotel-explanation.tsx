
"use client";

import Image from 'next/image';
import { Star, Info, Users2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const packageTiers = [
  {
    name: 'Safara',
    stars: 3,
    makkah: 'Hotel bintang 3, jarak 900m (±13 menit jalan kaki)',
    madinah: 'Hotel bintang 3, jarak 500m (±10 menit jalan kaki)',
    color: 'bg-blue-50'
  },
  {
    name: 'Safawi',
    stars: 4,
    makkah: 'Hotel bintang 4, jarak 750m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 250m (±5 menit jalan kaki)',
    color: 'bg-blue-100'
  },
  {
    name: 'Sukari',
    stars: 5,
    makkah: 'Hotel bintang 5, jarak 300m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 150m (±5 menit jalan kaki)',
    color: 'bg-blue-200'
  },
  {
    name: 'Majol',
    stars: 5,
    makkah: 'Hotel bintang 5, Depan pelataran (Zamzam Tower)',
    madinah: 'Hotel bintang 5, Depan pelataran Masjid Nabawi',
    color: 'bg-accent/10'
  }
];

const roomNotes = [
  { type: 'Quad', desc: 'Sekamar isi 4 orang' },
  { type: 'Triple', desc: 'Sekamar isi 3 orang' },
  { type: 'Double', desc: 'Sekamar isi 2 orang' }
];

export default function HotelExplanation({ data }: { data?: Record<string, any> }) {
  return (
    <section id="penjelasan" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-semibold text-accent font-headline text-sm md:text-base uppercase tracking-widest">{data?.badgeText || 'Informasi Akomodasi'}</p>
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary mt-2">
            {data?.title || 'PENJELASAN PAKET UMROH SAMIRA'}
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3] group"
          >
            <Image
              src={data?.imageUrl || "/images/penjelasan hotel.jpeg"}
              alt="Penjelasan Hotel Samira"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 bg-accent text-accent-foreground w-fit px-4 py-1 rounded-full text-xs font-bold mb-2">
                <Info className="w-3 h-3" /> Standar Pelayanan
              </div>
              <p className="text-white text-sm font-medium">Kami memastikan kenyamanan ibadah Anda dengan pilihan hotel terbaik yang strategis.</p>
            </div>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {packageTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
              >
                <Card className="border-none shadow-md h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="font-headline text-xl text-primary">{tier.name}</CardTitle>
                      <div className="flex gap-0.5">
                        {[...Array(tier.stars)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/5 p-1.5 rounded-md shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Mekkah</p>
                        <p className="text-xs md:text-sm text-primary/80 font-medium leading-relaxed">{tier.makkah}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/5 p-1.5 rounded-md shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Madinah</p>
                        <p className="text-xs md:text-sm text-primary/80 font-medium leading-relaxed">{tier.madinah}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="mt-12 p-6 md:p-8 bg-primary/5 rounded-3xl border border-primary/10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent p-2 rounded-lg">
              <Users2 className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-primary font-headline text-xl">Catatan Kamar (Room Occupancy)</h3>
              <p className="text-xs text-muted-foreground">Pilihan kapasitas hunian dalam satu kamar hotel</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {roomNotes.map((note) => (
              <div key={note.type} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-border/50 group hover:border-accent transition-colors">
                <div className="bg-primary text-white w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  {note.type.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-base text-primary">{note.type}</p>
                  <p className="text-sm text-muted-foreground">{note.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-primary/10">
            <p className="text-[11px] md:text-xs text-muted-foreground italic text-center">
              * Note: Jarak hotel adalah estimasi rata-rata. Perubahan hotel dapat terjadi sesuai ketersediaan namun tetap dengan standar yang setara.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
