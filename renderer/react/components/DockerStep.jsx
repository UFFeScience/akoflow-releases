export function DockerStep({ dockerStatus, onInstall, onRetry }) {
  const title = dockerStatus?.status === 'missing' ? 'Docker not installed' : 'Checking Docker';
  const message = dockerStatus?.message || 'Verifying Docker availability on this machine.';

  return (
    <div className="step-card">
      <div className="step-card__headline">{title}</div>
      <p className="step-card__text">{message}</p>
      <div className="step-actions">
        <button className="primary-button" type="button" onClick={dockerStatus?.status === 'missing' ? onInstall : onRetry}>
          {dockerStatus?.status === 'missing' ? 'Install Docker Desktop' : 'Recheck Docker'}
        </button>
      </div>
    </div>
  );
}