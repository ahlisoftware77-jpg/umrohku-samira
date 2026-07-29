
export interface Package {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  imageId: string;
  inclusions: string[];
  itinerary: { day: number; activity: string }[];
  details: string[]; // For card/list view
}

export const packagesData: Record<string, Package> = {
  'reguler': {
    id: 'reguler',
    title: 'Paket Umrah Reguler',
    price: 'Umroh mulai Rp31 Jutaan',
    duration: '9 Hari',
    description: 'Nikmati perjalanan ibadah yang nyaman dan khusyuk dengan fasilitas terbaik serta bimbingan ibadah yang intensif sesuai sunnah.',
    imageId: 'package-reguler',
    details: [
      'Perjalanan 9-12 Hari',
      'Hotel Dekat Haram',
      'Penerbangan Internasional',
      'Bimbingan Manasik Lengkap',
    ],
    inclusions: ['Visa Umrah', 'Tiket Pesawat PP', 'Hotel Makkah & Madinah', 'Makan 3x Sehari', 'Mutawwif Berpengalaman', 'Air Zamzam 5L'],
    itinerary: [
      { day: 1, activity: 'Kedatangan di Jeddah & Menuju Madinah.' },
      { day: 2, activity: 'Madinah (Masjid Nabawi & Ziarah).' },
      { day: 3, activity: 'Madinah (Ibadah & Persiapan).' },
      { day: 4, activity: 'Menuju Makkah (Miqat Bir Ali).' },
      { day: 5, activity: 'Makkah (Masjidil Haram & Ibadah).' },
      { day: 6, activity: 'Makkah (Ziarah & Umroh Kedua).' },
      { day: 7, activity: 'Makkah (Ibadah Bebas).' },
      { day: 8, activity: 'Menuju Jeddah (City Tour & Persiapan Pulang).' },
      { day: 9, activity: 'Tiba di Tanah Air.' }
    ]
  },
  'plus': {
    id: 'plus',
    title: 'Paket Umrah Plus Turki',
    price: 'Umroh mulai Rp44 Jutaan',
    duration: '12 Hari',
    description: 'Kombinasi sempurna antara ibadah Umrah yang sakral dan perjalanan sejarah Islam ke destinasi ikonik di Turki.',
    imageId: 'package-plus',
    details: [
      'Turki / Mesir (opsional)',
      'Hotel Bintang 4-5',
      'Itinerary Eksklusif',
      'Pendampingan Ekstra',
    ],
    inclusions: ['Visa Umrah & Turki', 'Tiket Pesawat Full Service', 'Hotel Bintang 5', 'City Tour Istanbul', 'Asuransi Perjalanan'],
    itinerary: [
      { day: 1, activity: 'Terbang ke Istanbul.' },
      { day: 2, activity: 'City Tour Istanbul.' },
      { day: 3, activity: 'Penerbangan menuju Madinah.' }
    ]
  },
  'ramadan': {
    id: 'ramadan',
    title: 'Paket Umrah Ramadan',
    price: 'Umroh mulai Rp41 Jutaan',
    duration: '16 Hari',
    description: 'Rasakan kemuliaan Ramadan di Tanah Suci. Program khusus i\'tikaf dan suasana buka puasa yang tak terlupakan di Masjidil Haram.',
    imageId: 'package-ramadan',
    details: [
      'Perjalanan 16 Hari',
      'Buka Puasa & Sahur Spesial',
      'Program I\'tikaf Intensif',
      'Malam Lailatul Qadr',
    ],
    inclusions: ['Iftar & Sahur Spesial', 'Visa Ramadan', 'Program I\'tikaf', 'Bimbingan Kajian Harian'],
    itinerary: [
      { day: 1, activity: 'Keberangkatan menuju Madinah.' }
    ]
  },
  'haji': {
    id: 'haji',
    title: 'Paket Haji Furoda',
    price: 'Hubungi Kami',
    duration: '25 Hari',
    description: 'Ibadah Haji tanpa antri dengan fasilitas premium dan bimbingan eksklusif untuk memastikan rukun haji tertunaikan dengan sempurna.',
    imageId: 'package-haji',
    details: [
        'Mina, Arafat, & Muzdalifah',
        'Ritual Lengkap',
        'All-inclusive',
        'Penerbangan Langsung'
    ],
    inclusions: ['Visa Haji Furoda', 'Tenda Maktab Premium', 'Apartemen Transit', 'Hadiyu/Dam'],
    itinerary: [
      { day: 1, activity: 'Keberangkatan menuju Jeddah.' }
    ]
  }
};

export const packagesList = Object.values(packagesData);

export function getPackage(id: string): Package | undefined {
  return packagesData[id];
}
