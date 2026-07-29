
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Ban, 
  Zap, 
  Heart, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent } from '@/lib/agents';

interface EmotionalCtaProps {
  agent?: Agent;
  data?: Record<string, any>;
}

const features = [
  { icon: <CheckCircle2 className="w-5 h-5 text-accent" />, text: "PASTI Berangkat" },
  { icon: <ShieldCheck className="w-5 h-5 text-accent" />, text: "PASTI Berasuransi" },
  { icon: <Ban className="w-5 h-5 text-accent" />, text: "TANPA Riba" },
  { icon: <Ban className="w-5 h-5 text-accent" />, text: "TANPA Agunan" },
  { icon: <Zap className="w-5 h-5 text-accent" />, text: "MUDAH Cicilannya" },
];

export default function EmotionalCta({ agent }: EmotionalCtaProps) {
  const isDefault = agent?.slug?.toLowerCase() === 'default' || agent?.slug?.toLowerCase() === 'triyadi';
  const whatsappNumber = agent?.whatsapp || (isDefault ? '6283815862300' : '');

  return (
    <section className="py-24 relative overflow-hidden bg-white">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/5 text-primary font-bold px-4 py-2 rounded-full text-xs uppercase tracking-widest mb-6">
                <Sparkles className="w-4 h-4 text-accent" /> MAU UMROH YANG PASTI?
              </div>
              
              <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6 leading-tight">
                Sudah <span className="text-accent">RINDU</span> Baitulloh tapi tabungannya belum cukup?
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Punya impian ingin memberangkatkan orang tua ke Tanah suci? Bagaimana kalau Berangkat UMROH dulu, BAYARnya belakangan? <strong>MAU?</strong>
              </p>

              <div className="bg-primary p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                
                <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-accent fill-accent" /> 
                  Ya, Berangkat Umroh Duluan, Bisa Dicicil Belakangan
                </h3>
                <p className="text-white/80 mb-8">
                  Fleksibilitas pembayaran yang memudahkan Anda: Boleh bayar bulanan atau bayar musiman 👍
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10">
                      {item.icon}
                      <span className="font-bold text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="relative z-10 bg-accent p-12 rounded-[3rem] text-center shadow-2xl border-8 border-white">
                <blockquote className="text-2xl md:text-4xl font-headline font-bold text-primary italic leading-tight mb-8">
                  "Panggilan Bukan Hanya Untuk Yang Mampu, Tapi Juga Yang Rindu"
                </blockquote>
                
                <div className="space-y-6">
                  <p className="text-primary/70 font-bold uppercase tracking-widest text-sm">Segera Amankan Seat Anda</p>
                  <Button asChild size="lg" className="w-full h-16 rounded-full bg-primary text-white hover:bg-white hover:text-primary text-xl font-bold shadow-xl transition-all group">
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                      RESERVATION NOW!! <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary rounded-full flex items-center justify-center text-accent shadow-xl animate-bounce">
                <Sparkles className="w-10 h-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
