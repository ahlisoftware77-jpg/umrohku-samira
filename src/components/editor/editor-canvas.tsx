"use client";

import React, { useEffect } from 'react';
import { useCmsStore } from '@/hooks/useCmsStore';
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
import ProductKnowledgeSection from '@/components/sections/product-knowledge-section';
import FinalCta from '@/components/sections/final-cta';
import GallerySection from '@/components/sections/gallery-section';
import WhyChooseUs from '@/components/sections/why-choose-us';
import AirlinesSection from '@/components/sections/airlines-section';
import AdPopupModal from '@/components/sections/ad-popup-modal';
import FaqSection from '@/components/sections/faq-section';
import SocialMediaSection from '@/components/sections/social-media-section';
import MitraPromoSection from '@/components/sections/mitra-promo-section';
import { Agent } from '@/lib/agents';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, Trash2, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { loadGoogleFont } from '@/lib/fonts';

export default function EditorCanvas() {
  const { 
    page, 
    sections, 
    contents, 
    activeSectionId, 
    setActiveSectionId,
    reorderSections,
    removeSection,
    toggleSectionVisibility
  } = useCmsStore();

  const fontFamily = page?.theme?.fontFamily || 'PT Sans';

  useEffect(() => {
    if (fontFamily) {
      loadGoogleFont(fontFamily);
    }
  }, [fontFamily]);

  if (!page) {
    return (
      <div className="flex-1 h-full bg-muted/20 flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground animate-pulse text-sm">Menunggu konfigurasi halaman...</p>
      </div>
    );
  }

  // Adapter for Header/Footer static data compatibility
  const agentCompat: Agent = {
    slug: page.slug,
    tenantId: page.tenantId, // Required for GallerySection to query uploaded images from Firestore
    name: 'Mitra Samira',
    displayName: 'Preview Perusahaan',
    phone: page.globalSettings.whatsappNumber || '',
    whatsapp: page.globalSettings.whatsappNumber ? page.globalSettings.whatsappNumber.replace(/[^0-9]/g, '') : '',
    email: page.globalSettings.emailContact || 'mitra@samira.id',
    address: 'Jl. Samira No. 1, Jakarta',
    photoUrl: page.globalSettings.logoUrl || '/images/pp1.jpg',
    mapEmbedUrl: '',
  };

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

  // Helper to reorder up/down from editor directly
  const moveUp = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx > 0) reorderSections(idx, idx - 1);
  };

  const moveDown = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx < sections.length - 1) reorderSections(idx, idx + 1);
  };

  const renderSectionComponent = (type: string, sectionId: string) => {
    const data = contents[sectionId] || {};
    
    switch (type) {
      case 'hero':
        return <HeroSection data={data} />;
      case 'about':
        return <AboutUs data={data} />;
      case 'feature':
        return <WhyChooseUs data={data} />;
      case 'service':
      case 'pricing':
        return <FeaturedPackages agent={agentCompat} data={data} />;
      case 'gallery':
        return <GallerySection agent={agentCompat} data={data} />;
      case 'portfolio':
      case 'katalog':
      case 'catalog':
      case 'product-knowledge':
      case 'product_knowledge':
        return <ProductKnowledgeSection agent={agentCompat} data={data} />;
      case 'faq':
        return <FaqSection agent={agentCompat} data={data} />;
      case 'testimonial':
        return <Testimonials agent={agentCompat} data={data} />;
      case 'cta':
      case 'emotional-cta':
      case 'emotional_cta':
        return <EmotionalCta agent={agentCompat} data={data} />;
      case 'contact':
        return <ContactSection agent={agentCompat} data={data} />;
      case 'why-samira':
      case 'why_samira':
        return <WhySamira agent={agentCompat} />;
      case 'why-umrah':
      case 'why_umrah':
        return <WhyUmrah data={data} />;
      case 'financial-solution':
      case 'financial_solution':
      case 'finance':
        return <FinancialSolution agent={agentCompat} data={data} />;
      case 'muri-awards':
      case 'muri_awards':
      case 'muri':
        return <MuriAwards data={data} />;
      case 'registration-flow':
      case 'registration_flow':
      case 'flow':
        return <RegistrationFlow data={data} />;
      case 'hotel-explanation':
      case 'hotel_explanation':
        return <HotelExplanation data={data} />;
      case 'social-media':
      case 'social_media':
        return <SocialMediaSection data={data} />;
      case 'airlines':
        return <AirlinesSection agent={agentCompat} data={data} />;
      case 'mitra_promo':
      case 'mitra-promo':
        return <MitraPromoSection agent={agentCompat} data={data} />;
      case 'ad_popup':
      case 'ad-popup':
        return <AdPopupModal agent={agentCompat} data={data} isPreview={true} />;
      case 'final-cta':
      case 'final_cta':
        return <FinalCta agent={agentCompat} data={data} />;
      default:
        return (
          <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl my-4">
            Komponen section ({type}) belum diimplementasi.
          </div>
        );
    }
  };

  // Smooth scroll canvas preview to active section whenever activeSectionId changes.
  // Uses setTimeout to wait for CSS display:none → flex transition (mobile tab switch)
  // to complete before calling scrollIntoView (which is a no-op on hidden elements).
  useEffect(() => {
    if (!activeSectionId) return;
    const timer = setTimeout(() => {
      const targetElement = document.getElementById(`canvas-section-${activeSectionId}`);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, 150); // 150ms: enough for CSS to apply, not noticeable to user
    return () => clearTimeout(timer);
  }, [activeSectionId]);

  return (
    <div 
      style={themeStyles} 
      className="flex-1 h-full min-h-0 overflow-y-auto bg-muted/20 p-2 md:p-8 pb-20 md:pb-8 flex justify-center scrollbar-thin"
    >
      {/* Dynamic branding overrides for canvas */}
      <style jsx global>{`
        :root {
          --primary-color: ${page.theme.primaryColor};
          --secondary-color: ${page.theme.secondaryColor};
          --border-radius-theme: ${borderRadiusValue};
        }
        .canvas-preview-frame,
        .canvas-preview-frame *,
        .canvas-preview-frame h1,
        .canvas-preview-frame h2,
        .canvas-preview-frame h3,
        .canvas-preview-frame h4,
        .canvas-preview-frame h5,
        .canvas-preview-frame h6,
        .canvas-preview-frame .font-headline,
        .canvas-preview-frame .font-sans,
        .canvas-preview-frame p,
        .canvas-preview-frame button,
        .canvas-preview-frame input,
        .canvas-preview-frame textarea,
        .canvas-preview-frame select,
        .canvas-preview-frame span {
          font-family: '${fontFamily}', sans-serif !important;
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
        .canvas-preview-frame header {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          width: 100% !important;
        }
      `}</style>

      {/* Editor Mockup Screen Box */}
      <div className="canvas-preview-frame relative w-full max-w-[1280px] bg-background shadow-2xl rounded-3xl border overflow-hidden flex flex-col h-fit">
        {/* Header Preview */}
        <div className="relative opacity-90 pointer-events-none select-none z-30">
          <Header agent={agentCompat} />
        </div>

        {/* Dynamic Sections Area */}
        <div className="flex-1">
          {sections.map((sec, idx) => {
            const isActive = activeSectionId === sec.sectionId;
            return (
              <div 
                key={sec.sectionId}
                id={`canvas-section-${sec.sectionId}`}
                onClick={() => setActiveSectionId(sec.sectionId)}
                className={cn(
                  "relative group transition-all duration-300 border-2",
                  isActive ? "border-accent ring-2 ring-accent/20 z-20" : "border-transparent hover:border-accent/40",
                  sec.isHidden && "opacity-40"
                )}
              >
                {/* Floating toolbar for active/hovered sections */}
                <div className={cn(
                  "absolute right-4 top-4 z-40 bg-white border shadow-xl rounded-full px-2 py-1 gap-1 flex items-center transition-all duration-200 pointer-events-auto",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"
                )}>
                  <span className="text-[10px] font-bold text-primary px-2 uppercase tracking-widest bg-muted rounded-full">
                    {sec.type}
                  </span>
                  
                  <div className="h-4 w-px bg-border" />
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
                    onClick={(e) => moveUp(idx, e)}
                    disabled={idx === 0}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
                    onClick={(e) => moveDown(idx, e)}
                    disabled={idx === sections.length - 1}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-muted-foreground hover:bg-muted"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionVisibility(sec.sectionId);
                    }}
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7 rounded-full text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(sec.sectionId);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Render the actual visual elements */}
                <div className="pointer-events-none select-none">
                  {renderSectionComponent(sec.type, sec.sectionId)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Preview */}
        <div className="relative opacity-90 pointer-events-none select-none">
          <Footer agent={agentCompat} />
        </div>
      </div>
    </div>
  );
}
