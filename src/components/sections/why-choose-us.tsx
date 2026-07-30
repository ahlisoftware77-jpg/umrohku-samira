
"use client";

import Image from 'next/image';
import { Award, HeartHandshake, Star, Users, BadgeCheck, Plane, Hotel, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const stats = [
  {
    icon: <Users className="h-5 w-5" />,
    value: '12rb+',
    label: 'Jamaah Puas',
    color: 'from-sky-400 to-blue-600',
  },
  {
    icon: <Star className="h-5 w-5" />,
    value: '4.9★',
    label: 'Rating Rata-rata',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: <Award className="h-5 w-5" />,
    value: '50+',
    label: 'Penghargaan',
    color: 'from-violet-400 to-purple-600',
  },
  {
    icon: <HeartHandshake className="h-5 w-5" />,
    value: '15+',
    label: 'Tahun Pengalaman',
    color: 'from-emerald-400 to-teal-600',
  },
];

const defaultFeatures = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: 'Bimbingan Ustaz Sesuai Sunnah',
    desc: 'Didampingi muthawwif berpengalaman dan bersertifikat yang membimbing seluruh rangkaian ibadah sesuai tuntunan Rasulullah ﷺ.',
    color: 'from-sky-50 to-blue-50',
    iconBg: 'bg-sky-500',
    accent: 'border-sky-100',
    num: '01',
  },
  {
    icon: <Hotel className="w-6 h-6" />,
    title: 'Hotel Dekat Pelataran Masjid',
    desc: 'Akses jalan kaki mudah ke Masjidil Haram & Nabawi, sehingga jamaah bisa beribadah kapan saja tanpa terbebani jarak.',
    color: 'from-emerald-50 to-teal-50',
    iconBg: 'bg-emerald-500',
    accent: 'border-emerald-100',
    num: '02',
  },
  {
    icon: <Plane className="w-6 h-6" />,
    title: 'Penerbangan Direct Tanpa Transit',
    desc: 'Maskapai ternama Saudia Airline & Garuda Indonesia — perjalanan langsung tanpa transit menjamin kesegaran jamaah tiba di tanah suci.',
    color: 'from-violet-50 to-purple-50',
    iconBg: 'bg-violet-500',
    accent: 'border-violet-100',
    num: '03',
  },
];

interface WhyChooseUsProps {
  data?: Record<string, any>;
}

export default function WhyChooseUs({ data }: WhyChooseUsProps) {
  const fallbackBg = PlaceHolderImages.find(p => p.id === 'why-choose-us-2');
  const bgImageUrl = data?.imageUrl || fallbackBg?.imageUrl;

  const badgeText = data?.badgeText || 'Keunggulan Layanan';
  const title = data?.title || 'Mengapa Memilih Samira Travel?';
  const description = data?.description || 'Komitmen kami adalah memastikan setiap jamaah berangkat dengan tenang, beribadah dengan khusyuk, dan pulang membawa kenangan spiritual yang tak terlupakan.';

  const features = [
    {
      ...defaultFeatures[0],
      title: data?.feature1_title || defaultFeatures[0].title,
      desc: data?.feature1_desc || defaultFeatures[0].desc,
    },
    {
      ...defaultFeatures[1],
      title: data?.feature2_title || defaultFeatures[1].title,
      desc: data?.feature2_desc || defaultFeatures[1].desc,
    },
    {
      ...defaultFeatures[2],
      title: data?.feature3_title || defaultFeatures[2].title,
      desc: data?.feature3_desc || defaultFeatures[2].desc,
    },
  ];

  return (
    <section id="mengapa" className="relative py-20 md:py-32 overflow-hidden bg-[#f5f5f7]">

      {/* ── Decorative background blobs ── */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-primary/8 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5 border border-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            {badgeText}
          </span>
          <h2 className="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-5 leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 text-sm md:text-base leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* ── Feature Cards ── */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className={cn(
                "relative group rounded-3xl p-7 border bg-gradient-to-br overflow-hidden cursor-default hover:-translate-y-2 transition-all duration-500",
                f.color, f.accent
              )}
            >
              {/* Number watermark */}
              <div className="absolute -top-4 -right-2 text-[80px] font-extrabold leading-none text-black/4 select-none font-headline">
                {f.num}
              </div>

              {/* Icon */}
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300", f.iconBg)}>
                {f.icon}
              </div>

              {/* Badge check */}
              <BadgeCheck className="w-4 h-4 text-primary/30 absolute top-6 right-6" />

              <h3 className="text-base md:text-lg font-extrabold text-gray-900 mb-3 leading-snug">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {f.desc}
              </p>

              {/* Bottom accent line */}
              <div className={cn("absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full", f.iconBg)} />
            </motion.div>
          ))}
        </div>

        {/* ── Stats Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background image layer */}
          {bgImageUrl && (
            <div className="absolute inset-0">
              <Image
                src={bgImageUrl}
                alt="Background Keunggulan"
                fill
                className="object-cover"
                data-ai-hint={fallbackBg?.imageHint}
              />
            </div>
          )}
          {/* Dark overlay with subtle grain */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent/10 translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-px">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex flex-col items-center text-center px-6 py-10 md:py-14 hover:bg-white/5 transition-all duration-300"
              >
                {/* Icon circle with gradient */}
                <div className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-xl group-hover:scale-110 transition-transform duration-300",
                  stat.color
                )}>
                  {stat.icon}
                </div>

                <p className="text-4xl md:text-5xl font-extrabold font-headline text-white mb-2 leading-none">
                  {stat.value}
                </p>
                <h3 className="text-[11px] md:text-xs font-bold text-accent uppercase tracking-[0.15em]">
                  {stat.label}
                </h3>
              </motion.div>
            ))}
          </div>

          {/* Divider lines between stats */}
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/10 hidden lg:block" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 hidden lg:block" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/10 hidden lg:block" />
        </motion.div>

        {/* ── Trust strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12"
        >
          {[
            { icon: '🏆', text: 'Rekor MURI 2024' },
            { icon: '🛡️', text: 'Izin Kemenag Resmi' },
            { icon: '✈️', text: 'Direct Flight' },
            { icon: '🕌', text: 'Bimbingan Ibadah' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span className="text-xl">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
