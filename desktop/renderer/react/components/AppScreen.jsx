import { useState } from '../runtime.jsx';
import { AKOFLOW_LOGO_URL } from '../brandAssets.jsx';

const APP_URL = 'http://localhost:7777';

export function AppScreen({ onStop }) {
  const [stopping, setStopping] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleStopClick = () => setShowConfirm(true);

  const handleConfirmStop = async () => {
    setStopping(true);
    setShowConfirm(false);
    await window.akoflow.stopContainer();
    onStop();
  };

  return (
    <div className="app-screen">
      <header className="app-screen__header">
        <div className="app-screen__brand">
          <img src={AKOFLOW_LOGO_URL} alt="AkôFlow" className="app-screen__logo" />
          <span className="app-screen__name">AkôFlow</span>
          <span className="app-screen__url">{APP_URL}</span>
        </div>

        <button
          className="app-screen__stop-btn"
          type="button"
          onClick={handleStopClick}
          disabled={stopping}
        >
          {stopping ? 'Stopping…' : '■ Stop AkôFlow'}
        </button>
      </header>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="app-screen__overlay">
          <div className="app-screen__dialog">
            <img src={AKOFLOW_LOGO_URL} alt="AkôFlow" className="app-screen__dialog-logo" />
            <h2 className="app-screen__dialog-title">Stop AkôFlow?</h2>
            <p className="app-screen__dialog-body">
              The container will be stopped, but <strong>your environment is not removed</strong> — all data stays inside the container and will be here when you come back.
            </p>
            <div className="app-screen__dialog-actions">
              <button
                className="single-screen__next"
                type="button"
                onClick={handleConfirmStop}
              >
                Stop container
              </button>
              <button
                className="single-screen__retry"
                type="button"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <iframe
        className="app-screen__iframe"
        src={APP_URL}
        title="AkôFlow"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
