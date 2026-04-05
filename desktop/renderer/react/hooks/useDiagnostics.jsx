import { useEffect, useState } from '../runtime.jsx';
import { getSystemInfo } from '../services/system-api.jsx';
import { getDockerStatus } from '../services/docker-api.jsx';

export function useDiagnostics() {
  const [state, setState] = useState({
    systemInfo: null,
    dockerStatus: null,
    logs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        console.log('[AkoFlow] Frontend requesting system information');
        const systemInfo = await getSystemInfo();
        console.log('[AkoFlow] Frontend system information received (raw):', systemInfo);

        if (cancelled) return;

        const safeSystem = systemInfo || { platformLabel: 'Unknown', architectureLabel: 'Unknown', logs: [] };

        setState((prev) => ({
          ...prev,
          systemInfo: safeSystem,
          logs: [
            ...(Array.isArray(safeSystem.logs) ? safeSystem.logs : []),
            `System detected: ${safeSystem.platformLabel} / ${safeSystem.architectureLabel}`,
          ],
          loading: false,
          error: null,
        }));

        // Start Docker check in background so UI can react to systemInfo immediately
        console.log('[AkoFlow] Frontend requesting Docker status (background)');
        const DOCKER_TIMEOUT_MS = 10000;
        const dockerStatus = await Promise.race([
          getDockerStatus(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Docker check timed out after 10 s. Open Docker Desktop and retry.')), DOCKER_TIMEOUT_MS)
          ),
        ]);
        console.log('[AkoFlow] Frontend Docker status received (raw):', dockerStatus);

        if (cancelled) return;

        const safeDocker = dockerStatus || { status: 'missing', message: 'Unknown', error: null };

        setState((prev) => ({
          ...prev,
          dockerStatus: safeDocker,
          logs: [
            ...(Array.isArray(prev.logs) ? prev.logs : []),
            safeDocker.status === 'ready'
              ? `Docker daemon active: ${safeDocker.message}`
              : `Docker daemon is not active: ${safeDocker.message}`,
          ],
        }));
      } catch (error) {
        if (cancelled) return;

        console.error('[AkoFlow] Diagnostics failed:', error);

        setState({
          systemInfo: null,
          dockerStatus: null,
          logs: [],
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
      console.log('[AkoFlow] Frontend refreshing diagnostics');
      try {
        const systemInfo = await getSystemInfo();
        console.log('[AkoFlow] Frontend system information received (raw):', systemInfo);

        const safeSystem = systemInfo || { platformLabel: 'Unknown', architectureLabel: 'Unknown', logs: [] };

        setState((prev) => ({
          ...prev,
          systemInfo: safeSystem,
          logs: [
            ...(Array.isArray(safeSystem.logs) ? safeSystem.logs : []),
            `System detected: ${safeSystem.platformLabel} / ${safeSystem.architectureLabel}`,
          ],
          loading: false,
          error: null,
        }));

        // Docker check in background — 10 s timeout guards against daemon hang
        const dockerStatus = await Promise.race([
          getDockerStatus(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Docker check timed out after 10 s. Open Docker Desktop and retry.')),
              10000,
            )
          ),
        ]);
        console.log('[AkoFlow] Frontend Docker status received (raw):', dockerStatus);

        const safeDocker = dockerStatus || { status: 'missing', message: 'Unknown', error: null };

        setState((prev) => ({
          ...prev,
          dockerStatus: safeDocker,
          logs: [
            ...(Array.isArray(prev.logs) ? prev.logs : []),
            safeDocker.status === 'ready'
              ? `Docker daemon active: ${safeDocker.message}`
              : `Docker daemon is not active: ${safeDocker.message}`,
          ],
          error: null,
        }));
      } catch (err) {
        console.error('[AkoFlow] Refresh error', err);
        setState((s) => ({ ...s, loading: false, error: err?.message || 'Refresh failed.' }));
      }
    },
  }];
}