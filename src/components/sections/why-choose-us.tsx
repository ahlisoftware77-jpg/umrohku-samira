
"use client";

import Image from 'next/image';
import { 
  Award, HeartHandshake, Star, Users,
  ShieldCheck, Plane, Clock, BadgeCheck,
  ArrowRight, Sparkles
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/* ── Counter hook ── */
function useCounter(target: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1800;
    const step = 30;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target, active]);
  return count;
}

const stats = [
  { icon: <Users className="h-5 w-5" />, value: 12000, suffix: '+', label: 'Jamaah Puas', color: 'text-sky-400' },
  { icon: <Star className="h-5 w-5" />, value: 4.9, suffix: '/5', label: 'Rating Rata-rata', color: 'text-amber-400', isFloat: true },
  { icon: <Award className="h-5 w-5" />, value: 50, suffix: '+', label: 'Penghargaan', color: 'text-violet-400' },
  { icon: <HeartHandshake className="h-5 w-5" />, value: 15, suffix: '+', label: 'Tahun Pengalaman', color: 'text-emerald-400' },
];

const features = [
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Berizin Resmi Kemenag',
    desc: 'Terdaftar dan diawasi langsung oleh Kementerian Agama RI sejak 2009.',
    color: 'bg-sky-500/10 text-sky-600 border-sky-200',
  },
  {
    icon: <Plane className="w-5 h-5" />,
    title: 'Kepastian Penerbangan',
    desc: 'Tiket pesawat sudah dikonfirmasi sebelum promosi, bukan sekedar janji.',
    color: 'bg-violet-500/10 text-violet-600 border-violet-200',
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: 'Hotel Bintang 5',
    desc: 'Akomodasi premium di Makkah & Madinah dengan jarak terdekat ke masjid.',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200',
  },
  {
    icon: <Clock className="w-5 h-5" />,
    title: 'Layanan 24/7',
    desc: 'Tim konsultan siap mendampingi Anda kapan pun, di mana pun.',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
  {
    icon: <BadgeCheck className="w-5 h-5" />,
    title: 'Rekor MURI 2024',
    desc: 'Meraih penghargaan bergengsi atas inovasi layanan umroh terbaik.',
    color: 'bg-rose-500/10 text-rose-600 border-rose-200',
  },
  {
    icon: <HeartHandshake className="w-5 h-5" />,
    title: 'Pendamping Profesional',
    desc: 'Pembimbing ibadah bersertifikat yang berpengalaman dan amanah.',
    color: 'bg-teal-500/10 text-teal-600 border-teal-200',
  },
];

/* ── Stat counter card ── */
function StatCard({ stat, index, active }: { stat: typeof stats[0], index: number, active: boolean }) {
  const count = useCounter(
    stat.isFloat ? Math.round(stat.value * 10) : stat.value,
    active
  );
  const display = stat.isFloat ? (count / 10).toFixed(1) : count.toLocaleString('id-ID');
  const formatted = stat.value >= 1000 ? `${(stat.value / 1000).toFixed(0)}rb` : display;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative group"
    >
      <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
        {/* Glow accent */}
        <div className={cn("absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity", stat.color.replace('text-', 'bg-'))} />
        
        <div className={cn("p-3 rounded-2xl border mb-4 bg-white/5 backdrop-blur-md", 
          stat.color.replace('text-', 'border-').replace(/\d+$/, '300')
        )}>
          <span className={stat.color}>{stat.icon}</span>
        </div>

        <p className={cn("text-4xl md:text-5xl font-extrabold font-headline leading-none", stat.color)}>
          {stat.isFloat ? (active ? (count / 10).toFixed(1) : '0.0') : (active ? formatted : '0')}{stat.suffix}
        </p>
        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-2 text-center">{stat.label}</p>
      </div>
    </motion.div>
  );
}

export default function WhyChooseUs({ data }: { data?: Record<string, any> }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const fallbackBg = PlaceHolderImages.find(p => p.id === 'why-choose-us-2');
  const bgImageUrl = data?.imageUrl || fallbackBg?.imageUrl || '/images/bg-unggulan.jpeg';
  
  const sideImageFallback = PlaceHolderImages.find(p => p.id === 'hero-masjidil-haram-1');
  const sideImageUrl = data?.sideImageUrl || sideImageFallback?.imageUrl || '/images/Makkah.jpg';

  const badgeText = data?.badgeText || 'Keunggulan Kami';
  const title = data?.title || 'Mengapa Ribuan Jamaah Memilih Samira Travel?';
  const description = data?.description || 'Kami hadir bukan sekadar biro perjalanan — kami adalah mitra ibadah Anda. Dengan pengalaman lebih dari 15 tahun, ribuan jamaah mempercayakan perjalanan suci mereka kepada kami.';

  return (
    <section id="mengapa" ref={sectionRef} className="relative overflow-hidden">
      
      {/* ── UPPER STATS BAND ── */}
      <div className="relative py-16 md:py-20">
        {bgImageUrl && (
          <Image src={bgImageUrl} alt="Background Keunggulan" fill className="object-cover" />
        )}
        {/* Layered overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/85" />
        {/* Subtle noise texture pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        
        <div className="container mx-auto relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 bg-accent/20 border border-accent/30 text-accent px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Dipercaya Ribuan Jamaah
            </span>
            <p className="text-white/60 text-sm max-w-md mx-auto">Angka yang berbicara tentang kepercayaan dan kualitas layanan kami</p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} index={index} active={isInView} />
            ))}
          </div>
        </div>
      </div>

      {/* ── LOWER FEATURES SECTION ── */}
      <div className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left: image + floating badge */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative hidden lg:block"
            >
              <div className="relative h-[560px] rounded-3xl overflow-hidden shadow-2xl">
                {sideImageUrl && (
                  <Image src={sideImageUrl} alt="Masjidil Haram" fill className="object-cover scale-105 hover:scale-100 transition-transform duration-700" />
                )}
                {/* Gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

                {/* Floating trust badge */}
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-2xl shrink-0">🏆</div>
                      <div>
                        <p className="font-extrabold text-primary text-sm">Rekor MURI 2024</p>
                        <p className="text-gray-500 text-xs mt-0.5">Biro Umroh Terpercaya & Inovatif</p>
                      </div>
                      <div className="ml-auto">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 text-right">4.9/5.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-accent/10 rounded-full blur-2xl" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            </motion.div>

            {/* Right: text + feature cards */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-10"
              >
                <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-5">
                  <Sparkles className="w-3.5 h-3.5 text-accent" /> {badgeText}
                </span>
                <h2 className="text-3xl md:text-4xl font-headline font-extrabold text-primary leading-tight mb-4">
                  {title}
                </h2>
                <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                  {description}
                </p>
              </motion.div>

              {/* Feature grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="group flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:-translate-y-1 hover:border-primary/20 transition-all duration-300"
                  >
                    <div className={cn("p-2.5 rounded-xl border shrink-0 group-hover:scale-110 transition-transform", feat.color)}>
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-primary transition-colors">{feat.title}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA row */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-100"
              >
                <div className="flex -space-x-3">
                  {['🧕', '👳', '🧕', '👳', '🧕'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-base shadow-sm">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">12.000+ Jamaah telah berangkat</p>
                  <p className="text-xs text-gray-500">bergabunglah bersama keluarga kami</p>
                </div>
                <a
                  href="#daftar"
                  className="ml-auto hidden sm:flex items-center gap-2 text-xs font-bold text-primary hover:text-accent transition-colors"
                >
                  Daftar Sekarang <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
