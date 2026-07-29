
import PackageDetailView from '@/components/templates/package-detail-view';
import { getAgent } from '@/lib/agents';

export default function PackageRegulerPage() {
  const agent = getAgent('default');
  return <PackageDetailView packageId="reguler" agent={agent} />;
}
