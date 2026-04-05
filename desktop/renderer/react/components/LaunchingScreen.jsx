import { useState, useEffect, useRef } from '../runtime.jsx';
import { AKOFLOW_LOGO_URL } from '../brandAssets.jsx';

const LAUNCH_STEPS = [
  { id: 'pull',   label: 'Pulling latest image',  detail: 'akoflow/akoflow' },
  { id: 'start',  label: 'Starting container',     detail: 'Port 7777 · akoflow-local' },
  { id: 'health', label: 'Waiting for service',    detail: 'http://localhost:7777' },
];

const STATUS_ICON = { pending: '○', active: '⟳', done: '✓', error: '✗' };

export function LaunchingScreen({ onLaunched, onBack }) {
  const [stepStatus, setStepStatus] = useState(['active', 'pending', 'pending']);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const markStep = (idx, status) =>
    setStepStatus((prev) => { const n = [...prev]; n[idx] = status; return n; });

  const addLog = (raw) => {
    const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
    setLogs((prev) => [...prev, ...lines]);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      /* ── Step 0: pull image ── */
      try {
        window.akoflow.onPullProgress((data) => {
          if (!cancelled) addLog(data);
        });
        await window.akoflow.pullImage();
        window.akoflow.offPullProgress();
        if (cancelled) return;
        markStep(0, 'done');
        addLog('Image up to date.');
      } catch (err) {
        window.akoflow.offPullProgress();
        if (cancelled) return;
        markStep(0, 'error');
        setError(err?.message || 'Failed to pull image.');
        return;
      }

      /* ── Step 1: start container ── */
      setCurrentStep(1);
      markStep(1, 'active');
      try {
        await window.akoflow.startContainer();
        if (cancelled) return;
        markStep(1, 'done');
        addLog('Container started on port 7777.');
      } catch (err) {
        if (cancelled) return;
        markStep(1, 'error');
        setError(err?.message || 'Failed to start container.');
        return;
      }

      /* ── Step 2: health check ── */
      setCurrentStep(2);
      markStep(2, 'active');
      addLog('Waiting for service to respond…');

      const MAX_ATTEMPTS = 24;
      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 1250));
        const { ok } = await window.akoflow.healthCheck();
        if (ok) {
          if (cancelled) return;
          markStep(2, 'done');
          addLog('Service is ready!');
          onLaunched();
          return;
        }
      }

      if (!cancelled) {
        markStep(2, 'error');
        setError('Service did not respond in 30 s. Check container logs.');
      }
    };

    run().catch((err) => {
      if (!cancelled) setError(err?.message || 'Unexpected error during launch.');
    });

    return () => {
      cancelled = true;
      window.akoflow.offPullProgress();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs.length]);

  const titleText = error
    ? <>Launch<br />failed.</>
    : currentStep === 2
      ? <>Almost<br />ready.</>
      : <>Starting<br />up…</>;

  return (
    <main className="single-screen">
      <div className="single-screen__ambient single-screen__ambient--one" />
      <div className="single-screen__ambient single-screen__ambient--two" />
      <div className="single-screen__ambient single-screen__ambient--three" />

      <section className="single-screen__card launching-card">
        <img className="single-screen__logo" src={AKOFLOW_LOGO_URL} alt="AkôFlow" />

        <div className="single-screen__content single-screen__content--animated">
          <div className="single-screen__label">Launching AkôFlow</div>
          <h1 className="single-screen__title">{titleText}</h1>
        </div>

        {/* Step list */}
        <div className="launch-steps">
          {LAUNCH_STEPS.map((step, i) => (
            <LaunchStep key={step.id} step={step} status={stepStatus[i]} />
          ))}
        </div>

        {/* Live output log */}
        {logs.length > 0 && (
          <div className="log-panel launch-log">
            <div className="log-panel__header">● output</div>
            <div className="log-panel__body">
              {logs.slice(-40).map((line, idx) => (
                <div key={idx} className="log-panel__line">
                  <span className="log-panel__idx">{String(idx + 1).padStart(2, '0')}</span>
                  <span>{line}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
        )}

        {error && (
          <div className="error-box">
            <span className="error-box__icon">⚠</span>
            <p className="error-box__msg">{error}</p>
            <button className="single-screen__retry" type="button" onClick={onBack}>
              ← Back
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function LaunchStep({ step, status }) {
  return (
    <div className={`launch-step launch-step--${status}`}>
      <span className="launch-step__icon">{STATUS_ICON[status] ?? '○'}</span>
      <span className="launch-step__body">
        <strong>{step.label}</strong>
        <span>{step.detail}</span>
      </span>
    </div>
  );
}
