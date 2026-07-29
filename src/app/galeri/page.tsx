import GalleryTemplate from '@/components/templates/gallery-template';
import { getAgent } from '@/lib/agents';

export default function RootGalleryPage() {
  const agent = getAgent('default');
  return <GalleryTemplate agent={agent} />;
}
