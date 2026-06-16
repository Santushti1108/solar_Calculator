import { useAnalysis } from '../context/AnalysisContext';

export function HeroPage() {
  const { startWizard } = useAnalysis();

  return (
    <div id="hero-section">
      <section id="hero">
        <div className="hero-badge">⚡ Industrial-Grade Energy Analysis</div>
        <h1 className="hero-title">
          Solar PV + BESS Sizing &<br />
          Financial Analysis Platform
        </h1>
        <p className="hero-sub">
          Design, optimize and analyze renewable energy systems with advanced financial modelling. On-Grid, Hybrid, and Off-Grid scenarios.
        </p>
        <div className="hero-btns">
          <button className="btn-primary" type="button" onClick={startWizard}>
            ⚡ Start Analysis
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-val">10-Step</div>
            <div className="stat-lbl">Guided Wizard</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">8 KPIs</div>
            <div className="stat-lbl">Financial Metrics</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">3 Modes</div>
            <div className="stat-lbl">On/Hybrid/Off-Grid</div>
          </div>
          <div className="stat-card">
            <div className="stat-val">25-Year</div>
            <div className="stat-lbl">Cash Flow Model</div>
          </div>
        </div>
      </section>
    </div>
  );
}
