import { useState, useEffect, useRef } from '../runtime.jsx';
import { AKOFLOW_LOGO_URL } from '../brandAssets.jsx';

const STEPS = [
  { key: 'welcome', label: 'Welcome'       },
  { key: 'system',  label: 'System Check'  },
  { key: 'docker',  label: 'Docker Daemon' },
  { key: 'ready',   label: 'All Set'       },
];

/* ═══════════════════════════════════════════════════════════
   Main orchestrator
═══════════════════════════════════════════════════════════ */
export function DiagnosticsScreen({ state, onRefresh }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [animToken, setAnimToken] = useState(0);

  const systemOk   = Boolean(state.systemInfo?.platformLabel);
  const dockerOk   = state.dockerStatus?.status === 'ready';
  const isLastStep = stepIndex === STEPS.length - 1;

  const systemSummary = state.systemInfo
    ? `${state.systemInfo.platformLabel} · ${state.systemInfo.architectureLabel}`
    : 'Detecting…';

  const goNext = () => {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    setAnimToken((t) => t + 1);
  };

  // Welcome: auto-advance after 5 s
  useEffect(() => {
    if (stepIndex !== 0) return undefined;
    const t = setTimeout(goNext, 5000);
    return () => clearTimeout(t);
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const isNextEnabled = (() => {
    if (stepIndex === 0) return false;
    if (stepIndex === 1) return systemOk || Boolean(state.error);
    if (stepIndex === 2) return dockerOk;
    if (isLastStep)      return systemOk && dockerOk;
    return false;
  })();

  const handleNext = async () => {
    if (!isNextEnabled) return;
    if (!isLastStep) { goNext(); return; }
    await onRefresh();
    setAnimToken((t) => t + 1);
  };

  const nextLabel = (() => {
    if (isLastStep)      return 'Run AkoFlow via Docker';
    if (stepIndex === 1 && state.error) return 'Continue anyway →';
    return 'Next →';
  })();

  return (
    <main className="single-screen">
      {/* ambient light blobs */}
      <AmbientBlobs />

      <section className="single-screen__card">
        <img className="single-screen__logo" src={AKOFLOW_LOGO_URL} alt="AkoFlow" />

        <StepIndicator steps={STEPS} current={stepIndex} />

        <div
          key={`${stepIndex}-${animToken}`}
          className="single-screen__content single-screen__content--animated"
        >
          {stepIndex === 0 && <StepWelcome />}
          {stepIndex === 1 && <StepSystem state={state} systemSummary={systemSummary} onRetry={onRefresh} />}
          {stepIndex === 2 && <StepDocker state={state} dockerOk={dockerOk} onRetry={onRefresh} />}
          {stepIndex === 3 && (
            <StepReady
              state={state}
              systemSummary={systemSummary}
              systemOk={systemOk}
              dockerOk={dockerOk}
            />
          )}
        </div>

        <LogPanel logs={state.logs} error={state.error} />

        <button
          className="single-screen__next"
          type="button"
          onClick={handleNext}
          disabled={!isNextEnabled}
        >
          {nextLabel}
        </button>
      </section>
    </main>
  );
}

/* ────────────────────────────────────────────────────────
   AmbientBlobs — decorative background orbs
──────────────────────────────────────────────────────── */
function AmbientBlobs() {
  return (
    <>
      <div className="single-screen__ambient single-screen__ambient--one" />
      <div className="single-screen__ambient single-screen__ambient--two" />
      <div className="single-screen__ambient single-screen__ambient--three" />
      <div className="single-screen__ambient single-screen__ambient--four" />
      <div className="single-screen__ambient single-screen__ambient--five" />
    </>
  );
}

/* ────────────────────────────────────────────────────────
   StepIndicator — numbered breadcrumb pills
──────────────────────────────────────────────────────── */
function StepIndicator({ steps, current }) {
  return (
    <div className="single-screen__stepper">
      {steps.map((s, i) => (
        <div
          key={s.key}
          className={[
            'single-screen__step-dot',
            i === current ? 'is-active' : '',
            i <  current  ? 'is-done'   : '',
          ].filter(Boolean).join(' ')}
        >
          {i < current ? '✓' : i + 1}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   LogPanel — live scrollable terminal log
──────────────────────────────────────────────────────── */
function LogPanel({ logs, error }) {
  const bottomRef = useRef(null);
  const entries   = Array.isArray(logs) ? logs : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length, error]);

  if (entries.length === 0 && !error) return null;

  return (
    <div className="log-panel">
      <div className="log-panel__header">● logs</div>
      <div className="log-panel__body">
        {entries.map((line, idx) => (
          <div key={idx} className="log-panel__line">
            <span className="log-panel__idx">{String(idx + 1).padStart(2, '0')}</span>
            <span>{line}</span>
          </div>
        ))}
        {error && (
          <div className="log-panel__line log-panel__line--error">
            <span className="log-panel__idx">!!</span>
            <span>{error}</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   STEP SCREENS
════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────────────
   Step 0 – Welcome
──────────────────────────────────────────────────────── */
function StepWelcome() {
  return (
    <>
      <div className="single-screen__label">Welcome to AkoFlow</div>
      <h1 className="single-screen__title">Local<br />Release.</h1>
      <p className="single-screen__copy">
        Preparing your environment. System checks will begin automatically.
      </p>
      <ProgressBar duration={5} />
    </>
  );
}

/* ────────────────────────────────────────────────────────
   Step 1 – System Check
──────────────────────────────────────────────────────── */
function StepSystem({ state, systemSummary, onRetry }) {
  const ready = Boolean(state.systemInfo?.platformLabel);
  const hasError = Boolean(state.error) && !state.loading;

  return (
    <>
      <div className="single-screen__label">Step 1 · System Check</div>
      <h1 className="single-screen__title">
        {ready ? <>System<br />detected.</> : hasError ? <>Check<br />failed.</> : <>Scanning<br />system…</>}
      </h1>

      {!ready && !hasError && (
        <LoadingPulse text={state.loading ? 'Running system diagnostics…' : 'Finalising…'} />
      )}

      {hasError && (
        <ErrorBox message={state.error} onRetry={onRetry} />
      )}

      {ready && (
        <SystemTiles info={state.systemInfo} />
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   Step 2 – Docker Daemon
──────────────────────────────────────────────────────── */
function StepDocker({ state, dockerOk, onRetry }) {
  const checked = Boolean(state.dockerStatus);

  return (
    <>
      <div className="single-screen__label">Step 2 · Docker Daemon</div>
      <h1 className="single-screen__title">
        {!checked
          ? <>Checking<br />Docker…</>
          : dockerOk
            ? <>Docker<br />active.</>  
            : <>Docker<br />offline.</>}
      </h1>

      {!checked && <LoadingPulse text="Verifying Docker daemon availability…" />}

      {checked && (
        <DockerStatus dockerStatus={state.dockerStatus} dockerOk={dockerOk} />
      )}

      {checked && !dockerOk && (
        <>
          <p className="single-screen__copy">
            Open Docker Desktop, wait for the engine, then retry.
          </p>
          <button className="single-screen__retry" type="button" onClick={onRetry}>
            ↻ Recheck Docker
          </button>
        </>
      )}
    </>
  );
}

/* ────────────────────────────────────────────────────────
   Step 3 – Ready
──────────────────────────────────────────────────────── */
function StepReady({ state, systemSummary, systemOk, dockerOk }) {
  const checks = [
    { label: 'System',        ok: systemOk, detail: systemOk ? systemSummary : 'Not detected' },
    { label: 'Docker daemon', ok: dockerOk, detail: dockerOk ? (state.dockerStatus?.message || 'Running') : 'Not ready' },
  ];

  return (
    <>
      <div className="single-screen__label">All set.</div>
      <h1 className="single-screen__title">Ready to<br />launch.</h1>
      <p className="single-screen__copy">
        AkoFlow will be pulled and started via Docker.
      </p>
      <CheckList checks={checks} />
    </>
  );
}

/* ════════════════════════════════════════════════════════
   SHARED UI ATOMS
════════════════════════════════════════════════════════ */

function ProgressBar({ duration }) {
  return (
    <div className="single-screen__progress-bar">
      <span className="single-screen__progress-fill" style={{ animationDuration: `${duration}s` }} />
    </div>
  );
}

function LoadingPulse({ text }) {
  return (
    <div className="loading-pulse">
      <div className="loading-pulse__ring" />
      <div className="loading-pulse__dots">
        <span className="loading-pulse__dot" />
        <span className="loading-pulse__dot" />
        <span className="loading-pulse__dot" />
      </div>
      <span className="loading-pulse__text">{text}</span>
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="error-box">
      <span className="error-box__icon">⚠</span>
      <p className="error-box__msg">{message}</p>
      {onRetry && (
        <button className="single-screen__retry" type="button" onClick={onRetry}>
          ↻ Retry
        </button>
      )}
    </div>
  );
}

function SystemTiles({ info }) {
  const tiles = [
    { label: 'Platform',     value: info.platformLabel },
    { label: 'Architecture', value: info.architectureLabel },
    ...(info.downloadHint ? [{ label: 'Install note', value: info.downloadHint, wide: true }] : []),
  ];
  return (
    <div className="single-screen__tiles">
      {tiles.map((t) => (
        <div key={t.label} className={`single-screen__tile${t.wide ? ' single-screen__tile--wide' : ''}`}>
          <span>{t.label}</span>
          <strong>{t.value}</strong>
        </div>
      ))}
    </div>
  );
}

function DockerStatus({ dockerStatus, dockerOk }) {
  return (
    <div className="single-screen__status">
      <span className="single-screen__status-label">Daemon status</span>
      <strong className={dockerOk ? 'txt-success' : 'txt-danger'}>
        {dockerOk ? '● Running' : '● Stopped'}
      </strong>
      {dockerStatus.message && (
        <p className="single-screen__status-msg">{dockerStatus.message}</p>
      )}
    </div>
  );
}

function CheckList({ checks }) {
  return (
    <ul className="single-screen__checklist">
      {checks.map((c) => (
        <li key={c.label} className={`single-screen__check-item ${c.ok ? 'is-ok' : 'is-fail'}`}>
          <span className="single-screen__check-icon">{c.ok ? '✓' : '✗'}</span>
          <span className="single-screen__check-body">
            <strong>{c.label}</strong>
            <span>{c.detail}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}