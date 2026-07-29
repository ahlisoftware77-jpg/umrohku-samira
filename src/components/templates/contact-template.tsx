
"use client";

import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MapPin, 
  Building2,
  Instagram,
  Facebook,
  Twitter,
  Wallet,
  FileText,
  BadgeCheck,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Agent } from '@/lib/agents';

interface ContactTemplateProps {
  agent: Agent;
}

export default function ContactTemplate({ agent }: ContactTemplateProps) {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Pesan Terkirim",
      description: "Terima kasih telah menghubungi kami. Tim konsultan kami akan segera menghubungi Anda.",
    });
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-accent" />,
      title: "Telepon / WhatsApp",
      detail: agent.phone,
      description: "Tersedia Senin-Minggu, 08:00 - 20:00 WIB"
    },
    {
      icon: <Mail className="w-6 h-6 text-accent" />,
      title: "Email Resmi",
      detail: agent.email,
      description: "Kirimkan pertanyaan kapan saja."
    },
    {
      icon: <Clock className="w-6 h-6 text-accent" />,
      title: "Jam Operasional",
      detail: "Senin - Jumat: 08:30 - 17:30",
      description: "Sabtu: 08:30 - 14:00"
    }
  ];

  const locations = [
    {
      type: "Kantor Pusat",
      address: "Jl. Malaka Merah No.7/6, Pd. Kopi, Kec. Duren Sawit, Jakarta Timur 13460",
      name: "Samira Travel - Kantor Pusat",
      mapLink: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.335553198888!2d106.941916!3d-6.2194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698ca30e181fdf%3A0x6a1529124239860b!2sJl.%20Malaka%20Merah%20No.7%2F6%2C%20RT.7%2FRW.6%2C%20Pd.%20Kopi%2C%20Kec.%20Duren%20Sawit%2C%20Kota%20Jakarta%20Timur%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2013460!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
    },
    {
      type: agent.displayName,
      address: agent.address,
      name: `${agent.name} - Mitra Samira`,
      mapLink: agent.mapEmbedUrl
    }
  ];

  const faqs = [
    {
      category: "Pembiayaan & Amitra Syariah",
      icon: <Wallet className="w-5 h-5" />,
      items: [
        {
          q: "Kalau yang Umroh orang tua tapi yang bayar saya bisa tidak?",
          a: "Bisa Bapak/Ibu, jadi nanti ketika mengajukan ke AMITRA SYARIAH, atas nama Bapak/Ibu, adapun yang nanti berangkat orang tuanya, itu tidak menjadi masalah."
        },
        {
          q: "Simulasi cicilannya bagaimana?",
          a: "Jadi, cukup dengan membayar DP saja sebesar 20% dari harga paket Umrohnya, Ibu/Bapak sudah bisa berangkat Umroh, nanti pulangnya baru membayar secara diangsur setiap bulannya."
        },
        {
          q: "Kok bagi hasilnya besar banget?",
          a: "Betul Ibu/Bapak, bagi hasilnya memang terlihat demikian, namun kita mendapatkan manfaat tenggang waktu membayar hingga 3 tahun, prosesnya pun mudah, tidak perlu ada jaminan yang diambil, hanya perlu kelengkapan data dan verifikasi saat disurvey. Jika Ibu ingin yang lebih kecil bagi hasilnya, bisa ambil yang 1 tahun saja, kisaran bagi hasilnya jauh lebih rendah."
        },
        {
          q: "Riba tidak itu?",
          a: "Insya Allah pembiayaan bersama Amitra Syariah AMAN dari RIBA, karena kita menggunakan akad jual beli/Ijaroh Multijasa, Amitra Syariah pun langsung diawasi oleh Dewan Syariah Nasional MUI dan OJK."
        }
      ]
    },
    {
      category: "Teknis Pendaftaran",
      icon: <BadgeCheck className="w-5 h-5" />,
      items: [
        {
          q: "Cara daftarnya gimana? (Sistem Cash/Tunai)",
          a: "1. Jamaah menentukan tanggal keberangkatan.\n2. Membayar booking seat Rp 7.000.000 dan perlengkapan Rp 1.500.000.\n3. Pelunasan dilakukan 30 hari sebelum keberangkatan.\n4. Berangkat."
        },
        {
          q: "Cara daftarnya gimana? (Sistem Pembiayaan Amitra/Nyicil)",
          a: "1. Pengajuan ke Amitra melalui agen-agen kami di setiap kota.\n2. Menyerahkan berkas (FC KTP, KK, slip gaji/surat keterangan usaha dari kelurahan).\n3. Proses survei oleh pihak Amitra.\n4. Akad (jamaah membayarkan DP dan biaya admin) lalu menentukan tanggal keberangkatan.\n5. Berangkat (proses Amitra biasanya kurang dari 7 hari kerja)."
        },
        {
          q: "Kalau alamat KTP sama domisili sekarang berbeda bagaimana?",
          a: "Boleh, tidak masalah. Jamaah tinggal meminta surat keterangan domisili dari kelurahan tempat tinggal sekarang sebagai kelengkapan berkas."
        }
      ]
    },
    {
      category: "Persyaratan & Dokumen",
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          q: "Syarat pendaftaran apa saja?",
          a: "1. PASPOR dengan nama minimal 3 kata yang masih berlaku sampai 6 bulan sebelum tanggal keberangkatan.\n2. Buku kuning suntik Meningitis & Vaksin Influenza.\n3. Kartu Keluarga + Surat Nikah bagi yang berangkat suami istri.\n4. FC KTP (atau Surat Keterangan e-KTP).\n5. Foto Berwarna background putih, muka 80%, wanita berjilbab tidak berbaju putih (Ukuran 4x6 & 3x4 masing-masing 5 lembar).\n6. Dokumen diserahkan 30 hari sebelum keberangkatan."
        }
      ]
    },
    {
      category: "Aspek Syariah",
      icon: <ShieldCheck className="w-5 h-5" />,
      items: [
        {
          q: "Bagaimana hukum secara Syariah (Umroh Dulu Bayar Belakangan)?",
          a: "DGi Travel bekerjasama dengan LKS (Lembaga Keuangan Syariah AMITRA) untuk pembiayaan perjalanan ibadah Umroh yang diawasi oleh Dewan Syariah MUI dan OJK. Hal ini sesuai dengan Fatwa Dewan Syariah Nasional MUI No.44/DSN-MUI/VIII/2004 tentang Pembiayaan Multijasa.\n\nAkad yang digunakan adalah JUAL BELI / IJAROH MULTI JASA. Yang kita jual adalah FASILITASNYA (Transportasi, Akomodasi, Konsumsi, Bimbingan), bukan IBADAHNYA. Insya Allah aman, nyaman, dan sesuai tuntunan Rasulullah SAW."
        }
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header agent={agent} />
      
      <main className="flex-1">
        <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 bg-primary overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="contact-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#contact-pattern)" />
            </svg>
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-accent font-bold uppercase tracking-widest text-sm mb-4">Hubungi Kami</p>
              <h1 className="text-3xl md:text-6xl font-headline font-bold text-white mb-6">
                Kami Siap Membantu Perjalanan Suci Anda
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                Punya pertanyaan mengenai paket Umroh, Haji, atau Halal Tour? Konsultan kami siap memberikan informasi yang Anda butuhkan.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-8">
                <div>
                  <h2 className="text-2xl font-headline font-bold text-primary mb-6">Informasi Kontak</h2>
                  <div className="space-y-6">
                    {contactInfo.map((info, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-primary/5"
                      >
                        <div className="bg-white p-3 rounded-xl shadow-sm text-primary shrink-0">
                          {info.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-primary text-sm">{info.title}</h4>
                          <p className="text-primary font-medium text-sm md:text-base">{info.detail}</p>
                          <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-primary text-white">
                  <h3 className="text-xl font-headline font-bold mb-4">Media Sosial</h3>
                  <p className="text-sm text-white/70 mb-6">Ikuti kami untuk mendapatkan update jadwal keberangkatan dan tips ibadah terbaru.</p>
                  <div className="flex gap-4">
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 bg-white/10 hover:bg-accent hover:text-accent-foreground">
                      <Instagram className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 bg-white/10 hover:bg-accent hover:text-accent-foreground">
                      <Facebook className="w-5 h-5" />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 bg-white/10 hover:bg-accent hover:text-accent-foreground">
                      <Twitter className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                  <CardContent className="p-8 md:p-12">
                    <div className="mb-10">
                      <h2 className="text-2xl md:text-3xl font-headline font-bold text-primary mb-2">Kirim Pesan</h2>
                      <p className="text-muted-foreground">Isi formulir di bawah ini, dan kami akan merespons dalam waktu 1x24 jam.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input id="name" placeholder="Contoh: Ahmad Fauzi" required className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                          <Input id="whatsapp" placeholder={`Contoh: ${agent.whatsapp}`} required className="rounded-xl h-12" />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Alamat Email</Label>
                        <Input id="email" type="email" placeholder="nama@email.com" required className="rounded-xl h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Layanan yang Ditanyakan</Label>
                        <Input id="subject" placeholder="Contoh: Paket Umroh Ramadan" required className="rounded-xl h-12" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Pesan Anda</Label>
                        <Textarea id="message" placeholder="Tuliskan pertanyaan Anda di sini..." required className="rounded-xl min-h-[150px]" />
                      </div>

                      <Button type="submit" className="w-full md:w-auto px-10 h-14 rounded-full bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold text-lg transition-all">
                        Kirim Sekarang <Send className="w-5 h-5 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary mb-4">
                Lokasi Kantor & Cabang
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Silakan kunjungi lokasi terdekat untuk mendapatkan layanan konsultasi secara langsung.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {locations.map((loc, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="bg-white p-8 rounded-[2rem] shadow-xl border border-primary/5 flex flex-col gap-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <span className="text-accent font-bold text-xs uppercase tracking-widest">{loc.type}</span>
                      <h3 className="text-xl font-headline font-bold text-primary">{loc.name}</h3>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-5 h-5 text-accent shrink-0 mt-1" />
                    <p className="text-sm md:text-base leading-relaxed">{loc.address}</p>
                  </div>

                  {loc.mapLink ? (
                    <div className="mt-auto pt-6 w-full h-[300px] rounded-2xl overflow-hidden shadow-inner border border-muted">
                      <iframe 
                        src={loc.mapLink} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen={true} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Maps ${loc.name}`}
                      ></iframe>
                    </div>
                  ) : (
                    <div className="mt-auto pt-6 w-full h-[300px] rounded-2xl border border-dashed border-muted flex flex-col items-center justify-center bg-muted/10 text-muted-foreground gap-2">
                      <MapPin className="w-8 h-8 text-muted-foreground/50" />
                      <span className="text-xs font-bold">Peta Lokasi Belum Ditambahkan</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-5xl font-headline font-bold text-primary mb-4">
                HAL YANG SERING DITANYAKAN
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Temukan jawaban cepat atas pertanyaan seputar pendaftaran, pembiayaan syariah, dan persyaratan Umroh.
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-12">
              {faqs.map((group, groupIdx) => (
                <div key={groupIdx}>
                  <div className="flex items-center gap-3 mb-6 border-b border-muted pb-3">
                    <div className="bg-primary/10 p-2 rounded-lg text-primary">
                      {group.icon}
                    </div>
                    <h3 className="text-xl font-headline font-bold text-primary uppercase tracking-tight">
                      {group.category}
                    </h3>
                  </div>
                  <Accordion type="single" collapsible className="w-full space-y-4">
                    {group.items.map((item, itemIdx) => (
                      <AccordionItem 
                        key={itemIdx} 
                        value={`${groupIdx}-${itemIdx}`}
                        className="border border-muted rounded-2xl px-6 bg-muted/10 data-[state=open]:bg-white data-[state=open]:shadow-lg transition-all"
                      >
                        <AccordionTrigger className="text-left font-bold text-primary hover:no-underline py-4">
                          {item.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-line pb-6 pt-2">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            <div className="mt-20 p-10 rounded-[3rem] bg-muted/30 border border-primary/5 text-center max-w-3xl mx-auto">
              <p className="text-muted-foreground mb-4">Masih butuh bantuan atau penjelasan lebih rincin?</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="rounded-full h-12 px-8 font-bold bg-primary text-white hover:bg-accent transition-all">
                  <a href={`https://wa.me/${agent.whatsapp}`} target="_blank" rel="noopener noreferrer">Chat WhatsApp Konsultan</a>
                </Button>
                <Button asChild variant="outline" className="rounded-full h-12 px-8 font-bold border-primary text-primary hover:bg-primary hover:text-white">
                  <a href={`mailto:${agent.email}`}>Kirim Email Pertanyaan</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer agent={agent} />
    </div>
  );
}
