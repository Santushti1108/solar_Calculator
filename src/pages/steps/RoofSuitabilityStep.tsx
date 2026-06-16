import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { ResultRow } from '../../components/common/ResultRow';
import { useAnalysis } from '../../context/AnalysisContext';
import { fmt } from '../../utils/format';

export function RoofSuitabilityStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const effective = inputs.roofAvailable * (inputs.roofUsablePct / 100);
  const suitable = effective >= results.solar.roof_req;

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Roof Suitability <span>Step 4</span>
      </div>
      <div className="panel-sub"></div>
      <div className={`alert ${suitable ? 'alert-ok' : 'alert-warn'}`}>
        {suitable ? '✅' : '⚠️'} Roof area is <strong>{suitable ? 'suitable' : 'insufficient'}</strong>. Effective:{' '}
        <strong>{fmt(effective)} m²</strong> vs Required: <strong>{fmt(results.solar.roof_req)} m²</strong>
        {!suitable ? ' - consider reducing system size or ground mount.' : ''}
      </div>
      <Card title="🏠 Roof Details">
        <div className="form-grid">
          <FormField label="Available Roof Area (m²)" type="number" value={inputs.roofAvailable} step="10" onChange={(value) => updateInput('roofAvailable', Number(value))} />
          <FormField label="Usable % of Roof" type="number" value={inputs.roofUsablePct} onChange={(value) => updateInput('roofUsablePct', Number(value))} />
          <FormField label="Tilt Angle (°)" type="number" value={inputs.roofTilt} min="0" max="45" onChange={(value) => updateInput('roofTilt', Number(value))} />
          <FormField
            label="Roof Type"
            value={inputs.roofType}
            onChange={(value) => updateInput('roofType', String(value))}
            options={[
              { value: 'Flat', label: 'Flat Terrace' },
              { value: 'Sloped', label: 'Sloped' },
              { value: 'Carport', label: 'Carport' },
              { value: 'Ground', label: 'Ground Mount' },
            ]}
          />
        </div>
        <div className="detail-block">
          <ResultRow label="Total roof area" value={`${fmt(inputs.roofAvailable)} m²`} />
          <ResultRow label="Effective usable area" value={`${fmt(effective)} m²`} />
          <ResultRow label={`Required for ${fmt(results.solar.kwp, 1)} kWp`} value={`${fmt(results.solar.roof_req)} m²`} />
          <ResultRow label="Utilisation" value={effective > 0 ? `${fmt(Math.min((results.solar.roof_req / effective) * 100, 100), 1)}%` : '-'} />
        </div>
      </Card>
    </div>
  );
}
