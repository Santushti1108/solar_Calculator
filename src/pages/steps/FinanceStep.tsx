import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { ChartCard } from '../../components/charts/ChartCard';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { fmt } from '../../utils/format';
import { darkChartOptions } from './SolarSizingStep';

export function FinanceStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const cfs = results.fin.cashflows;

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Financial Analysis <span>Step 7</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="📈 Financial Parameters">
        <div className="form-grid">
          <FormField label="Export Tariff / Rate (₹/kWh)" type="number" value={inputs.exportRate} step="0.1" onChange={(value) => updateInput('exportRate', Number(value))} />
          <FormField label="Export % of Generation" type="number" value={inputs.exportPct} min="0" max="100" onChange={(value) => updateInput('exportPct', Number(value))} />
          <FormField label="DG Fuel Cost (₹/kWh) - Off-Grid" type="number" value={inputs.dgCost} step="0.5" onChange={(value) => updateInput('dgCost', Number(value))} />
          <FormField label="Inflation Rate (%/yr)" type="number" value={inputs.inflation} step="0.5" onChange={(value) => updateInput('inflation', Number(value))} />
          <FormField label="O&M Cost (%CAPEX/yr)" type="number" value={inputs.omPct} step="0.1" onChange={(value) => updateInput('omPct', Number(value))} />
          <FormField label="Insurance (%CAPEX/yr)" type="number" value={inputs.insurancePct} step="0.1" onChange={(value) => updateInput('insurancePct', Number(value))} />
        </div>
      </Card>
      <Card title="🏆 Financial KPIs (Section G)">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.fin.savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Year-1 Savings" />
          <KpiCard value={fmt(results.fin.payback, 1)} unit="years" label="Payback Period" tone="orange" />
          <KpiCard value={fmt(results.fin.disc_payback, 1)} unit="years" label="Disc. Payback" />
          <KpiCard value={fmt(results.fin.npv / 100000, 1)} unit="Lakh ₹" label="NPV" tone="green" />
          <KpiCard value={`${fmt(results.fin.irr, 1)}%`} label={`IRR ${results.fin.irr >= 12 ? '✅' : '⚠️'}`} />
          <KpiCard value={`${fmt(results.fin.roi, 0)}%`} label="ROI" tone="orange" />
          <KpiCard value={fmt(results.fin.lcoe, 2)} unit="₹/kWh" label="LCOE" tone="green" />
          <KpiCard value={fmt(results.fin.bcr, 2)} unit="x" label="BCR" />
        </div>
      </Card>
      <ChartCard title="📊 25-Year Cash Flow" tall>
        <LineChart
          data={{
            labels: cfs.map((c) => `Yr ${c.n}`),
            datasets: [
              { label: 'Cumulative (Simple)', data: cfs.map((c) => Number(((c.cum - results.fin.net_capex) / 100000).toFixed(2))), borderColor: COLORS.blue, borderWidth: 2, pointRadius: 0, fill: false, tension: 0.4 },
              { label: 'Discounted', data: cfs.map((c) => Number(((c.disc_cum - results.fin.net_capex) / 100000).toFixed(2))), borderColor: COLORS.green, borderWidth: 1.5, pointRadius: 0, fill: false, tension: 0.4, borderDash: [4, 4] },
            ],
          }}
          options={darkChartOptions(true)}
        />
      </ChartCard>
      <ChartCard title="📅 Annual Savings Projection">
        <BarChart
          data={{ labels: cfs.map((c) => `Yr ${c.n}`), datasets: [{ label: 'Annual Savings (₹L)', data: cfs.map((c) => Number((c.savings_n / 100000).toFixed(2))), backgroundColor: `${COLORS.green}99`, borderColor: COLORS.green, borderWidth: 1 }] }}
          options={darkChartOptions(false)}
        />
      </ChartCard>
    </div>
  );
}
