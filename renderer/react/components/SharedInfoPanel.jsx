import { useState } from '../runtime.jsx';

export function SharedInfoPanel({ systemInfo, dockerStatus, logs }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`shared-info ${open ? 'shared-info--open' : 'shared-info--closed'}`}>
      <button type="button" className="shared-info__toggle" onClick={() => setOpen((o) => !o)}>
        {open ? 'Hide details' : 'Show details'}
      </button>
      {open ? (
        <div className="shared-info__body">
          <div className="shared-info__section">
            <strong>System Info</strong>
            <pre className="shared-info__pre">{systemInfo ? JSON.stringify(systemInfo, null, 2) : 'No system information available.'}</pre>
          </div>
          <div className="shared-info__section">
            <strong>Docker Status</strong>
            <pre className="shared-info__pre">{dockerStatus ? JSON.stringify(dockerStatus, null, 2) : 'No Docker information available.'}</pre>
          </div>
          <div className="shared-info__section">
            <strong>Logs</strong>
            <pre className="shared-info__pre">{Array.isArray(logs) && logs.length > 0 ? logs.join('\n') : 'No logs available.'}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
