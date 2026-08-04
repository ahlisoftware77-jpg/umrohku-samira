"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import DepartureScheduleSection, { DEFAULT_SCHEDULES, DepartureScheduleItem } from '@/components/sections/departure-schedule-section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Calendar, Search, Filter, PhoneCall, Plane, Building2, Check, Clock, Bot, Loader2, ArrowLeft } from 'lucide-react';
import { routeAiRequest } from '@/lib/services/aiRouterService';
import { AiProviderConfig } from '@/types/cms';

export default function PublicSchedulePage() {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>('');

  const getActiveAiCluster = (): AiProviderConfig[] => {
    let activeCluster: AiProviderConfig[] = [];
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_providers_cluster');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) activeCluster = parsed;
        } catch (e) {}
      }
    }
    if (activeCluster.length === 0 && typeof window !== 'undefined') {
      const apiKey = localStorage.getItem('tenant_gemini_api_key') || 
                     localStorage.getItem('gemini_api_key') || 
                     process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      if (apiKey) {
        activeCluster = [{
          id: 'prov_default_gemini',
          name: 'Google Gemini Admin',
          providerType: 'gemini',
          apiKey: apiKey,
          model: 'gemini-2.0-flash',
          enabled: true,
          priority: 1
        }];
      }
    }
    return activeCluster;
  };

  const handleConsultAiSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiRecommendation('');

    try {
      const cluster = getActiveAiCluster();
      if (cluster.length === 0) {
        setAiRecommendation('Mohon maaf, layanan konsultasi AI saat ini belum terhubung dengan API Key. Silakan gunakan filter jadwal secara manual.');
        setIsAiLoading(false);
        return;
      }

      const promptText = `Bertindaklah sebagai Asisten AI Konsultasi Keberangkatan Umrah Samira Travel.
Berikut daftar jadwal keberangkatan resmi terbaru saat ini:
${JSON.stringify(DEFAULT_SCHEDULES, null, 2)}

Pertanyaan / Permintaan Calon Jamaah:
"${aiPrompt}"

Tugas Anda:
1. Berikan rekomendasi jadwal keberangkatan yang PALING SESUAI dengan permintaan calon jamaah di atas (sebutkan tanggal, nama paket, pesawat, dan alasannya secara hangat, Islami, ramah, dan solutif).
2. Tulis pesan rekomendasi singkat & jelas (maksimal 3 paragraf).`;

      const res = await routeAiRequest(cluster, promptText);
      if (res && res.text) {
        setAiRecommendation(res.text);
      }
    } catch (err: any) {
      setAiRecommendation('Terjadi kesalahan saat memproses permintaan AI. Silakan coba lagi nanti.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="flex-1 pb-20">
        {/* Page Hero Header */}
        <section className="bg-gradient-to-br from-slate-950 via-primary to-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl text-center">
            <a 
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-amber-300/30 mb-6 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Beranda
            </a>
            
            <h1 className="text-3xl sm:text-5xl font-headline font-black text-white leading-tight">
              Pusat Informasi Jadwal Keberangkatan Umrah
            </h1>
            <p className="text-xs sm:text-base text-amber-100/90 mt-3 max-w-2xl mx-auto leading-relaxed font-medium">
              Informasi tanggal keberangkatan resmi, jenis paket, kepastian penerbangan direct, dan ketersediaan seat untuk jamaah & mitra Samira Travel.
            </p>
          </div>
        </section>

        {/* AI Schedule Assistant Interactive Box */}
        <section className="container mx-auto px-4 md:px-6 -mt-8 relative z-20 max-w-4xl">
          <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 border-2 border-purple-300/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-purple-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Asisten AI Rekomendasi Jadwal Keberangkatan</span>
                  <span className="text-[10px] font-black bg-purple-400/20 text-purple-200 border border-purple-400/40 px-2 py-0.5 rounded-full">
                    AI Cerdas
                  </span>
                </h3>
                <p className="text-xs text-purple-200/80">Ketik kebutuhan jadwal Anda (cth: "Cari umrah bintang 5 bulan Oktober pesawat Saudia")</p>
              </div>
            </div>

            <form onSubmit={handleConsultAiSchedule} className="flex flex-col sm:flex-row gap-2 pt-2">
              <Input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Misal: Saya mau umrah 12 hari bulan November bersama keluarga 4 orang..."
                className="bg-white/90 border-purple-300 text-xs h-11 text-slate-900 placeholder:text-slate-400 rounded-2xl flex-1 font-medium"
              />
              <Button
                type="submit"
                disabled={isAiLoading || !aiPrompt.trim()}
                className="h-11 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl gap-2 shadow-lg shrink-0"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Rekomendasikan AI</span>
              </Button>
            </form>

            {aiRecommendation && (
              <div className="p-4 bg-white/10 border border-purple-300/30 rounded-2xl text-xs leading-relaxed text-purple-50 whitespace-pre-line mt-3">
                <p className="font-extrabold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Rekomendasi Asisten AI:
                </p>
                {aiRecommendation}
              </div>
            )}
          </div>
        </section>

        {/* Main Departure Schedule List Component */}
        <div className="pt-8">
          <DepartureScheduleSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
