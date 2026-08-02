
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Agent } from '@/lib/agents';
import { packagesList } from '@/lib/packages';

interface FeaturedPackagesProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function FeaturedPackages({ agent, data }: FeaturedPackagesProps) {
  const agentSlug = agent?.slug || 'default';
  const prefix = agentSlug === 'default' ? '' : `/${agentSlug}`;
  const getPackageLink = (id: string) => {
    const pkgId = id.toLowerCase();
    if (pkgId === 'pkg1' || pkgId === 'reguler') return `${prefix}/paket/reguler`;
    if (pkgId === 'pkg2' || pkgId === 'plus') return `${prefix}/paket/plus`;
    if (pkgId === 'pkg3' || pkgId === 'ramadan') return `${prefix}/paket/ramadan`;
    if (pkgId === 'haji') return `${prefix}/paket/haji`;
    return `${prefix}/paket/reguler`;
  };

  const badgeText = data?.badgeText || 'Paket';
  const title = data?.title || 'Paket Umrah Unggulan';
  const description = data?.description || 'Pilih paket yang paling sesuai dengan kebutuhan Anda untuk menunaikan ibadah di Tanah Suci.';

  const customPackages = [];
  if (data?.package1_name) {
    customPackages.push({
      id: 'pkg1',
      title: data.package1_name,
      price: data.package1_price || 'Rp 27.500.000',
      description: 'Program perjalanan ibadah Umrah dengan pelayanan terbaik dan bimbingan muthawwif terpercaya.',
      features: (data.package1_features || '• Tiket Pesawat PP\n• Hotel Bintang 4\n• Bus AC Eksekutif').split('\n').filter(Boolean),
      btnText: data.package1_btnText || 'Lihat Detail',
      imageUrl: data.package1_imageUrl || PlaceHolderImages[0]?.imageUrl || '',
    });
  }
  if (data?.package2_name) {
    customPackages.push({
      id: 'pkg2',
      title: data.package2_name,
      price: data.package2_price || 'Rp 35.000.000',
      description: 'Layanan ibadah VIP dengan akomodasi hotel di pelataran Masjidil Haram & penerbangan direct.',
      features: (data.package2_features || '• Hotel Pelataran Haram\n• Penerbangan Direct Saudia\n• Pembimbing Ustaz Kondang').split('\n').filter(Boolean),
      btnText: data.package2_btnText || 'Lihat Detail',
      imageUrl: data.package2_imageUrl || PlaceHolderImages[1]?.imageUrl || '',
    });
  }
  if (data?.package3_name) {
    customPackages.push({
      id: 'pkg3',
      title: data.package3_name,
      price: data.package3_price || 'Rp 42.000.000',
      description: 'Paket spesial ibadah Ramadhan & awal tahun dengan fasilitas lengkap dan kenyamanan keluarga.',
      features: (data.package3_features || '• Layanan Itikaf Full Ramadhan\n• Kereta Cepat Haramain\n• Asuransi Perjalanan').split('\n').filter(Boolean),
      btnText: data.package3_btnText || 'Lihat Detail',
      imageUrl: data.package3_imageUrl || PlaceHolderImages[2]?.imageUrl || '',
    });
  }
  if (data?.package4_name) {
    customPackages.push({
      id: 'haji',
      title: data.package4_name,
      price: data.package4_price || 'Hubungi Kami',
      description: 'Ibadah Haji tanpa antri dengan fasilitas premium dan bimbingan eksklusif untuk memastikan rukun haji tertunaikan.',
      features: (data.package4_features || '• Visa Haji Furoda Resmi\n• Tenda Maktab Premium\n• Apartemen Transit').split('\n').filter(Boolean),
      btnText: data.package4_btnText || 'Lihat Detail',
      imageUrl: data.package4_imageUrl || PlaceHolderImages[3]?.imageUrl || PlaceHolderImages[0]?.imageUrl || '',
    });
  }

  const activeList = customPackages.length > 0 ? customPackages : packagesList.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    description: p.description,
    features: p.details,
    btnText: 'Lihat Detail',
    imageUrl: PlaceHolderImages.find(img => img.id === p.imageId)?.imageUrl || PlaceHolderImages[0]?.imageUrl,
  }));

  return (
    <section id="paket" className="py-12 md:py-24 bg-muted overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0 }}
          className="text-center mb-8 md:mb-12"
        >
          <p className="font-semibold text-accent font-headline text-sm md:text-base">{badgeText}</p>
          
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary mt-2">
            {title}
          </h2>

          <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {activeList.map((pkg, idx) => {
            const buttonLabel = (pkg.btnText && pkg.btnText !== 'Pesan Sekarang' && !pkg.btnText.startsWith('Pesan Paket')) ? pkg.btnText : 'Lihat Detail';
            return (
              <motion.div
                key={pkg.id || idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
              >
                <Card className="flex flex-col h-full overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 rounded-2xl border-none bg-white">
                  {pkg.imageUrl && (
                    <div className="relative h-48 sm:h-56 w-full bg-slate-100">
                      <Image
                        src={pkg.imageUrl}
                        alt={pkg.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 5.0
                      </div>
                    </div>
                  )}
                  <CardHeader className="px-5 py-4 flex-grow text-left">
                    <CardTitle className="font-headline text-lg md:text-xl text-primary font-bold">{pkg.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-6 flex flex-col flex-grow">
                    <CardDescription className="text-xs text-left min-h-[2.5rem] text-muted-foreground/90 leading-relaxed">
                      {pkg.description}
                    </CardDescription>
                    <ul className="mt-4 space-y-2 text-xs text-muted-foreground flex-grow">
                      {pkg.features.map((feat: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-accent mr-2 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700">{feat}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-3 border-t">
                      <p className="text-xl font-black text-primary mb-3 text-left">{pkg.price}</p>
                      <Button asChild className="w-full rounded-full h-10 text-xs font-bold bg-primary hover:bg-accent text-white">
                        <Link href={getPackageLink(pkg.id)}>{buttonLabel}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Special Promo Umrah Package Bonus Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 md:mt-16 bg-slate-950 text-white rounded-3xl p-6 sm:p-10 border-2 border-amber-400 shadow-2xl overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-3xl mx-auto mb-8 relative z-10">
            <span className="bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block mb-3 shadow-lg border border-amber-300">
              🎁 PROMO REWARD KEBERANGKATAN ROMBONGAN
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-headline font-black text-white leading-tight drop-shadow-md">
              Program Bonus Gratis Keberangkatan Rombongan Jamaah
            </h3>
            <p className="text-xs sm:text-base text-amber-100/90 mt-2.5 font-bold leading-relaxed">
              Dapatkan bonus GRATIS 1 Tiket Keberangkatan Umrah untuk setiap pendaftaran rombongan jamaah berikut:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 relative z-10">
            {/* Card 1: Majol */}
            <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-amber-400/60 hover:border-amber-400 transition-all flex flex-col items-center text-center shadow-lg">
              <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-3 border border-amber-400/40 font-black text-xl shadow-inner">
                🕋
              </div>
              <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Paket Majol</span>
              <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">Daftar 5 Jamaah Majol</strong>
              <div className="bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
                ✨ GRATIS 1 ORANG PAKET SAFARA
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 font-bold mt-3 leading-snug drop-shadow-sm">
                Bonus 1 Tiket Keberangkatan Paket Safara
              </p>
            </div>

            {/* Card 2: Sukari */}
            <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-amber-400/60 hover:border-amber-400 transition-all flex flex-col items-center text-center shadow-lg">
              <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-3 border border-amber-400/40 font-black text-xl shadow-inner">
                🕋
              </div>
              <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Paket Sukari</span>
              <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">Daftar 7 Jamaah Sukari</strong>
              <div className="bg-emerald-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
                ✨ GRATIS 1 ORANG PAKET SAFARA
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 font-bold mt-3 leading-snug drop-shadow-sm">
                Bonus 1 Tiket Keberangkatan Paket Safara
              </p>
            </div>

            {/* Card 3: Safawi */}
            <div className="bg-slate-900/95 p-6 rounded-2xl border-2 border-amber-400/60 hover:border-amber-400 transition-all flex flex-col items-center text-center shadow-lg">
              <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center text-amber-300 mb-3 border border-amber-400/40 font-black text-xl shadow-inner">
                🕋
              </div>
              <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest mb-1.5">Paket Safawi</span>
              <strong className="text-xl font-black text-white mb-3 drop-shadow-sm">Daftar 10 Jamaah Safawi</strong>
              <div className="bg-amber-400 text-slate-950 px-4 py-1.5 rounded-full font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg">
                ✨ GRATIS 1 ORANG PAKET SAFAWI
              </div>
              <p className="text-xs sm:text-sm text-amber-200 font-bold mt-3 leading-snug drop-shadow-sm">
                Bonus 1 Tiket Keberangkatan Paket Safawi
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
