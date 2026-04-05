export function SystemStep({ systemInfo }) {
  if (!systemInfo) {
    return (
      <div className="step-card">
        <div className="step-card__headline">System check</div>
        <p className="step-card__text">Loading system information...</p>
      </div>
    );
  }

  return (
    <div className="step-card">
      <div className="step-card__headline">System detected</div>
      <p className="step-card__text">We matched this machine to the right installation profile.</p>
      <div className="step-grid">
        <div className="step-tile">
          <span>Platform</span>
          <strong>{systemInfo.platformLabel}</strong>
        </div>
        <div className="step-tile">
          <span>Architecture</span>
          <strong>{systemInfo.architectureLabel}</strong>
        </div>
        <div className="step-tile step-tile--wide">
          <span>Installer note</span>
          <strong>{systemInfo.downloadHint}</strong>
        </div>
      </div>
    </div>
  );
}