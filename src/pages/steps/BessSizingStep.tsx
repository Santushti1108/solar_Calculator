import { BatteryAnimation } from '../../components/wizard/BatteryAnimation';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import type { Inputs } from '../../types/analysis';
import { fmt } from '../../utils/format';

export function BessSizingStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const onGrid = state.mode === 'on-grid';

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        BESS Sizing <span>Step 5</span>
      </div>
      <div className="panel-sub"></div>
      <div className={`alert ${onGrid ? 'alert-ok' : 'alert-info'}`}>
        {onGrid ? '✅ On-Grid mode: BESS not required. Net metering active.' : `🔋 ${state.mode === 'off-grid' ? 'Off-Grid: BESS mandatory - A9a sizing' : 'Hybrid: BESS optional - A9b peak-shave sizing'}`}
      </div>
      <Card title="🔋 Battery Parameters">
        
        {state.loadMethod === "appliance" && (
        <>
        <div className="button-row">
          <button
            type="button"
            className={`btn-nav ${
              inputs.batteryCoverage === "critical"
                ? "next"
                : "back"
            }`}
            onClick={() =>
              updateInput(
                "batteryCoverage",
                "critical"
              )
            }
          >
            Critical Loads
          </button>
          <button
            type="button"
            className={`btn-nav ${
              inputs.batteryCoverage ===
              "non_critical"
                ? "next"
                : "back"
            }`}
            onClick={() =>
              updateInput(
                "batteryCoverage",
                "non_critical"
              )
            }
          >
            Non-Critical Loads
          </button>

          <button
            type="button"
            className={`btn-nav ${
              inputs.batteryCoverage === "all"
                ? "next"
                : "back"
            }`}
            onClick={() =>
              updateInput(
                "batteryCoverage",
                "all"
              )
            }
          >
            All Loads
          </button>
          
        </div>
        </>
        )}
        
        <div className="form-grid">
          <FormField label="Depth of Discharge DoD (%)" type="number" value={inputs.dod} min="50" max="100" onChange={(value) => updateInput('dod', Number(value))} />
          <FormField label="Round-Trip Efficiency RTE (%)" type="number" value={inputs.rte} min="70" max="100" onChange={(value) => updateInput('rte', Number(value))} />
          <FormField
            label="Battery Chemistry"
            value={inputs.chemistry}
            onChange={(value) => updateInput('chemistry', value as Inputs['chemistry'])}
          
            options={[
              { value: 'LFP', label: 'LFP (LiFePO4) - 4000 cycles' },
              { value: 'NMC', label: 'NMC - 2000 cycles' },
              { value: 'Lead-Acid', label: 'Lead-Acid - 500 cycles' },
            ]}
          />
          <FormField label="Backup Hours Required" type="number" value={inputs.backupHours} min="1" max="24" onChange={(value) => updateInput('backupHours', Number(value))} />
          <FormField label="Days Autonomy (Off-Grid)" type="number" value={inputs.autonomyDays} min="1" max="5" onChange={(value) => updateInput('autonomyDays', Number(value))} />
          <FormField label="Peak Shave Target (kW)" type="number" value={inputs.peakShaveTarget} step="1" onChange={(value) => updateInput('peakShaveTarget', Number(value))} />
          <FormField label="Daily Cycles" type="number" value={inputs.dailyCycles} min="0.5" max="3" step="0.5" onChange={(value) => updateInput('dailyCycles', Number(value))} />
          <FormField label="Cost (₹/kWh installed)" type="number" value={inputs.bessCostKwh} step="1000" onChange={(value) => updateInput('bessCostKwh', Number(value))} />
        </div>
      </Card>
      <Card title="📊 BESS Sizing Results">
        <div className="kpi-grid">
          {onGrid ? (
            <KpiCard value="-" label="No BESS (On-Grid)" />
          ) : (
            <>
              
              {/* <KpiCard value={inputs.batteryCoverage === "critical"?"critcal":inputs.batteryCoverage ==="non_critical"?"Non-Critical":"All Loads"}label="Coverage Scope"/> */}
              <KpiCard value={fmt(results.bess.kwh, 1)} unit="kWh" label="Battery Capacity" />
              <KpiCard value={fmt(results.bess.kw, 1)} unit="kW" label="Power Rating" tone="orange" />
              <KpiCard value={fmt(results.bess.life_yrs, 1)} unit="years" label="Battery Life" tone="green" />
              <KpiCard value={fmt(inputs.backupHours)} unit="hours" label="Backup Duration" />
            </>
          )}
        </div>
        <BatteryAnimation />
      </Card>
    </div>
  );
}


