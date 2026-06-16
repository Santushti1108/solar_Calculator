import { useMemo } from 'react';
import type { AnalysisState } from '../types/analysis';
import { computeAll } from '../utils/calculations';

export function useAnalysisCalculations(state: AnalysisState) {
  return useMemo(() => computeAll(state), [state]);
}
