"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, 
  Wallet, 
  FileText, 
  ShieldCheck, 
  BadgeCheck, 
  ChevronDown, 
  Search, 
  Sparkles, 
  MessageSquare,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FaqSectionProps {
  data?: Record<string, any>;
  agent?: any;
}

export default function HotelExplanation({ data, agent }: FaqSectionProps) {
  const [activeCategory, setActiveCategory] = useState<number>(0);
  const [openItem, setOpenItem] = useState<string | null>("0-0");
  const [searchQuery, setSearchQuery] = useState("");

  const badgeText = data?.badgeText || 'Pusat Bantuan & FAQ';
  const title = data?.title || 'HAL YANG SERING DITANYAKAN';
  const description = data?.description || 'Temukan jawaban cepat & transparan atas pertanyaan Anda seputar paket umroh, skema pembiayaan Amitra Syariah, alur pendaftaran, dan persyaratan dokumen.';

  const faqCategories = [
    {
      name: "Pembiayaan & Syariah",
      badge: "Skema Syariah",
      icon: <Wallet className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
      items: [
        {
          q: "Kalau yang Umroh orang tua tapi yang bayar anak/keluarga bisa tidak?",
          a: "Bisa sekali Bapak/Ibu. Pengajuan pembiayaan ke AMITRA SYARIAH dapat dilakukan atas nama Anda/penanggung jawab, dan peserta yang diberangkatkan adalah orang tua atau anggota keluarga Anda."
        },
        {
          q: "Bagaimana simulasi cicilan pembiayaan Umroh?",
          a: "Cukup membayar DP (Down Payment) awal sebesar 20% dari harga paket Umroh. Anda sudah bisa langsung berangkat Umroh! Pelunasan sisanya diangsur tiap bulan setelah Anda pulang dari Tanah Suci."
        },
        {
          q: "Apakah pembiayaan ini terbebas dari Riba?",
          a: "Insya Allah 100% AMAN dari RIBA. Pembiayaan bekerjasama dengan Amitra Syariah yang menggunakan akad Jual Beli / Ijaroh Multijasa resmi. Seluruh proses diawasi langsung oleh Dewan Syariah Nasional (DSN-MUI) & OJK."
        },
        {
          q: "Apa hukum Syariah dari (Berangkat Umroh Dulu Bayar Belakangan)?",
          a: "Sesuai Fatwa Dewan Syariah Nasional MUI No.44/DSN-MUI/VIII/2004 tentang Pembiayaan Multijasa. Yang ditransaksikan adalah FASILITAS JASA (Transportasi, Akomodasi, Bimbingan), bukan ibadahnya. Hal ini sah dan sesuai tuntunan syariat."
        }
      ]
    },
    {
      name: "Teknis Pendaftaran",
      badge: "Alur Pendaftaran",
      icon: <BadgeCheck className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
      items: [
        {
          q: "Bagaimana cara pendaftaran sistem Tunai / Cash?",
          a: "1. Pilih tanggal keberangkatan & paket yang diinginkan.\n2. Lakukan DP/Booking Seat Rp 7.000.000 & biaya perlengkapan.\n3. Pelunasan dilakukan maksimal 30 hari sebelum jadwal keberangkatan.\n4. Siap berangkat!"
        },
        {
          q: "Bagaimana cara pendaftaran sistem Angsuran / Pembiayaan Amitra?",
          a: "1. Hubungi konsultan kami & serahkan berkas (FC KTP, KK, Bukti Penghasilan/Usaha).\n2. Proses survei kilat oleh tim Amitra (kurang dari 7 hari kerja).\n3. Akad pembiayaan & pembayaran DP.\n4. Tentukan jadwal dan siap berangkat!"
        },
        {
          q: "Bagaimana jika alamat KTP berbeda dengan domisili sekarang?",
          a: "Tidak masalah. Anda cukup melampirkan Surat Keterangan Domisili dari RT/RW/Kelurahan setempat sebagai kelengkapan dokumen."
        }
      ]
    },
    {
      name: "Persyaratan & Dokumen",
      badge: "Dokumen Persyaratan",
      icon: <FileText className="w-5 h-5" />,
      color: "from-emerald-500 to-emerald-600",
      items: [
        {
          q: "Apa saja dokumen yang wajib disiapkan jamaah?",
          a: "1. PASPOR aktif minimal 8 bulan sebelum keberangkatan (nama minimal 2 kata).\n2. FC KTP & Kartu Keluarga (KK).\n3. Buku Nikah (bagi pasutri).\n4. Pasfoto 3x4 & 4x6 latar belakang putih 80% muka.\n5. Bukti Vaksin Covid-19 & Suntik Meningitis."
        },
        {
          q: "Berapa lama proses pembuatan visa dan kelengkapan dokumen?",
          a: "Dokumen jamaah diserahkan paling lambat 30-45 hari sebelum keberangkatan agar tim pengurusan visa dan manifes penerbangan dapat memprosesnya dengan tepat waktu."
        }
      ]
    },
    {
      name: "Fasilitas & Layanan",
      badge: "Standar Layanan",
      icon: <ShieldCheck className="w-5 h-5" />,
      color: "from-purple-500 to-purple-600",
      items: [
        {
          q: "Apa saja fasilitas yang sudah didapatkan jamaah?",
          a: "Tiket pesawat PP, Hotel bintang 3/4/5 di Makkah & Madinah (sesuai pilihan paket), Konsumsi 3x sehari masakan Indonesia, Bus AC Eksekutif, Perlengkapan Umrah premium, Tour Leader & Muthawwif berpengalaman, serta Air Zamzam (jika diizinkan KSA)."
        },
        {
          q: "Apakah dibimbing oleh Ustadz / Pembimbing berpengalaman?",
          a: "Ya! Setiap grup jamaah didampingi oleh Muthawwif (pembimbing ibadah) bersertifikat dan berilmu syar'i dari tanah air hingga selama di Tanah Suci."
        }
      ]
    }
  ];

  // Filtering for search
  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  const toggleAccordion = (val: string) => {
    setOpenItem(openItem === val ? null : val);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5 text-accent" /> {badgeText}
          </motion.span>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-headline font-extrabold text-primary mb-4 leading-tight"
          >
            {title}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm md:text-base leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Interactive Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto mt-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Cari pertanyaan... (misal: cicilan, syarat, paspor)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-13 rounded-2xl border-primary/20 bg-white shadow-lg shadow-primary/5 focus-visible:ring-primary font-medium text-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground hover:text-primary"
              >
                Bersihkan
              </button>
            )}
          </motion.div>
        </div>

        {/* Category Filter Tabs (only when not searching) */}
        {!searchQuery && (
          <div className="flex justify-center items-center gap-2 md:gap-3 flex-wrap mb-10">
            {faqCategories.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all duration-300 ${
                  activeCategory === idx
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                    : 'bg-white text-muted-foreground hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span className={activeCategory === idx ? 'text-accent' : 'text-primary'}>
                  {cat.icon}
                </span>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Accordion List */}
        <div className="max-w-4xl mx-auto">
          {searchQuery ? (
            /* Search Results View */
            filteredCategories.length > 0 ? (
              <div className="space-y-6">
                {filteredCategories.map((cat, catIdx) => (
                  <div key={catIdx} className="space-y-4">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-2">{cat.name}</span>
                    {cat.items.map((item, itemIdx) => {
                      const itemVal = `search-${catIdx}-${itemIdx}`;
                      const isOpen = openItem === itemVal;
                      return (
                        <div key={itemIdx} className="border border-slate-200/90 rounded-2xl bg-white shadow-sm overflow-hidden transition-all">
                          <button
                            onClick={() => toggleAccordion(itemVal)}
                            className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-bold text-primary hover:text-accent transition-colors"
                          >
                            <span className="text-sm md:text-base leading-snug">{item.q}</span>
                            <ChevronDown className={`w-5 h-5 shrink-0 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="px-5 md:px-6 pb-6 text-xs md:text-sm text-muted-foreground leading-relaxed border-t border-slate-100 pt-4 whitespace-pre-line bg-slate-50/50"
                              >
                                {item.a}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
                <HelpCircle className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-bold text-primary text-base">Pertanyaan tidak ditemukan</p>
                <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain atau langsung hubungi tim konsultan kami.</p>
              </div>
            )
          ) : (
            /* Categorized Active Tab View */
            <div className="space-y-4">
              {faqCategories[activeCategory].items.map((item, itemIdx) => {
                const itemVal = `${activeCategory}-${itemIdx}`;
                const isOpen = openItem === itemVal;
                return (
                  <motion.div
                    key={itemIdx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: itemIdx * 0.05 }}
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                      isOpen 
                        ? 'border-primary/30 bg-white shadow-xl shadow-primary/5 ring-1 ring-primary/20' 
                        : 'border-slate-200/80 bg-white hover:border-primary/20 hover:shadow-md'
                    }`}
                  >
                    <button
                      onClick={() => toggleAccordion(itemVal)}
                      className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4 font-bold text-primary group"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 transition-colors ${
                          isOpen ? 'bg-accent text-accent-foreground' : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
                        }`}>
                          {itemIdx + 1}
                        </span>
                        <span className="text-sm md:text-base leading-snug group-hover:text-accent transition-colors">
                          {item.q}
                        </span>
                      </div>
                      <div className={`p-2 rounded-xl transition-all duration-300 ${isOpen ? 'bg-primary/10 text-primary rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 whitespace-pre-line bg-gradient-to-b from-slate-50/80 to-white">
                            <div className="flex gap-3">
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                              <div className="space-y-2">
                                {item.a.split('\n').map((line, lIdx) => (
                                  <p key={lIdx} className={line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') ? 'font-semibold text-primary' : ''}>
                                    {line}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Consultation Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 bg-gradient-to-r from-primary via-primary/95 to-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10"
        >
          <div className="relative z-10 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 bg-accent/20 border border-accent/30 text-accent px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Pelayanan 24/7
            </span>
            <h3 className="text-2xl md:text-3xl font-headline font-bold mb-2">
              Masih Ada Pertanyaan Lain?
            </h3>
            <p className="text-white/80 text-xs md:text-sm leading-relaxed">
              Tim konsultan profesional Samira Travel siap membantu menjawab & membimbing proses pendaftaran ibadah Anda.
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            {agent?.whatsapp ? (
              <Button asChild className="bg-accent text-accent-foreground hover:bg-white hover:text-primary rounded-2xl h-14 px-8 font-bold text-base shadow-lg transition-all">
                <a href={`https://wa.me/${agent.whatsapp}?text=Assalamu'alaikum,%20saya%20ingin%20bertanya%20seputar%20paket%20umroh`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Konsultasi via WhatsApp <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            ) : (
              <Button asChild className="bg-accent text-accent-foreground hover:bg-white hover:text-primary rounded-2xl h-14 px-8 font-bold text-base shadow-lg transition-all">
                <a href="#kontak" className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Hubungi Kami <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
