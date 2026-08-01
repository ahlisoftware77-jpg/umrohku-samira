export const AVAILABLE_FONTS = [
  { name: 'Plus Jakarta Sans', category: 'Sans-Serif', label: 'Plus Jakarta Sans — Modern Indonesia (Rekomendasi Utama)' },
  { name: 'Inter', category: 'Sans-Serif', label: 'Inter — Clean & Eksekutif' },
  { name: 'Outfit', category: 'Sans-Serif', label: 'Outfit — Mewah, Bold & Modern' },
  { name: 'Poppins', category: 'Sans-Serif', label: 'Poppins — Ramah & Populer' },
  { name: 'PT Sans', category: 'Sans-Serif', label: 'PT Sans — Standar Rapi' },
  { name: 'Roboto', category: 'Sans-Serif', label: 'Roboto — Versatile & Netral' },
  { name: 'Playfair Display', category: 'Serif', label: 'Playfair Display — Royal Luxury Serif' },
  { name: 'Cinzel', category: 'Serif', label: 'Cinzel — Klassik Emas & Megah' },
  { name: 'Amiri', category: 'Serif', label: 'Amiri — Gaya Arab Naskh Islami' },
  { name: 'Alegreya', category: 'Serif', label: 'Alegreya — Premium Elegant Serif' },
  { name: 'system-ui', category: 'System', label: 'System UI — Bawaan HP / PC' },
  { name: 'monospace', category: 'Monospace', label: 'Monospace — Gaya Ketikan Rapi' },
];

export const GOOGLE_FONTS_MAP: Record<string, string> = {
  'Plus Jakarta Sans': 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap',
  'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap',
  'Outfit': 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap',
  'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap',
  'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&display=swap',
  'Cinzel': 'https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&display=swap',
  'Amiri': 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap',
  'PT Sans': 'https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap',
  'Alegreya': 'https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700;900&display=swap',
  'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
};

/**
 * Dynamically loads Google Font stylesheet into document head if not present
 */
export function loadGoogleFont(fontName: string) {
  if (typeof window === 'undefined' || !fontName || fontName === 'system-ui' || fontName === 'monospace') return;

  const fontUrl = GOOGLE_FONTS_MAP[fontName] || `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700;800&display=swap`;
  const fontLinkId = `google-font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;

  if (!document.getElementById(fontLinkId)) {
    const link = document.createElement('link');
    link.id = fontLinkId;
    link.rel = 'stylesheet';
    link.href = fontUrl;
    document.head.appendChild(link);
  }
}
