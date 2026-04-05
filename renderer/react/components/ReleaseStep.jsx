import { AKOFLOW_BANNER_URL } from '../brandAssets.jsx';

export function ReleaseStep({ systemInfo }) {
  return (
    <div className="step-card step-card--release">
      <img className="release-image" src={AKOFLOW_BANNER_URL} alt="AkôFlow release banner" />
      <div className="step-card__headline">Latest release ready</div>
      <p className="step-card__text">
        We will pull the latest AkôFlow release image and build it locally. The environment is ready to continue.
      </p>
      <div className="step-info">
        <span>Platform: {systemInfo?.platformLabel || 'Unknown'}</span>
        <span>Architecture: {systemInfo?.architectureLabel || 'Unknown'}</span>
      </div>
    </div>
  );
}