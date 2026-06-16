import type { ReactNode } from 'react';
import { Card } from '../common/Card';

export function ChartCard({ title, children, tall = false }: { title: ReactNode; children: ReactNode; tall?: boolean }) {
  return (
    <Card title={title}>
      <div className={`chart-wrap ${tall ? 'tall' : ''}`}>{children}</div>
    </Card>
  );
}
