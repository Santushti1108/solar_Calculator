import { Stepper } from '../components/layout/Stepper';
import { WizardNav } from '../components/layout/WizardNav';
import { useAnalysis } from '../context/AnalysisContext';
import { BessSizingStep } from './steps/BessSizingStep';
import { CapexStep } from './steps/CapexStep';
import { ComparisonStep } from './steps/ComparisonStep';
import { DashboardStep } from './steps/DashboardStep';
import { EnvironmentStep } from './steps/EnvironmentStep';
import { FinanceStep } from './steps/FinanceStep';
import { LoadEstimationStep } from './steps/LoadEstimationStep';
import { ProjectSetupStep } from './steps/ProjectSetupStep';
import { RoofSuitabilityStep } from './steps/RoofSuitabilityStep';
import { SolarSizingStep } from './steps/SolarSizingStep';

const steps = [
  ProjectSetupStep,
  LoadEstimationStep,
  SolarSizingStep,
  RoofSuitabilityStep,
  BessSizingStep,
  CapexStep,
  FinanceStep,
  EnvironmentStep,
  ComparisonStep,
  DashboardStep,
];

export function WizardPage() {
  const { state } = useAnalysis();
  const CurrentStep = steps[state.step];

  return (
    <div id="wizard-section">
      <Stepper />
      <div id="wizard">
        <CurrentStep />
      </div>
      <WizardNav />
    </div>
  );
}
