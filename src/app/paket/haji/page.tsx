
import PackageDetailView from '@/components/templates/package-detail-view';
import { getAgent } from '@/lib/agents';

export default function PackageHajiPage() {
  const agent = getAgent('default');
  return <PackageDetailView packageId="haji" agent={agent} />;
}
