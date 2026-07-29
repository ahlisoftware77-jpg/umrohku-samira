"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const bankAccounts = [
  {
    bankName: "PermataBank Syariah",
    logoUrl: "/images/permatasyariah.png",
    accounts: [
      { number: "1810717676", currency: "IDR" },
      { number: "1810827676", currency: "USD" }
    ],
    color: "border-green-600",
  },
  {
    bankName: "Mandiri",
    logoUrl: "/images/mandiri.png",
    accounts: [
      { number: "1660031767676", currency: "IDR" },
      { number: "1660064767676", currency: "USD" }
    ],
    color: "border-blue-700",
  },
  {
    bankName: "BSI (Bank Syariah Indonesia)",
    logoUrl: "/images/BSI.png",
    accounts: [
      { number: "1976076766", currency: "IDR" }
    ],
    color: "border-emerald-500",
  }
];

export default function PaymentInfo() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-accent font-bold uppercase tracking-widest text-sm mb-2">Informasi Transaksi</p>
          <h2 className="text-2xl md:text-4xl font-headline font-bold text-primary">Metode Pembayaran Resmi</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
            Demi keamanan dan kenyamanan Anda, mohon lakukan pembayaran hanya ke rekening resmi atas nama perusahaan kami.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {bankAccounts.map((bank, idx) => (
            <motion.div
              key={bank.bankName}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`overflow-hidden border-t-4 ${bank.color} shadow-lg hover:shadow-xl transition-all duration-300 h-full`}>
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="relative h-28 w-full mb-4 flex items-center justify-center">
                      <Image 
                        src={bank.logoUrl} 
                        alt={`Logo ${bank.bankName}`}
                        width={280}
                        height={100}
                        className="object-contain max-h-24 w-auto"
                      />
                    </div>
                    <h3 className="font-headline font-bold text-primary text-lg leading-tight mt-2">
                      {bank.bankName}
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {bank.accounts.map((acc, i) => (
                      <div key={i} className="flex flex-col items-center text-center bg-muted/20 p-4 rounded-xl border border-primary/5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Nomor Rekening ({acc.currency})
                        </span>
                        <span className="text-lg md:text-2xl font-bold text-primary tracking-tighter">
                          {acc.number}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto p-8 md:p-12 rounded-[2.5rem] bg-primary text-white text-center shadow-2xl relative overflow-hidden"
        >
          <CheckCircle2 className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 rotate-12" />
          
          <div className="relative z-10">
            <h4 className="text-accent font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-6">Seluruh Rekening Atas Nama:</h4>
            <div className="inline-block px-6 py-4 md:px-12 md:py-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
              <span className="text-2xl md:text-5xl font-headline font-bold tracking-tight">
                PT. Samira Ali Wisata
              </span>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3 text-white/70 text-xs md:text-base font-medium">
              <CreditCard className="w-5 h-5 text-accent" />
              <span>Simpan bukti transfer Anda untuk proses konfirmasi yang lebih cepat.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
