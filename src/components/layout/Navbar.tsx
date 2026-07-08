import { useAnalysis } from '../../context/AnalysisContext';


export function Navbar() {
  const { goHome, state } = useAnalysis();

  return (
    <nav>
      <div className="nav-logo">
        <img src="/LOGO.png"
        className="irade-logo"
        />
      </div>
      {state.showWizard && (
        <button className="nav-btn" type="button" onClick={goHome}>
          Home
        </button>
      )}
    </nav>
  );
}
