import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { ChartCard } from '../../components/charts/ChartCard';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { isEvMode, isOnGridMode, isRtsMode } from '../../utils/calculations';
import { fmt } from '../../utils/format';
import { darkChartOptions } from './SolarSizingStep';
import { useState } from 'react';
import { ResultRow } from '../../components/common/ResultRow';


export function FinanceStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const cfs = results.fin.cashflows;
  const onGrid = isOnGridMode(inputs.systemMode);
  const canExport = isRtsMode(inputs.systemMode) && onGrid;
  const showEv = isEvMode(inputs.systemMode) && inputs.evCostOption === 'included';
  const [selectedYear, setSelectedYear] = useState<5 | 10 | 15 | 20 | 25>(5);
  const years: Array<5 | 10 | 15 | 20 | 25> = [5, 10, 15, 20, 25];

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Financial Analysis <span>Step 6</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="Finance Assumptions">

        <div className="grid-summary">

          <div className="summary-left">
            <div className="summary-title">
              Financial & Operational Assumptions
            </div>
          </div>

          <div className="summary-right">

            {/* General */}

            <div className="summary-pill">
              <span>Net Meter Revenue</span>
              <strong>
                {canExport
                  ? `₹${fmt(results.fin.net_meter_revenue_yr1, 0)}/yr`
                  : "Not Applicable"}
              </strong>
            </div>

            <div className="summary-pill">
              <span>System O&M Cost</span>
              <strong>{fmt(inputs.omPct, 1)}% of CAPEX</strong>
            </div>

            <div className="summary-pill">
              <span>Inflation Rate</span>
              <strong>{fmt(inputs.inflation, 1)}%</strong>
            </div>

            {/* Diesel */}

            <div className="summary-pill">
              <span>Genset Unit Cost</span>
              <strong>₹25,000 / kW</strong>
            </div>

            <div className="summary-pill">
              <span>Diesel Consumption</span>
              <strong>0.35 L/kWh</strong>
            </div>

            <div className="summary-pill">
              <span>Annual Maintenance</span>
              <strong>₹15,000 / yr</strong>
            </div>

            <div className="summary-pill">
              <span>Fuel Escalation</span>
              <strong>5%</strong>
            </div>

            <div className="summary-pill">
              <span>Maintenance Escalation</span>
              <strong>5%</strong>
            </div>

            {/* Resilience */}

            <div className="summary-pill">
              <span>VoLL</span>
              <strong>₹100 / kWh</strong>
            </div>

            <div className="summary-pill">
              <span>Disaster Events</span>
              <strong>5 / year</strong>
            </div>

            <div className="summary-pill">
              <span>Outage / Event</span>
              <strong>48 hrs</strong>
            </div>

            {/* EV */}

            {showEv && (
              <>
                <div className="summary-pill">
                  <span>Trip Distance</span>
                  <strong>90 km/day</strong>
                </div>

                <div className="summary-pill">
                  <span>Petrol Mileage</span>
                  <strong>10 km/L</strong>
                </div>

                <div className="summary-pill">
                  <span>Petrol Price</span>
                  <strong>₹105/L</strong>
                </div>

                <div className="summary-pill">
                  <span>EV Consumption</span>
                  <strong>0.15 kWh/km</strong>
                </div>

                <div className="summary-pill">
                  <span>EV Electricity Cost</span>
                  <strong>₹4/kWh</strong>
                </div>
              </>
            )}

          </div>
        </div>
      </Card>

      <Card title="Financial Inputs">
  <div className="form-grid">

    {/* <FormField
      label="Grid Import Tariff (₹/kWh)"
      type="number"
      value={inputs.gridImportTariff}
      step="0.1"
      onChange={(value) =>
        updateInput("gridImportTariff", Number(value))
      }
    />

    {canExport && (
      <FormField
        label="Grid Export Tariff (₹/kWh)"
        type="number"
        value={inputs.gridExportTariff}
        step="0.1"
        onChange={(value) =>
          updateInput("gridExportTariff", Number(value))
        }
      />
    )} */}

    <FormField
      label="Diesel Price (₹/L)"
      type="number"
      value={inputs.dieselPrice}
      step="1"
      onChange={(value) =>
        updateInput("dieselPrice", Number(value))
      }
    />

    <FormField
      label="Value of Lost Load (₹/kWh)"
      type="number"
      value={inputs.vollRate}
      step="10"
      onChange={(value) =>
        updateInput("vollRate", Number(value))
      }
    />

    {/* <FormField
      label="Inflation Rate (%)"
      type="number"
      value={inputs.inflation}
      step="0.1"
      onChange={(value) =>
        updateInput("inflation", Number(value))
      }
    />

    <FormField
      label="System O&M (% CAPEX)"
      type="number"
      value={inputs.omPct}
      step="0.1"
      onChange={(value) =>
        updateInput("omPct", Number(value))
      }
    /> */}

    <FormField
      label="Insurance (% CAPEX)"
      type="number"
      value={inputs.insurancePct}
      step="0.1"
      onChange={(value) =>
        updateInput("insurancePct", Number(value))
      }
    />

    {showEv && (
      <FormField
        label="EV Electricity Cost (₹/kWh)"
        type="number"
        value={inputs.evElectricityCost}
        step="0.5"
        onChange={(value) =>
          updateInput("evElectricityCost", Number(value))
        }
      />
    )}

  </div>
</Card>
      {/* <Card title="Financial Benefits">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.fin.grid_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Grid Savings" />
          <KpiCard value={fmt(results.fin.net_meter_revenue_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Net Meter Revenue" tone="orange" />
          <KpiCard value={fmt(results.fin.dg_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Diesel Generator Savings" />
          <KpiCard value={fmt(results.fin.voll_benefits_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="VoLL Benefits" tone="green" />
          {showEv ? <KpiCard value={fmt(results.fin.ev_savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="EV Savings" tone="orange" /> : null}
          <KpiCard value={fmt(results.fin.savings_yr1 / 100000, 2)} unit="Lakh ₹/yr" label="Total Year-1 Benefit" tone="green" />
        </div>
      </Card> */}
      
    <Card title="Benefit Analysis">

        <div className="mode-grid">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`mode-card ${selectedYear === year ? "selected" : ""}`}
              onClick={() => setSelectedYear(year)}
            >
              <div className="mode-name">{year} Years</div>
            </button>
          ))}
        </div>

        <div className="kpi-grid" style={{ marginTop: "24px" }}>

          <KpiCard
            value={fmt(results.fin.benefits[selectedYear] / 100000, 2)}
            unit="Lakh ₹"
            label="Total RE Benefit"
          />

          <KpiCard
            value={fmt(results.fin.npv[selectedYear] / 100000, 2)}
            unit="Lakh ₹"
            label="NPV"
            tone="green"
          />

          <KpiCard
            value={`${fmt(results.fin.irr[selectedYear], 1)}%`}
            label="IRR"
          />

          <KpiCard
            value={fmt(results.fin.payback, 1)}
            unit="Years"
            label="Payback"
            tone="orange"
          />

        </div>

      </Card>
      {/* <ChartCard title="25-Year Cash Flow" tall>
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
      </ChartCard> */}
      <ChartCard title="Annual Benefit Projection">
        <BarChart data={{ labels: cfs.map((c) => `Yr ${c.n}`), datasets: [{ label: 'Annual Benefits (₹L)', data: cfs.map((c) => Number((c.savings_n / 100000).toFixed(2))), backgroundColor: `${COLORS.green}99`, borderColor: COLORS.green, borderWidth: 1 }] }} options={darkChartOptions(false)} />
      </ChartCard>
    </div>
  );
}
