import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { ChartCard } from '../../components/charts/ChartCard';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { isEvMode, isOnGridMode } from '../../utils/calculations';
import { fmt } from '../../utils/format';
import { darkChartOptions } from './SolarSizingStep';

export function FinanceStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const cfs = results.fin.cashflows;
  const onGrid = isOnGridMode(inputs.systemMode);
  const showEv = isEvMode(inputs.systemMode) && inputs.evCostOption === 'included';

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Financial Analysis <span>Step 6</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="Financial Parameters">
        <div className="form-grid">
          <FormField label="Grid Import Tariff (₹/kWh)" type="number" value={inputs.gridImportTariff} step="0.1" onChange={(value) => updateInput('gridImportTariff', Number(value))} />
          {onGrid ? <FormField label="Grid Export Tariff (₹/kWh)" type="number" value={inputs.gridExportTariff} step="0.1" onChange={(value) => updateInput('gridExportTariff', Number(value))} /> : null}
          {onGrid ? <FormField label="Export % of Generation" type="number" value={inputs.exportPct} min="0" max="100" onChange={(value) => updateInput('exportPct', Number(value))} /> : null}
          <FormField label="DG Fuel Cost (₹/kWh)" type="number" value={inputs.dgCost} step="0.5" onChange={(value) => updateInput('dgCost', Number(value))} />
          <FormField label="VoLL Benefits (₹/yr)" type="number" value={inputs.vollBenefit} step="1000" onChange={(value) => updateInput('vollBenefit', Number(value))} />
          {showEv ? <FormField label="EV Savings (₹/yr)" type="number" value={inputs.evAnnualSavings} step="1000" onChange={(value) => updateInput('evAnnualSavings', Number(value))} /> : null}
          <FormField label="Inflation Rate (%/yr)" type="number" value={inputs.inflation} step="0.5" onChange={(value) => updateInput('inflation', Number(value))} />
          <FormField label="O&M Cost (%CAPEX/yr)" type="number" value={inputs.omPct} step="0.1" onChange={(value) => updateInput('omPct', Number(value))} />
          <FormField label="Insurance (%CAPEX/yr)" type="number" value={inputs.insurancePct} step="0.1" onChange={(value) => updateInput('insurancePct', Number(value))} />
        </div>
      </Card>
      <Card title="Financial Benefits">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.fin.grid_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Grid Savings" />
          <KpiCard value={fmt(results.fin.net_meter_revenue_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Net Meter Revenue" tone="orange" />
          <KpiCard value={fmt(results.fin.dg_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Diesel Generator Savings" />
          <KpiCard value={fmt(results.fin.voll_benefits_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="VoLL Benefits" tone="green" />
          {showEv ? <KpiCard value={fmt(results.fin.ev_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="EV Savings" tone="orange" /> : null}
          <KpiCard value={fmt(results.fin.savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Total Year-1 Benefit" tone="green" />
        </div>
      </Card>
      <Card title="Financial KPIs">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.fin.benefits[5] / 100000, 1)} unit="Lakh ₹" label="5 Year Benefit" />
          <KpiCard value={fmt(results.fin.benefits[10] / 100000, 1)} unit="Lakh ₹" label="10 Year Benefit" />
          <KpiCard value={fmt(results.fin.benefits[15] / 100000, 1)} unit="Lakh ₹" label="15 Year Benefit" />
          <KpiCard value={fmt(results.fin.benefits[20] / 100000, 1)} unit="Lakh ₹" label="20 Year Benefit" />
          <KpiCard value={fmt(results.fin.benefits[25] / 100000, 1)} unit="Lakh ₹" label="25 Year Benefit" />
          <KpiCard value={fmt(results.fin.npv / 100000, 1)} unit="Lakh ₹" label="NPV" tone="green" />
          <KpiCard value={`${fmt(results.fin.irr, 1)}%`} label="IRR" />
          <KpiCard value={fmt(results.fin.payback, 1)} unit="years" label="Payback" tone="orange" />
        </div>
      </Card>
      <ChartCard title="25-Year Cash Flow" tall>
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
      <ChartCard title="Annual Benefit Projection">
        <BarChart data={{ labels: cfs.map((c) => `Yr ${c.n}`), datasets: [{ label: 'Annual Benefits (₹L)', data: cfs.map((c) => Number((c.savings_n / 100000).toFixed(2))), backgroundColor: `${COLORS.green}99`, borderColor: COLORS.green, borderWidth: 1 }] }} options={darkChartOptions(false)} />
      </ChartCard>
    </div>
  );
}
