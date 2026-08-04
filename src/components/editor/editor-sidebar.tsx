"use client";

import React, { useState } from 'react';
import { useCmsStore } from '@/hooks/useCmsStore';
import { AVAILABLE_FONTS, loadGoogleFont } from '@/lib/fonts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import MediaManager from '@/components/editor/media-manager';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  Eye, 
  EyeOff, 
  FileText,
  Trash2, 
  Copy, 
  Menu, 
  Plus, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Settings, 
  Palette, 
  LayoutGrid, 
  Globe,
  Undo,
  Redo,
  Save,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ArrowLeft,
  Share2,
  MessageSquare,
  RefreshCw,
  Check,
  Wand2,
  Loader2,
  Bot
} from 'lucide-react';
import { SectionType, AiProviderConfig } from '@/types/cms';
import { db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from '@/lib/firestore-tracker';
import { routeAiRequest } from '@/lib/services/aiRouterService';


export default function EditorSidebar() {
  const {
    page,
    sections,
    contents,
    activeSectionId,
    setActiveSectionId,
    updateContent,
    addSection,
    removeSection,
    duplicateSection,
    reorderSections,
    toggleSectionVisibility,
    applyPresetLayout,
    undo,
    redo,
    isSaving,
    saveToFirestore,
    updateTheme,
    updateSeo
  } = useCmsStore();

  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'seo'>('sections');
  const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false);
  const [onSelectImageCallback, setOnSelectImageCallback] = useState<((url: string | string[]) => void) | null>(null);
  const { toast } = useToast();

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [mapPreviewUrl, setMapPreviewUrl] = useState('');
  const [mapTargetField, setMapTargetField] = useState<'mapUrl' | 'officePusatMapUrl'>('mapUrl');

  // AI Assistant States (Supa Config Enforced)
  const [isAiEnabled, setIsAiEnabled] = useState<boolean>(() => (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_enabled') !== 'false' : true));
  const [aiGeneratingField, setAiGeneratingField] = useState<string | null>(null);

  // Real-time listener for Supa AI configuration
  React.useEffect(() => {
    const systemRef = doc(db, 'systemSettings', 'global');
    const unsub = onSnapshot(systemRef, (sysSnap) => {
      if (sysSnap.exists()) {
        const sysData = sysSnap.data();
        if (sysData.gemini?.enabled !== undefined) {
          const enabled = sysData.gemini.enabled !== false;
          setIsAiEnabled(enabled);
          if (typeof window !== 'undefined') {
            localStorage.setItem('gemini_api_enabled', enabled ? 'true' : 'false');
          }
        }
        if (Array.isArray(sysData.aiProviders) && sysData.aiProviders.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('ai_providers_cluster', JSON.stringify(sysData.aiProviders));
          }
        }
      }
    }, () => {});
    return () => unsub();
  }, []);

  // AI Content Generator for Section Fields
  const handleGenerateSectionAiContent = async (fieldKey: string, fieldLabel: string, promptInstruction: string) => {
    if (!isAiEnabled) {
      toast({
        title: "Asisten AI Nonaktif",
        description: "Asisten AI saat ini dinonaktifkan oleh Super Admin di portal /supa.",
        variant: "destructive",
      });
      return;
    }

    setAiGeneratingField(fieldKey);
    try {
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

      if (activeCluster.length === 0) {
        const defaultKey = (typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') || '' : '') || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
        if (defaultKey) {
          activeCluster = [{
            id: 'prov_default',
            name: 'Default Provider',
            providerType: 'gemini',
            apiKey: defaultKey,
            model: 'gemini-2.0-flash',
            enabled: true,
            priority: 1
          }];
        }
      }

      if (activeCluster.length === 0) {
        toast({
          title: "API Key Belum Dikonfigurasi",
          description: "Silakan minta Super Admin mengatur API Key AI di portal /supa.",
          variant: "destructive",
        });
        return;
      }

      const activeSecType = sections.find(s => s.sectionId === activeSectionId)?.type || 'seksi website';
      const prompt = `Bertindaklah sebagai Copywriter Profesional Travel Umrah & Haji (Samira Travel).
Buatkan draf teks ${fieldLabel} yang menarik, islami, profesional, dan meyakinkan calon jamaah untuk seksi "${activeSecType}".
Petunjuk Khusus: ${promptInstruction}.
HANYA berikan teks hasil tulisan tanpa tanda petik pembuka/penutup dan tanpa penjelasan tambahan.`;

      const res = await routeAiRequest(activeCluster, prompt);
      if (res && res.text) {
        const cleanedText = res.text.trim().replace(/^["']|["']$/g, '');
        handleFieldChange(fieldKey, cleanedText);
        toast({
          title: "✨ Teks AI Berhasil Dibuat",
          description: `Teks ${fieldLabel} telah diperbarui dengan kreasi AI.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Gagal Generate AI",
        description: err.message || "Terjadi kendala saat menghubungi AI.",
        variant: "destructive",
      });
    } finally {
      setAiGeneratingField(null);
    }
  };


  const openMapPicker = (targetField: 'mapUrl' | 'officePusatMapUrl', initialQuery: string) => {
    setMapTargetField(targetField);
    setMapSearchQuery(initialQuery);
    setMapPreviewUrl(initialQuery ? `https://www.google.com/maps?q=${encodeURIComponent(initialQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed` : '');
    setIsMapPickerOpen(true);
  };

  const SECTION_NAMES: Record<string, string> = {
    hero: 'Banner Utama',
    about: 'Tentang Kami',
    pricing: 'Paket Umrah',
    feature: 'Keunggulan',
    testimonial: 'Testimoni',
    gallery: 'Galeri Foto',
    portfolio: 'E-Katalog Product Knowledge',
    katalog: 'E-Katalog Product Knowledge',
    cta: 'Panggilan (CTA)',
    contact: 'Kontak & WA',
    why_umrah: 'Alasan Harus Umroh',
    why_samira: 'Mengapa Samira Travel',
    finance: 'Solusi Pembiayaan',
    muri: 'Anugrah Rekor MURI',
    faq: 'Hal Yang Sering Ditanyakan (FAQ)',
    hotel_explanation: 'Informasi Akomodasi & Hotel',
    flow: 'Cara Kerja / Alur',
    social_media: 'Media Sosial',
  };

  const getSectionLabel = (type?: string) => {
    if (!type) return 'SEKSI';
    return SECTION_NAMES[type.toLowerCase()] || type.toUpperCase();
  };

  const [activeMediaSectionType, setActiveMediaSectionType] = useState<string>('general');

  const openMediaPicker = (callback: (url: string | string[]) => void, sectionType?: string) => {
    const currentSection = sections.find(s => s.sectionId === activeSectionId);
    const targetType = sectionType || currentSection?.type || 'general';
    setActiveMediaSectionType(targetType);
    setOnSelectImageCallback(() => callback);
    setIsMediaManagerOpen(true);
  };


  
  const handleApplyPreset = (presetKey: string) => {
    if (sections.length > 0) {
      if (!confirm('Menerapkan susunan default ini akan MENGHAPUS SELURUH susunan seksi halaman saat ini dan menggantinya dengan template baru. Lanjutkan?')) {
        return;
      }
    }
    applyPresetLayout(presetKey);
  };

  const activeSection = sections.find(s => s.sectionId === activeSectionId);
  const activeSectionContent = activeSection ? (contents[activeSection.sectionId] || {}) : {};

  // Form field changes helper
  const handleFieldChange = (key: string, value: any) => {
    if (!activeSectionId) return;
    
    let processedValue = value;
    if (typeof value === 'string' && value.includes('<iframe')) {
      const match = value.match(/src=["']([^"']+)["']/);
      if (match && match[1]) {
        processedValue = match[1];
      }
    }
    
    updateContent(activeSectionId, key, processedValue);
  };

  const sectionTypesList: { type: SectionType; label: string }[] = [
    { type: 'hero', label: 'Hero Banner' },
    { type: 'about', label: 'Tentang Kami' },
    { type: 'why_umrah', label: 'Alasan Harus Umroh' },
    { type: 'finance', label: 'Solusi Pembiayaan' },
    { type: 'why_samira', label: 'Mengapa Samira Travel' },
    { type: 'service', label: 'Paket & Layanan' },
    { type: 'faq', label: 'Hal Yang Sering Ditanyakan (FAQ)' },
    { type: 'hotel_explanation', label: 'Informasi Akomodasi & Hotel' },
    { type: 'flow', label: 'Cara Kerja / Alur' },
    { type: 'gallery', label: 'Galeri Media' },
    { type: 'muri', label: 'Anugrah Rekor MURI' },
    { type: 'portfolio', label: 'E-Katalog Product Knowledge' },
    { type: 'testimonial', label: 'Testimoni' },
    { type: 'cta', label: 'Ajakan Daftar' },
    { type: 'contact', label: 'Kontak & Form Konsultasi' },
    { type: 'social_media', label: 'Media Sosial' },
    { type: 'airlines', label: 'Maskapai Penerbangan Resmi' },
    { type: 'ad_popup', label: '📢 Iklan Popup (Awal Muat Halaman)' },
  ];

  // Helper to render section form content based on active section type
  const renderSectionTypeContent = () => {
    if (!activeSection) return null;
    switch (activeSection.type) {
      case 'hero':
        return (
          <div className="space-y-4">


            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Hero</h3>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)} 
                placeholder="Biro Perjalanan Haji & Umrah Terpercaya"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama (Title)</Label>
              <Textarea 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Mulailah Perjalanan Suci Anda Bersama SAMIRA"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Rasakan pengalaman ibadah yang lancar..."
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Tombol Utama</Label>
              <Input 
                value={activeSectionContent.primaryBtnText || ''} 
                onChange={(e) => handleFieldChange('primaryBtnText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Tombol Utama</Label>
              <Input 
                value={activeSectionContent.primaryBtnUrl || ''} 
                onChange={(e) => handleFieldChange('primaryBtnUrl', e.target.value)}
              />
            </div>

            {/* Transition Effect Selection */}
            <div className="space-y-2 border-t pt-3 mt-3">
              <Label className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Pilihan Efek Transisi Gambar Hero
              </Label>
              <select
                value={activeSectionContent.transitionEffect || 'zoom'}
                onChange={(e) => handleFieldChange('transitionEffect', e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-input bg-white text-xs font-bold font-sans shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="zoom">🔍 Zoom In Slow (Ken Burns Effect — Standar)</option>
                <option value="fade">✨ Smooth Cross-Fade (Lembut & Elegan)</option>
                <option value="slide">➡️ Slide Horizontal (Kiri ke Kanan)</option>
                <option value="flip">🔄 Flip 3D Perspective (Mewah & Pro)</option>
                <option value="blur">💧 Blur & Clear Glass (Bayangan Kaca)</option>
              </select>
            </div>

            {/* 5 Background Image Upload Slots */}
            <div className="space-y-3 border-t pt-3 mt-3">
              <Label className="font-bold text-xs uppercase tracking-wider text-primary flex items-center justify-between">
                <span>Gambar Latar Belakang Hero (Maks. 5 Gambar)</span>
                <ImageIcon className="h-3.5 w-3.5 text-accent" />
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Unggah hingga 5 gambar latar belakang untuk diputar secara otomatis di hero slider.
              </p>

              {[
                { key: 'bgImage', label: 'Gambar Latar 1 (Utama)' },
                { key: 'bgImage2', label: 'Gambar Latar 2' },
                { key: 'bgImage3', label: 'Gambar Latar 3' },
                { key: 'bgImage4', label: 'Gambar Latar 4' },
                { key: 'bgImage5', label: 'Gambar Latar 5' },
              ].map((slot) => {
                const imgUrl = activeSectionContent[slot.key];
                return (
                  <div key={slot.key} className="p-3 bg-muted/40 border rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                      {imgUrl && (
                        <button
                          type="button"
                          onClick={() => handleFieldChange(slot.key, '')}
                          className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    {imgUrl && (
                      <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                        <img src={imgUrl} alt={slot.label} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => openMediaPicker((url) => handleFieldChange(slot.key, url))}
                      className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-8"
                    >
                      <Upload className="h-3.5 w-3.5" /> {imgUrl ? 'Ganti Gambar' : `Pilih / Unggah ${slot.label}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Tentang Kami</h3>
            <div className="space-y-2">
              <Label>Label Badge</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Seksi</Label>
              <Textarea 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Isi Deskripsi</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
              />
            </div>

            <div className="space-y-3 border-t pt-3 mt-3">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Galeri Slide Foto (Multi-Gambar)</span>
                <ImageIcon className="h-3.5 w-3.5 text-accent" />
              </Label>

              {/* Display list of current images in carousel */}
              {(() => {
                const currentImages: string[] = Array.isArray(activeSectionContent.images) && activeSectionContent.images.length > 0
                  ? activeSectionContent.images
                  : (activeSectionContent.imageUrl ? [activeSectionContent.imageUrl] : []);

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {currentImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="relative aspect-video rounded-xl overflow-hidden border bg-muted group">
                          <img src={imgUrl} alt={`Slide ${imgIdx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = currentImages.filter((_, i) => i !== imgIdx);
                              handleFieldChange('images', updated);
                              if (updated.length > 0) handleFieldChange('imageUrl', updated[0]);
                              else handleFieldChange('imageUrl', '');
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            title="Hapus foto ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => openMediaPicker((urlResult) => {
                        const newUrls = Array.isArray(urlResult) ? urlResult : [urlResult];
                        const updated = [...currentImages, ...newUrls];
                        handleFieldChange('images', updated);
                        if (updated.length > 0) handleFieldChange('imageUrl', updated[0]);
                      })}
                      className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                    >
                      <Upload className="h-3.5 w-3.5" /> + Tambah Slide Foto (Multi-Select)
                    </Button>
                  </div>
                );
              })()}
            </div>
          </div>
        );

      case 'pricing':
      case 'service':
        return (
          <div className="space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Penyuntingan Seksi Paket & Layanan</h3>
              <p className="text-xs text-muted-foreground">Sunting judul utama dan rincian 3 paket Umrah yang tampil di website.</p>
            </div>

            {/* Judul Seksi */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-2xl border">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Judul & Subtitle Seksi</p>
              <div className="space-y-2">
                <Label>Label Badge Seksi</Label>
                <Input 
                  value={activeSectionContent.badgeText || ''} 
                  onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                  placeholder="Pilihan Paket Ibadah"
                />
              </div>
              <div className="space-y-2">
                <Label>Judul Utama Seksi</Label>
                <Input 
                  value={activeSectionContent.title || ''} 
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Paket Haji & Umrah Unggulan"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Subtitle</Label>
                <Textarea 
                  value={activeSectionContent.description || ''} 
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Pilih paket perjalanan yang sesuai dengan kebutuhan Anda dan keluarga..."
                />
              </div>
            </div>

            {/* Paket 1 */}
            <div className="space-y-3 p-3.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                📦 Paket 1 (Reguler)
              </p>
              <div className="space-y-2">
                <Label>Nama Paket 1</Label>
                <Input 
                  value={activeSectionContent.package1_name || ''} 
                  onChange={(e) => handleFieldChange('package1_name', e.target.value)}
                  placeholder="Paket Umrah Reguler 9 Hari"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Paket 1</Label>
                <Input 
                  value={activeSectionContent.package1_price || ''} 
                  onChange={(e) => handleFieldChange('package1_price', e.target.value)}
                  placeholder="Rp 27.500.000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fasilitas & Layanan (Baris Baru)</Label>
                <Textarea 
                  value={activeSectionContent.package1_features || ''} 
                  onChange={(e) => handleFieldChange('package1_features', e.target.value)}
                  placeholder="• Tiket Pesawat PP&#10;• Hotel Bintang 4&#10;• Bus AC Eksekutif"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol Daftar</Label>
                <Input 
                  value={activeSectionContent.package1_btnText || ''} 
                  onChange={(e) => handleFieldChange('package1_btnText', e.target.value)}
                  placeholder="Lihat Detail"
                />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Foto Sampul Paket 1</span>
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                </Label>
                {activeSectionContent.package1_imageUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted mb-2">
                    <img src={activeSectionContent.package1_imageUrl} alt="Sampul Paket 1" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('package1_imageUrl', url))}
                  className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar Paket 1
                </Button>
              </div>
              {(() => {
                const currentUrls = Array.isArray(activeSectionContent.package1_brochureUrls) 
                  ? activeSectionContent.package1_brochureUrls 
                  : (activeSectionContent.package1_brochureUrl ? [activeSectionContent.package1_brochureUrl] : []);
                return (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Brosur Lengkap Paket 1 (Maks 3 Gambar / PDF)</span>
                      <FileText className="h-3.5 w-3.5 text-accent" />
                    </Label>
                    
                    {currentUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {currentUrls.map((url: string, i: number) => (
                          <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted group">
                            {url.toLowerCase().endsWith('.pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-slate-100 text-center">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-[8px] font-mono text-muted-foreground truncate w-full px-1 mt-1">PDF Brosur</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Brosur 1 Halaman ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentUrls.filter((_, idx) => idx !== i);
                                handleFieldChange('package1_brochureUrls', updated);
                                handleFieldChange('package1_brochureUrl', updated[0] || '');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 text-[10px] font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentUrls.length < 3 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => openMediaPicker((urlResult) => {
                          const newUrls = Array.isArray(urlResult) ? urlResult : [urlResult];
                          const updated = [...currentUrls, ...newUrls].slice(0, 3);
                          handleFieldChange('package1_brochureUrls', updated);
                          handleFieldChange('package1_brochureUrl', updated[0] || '');
                        })}
                        className="w-full rounded-xl text-xs font-bold gap-2 border-accent text-accent hover:bg-accent hover:text-white h-9"
                      >
                        <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Brosur 1 (Maks 3)
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Paket 2 */}
            <div className="space-y-3 p-3.5 bg-accent/5 border border-accent/20 rounded-2xl">
              <p className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                🌟 Paket 2 (VIP / Premium)
              </p>
              <div className="space-y-2">
                <Label>Nama Paket 2</Label>
                <Input 
                  value={activeSectionContent.package2_name || ''} 
                  onChange={(e) => handleFieldChange('package2_name', e.target.value)}
                  placeholder="Paket Umrah VIP Bintang 5"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Paket 2</Label>
                <Input 
                  value={activeSectionContent.package2_price || ''} 
                  onChange={(e) => handleFieldChange('package2_price', e.target.value)}
                  placeholder="Rp 35.000.000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fasilitas & Layanan (Baris Baru)</Label>
                <Textarea 
                  value={activeSectionContent.package2_features || ''} 
                  onChange={(e) => handleFieldChange('package2_features', e.target.value)}
                  placeholder="• Hotel Pelataran Masjidil Haram&#10;• Penerbangan Direct Saudia"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol Daftar</Label>
                <Input 
                  value={activeSectionContent.package2_btnText || ''} 
                  onChange={(e) => handleFieldChange('package2_btnText', e.target.value)}
                  placeholder="Lihat Detail"
                />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Foto Sampul Paket 2</span>
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                </Label>
                {activeSectionContent.package2_imageUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted mb-2">
                    <img src={activeSectionContent.package2_imageUrl} alt="Sampul Paket 2" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('package2_imageUrl', url))}
                  className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar Paket 2
                </Button>
              </div>
              {(() => {
                const currentUrls = Array.isArray(activeSectionContent.package2_brochureUrls) 
                  ? activeSectionContent.package2_brochureUrls 
                  : (activeSectionContent.package2_brochureUrl ? [activeSectionContent.package2_brochureUrl] : []);
                return (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Brosur Lengkap Paket 2 (Maks 3 Gambar / PDF)</span>
                      <FileText className="h-3.5 w-3.5 text-accent" />
                    </Label>
                    
                    {currentUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {currentUrls.map((url: string, i: number) => (
                          <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted group">
                            {url.toLowerCase().endsWith('.pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-slate-100 text-center">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-[8px] font-mono text-muted-foreground truncate w-full px-1 mt-1">PDF Brosur</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Brosur 2 Halaman ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentUrls.filter((_, idx) => idx !== i);
                                handleFieldChange('package2_brochureUrls', updated);
                                handleFieldChange('package2_brochureUrl', updated[0] || '');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 text-[10px] font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentUrls.length < 3 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => openMediaPicker((urlResult) => {
                          const newUrls = Array.isArray(urlResult) ? urlResult : [urlResult];
                          const updated = [...currentUrls, ...newUrls].slice(0, 3);
                          handleFieldChange('package2_brochureUrls', updated);
                          handleFieldChange('package2_brochureUrl', updated[0] || '');
                        })}
                        className="w-full rounded-xl text-xs font-bold gap-2 border-accent text-accent hover:bg-accent hover:text-white h-9"
                      >
                        <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Brosur 2 (Maks 3)
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Paket 3 */}
            <div className="space-y-3 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl">
              <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                🌙 Paket 3 (Eksklusif / Ramadhan)
              </p>
              <div className="space-y-2">
                <Label>Nama Paket 3</Label>
                <Input 
                  value={activeSectionContent.package3_name || ''} 
                  onChange={(e) => handleFieldChange('package3_name', e.target.value)}
                  placeholder="Paket Umrah Ramadhan & Awal Tahun"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Paket 3</Label>
                <Input 
                  value={activeSectionContent.package3_price || ''} 
                  onChange={(e) => handleFieldChange('package3_price', e.target.value)}
                  placeholder="Rp 42.000.000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fasilitas & Layanan (Baris Baru)</Label>
                <Textarea 
                  value={activeSectionContent.package3_features || ''} 
                  onChange={(e) => handleFieldChange('package3_features', e.target.value)}
                  placeholder="• Layanan Itikaf Full Ramadhan&#10;• Kereta Cepat Haramain"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol Daftar</Label>
                <Input 
                  value={activeSectionContent.package3_btnText || ''} 
                  onChange={(e) => handleFieldChange('package3_btnText', e.target.value)}
                  placeholder="Lihat Detail"
                />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Foto Sampul Paket 3</span>
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                </Label>
                {activeSectionContent.package3_imageUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted mb-2">
                    <img src={activeSectionContent.package3_imageUrl} alt="Sampul Paket 3" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('package3_imageUrl', url))}
                  className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar Paket 3
                </Button>
              </div>
              {(() => {
                const currentUrls = Array.isArray(activeSectionContent.package3_brochureUrls) 
                  ? activeSectionContent.package3_brochureUrls 
                  : (activeSectionContent.package3_brochureUrl ? [activeSectionContent.package3_brochureUrl] : []);
                return (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Brosur Lengkap Paket 3 (Maks 3 Gambar / PDF)</span>
                      <FileText className="h-3.5 w-3.5 text-accent" />
                    </Label>
                    
                    {currentUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {currentUrls.map((url: string, i: number) => (
                          <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted group">
                            {url.toLowerCase().endsWith('.pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-slate-100 text-center">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-[8px] font-mono text-muted-foreground truncate w-full px-1 mt-1">PDF Brosur</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Brosur 3 Halaman ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentUrls.filter((_, idx) => idx !== i);
                                handleFieldChange('package3_brochureUrls', updated);
                                handleFieldChange('package3_brochureUrl', updated[0] || '');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 text-[10px] font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentUrls.length < 3 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => openMediaPicker((urlResult) => {
                          const newUrls = Array.isArray(urlResult) ? urlResult : [urlResult];
                          const updated = [...currentUrls, ...newUrls].slice(0, 3);
                          handleFieldChange('package3_brochureUrls', updated);
                          handleFieldChange('package3_brochureUrl', updated[0] || '');
                        })}
                        className="w-full rounded-xl text-xs font-bold gap-2 border-accent text-accent hover:bg-accent hover:text-white h-9"
                      >
                        <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Brosur 3 (Maks 3)
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Paket 4 */}
            <div className="space-y-3 p-3.5 bg-accent/10 border border-accent/30 rounded-2xl">
              <p className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                🕋 Paket 4 (Haji Furoda / Khusus)
              </p>
              <div className="space-y-2">
                <Label>Nama Paket 4</Label>
                <Input 
                  value={activeSectionContent.package4_name || ''} 
                  onChange={(e) => handleFieldChange('package4_name', e.target.value)}
                  placeholder="Paket Haji Furoda Premium"
                />
              </div>
              <div className="space-y-2">
                <Label>Harga Paket 4</Label>
                <Input 
                  value={activeSectionContent.package4_price || ''} 
                  onChange={(e) => handleFieldChange('package4_price', e.target.value)}
                  placeholder="Hubungi Kami / Mulai $15.000"
                />
              </div>
              <div className="space-y-2">
                <Label>Fasilitas & Layanan (Baris Baru)</Label>
                <Textarea 
                  value={activeSectionContent.package4_features || ''} 
                  onChange={(e) => handleFieldChange('package4_features', e.target.value)}
                  placeholder="• Visa Haji Furoda Resmi&#10;• Tenda Maktab Premium Arafah&#10;• Apartemen Transit Nyaman"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Teks Tombol Daftar</Label>
                <Input 
                  value={activeSectionContent.package4_btnText || ''} 
                  onChange={(e) => handleFieldChange('package4_btnText', e.target.value)}
                  placeholder="Lihat Detail"
                />
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Foto Sampul Paket 4</span>
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                </Label>
                {activeSectionContent.package4_imageUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted mb-2">
                    <img src={activeSectionContent.package4_imageUrl} alt="Sampul Paket 4" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('package4_imageUrl', url))}
                  className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar Paket 4
                </Button>
              </div>
              {(() => {
                const currentUrls = Array.isArray(activeSectionContent.package4_brochureUrls) 
                  ? activeSectionContent.package4_brochureUrls 
                  : (activeSectionContent.package4_brochureUrl ? [activeSectionContent.package4_brochureUrl] : []);
                return (
                  <div className="space-y-2 pt-2 border-t">
                    <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                      <span>Brosur Lengkap Paket 4 (Maks 3 Gambar / PDF)</span>
                      <FileText className="h-3.5 w-3.5 text-accent" />
                    </Label>
                    
                    {currentUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        {currentUrls.map((url: string, i: number) => (
                          <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border bg-muted group">
                            {url.toLowerCase().endsWith('.pdf') ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-1 bg-slate-100 text-center">
                                <FileText className="h-6 w-6 text-primary" />
                                <span className="text-[8px] font-mono text-muted-foreground truncate w-full px-1 mt-1">PDF Brosur</span>
                              </div>
                            ) : (
                              <img src={url} alt={`Brosur 4 Halaman ${i + 1}`} className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentUrls.filter((_, idx) => idx !== i);
                                handleFieldChange('package4_brochureUrls', updated);
                                handleFieldChange('package4_brochureUrl', updated[0] || '');
                              }}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200 text-[10px] font-bold"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {currentUrls.length < 3 && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => openMediaPicker((urlResult) => {
                          const newUrls = Array.isArray(urlResult) ? urlResult : [urlResult];
                          const updated = [...currentUrls, ...newUrls].slice(0, 3);
                          handleFieldChange('package4_brochureUrls', updated);
                          handleFieldChange('package4_brochureUrl', updated[0] || '');
                        })}
                        className="w-full rounded-xl text-xs font-bold gap-2 border-accent text-accent hover:bg-accent hover:text-white h-9"
                      >
                        <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Brosur 4 (Maks 3)
                      </Button>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Penyuntingan Seksi Testimoni Jamaah</h3>
              <p className="text-xs text-muted-foreground">Sunting judul utama dan rincian ulasan dari para jamaah.</p>
            </div>

            {/* Public Shareable Testimonial Form Banner */}
            <div className="p-4 bg-gradient-to-br from-amber-500/10 via-primary/5 to-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="h-4 w-4 text-accent" /> Tautan Pengisian Testimoni Jamaah
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Bagikan link borang ulasan ini ke WhatsApp jamaah Anda. Setiap testimoni jamaah akan <strong>terikat otomatis khusus pada akun Anda ({page?.tenantId || 'mitra'})</strong> dan tidak akan pernah tertukar.
              </p>

              <div className="space-y-2 pt-1">
                <Input 
                  readOnly 
                  value={typeof window !== 'undefined' ? `${window.location.origin}/testimoni/${page?.tenantId || 'mitra'}` : `https://umrohku-samira.my.id/testimoni/${page?.tenantId || 'mitra'}`}
                  className="bg-white text-xs font-mono border-amber-500/30 text-primary h-8"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const link = `${window.location.origin}/testimoni/${page?.tenantId || 'mitra'}`;
                      navigator.clipboard.writeText(link);
                      alert('Tautan Form Testimoni Jamaah berhasil disalin!');
                    }}
                    className="h-8 text-xs font-bold border-amber-500/40 text-amber-800 hover:bg-amber-50 rounded-xl flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" /> Salin Link Form
                  </Button>

                  <Button 
                    type="button"
                    onClick={() => {
                      const link = `${window.location.origin}/testimoni/${page?.tenantId || 'mitra'}`;
                      const waText = encodeURIComponent(`Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\nBapak/Ibu Jamaah yang terhormat, mohon luangkan waktu 1 menit untuk membagikan kesan & ulasan pengalaman ibadah Anda bersama kami melalui borang resmi berikut:\n\n${link}\n\nJazakumullah Khairan Katsiran!`);
                      window.open(`https://wa.me/?text=${waText}`, '_blank');
                    }}
                    className="h-8 text-xs font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-1 shadow-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Bagikan ke WA
                  </Button>
                </div>
              </div>
            </div>

            {/* Foto & Nama Pemilik Akun / Konsultan Banner */}
            <div className="space-y-3 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                👤 Profil Pemilik Akun (Tampil di Seksi Testimoni)
              </p>
              
              <div className="space-y-2">
                <Label>Nama Pemilik Akun / Konsultan</Label>
                <Input 
                  value={activeSectionContent.ownerName || ''} 
                  onChange={(e) => handleFieldChange('ownerName', e.target.value)}
                  placeholder="Triyadi Yanuar"
                />
              </div>

              <div className="space-y-2">
                <Label>Jabatan / Gelar / Agen Cabang</Label>
                <Input 
                  value={activeSectionContent.ownerTitle || ''} 
                  onChange={(e) => handleFieldChange('ownerTitle', e.target.value)}
                  placeholder="Mitra Resmi Samira Travel Karawang"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Foto Profil Pemilik Akun</span>
                  <ImageIcon className="h-3.5 w-3.5 text-accent" />
                </Label>
                {activeSectionContent.ownerPhotoUrl && (
                  <div className="relative aspect-[4/5] w-28 rounded-xl overflow-hidden border bg-muted mb-2 mx-auto">
                    <img src={activeSectionContent.ownerPhotoUrl} alt="Foto Pemilik Akun" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('ownerPhotoUrl', url))}
                  className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Foto Pemilik Akun
                </Button>
              </div>
            </div>

            {/* Judul Seksi */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-2xl border">
              <p className="text-xs font-bold text-primary uppercase tracking-wider">Judul & Subtitle Seksi</p>
              <div className="space-y-2">
                <Label>Label Badge Seksi</Label>
                <Input 
                  value={activeSectionContent.badgeText || ''} 
                  onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                  placeholder="Kesan & Pengalaman Jamaah"
                />
              </div>
              <div className="space-y-2">
                <Label>Judul Utama Seksi</Label>
                <Input 
                  value={activeSectionContent.title || ''} 
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Apa Kata Mereka Tentang Samira Travel?"
                />
              </div>
              <div className="space-y-2">
                <Label>Deskripsi Subtitle</Label>
                <Textarea 
                  value={activeSectionContent.description || ''} 
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  placeholder="Kepercayaan dan kenyamanan jamaah adalah prioritas utama perjalanan ibadah kami."
                />
              </div>
            </div>

            {/* Testimoni 1 */}
            <div className="space-y-3 p-3.5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                💬 Testimoni 1
              </p>
              <div className="space-y-2">
                <Label>Nama Jamaah</Label>
                <Input 
                  value={activeSectionContent.testi1_name || ''} 
                  onChange={(e) => handleFieldChange('testi1_name', e.target.value)}
                  placeholder="Hj. Fatmawati & Keluarga"
                />
              </div>
              <div className="space-y-2">
                <Label>Profesi / Kota Asal</Label>
                <Input 
                  value={activeSectionContent.testi1_role || ''} 
                  onChange={(e) => handleFieldChange('testi1_role', e.target.value)}
                  placeholder="Jamaah Umrah Reguler - Jakarta"
                />
              </div>
              <div className="space-y-2">
                <Label>Isi Ulasan / Testimoni</Label>
                <Textarea 
                  value={activeSectionContent.testi1_comment || ''} 
                  onChange={(e) => handleFieldChange('testi1_comment', e.target.value)}
                  placeholder="Alhamdulillah ibadah berjalan dengan sangat khusyuk..."
                  rows={3}
                />
              </div>
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-accent" /> Foto Jamaah (Opsional)
                </Label>
                {activeSectionContent.testi1_photo && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/40 mb-1">
                    <img src={activeSectionContent.testi1_photo} alt="foto testi 1" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('testi1_photo', url))}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 border-blue-400/40 text-blue-700 hover:bg-blue-50 h-8"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih Foto Jamaah 1
                </Button>
              </div>
            </div>

            {/* Testimoni 2 */}
            <div className="space-y-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                💬 Testimoni 2
              </p>
              <div className="space-y-2">
                <Label>Nama Jamaah</Label>
                <Input 
                  value={activeSectionContent.testi2_name || ''} 
                  onChange={(e) => handleFieldChange('testi2_name', e.target.value)}
                  placeholder="Bpk. Triyadi Yanuar"
                />
              </div>
              <div className="space-y-2">
                <Label>Profesi / Kota Asal</Label>
                <Input 
                  value={activeSectionContent.testi2_role || ''} 
                  onChange={(e) => handleFieldChange('testi2_role', e.target.value)}
                  placeholder="Jamaah Umrah Plus Turkey - Surabaya"
                />
              </div>
              <div className="space-y-2">
                <Label>Isi Ulasan / Testimoni</Label>
                <Textarea 
                  value={activeSectionContent.testi2_comment || ''} 
                  onChange={(e) => handleFieldChange('testi2_comment', e.target.value)}
                  placeholder="Sangat profesional! Jadwal penerbangan tepat waktu..."
                  rows={3}
                />
              </div>
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-accent" /> Foto Jamaah (Opsional)
                </Label>
                {activeSectionContent.testi2_photo && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/40 mb-1">
                    <img src={activeSectionContent.testi2_photo} alt="foto testi 2" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('testi2_photo', url))}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 border-emerald-400/40 text-emerald-700 hover:bg-emerald-50 h-8"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih Foto Jamaah 2
                </Button>
              </div>
            </div>

            {/* Testimoni 3 */}
            <div className="space-y-3 p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                💬 Testimoni 3
              </p>
              <div className="space-y-2">
                <Label>Nama Jamaah</Label>
                <Input 
                  value={activeSectionContent.testi3_name || ''} 
                  onChange={(e) => handleFieldChange('testi3_name', e.target.value)}
                  placeholder="Ibu Ira Fransisca"
                />
              </div>
              <div className="space-y-2">
                <Label>Profesi / Kota Asal</Label>
                <Input 
                  value={activeSectionContent.testi3_role || ''} 
                  onChange={(e) => handleFieldChange('testi3_role', e.target.value)}
                  placeholder="Jamaah Umrah VIP - Bandung"
                />
              </div>
              <div className="space-y-2">
                <Label>Isi Ulasan / Testimoni</Label>
                <Textarea 
                  value={activeSectionContent.testi3_comment || ''} 
                  onChange={(e) => handleFieldChange('testi3_comment', e.target.value)}
                  placeholder="Pengalaman ibadah pertama yang tak tertandingi..."
                  rows={3}
                />
              </div>
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-accent" /> Foto Jamaah (Opsional)
                </Label>
                {activeSectionContent.testi3_photo && (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-accent/40 mb-1">
                    <img src={activeSectionContent.testi3_photo} alt="foto testi 3" className="w-full h-full object-cover" />
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => openMediaPicker((url) => handleFieldChange('testi3_photo', url))}
                  className="w-full rounded-xl text-xs font-bold gap-1.5 border-purple-400/40 text-purple-700 hover:bg-purple-50 h-8"
                >
                  <Upload className="h-3.5 w-3.5" /> Pilih Foto Jamaah 3
                </Button>
              </div>
            </div>
          </div>
        );

      case 'feature':
        return (
          <div className="space-y-5">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Penyuntingan Seksi Keunggulan</h3>
              <p className="text-xs text-muted-foreground">Sunting poin-poin keunggulan & alasan memilih bimbingan perjalanan Anda.</p>
            </div>

            <div className="space-y-2">
              <Label>Label Badge</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Keunggulan Layanan"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Mengapa Harus Memilih Samira Travel?"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Subtitle</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Komitmen kami dalam memberikan kenyamanan ibadah terbaik..."
              />
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Gambar Latar Belakang (Background)</span>
                <ImageIcon className="h-3.5 w-3.5 text-accent" />
              </Label>
              {activeSectionContent.imageUrl && (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border bg-muted mb-2">
                  <img src={activeSectionContent.imageUrl} alt="Background Keunggulan" className="w-full h-full object-cover" />
                </div>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => openMediaPicker((url) => handleFieldChange('imageUrl', url))}
                className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
              >
                <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar Background
              </Button>
            </div>

            <div className="space-y-3 pt-2">
              <div className="p-3 border rounded-2xl bg-muted/20 space-y-2">
                <Label className="font-bold text-xs text-primary">Poin Keunggulan 1</Label>
                <Input value={activeSectionContent.feature1_title || ''} onChange={(e) => handleFieldChange('feature1_title', e.target.value)} placeholder="Bimbingan Ustaz Sesuai Sunnah" />
                <Textarea value={activeSectionContent.feature1_desc || ''} onChange={(e) => handleFieldChange('feature1_desc', e.target.value)} placeholder="Didampingi muthawwif berpengalaman..." rows={2} />
              </div>

              <div className="p-3 border rounded-2xl bg-muted/20 space-y-2">
                <Label className="font-bold text-xs text-primary">Poin Keunggulan 2</Label>
                <Input value={activeSectionContent.feature2_title || ''} onChange={(e) => handleFieldChange('feature2_title', e.target.value)} placeholder="Hotel Dekat Pelataran Masjid" />
                <Textarea value={activeSectionContent.feature2_desc || ''} onChange={(e) => handleFieldChange('feature2_desc', e.target.value)} placeholder="Akses jalan kaki mudah ke Masjidil Haram & Nabawi..." rows={2} />
              </div>

              <div className="p-3 border rounded-2xl bg-muted/20 space-y-2">
                <Label className="font-bold text-xs text-primary">Poin Keunggulan 3</Label>
                <Input value={activeSectionContent.feature3_title || ''} onChange={(e) => handleFieldChange('feature3_title', e.target.value)} placeholder="Penerbangan Direct Tanpa Transit" />
                <Textarea value={activeSectionContent.feature3_desc || ''} onChange={(e) => handleFieldChange('feature3_desc', e.target.value)} placeholder="Maskapai ternama Saudia Airline & Garuda Indonesia..." rows={2} />
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Ajakan (CTA)</h3>
            <div className="space-y-2">
              <Label>Judul Ajakan</Label>
              <Textarea 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Siap Bertamu ke Baitullah Bersama Keluarga?"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Daftarkan diri Anda sekarang untuk mendapatkan penawaran kursi promo terbaik bulan ini..."
              />
            </div>
            <div className="space-y-2">
              <Label>Teks Tombol Konsultasi / Daftar</Label>
              <Input 
                value={activeSectionContent.buttonText || ''} 
                onChange={(e) => handleFieldChange('buttonText', e.target.value)}
                placeholder="Konsultasi via WhatsApp Gratis"
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor WhatsApp Tujuan (Format: 08xx / 628xx)</Label>
              <Input 
                value={activeSectionContent.whatsappNumber || ''} 
                onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                placeholder="083815862300"
              />
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Hal Yang Sering Ditanyakan (FAQ)</h3>
              <p className="text-xs text-muted-foreground">Penyuntingan teks lencana, judul utama, dan deskripsi seksi tanya jawab FAQ interaktif.</p>
            </div>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Pusat Bantuan & FAQ"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="HAL YANG SERING DITANYAKAN"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Seksi</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Temukan jawaban cepat & transparan atas pertanyaan Anda seputar paket umroh, skema pembiayaan Amitra Syariah, alur pendaftaran, dan persyaratan dokumen."
              />
            </div>
          </div>
        );

      case 'hotel_explanation':
        return (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Informasi Akomodasi & Hotel</h3>
              <p className="text-xs text-muted-foreground">Seksi ini menampilkan penjelasan detail mengenai tipe paket hotel (Safara, Safawi, Sukari, Majol) dan catatan jenis kamar (Double, Triple, Quad).</p>
            </div>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Informasi Akomodasi"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="PENJELASAN PAKET UMROH SAMIRA"
              />
            </div>
          </div>
        );


      case 'flow':
        return (
          <div className="space-y-4">
            <div className="border-b pb-3">
              <h3 className="font-bold text-base text-primary">Penyuntingan Seksi Cara Kerja / Alur</h3>
              <p className="text-xs text-muted-foreground">Seksi ini menampilkan alur pendaftaran mudah dalam 4 langkah terstruktur.</p>
            </div>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Cara Kerja"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Proses Pendaftaran Mudah"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Subtitle</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Sederhana, cepat, dan transparan dalam 4 langkah mudah."
              />
            </div>
          </div>
        );

      case 'gallery':
        const currentGalleryList: any[] = Array.isArray(activeSectionContent.galleryImages) 
          ? activeSectionContent.galleryImages 
          : (Array.isArray(activeSectionContent.images) ? activeSectionContent.images : []);

        const handleAddPhotoToGallery = (url: string | string[]) => {
          const latestContent = contents[activeSectionId!] || {};
          const latestList: any[] = Array.isArray(latestContent.galleryImages)
            ? latestContent.galleryImages
            : (Array.isArray(latestContent.images) ? latestContent.images : []);
          const newUrls = Array.isArray(url) ? url : [url];
          
          const newItems = newUrls.map(u => ({
            url: u,
            title: '',
            description: '',
            category: 'kebersamaan'
          }));
          
          const updatedList = [...latestList, ...newItems];
          handleFieldChange('galleryImages', updatedList);
          handleFieldChange('images', updatedList);
        };

        const handleUpdateGalleryPhotoItem = (indexToUpdate: number, key: 'title' | 'description' | 'category', value: string) => {
          const updatedList = currentGalleryList.map((item, idx) => {
            if (idx !== indexToUpdate) return item;
            const isObject = typeof item !== 'string';
            const url = isObject ? item.url : item;
            const obj = isObject ? { ...item } : { url };
            obj[key] = value;
            return obj;
          });
          handleFieldChange('galleryImages', updatedList);
          handleFieldChange('images', updatedList);
        };

        const handleRemovePhotoFromGallery = (indexToRemove: number) => {
          const updatedList = currentGalleryList.filter((_, idx) => idx !== indexToRemove);
          handleFieldChange('galleryImages', updatedList);
          handleFieldChange('images', updatedList);
          toast({
            title: " Berhasil Menghapus Foto Galeri",
            description: "Foto telah dihapus dari Seksi Galeri.",
          });
        };

        const handleClearAllGalleryPhotos = () => {
          if (!confirm('Apakah Anda yakin ingin mengosongkan seluruh foto di galeri ini?')) return;
          handleFieldChange('galleryImages', []);
          handleFieldChange('images', []);
          toast({
            title: " Berhasil Mengosongkan Galeri",
            description: "Seluruh foto pada Seksi Galeri telah dikosongkan.",
          });
        };

        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Galeri</h3>
            
            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">Sub-Judul Galeri (Badge)</Label>
              <Input
                value={activeSectionContent.badgeText || ''}
                placeholder="cth: DOKUMENTASI KEGIATAN"
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">Judul Utama Galeri</Label>
              <Input
                value={activeSectionContent.title || ''}
                placeholder="cth: Kenangan Indah di Tanah Suci"
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold text-slate-700">Deskripsi Seksi</Label>
              <Textarea
                value={activeSectionContent.description || ''}
                placeholder="Tuliskan kata pengantar singkat tentang momen jamaah..."
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="rounded-xl min-h-[80px]"
              />
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-accent" /> Foto Galeri &amp; Keterangan ({currentGalleryList.length})
                </Label>
                {currentGalleryList.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-destructive hover:bg-destructive/10 h-7"
                    onClick={handleClearAllGalleryPhotos}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Hapus Semua Foto
                  </Button>
                )}
              </div>

              {currentGalleryList.length > 0 ? (
                <div className="space-y-3 max-h-[360px] overflow-y-auto p-2 bg-muted/20 border rounded-2xl">
                  {currentGalleryList.map((item, idx) => {
                    const isObject = typeof item !== 'string';
                    const imgUrl = isObject ? item.url : item;
                    const title = isObject ? item.title || '' : '';
                    const desc = isObject ? item.description || '' : '';
                    const category = isObject ? item.category || 'kebersamaan' : 'kebersamaan';
                    
                    return (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2.5 relative group shadow-sm">
                        <div className="flex gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 bg-muted">
                            <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-grow space-y-1.5">
                            <input
                              type="text"
                              placeholder="Judul Momen (cth: Di Masjidil Haram)"
                              value={title}
                              onChange={(e) => handleUpdateGalleryPhotoItem(idx, 'title', e.target.value)}
                              className="w-full text-xs font-bold border-b border-slate-100 hover:border-slate-300 focus:border-primary pb-0.5 outline-none"
                            />
                            <textarea
                              placeholder="Deskripsi singkat..."
                              value={desc}
                              rows={2}
                              onChange={(e) => handleUpdateGalleryPhotoItem(idx, 'description', e.target.value)}
                              className="w-full text-[11px] text-muted-foreground border border-transparent focus:border-slate-200 p-1 rounded resize-none outline-none"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <select
                            value={category}
                            onChange={(e) => handleUpdateGalleryPhotoItem(idx, 'category', e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-600 font-bold"
                          >
                            <option value="ibadah">🕌 Momen Ibadah</option>
                            <option value="ziarah">🌴 Ziarah &amp; Wisata</option>
                            <option value="kebersamaan">🤝 Kebersamaan</option>
                          </select>
                          
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            onClick={() => handleRemovePhotoFromGallery(idx)}
                            className="h-6 w-6 rounded-full"
                            title="Hapus foto"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic p-3 bg-muted/30 rounded-xl border text-center">
                  Belum ada foto khusus yang ditambahkan ke galeri ini.
                </p>
              )}

              <Button 
                type="button"
                onClick={() => openMediaPicker((url) => handleAddPhotoToGallery(url), 'gallery')}
                className="w-full rounded-2xl text-xs font-bold gap-2 bg-primary text-white hover:bg-accent hover:text-accent-foreground h-10 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Unggah / Tambah Foto ke Galeri
              </Button>
            </div>
          </div>
        );

      case 'portfolio':
      case 'katalog':
      case 'catalog':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan E-Katalog & Product Knowledge</h3>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="E-Katalog Resmi 2025/2026"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Katalog</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Product Knowledge Samira Travel"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Ringkas Katalog</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Katalog panduan komprehensif mengenai fasilitas layanan, pilihan paket..."
              />
            </div>
            <div className="space-y-2">
              <Label>Susunan Halaman Katalog (Daftar Isi)</Label>
              <Textarea 
                rows={6}
                value={activeSectionContent.structure || ''} 
                onChange={(e) => handleFieldChange('structure', e.target.value)}
                placeholder="• Hal 01 - 05: Profil Samira & Legalitas&#10;• Hal 06 - 15: Brosur Paket Umrah&#10;• Hal 16 - 25: Akomodasi Hotel&#10;• Hal 26 - 35: Syarat Paspor & Visa&#10;• Hal 36 - 47: Pembiayaan Syariah Amitra"
              />
            </div>
            <div className="space-y-2">
              <Label>Jumlah Total Halaman Katalog</Label>
              <Input 
                type="number"
                value={activeSectionContent.totalPages || ''} 
                onChange={(e) => handleFieldChange('totalPages', e.target.value)}
                placeholder="47"
              />
            </div>
            
            <div className="space-y-2 border-t pt-3 mt-3">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Berkas / Sampul Katalog (Server Media)</span>
                <ImageIcon className="h-3.5 w-3.5 text-accent" />
              </Label>
              {activeSectionContent.pdfUrl && (
                <div className="text-xs p-2 bg-muted rounded-xl truncate font-mono border">
                  {activeSectionContent.pdfUrl}
                </div>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => openMediaPicker((url) => handleFieldChange('pdfUrl', url))}
                className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
              >
                <Upload className="h-3.5 w-3.5" /> Unggah / Pilih Berkas Katalog (Server)
              </Button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Kontak & WA</h3>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Hubungi Kami & Konsultasi"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Konsultasi Perjalanan Umrah & Haji Anda"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Seksi</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Tim konsultan profesional kami siap melayani pertanyaan 24/7..."
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor WhatsApp / HP Konsultan (Format: 628xxx)</Label>
              <Input 
                value={activeSectionContent.phone || ''} 
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="6283815862300"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Layanan Resmi</Label>
              <Input 
                value={activeSectionContent.email || ''} 
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="info@samiratravel.co.id"
              />
            </div>
            <div className="space-y-2">
              <Label>Jam Operasional Kantor</Label>
              <Input 
                value={activeSectionContent.hours || ''} 
                onChange={(e) => handleFieldChange('hours', e.target.value)}
                placeholder="Senin - Sabtu: 08.30 - 17.30 WIB"
              />
            </div>
             <div className="space-y-2">
              <Label>Alamat Lengkap Kantor / Nama Bisnis di Maps</Label>
              <Textarea 
                value={activeSectionContent.address || ''} 
                onChange={(e) => handleFieldChange('address', e.target.value)}
                placeholder="cth: Samira Travel Karawang, Jl. Tarumanagara No. 10 (atau alamat lengkap)"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Link Embed Google Maps (Opsional)</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => openMapPicker('mapUrl', activeSectionContent.address || '')}
                  className="h-auto p-0 text-xs text-primary font-bold hover:underline"
                >
                  🔍 Asisten Peta
                </Button>
              </div>
              <Input 
                value={activeSectionContent.mapUrl || ''} 
                onChange={(e) => handleFieldChange('mapUrl', e.target.value)}
                placeholder="Tautan peta otomatis atau link embed"
              />
            </div>

            <div className="space-y-2 border-t pt-4 mt-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-primary">Kantor Pusat Samira</h4>
            </div>
            <div className="space-y-2">
              <Label>Alamat Kantor Pusat / Nama Bisnis di Maps</Label>
              <Textarea 
                value={activeSectionContent.officePusatAddress || ''} 
                onChange={(e) => handleFieldChange('officePusatAddress', e.target.value)}
                placeholder="cth: Samira Travel Jakarta Duren Sawit..."
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Link Embed Google Maps Kantor Pusat</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={() => openMapPicker('officePusatMapUrl', activeSectionContent.officePusatAddress || '')}
                  className="h-auto p-0 text-xs text-primary font-bold hover:underline"
                >
                  🔍 Asisten Peta
                </Button>
              </div>
              <Input 
                value={activeSectionContent.officePusatMapUrl || ''} 
                onChange={(e) => handleFieldChange('officePusatMapUrl', e.target.value)}
                placeholder="Tautan peta otomatis atau link embed"
              />
            </div>
          </div>
        );

      case 'social_media':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Media Sosial</h3>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Media Sosial & Komunitas"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama Seksi</Label>
              <Input 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Ikuti Perjalanan & Informasi Terbaru Kami"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Seksi</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Dapatkan update dokumentasi keberangkatan, tips ibadah, dan berita promo umrah..."
              />
            </div>
            <div className="space-y-2">
              <Label>Link Facebook</Label>
              <Input 
                value={activeSectionContent.facebookUrl || ''} 
                onChange={(e) => handleFieldChange('facebookUrl', e.target.value)}
                placeholder="https://facebook.com/namapage"
              />
            </div>
            <div className="space-y-2">
              <Label>Link Instagram</Label>
              <Input 
                value={activeSectionContent.instagramUrl || ''} 
                onChange={(e) => handleFieldChange('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label>Link TikTok</Label>
              <Input 
                value={activeSectionContent.tiktokUrl || ''} 
                onChange={(e) => handleFieldChange('tiktokUrl', e.target.value)}
                placeholder="https://tiktok.com/@username"
              />
            </div>
            <div className="space-y-2">
              <Label>Link YouTube</Label>
              <Input 
                value={activeSectionContent.youtubeUrl || ''} 
                onChange={(e) => handleFieldChange('youtubeUrl', e.target.value)}
                placeholder="https://youtube.com/@channel"
              />
            </div>
            <div className="space-y-2">
              <Label>Link Telegram / WhatsApp Channel</Label>
              <Input 
                value={activeSectionContent.telegramUrl || ''} 
                onChange={(e) => handleFieldChange('telegramUrl', e.target.value)}
                placeholder="https://t.me/channel"
              />
            </div>
          </div>
        );

      case 'why_umrah':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary">Alasan Harus Umroh</h3>
            <p className="text-xs text-muted-foreground">Seksi ini menampilkan 12 alasan utama mengapa umat muslim merindukan ibadah Umroh (statis, resmi dari Samira).</p>
            <div className="p-3 bg-muted/30 border rounded-2xl">
              <p className="text-xs font-semibold text-muted-foreground">Status Seksi:</p>
              <p className="text-sm font-bold text-green-600 mt-1">Aktif & Tampil di Website</p>
            </div>
          </div>
        );

      case 'why_samira':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary">Mengapa Samira Travel</h3>
            <p className="text-xs text-muted-foreground">Seksi ini menampilkan profil keunggulan travel Samira: Izin resmi Kemenag RI, kepastian booking pesawat sebelum promo, bus eksekutif nyaman, dan keberangkatan kota besar.</p>
            <div className="p-3 bg-muted/30 border rounded-2xl">
              <p className="text-xs font-semibold text-muted-foreground">Status Seksi:</p>
              <p className="text-sm font-bold text-green-600 mt-1">Aktif & Tampil di Website</p>
            </div>
          </div>
        );

      case 'finance':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary">Solusi Pembiayaan</h3>
            <p className="text-xs text-muted-foreground">Seksi ini memuat penjelasan skema keuangan DP 7 Juta bisa langsung berangkat (kerjasama lembaga syariah berizin OJK/MUI).</p>
            <div className="p-3 bg-muted/30 border rounded-2xl">
              <p className="text-xs font-semibold text-muted-foreground">Status Seksi:</p>
              <p className="text-sm font-bold text-green-600 mt-1">Aktif & Tampil di Website</p>
            </div>
          </div>
        );

      case 'muri':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary">Anugrah Rekor MURI</h3>
            <p className="text-xs text-muted-foreground">Seksi ini menampilkan lencana & dokumentasi sertifikasi Rekor MURI sebagai Penyelenggara Umrah Terbanyak.</p>
            <div className="p-3 bg-muted/30 border rounded-2xl">
              <p className="text-xs font-semibold text-muted-foreground">Status Seksi:</p>
              <p className="text-sm font-bold text-green-600 mt-1">Aktif & Tampil di Website</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted/40 rounded-xl space-y-3">
            <p className="text-sm font-medium">Seksi: <span className="capitalize font-bold">{activeSection.type}</span></p>
            <p className="text-xs text-muted-foreground">Gunakan default config atau edit konten seksi ini di database.</p>
            
            <div className="space-y-2 border-t pt-3">
              <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Gambar Seksi (Server Media)</span>
                <ImageIcon className="h-3.5 w-3.5 text-accent" />
              </Label>
              {activeSectionContent.imageUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted mb-2">
                  <img src={activeSectionContent.imageUrl} alt="Section Image" className="w-full h-full object-cover" />
                </div>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => openMediaPicker((url) => handleFieldChange('imageUrl', url))}
                className="w-full rounded-xl text-xs font-bold gap-2 border-primary text-primary hover:bg-primary hover:text-white h-9"
              >
                <Upload className="h-3.5 w-3.5" /> Pilih / Unggah Gambar ke Server
              </Button>
            </div>
          </div>
        );

      case 'airlines':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Seksi Maskapai Penerbangan</h3>
            <div className="space-y-2">
              <Label>Teks Lencana (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)}
                placeholder="Maskapai Penerbangan Resmi Partner Samira"
              />
            </div>
            <div className="space-y-2">
              <Label>Judul Utama (Title)</Label>
              <Textarea 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Terbang Nyaman & Nyaman ke Tanah Suci"
              />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi Singkat</Label>
              <Textarea 
                value={activeSectionContent.description || ''} 
                onChange={(e) => handleFieldChange('description', e.target.value)}
                placeholder="Samira Travel bekerja sama dengan maskapai penerbangan..."
              />
            </div>
          </div>
        );

      case 'ad_popup':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-base text-primary mb-2">Penyuntingan Iklan Popup (Awal Muat Halaman)</h3>
            
            <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="font-bold text-xs">Status Iklan Popup</Label>
                <p className="text-[11px] text-muted-foreground">Tampilkan iklan popup otomatis saat jamaah pertama kali membuka web.</p>
              </div>
              <input 
                type="checkbox"
                checked={activeSectionContent.enabled !== false}
                onChange={(e) => handleFieldChange('enabled', e.target.checked)}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <Label>Teks Lencana Promo (Badge)</Label>
              <Input 
                value={activeSectionContent.badgeText || ''} 
                onChange={(e) => handleFieldChange('badgeText', e.target.value)} 
                placeholder="🎁 PROMO SPESIAL HARI INI"
              />
            </div>

            <div className="space-y-2">
              <Label>Judul Promo Iklan (Title)</Label>
              <Textarea 
                value={activeSectionContent.title || ''} 
                onChange={(e) => handleFieldChange('title', e.target.value)} 
                placeholder="PROMO SPESIAL KEBERANGKATAN UMRAH SAMIRA TRAVEL"
              />
            </div>

            <div className="space-y-2">
              <Label>Deskripsi / Subtitle Promo</Label>
              <Textarea 
                value={activeSectionContent.subtitle || ''} 
                onChange={(e) => handleFieldChange('subtitle', e.target.value)} 
                placeholder="Dapatkan Potongan Harga Spesial & Reward Keberangkatan Rombongan Jamaah Hari Ini!"
              />
            </div>

            {/* Banner Image Upload */}
            <div className="space-y-2">
              <Label>Gambar Poster Promo / Banner Iklan</Label>
              {activeSectionContent.imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted mb-2">
                  <img src={activeSectionContent.imageUrl} alt="Banner Iklan" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => handleFieldChange('imageUrl', '')}
                    className="absolute top-2 right-2 bg-destructive text-white text-[10px] px-2 py-0.5 rounded font-bold"
                  >
                    Hapus
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <Input 
                  value={activeSectionContent.imageUrl || ''} 
                  onChange={(e) => handleFieldChange('imageUrl', e.target.value)} 
                  placeholder="/images/NEWLOGO-MILAD-10.png atau URL Gambar"
                  className="text-xs"
                />
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openMediaPicker((url) => handleFieldChange('imageUrl', url))}
                  className="shrink-0 text-xs font-bold"
                >
                  Unggah
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Teks Tombol CTA</Label>
              <Input 
                value={activeSectionContent.buttonText || ''} 
                onChange={(e) => handleFieldChange('buttonText', e.target.value)} 
                placeholder="Klaim Promo WhatsApp Now"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Tujuan Tombol (URL Target / WA)</Label>
              <Input 
                value={activeSectionContent.targetUrl || ''} 
                onChange={(e) => handleFieldChange('targetUrl', e.target.value)} 
                placeholder="https://api.whatsapp.com/send?phone=..."
              />
            </div>
          );
      default:
        return null;
    }
  };

  const renderSectionFields = () => {
    if (!activeSection) return <p className="text-sm text-muted-foreground">Pilih seksi di layar atau daftar seksi untuk disunting.</p>;

    return (
      <div className="space-y-4">
        {/* Universal AI Section Copywriter Bar */}
        {isAiEnabled && (
          <div className="p-3 bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white rounded-2xl border border-purple-500/30 shadow-md space-y-2 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" /> Asisten Penulis AI Seksi
              </span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                🟢 Aktif oleh Supa
              </span>
            </div>
            <p className="text-[10px] text-slate-300">
              Biarkan AI membuatkan judul & deskripsi menarik secara otomatis untuk seksi ini:
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <Button
                type="button"
                size="sm"
                disabled={aiGeneratingField !== null}
                onClick={() => handleGenerateSectionAiContent('title', 'Judul Utama', 'Buat judul yang sangat menggugah niat ibadah umrah')}
                className="h-7 text-[10px] font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl gap-1 shadow-xs"
              >
                {aiGeneratingField === 'title' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-amber-300" />}
                ✨ AI Judul
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={aiGeneratingField !== null}
                onClick={() => handleGenerateSectionAiContent('description', 'Deskripsi / Subjudul', 'Buat deskripsi singkat yang memberikan rasa tenang, amanah, dan terpercaya')}
                className="h-7 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1 shadow-xs"
              >
                {aiGeneratingField === 'description' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-amber-300" />}
                ✨ AI Deskripsi
              </Button>

              <Button
                type="button"
                size="sm"
                disabled={aiGeneratingField !== null}
                onClick={() => handleGenerateSectionAiContent('badgeText', 'Teks Lencana (Badge)', 'Buat lencana singkat 3-5 kata yang menonjolkan legalitas Kemenag / keunggulan')}
                className="h-7 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl gap-1 shadow-xs border border-slate-700"
              >
                {aiGeneratingField === 'badgeText' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3 text-amber-300" />}
                ✨ AI Badge
              </Button>
            </div>
          </div>
        )}

        {renderSectionTypeContent()}
      </div>
    );
  };

  return (
    <aside className="w-full md:w-80 h-full border-r bg-white shadow-sm flex flex-col z-30 shrink-0 pb-16 md:pb-0">
      {/* Editor top controls: Undo/Redo & Save indicator */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-muted/30">
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={undo}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={redo}>
            <Redo className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => openMediaPicker(() => {})}
            className="rounded-full text-xs font-bold border-accent text-accent hover:bg-accent hover:text-accent-foreground h-8 flex gap-1.5"
            title="Buka Pustaka Media Server"
          >
            <ImageIcon className="h-3.5 w-3.5" />
          </Button>


          
          {isSaving ? (
            <span className="text-[10px] text-muted-foreground animate-pulse flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-accent animate-ping" /> Menyimpan...
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 hidden lg:flex">
              <Save className="h-3.5 w-3.5 text-green-500" />
            </span>
          )}
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as 'sections' | 'theme' | 'seo')} 
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="grid grid-cols-3 mx-2 mt-2">
          <TabsTrigger value="sections" className="text-xs flex gap-1"><LayoutGrid className="h-3.5 w-3.5" /> Seksi</TabsTrigger>
          <TabsTrigger value="theme" className="text-xs flex gap-1"><Palette className="h-3.5 w-3.5" /> Tema</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs flex gap-1"><Globe className="h-3.5 w-3.5" /> SEO</TabsTrigger>
        </TabsList>

        {/* ====================================================
            SECTIONS TAB
            ==================================================== */}
        <TabsContent 
          value="sections" 
          className={`flex-1 flex flex-col overflow-hidden p-3 space-y-4 data-[state=inactive]:hidden ${activeTab === 'sections' ? 'flex' : 'hidden'}`}
        >
          
          {/* Active Edit Fields (If Section Selected) */}
          {activeSectionId ? (
            <Card className="border shadow-md rounded-2xl flex-1 overflow-hidden bg-white flex flex-col">
              {/* Prominent High-Contrast "Kembali" Header Bar */}
              <div className="p-2.5 bg-gradient-to-r from-primary via-slate-900 to-primary text-white flex items-center justify-between gap-2 shadow-sm border-b border-white/10 shrink-0">
                <Button 
                  type="button"
                  onClick={() => setActiveSectionId(null)}
                  className="bg-accent text-accent-foreground hover:bg-white hover:text-primary font-bold rounded-full text-xs px-3 h-7 flex items-center gap-1 shadow-md transition-all transform active:scale-95 border border-amber-300/40 shrink-0 whitespace-nowrap"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" /> Kembali
                </Button>

                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-amber-300/20 whitespace-nowrap shrink-0 truncate max-w-[150px]">
                  {getSectionLabel(sections.find(s => s.sectionId === activeSectionId)?.type)}
                </span>
              </div>

              <CardContent className="p-4 flex-1 overflow-y-auto pb-20 md:pb-4">
                {renderSectionFields()}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Sections List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-20 md:pb-2">
                {/* Preset Website Layout Templates Selector */}
                <div className="p-3 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl space-y-2 mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-accent" /> Susunan Default Website
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-tight">Pilih template susunan seksi agar tidak perlu menyusun dari awal:</p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleApplyPreset('lengkap')} 
                      className="h-8 text-[11px] font-bold justify-start rounded-xl px-2.5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                      title="8 Seksi: Hero, About, Paket, Keunggulan, Testimoni, Galeri, CTA, Kontak"
                    >
                      🌟 Umrah Lengkap
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleApplyPreset('promo')} 
                      className="h-8 text-[11px] font-bold justify-start rounded-xl px-2.5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                      title="5 Seksi: Hero, Paket, Keunggulan, CTA, Kontak"
                    >
                      ⚡ Promo Fast
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleApplyPreset('dokumentasi')} 
                      className="h-8 text-[11px] font-bold justify-start rounded-xl px-2.5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                      title="6 Seksi: Hero, About, Keunggulan, Galeri, Testimoni, Kontak"
                    >
                      📸 Galeri & Proof
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleApplyPreset('minimal')} 
                      className="h-8 text-[11px] font-bold justify-start rounded-xl px-2.5 border-primary/20 text-primary hover:bg-primary hover:text-white"
                      title="4 Seksi: Hero, About, Paket, Kontak"
                    >
                      📄 Minimalis
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Susunan Halaman</p>
                  <span className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                    Gunakan panah untuk ubah posisi
                  </span>
                </div>

                {sections.map((sec, idx) => (
                  <div 
                    key={sec.sectionId}
                    onClick={() => setActiveSectionId(sec.sectionId)}
                    className={`p-3 bg-white hover:bg-slate-50 border rounded-2xl cursor-pointer transition-all duration-200 shadow-xs space-y-2.5 ${
                      activeSectionId === sec.sectionId ? 'ring-2 ring-primary border-primary bg-primary/5' : ''
                    }`}
                  >
                    {/* Top Row: Section Index & Full Un-truncated Title */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[11px] font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {getSectionLabel(sec.type)}
                        </span>
                      </div>
                      
                      {sec.isHidden && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                          Disembunyikan
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Controls & Up/Down Action Buttons */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 flex-wrap gap-1">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Posisi & Aksi:</span>
                      
                      <div className="flex items-center gap-1">
                        {/* Move Up Arrow Button */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={idx === 0}
                          className="h-7 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-25 shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx > 0) reorderSections(idx, idx - 1);
                          }}
                          title="Pindahkan Ke Atas"
                        >
                          <ChevronUp className="h-3.5 w-3.5 mr-0.5 text-slate-800 stroke-[3]" /> Ke Atas
                        </Button>

                        {/* Move Down Arrow Button */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          disabled={idx === sections.length - 1}
                          className="h-7 px-2 text-[11px] font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-25 shadow-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (idx < sections.length - 1) reorderSections(idx, idx + 1);
                          }}
                          title="Pindahkan Ke Bawah"
                        >
                          <ChevronDown className="h-3.5 w-3.5 mr-0.5 text-slate-800 stroke-[3]" /> Ke Bawah
                        </Button>

                        {/* Hide / Show Button */}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-slate-500 hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionVisibility(sec.sectionId);
                          }}
                          title={sec.isHidden ? "Tampilkan Seksi" : "Sembunyikan Seksi"}
                        >
                          {sec.isHidden ? <EyeOff className="h-3.5 w-3.5 text-amber-600" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>

                        {/* Duplicate Button */}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-slate-500 hover:bg-slate-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateSection(sec.sectionId);
                          }}
                          title="Duplikat Seksi"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete Button */}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(sec.sectionId);
                          }}
                          title="Hapus Seksi"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Section Controls (Compact Sleek Dropdown Select) */}
              <div className="border-t pt-3 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tambah Seksi Baru</p>
                <div className="flex gap-2">
                  <select 
                    id="add-section-select"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        addSection(e.target.value as SectionType);
                        e.target.value = '';
                      }
                    }}
                    className="flex-1 h-9 rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium text-primary shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>-- Pilih Seksi Yang Ingin Ditambahkan --</option>
                    {sectionTypesList.map(item => (
                      <option key={item.type} value={item.type}>
                        + {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* ====================================================
            THEME TAB (Ultra-Pro Design)
            ==================================================== */}
        <TabsContent 
          value="theme" 
          className={`flex-1 overflow-y-auto mt-0 pt-3 px-4 pb-24 md:pb-6 space-y-4 data-[state=inactive]:hidden ${activeTab === 'theme' ? 'block' : 'hidden'}`}
        >
          {/* Header */}
          <div className="border-b pb-3 space-y-1">
            <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <Palette className="h-4 w-4 text-amber-500" /> Tema & Skema Warna
            </h3>
            <p className="text-xs text-muted-foreground">Kustomisasi identitas visual, warna dominan, dan tipografi landing page Anda.</p>
          </div>

          {/* 1. Curated Color Presets for Umrah & Travel */}
          <div className="space-y-3 p-3.5 bg-gradient-to-br from-amber-500/10 via-primary/5 to-amber-500/10 border border-amber-500/20 rounded-2xl">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Palet Warna Pilihan Instant
              </Label>
            </div>
            <p className="text-[11px] text-muted-foreground">Pilih kombinasi warna islami & profesional yang dirancang khusus untuk travel Haji & Umrah:</p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { name: 'Royal Gold & Navy', primary: '#0A1E3B', secondary: '#D4AF37' },
                { name: 'Emerald Islamic', primary: '#064E3B', secondary: '#F59E0B' },
                { name: 'Ka\'bah Gold & Black', primary: '#18181B', secondary: '#EAB308' },
                { name: 'Ocean Turquoise', primary: '#0E7490', secondary: '#38BDF8' },
                { name: 'Deep Violet & Gold', primary: '#3B0764', secondary: '#F59E0B' },
                { name: 'Maroon & Amber', primary: '#881337', secondary: '#FBBF24' },
              ].map((preset, idx) => {
                const isCurrent = 
                  page?.theme.primaryColor?.toLowerCase() === preset.primary.toLowerCase() &&
                  page?.theme.secondaryColor?.toLowerCase() === preset.secondary.toLowerCase();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => updateTheme({ primaryColor: preset.primary, secondaryColor: preset.secondary })}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all hover:scale-[1.02] ${
                      isCurrent
                        ? 'bg-white border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border shadow-xs" style={{ backgroundColor: preset.primary }} />
                      <span className="w-4 h-4 rounded-full border shadow-xs" style={{ backgroundColor: preset.secondary }} />
                      {isCurrent && <Check className="h-3.5 w-3.5 text-amber-600 ml-auto" />}
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Custom Color Pickers */}
          <div className="space-y-4 p-3.5 bg-muted/30 border rounded-2xl">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Pilihan Warna Kustom</p>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Warna Utama (Primary Color)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="color" 
                    className="h-10 w-14 p-1 rounded-xl cursor-pointer border" 
                    value={page?.theme.primaryColor || '#0A1E3B'} 
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })} 
                  />
                  <Input 
                    value={page?.theme.primaryColor || '#0A1E3B'} 
                    className="flex-1 font-mono text-xs uppercase h-10 rounded-xl" 
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })} 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Warna Aksesori / Gelar (Secondary Color)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="color" 
                    className="h-10 w-14 p-1 rounded-xl cursor-pointer border" 
                    value={page?.theme.secondaryColor || '#D4AF37'} 
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })} 
                  />
                  <Input 
                    value={page?.theme.secondaryColor || '#D4AF37'} 
                    className="flex-1 font-mono text-xs uppercase h-10 rounded-xl" 
                    onChange={(e) => updateTheme({ secondaryColor: e.target.value })} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Border Radius Selection */}
          <div className="space-y-3 p-3.5 bg-muted/30 border rounded-2xl">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Sudut Melengkung Kartu & Tombol</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Siku', previewClass: 'rounded-none' },
                { id: 'sm', label: 'Halus', previewClass: 'rounded-sm' },
                { id: 'md', label: 'Sedang', previewClass: 'rounded-md' },
                { id: 'lg', label: 'Membulat', previewClass: 'rounded-xl' },
                { id: 'xl', label: 'Sangat Bulat', previewClass: 'rounded-2xl' },
                { id: 'full', label: 'Oval/Full', previewClass: 'rounded-full' },
              ].map((b) => {
                const isSelected = (page?.theme.borderRadius || 'lg') === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => updateTheme({ borderRadius: b.id as any })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-sm font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-5 border-2 ${isSelected ? 'border-amber-300 bg-white/20' : 'border-slate-400 bg-slate-100'} ${b.previewClass}`} />
                    <span className="text-[10px] font-bold">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Font Family Selection */}
          <div className="space-y-2.5 p-3.5 bg-muted/30 border rounded-2xl">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Gaya Huruf & Tipografi (Font)</p>
            <select 
              value={page?.theme.fontFamily || 'Plus Jakarta Sans'} 
              onChange={(e) => {
                const selectedFont = e.target.value;
                loadGoogleFont(selectedFont);
                updateTheme({ fontFamily: selectedFont });
              }}
              className="w-full h-11 px-3 rounded-xl border border-input bg-white text-xs font-bold font-sans shadow-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {AVAILABLE_FONTS.map(font => (
                <option key={font.name} value={font.name}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Design Tips & Guidance Box */}
          <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800 shadow-md">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="h-4 w-4" /> Panduan Desain Travel Umrah
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Kombinasi warna **Navy & Emas** memberikan kesan terpercaya, amanah, dan elegan bagi calon jamaah. Pastikan kontras warna nyaman dibaca di smartphone.
            </p>
            <div className="pt-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateTheme({ primaryColor: '#0A1E3B', secondaryColor: '#D4AF37', borderRadius: 'lg', fontFamily: 'PT Sans' })}
                className="h-7 text-[10px] font-bold text-amber-300 hover:text-white hover:bg-white/10 rounded-lg"
              >
                Reset Tema Bawaan
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ====================================================
            SEO TAB (Ultra-Pro Design with Live Google SERP Preview)
            ==================================================== */}
        <TabsContent 
          value="seo" 
          className={`flex-1 overflow-y-auto mt-0 pt-3 px-4 pb-24 md:pb-6 space-y-4 data-[state=inactive]:hidden ${activeTab === 'seo' ? 'block' : 'hidden'}`}
        >
          {/* Header */}
          <div className="border-b pb-3 space-y-1">
            <h3 className="font-extrabold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-600" /> Optimasi Mesin Pencari (SEO)
            </h3>
            <p className="text-xs text-muted-foreground">Maksimalkan peringkat pencarian Google & pratinjau media sosial untuk akun travel Anda.</p>
          </div>

          {/* Live Google Search Preview Card */}
          <div className="space-y-2 p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> Pratinjau Tampilan Pencarian Google
              </span>
              <span className="text-[10px] text-slate-400 font-mono">SERP Live</span>
            </div>

            <div className="space-y-1 pt-1 font-sans">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-[10px] font-bold">S</span>
                <span className="truncate">umrohku-samira.my.id › {page?.tenantId || 'mitra'}</span>
              </div>
              <h4 className="text-sm font-bold text-blue-400 hover:underline truncate">
                {page?.seo.title || `Mitra Resmi Samira Travel — Paket Umrah Terpercaya`}
              </h4>
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                {page?.seo.description || `Website resmi layanan bimbingan perjalanan ibadah Haji & Umrah. Dapatkan konsultasi gratis & jadwal keberangkatan terbaik.`}
              </p>
            </div>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            {/* Meta Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700">Judul Pencarian (Meta Title) *</Label>
                <span className={`text-[10px] font-bold ${
                  (page?.seo.title?.length || 0) >= 30 && (page?.seo.title?.length || 0) <= 60
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  {page?.seo.title?.length || 0} / 60 Karakter
                </span>
              </div>
              <Input 
                value={page?.seo.title || ''} 
                placeholder="Contoh: Samira Travel Karawang — Promo Umrah Reguler 2026" 
                onChange={(e) => updateSeo({ title: e.target.value })} 
                className="rounded-xl text-xs h-10 border-slate-300 focus:border-amber-500 font-medium"
              />
              <p className="text-[10px] text-muted-foreground">Judul yang menarik & relevan membantu meningkatkan angka klik dari hasil pencarian Google.</p>
            </div>
            
            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-700">Deskripsi Ringkasan (Meta Description) *</Label>
                <span className={`text-[10px] font-bold ${
                  (page?.seo.description?.length || 0) >= 70 && (page?.seo.description?.length || 0) <= 160
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}>
                  {page?.seo.description?.length || 0} / 160 Karakter
                </span>
              </div>
              <Textarea 
                value={page?.seo.description || ''} 
                placeholder="Rangkum layanan terbaik, bonus akomodasi hotel dekat masjid, serta kontak konsultasi WhatsApp Anda..." 
                onChange={(e) => updateSeo({ description: e.target.value })} 
                rows={3}
                className="rounded-xl text-xs border-slate-300 focus:border-amber-500 leading-relaxed font-medium"
              />
              <p className="text-[10px] text-muted-foreground">Deskripsi singkat yang muncul di bawah judul pada pencarian Google & pesan WhatsApp.</p>
            </div>
            
            {/* Keywords Tags */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Kata Kunci Kunci (Keywords)</Label>
              <Input 
                value={page?.seo.keywords.join(', ') || ''} 
                placeholder="umrah 2026, samira travel, haji plus, karawang" 
                onChange={(e) => updateSeo({ keywords: e.target.value.split(',').map(s => s.trim()) })} 
                className="rounded-xl text-xs h-10 border-slate-300 focus:border-amber-500 font-medium"
              />
              <p className="text-[10px] text-muted-foreground">Gunakan koma (,) untuk memisahkan setiap kata kunci pencarian.</p>

              {/* Keywords Pills List Preview */}
              {page?.seo.keywords && page.seo.keywords.length > 0 && page.seo.keywords[0] !== '' && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {page.seo.keywords.map((kw, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* SEO & Social Sharing Audit Checklist */}
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-3 border border-slate-800 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Kesiapan Fitur SEO Automatic
                </span>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Siap Siar
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Meta Tag OpenGraph & Twitter Card terpasang otomatis</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Pratinjau gambar & deskripsi di WhatsApp siap tampil</span>
                </div>
                <div className="flex items-center gap-2 text-slate-200">
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>Subdomain terdaftar di Google Search Engine Index</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Cloudinary Media Manager Modal Dialog */}
      <MediaManager 
        isOpen={isMediaManagerOpen}
        onClose={() => setIsMediaManagerOpen(false)}
        onSelect={(url) => {
          if (onSelectImageCallback) onSelectImageCallback(url);
        }}
        activeSectionType={activeMediaSectionType}
      />

      {/* Google Maps Picker Dialog */}
      <Dialog open={isMapPickerOpen} onOpenChange={setIsMapPickerOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg rounded-2xl border-none bg-white p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-primary font-headline">Asisten Google Maps</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Masukkan nama bisnis, nama jalan, atau titik lokasi Anda. Klik cari untuk mempratinjau peta, kemudian klik tombol "Gunakan Lokasi Ini".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            <div className="flex gap-2">
              <Input
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                placeholder="cth: Samira Travel Karawang, Ruko Grand Taruma"
                className="rounded-xl flex-grow text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMapPreviewUrl(`https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => setMapPreviewUrl(`https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`)}
                className="bg-primary text-white rounded-xl text-xs font-bold px-4"
              >
                Cari Peta
              </Button>
            </div>

            <div className="h-64 w-full border rounded-xl overflow-hidden bg-slate-50 relative flex items-center justify-center">
              {mapPreviewUrl ? (
                <iframe
                  src={mapPreviewUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  title="Pratinjau Peta Pemilih"
                />
              ) : (
                <div className="text-center text-xs text-muted-foreground p-4">
                  Silakan masukkan lokasi di atas dan klik "Cari Peta".
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsMapPickerOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={!mapPreviewUrl}
              onClick={() => {
                handleFieldChange(mapTargetField, mapPreviewUrl);
                setIsMapPickerOpen(false);
                toast({
                  title: "Berhasil Menyematkan Peta",
                  description: "Lokasi hasil pencarian telah dimasukkan ke kolom input peta.",
                });
              }}
              className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl text-xs font-bold"
            >
              Gunakan Lokasi Ini
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
