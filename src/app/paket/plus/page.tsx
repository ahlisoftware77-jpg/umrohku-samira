
import PackageDetailView from '@/components/templates/package-detail-view';
import { getAgent } from '@/lib/agents';

export default function PackagePlusPage() {
  const agent = getAgent('default');
  return <PackageDetailView packageId="plus" agent={agent} />;
}
