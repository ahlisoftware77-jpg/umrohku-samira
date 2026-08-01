"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Send, ExternalLink, Gift, Clock, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agent, getAgent } from '@/lib/agents';

interface AdPopupModalProps {
  agent?: Agent;
  data?: {
    enabled?: boolean;
    imageUrl?: string;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    buttonText?: string;
    targetUrl?: string;
    showDelayMs?: number;
  };
  isPreview?: boolean;
}

export default function AdPopupModal({ agent: providedAgent, data, isPreview = false }: AdPopupModalProps) {
  const agent = providedAgent || getAgent('default');
  const rawPhone = agent?.whatsapp || agent?.phone || '6283815862300';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '') || '6283815862300';

  const defaultWaUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=Assalamu'alaikum,%20saya%20tertarik%20dengan%20Promo%20Iklan%20Spesial%20Umrah%20Samira%20Travel.%20Mohon%20info%20detailnya.`;

  // Fallback defaults
  const enabled = data?.enabled ?? true;
  const imageUrl = data?.imageUrl || '/images/NEWLOGO-MILAD-10.png';
  const title = data?.title || 'PROMO SPESIAL KEBERANGKATAN UMRAH SAMIRA TRAVEL';
  const subtitle = data?.subtitle || 'Dapatkan Potongan Harga Spesial & Reward Keberangkatan Rombongan Jamaah Hari Ini!';
  const badgeText = data?.badgeText || '🎁 PROMO SPESIAL HARI INI';
  const buttonText = data?.buttonText || 'Klaim Promo WhatsApp Now';
  const targetUrl = data?.targetUrl || defaultWaUrl;
  const showDelayMs = data?.showDelayMs ?? 800;

  // Closed by default in editor preview, so it doesn't block the dashboard canvas
  const [isOpen, setIsOpen] = useState<boolean>(!isPreview);
  const [userDismissed, setUserDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      setIsOpen(false);
      return;
    }

    if (isPreview) {
      // Don't auto-open modal backdrop in preview mode if user closed it
      return;
    }

    // Check session storage so it pops up once per browser session
    const storageKey = `seen_ad_popup_${agent.slug || 'root'}`;
    const hasSeenPopup = sessionStorage.getItem(storageKey);

    if (!hasSeenPopup && !userDismissed) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, showDelayMs);
      return () => clearTimeout(timer);
    }
  }, [enabled, isPreview, showDelayMs, agent.slug, userDismissed]);

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setUserDismissed(true);
    if (!isPreview) {
      const storageKey = `seen_ad_popup_${agent.slug || 'root'}`;
      sessionStorage.setItem(storageKey, 'true');
    }
  };

  // Inline Preview Card for Dashboard Editor Canvas (so it NEVER blocks the dashboard UI)
  if (isPreview) {
    return (
      <div className="p-6 my-4 bg-slate-900 text-white rounded-3xl border-2 border-amber-400 shadow-xl max-w-xl mx-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="font-extrabold text-sm text-amber-300 uppercase tracking-wider">
              Pratinjau Seksi Iklan Popup (Awal Muat Halaman)
            </span>
          </div>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${enabled !== false ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'}`}>
            {enabled !== false ? '✅ AKTIF' : '❌ NON-AKTIF'}
          </span>
        </div>

        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-center">
          <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full">
            {badgeText}
          </span>
          <h4 className="text-base font-black text-white">{title}</h4>
          <p className="text-xs text-slate-300">{subtitle}</p>

          {imageUrl && (
            <div className="relative max-h-48 rounded-xl overflow-hidden border border-slate-800 bg-black my-2">
              <img src={imageUrl} alt={title} className="max-h-44 w-auto mx-auto object-contain" />
            </div>
          )}

          <div className="pt-2 flex justify-center gap-3">
            <Button 
              type="button"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="bg-amber-400 text-slate-950 font-black text-xs rounded-xl hover:bg-yellow-400 cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-1" /> Uji Tampilan Popup Overlay
            </Button>
          </div>
        </div>

        {/* Modal Overlay simulation inside preview when user clicks test button */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
              onClick={handleClose}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-lg bg-gradient-to-b from-[#0c223d] via-[#091f3a] to-[#05101d] text-white rounded-3xl border-2 border-amber-400 shadow-2xl p-6 text-center"
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900 text-slate-300 hover:text-white hover:bg-red-600 transition-colors flex items-center justify-center border border-slate-700 z-20 shadow-md cursor-pointer"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> {badgeText}
                </div>

                <h3 className="text-xl font-headline font-black text-white mb-2">{title}</h3>
                <p className="text-xs text-slate-300 mb-4">{subtitle}</p>

                {imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-amber-400/40 mb-4 bg-slate-950">
                    <img src={imageUrl} alt={title} className="w-full h-auto max-h-[240px] object-contain mx-auto" />
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full bg-amber-400 text-slate-950 font-black text-xs rounded-xl">
                    <a href={targetUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
                      <Send className="w-4 h-4 mr-1.5" /> {buttonText}
                    </a>
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleClose} className="text-xs text-slate-400 cursor-pointer">
                    Tutup Pratinjau
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!enabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-gradient-to-b from-[#0c223d] via-[#091f3a] to-[#05101d] text-white rounded-3xl border-2 border-amber-400/60 shadow-2xl overflow-hidden text-center p-6 sm:p-8"
          >
            {/* Close Button X */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/80 text-slate-300 hover:text-white hover:bg-red-600 transition-colors flex items-center justify-center border border-slate-700 z-20 shadow-md cursor-pointer"
              aria-label="Tutup Iklan"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-widest mb-4 shadow-md border border-amber-300">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> {badgeText}
            </div>

            {/* Title */}
            <h3 className="text-xl sm:text-2xl font-headline font-black text-white leading-tight mb-2">
              {title}
            </h3>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300 font-medium mb-5 max-w-md mx-auto leading-relaxed">
              {subtitle}
            </p>

            {/* Image Banner */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/40 mb-6 bg-slate-950 shadow-lg group">
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-auto max-h-[260px] object-contain mx-auto group-hover:scale-102 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/NEWLOGO-MILAD-10.png';
                  }}
                />
              </div>
            )}

            {/* Guarantee Tag */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-emerald-400 font-extrabold mb-5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Resmi PT. Samira Ali Wisata · PPIU No. 16092100475620005</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-xl hover:scale-103 transition-transform border border-amber-300 cursor-pointer"
              >
                <a href={targetUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose} className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {buttonText}
                </a>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="w-full sm:w-auto h-12 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
              >
                Nanti Saya Lihat
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
