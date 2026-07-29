"use client";

import React, { useState, useEffect } from 'react';
import { useCmsStore } from '@/hooks/useCmsStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Form, FormField, FieldType } from '@/types/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Check, Settings, ShieldAlert, Loader2 } from 'lucide-react';

export default function FormBuilder() {
  const { page } = useCmsStore();
  const tenantId = page?.tenantId || '';
  const pageId = page?.pageId || '';

  const [formId, setFormId] = useState(`form_${pageId}`);
  const [formTitle, setFormTitle] = useState('Formulir Registrasi Jamaah');
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load existing form configuration if exists
  useEffect(() => {
    if (!tenantId || !pageId) return;

    async function loadForm() {
      try {
        setLoading(true);
        const formDocRef = doc(db, 'forms', formId);
        const formSnap = await getDoc(formDocRef);
        if (formSnap.exists()) {
          const formData = formSnap.data() as Form;
          setFormTitle(formData.title);
          setFields(formData.fields);
        } else {
          // Initialize with standard fields
          setFields([
            { id: 'f_name', type: 'text', label: 'Nama Lengkap', placeholder: 'Ahmad Fauzi', required: true },
            { id: 'f_phone', type: 'phone', label: 'Nomor WhatsApp', placeholder: '081234567890', required: true },
            { id: 'f_email', type: 'email', label: 'Alamat Email', placeholder: 'fauzi@email.com', required: false },
            { id: 'f_notes', type: 'textarea', label: 'Pertanyaan atau Catatan Khusus', placeholder: 'Tulis di sini...', required: false }
          ]);
        }
      } catch (err) {
        console.error('Error loading form configuration:', err);
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [tenantId, pageId, formId]);

  // Save form config
  const saveFormConfig = async () => {
    if (!tenantId || !pageId) return;
    try {
      setSaving(true);
      const newForm: Form = {
        formId,
        tenantId,
        landingPageId: pageId,
        title: formTitle,
        fields
      };
      await setDoc(doc(db, 'forms', formId), newForm);
      alert('Konfigurasi Formulir berhasil disimpan!');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan konfigurasi form.');
    } finally {
      setSaving(false);
    }
  };

  // Add field
  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `f_${Date.now()}`,
      type,
      label: `Field Baru ${fields.length + 1}`,
      placeholder: '',
      required: false,
      options: ['Pilihan A', 'Pilihan B']
    };
    setFields(prev => [...prev, newField]);
  };

  // Delete field
  const deleteField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  // Update field config
  const updateField = (id: string, key: keyof FormField, value: any) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border rounded-3xl min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Memuat Form Builder...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 p-6 bg-white border rounded-3xl">
      {/* Configuration Column */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary mb-1">Form Builder Dinamis</h2>
          <p className="text-xs text-muted-foreground">Buat formulir registrasi kustom untuk halaman arahan Anda secara dinamis.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-title">Judul Formulir</Label>
          <Input id="form-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Formulir Pendaftaran" />
        </div>

        {/* Fields List */}
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Daftar Input Field</p>
          {fields.map((field, idx) => (
            <Card key={field.id} className="border shadow-none rounded-2xl relative group">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {field.type}
                  </span>
                  
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => deleteField(field.id)}
                    className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Label Field</Label>
                    <Input 
                      value={field.label} 
                      onChange={(e) => updateField(field.id, 'label', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Placeholder</Label>
                    <Input 
                      value={field.placeholder || ''} 
                      onChange={(e) => updateField(field.id, 'placeholder', e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id={`req-${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5 border-muted"
                  />
                  <Label htmlFor={`req-${field.id}`} className="text-xs cursor-pointer select-none">Wajib diisi (Required)</Label>
                </div>

                {/* Option editor for selection types */}
                {['select', 'radio', 'checkbox'].includes(field.type) && (
                  <div className="space-y-1 pt-1 border-t">
                    <Label className="text-xs">Pilihan Opsi (pisahkan dengan koma)</Label>
                    <Input 
                      value={field.options?.join(', ') || ''} 
                      onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()))} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Controls */}
        <div className="pt-2 border-t space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Tambah Field Baru</Label>
          <div className="flex flex-wrap gap-2">
            {(['text', 'email', 'phone', 'textarea', 'select', 'date'] as FieldType[]).map(type => (
              <Button 
                key={type}
                variant="outline" 
                size="sm"
                onClick={() => addField(type)}
                className="text-[10px] uppercase font-bold rounded-xl"
              >
                + {type}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={saveFormConfig}
          disabled={saving}
          className="w-full bg-primary text-white hover:bg-accent hover:text-accent-foreground font-bold h-11 rounded-full flex gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Simpan Struktur Form
            </>
          )}
        </Button>
      </div>

      {/* Mock Live Preview Column */}
      <div className="bg-muted/30 p-8 rounded-3xl flex flex-col justify-center border">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 text-center">Live Preview Formulir</h3>
        
        <Card className="rounded-[2rem] shadow-xl border-none">
          <CardContent className="p-6 md:p-8 space-y-6">
            <h4 className="font-headline font-bold text-xl text-primary text-center pb-2 border-b">
              {formTitle}
            </h4>

            <form className="space-y-4 pointer-events-none select-none" onSubmit={(e) => e.preventDefault()}>
              {fields.map(f => (
                <div key={f.id} className="space-y-1 text-left">
                  <Label className="font-semibold text-sm">
                    {f.label} {f.required && <span className="text-destructive">*</span>}
                  </Label>
                  
                  {f.type === 'textarea' ? (
                    <Textarea placeholder={f.placeholder || 'Tulis di sini...'} className="rounded-xl" />
                  ) : f.type === 'select' ? (
                    <select className="w-full h-11 border border-input bg-background px-3 py-2 text-sm rounded-xl focus:ring-primary focus:border-primary">
                      {f.options?.map((o, idx) => (
                        <option key={idx}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      type={f.type === 'email' ? 'email' : f.type === 'date' ? 'date' : 'text'} 
                      placeholder={f.placeholder} 
                      className="rounded-xl h-11" 
                    />
                  )}
                </div>
              ))}

              <Button className="w-full h-12 rounded-full bg-primary text-white font-bold text-base mt-2">
                Kirim Pendaftaran
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
