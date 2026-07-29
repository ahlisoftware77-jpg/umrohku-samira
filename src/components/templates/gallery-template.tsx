"use client";

import React from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import GallerySection from '@/components/sections/gallery-section';
import { Agent } from '@/lib/agents';
import { motion } from 'framer-motion';

interface GalleryTemplateProps {
  agent: Agent;
}

export default function GalleryTemplate({ agent }: GalleryTemplateProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header agent={agent} />
      
      <main className="flex-1 pt-32">
        <section className="bg-primary py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gallery-bg-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gallery-bg-pattern)" />
            </svg>
          </div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4">Galeri Dokumentasi</h1>
              <p className="text-white/80 max-w-2xl mx-auto text-lg">
                Melihat lebih dekat perjalanan spiritual para jamaah Samira Travel bersama {agent.name}.
              </p>
            </motion.div>
          </div>
        </section>

        <GallerySection agent={agent} />
      </main>

      <Footer agent={agent} />
    </div>
  );
}
