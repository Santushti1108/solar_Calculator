import { useAnalysis } from '../context/AnalysisContext';

const features = [
  {
    icon: '☀️',
    label: 'Solar PV system sizing and generation analysis',
  },
  {
    icon: '🔋',
    label: 'Battery Energy Storage System (BESS) sizing',
  },
  {
    icon: '⚡',
    label: 'Financial analysis including NPV, IRR and Payback',
  },
  {
    icon: '🌱',
    label: 'Environmental impact and CO2 reduction assessment',
  },
  {
    icon: '📊',
    label: 'Scenario comparison across RTS, Grid, BESS and EV modes',
  },
];

const stats = [
  {
    icon: '🧭',
    value: '9-Step',
    label: 'Guided Wizard',
  },
  // {
  //   icon: '📊',
  //   value: '8 KPIs',
  //   label: 'Financial Metrics',
  // },
  {
    icon: '⚡',
    value: '6 Modes',
    label: 'RTS, Grid, BESS and EV',
  },
  {
    icon: '📅',
    value: '25-Year',
    label: 'Cash Flow Model',
  },
];

export function HeroPage() {
  const { startWizard } = useAnalysis();

  return (
    <div id="hero-section">
      <section id="hero">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title">
              Solar PV + BESS Sizing &
              <br />
              Financial Analysis Platform
            </h1>

            <div className="hero-btns">
              <button className="btn-primary" type="button" onClick={startWizard}>
                Start Analysis
              </button>
            </div>

            <div className="hero-features">
              {features.map((feature) => (
                <div className="feature-item" key={feature.label}>
                  <div className="feature-icon">{feature.icon}</div>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-stats">
          {stats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <div className="stat-icon">{stat.icon}</div>
              <div>
                <div className="stat-val">{stat.value}</div>
                <div className="stat-lbl">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
