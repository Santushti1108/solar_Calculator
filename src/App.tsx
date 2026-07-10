import { Navbar } from './components/layout/Navbar';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { HeroPage } from './pages/HeroPage';
import { WizardPage } from './pages/WizardPage';


function AppContent() {
  const { state } = useAnalysis();
  return (
    <>
    
    <div id="app">
      <Navbar />
      {state.showWizard ? <WizardPage /> : <HeroPage />}
    </div>
    </>
   
  );
}

export default function App() {
  return (
    
    <AnalysisProvider>
      <AppContent />
    </AnalysisProvider>
    
  );
}
