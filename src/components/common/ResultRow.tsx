import type { ReactNode } from 'react';

export function ResultRow({ label, value, valueClass = '' }: { label: ReactNode; value: ReactNode; valueClass?: string }) {
  return (
    <div className="result-row">
      <span className="result-lbl">{label}</span>
      <span className={`result-val ${valueClass}`}>{value}</span>
    </div>
  );
}
