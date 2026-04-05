import { useState, useEffect } from './runtime.jsx';
import { useDiagnostics } from './hooks/useDiagnostics.jsx';
import { DiagnosticsScreen } from './components/DiagnosticsScreen.jsx';
import { LaunchingScreen } from './components/LaunchingScreen.jsx';
import { AppScreen } from './components/AppScreen.jsx';
import { AKOFLOW_LOGO_URL } from './brandAssets.jsx';

// phase: 'init' | 'already-running' | 'wizard' | 'launching' | 'app'

export function App() {
  const [phase, setPhase] = useState('init');
  const [diagState, diagActions] = useDiagnostics();

  useEffect(() => {
    window.akoflow.checkAkoflowRunning()
      .then(({ running }) => {
        setPhase(running ? 'already-running' : 'wizard');
      })
      .catch(() => setPhase('wizard'));
  }, []);

  if (phase === 'init') {
    return <CheckingScreen message="Checking environment…" />;
  }

  if (phase === 'already-running') {
    return (
      <CheckingScreen
        message="AkoFlow is already running. Connecting…"
        onReady={() => setPhase('app')}
      />
    );
  }

  if (phase === 'wizard') {
    return (
      <DiagnosticsScreen
        state={diagState}
        onRefresh={diagActions.refresh}
        onLaunch={() => setPhase('launching')}
      />
    );
  }

  if (phase === 'launching') {
    return (
      <LaunchingScreen
        onLaunched={() => setPhase('app')}
        onBack={() => setPhase('wizard')}
      />
    );
  }

  if (phase === 'app') {
    return <AppScreen onStop={() => setPhase('wizard')} />;
  }

  return null;
}

function CheckingScreen({ message, onReady }) {
  useEffect(() => {
    if (!onReady) return undefined;
    const t = setTimeout(onReady, 1400);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="single-screen">
      <div className="single-screen__ambient single-screen__ambient--one" />
      <div className="single-screen__ambient single-screen__ambient--two" />
      <section className="single-screen__card">
        <img className="single-screen__logo" src={AKOFLOW_LOGO_URL} alt="AkoFlow" />
        <div className="single-screen__content single-screen__content--animated">
          <div className="loading-pulse">
            <div className="loading-pulse__ring" />
          </div>
          <p className="single-screen__copy">{message}</p>
        </div>
      </section>
    </main>
  );
}
