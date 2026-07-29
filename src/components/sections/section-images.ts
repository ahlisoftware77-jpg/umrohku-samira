
import data from './section-images.json';

export type SectionImage = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

export const SectionImages: SectionImage[] = data.placeholderImages;
