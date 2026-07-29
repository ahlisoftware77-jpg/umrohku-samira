
import ContactTemplate from '@/components/templates/contact-template';
import { getAgent } from '@/lib/agents';

export default function KontakPage() {
  const agent = getAgent('default');
  return <ContactTemplate agent={agent} />;
}
