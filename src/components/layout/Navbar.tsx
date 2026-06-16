import { useAnalysis } from '../../context/AnalysisContext';

export function Navbar() {
  const { goHome } = useAnalysis();

  return (
    <nav>
      <div className="nav-logo">
        <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="13" stroke="#00BFFF" strokeWidth="1.5" />
          <path
            d="M14 6v4M14 18v4M6 14h4M18 14h4M8.9 8.9l2.8 2.8M16.3 16.3l2.8 2.8M8.9 19.1l2.8-2.8M16.3 11.7l2.8-2.8"
            stroke="#FFA500"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="14" cy="14" r="3" fill="#00BFFF" />
        </svg>
        SolarBESS Pro
      </div>
      <button className="nav-btn" type="button" onClick={goHome}>
        ← Home
      </button>
    </nav>
  );
}
