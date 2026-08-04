"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plane, 
  Clock, 
  Users, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Sparkles, 
  MapPin,
  Building2,
  PhoneCall,
  Download,
  AlertCircle
} from 'lucide-react';
import { Agent } from '@/lib/agents';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface DepartureScheduleItem {
  id: string;
  date: string;
  packageName: string;
  airline: string;
  duration: string;
  hotelMakkah: string;
  hotelMadinah: string;
  price: string;
  seatsLeft: number;
  status: 'Tersedia' | 'Terbatas' | 'Full Booked';
}

interface DepartureScheduleSectionProps {
  data?: Record<string, any>;
  agent?: Agent;
}

const DEFAULT_SCHEDULES: DepartureScheduleItem[] = [
  {
    id: '1',
    date: '15 September 2026',
    packageName: 'Umrah Safara Bintang 5',
    airline: 'Saudia Airlines (Direct Madinah)',
    duration: '9 Hari',
    hotelMakkah: 'Pulman Zamzam Makkah (⭐️5)',
    hotelMadinah: 'Frontel Al Harithia (⭐️5)',
    price: 'Rp 34.500.000',
    seatsLeft: 5,
    status: 'Terbatas'
  },
  {
    id: '2',
    date: '08 Oktober 2026',
    packageName: 'Umrah Sukari Hemat & Nyaman',
    airline: 'Batik Air Premium (Direct)',
    duration: '9 Hari',
    hotelMakkah: 'Anjum Hotel Makkah (⭐️5)',
    hotelMadinah: 'Grand Plaza Madinah (⭐️4)',
    price: 'Rp 31.900.000',
    seatsLeft: 8,
    status: 'Tersedia'
  },
  {
    id: '3',
    date: '22 Oktober 2026',
    packageName: 'Umrah Majol Milad Samira',
    airline: 'Lion Air Airbus A330',
    duration: '12 Hari',
    hotelMakkah: 'Le Meridien Makkah (⭐️5)',
    hotelMadinah: 'Rove Al Madinah (⭐️4)',
    price: 'Rp 29.500.000',
    seatsLeft: 3,
    status: 'Terbatas'
  },
  {
    id: '4',
    date: '10 November 2026',
    packageName: 'Umrah Safawi Executive 16 Hari',
    airline: 'Garuda Indonesia (Direct)',
    duration: '16 Hari',
    hotelMakkah: 'Fairmont Makkah Clock Tower (⭐️5)',
    hotelMadinah: 'Dar Al Taqwa Madinah (⭐️5)',
    price: 'Rp 42.000.000',
    seatsLeft: 12,
    status: 'Tersedia'
  },
  {
    id: '5',
    date: '05 Desember 2026',
    packageName: 'Umrah Liburan Akhir Tahun',
    airline: 'Saudia Airlines Direct',
    duration: '9 Hari',
    hotelMakkah: 'Swissotel Al Maqam (⭐️5)',
    hotelMadinah: 'Frontel Al Harithia (⭐️5)',
    price: 'Rp 36.800.000',
    seatsLeft: 0,
    status: 'Full Booked'
  }
];

export default function DepartureScheduleSection({ data, agent }: DepartureScheduleSectionProps) {
  const badgeText = data?.badgeText || '✈️ JADWAL KEBERANGKATAN RESMI';
  const title = data?.title || 'Jadwal Informasi Keberangkatan Umrah';
  const description = data?.description || 'Pilih tanggal keberangkatan impian Anda bersama Samira Travel. Jadwal terkonfirmasi pasti dengan visa & penerbangan direct:';
  
  const schedulesList: DepartureScheduleItem[] = (data?.schedules && Array.isArray(data.schedules) && data.schedules.length > 0)
    ? data.schedules 
    : DEFAULT_SCHEDULES;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredSchedules = schedulesList.filter(item => {
    const matchesSearch = item.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.airline.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <section id="jadwal" className="py-16 md:py-24 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] sm:text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3.5 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-600" /> {badgeText}
          </span>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-headline font-black text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-base text-slate-600 mt-3 font-medium leading-relaxed">
            {description}
          </p>
        </motion.div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border shadow-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              type="text"
              placeholder="Cari bulan, paket, atau maskapai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-xs rounded-2xl border-slate-200 focus:border-amber-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatus === 'all' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Jadwal ({schedulesList.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Tersedia')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatus === 'Tersedia' 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Seat Tersedia
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('Terbatas')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatus === 'Terbatas' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Seat Terbatas 🔥
            </button>
          </div>
        </div>

        {/* Schedule List Cards */}
        {filteredSchedules.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border shadow-sm space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">Tidak ada jadwal yang cocok dengan kata kunci pencarian Anda.</p>
            <p className="text-xs text-slate-500">Coba ubah kata kunci atau pilih tab "Semua Jadwal".</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedules.map((item, idx) => {
              const waUrl = agent?.whatsapp 
                ? `https://api.whatsapp.com/send?phone=${agent.whatsapp}&text=${encodeURIComponent(`Halo, saya berminat mendaftar Seat Umrah jadwal tanggal *${item.date}* (${item.packageName}). Apakah seat masih tersedia?`)}`
                : '';

              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden group"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 text-slate-950 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-md border border-amber-300">
                      <Calendar className="w-4 h-4 mb-0.5" />
                      <span className="text-[10px] leading-tight font-extrabold uppercase">Tgl</span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {item.date}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          item.status === 'Tersedia' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : item.status === 'Terbatas'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {item.status === 'Terbatas' ? `🔥 Terbatas (${item.seatsLeft} Seat Tersisa)` : item.status}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-headline font-black text-primary leading-snug">
                        {item.packageName}
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 font-semibold pt-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <Plane className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{item.airline}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Durasi: {item.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Makkah: {item.hotelMakkah}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Madinah: {item.hotelMadinah}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0 gap-2">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Harga Mulai</span>
                      <strong className="text-lg sm:text-xl font-black text-amber-600 leading-none block">
                        {item.price}
                      </strong>
                    </div>

                    {waUrl && item.status !== 'Full Booked' && (
                      <Button
                        asChild
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl px-4 shadow-md gap-1.5 shrink-0"
                      >
                        <a href={waUrl} target="_blank" rel="noopener noreferrer">
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Pesan Seat WA</span>
                        </a>
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Link to Full Schedule Page */}
        <div className="mt-10 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-black text-xs sm:text-sm px-8 h-11 rounded-full shadow-sm gap-2 transition-all"
          >
            <a href="/jadwal">
              <span>Lihat Seluruh Informasi Jadwal Keberangkatan Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
