
import PackageDetailView from '@/components/templates/package-detail-view';
import { getAgent } from '@/lib/agents';

export default function PackageRamadanPage() {
  const agent = getAgent('default');
  return <PackageDetailView packageId="ramadan" agent={agent} />;
}
