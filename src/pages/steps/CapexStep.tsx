import { Card } from '../../components/common/Card';
import { FormField } from '../../components/common/FormField';
import { KpiCard } from '../../components/common/KpiCard';
import { ResultRow } from '../../components/common/ResultRow';
import { useAnalysis } from '../../context/AnalysisContext';
import { isEvMode, isRtsMode } from '../../utils/calculations';
import { fmt, fmtC } from '../../utils/format';

export function CapexStep() {
  const { state, results, updateInput } = useAnalysis();
  const { inputs } = state;
  const hasRts = isRtsMode(inputs.systemMode);
  const includeEvCost = isEvMode(inputs.systemMode) && inputs.evCostOption === 'included';
  const showFinancing = inputs.externalFinancing === 'yes';
  const comparisonSubsidy = hasRts ? (results.solar.kwp <= 1 ? 30000 : results.solar.kwp <= 2 ? 60000 : 78000) : 0;
  const comparisonCapexWithoutSubsidy = results.capex.capex_without_subsidy;
  const comparisonCapexWithSubsidy = Math.max(comparisonCapexWithoutSubsidy - comparisonSubsidy, 0);
  const comparisonLoanPct = inputs.externalFinancing === 'yes' ? inputs.loanPct / 100 : 0;
  const comparisonLoanWithSubsidy = comparisonCapexWithSubsidy * comparisonLoanPct;
  const comparisonLoanWithoutSubsidy = comparisonCapexWithoutSubsidy * comparisonLoanPct;
  const comparisonEquityWithSubsidy = comparisonCapexWithSubsidy - comparisonLoanWithSubsidy;
  const comparisonEquityWithoutSubsidy = comparisonCapexWithoutSubsidy - comparisonLoanWithoutSubsidy;
  const comparisonEmiWithSubsidy = computeComparisonEmi(comparisonLoanWithSubsidy, inputs.interestRate, inputs.tenure);
  const comparisonEmiWithoutSubsidy = computeComparisonEmi(comparisonLoanWithoutSubsidy, inputs.interestRate, inputs.tenure);

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        CAPEX Analysis <span>Step 5</span>
      </div>
      <div className="panel-sub"></div>

      <Card title="RE System Parameters">
        <div className="grid-summary">
          <div className="summary-left">
            <div className="summary-title">RE System Parameters</div>
          </div>
          <div className="summary-right">
            {hasRts ? (
              <>
                <div className="summary-pill">
                  <span>Solar CUF</span>
                  <strong>{fmt(inputs.solarCuf, 1)}%</strong>
                </div>
                <div className="summary-pill">
                  <span>Solar Capacity</span>
                  <strong>{fmt(results.solar.kwp, 1)} kWp</strong>
                </div>
              </>
            ) : null}
            <div className="summary-pill">
              <span>BESS Capacity</span>
              <strong>{fmt(results.bess.kwh, 1)} kWh</strong>
            </div>
            {hasRts ? (
              <div className="summary-pill">
                <span>Inverter Capacity</span>
                <strong>{fmt(results.solar.inverter_kw, 1)} kW</strong>
              </div>
            ) : null}
            {/* <div className="summary-pill">
              <span>Solar PV Unit Cost</span>
              <strong>{fmtC(inputs.panelCost, inputs.currency)}/kWp</strong>
            </div>
            <div className="summary-pill">
              <span>BESS Unit Cost</span>
              <strong>{fmtC(inputs.bessCostKwh, inputs.currency)}/kWh</strong>
            </div>
            <div className="summary-pill">
              <span>Inverter Unit Cost</span>
              <strong>{fmtC(inputs.inverterCost, inputs.currency)}/kW</strong>
            </div> */}
            <div className="summary-pill">
              <span>Installation & Net Metering</span>
              <strong>{fmt(inputs.installCost, 0)}%</strong>
            </div>
            {/* <div className="summary-pill">
              <span>Project Life</span>
              <strong>{fmt(inputs.projectLife)} yrs</strong>
            </div>
            <div className="summary-pill">
              <span>System O&M</span>
              <strong>{fmt(inputs.omPct, 1)}%</strong>
            </div>
            <div className="summary-pill">
              <span>O&M Escalation Rate</span>
              <strong>{fmt(inputs.omEscalationRate, 0)}%</strong>
            </div> */}
          </div>
        </div>
      </Card>

      <Card title=" cost and loan inputs">
        <div className="form-grid">
          {hasRts ? <FormField label="Solar PV Unit Cost (Rs./kWp)" type="number" value={inputs.panelCost} step="1000" onChange={(value) => updateInput('panelCost', Number(value))} /> : null}
          <FormField label="BESS Unit Cost (Rs./kWh)" type="number" value={inputs.bessCostKwh} step="1000" onChange={(value) => updateInput('bessCostKwh', Number(value))} />
          {hasRts ? <FormField label="Inverter Unit Cost (Rs./kW)" type="number" value={inputs.inverterCost} step="500" onChange={(value) => updateInput('inverterCost', Number(value))} /> : null}
          <FormField label="Include Government Subsidy?" value={inputs.governmentSubsidy} onChange={(value) => updateInput('governmentSubsidy', value as 'yes' | 'no')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
          <FormField label="External Financing?" value={inputs.externalFinancing} onChange={(value) => updateInput('externalFinancing', value as 'yes' | 'no')} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes' }]} />
          {showFinancing ? (
            <>
              <FormField label="Loan % of Total CAPEX" type="number" value={inputs.loanPct} min="0" max="100" onChange={(value) => updateInput('loanPct', Number(value))} />
              <FormField label="Loan Interest Rate (%)" type="number" value={inputs.interestRate} step="0.1" onChange={(value) => updateInput('interestRate', Number(value))} />
              <FormField label="Loan Tenure (years)" type="number" value={inputs.tenure} min="1" max="30" onChange={(value) => updateInput('tenure', Number(value))} />
              <div className="alert alert-info">
                Repayment Type: <strong>EMI</strong>
              </div>
            </>
          ) : null}
        </div>
      </Card>

      {includeEvCost ? (
        <Card title="EV Cost">
          <div className="form-grid">
            <FormField label="EV Purchase Cost (Rs.)" type="number" value={inputs.evPurchaseCost} step="10000" onChange={(value) => updateInput('evPurchaseCost', Number(value))} />
            <FormField label="Charging Infrastructure (Rs.)" type="number" value={inputs.chargingInfraCost} step="10000" onChange={(value) => updateInput('chargingInfraCost', Number(value))} />
          </div>
        </Card>
      ) : null}

      <Card title="CAPEX Summary">
        <div className="kpi-grid">
          <KpiCard value={fmtC(results.capex.solar_capex, inputs.currency)} label="Solar CAPEX" />
          <KpiCard value={fmtC(results.capex.battery_capex, inputs.currency)} label="BESS CAPEX" tone="orange" />
          <KpiCard value={fmtC(results.capex.inverter_capex, inputs.currency)} label="Inverter CAPEX" tone="green" />
          <KpiCard value={fmtC(results.capex.installation, inputs.currency)} label="Installation & Net Metering" />
        </div>
        <div className="summary-block detail-block">
          <ResultRow label="Solar CAPEX" value={fmtC(results.capex.solar_capex, inputs.currency)} />
          <ResultRow label="BESS CAPEX" value={fmtC(results.capex.battery_capex, inputs.currency)} />
          <ResultRow label="Inverter CAPEX" value={fmtC(results.capex.inverter_capex, inputs.currency)} />
          <ResultRow label="Installation & Net Metering" value={fmtC(results.capex.installation, inputs.currency)} />
          <ResultRow label="Total RE System CAPEX" value={fmtC(results.capex.total_re_capex, inputs.currency)} />
          {includeEvCost ? (
            <>
              <ResultRow label="EV Purchase Cost" value={fmtC(results.capex.ev_purchase_cost, inputs.currency)} />
              <ResultRow label="Charging Infrastructure" value={fmtC(results.capex.charging_infra, inputs.currency)} />
            </>
          ) : null}
          <ResultRow label="Total Project CAPEX" value={fmtC(results.capex.total_project_capex, inputs.currency)} valueClass="orange-text large-val" />
        </div>
      </Card>

      <Card title="Financing Comparison">
        <div className="alert alert-info">
          Government Subsidy Applied: <strong>{fmtC(comparisonSubsidy, inputs.currency)}</strong>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <tbody>
              <tr>
                <th>Parameter</th>
                <th className="right">With Subsidy</th>
                <th className="right">Without Subsidy</th>
              </tr>
              <tr>
                <td>CAPEX</td>
                <td className="right orange-text">{fmtC(comparisonCapexWithSubsidy, inputs.currency)}</td>
                <td className="right">{fmtC(comparisonCapexWithoutSubsidy, inputs.currency)}</td>
              </tr>
              <tr>
                <td>Loan Amount</td>
                <td className="right">{fmtC(comparisonLoanWithSubsidy, inputs.currency)}</td>
                <td className="right">{fmtC(comparisonLoanWithoutSubsidy, inputs.currency)}</td>
              </tr>
              <tr>
                <td>Equity Amount</td>
                <td className="right">{fmtC(comparisonEquityWithSubsidy, inputs.currency)}</td>
                <td className="right">{fmtC(comparisonEquityWithoutSubsidy, inputs.currency)}</td>
              </tr>
              <tr className="total-row">
                <td>Monthly EMI</td>
                <td className="right orange-text">{fmtC(comparisonEmiWithSubsidy, inputs.currency)}</td>
                <td className="right">{fmtC(comparisonEmiWithoutSubsidy, inputs.currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function computeComparisonEmi(principal: number, annualRate: number, years: number) {
  if (!principal || !years) return 0;
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;
  if (!monthlyRate) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}
