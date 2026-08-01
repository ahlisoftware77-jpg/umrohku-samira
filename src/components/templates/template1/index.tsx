"use client";

import React from 'react';
import Header from '@/components/layout/header';
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
import FinalCta from '@/components/sections/final-cta';
import BuilderPromoBanner from '@/components/sections/builder-promo-banner';
import GallerySection from '@/components/sections/gallery-section';
import ProductKnowledgeSection from '@/components/sections/product-knowledge-section';
import AirlinesSection from '@/components/sections/airlines-section';
import Footer from '@/components/layout/footer';
import GooeyNav from '@/components/ui/gooey-nav';
import { Agent } from '@/lib/agents';

export interface Template1Props {
  agent: Agent;
  sectionsData?: Record<string, any>;
}

export default function Template1({ agent, sectionsData = {} }: Template1Props) {
  const navItems = [
    { label: 'Beranda', href: '#' },
    { label: 'Tentang', href: '#tentang' },
    { label: 'Paket', href: '#paket' },
    { label: 'Katalog', href: '#katalog' },
    { label: 'Galeri', href: '#galeri' },
    { label: 'MURI', href: '#muri' },
    { label: 'Testimoni', href: '#testimoni' },
    { label: 'Daftar', href: '#daftar' },
  ];

  // Map section data with Cloudinary / Server Media image overrides
  const heroData = sectionsData.hero || sectionsData.hero_section;
  const aboutData = sectionsData.about || sectionsData.about_us;
  const serviceData = sectionsData.service || sectionsData.featured_packages;
  const hotelData = sectionsData.hotel || sectionsData.hotel_explanation;
  const catalogData = sectionsData.portfolio || sectionsData.katalog || sectionsData.catalog;
  const galleryData = sectionsData.gallery || sectionsData.gallery_section;
  const testimonialData = sectionsData.testimonial || sectionsData.testimonials;
  const ctaData = sectionsData.cta || sectionsData.final_cta;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      {/* 1. Header Navigation */}
      <Header agent={agent} />

      <main className="flex-1">
        {/* 2. Hero Section (With Cloudinary Background & Banner Support) */}
        <HeroSection data={heroData} />

        {/* 3. About Us (With Cloudinary Media Support) */}
        <AboutUs data={aboutData} />

        {/* 4. Why Umrah */}
        <WhyUmrah />

        {/* 5. Financial Solution */}
        <FinancialSolution agent={agent} />

        {/* 6. Featured Packages (With Cloudinary Package Card Images) */}
        <FeaturedPackages agent={agent} data={serviceData} />

        {/* 7. Product Knowledge & E-Katalog (With Cloudinary PDF/Image Viewer) */}
        <ProductKnowledgeSection agent={agent} data={catalogData} />

        {/* 8. Official Airlines Partner Section */}
        <AirlinesSection agent={agent} data={sectionsData.airlines} />

        {/* 8. Gallery Section (With Cloudinary Media Gallery Uploads) */}
        <GallerySection agent={agent} data={galleryData} />

        {/* 9. MURI Awards */}
        <MuriAwards />

        {/* 10. Testimonials (With Cloudinary Avatar Photos) */}
        <Testimonials agent={agent} data={testimonialData} />

        {/* 11. Final CTA */}
        <FinalCta agent={agent} data={ctaData} />
      </main>

      {/* 17. Footer */}
      <Footer agent={agent} />

      {/* 18. Floating Gooey Navigation */}
      <GooeyNav 
        items={navItems}
        particleCount={15}
        particleDistances={[90, 10]}
        particleR={600}
        initialActiveIndex={0}
        animationTime={600}
        timeVariance={800}
        colors={[1, 2, 3, 1, 2, 3, 1, 4]}
      />
    </div>
  );
}
