"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, Send, MessageSquare, Sparkles, Building2, CheckCircle2, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Agent } from '@/lib/agents';

interface ContactSectionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function ContactSection({ agent, data }: ContactSectionProps) {
  const badgeText = data?.badgeText || 'Hubungi Kami & Konsultasi';
  const title = data?.title || 'Konsultasi Perjalanan Umrah & Haji Anda';
  const description = data?.description || 'Tim konsultan profesional kami siap melayani pertanyaan, konsultasi jadwal, dan bantuan pendaftaran ibadah keluarga Anda 24/7.';
  
  const isDefault = agent?.slug?.toLowerCase() === 'default';
  
  const rawPhone = data?.phone || agent?.whatsapp || agent?.phone || (isDefault ? '6283815862300' : '6283815862300');
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';
  const email = data?.email || agent?.email || (isDefault ? 'info@samiratravel.co.id' : 'info@samiratravel.co.id');
  const address = data?.address || agent?.address || (isDefault ? 'Jl. Malaka Merah No.7/6, Pd. Kopi, Kec. Duren Sawit, Kota Jakarta Timur 13460' : (agent?.displayName || 'Kantor Cabang Mitra'));
  const hours = data?.hours || 'Senin - Sabtu: 08.30 - 17.30 WIB';
  const mapEmbedUrl = data?.mapUrl || agent?.mapEmbedUrl || (isDefault ? 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.335553198888!2d106.941916!3d-6.2194!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698ca30e181fdf%3A0x6a1529124239860b!2sJl.%20Malaka%20Merah%20No.7%2F6%2C%20RT.7%2FRW.6%2C%20Pd.%20Kopi%2C%20Kec.%20Duren%20Sawit%2C%20Kota%20Jakarta%20Timur%2C%20Daerah%20Khusus%20Ibukota%20Jakarta%2013460!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid' : '');

  const [activeMapTab, setActiveMapTab] = useState<'mitra' | 'pusat'>(isDefault ? 'pusat' : 'mitra');

  const extractSrcUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('<iframe')) {
      const match = url.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return url.trim();
  };

  const cleanMapEmbedUrl = extractSrcUrl(mapEmbedUrl);
  const cleanOfficePusatMapUrl = extractSrcUrl(data?.officePusatMapUrl);

  const partnerBusinessName = agent?.displayName && agent.displayName !== 'Kantor Cabang Mitra' ? agent.displayName : '';
  const partnerQueryText = partnerBusinessName && !address.toLowerCase().includes(partnerBusinessName.toLowerCase())
    ? `${partnerBusinessName}, ${address}`
    : address;

  const pusatBusinessName = 'Samira Travel Pusat';
  const rawPusatAddress = data?.officePusatAddress || 'Jl. Malaka Merah No.7/6, Pd. Kopi, Kec. Duren Sawit, Kota Jakarta Timur 13460';
  const pusatQueryText = rawPusatAddress.toLowerCase().includes('samira')
    ? rawPusatAddress
    : `${pusatBusinessName}, ${rawPusatAddress}`;

  const maps = {
    pusat: {
      name: 'Kantor Pusat Samira Travel',
      address: rawPusatAddress,
      embedUrl: cleanOfficePusatMapUrl || 'https://www.google.com/maps?q=Samira%20Travel%20-%20Kantor%20Pusat&t=&z=15&ie=UTF8&iwloc=&output=embed'
    },
    mitra: {
      name: agent?.displayName || 'Kantor Cabang Mitra',
      address: address,
      embedUrl: cleanMapEmbedUrl || (partnerQueryText ? `https://www.google.com/maps?q=${encodeURIComponent(partnerQueryText)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : '')
    }
  };

  // Form State for "Tanya Kami"
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    message: ''
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Assalamu'alaikum Konsultan Samira Travel,%0A%0ANama: ${encodeURIComponent(formData.name || 'Hamba Allah')}%0ANo. WA: ${encodeURIComponent(formData.phone || '-')}%0AKota Asal: ${encodeURIComponent(formData.city || '-')}%0A%0APertanyaan / Rencana Umrah:%0A${encodeURIComponent(formData.message || 'Saya ingin berkonsultasi mengenai paket umrah terbaru.')}`;
    
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="kontak" className="py-14 sm:py-24 md:py-28 bg-gradient-to-b from-slate-50 via-white to-slate-100 relative overflow-hidden scroll-mt-20 w-full max-w-full">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-3 sm:px-4 md:px-6 relative z-10 max-w-6xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest mb-3.5 shadow-md border border-amber-300"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            {badgeText}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-primary tracking-tight mb-3 leading-tight"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-700 text-xs sm:text-base md:text-lg leading-relaxed font-semibold max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        </div>

        {/* Content Grid: Contact Details & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Left Column: Contact Cards & Map Embed */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-4 sm:space-y-6"
          >
            {/* Contact Info Cards Grid - 2 cols on mobile for compact elegance */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
              
              {/* WhatsApp Card */}
              <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-400/50 transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                  <Phone className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-extrabold text-primary text-xs sm:text-sm mb-0.5">WhatsApp CS</h4>
                <p className="text-[11px] sm:text-xs font-bold text-slate-800 mb-2 truncate">+{cleanPhone}</p>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-emerald-600 hover:text-emerald-700"
                >
                  <MessageSquare className="w-3 h-3" /> Chat WA <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Email Card */}
              <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 group hover:-translate-y-1 cursor-pointer">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                  <Mail className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-extrabold text-primary text-xs sm:text-sm mb-0.5">Email Resmi</h4>
                <p className="text-[11px] sm:text-xs font-bold text-slate-700 mb-2 truncate">{email}</p>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-extrabold text-amber-600 hover:text-amber-700"
                >
                  Kirim Email <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-sky-400/50 transition-all duration-300 group hover:-translate-y-1 col-span-2 sm:col-span-1 cursor-pointer">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform shadow-2xs">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h4 className="font-extrabold text-primary text-xs sm:text-sm mb-0.5">Jam Layanan</h4>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mb-2">{hours}</p>
                <span className="inline-block text-[9px] font-black uppercase tracking-wider text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                  CS Online 24/7
                </span>
              </div>

            </div>

            {/* Google Maps Embed Cards Grid */}
            <div className={`grid grid-cols-1 ${isDefault ? '' : 'sm:grid-cols-2'} gap-4 sm:gap-6`}>
              
              {/* Map Card 1: Kantor Mitra (only if !isDefault) */}
              {!isDefault && (
                <Card className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-full bg-white">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold px-4">
                    <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                      <MapPin className="w-4 h-4" /> Kantor Mitra / Cabang
                    </span>
                  </div>
                  <div className="h-48 sm:h-56 w-full bg-slate-100 flex items-center justify-center relative border-b">
                    {maps.mitra.embedUrl ? (
                      <iframe
                        src={maps.mitra.embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={maps.mitra.name}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 text-center text-muted-foreground gap-1 bg-slate-50 w-full h-full border border-dashed border-slate-200">
                        <MapPin className="w-6 h-6 text-slate-300" />
                        <span className="text-[11px] font-bold text-slate-400">Peta Mitra Belum Dikonfigurasi</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3.5 sm:p-4 bg-slate-50 flex-grow text-[11px] text-slate-700 leading-relaxed font-medium">
                    <strong className="text-primary block font-extrabold mb-0.5">Alamat Kantor Mitra:</strong>
                    {maps.mitra.address}
                  </div>
                </Card>
              )}

              {/* Map Card 2: Kantor Pusat */}
              <Card className="rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-full bg-white">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold px-4">
                  <span className="flex items-center gap-1.5 text-amber-300 font-extrabold">
                    <MapPin className="w-4 h-4" /> Kantor Pusat Samira
                  </span>
                </div>
                <div className="h-48 sm:h-56 w-full bg-slate-100 flex items-center justify-center relative border-b">
                  <iframe
                    src={maps.pusat.embedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={maps.pusat.name}
                  />
                </div>
                <div className="p-3.5 sm:p-4 bg-slate-50 flex-grow text-[11px] text-slate-700 leading-relaxed font-medium">
                  <strong className="text-primary block font-extrabold mb-0.5">Alamat Kantor Pusat:</strong>
                  {maps.pusat.address}
                </div>
              </Card>

            </div>

          </motion.div>

          {/* Right Column: Tanya Kami / Form Konsultasi */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <Card className="rounded-2xl sm:rounded-3xl border-2 border-primary/20 shadow-2xl bg-white overflow-hidden p-5 sm:p-8 relative">
              <div className="absolute top-0 right-0 w-36 h-36 bg-amber-400/10 rounded-bl-full pointer-events-none" />
              
              <div className="mb-6">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-3 py-1 rounded-full border border-amber-300 shadow-2xs inline-flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5" /> Tanya Kami & Konsultasi Gratis
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-headline font-black text-primary mt-3 leading-tight">
                  Kirim Pertanyaan / Rencana Umrah
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                  Isi formulir di bawah ini untuk terhubung langsung dengan Konsultan Umrah kami via WhatsApp.
                </p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-name" className="text-xs font-extrabold text-slate-800">Nama Lengkap Anda *</Label>
                  <Input
                    id="inquiry-name"
                    placeholder="Contoh: Bapak Ahmad Fauzi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-phone" className="text-xs font-extrabold text-slate-800">Nomor WhatsApp *</Label>
                    <Input
                      id="inquiry-phone"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-city" className="text-xs font-extrabold text-slate-800">Kota Domisili</Label>
                    <Input
                      id="inquiry-city"
                      placeholder="Contoh: Jakarta / Bandung"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="rounded-xl border-slate-200 h-11 text-xs sm:text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-message" className="text-xs font-extrabold text-slate-800">Pertanyaan / Rencana Keberangkatan</Label>
                  <Textarea
                    id="inquiry-message"
                    placeholder="Tuliskan pertanyaan Anda, misal: 'Saya ingin bertanya paket umrah untuk 4 orang bulan Ramadhan 2026...'"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl border-slate-200 text-xs sm:text-sm focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none font-medium"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl sm:rounded-2xl h-13 shadow-xl shadow-emerald-500/25 text-xs sm:text-sm gap-2 transition-all border border-emerald-300/40 transform hover:scale-[1.01] active:scale-95"
                  >
                    <Send className="w-4 h-4" /> Kirim Pesan via WhatsApp Direct
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-slate-600 font-extrabold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Respon Cepat & Tanpa Biaya Konsultasi (Gratis)</span>
                </div>
              </form>
            </Card>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
