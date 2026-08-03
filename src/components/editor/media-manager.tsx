"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useCmsStore } from '@/hooks/useCmsStore';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cloudinaryService } from '@/lib/services/cloudinaryService';
import { MediaImage } from '@/types/cms';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Upload, Plus, Check, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string | string[]) => void;
  activeSectionType?: string;
}

const CATEGORIES = [
  { key: 'all', label: '📁 Semua Media' },
  { key: 'gallery', label: '🖼️ Seksi Galeri' },
  { key: 'hero', label: '🏰 Seksi Banner (Hero)' },
  { key: 'about', label: '👥 Seksi About / Profil' },
  { key: 'pricing', label: '📦 Seksi Paket' },
  { key: 'testimonial', label: '💬 Seksi Testimoni' },
  { key: 'general', label: '📜 Media Lainnya' },
];

export default function MediaManager({ isOpen, onClose, onSelect, activeSectionType = 'general' }: MediaManagerProps) {
  const { page } = useCmsStore();
  const tenantId = page?.tenantId || '';
  const { toast } = useToast();
  
  const [images, setImages] = useState<MediaImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [justUploadedCount, setJustUploadedCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset tip banner when modal closes
  useEffect(() => {
    if (!isOpen) {
      setJustUploadedCount(0);
    }
  }, [isOpen]);

  // Mobile Back Button Interceptor for Media Manager Modal
  useEffect(() => {
    if (!isOpen) return;

    // Push dummy history state to intercept physical/gesture back button on mobile
    window.history.pushState({ modal: 'media-manager' }, '');

    const handlePopState = () => {
      // Close modal on back button press
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // Clean up pushed history entry if closed via UI click
      if (typeof window !== 'undefined' && window.history.state?.modal === 'media-manager') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  // Set default category filter based on active section
  useEffect(() => {
    if (isOpen) {
      if (activeSectionType && activeSectionType !== 'general') {
        const normalizedCategory = activeSectionType === 'service' ? 'pricing' : activeSectionType;
        setSelectedCategory(normalizedCategory);
      } else {
        setSelectedCategory('all');
      }
    }
  }, [isOpen, activeSectionType]);

  // Load images from Firestore
  const loadImages = async () => {
    if (!tenantId) return;
    try {
      setLoading(true);
      const q = query(
        collection(db, 'images'), 
        where('tenantId', '==', tenantId)
      );
      const snap = await getDocs(q);
      const imgList = snap.docs.map(docSnap => {
        const data = docSnap.data() as MediaImage;
        return {
          ...data,
          imageId: docSnap.id // Always use exact Firestore document ID!
        };
      });
      // Sort client-side by date
      imgList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setImages(imgList);
    } catch (err) {
      console.error('Error loading media images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tenantId) {
      loadImages();
    }
  }, [isOpen, tenantId]);

  // Handle bulk multi-file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !tenantId) return;
    
    try {
      setUploading(true);
      const fileList = Array.from(files);
      const uploadedList: MediaImage[] = [];
      const rawCategory = selectedCategory !== 'all' ? selectedCategory : (activeSectionType || 'general');
      const uploadCategory = rawCategory === 'service' ? 'pricing' : rawCategory;

      // Batasan unggahan khusus galeri (Maksimal 20 foto)
      if (uploadCategory === 'gallery') {
        const currentGalleryCount = images.filter(img => img.category === 'gallery').length;
        if (currentGalleryCount + fileList.length > 20) {
          toast({
            title: "⚠️ Batas Kuota Tercapai",
            description: `Maksimal hanya 20 foto yang diperbolehkan untuk Galeri. Saat ini Anda sudah memiliki ${currentGalleryCount} foto.`,
            variant: "destructive",
          });
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
      }

      for (let i = 0; i < fileList.length; i++) {
        setUploadProgressText(`Mengunggah (${i + 1}/${fileList.length})...`);
        try {
          const uploaded = await cloudinaryService.uploadImage(
            tenantId, 
            fileList[i], 
            undefined, 
            undefined, 
            uploadCategory
          );
          uploadedList.push(uploaded);
        } catch (err: any) {
          console.error(`Error uploading file ${fileList[i].name}:`, err);
        }
      }

      if (uploadedList.length > 0) {
        setImages(prev => [...uploadedList, ...prev]);
        setJustUploadedCount(uploadedList.length);
        toast({
          title: "✅ Berhasil Mengunggah Foto",
          description: `${uploadedList.length} berkas foto telah berhasil diunggah ke pustaka media. Klik foto di bawah untuk memilih.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      toast({
        title: " Gagal Mengunggah Foto",
        description: err.message || 'Gagal mengunggah berkas ke Server Media.',
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Filter images based on selected category tab
  const filteredImages = images.filter(img => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'pricing') {
      return img.category === 'pricing' || img.category === 'service';
    }
    if (img.category) {
      return img.category === selectedCategory;
    }
    // Fallback for legacy images: show under general & all
    return selectedCategory === 'general' || selectedCategory === 'all';
  });

  // Select All & Batch Selection Logic
  const isAllSelected = filteredImages.length > 0 && filteredImages.every(img => selectedImageIds.includes(img.imageId));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(filteredImages.map(img => img.imageId));
    }
  };

  const handleToggleSelectImage = (imageId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedImageIds(prev => 
      prev.includes(imageId) ? prev.filter(id => id !== imageId) : [...prev, imageId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedImageIds.length === 0) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedImageIds.length} foto terpilih secara permanen dari Server Media?`)) return;

    const count = selectedImageIds.length;
    const targetImgs = images.filter(img => selectedImageIds.includes(img.imageId));
    // Remove immediately from local UI
    setImages(prev => prev.filter(img => !selectedImageIds.includes(img.imageId)));
    setSelectedImageIds([]);

    // Delete from Firestore directly by document ID (most reliable)
    let successCount = 0;
    for (const img of targetImgs) {
      try {
        if (img.imageId) {
          await deleteDoc(doc(db, 'images', img.imageId));
          successCount++;
        }
      } catch (err) {
        console.warn('Failed to delete doc', img.imageId, err);
      }
    }

    // Reload from Firestore to confirm actual deletion
    await loadImages();

    toast({
      title: successCount > 0 ? "✅ Berhasil Menghapus Foto" : "⚠️ Sebagian Foto Gagal Dihapus",
      description: `${successCount} dari ${count} foto terpilih telah dihapus secara permanen.`,
      variant: successCount === count ? undefined : "destructive",
    });
  };

  const handleApplySelected = () => {
    const selectedImgs = images.filter(img => selectedImageIds.includes(img.imageId));
    if (selectedImgs.length > 0) {
      // Pass all URLs at once so receiving handler can do one atomic update
      const urls = selectedImgs.map(img => img.secureUrl);
      onSelect(urls);
      toast({
        title: "✅ Berhasil Menerapkan Foto",
        description: `${selectedImgs.length} foto terpilih telah dimasukkan ke seksi editor!`,
      });
      setSelectedImageIds([]);
      onClose();
    }
  };

  // Handle single delete
  const handleDelete = async (e: React.MouseEvent, img: MediaImage) => {
    e.stopPropagation();
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini secara permanen dari Server Media?')) return;
    
    const targetDocId = img.imageId;

    // Remove immediately from local UI
    setImages(prev => prev.filter(i => i.imageId !== targetDocId && i.secureUrl !== img.secureUrl));
    setSelectedImageIds(prev => prev.filter(id => id !== targetDocId));

    try {
      // Delete from Firestore directly using docSnap.id (most reliable)
      if (targetDocId) {
        await deleteDoc(doc(db, 'images', targetDocId));
      }
      toast({
        title: "✅ Berhasil Menghapus Foto",
        description: "Foto telah dihapus secara permanen dari Server Media.",
      });
    } catch (err) {
      // Reload from Firestore to restore correct state if deletion failed
      await loadImages();
      toast({
        title: "❌ Gagal Menghapus Foto",
        description: "Terjadi kesalahan saat menghapus berkas foto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[96vw] sm:w-full max-w-4xl h-[92vh] sm:h-auto max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-[2rem] sm:rounded-3xl overflow-hidden p-4 pt-6 sm:p-6 bg-white shadow-2xl">
        <DialogHeader className="border-b pb-3 pt-1 text-left pr-8">
          <DialogTitle className="text-lg sm:text-xl font-headline font-bold text-primary flex items-center justify-between gap-2 flex-wrap">
            <span className="leading-tight">Media Manager</span>
            {activeSectionType && activeSectionType !== 'general' && (
              <span className="text-[10px] sm:text-xs font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                Mode Seksi: {activeSectionType.toUpperCase()}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-slate-600 mt-1">
            Pilih atau unggah gambar ke Server Media. Gambar dikelompokkan otomatis per Seksi Website.
          </DialogDescription>
        </DialogHeader>

        {/* Category Filter Tabs */}
        <div className="py-2 px-1 border-b flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-muted/20">
          {CATEGORIES.map(cat => {
            const count = cat.key === 'all' 
              ? images.length 
              : images.filter(i => i.category === cat.key || (cat.key === 'pricing' && i.category === 'service')).length;

            return (
              <Button
                key={cat.key}
                type="button"
                variant={selectedCategory === cat.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat.key)}
                className={`rounded-full text-[11px] sm:text-xs font-bold shrink-0 h-8 px-3 sm:px-3.5 transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'border-muted-foreground/20 text-muted-foreground hover:bg-muted'
                }`}
              >
                {cat.label}
                <span className={`ml-1 px-1.5 py-0.2 text-[9px] rounded-full ${
                  selectedCategory === cat.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Upload bar */}
        <div className="py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              accept="image/*,application/pdf" 
              multiple
              className="hidden" 
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full sm:w-auto bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold rounded-full px-5 h-10 flex gap-2 text-xs sm:text-sm shadow-xs justify-center"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {uploadProgressText || 'Mengunggah...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 shrink-0" /> Unggah Berkas ke {CATEGORIES.find(c => c.key === selectedCategory)?.label.split(' ').slice(1).join(' ') || 'Media'}
                </>
              )}
            </Button>
          </div>

          <p className="text-[10px] sm:text-xs text-muted-foreground text-center sm:text-right">Maksimal ukuran unggahan: 2MB (Batas Paket Free)</p>
        </div>

        {/* Post-Upload Helpful Selection Tip Alert */}
        {justUploadedCount > 0 && (
          <div className="mx-1 my-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="p-1.5 rounded-full bg-emerald-500 text-white shrink-0 shadow-2xs">
                <Check className="h-4 w-4" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-headline font-bold text-emerald-950">
                  🎉 {justUploadedCount} Foto Berhasil Diunggah!
                </span>
                <span className="text-[11px] text-emerald-800 font-medium truncate sm:whitespace-normal">
                  👉 <strong>Petunjuk:</strong> Klik pada salah satu kartu foto di bawah ini untuk memilih dan menampilkannya di editor.
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setJustUploadedCount(0)}
              className="text-emerald-700 hover:bg-emerald-100 rounded-full text-xs font-bold shrink-0 h-7 px-2.5"
            >
              Tutup Tips ✕
            </Button>
          </div>
        )}

        {/* Batch Selection Controls Bar */}
        {filteredImages.length > 0 && (
          <div className="py-2 px-3 bg-muted/20 border-b flex flex-col gap-2 sm:flex-row items-stretch sm:items-center justify-between rounded-2xl my-2">
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleSelectAll}
                className="rounded-full text-[11px] sm:text-xs font-bold gap-1.5 h-8 bg-white shrink-0"
              >
                <Check className={`h-3.5 w-3.5 ${isAllSelected ? 'text-emerald-600' : ''}`} />
                {isAllSelected ? 'Batal Pilih Semua' : `Pilih Semua (${filteredImages.length})`}
              </Button>

              {selectedImageIds.length > 0 && (
                <span className="text-[10px] sm:text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 whitespace-nowrap shrink-0">
                  {selectedImageIds.length} terpilih
                </span>
              )}
            </div>

            {selectedImageIds.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                  className="flex-1 sm:flex-none rounded-full text-[11px] sm:text-xs font-bold gap-1.5 h-8 shadow-sm justify-center"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus ({selectedImageIds.length})
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleApplySelected}
                  className="flex-1 sm:flex-none rounded-full text-[11px] sm:text-xs font-bold gap-1.5 h-8 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm justify-center"
                >
                  <Check className="h-3.5 w-3.5" /> Terapkan ({selectedImageIds.length})
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto py-3 min-h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center flex-col py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-xs text-muted-foreground">Memuat media pustaka...</p>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
              {filteredImages.map(img => {
                const isSelected = selectedImageIds.includes(img.imageId);
                return (
                  <div 
                    key={img.imageId}
                    onClick={() => {
                      if (selectedImageIds.length > 0) {
                        handleToggleSelectImage(img.imageId);
                      } else {
                        onSelect(img.secureUrl);
                        onClose();
                      }
                    }}
                    className={`group relative aspect-square bg-muted rounded-2xl overflow-hidden border transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'ring-4 ring-emerald-500 border-emerald-500 shadow-lg scale-[0.98]' 
                        : 'hover:border-accent hover:shadow-lg'
                    }`}
                  >
                    <img 
                      src={img.secureUrl} 
                      alt={img.cloudinaryPublicId} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Section Category Badge on Card */}
                    {img.category && (
                      <span className="absolute top-2 left-2 text-[8px] font-bold text-white bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                        {img.category}
                      </span>
                    )}

                    {/* Checkbox Selector Badge */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleSelectImage(img.imageId, e)}
                      className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-lg scale-110' 
                          : 'bg-black/40 text-white/70 hover:bg-black/70 hover:text-white'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </button>
                    
                    {/* Hover Select indicator */}
                    {!isSelected && (
                      <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white/90 text-primary font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-full shadow-lg">
                          Pilih Gambar
                        </span>
                      </div>
                    )}
                    
                    {/* Single Delete button (visible on mobile, hover-only on desktop) */}
                    <Button 
                      size="icon" 
                      variant="destructive"
                      onClick={(e) => handleDelete(e, img)}
                      className="absolute bottom-2 right-2 h-7.5 w-7.5 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center bg-red-600 text-white border border-red-500/10"
                      title="Hapus Foto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-3xl">
              <ImageIcon className="h-10 w-10 text-muted-foreground/60 mb-2" />
              <p className="text-sm font-semibold text-muted-foreground">Tidak Ada Gambar di Kategori Ini</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Silakan unggah gambar baru atau pilih tab "📁 Semua Media".</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
