import { PieChart } from '../../components/charts/PieChart';
import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { ResultRow } from '../../components/common/ResultRow';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { fmt, fmtC } from '../../utils/format';

export function CapexStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const labels = Object.keys(results.capex.components).filter((key) => results.capex.components[key] > 0);
  const values = labels.map((key) => Math.round(results.capex.components[key]));
  const pieColors = [COLORS.blue, COLORS.orange, COLORS.green, COLORS.purple, COLORS.teal, COLORS.yellow, '#F43F5E', '#A8A29E', '#6366F1', '#22D3EE'];

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        CAPEX Analysis <span>Step 6</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="💰 Cost Parameters">
        <div className="form-grid">
          <FormField label="Solar Panel Cost (₹/Wp)" type="number" value={inputs.panelCost} step="1" onChange={(value) => updateInput('panelCost', Number(value))} />
          <FormField label="Inverter Cost (₹/kW)" type="number" value={inputs.inverterCost} step="500" onChange={(value) => updateInput('inverterCost', Number(value))} />
          <FormField label="Mounting Structure (₹/Wp)" type="number" value={inputs.mountingCost} step="0.5" onChange={(value) => updateInput('mountingCost', Number(value))} />
          <FormField label="BoS / Wiring (₹/Wp)" type="number" value={inputs.bosCost} step="0.5" onChange={(value) => updateInput('bosCost', Number(value))} />
          <FormField label="Installation Labour (₹/Wp)" type="number" value={inputs.installCost} step="0.5" onChange={(value) => updateInput('installCost', Number(value))} />
          <FormField label="Monitoring / SCADA (₹ flat)" type="number" value={inputs.monitoringCost} step="5000" onChange={(value) => updateInput('monitoringCost', Number(value))} />
          <FormField label="Engineering Fee (%)" type="number" value={inputs.engineeringPct} step="0.5" onChange={(value) => updateInput('engineeringPct', Number(value))} />
          <FormField label="Contingency (%)" type="number" value={inputs.contingencyPct} step="0.5" onChange={(value) => updateInput('contingencyPct', Number(value))} />
          <FormField label="GST Rate (% - 0 if exempt)" type="number" value={inputs.gst} step="1" onChange={(value) => updateInput('gst', Number(value))} />
          <FormField label="Subsidy (₹ lump sum)" type="number" value={inputs.subsidy} step="10000" onChange={(value) => updateInput('subsidy', Number(value))} />
        </div>
      </Card>
      <Card title="📋 CAPEX Breakdown">
        <div className="table-wrap">
          <table className="data-table">
            <tbody>
              <tr>
                <th>Component</th>
                <th className="right">Cost</th>
                <th className="right">Share</th>
              </tr>
              {Object.entries(results.capex.components).map(([name, cost]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="right">{fmtC(cost, inputs.currency)}</td>
                  <td className="right">{fmt((cost / results.capex.total) * 100, 1)}%</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total CAPEX</td>
                <td className="right">{fmtC(results.capex.total, inputs.currency)}</td>
                <td />
              </tr>
              <tr className="net-row">
                <td>Net CAPEX (after subsidy)</td>
                <td className="right">{fmtC(results.capex.net, inputs.currency)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
        <div className="split-row">
          <div className="chart-wrap pie-wrap">
            <PieChart
              data={{ labels, datasets: [{ data: values, backgroundColor: pieColors.slice(0, labels.length), borderWidth: 0 }] }}
              options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'right', labels: { color: '#94A3B8', font: { size: 11 } } } } }}
            />
          </div>
          <div className="summary-block">
            <ResultRow label="Subtotal (components)" value={fmtC(results.capex.subtotal, inputs.currency)} />
            <ResultRow label="Engineering + Contingency" value={fmtC(results.capex.components.Engineering + results.capex.components.Contingency, inputs.currency)} />
            <ResultRow label={`GST (${inputs.gst}%)`} value={fmtC(results.capex.components.GST, inputs.currency)} />
            <ResultRow label="Gross CAPEX" value={fmtC(results.capex.total, inputs.currency)} valueClass="blue-text" />
            <ResultRow label="Subsidy" value={`- ${fmtC(inputs.subsidy, inputs.currency)}`} valueClass="green-text" />
            <ResultRow label="Net CAPEX" value={fmtC(results.capex.net, inputs.currency)} valueClass="orange-text large-val" />
            <ResultRow label="₹/kWp" value={results.solar.kwp > 0 ? fmtC(results.capex.net / results.solar.kwp, inputs.currency) : '-'} />
          </div>
        </div>
      </Card>
    </div>
  );
}
