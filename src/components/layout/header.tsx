
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen } from 'lucide-react';
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
  
  // Prefix untuk folder fisik (tanpa /agent/)
  const prefix = agentSlug === 'default' ? '' : `/${agentSlug}`;
  const isHomePage = pathname === '/' || pathname === prefix || pathname === `${prefix}/`;

  const navLinks = [
    { href: `${prefix}/`, label: 'Beranda' },
    { href: `${prefix}/product-knowledge`, label: 'E-Katalog', icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
    { href: `${prefix}/#tentang`, label: 'Tentang Kami' },
    { href: `${prefix}/#paket`, label: 'Paket' },
    { href: `${prefix}/galeri`, label: 'Galeri' },
    { href: `${prefix}/kontak`, label: 'Kontak' },
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
      "fixed top-0 z-50 w-full transition-all duration-500 px-4",
      isSolid 
        ? "bg-background shadow-xl py-2 border-b border-border/50" 
        : "bg-transparent py-4 md:py-6"
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <Link href={`${prefix}/`} className="flex items-center group">
          <div className={cn(
            "relative transition-all duration-300",
            isSolid 
              ? "h-14 md:h-16 w-44 md:w-60" 
              : "h-16 md:h-24 w-52 md:w-80"
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
        
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-bold uppercase tracking-widest transition-all duration-300 hover:text-accent relative flex items-center after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-accent after:transition-all hover:after:w-full",
                isSolid ? "text-foreground" : "text-white hover:text-white",
                (pathname === link.href || pathname === `${link.href}/`) && "text-accent after:w-full"
              )}
            >
              {link.icon && link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
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

        <div className="md:hidden">
        {isMounted ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("transition-colors", isSolid ? "text-primary" : "text-white")}>
                <Menu className="h-8 w-8" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-primary border-none text-primary-foreground p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Menu Navigasi</SheetTitle>
                <SheetDescription>Gunakan menu ini untuk menjelajahi berbagai layanan SAMIRA Travel.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <div className="relative h-14 w-48">
                    <Image
                      src="/images/Logo Umroh new season.png"
                      alt="SAMIRA Logo"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                </div>
                <div className="flex flex-col space-y-6 p-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "text-2xl font-headline font-bold hover:text-accent transition-colors flex items-center",
                        (pathname === link.href || pathname === `${link.href}/`) && "text-accent"
                      )}
                    >
                      {link.icon && <span className="mr-3">{link.icon}</span>}
                      {link.label}
                    </Link>
                  ))}
                  <div className="pt-8">
                    <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-6 h-auto rounded-xl">
                      <Link href={`${prefix}/#daftar`} onClick={() => setIsOpen(false)}>Hubungi Kami</Link>
                    </Button>
                  </div>
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
