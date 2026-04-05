import { AKOFLOW_LOGO_URL, AKOFLOW_BANNER_URL } from '../brandAssets.jsx';

export function WizardShell({
  children,
  stepNumber,
  stepLabel,
  stepTitle,
  stepCopy,
  progress,
  brandNote,
  systemInfo,
  onBack,
  onNext,
  backLabel,
  nextLabel,
  canGoBack = true,
  canGoNext = true,
}) {
  return (
    <main className="wizard-shell">
      <div className="wizard-shell__ambient wizard-shell__ambient--one" />
      <div className="wizard-shell__ambient wizard-shell__ambient--two" />
      <div className="wizard-shell__ambient wizard-shell__ambient--three" />
      <header className="wizard-shell__header">
        <div className="wizard-shell__brand">
          <img className="wizard-shell__brand-mark" src={AKOFLOW_LOGO_URL} alt="AkoFlow logo" />
        </div>
        <div className="wizard-shell__meta">
          <span>{stepLabel} {stepNumber}</span>
          <span className="wizard-shell__meta-dot">•</span>
          <span>{brandNote || 'Light mode'}</span>
        </div>
      </header>
      <section className="wizard-shell__stage">
        <div className="wizard-shell__content">
          <div className="wizard-shell__step">{`STEP ${stepNumber} · ${stepLabel}`}</div>
          <h1 className="wizard-shell__title">{stepTitle}</h1>
          <p className="wizard-shell__copy">{stepCopy}</p>
          <div className="wizard-shell__body">{children}</div>
          <div className="wizard-shell__actions">
            <button className="secondary-button" type="button" onClick={onBack} disabled={!canGoBack || !onBack}>
              {backLabel || 'Back'}
            </button>
            <button className="primary-button" type="button" onClick={onNext} disabled={!canGoNext || !onNext}>
              {nextLabel || 'Continue'}
            </button>
          </div>
        </div>
        <aside className="wizard-shell__visual">
          <div className="wizard-shell__visual-panel">
            <div className="wizard-shell__visual-heading">
              <div className="wizard-shell__visual-kicker">System</div>
            </div>
            {progress}
            <div className="wizard-shell__visual-card">
              <img className="wizard-shell__visual-mark" src={AKOFLOW_BANNER_URL} alt="AkoFlow banner" />
              <div className="wizard-shell__visual-data">
                <div className="wizard-shell__visual-data-row">
                  <span>Platform</span>
                  <strong>{systemInfo?.platformLabel || 'Detecting'}</strong>
                </div>
                <div className="wizard-shell__visual-data-row">
                  <span>Architecture</span>
                  <strong>{systemInfo?.architectureLabel || 'Detecting'}</strong>
                </div>
                <div className="wizard-shell__visual-data-row">
                  <span>State</span>
                  <strong>{stepTitle}</strong>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}