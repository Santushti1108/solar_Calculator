import type { ReactNode } from 'react';

export function Card({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      {title ? <div className="card-title">{title}</div> : null}
      {children}
    </div>
  );
}
