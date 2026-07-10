import { LineChart } from '../../components/charts/LineChart';
import { Card } from '../../components/common/Card';
import { useAnalysis } from '../../context/AnalysisContext';
import { COLORS } from '../../utils/constants';
import { fmt } from '../../utils/format';
import { darkChartOptions } from './SolarSizingStep';
import InfoDrawer from "../../components/common/InfoDrawer";
import { envinfo } from '../../data/envinfo';

export function EnvironmentStep() {
  const { state, results } = useAnalysis();
  const years = Array.from({ length: state.inputs.projectLife }, (_, index) => `Yr ${index + 1}`);

  return (
    <div className="step-panel visible">
      <div className="panel-title-row">
      <div className="panel-title">
        Environmental Impact <span>Step 7</span>
      </div>
          <InfoDrawer 
            title= "Environment Imformation"
            sections={envinfo}
          />
      </div>
      <div className="panel-sub"></div>
      <Card title="🌿 Environmental Benefits">
        <div className="env-grid">
          <div className="env-item">
            <div className="env-icon">☁️</div>
            <div className="env-val">{fmt(results.env.co2_yr1, 0)} T</div>
            <div className="env-lbl">CO₂/year (tonnes)</div>
          </div>
          <div className="env-item">
            <div className="env-icon">🌍</div>
            <div className="env-val">{fmt(results.env.co2_total, 0)} T</div>
            <div className="env-lbl">Total CO₂ offset</div>
          </div>
          <div className="env-item">
            <div className="env-icon">🌳</div>
            <div className="env-val">{fmt(results.env.trees, 0)}</div>
            <div className="env-lbl">Tree equivalent</div>
          </div>
        </div>
        <div className="chart-wrap">
          <LineChart
            data={{
              labels: years,
              datasets: [{ label: 'Cumulative CO₂ Offset (tonnes)', data: results.env.cumulativeCo2, borderColor: COLORS.green, backgroundColor: 'rgba(34,197,94,0.1)', fill: true, tension: 0.4, pointRadius: 0 }],
            }}
            options={darkChartOptions(true)}
          />
        </div>
      </Card>
    </div>
  );
}
