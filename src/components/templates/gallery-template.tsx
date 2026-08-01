"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import MobileBottomNavbar from '@/components/layout/mobile-bottom-navbar';
import GallerySection from '@/components/sections/gallery-section';
import { Agent } from '@/lib/agents';
import { motion } from 'framer-motion';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface GalleryTemplateProps {
  agent: Agent;
}

export default function GalleryTemplate({ agent }: GalleryTemplateProps) {
  const [galleryData, setGalleryData] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGalleryContent() {
      if (!agent?.tenantId) {
        setLoading(false);
        return;
      }
      try {
        const contentsRef = collection(db, 'contents');
        const targetSectionId = `sec_${agent.tenantId}_gallery`;
        const qContent = query(
          contentsRef, 
          where('tenantId', '==', agent.tenantId),
          where('sectionId', '==', targetSectionId)
        );
        const snap = await getDocs(qContent);
        if (!snap.empty) {
          const dataMap: Record<string, any> = {};
          snap.docs.forEach(docSnap => {
            const item = docSnap.data();
            dataMap[item.key] = item.value;
          });
          setGalleryData(dataMap);
        }
      } catch (err) {
        console.error('GalleryTemplate: Failed to load custom gallery contents:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryContent();
  }, [agent?.tenantId]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header agent={agent} />
      
      <main className="flex-grow pt-32">
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

        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <GallerySection agent={agent} data={galleryData} isFullPage={true} />
        )}
      </main>

      <Footer agent={agent} />
      <MobileBottomNavbar agent={agent} />
    </div>
  );
}
