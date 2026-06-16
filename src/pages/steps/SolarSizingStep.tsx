import { BarChart } from '../../components/charts/BarChart';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS, MONTHS } from '../../utils/constants';
import { fmt } from '../../utils/format';

export function SolarSizingStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const chartData = {
    labels: MONTHS,
    datasets: [{ label: 'Generation (MWh)', data: results.solar.monthlyGenMwh, backgroundColor: `${COLORS.orange}CC`, borderColor: COLORS.orange, borderWidth: 1 }],
  };
  const chartOptions = darkChartOptions(false);

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Solar PV Sizing <span>Step 3</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="☀️ Solar Parameters">
        <div className="form-grid">
          <FormField label="Peak Sun Hours (h/day)" type="number" value={inputs.psh} step="0.1" min="3" max="7" onChange={(value) => updateInput('psh', Number(value))} />
          <FormField label="System Loss Factor (%)" type="number" value={inputs.lossFactor} min="5" max="35" onChange={(value) => updateInput('lossFactor', Number(value))} />
          <FormField label="Panel Watt-Peak (Wp)" type="number" value={inputs.panelWp} step="10" onChange={(value) => updateInput('panelWp', Number(value))} />
          <FormField label="Panel Area (m²/panel)" type="number" value={inputs.panelArea} step="0.1" onChange={(value) => updateInput('panelArea', Number(value))} />
          <FormField label="Degradation Rate (%/yr)" type="number" value={inputs.degradation} step="0.1" onChange={(value) => updateInput('degradation', Number(value))} />
          <FormField label="Roof Area Available (m²)" type="number" value={inputs.roofArea} step="10" onChange={(value) => updateInput('roofArea', Number(value))} />
          {/* <FormField label="Design Load Override (kWh/day)" type="number" value={inputs.designLoadOverride} placeholder="Auto from Step 2" onChange={(value) => updateInput('designLoadOverride', Number(value))} /> */}
          {/* <FormField label="Self-Consumption (%)" type="number" value={inputs.selfConsumption} min="0" max="100" onChange={(value) => updateInput('selfConsumption', Number(value))} /> */}
        </div>
      </Card>
      <Card title="📐 Solar Sizing Results">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.solar.kwp, 1)} unit="kWp" label="System Size" />
          <KpiCard value={fmt(results.solar.panels)} unit="panels" label="Panel Count" tone="orange" />
          <KpiCard value={fmt(results.solar.annual_gen / 1000, 1)} unit="MWh/yr" label="Annual Gen (Yr1)" tone="green" />
          <KpiCard value={fmt(results.solar.roof_req)} unit="m²" label="Roof Required" />
        </div>
         {results.solar.roof_req >
            inputs.roofArea ? (
              <div className="alert alert-warn">
                ⚠ Roof feasibility failed.

                Roof Required:
                {fmt(results.solar.roof_req, 1)} m²

                | Available:
                {fmt(inputs.roofArea, 1)} m²

                Reduce PV capacity or increase installation area.
              </div>
          ) : (
                <div className="alert alert-ok">
                  ✅ Roof area is sufficient.
                  Required:
                  {fmt(results.solar.roof_req, 1)} m²
                  | Available:
                  {fmt(inputs.roofArea, 1)} m²
                </div>
              )}
        <div className="chart-wrap chart-spaced">
          <BarChart data={chartData} options={chartOptions} />
        </div>
      </Card>
    </div>
  );
}

export function darkChartOptions(showLegend = true) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: showLegend, labels: { color: '#94A3B8', font: { size: 11 } } } },
    scales: {
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      x: { ticks: { color: '#94A3B8', maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
    },
  };
}
