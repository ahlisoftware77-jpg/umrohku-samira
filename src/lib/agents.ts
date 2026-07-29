
export interface Agent {
  slug: string;
  tenantId?: string;
  name: string;
  displayName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  photoUrl: string;
  mapEmbedUrl: string;
  galleryImages?: string[];
  pdfUrl?: string;
}

export const agents: Agent[] = [
  {
    slug: 'default',
    name: 'Triyadi Yanuar',
    displayName: 'Mitra Karawang',
    phone: '083815862300',
    whatsapp: '6283815862300',
    email: 'yadikomputerofficial@gmail.com',
    address: 'Perum Citra Swarna Pratama Blok E4-06, Bengle, Majalaya, Karawang',
    photoUrl: '/images/pp1.jpg',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.5513705585167!2d107.34370047326453!3d-6.322502861863918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69777979f615f9%3A0xc725f1b8c5afe2d5!2sYADIKOMPUTER%20%26%20SAMIRA%20TRAVEL%20UMROH!5e0!3m2!1sid!2sid!4v1771423829490!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade'
  },
  {
    slug: 'fatmawati',
    name: 'Fatmawati',
    displayName: 'Mitra Jakarta Selatan',
    phone: '081234567890',
    whatsapp: '6281234567890',
    email: 'fatmawati@example.com',
    address: 'Jl. RS. Fatmawati No. 1, Cilandak, Jakarta Selatan',
    photoUrl: '/images/pp1.jpg',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.91898748378!2d106.7924!3d-6.2755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f196395f16f3%3A0x6e26715456f8f533!2sJl.%20Fatmawati%20Raya%2C%20Cilandak%2C%20Jakarta%20Selatan!5e0!3m2!1sid!2sid!4v1710000000002!5m2!1sid!2sid'
  },
  {
    slug: 'agus',
    name: 'Agus Santoso',
    displayName: 'Mitra Bandung',
    phone: '087712345678',
    whatsapp: '6287712345678',
    email: 'agus.samira@example.com',
    address: 'Jl. Asia Afrika No. 10, Bandung, Jawa Barat',
    photoUrl: '/images/pp1.jpg',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.942747178051!2d107.6096!3d-6.9175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e630d00fca3d%3A0x272767078864f1d4!2sJl.%20Asia%20Afrika%2C%20Bandung%2C%20Jawa%20Barat!5e0!3m2!1sid!2sid!4v1710000000003!5m2!1sid!2sid'
  }
];

export function getAgent(slug: string): Agent {
  const found = agents.find(a => a.slug.toLowerCase() === slug.toLowerCase());
  return found || agents[0];
}
