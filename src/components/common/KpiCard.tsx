import type { ReactNode } from 'react';

export function KpiCard({ value, unit, label, tone = '' }: { value: ReactNode; unit?: string; label: string; tone?: 'green' | 'orange' | '' }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-val">{value}</div>
      {unit ? <div className="kpi-unit">{unit}</div> : null}
      <div className="kpi-lbl">{label}</div>
    </div>
  );
}
