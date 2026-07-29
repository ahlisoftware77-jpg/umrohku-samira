
import ProductKnowledgeTemplate from '@/components/templates/product-knowledge-template';
import { getAgent } from '@/lib/agents';

export default function RootProductKnowledgePage() {
  const agent = getAgent('default');
  return <ProductKnowledgeTemplate agent={agent} />;
}
