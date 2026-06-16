import type { SystemMode } from '../../types/analysis';
import { useAnalysis } from '../../context/AnalysisContext';

const modes: Array<{ id: SystemMode; icon: string; name: string; desc: string }> = [
  { id: 'on-grid', icon: '🔌', name: 'On-Grid', desc: 'Net metering · No BESS required' },
  { id: 'hybrid', icon: '⚡', name: 'Hybrid', desc: 'BESS optional · Peak shaving' },
  { id: 'off-grid', icon: '🏕️', name: 'Off-Grid', desc: 'BESS mandatory · Full autonomy' },
];

export function ModeSelector() {
  const { state, setMode } = useAnalysis();

  return (
    <div className="mode-grid">
      {modes.map((mode) => (
        <button className={`mode-card ${state.mode === mode.id ? 'selected' : ''}`} type="button" key={mode.id} onClick={() => setMode(mode.id)}>
          <div className="mode-icon">{mode.icon}</div>
          <div className="mode-name">{mode.name}</div>
          <div className="mode-desc">{mode.desc}</div>
        </button>
      ))}
    </div>
  );
}
