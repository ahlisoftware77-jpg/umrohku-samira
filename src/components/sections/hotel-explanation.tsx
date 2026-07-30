
"use client";

import Image from 'next/image';
import { Star, Info, Users2, MapPin, Bed, BedDouble, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const packageTiers = [
  {
    name: 'Safara',
    stars: 3,
    makkah: 'Hotel bintang 3, jarak 900m (±13 menit jalan kaki)',
    madinah: 'Hotel bintang 3, jarak 500m (±10 menit jalan kaki)',
    gradient: 'from-blue-50 to-sky-100/50 dark:from-blue-950/20 dark:to-sky-950/10',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    shadow: 'rgba(59,130,246,0.18)',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    name: 'Safawi',
    stars: 4,
    makkah: 'Hotel bintang 4, jarak 750m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 250m (±5 menit jalan kaki)',
    gradient: 'from-emerald-50 to-teal-100/50 dark:from-emerald-950/20 dark:to-teal-950/10',
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    shadow: 'rgba(16,185,129,0.18)',
    iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    name: 'Sukari',
    stars: 5,
    makkah: 'Hotel bintang 5, jarak 300m (±10 menit jalan kaki)',
    madinah: 'Hotel bintang 4, jarak 150m (±5 menit jalan kaki)',
    gradient: 'from-violet-50 to-purple-100/50 dark:from-violet-950/20 dark:to-purple-950/10',
    border: 'border-violet-200/60 dark:border-violet-900/40',
    shadow: 'rgba(139,92,246,0.18)',
    iconColor: 'text-violet-600 dark:text-violet-400'
  },
  {
    name: 'Majol',
    stars: 5,
    makkah: 'Hotel bintang 5, Depan pelataran (Zamzam Tower)',
    madinah: 'Hotel bintang 5, Depan pelataran Masjid Nabawi',
    gradient: 'from-amber-50 to-orange-100/50 dark:from-amber-950/20 dark:to-orange-950/10',
    border: 'border-amber-200/60 dark:border-amber-900/40',
    shadow: 'rgba(245,158,11,0.18)',
    iconColor: 'text-amber-600 dark:text-amber-400'
  }
];

const roomNotes = [
  { 
    type: 'Quad Room', 
    title: 'Sekamar Berempat',
    desc: 'Satu kamar hotel dengan kapasitas 4 tempat tidur single. Solusi paling praktis dan hemat bersama keluarga besar.', 
    bestFor: 'Sangat Cocok Rombongan Keluarga',
    gradient: 'from-[#0f1d3a] to-[#071124]',
    border: 'border-emerald-500/25 hover:border-emerald-500/60',
    shadow: 'rgba(16,185,129,0.22)',
    iconBg: 'bg-emerald-600 text-white',
    tagColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    icon: <Users className="w-5 h-5 text-white" />,
    capacity: 4
  },
  { 
    type: 'Triple Room', 
    title: 'Sekamar Bertiga',
    desc: 'Satu kamar hotel dengan kapasitas 3 tempat tidur single. Menyeimbangkan kenyamanan privasi dengan anggaran seimbang.', 
    bestFor: 'Ideal Untuk Keluarga & Sahabat',
    gradient: 'from-[#0f1d3a] to-[#071124]',
    border: 'border-blue-500/25 hover:border-blue-500/60',
    shadow: 'rgba(59,130,246,0.22)',
    iconBg: 'bg-blue-600 text-white',
    tagColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    icon: <Bed className="w-5 h-5 text-white" />,
    capacity: 3
  },
  { 
    type: 'Double Room', 
    title: 'Sekamar Berdua',
    desc: 'Satu kamar hotel dengan kapasitas 2 tempat tidur single / 1 double bed. Memberikan keleluasaan istirahat penuh.', 
    bestFor: 'Rekomendasi Utama Pasutri (VIP Privacy)',
    gradient: 'from-[#0f1d3a] to-[#071124]',
    border: 'border-amber-500/25 hover:border-amber-500/60',
    shadow: 'rgba(212,175,55,0.22)',
    iconBg: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950',
    tagColor: 'bg-amber-500/20 text-accent border border-amber-500/30',
    icon: <BedDouble className="w-5 h-5 text-slate-950" />,
    capacity: 2
  }
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
                whileHover={{ 
                  y: -6, 
                  scale: 1.02,
                  boxShadow: `0 20px 25px -5px ${tier.shadow}, 0 8px 10px -6px ${tier.shadow}`
                }}
                className={`relative h-full flex flex-col p-5 bg-gradient-to-br ${tier.gradient} border ${tier.border} rounded-2xl transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(10,30,59,0.05)] cursor-pointer group`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-headline font-bold text-xl text-primary group-hover:text-accent transition-colors duration-300">{tier.name}</h4>
                  <div className="flex gap-0.5">
                    {[...Array(tier.stars)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-3.5 flex-grow">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/5 p-1.5 rounded-md shrink-0">
                      <MapPin className={`w-4 h-4 ${tier.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Mekkah</p>
                      <p className="text-xs md:text-sm text-primary/80 font-semibold leading-relaxed">{tier.makkah}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/5 p-1.5 rounded-md shrink-0">
                      <MapPin className={`w-4 h-4 ${tier.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-0.5">Madinah</p>
                      <p className="text-xs md:text-sm text-primary/80 font-semibold leading-relaxed">{tier.madinah}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, delay: 0.4 }}
          className="mt-16 p-8 md:p-12 bg-[#0a1122] rounded-[2.5rem] border border-accent/25 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 p-3 rounded-2xl text-slate-950 shadow-lg">
                <Users2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white font-headline text-2xl tracking-wide uppercase">
                  Pilihan Kapasitas Kamar <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">(Room Occupancy)</span>
                </h3>
                <p className="text-xs text-white/60 mt-0.5">Sesuaikan kenyamanan akomodasi hotel untuk Anda dan keluarga</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 bg-white/5 border border-white/10 px-4.5 py-1.5 rounded-full text-[10px] font-bold text-accent uppercase tracking-widest">
              ★ VIP Standard Services
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {roomNotes.map((note, index) => (
              <motion.div
                key={note.type}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: `0 25px 35px -10px ${note.shadow}`
                }}
                className={`relative flex flex-col p-6 bg-gradient-to-br ${note.gradient} border ${note.border} rounded-2xl transition-all duration-300 shadow-xl cursor-pointer group`}
              >
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-11 h-11 flex items-center justify-center rounded-xl ${note.iconBg} transform group-hover:rotate-12 transition-transform duration-300 shadow-md`}>
                    {note.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${note.tagColor} shadow-sm`}>
                    {note.type}
                  </span>
                </div>
                
                <h4 className="font-bold text-lg text-white group-hover:text-accent transition-colors duration-300 font-headline">
                  {note.title}
                </h4>
                
                {/* Visual Capacity Indicator */}
                <div className="flex gap-1.5 mt-3">
                  {[...Array(note.capacity)].map((_, i) => (
                    <span key={i} className={`w-4 h-1.5 rounded-full ${
                      note.type === 'Double Room' ? 'bg-amber-400 shadow-[0_0_8px_#d4af37]' :
                      note.type === 'Triple Room' ? 'bg-blue-400 shadow-[0_0_8px_#3b82f6]' :
                      'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                    }`}></span>
                  ))}
                </div>
                
                <p className="text-xs md:text-sm text-white/70 mt-4 flex-grow leading-relaxed">
                  {note.desc}
                </p>
                
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0"></span>
                  <p className="text-[11px] font-bold text-accent tracking-wide">{note.bestFor}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[11px] md:text-xs text-white/40 italic text-center">
              * Catatan: Penempatan kamar diatur berdasarkan manifest ketersediaan kamar hotel resmi dari pihak manajemen hotel.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
