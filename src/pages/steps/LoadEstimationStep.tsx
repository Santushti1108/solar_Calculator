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
];

export function LoadEstimationStep() {
  const { state, results, updateInput, setLoadMethod } = useAnalysis();
  const { inputs } = state;

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Load Estimation <span>Step 2</span>
      </div>
      <Card title="Select a load input method">
        <div className="button-row">
          {methodLabels.map((method) => (
            <button className={`btn-nav ${state.loadMethod === method.id ? 'next' : 'back'} small-btn`} type="button" key={method.id} onClick={() => setLoadMethod(method.id)}>
              {method.label}
            </button>
          ))}
        </div>
        {state.loadMethod === 'auto' ? (
          <div className="form-grid">
            <FormField
              label="Building Type"
              value={inputs.buildingCategory}
              onChange={(value) => updateInput('buildingCategory', String(value))}
              options={[
                { value: 'Residential', label: 'Residential' },
                { value: 'Institutional', label: 'Institutional' },
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Industry', label: 'Industry' },
              ]}
            />
            <FormField label="Built-up Area (m²)" type="number" value={inputs.area} step="50" onChange={(value) => updateInput('area', Number(value))} />
          </div>
        ) : null}
        {state.loadMethod === 'appliance' ? <ApplianceEditor /> : null}
        {state.loadMethod === 'bill' ? (
          <div className="form-grid">
            <FormField label="Monthly Electricity Bill (₹)" type="number" value={inputs.billAmount} onChange={(value) => updateInput('billAmount', Number(value))} />
            <FormField label="Grid Tariff (₹/kWh)" type="number" value={inputs.tariff} step="0.1" min="1" onChange={(value) => updateInput('tariff', Number(value))} />
            <FormField label="Contract Demand (kW)" type="number" value={inputs.contractDemand} onChange={(value) => updateInput('contractDemand', Number(value))} />
          </div>
        ) : null}
      </Card>
      {results.load.daily_kwh > 0 ? (
        <Card title="Computed Load Summary">
          <div className="kpi-grid">
            <KpiCard value={fmt(results.load.daily_kwh, 1)} unit="kWh/day" label="Total Daily Consumption" />
            <KpiCard value={fmt(results.load.average_kw, 1)} unit="kW" label="Average Load" tone="orange" />
            {state.loadMethod !== 'auto' ? <KpiCard value={fmt(results.load.peak_kw, 1)} unit="kW" label="Total Building Load" tone="green" /> : null}
            {state.loadMethod === 'appliance' ? (
              <>
                <KpiCard value={fmt(results.load.critical_daily_kwh, 1)} unit="kWh/day" label="Critical Load" />
                <KpiCard value={fmt(results.load.non_critical_daily_kwh, 1)} unit="kWh/day" label="Non-Critical Load" />
              </>
            ) : null}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
