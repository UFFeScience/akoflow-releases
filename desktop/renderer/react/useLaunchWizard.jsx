import { useEffect, useState } from './runtime.jsx';
import { getDiagnostics } from './services/system-api.jsx';

export function useLaunchWizard() {
  const [state, setState] = useState({
    diagnostics: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const diagnostics = await getDiagnostics();

        if (cancelled) {
          return;
        }

        setState({
          diagnostics,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState({
          diagnostics: null,
          loading: false,
          error: error?.message || 'Diagnostics failed.',
        });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return [state, {
    refresh: async () => {
      const diagnostics = await getDiagnostics();

      setState({
        diagnostics,
        loading: false,
        error: null,
      });
    },
  }];
}