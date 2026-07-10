import { BarChart } from '../../components/charts/BarChart';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS, MONTHS } from '../../utils/constants';
import { isOnGridMode, isRtsMode } from '../../utils/calculations';
import { fmt } from '../../utils/format';
import InfoDrawer from "../../components/common/InfoDrawer";
import { Solarinfo } from '../../data/Solarinfo';



const solarTechnologies = [
  { value: '330', label: 'Polycrystalline (330W)', area: 2.0 },
  { value: '540', label: 'Mono-PERC (540W)', area: 2.7 },
  { value: '580', label: 'TOPCon (580W)', area: 2.8 },
  { value: '600', label: 'Bifacial (600W)', area: 3.0 },
];

export function SolarSizingStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const chartData = {
    labels: MONTHS,
    datasets: [{ label: 'Generation (MWh)',  backgroundColor: `${COLORS.orange}CC`, borderColor: COLORS.orange, borderWidth: 1 }],
  };
  const chartOptions = darkChartOptions(false);
  const onGrid = isOnGridMode(inputs.systemMode);
  const hasRts = isRtsMode(inputs.systemMode);

  if (!hasRts) {
    return (
    <div className="step-panel visible">
       
      <div className="panel-title">
        Solar PV Sizing <span>Step 4</span>
      </div>
      <Card title=" Rooftop Solar (RTS) Not Available">
        <div className="alert alert-info">
          {/* <strong>Selected Mode:</strong> {inputs.systemMode} */}
          {/* <br /><br /> */}
          The selected system configuration does not include a Rooftop Solar (RTS) system.
          Therefore, Solar PV sizing is not applicable. 
          <br />
          Please go to next step.
        </div>
      </Card>
    </div>
  );
}

  return (
    <div className="step-panel visible">
      <div className="panel-title-row">
      <div className="panel-title">
        Solar PV Sizing <span>Step 4</span>
      </div>
       <InfoDrawer 
            title="Solar Imformation"
            sections={Solarinfo}
        />

      </div>

      <div className="panel-sub">
      <div className="alert alert-info">
          Total Daily Consumption:
          <strong> {fmt(results.load.daily_kwh, 1)} kWh/day</strong>
        </div>

        <div className="alert alert-info mt-3">
          Battery Charging Requirement:
          <strong> {fmt(results.bess.kwh, 1)} kWh</strong>
        </div>

      </div>
          
      <Card title="Solar Parameters">
        <div className="form-grid">
         
          <FormField label="Solar Time Share (%)" type="number" value={inputs.solarTimeShare} min="0" max="100" onChange={(value) => updateInput('solarTimeShare', Number(value))} />
          <FormField
            label="Solar Technology"
            value={String(inputs.panelWp)}
            onChange={(value) => {
              const selected = solarTechnologies.find((item) => item.value === String(value));
              updateInput('panelWp', Number(value));
              if (selected) updateInput('panelArea', selected.area);
            }}
            options={solarTechnologies}
          />
          <FormField label="4.	Solar Capacity Utilization Factor(%)" type="number" value={inputs.solarCuf} min="1" max="30" step="0.1" onChange={(value) => updateInput('solarCuf', Number(value))} />
          {/* <FormField label="Battery Charging Requirement (kWh/day)" type="number" value={inputs.batteryChargingRequirement} step="1" min="0" onChange={(value) => updateInput('batteryChargingRequirement', Number(value))} /> */}
          {/* <FormField label="Roof Area Available (m²)" type="number" value={inputs.roofArea} step="10" onChange={(value) => updateInput('roofArea', Number(value))} />
          <FormField label="Degradation Rate (%/yr)" type="number" value={inputs.degradation} step="0.1" onChange={(value) => updateInput('degradation', Number(value))} /> */}
        </div>
      </Card>
      {onGrid && (
  <Card title="Grid & Net Metering Assumptions">

    {/* Tariff Inputs */}
    <div className="tariff-grid">
      <FormField
        label="Grid Import Tariff (₹/kWh)"
        type="number"
        value={inputs.gridImportTariff}
        step="0.1"
        onChange={(value) =>
          updateInput("gridImportTariff", Number(value))
        }
      />

      <FormField
        label="Grid Export Tariff (₹/kWh)"
        type="number"
        value={inputs.gridExportTariff}
        step="0.1"
        onChange={(value) =>
          updateInput("gridExportTariff", Number(value))
        }
      />
    </div>

    {/* Summary Banner */}
    <div className="grid-summary">

      <div className="summary-left">
        <div className="summary-title">
          Grid Reliability Summary
        </div>

        {/* <div className="summary-subtitle">
          Default Odisha assumptions used for BESS sizing calculations
        </div> */}
      </div>

      <div className="summary-right">

        <div className="summary-pill">
          <span>Tarrif Escalation Rate</span>
          <strong>5%</strong>
        </div>

        <div className="summary-pill">
          <span>SAIDI(Annual outage Hours)</span>
          <strong>285 hrs/yr</strong>
        </div>

        <div className="summary-pill">
          <span>SAIFI(Annual Outage Frequency)</span>
          <strong>423 freq/yr</strong>
        </div>

        {/* <div className="summary-pill">
          <span>Days / Year</span>
          <strong>365</strong>
        </div> */}

        <div className="summary-pill">
          <span>no. of Disaster Events/year</span>
          <strong>5</strong>
        </div>

        <div className="summary-pill">
          <span>Disaster Days</span>
          <strong>15 days</strong>
        </div>

        <div className="summary-pill">
          <span>Non-Disaster Days</span>
          <strong>350 days</strong>
        </div>

        <div className="summary-pill">
          <span>yearly total Outage Hours</span>
          <strong>645 hrs</strong>
        </div>

        <div className="summary-pill">
          <span>BESS RTE</span>
          <strong>{fmt(inputs.rte,0)}%</strong>
        </div>

      </div>

    </div>

  </Card>
)}
      <Card title="Solar Sizing Results">
        <div className="kpi-grid">
          <KpiCard value={fmt(results.solar.solar_hour_load, 1)} unit="kWh/day" label="Solar Hour Load" />
          <KpiCard value={fmt(results.solar.non_solar_hour_load, 1)} unit="kWh/day" label="Non Solar Hour Load" tone="orange" />
          <KpiCard value={fmt(results.solar.kwp, 1)} unit="kWp" label="Solar System Size" />
          <KpiCard value={fmt(results.solar.panels)} unit="panels" label="Panel Count" tone="orange" />
          <KpiCard value={fmt(results.solar.inverter_kw, 1)} unit="kW" label="Inverter Size" tone="green" />
          <KpiCard value={fmt(results.solar.yearly_bess_charging_days, 1)}unit="days"label="Yearly BESS Charging"/>
          <KpiCard value={fmt(results.solar.annual_net_meter_energy, 1)}unit="kWh/yr"label="Annual Net Meter solar Energy after BESS charging"/>
          {onGrid &&(<KpiCard value={fmt(results.solar.export_revenue_yr1, 1)}unit="Rs./yr"label="export revenue for 1st year" tone = "green"/>)}
          {/* <KpiCard value={fmt(results.solar.annual_gen / 1000, 1)} unit="MWh/yr" label="Annual Gen (Yr1)" tone="green" /> */}
        </div>
        {/* {results.solar.roof_req > inputs.roofArea ? (
          <div className="alert alert-warn">
            Roof feasibility failed. Roof Required: {fmt(results.solar.roof_req, 1)} m² | Available: {fmt(inputs.roofArea, 1)} m²
          </div>
        ) : (
          <div className="alert alert-ok">
            Roof area is sufficient. Required: {fmt(results.solar.roof_req, 1)} m² | Available: {fmt(inputs.roofArea, 1)} m²
          </div>
        )} */}
        {/* <div className="chart-wrap chart-spaced">
          <BarChart data={chartData} options={chartOptions} />
        </div> */}
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
