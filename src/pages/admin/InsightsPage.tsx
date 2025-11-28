import { AdminLayout } from '../../components/layout/AdminLayout';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { InsightsTab } from './components/InsightsTab';
import type { Insight } from '../../types';

export function InsightsPage() {
  const { data: insights } = useFirestoreCollection<Insight>('insights');

  return (
    <AdminLayout>
      <InsightsTab insights={insights} />
    </AdminLayout>
  );
}
