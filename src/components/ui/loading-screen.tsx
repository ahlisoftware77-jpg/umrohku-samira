"use client";

import React from 'react';
import Image from 'next/image';

export default function LoadingScreen({ message = 'Memuat halaman...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="relative w-64 h-24 mb-4 animate-pulse">
        <Image 
          src="/images/Logo Umroh new season.png" 
          alt="Loading Samira Travel" 
          fill
          className="object-contain"
          priority
        />
      </div>
      <div className="h-1 w-44 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
        <div className="absolute top-0 bottom-0 left-0 bg-accent rounded-full animate-[loadingBar_1.5s_infinite_ease-in-out]"></div>
      </div>
      <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">{message}</p>
      
      <style jsx global>{`
        @keyframes loadingBar {
          0% { left: -40%; width: 40%; }
          50% { left: 20%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }
      `}</style>
    </div>
  );
}
