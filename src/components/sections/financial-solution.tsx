
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, BadgePercent, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Agent } from '@/lib/agents';

interface FinancialSolutionProps {
  agent?: Agent;
  data?: Record<string, any>;
}

export default function FinancialSolution({ agent }: FinancialSolutionProps) {
  const isDefault = agent?.slug?.toLowerCase() === 'default' || agent?.slug?.toLowerCase() === 'triyadi';
  const whatsappNumber = agent?.whatsapp || (isDefault ? '6283815862300' : '');

  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="finance-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0L48 32L80 40L48 48L40 80L32 48L0 40L32 32Z" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#finance-pattern)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto bg-white rounded-[3rem] overflow-hidden shadow-2xl border-4 border-accent/20">
          <div className="grid lg:grid-cols-5 items-stretch">
            <div className="lg:col-span-3 p-8 md:p-16 flex flex-col justify-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 bg-primary/5 text-primary font-bold px-4 py-2 rounded-full text-xs md:text-sm mb-6 uppercase tracking-widest">
                  <Wallet className="w-4 h-4" /> Solusi Pembiayaan
                </div>
                
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary mb-6 leading-tight">
                  Mau UMROH tapi <span className="text-accent">Terkendala Biaya?</span>
                </h2>
                
                <div className="bg-accent/10 border-l-4 border-accent p-4 mb-8">
                  <p className="text-primary font-bold text-lg md:text-xl">
                    INI DIA SOLUSINYA!
                  </p>
                  <p className="text-primary/80 mt-1 font-medium">
                    Program UMROH DULU BAYAR BELAKANGAN
                  </p>
                </div>

                <p className="text-muted-foreground text-base md:text-lg mb-8 leading-relaxed">
                  Hanya dengan <span className="font-bold text-primary">DP 7JT BISA BERANGKAT</span>. Samira Travel bekerjasama dengan lembaga keuangan syariah yang langsung diawasi oleh <span className="font-bold text-primary">OJK dan MUI</span>.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full bg-primary text-white hover:bg-accent hover:text-accent-foreground px-8 font-bold transition-all h-14 group">
                    <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                      Konsultasi Sekarang <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </Button>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-2 bg-accent p-8 md:p-12 flex flex-col justify-center items-center text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30">
                  <BadgePercent className="w-12 h-12 text-white" />
                </div>
                
                <div>
                  <h3 className="text-white text-4xl md:text-6xl font-headline font-bold mb-2">DP 7 JT</h3>
                  <p className="text-white/90 font-bold tracking-widest uppercase text-sm">BISA LANGSUNG BERANGKAT</p>
                </div>

                <div className="pt-8 border-t border-white/20">
                  <div className="flex items-center justify-center gap-3 text-white/80">
                    <ShieldCheck className="w-6 h-6" />
                    <span className="text-xs font-bold leading-tight text-left">
                      DIAWASI OLEH <br /> OJK & DEWAN SYARIAH MUI
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
