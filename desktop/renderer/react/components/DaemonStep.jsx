export function DaemonStep({ dockerStatus, onOpenDocker, onRetry }) {
  const title = 'Docker daemon is off';
  const message = dockerStatus?.message || 'Open Docker Desktop and wait until the engine is ready.';

  return (
    <div className="step-card">
      <div className="step-card__headline">{title}</div>
      <p className="step-card__text">{message}</p>
      <div className="step-actions">
        <button className="primary-button" type="button" onClick={onOpenDocker}>
          Open Docker Desktop
        </button>
        <button className="secondary-button" type="button" onClick={onRetry}>
          Recheck
        </button>
      </div>
    </div>
  );
}