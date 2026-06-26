import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { ApplianceEditor } from '../../components/wizard/ApplianceEditor';
import { useAnalysis } from '../../context/AnalysisContext';
import type { LoadMethod } from '../../types/analysis';
import { fmt } from '../../utils/format';

const methodLabels: Array<{ id: LoadMethod; label: string }> = [
  { id: 'auto', label: 'Area Based' },
  { id: 'appliance', label: 'Appliance Sum' },
  { id: 'bill', label: 'Bill-Based' },
  // { id: 'direct', label: 'Direct Entry' },
];

export function LoadEstimationStep() {
  const { state, results, updateInput, setLoadMethod } = useAnalysis();
  const { inputs } = state;

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Load Estimation <span>Step 2</span>
      </div>
      {/* <div className="panel-sub">Choose your load input method</div> */}
      <Card title="🏢 Building Category">
        <div className="form-grid">
          <FormField
            label="Building Type"
            value={inputs.buildingCategory}
            onChange={(value) => updateInput('buildingCategory', String(value))}
            options={[
              { value: 'Residential', label: 'Residential' },
              { value: 'Commercial', label: 'Commercial Office' },
              {value: 'Institutional', label: 'Institutional'},
              { value: 'Industrial', label: 'Industrial' },
              { value: 'Hospital', label: 'Hospital' },
              { value: 'School', label: 'School/College' },
              { value: 'Hotel', label: 'Hotel' },
              { value: 'Retail', label: 'Retail/Mall' },
            ]}
          />
          
          <FormField label="Energy Use Intensity Benchmark(kWh/m²/yr)" type="number" value={inputs.eui} step="5" onChange={(value) => updateInput('eui', Number(value))} />
          <FormField label="Built-up Area (m²)" type="number" value={inputs.area} step="50" onChange={(value) => updateInput('area', Number(value))} />
          <FormField label="Occupancy Days/Year" type="number" value={inputs.occupancyDays} onChange={(value) =>{const days = Math.min(Math.max(Number(value),1),360);updateInput('occupancyDays', days)}}  />
        </div>
      </Card>
      <Card title="📊 Select a load input method">
        <div className="button-row">
          {methodLabels.map((method) => (
            <button className={`btn-nav ${state.loadMethod === method.id ? 'next' : 'back'} small-btn`} type="button" key={method.id} onClick={() => setLoadMethod(method.id)}>
              {method.label}
            </button>
          ))}
        </div>
        {state.loadMethod === 'auto'  && null}
        {state.loadMethod === 'appliance' ? <ApplianceEditor /> : null}
        {state.loadMethod === 'bill' ? (
          <div className="form-grid">
            <FormField label="Monthly Electricity Bill (₹)" type="number" value={inputs.billAmount} onChange={(value) => updateInput('billAmount', Number(value))} />
            <FormField label="Avg Monthly Units (kWh)" type="number" value={inputs.billKwh} onChange={(value) => updateInput('billKwh', Number(value))} />
          </div>
        ) : null}
        {/* {state.loadMethod === 'direct' ? (
          <div className="form-grid">
            <FormField label="Daily Load (kWh/day)" type="number" value={inputs.directDailyKwh} step="5" onChange={(value) => updateInput('directDailyKwh', Number(value))} />
            <FormField label="Peak Load (kW)" type="number" value={inputs.directPeakKw} step="1" onChange={(value) => updateInput('directPeakKw', Number(value))} />
          </div>
        ) : null} */}
      </Card>
      <Card title="✅ Computed Load Summary">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.load.daily_kwh, 1)} unit="kWh/day" label="Daily Load" />
          <KpiCard value={fmt(results.load.peak_kw, 1)} unit="kW" label="Peak Load" tone="orange" />
          <KpiCard value={fmt(results.load.annual_kwh / 1000, 1)} unit="MWh/yr" label="Annual Load" tone="green" />
          <KpiCard value={fmt(results.load.critical_peak_kw,1)}unit="kw" label="Critical Peak"/>
              <KpiCard value={fmt(results.load.non_critical_peak_kw,1)} unit ="kw" label="Non-Critical Peak"/>
        </div>
      </Card>
    </div>
  );
}
