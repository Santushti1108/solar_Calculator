import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AnalysisState, Appliance, Inputs, LoadMethod, SystemMode } from '../types/analysis';
import { EUI_DB, initialState } from '../utils/constants';
import { useAnalysisCalculations } from '../hooks/useAnalysisCalculations';
import { ApplianceEditor } from '../components/wizard/ApplianceEditor';
import { UpdateModeEnum } from 'chart.js';

interface AnalysisContextValue {
  state: AnalysisState;
  results: ReturnType<typeof useAnalysisCalculations>;
  startWizard: () => void;
  goHome: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: SystemMode) => void;
  setLoadMethod: (method: LoadMethod) => void;
  updateInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  updateAppliance: (index: number, patch: Partial<Appliance>) => void;
  addAppliance: () => void;
  removeAppliance: (index: number) => void;
}
const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initialState);
  const results = useAnalysisCalculations(state);

  const value = useMemo<AnalysisContextValue>(
    () => ({
      state,
      results,
      startWizard: () => setState((current) => ({ ...current, showWizard: true, step: 0 })),
      goHome: () => setState((current) => ({ ...current, showWizard: false })),
      setStep: (step) => {
        setState((current) => ({ ...current, step: Math.max(0, Math.min(current.totalSteps - 1, step)) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      nextStep: () => {
        setState((current) => ({ ...current, step: Math.min(current.totalSteps - 1, current.step + 1) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      prevStep: () => {
        setState((current) => ({ ...current, step: Math.max(0, current.step - 1) }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      setMode: (mode) => setState((current) => ({ ...current, mode })),
      setLoadMethod: (loadMethod) => setState((current) => ({ ...current, loadMethod })),
      updateInput: (key, value) =>
        setState((current) => {
          const nextInputs = { ...current.inputs, [key]: value };
          if (key === 'buildingCategory') nextInputs.eui = EUI_DB[String(value)] || 120;
          if (key === 'roofArea') nextInputs.roofAvailable = Number(value) || current.inputs.roofAvailable;
          return { ...current, inputs: nextInputs };
        }),
      updateAppliance: (index, patch) =>
        setState((current) => ({
          ...current,
          appliances: current.appliances.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
        })),
      addAppliance: () =>
        setState((current) => ({
          ...current,
          appliances: [...current.appliances, { id: crypto.randomUUID(), name: 'New Appliance', qty: 1, w: 100, hrs: 8, priority:'non_critical', },],
        })),
      removeAppliance: (index) =>
        setState((current) => ({
          ...current,
          appliances: current.appliances.filter((_, itemIndex) => itemIndex !== index),
        })),
    }),
    [results, state],
  );

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>;
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) throw new Error('useAnalysis must be used inside AnalysisProvider');
  return context;
}
