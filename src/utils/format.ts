import type { Currency } from '../types/analysis';

export function fmt(n: number, d = 0) {
  return Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }) : '-';
}

export function fmtC(n: number, currency: Currency = 'INR') {
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₹';
  return `${sym}${fmt(Math.round(n))}`;
}
