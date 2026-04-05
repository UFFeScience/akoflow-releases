import { useDiagnostics } from './hooks/useDiagnostics.jsx';
import { DiagnosticsScreen } from './components/DiagnosticsScreen.jsx';

export function App() {
  const [state, actions] = useDiagnostics();

  return <DiagnosticsScreen state={state} onRefresh={actions.refresh} />;
}