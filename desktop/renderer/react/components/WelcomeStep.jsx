import { AKOFLOW_LOGO_URL } from '../brandAssets.jsx';

export function WelcomeStep({ onStart }) {
  return (
    <div className="welcome-step">
      <div className="welcome-step__brand">
        <img className="welcome-step__icon" src={AKOFLOW_LOGO_URL} alt="AkoFlow logo" />
      </div>
      <h2 className="welcome-step__title">Local release.</h2>
      <div className="welcome-step__chips">
        <span className="chip">Light</span>
        <span className="chip">Fullscreen</span>
      </div>
      <button className="primary-button" type="button" onClick={onStart}>
        Start setup
      </button>
    </div>
  );
}