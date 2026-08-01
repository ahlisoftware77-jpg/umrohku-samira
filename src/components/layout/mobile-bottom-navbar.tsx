"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, BookOpen, Handshake, Package, ImageIcon, Send } from 'lucide-react';
import { Agent, getAgent } from '@/lib/agents';

interface MobileBottomNavbarProps {
  agent?: Agent;
}

export default function MobileBottomNavbar({ agent: providedAgent }: MobileBottomNavbarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMounted, setIsMounted] = useState(false);

  const agent = providedAgent || getAgent('default');
  const agentSlug = agent?.slug || 'default';
  const prefix = agentSlug === 'default' 
    ? (pathname?.startsWith('/triyadi') ? '/triyadi' : '') 
    : `/${agentSlug}`;

  const rawPhone = agent?.whatsapp || agent?.phone || '6283815862300';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Assalamu'alaikum,%20saya%20tertarik%20dengan%20layanan%20Paket%20Umrah%20Samira%20Travel.%20Mohon%20info%20detailnya.`;

  useEffect(() => {
    setIsMounted(true);
    if (pathname.includes('/kemitraan')) setActiveTab('kemitraan');
    else if (pathname.includes('/product-knowledge')) setActiveTab('katalog');
    else if (pathname.includes('/galeri')) setActiveTab('galeri');
    else if (pathname.includes('#paket')) setActiveTab('paket');
    else setActiveTab('home');
  }, [pathname]);

  if (!isMounted) return null;

  const items = [
    {
      id: 'home',
      label: 'Beranda',
      href: `${prefix}/`,
      icon: Home,
    },
    {
      id: 'paket',
      label: 'Paket',
      href: `${prefix}/#paket`,
      icon: Package,
    },
    {
      id: 'kemitraan',
      label: 'Kemitraan',
      href: `${prefix}/kemitraan`,
      icon: Handshake,
      isSpecial: true,
      badge: 'PROMO',
    },
    {
      id: 'galeri',
      label: 'Galeri',
      href: `${prefix}/galeri`,
      icon: ImageIcon,
    },
    {
      id: 'katalog',
      label: 'Katalog',
      href: `${prefix}/product-knowledge`,
      icon: BookOpen,
    },
    {
      id: 'whatsapp',
      label: 'Chat WA',
      href: waUrl,
      isExternal: true,
      icon: Send,
      isWa: true,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] md:hidden bg-[#061222]/95 backdrop-blur-2xl border-t-2 border-amber-400/80 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] px-1 py-1.5 pb-[calc(0.35rem+env(safe-area-inset-bottom,0px))]">
      <nav className="w-full flex items-center justify-around">
        
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'home' && (pathname === '/' || pathname === `${prefix}/`));

          if (item.isWa) {
            return (
              <motion.a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-md border border-emerald-300 shrink-0 cursor-pointer"
              >
                <Icon className="w-4 h-4 animate-pulse" />
                <span className="text-[8px] sm:text-[9px] font-black tracking-tight mt-0.5">{item.label}</span>
              </motion.a>
            );
          }

          if (item.isSpecial) {
            return (
              <Link key={item.id} href={item.href} onClick={() => setActiveTab(item.id)}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black'
                      : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border-amber-300'
                  }`}
                >
                  <span className="absolute -top-2 bg-slate-950 text-amber-400 text-[7px] font-black px-1.5 py-0.1 rounded-full border border-amber-400 uppercase tracking-widest animate-pulse">
                    {item.badge}
                  </span>
                  <Icon className="w-4 h-4 text-slate-950" />
                  <span className="text-[8px] sm:text-[9px] font-headline font-black tracking-tight mt-0.5">{item.label}</span>
                </motion.div>
              </Link>
            );
          }

          return (
            <Link key={item.id} href={item.href} onClick={() => setActiveTab(item.id)}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-amber-400 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMobileTabSticky"
                    className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'scale-110 text-amber-400' : ''}`} />
                <span className={`text-[8px] sm:text-[9px] font-bold tracking-tight mt-0.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}

      </nav>
    </div>
  );
}
