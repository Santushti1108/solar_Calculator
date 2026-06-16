import { useAnalysis } from '../../context/AnalysisContext';

export function WizardNav() {
  const { state, nextStep, prevStep } = useAnalysis();

  return (
    <div className="wiz-nav">
      <button className="btn-nav back" style={{ visibility: state.step === 0 ? 'hidden' : 'visible' }} type="button" onClick={prevStep}>
        ← Back
      </button>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
        Step {state.step + 1} of {state.totalSteps}
      </span>
      <button className="btn-nav next" type="button" onClick={nextStep}>
        {state.step === state.totalSteps - 1 ? 'Finish ✓' : 'Next →'}
      </button>
    </div>
  );
}
