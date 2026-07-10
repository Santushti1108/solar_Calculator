import { BatteryAnimation } from '../../components/wizard/BatteryAnimation';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import type { Inputs } from '../../types/analysis';
import { fmt } from '../../utils/format';
import { Bessinfo } from "../../data/Bessinfo";
import InfoDrawer from "../../components/common/InfoDrawer";



export function BessSizingStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;

  return (
    <div className="step-panel visible">
      <div className="panel-title-row">
      <div className="panel-title">
        BESS Sizing <span>Step 3</span>
      </div>
            <InfoDrawer
                title="Bess Information"
                sections={Bessinfo}
            />
      </div>
      <div className="panel-sub">
      <div className="alert alert-info">
        Daily consumption is auto-filled from Load Estimation: <strong>{fmt(results.load.daily_kwh, 1)} kWh/day</strong>
      </div >
       <div className="alert alert-info mt-3">
      <strong>Battery Assumptions :</strong><br />
        Depth of Discharge (DOD): 92%;
        <br />
        Round Trip Efficiency (RTE): 80%;
      </div>
      </div>
      <Card title="Battery Parameters">
        {state.loadMethod === 'appliance' ? (
          <div className="button-row">
            <button type="button" className={`btn-nav ${inputs.batteryCoverage === 'critical' ? 'next' : 'back'}`} onClick={() => updateInput('batteryCoverage', 'critical')}>
              Critical Loads
            </button>
            <button type="button" className={`btn-nav ${inputs.batteryCoverage === 'non_critical' ? 'next' : 'back'}`} onClick={() => updateInput('batteryCoverage', 'non_critical')}>
              Non-Critical Loads
            </button>
            <button type="button" className={`btn-nav ${inputs.batteryCoverage === 'all' ? 'next' : 'back'}`} onClick={() => updateInput('batteryCoverage', 'all')}>
              All Loads
            </button>
          </div>
        ) : null}

        <div className="form-grid">
         
          <FormField label="Hours of Autonomy (hrs.)"  value={String(inputs.autonomyHours)} onChange={(value) => updateInput('autonomyHours', Number(value))} 
            options={[
              { value: "4", label: "4 Hours" },
              { value: "6", label: "6 Hours" },
              { value: "8", label: "8 Hours" },
              { value: "12", label: "12 Hours" },
              { value: "16", label: "16 Hours" },
              { value: "24", label: "24 Hours" },
              { value: "36", label: "36 Hours" },
              { value: "48", label: "48 Hours" },
              ]}
            />
          <FormField
            label="Battery Chemistry"
            value={inputs.chemistry}
            onChange={(value) => updateInput('chemistry', value as Inputs['chemistry'])}
            options={[
              { value: 'LFP', label: 'LFP (LiFePO4) - 4000 cycles (11 year)' },
              { value: 'NMC', label: 'NMC - 2000 cycles (4.5 years)' },
              { value: 'Lead-Acid', label: 'Lead-Acid - 500 cycles (1.5 year)' },
            ]}
          />
          {/* <FormField label="Depth of Discharge DoD (%)" type="number" value={inputs.dod} min="50" max="100" onChange={(value) => updateInput('dod', Number(value))} /> */}
          {/* <FormField label="Round-Trip Efficiency RTE (%)" type="number" value={inputs.rte} min="70" max="100" onChange={(value) => updateInput('rte', Number(value))} /> */}
          <FormField label="Battery Cost (₹/kWh installed)" type="number" value={inputs.bessCostKwh} step="1000" onChange={(value) => updateInput('bessCostKwh', Number(value))} />
          {/* <FormField label="Daily Cycles" type="number" value={inputs.dailyCycles} min="0.5" max="3" step="0.5" onChange={(value) => updateInput('dailyCycles', Number(value))} /> */}
        </div>
      </Card>
      <Card title="BESS Sizing Results">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.bess.kwh, 1)} unit="kWh" label="Required Battery Size" />
          {/* <KpiCard value={fmt(results.bess.kw, 1)} unit="kW" label="Power Rating" tone="orange" />
          <KpiCard value={fmt(results.bess.life_yrs, 1)} unit="years" label="Battery Life" tone="green" />
          <KpiCard value={fmt(inputs.backupHours)} unit="hours" label="Hours of Autonomy" /> */}
        </div>
        <BatteryAnimation />
      </Card>
    </div>
  );
}
