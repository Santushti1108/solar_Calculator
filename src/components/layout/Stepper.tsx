import { useAnalysis } from '../../context/AnalysisContext';
import { STEP_LABELS } from '../../utils/constants';

export function Stepper() {
  const { state, setStep } = useAnalysis();
  const progress = (state.step / (state.totalSteps - 1)) * 100;

  return (
    <div id="steps-bar">
      <div className="steps-row">
        {STEP_LABELS.map((label, index) => (
          <button
            className={`step-item ${index === state.step ? 'active' : ''} ${index < state.step ? 'done' : ''}`}
            type="button"
            key={label}
            onClick={() => setStep(index)}
          >
            <span className="step-num">{index < state.step ? '✓' : index + 1}</span>
            <span className="step-lbl">{label}</span>
          </button>
        ))}
      </div>
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
