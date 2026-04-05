export function ProgressPill({ index, active, completed, label, onSelect }) {
  const className = ['progress-pill', active ? 'is-active' : '', completed ? 'is-completed' : ''].filter(Boolean).join(' ');

  return (
    <button className={className} type="button" onClick={onSelect}>
      <span className="progress-pill__index">{index}</span>
      <span className="progress-pill__label">{label}</span>
    </button>
  );
}