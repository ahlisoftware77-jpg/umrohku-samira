
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Agent, getAgent } from '@/lib/agents';

interface FooterProps {
  agent?: Agent;
}

export default function Footer({ agent: providedAgent }: FooterProps) {
  const [year, setYear] = React.useState(new Date().getFullYear());

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const agent = providedAgent || getAgent('default');
  const agentSlug = agent?.slug || 'default';
  
  // Logic untuk rute fisik mitra
  const prefix = agentSlug === 'default' ? '' : `/${agentSlug}`;
  
  return (
    <footer className="bg-primary text-primary-foreground overflow-hidden w-full max-w-full">
      <div className="container mx-auto py-10 md:py-16 px-4 max-w-full overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8"
        >
          <div className="space-y-4 text-center sm:text-left">
            <Link href={`${prefix}/`} className="flex items-center justify-center sm:justify-start">
              <div className="relative h-16 md:h-28 w-48 sm:w-64 md:w-80 max-w-full">
                <Image
                  src="/images/Logo Umroh new season.png"
                  alt="SAMIRA Logo"
                  fill
                  className="object-contain object-center sm:object-left"
                />
              </div>
            </Link>
            <p className="text-xs md:text-sm text-primary-foreground/80 leading-relaxed mt-4">
              Mitra terpercaya Anda untuk perjalanan Haji dan Umrah. Rasakan spiritualitas dengan kenyamanan dan ketenangan pikiran bersama SAMIRA.
            </p>
            <div className="flex justify-center sm:justify-start space-x-4">
              <Link href="#" className="hover:text-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="hover:text-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="text-center sm:text-left lg:pl-8">
            <h3 className="font-semibold text-base md:text-lg font-headline text-white mb-4">Tautan Cepat</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href={`${prefix}/#tentang`} className="hover:text-accent text-primary-foreground/80 transition-colors">Tentang Kami</Link></li>
              <li><Link href={`${prefix}/#paket`} className="hover:text-accent text-primary-foreground/80 transition-colors">Paket</Link></li>
              <li><Link href={`${prefix}/kemitraan`} className="hover:text-accent text-amber-300 font-extrabold transition-colors">Program Kemitraan</Link></li>
              <li><Link href={`${prefix}/#testimoni`} className="hover:text-accent text-primary-foreground/80 transition-colors">Testimoni</Link></li>
              <li><Link href={`${prefix}/#alur`} className="hover:text-accent text-primary-foreground/80 transition-colors">Cara Kerja</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base md:text-lg font-headline text-white mb-4">Layanan</h3>
            <ul className="space-y-2 text-xs md:text-sm">
              <li><Link href={`${prefix}/paket/haji`} className="hover:text-accent text-primary-foreground/80 transition-colors">Paket Haji</Link></li>
              <li><Link href={`${prefix}/paket/reguler`} className="hover:text-accent text-primary-foreground/80 transition-colors">Paket Umrah</Link></li>
              <li><Link href={`${prefix}/paket/plus`} className="hover:text-accent text-primary-foreground/80 transition-colors">Wisata Islami</Link></li>
              <li><Link href={`${prefix}/kontak`} className="hover:text-accent text-primary-foreground/80 transition-colors">Bantuan Visa</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-base md:text-lg font-headline text-white mb-4">Info Kontak</h3>
            <ul className="space-y-4 text-xs md:text-sm">
              <li className="flex items-start justify-center sm:justify-start">
                <MapPin className="w-4 h-4 mr-3 mt-0.5 shrink-0 text-accent" />
                <div className="flex flex-col">
                  <span className="text-accent font-bold text-[10px] uppercase tracking-wider">{agent.displayName}</span>
                  <span className="text-primary-foreground/80">{agent.address}</span>
                </div>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Phone className="w-4 h-4 mr-3 shrink-0 text-accent" />
                <div className="flex flex-col">
                  <a href={`https://wa.me/${agent.whatsapp}`} className="hover:text-accent text-primary-foreground/80 transition-colors">{agent.phone}</a>
                </div>
              </li>
              <li className="flex items-center justify-center sm:justify-start">
                <Mail className="w-4 h-4 mr-3 shrink-0 text-accent" />
                <a href={`mailto:${agent.email}`} className="hover:text-accent text-primary-foreground/80 transition-colors">{agent.email}</a>
              </li>
            </ul>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="mt-12 border-t border-primary-foreground/20 pt-6 text-center text-[10px] md:text-sm text-primary-foreground/60"
        >
          <p>&copy; {year} SAMIRA. Dibuat oleh <a href="https://yadikomputer.my.id" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors font-medium">Yadikomputer</a>.</p>
        </motion.div>
      </div>
    </footer>
  );
}
