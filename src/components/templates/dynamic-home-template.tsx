"use client";

import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HeroSection from '@/components/sections/hero';
import FeaturedPackages from '@/components/sections/featured-packages';
import HotelExplanation from '@/components/sections/hotel-explanation';
import WhySamira from '@/components/sections/why-samira';
import WhyUmrah from '@/components/sections/why-umrah';
import FinancialSolution from '@/components/sections/financial-solution';
import EmotionalCta from '@/components/sections/emotional-cta';
import AboutUs from '@/components/sections/about-us';
import MuriAwards from '@/components/sections/muri-awards';
import Testimonials from '@/components/sections/testimonials';
import RegistrationFlow from '@/components/sections/registration-flow';
import ContactSection from '@/components/sections/contact-section';
import SocialMediaSection from '@/components/sections/social-media-section';
import MitraPromoSection from '@/components/sections/mitra-promo-section';
import FaqSection from '@/components/sections/faq-section';
import ProductKnowledgeSection from '@/components/sections/product-knowledge-section';
import BuilderPromoBanner from '@/components/sections/builder-promo-banner';
import FinalCta from '@/components/sections/final-cta';
import GallerySection from '@/components/sections/gallery-section';
import WhyChooseUs from '@/components/sections/why-choose-us';
import AirlinesSection from '@/components/sections/airlines-section';
import AdPopupModal from '@/components/sections/ad-popup-modal';
import MobileBottomNavbar from '@/components/layout/mobile-bottom-navbar';
import { Tenant, LandingPage, Section, SectionType } from '@/types/cms';
import { Agent } from '@/lib/agents';

interface DynamicHomeTemplateProps {
  tenant: Tenant;
  page: LandingPage;
  sections: Section[];
  contents: Record<string, Record<string, any>>;
}

export default function DynamicHomeTemplate({ 
  tenant, 
  page, 
  sections, 
  contents 
}: DynamicHomeTemplateProps) {
  
  const isDefaultTenant = tenant.subdomain.toLowerCase() === 'default';

  // Find custom contact details if edited in contact section
  const contactSection = sections.find(s => s.type === 'contact');
  const contactContent = contactSection ? contents[contactSection.sectionId] : null;

  const customPhone = contactContent?.phone || '';
  const customAddress = contactContent?.address || '';
  const customEmail = contactContent?.email || '';

  // Get WhatsApp number
  let rawPhone = customPhone || page.globalSettings.whatsappNumber || '';

  // Get address
  let rawAddress = customAddress || '';
  if (!rawAddress && isDefaultTenant) {
    rawAddress = 'Jl. Malaka Merah No.7/6, Duren Sawit, Jakarta Timur';
  } else if (!rawAddress) {
    rawAddress = tenant.company ? `${tenant.company}` : 'Kantor Cabang Mitra';
  }

  // Map Tenant details to Agent interface for backward compatibility with Header and Footer components
  const agentCompat: Agent = {
    slug: tenant.subdomain,
    tenantId: tenant.tenantId, // Required for GallerySection to query uploaded images from Firestore
    name: tenant.name,
    displayName: tenant.company,
    phone: rawPhone,
    whatsapp: rawPhone.replace(/[^0-9]/g, ''),
    email: customEmail || page.globalSettings.emailContact || tenant.email,
    address: rawAddress, // Fallback address
    photoUrl: page.globalSettings.logoUrl || '/images/pp1.jpg',
    mapEmbedUrl: contactContent?.mapUrl || '', // Default empty map embed
  };

  const navItems = [
    { label: 'Beranda', href: '#' },
    { label: 'Tentang', href: '#tentang' },
    { label: 'Paket', href: '#paket' },
    { label: 'Galeri', href: '#galeri' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'Daftar', href: '#daftar' },
  ];

  // Map theme variables to CSS custom properties
  const borderRadiusValue = 
    page.theme.borderRadius === 'none' ? '0px' :
    page.theme.borderRadius === 'sm' ? '0.25rem' :
    page.theme.borderRadius === 'md' ? '0.5rem' :
    page.theme.borderRadius === 'lg' ? '1rem' : '9999px';

  const themeStyles = {
    '--primary': page.theme.primaryColor,
    '--secondary': page.theme.secondaryColor,
    '--radius': borderRadiusValue,
  } as React.CSSProperties;

  // Helper to render section based on type and content data
  const renderSection = (section: Section) => {
    if (section.isHidden) return null;
    const data = contents[section.sectionId] || {};

    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.sectionId} data={data} />;
      case 'about':
        return <AboutUs key={section.sectionId} data={data} />;
      case 'feature':
        return <WhyChooseUs key={section.sectionId} data={data} />;
      case 'service':
      case 'pricing':
        return <FeaturedPackages key={section.sectionId} agent={agentCompat} data={data} />;
      case 'gallery':
        return <GallerySection key={section.sectionId} agent={agentCompat} data={data} />;
      case 'portfolio':
      case 'katalog':
      case 'catalog':
      case 'product-knowledge':
      case 'product_knowledge':
        return <ProductKnowledgeSection key={section.sectionId} agent={agentCompat} data={data} />;
      case 'faq':
        return <FaqSection key={section.sectionId} agent={agentCompat} data={data} />;
      case 'hotel_explanation':
      case 'hotel-explanation':
        return <HotelExplanation key={section.sectionId} data={data} />;
      case 'testimonial':
        return <Testimonials key={section.sectionId} agent={agentCompat} data={data} />;
      case 'cta':
      case 'emotional-cta':
      case 'emotional_cta':
        return <EmotionalCta key={section.sectionId} agent={agentCompat} data={data} />;
      case 'contact':
        return <ContactSection key={section.sectionId} agent={agentCompat} data={data} />; // Flow pendaftaran
      case 'why_umrah':
      case 'why-umrah':
        return <WhyUmrah key={section.sectionId} data={data} />;
      case 'why_samira':
      case 'why-samira':
        return <WhySamira key={section.sectionId} agent={agentCompat} />;
      case 'finance':
      case 'financial-solution':
      case 'financial_solution':
        return <FinancialSolution key={section.sectionId} agent={agentCompat} data={data} />;
      case 'muri':
      case 'muri-awards':
      case 'muri_awards':
        return <MuriAwards key={section.sectionId} data={data} />;
      case 'flow':
      case 'registration-flow':
      case 'registration_flow':
        return <RegistrationFlow key={section.sectionId} data={data} />;
      case 'social_media':
      case 'social-media':
        return <SocialMediaSection key={section.sectionId} data={data} />;
      case 'airlines':
        return <AirlinesSection key={section.sectionId} agent={agentCompat} data={data} />;
      case 'mitra_promo':
      case 'mitra-promo':
        return <MitraPromoSection key={section.sectionId} agent={agentCompat} data={data} />;
      case 'ad_popup':
      case 'ad-popup':
        return <AdPopupModal key={section.sectionId} agent={agentCompat} data={data} />;
      default:
        return null;
    }
  };

  return (
    <div style={themeStyles} className="flex flex-col min-h-[100dvh] bg-background font-body antialiased">
      {/* Inject custom styles for dynamic theme branding override */}
      <style jsx global>{`
        :root {
          --primary-color: ${page.theme.primaryColor};
          --secondary-color: ${page.theme.secondaryColor};
          --border-radius-theme: ${borderRadiusValue};
        }
        .bg-primary {
          background-color: var(--primary-color) !important;
        }
        .text-primary {
          color: var(--primary-color) !important;
        }
        .border-primary {
          border-color: var(--primary-color) !important;
        }
        .bg-accent {
          background-color: var(--secondary-color) !important;
        }
        .text-accent {
          color: var(--secondary-color) !important;
        }
        .border-accent {
          border-color: var(--secondary-color) !important;
        }
        .rounded-3xl, .rounded-\\[2\\.5rem\\] {
          border-radius: var(--border-radius-theme) !important;
        }
      `}</style>

      <Header agent={agentCompat} />
      <main className="flex-1">
        {sections.map(sec => renderSection(sec))}
      </main>
      <Footer agent={agentCompat} />
      
      <MobileBottomNavbar agent={agentCompat} />
    </div>
  );
}
