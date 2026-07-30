"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, Clock, MapPin, Send, MessageSquare, Sparkles, Building2, CheckCircle2 } from 'lucide-react';
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
  
  const isDefault = agent?.slug?.toLowerCase() === 'default' || agent?.slug?.toLowerCase() === 'triyadi';
  
  const rawPhone = data?.phone || agent?.whatsapp || agent?.phone || (isDefault ? '6283815862300' : '');
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const email = data?.email || agent?.email || (isDefault ? 'info@samiratravel.co.id' : '');
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
      embedUrl: cleanOfficePusatMapUrl || (pusatQueryText ? `https://www.google.com/maps?q=${encodeURIComponent(pusatQueryText)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : '')
    },
    mitra: {
      name: agent?.displayName || 'Kantor Cabang Mitra',
      address: address,
      embedUrl: cleanMapEmbedUrl || (partnerQueryText ? `https://www.google.com/maps?q=${encodeURIComponent(partnerQueryText)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : '')
    }
  };

  const currentMap = activeMapTab === 'pusat' ? maps.pusat : maps.mitra;

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
    <section id="kontak" className="py-20 bg-gradient-to-b from-slate-50 via-white to-slate-100 relative overflow-hidden scroll-mt-20">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xs uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {badgeText}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-5xl font-headline font-bold text-primary tracking-tight mb-4"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground text-base md:text-lg leading-relaxed"
          >
            {description}
          </motion.p>
        </div>

        {/* Content Grid: Contact Details & Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Map Embed */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* WhatsApp Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-primary text-sm mb-1">WhatsApp CS</h4>
                <p className="text-xs font-semibold text-slate-800 mb-2">+{cleanPhone}</p>
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  <MessageSquare className="w-3 h-3" /> Chat WhatsApp
                </a>
              </div>

              {/* Email Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-primary text-sm mb-1">Email Resmi</h4>
                <p className="text-xs font-medium text-slate-600 mb-2 truncate">{email}</p>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 hover:text-amber-700 underline"
                >
                  Kirim Email ↗
                </a>
              </div>

              {/* Hours Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-primary text-sm mb-1">Jam Layanan</h4>
                <p className="text-[11px] font-medium text-slate-600 leading-tight">{hours}</p>
                <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                  CS Online 24/7
                </span>
              </div>

            </div>

            {/* Google Maps Embed Cards Grid */}
            <div className={`grid grid-cols-1 ${isDefault ? '' : 'sm:grid-cols-2'} gap-6`}>
              
              {/* Map Card 1: Kantor Mitra (only if !isDefault) */}
              {!isDefault && (
                <Card className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-full bg-white">
                  <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold px-4">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <MapPin className="w-4 h-4" /> Kantor Mitra / Cabang
                    </span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps.mitra.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-amber-300 underline text-[10px]"
                    >
                      Buka Maps ↗
                    </a>
                  </div>
                  <div className="h-56 w-full bg-slate-100 flex items-center justify-center relative border-b">
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
                  <div className="p-4 bg-slate-50 flex-grow text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-primary block font-bold mb-1">Alamat Kantor Mitra:</strong>
                    {maps.mitra.address}
                  </div>
                </Card>
              )}

              {/* Map Card 2: Kantor Pusat */}
              <Card className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col h-full bg-white">
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between text-xs font-bold px-4">
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <MapPin className="w-4 h-4" /> Kantor Pusat Samira
                  </span>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(maps.pusat.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-amber-300 underline text-[10px]"
                  >
                    Buka Maps ↗
                  </a>
                </div>
                <div className="h-56 w-full bg-slate-100 flex items-center justify-center relative border-b">
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
                <div className="p-4 bg-slate-50 flex-grow text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-primary block font-bold mb-1">Alamat Kantor Pusat:</strong>
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
            <Card className="rounded-3xl border-0 shadow-2xl bg-white overflow-hidden p-6 md:p-8 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
              
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                  Tanya Kami & Konsultasi Gratis
                </span>
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary mt-3">
                  Kirim Pertanyaan Anda
                </h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Isi formulir di bawah ini untuk terhubung langsung dengan Konsultan Umrah kami via WhatsApp.
                </p>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-name" className="text-xs font-bold text-slate-700">Nama Lengkap Anda *</Label>
                  <Input
                    id="inquiry-name"
                    placeholder="Contoh: Bapak Ahmad Fauzi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-slate-200 h-11 text-sm focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-phone" className="text-xs font-bold text-slate-700">Nomor WhatsApp *</Label>
                    <Input
                      id="inquiry-phone"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="rounded-xl border-slate-200 h-11 text-sm focus:border-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="inquiry-city" className="text-xs font-bold text-slate-700">Kota Domisili</Label>
                    <Input
                      id="inquiry-city"
                      placeholder="Contoh: Jakarta / Bandung"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="rounded-xl border-slate-200 h-11 text-sm focus:border-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="inquiry-message" className="text-xs font-bold text-slate-700">Pertanyaan / Rencana Keberangkatan</Label>
                  <Textarea
                    id="inquiry-message"
                    placeholder="Tuliskan pertanyaan Anda, misal: 'Saya ingin bertanya paket umrah untuk 4 orang bulan Ramadhan 2026...'"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl border-slate-200 text-sm focus:border-primary resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl h-12 shadow-lg shadow-emerald-900/20 text-sm gap-2 transition-all transform hover:scale-[1.01] active:scale-95"
                  >
                    <Send className="w-4 h-4" /> Kirim Pesan via WhatsApp Direct
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-muted-foreground">
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
