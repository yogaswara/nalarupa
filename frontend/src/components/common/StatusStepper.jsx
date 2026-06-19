import { statusCopy } from '../../data/stylePresets';

const statusOrder = ['pending', 'processing-LLM', 'processing-image', 'completed'];

export default function StatusStepper({ status = 'pending', errorMessage }) {
  const currentIndex = Math.max(statusOrder.indexOf(status), 0);
  const stepWidth = `${Math.min(((currentIndex + 1) / statusOrder.length) * 100, 100)}%`;

  return (
    <section className="status-panel" aria-live="polite">
      <div className="status-topline">
        <div>
          <p className="eyebrow">Live status</p>
          <h3>{statusCopy[status]?.label || 'Working'}</h3>
        </div>
        <span className={`status-pill status-${status}`}>{status}</span>
      </div>

      <p className="status-description">{errorMessage || statusCopy[status]?.description || 'Processing your request.'}</p>

      <div className="status-track" aria-hidden="true">
        <div className="status-progress" style={{ width: stepWidth }} />
      </div>

      <ol className="status-steps">
        {statusOrder.map((step) => (
          <li key={step} className={step === status ? 'is-active' : statusOrder.indexOf(step) < currentIndex ? 'is-complete' : ''}>
            {statusCopy[step].label}
          </li>
        ))}
      </ol>
    </section>
  );
}