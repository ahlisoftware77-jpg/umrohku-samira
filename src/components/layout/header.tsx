"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen, Eye, Handshake, Home, Info, Package, ImageIcon, PhoneCall, Sparkles, Send, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Agent, getAgent } from '@/lib/agents';

interface HeaderProps {
  agent?: Agent;
}

export default function Header({ agent: providedAgent }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  
  const agent = providedAgent || getAgent('default');
  const agentSlug = agent?.slug || 'default';
  
  const rawPhone = agent?.whatsapp || agent?.phone || '6283815862300';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';
  const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Assalamu'alaikum,%20saya%20tertarik%20dengan%20layanan%20Paket%20Umrah%20Samira%20Travel.%20Mohon%20info%20detailnya.`;

  // Prefix untuk folder fisik (tanpa /agent/)
  const prefix = agentSlug === 'default' 
    ? (pathname?.startsWith('/triyadi') ? '/triyadi' : '') 
    : `/${agentSlug}`;
  const isHomePage = pathname === '/' || pathname === prefix || pathname === `${prefix}/`;

  const desktopNavLinks = [
    { href: `${prefix}/`, label: 'Beranda' },
    { href: `${prefix}/product-knowledge`, label: 'E-Katalog', icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
    { href: `${prefix}/#tentang`, label: 'Tentang Kami' },
    { href: `${prefix}/#paket`, label: 'Paket' },
    { href: `${prefix}/kemitraan`, label: 'Kemitraan', icon: <Handshake className="w-4 h-4 mr-1.5 text-amber-400" /> },
    { href: `${prefix}/galeri`, label: 'Galeri' },
    { href: `${prefix}/kontak`, label: 'Kontak' },
  ];

  const mobileNavLinks = [
    { href: `${prefix}/`, label: 'Beranda', icon: <Home className="w-5 h-5" /> },
    { href: `${prefix}/product-knowledge`, label: 'E-Katalog Digital', icon: <BookOpen className="w-5 h-5 text-amber-400" /> },
    { href: `${prefix}/#tentang`, label: 'Tentang Kami', icon: <Info className="w-5 h-5 text-blue-400" /> },
    { href: `${prefix}/#paket`, label: 'Pilihan Paket Umrah', icon: <Package className="w-5 h-5 text-emerald-400" /> },
    { href: `${prefix}/kemitraan`, label: 'Kemitraan Travel', icon: <Handshake className="w-5 h-5 text-amber-400" /> },
    { href: `${prefix}/galeri`, label: 'Galeri Dokumentasi', icon: <ImageIcon className="w-5 h-5 text-purple-400" /> },
    { href: `${prefix}/kontak`, label: 'Kontak Layanan', icon: <PhoneCall className="w-5 h-5 text-teal-400" /> },
  ];

  React.useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = scrolled || !isHomePage;

  return (
    <header className={cn(
      "fixed top-0 z-50 w-full max-w-full overflow-x-clip transition-all duration-500 px-3 sm:px-4",
      isSolid 
        ? "bg-background shadow-xl py-2 border-b border-border/50" 
        : "bg-transparent py-3 md:py-6"
    )}>
      <div className="container mx-auto flex items-center justify-between max-w-full">
        <Link href={`${prefix}/`} className="flex items-center group shrink-0">
          <div className={cn(
            "relative transition-all duration-300",
            isSolid 
              ? "h-10 sm:h-14 md:h-16 w-32 sm:w-44 md:w-60" 
              : "h-12 sm:h-16 md:h-24 w-36 sm:w-52 md:w-80"
          )}>
            <Image
              src="/images/Logo Umroh new season.png"
              alt="SAMIRA Logo"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        
        {/* Desktop Navbar */}
        <nav className="hidden md:flex items-center space-x-6">
          {desktopNavLinks.map((link) => {
            const isKemitraan = link.label === 'Kemitraan';
            const isActive = pathname === link.href || pathname === `${link.href}/`;

            if (isKemitraan) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-headline font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 border cursor-pointer",
                    isActive
                      ? "bg-amber-400 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-105"
                      : "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border-amber-300 hover:brightness-110 shadow-amber-500/20"
                  )}
                >
                  <Handshake className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Kemitraan</span>
                  <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase ml-0.5 border border-amber-400/50 animate-pulse">
                    PROMO
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:text-accent relative flex items-center after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full",
                  isSolid ? "text-foreground" : "text-white hover:text-white",
                  isActive && "text-accent after:w-full"
                )}
              >
                {link.icon && link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA & Visitor Counter */}
        <div className="hidden md:flex items-center space-x-3">
          {agent?.visitorCount !== undefined && agent.visitorCount > 0 && (
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all duration-300 backdrop-blur-md shadow-sm",
              isSolid 
                ? "bg-primary/10 border-primary/20 text-primary" 
                : "bg-white/15 border-white/30 text-white"
            )} title="Jumlah total pengunjung web ini">
              <Eye className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>{(agent.visitorCount || 0).toLocaleString()} Pengunjung</span>
            </div>
          )}

          <Button 
            asChild 
            variant={isSolid ? "default" : "outline"} 
            className={cn(
              "font-bold transition-all duration-300 px-6 rounded-full shadow-sm",
              !isSolid && "bg-transparent border-white text-white hover:bg-white hover:text-primary border-2"
            )}
          >
            <Link href={`${prefix}/#daftar`}>Dapatkan Penawaran</Link>
          </Button>
        </div>

        {/* ── MOBILE DRAWER TRIGGER & PRO INTERACTIVE SHEET ── */}
        <div className="md:hidden">
        {isMounted ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("transition-colors", isSolid ? "text-primary" : "text-white")}>
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[88vw] max-w-md bg-gradient-to-b from-[#0c223d] via-[#091f3a] to-[#05101d] border-l border-amber-400/40 text-white p-0 overflow-y-auto flex flex-col justify-between shadow-2xl">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Navigasi Mobile</SheetTitle>
                <SheetDescription>Jelajahi berbagai layanan resmi SAMIRA Travel dari HP Anda.</SheetDescription>
              </SheetHeader>

              <div>
                {/* Mobile Sheet Top Bar */}
                <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-slate-950/60 backdrop-blur-md sticky top-0 z-20">
                  <div className="relative h-12 w-44">
                    <Image
                      src="/images/Logo Umroh new season.png"
                      alt="SAMIRA Logo"
                      fill
                      className="object-contain object-left"
                    />
                  </div>

                  {agent?.visitorCount !== undefined && agent.visitorCount > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400/10 text-amber-300 border border-amber-400/30">
                      <Eye className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                      <span>{(agent.visitorCount || 0).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 block mb-2">
                    🧭 Menu Utama Navigasi
                  </span>

                  {mobileNavLinks.map((link) => {
                    const isKemitraan = link.label.includes('Kemitraan');
                    const isActive = pathname === link.href || pathname === `${link.href}/`;

                    if (isKemitraan) {
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsOpen(false)}
                          className="relative group bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-headline font-black text-base px-4 py-3.5 rounded-2xl shadow-lg flex items-center justify-between border-2 border-amber-300 my-2 transition-all active:scale-98 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-slate-950 text-amber-400 shadow-md">
                              <Handshake className="w-5 h-5" />
                            </div>
                            <span className="text-slate-950 font-headline font-black text-base">Kemitraan Travel</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-950 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full uppercase border border-amber-400/50 animate-pulse">
                              PROMO MITRA
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-950" />
                          </div>
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center justify-between p-3.5 rounded-2xl text-sm font-bold transition-all border border-transparent cursor-pointer",
                          isActive
                            ? "bg-amber-400/15 text-amber-300 border-amber-400/30 font-black"
                            : "text-slate-200 hover:bg-slate-800/60 hover:text-white"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl border transition-colors",
                            isActive ? "bg-amber-400 text-slate-950 border-amber-300" : "bg-slate-900/80 border-slate-800"
                          )}>
                            {link.icon}
                          </div>
                          <span className="font-headline font-extrabold text-base">{link.label}</span>
                        </div>

                        <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "text-amber-400 translate-x-0.5" : "text-slate-600")} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Drawer Bottom Action Box & License Guarantee */}
              <div className="p-5 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-sm shadow-xl hover:scale-102 transition-transform border border-emerald-400/40"
                >
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2">
                    <Send className="w-4 h-4" /> Konsultasi Umrah via WhatsApp
                  </a>
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium text-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>PT. Samira Ali Wisata · PPIU No. 16092100475620005</span>
                </div>
              </div>

            </SheetContent>
          </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="md:hidden opacity-0">
              <Menu className="h-7 w-7" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
