import type { SystemMode } from '../../types/analysis';
import { useAnalysis } from '../../context/AnalysisContext';
import { FormField } from '../common/FormField';

const modes: Array<{ id: SystemMode;name: string; desc: string }> = [
  { id: 'offgrid-rts-bess', name: 'Offgrid', desc: 'RTS + BESS' },
  { id: 'ongrid-rts-bess',  name: 'Ongrid', desc: 'RTS + BESS' },
  { id: 'offgrid-rts-bess-ev',  name: 'Offgrid', desc: 'RTS + BESS + EV' },
  { id: 'ongrid-rts-bess-ev', name: 'Ongrid', desc: 'RTS + BESS + EV' },
  { id: 'grid-bess',  name: 'Grid', desc: 'BESS' },
  { id: 'grid-bess-ev',  name: 'Grid', desc: 'BESS + EV'},
];


export function ModeSelector() {
  const { state, setMode,updateInput } = useAnalysis();
  const { inputs } = state;
  const isEvMode = inputs.systemMode.includes("ev");



  return (
    <>
    <div className="mode-grid">
      {modes.map((mode) => (
        <button className={`mode-card ${inputs.systemMode === mode.id ?"selected":""}`} type="button" key={mode.id} onClick={() => setMode(mode.id)}>
          {/* <div className="mode-icon">{mode.icon}</div> */}
          <div className="mode-name">{mode.name}</div>
          <div className="mode-desc">{mode.desc}</div>
        </button>
      ))}
    </div>

    {isEvMode && (
        <div className="mt-4">
          <FormField
            label="EV Cost"
            value={inputs.evCostOption}
            onChange={(value) =>
              updateInput(
                "evCostOption",
                value as "included" | "excluded"
              )
            }
            options={[
              { value: "included", label: "Included" },
              { value: "excluded", label: "Excluded" },
            ]}
          />
        </div>
      )}
    </>
  );
}
