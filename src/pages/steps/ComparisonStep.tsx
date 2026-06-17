import { BarChart } from '../../components/charts/BarChart';
import { Card } from '../../components/common/Card';
import { ResultRow } from '../../components/common/ResultRow';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { fmt, fmtC } from '../../utils/format';
import { darkChartOptions } from './SolarSizingStep';

export function ComparisonStep() {
  const { state, results } = useAnalysis();

  return (
    <div className="step-panel visible">
      <div className="panel-title">
        Scenario Comparison <span>Step 9</span>
      </div>
      <div className="panel-sub"></div>
      <Card title="⚡ Three-Scenario Comparison">
        <div className="compare-grid">
          {results.scenarios.map((scenario, index) => (
            <div className={`compare-col ${index === results.bestScenarioIndex ? 'best' : ''}`} key={scenario.name}>
              <div className={`col-title ${index === results.bestScenarioIndex ? 'best-lbl' : ''}`}>
                {scenario.icon} {scenario.name}
                {index === results.bestScenarioIndex ? ' ⭐ Best' : ''}
              </div>
              <ResultRow label="Net CAPEX" value={fmtC(scenario.capex, state.inputs.currency)} />
              <ResultRow label={`NPV (${state.inputs.projectLife}yr)`} value={fmtC(scenario.npv, state.inputs.currency)} valueClass={scenario.npv > 0 ? 'green-text' : 'red-text'} />
              <ResultRow label="Simple Payback" value={`${fmt(scenario.pb, 1)} yrs`} />
              <ResultRow label="Self-Consumption" value={scenario.self} />
              <ResultRow label="BESS" value={scenario.bess} />
            </div>
          ))}
        </div>
      </Card>
      <Card title="📊 Scenario Cost Comparison">
        <div className="chart-wrap">
          <BarChart
            data={{
              labels: ['CAPEX (₹L)', 'NPV (₹L)', 'Payback (yr)'],
              datasets: results.scenarios.map((scenario) => ({
                label: scenario.name,
                data: [Number((scenario.capex / 100000).toFixed(1)), Number((scenario.npv / 100000).toFixed(1)), Number(scenario.pb.toFixed(1))],
                backgroundColor: `${scenario.color}CC`,
                borderColor: scenario.color,
                borderWidth: 1,
              })),
            }}
            options={darkChartOptions(true)}
          />
        </div>
      </Card>
    </div>
  );
}
