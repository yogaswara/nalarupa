import { resolveMediaUrl } from '../../services/api';

function formatTimestamp(value) {
  if (!value) {
    return 'Recently created';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently created';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export default function GalleryCard({ item }) {
  const imageSrc = resolveMediaUrl(item.imageUrl);

  return (
    <article className="gallery-card">
      <div className="gallery-image-wrap">
        <img src={imageSrc} alt={`Generated visual for ${item.style || 'classroom content'}`} loading="lazy" />
        <span className="gallery-badge">{item.style || 'Educational visual'}</span>
      </div>

      <div className="gallery-content">
        <div className="gallery-meta">
          <h3>{item.title || item.style || 'Untitled generation'}</h3>
          <time>{formatTimestamp(item.createdAt)}</time>
        </div>
        <p>{item.originalText || item.curriculumText || 'Generated classroom visual.'}</p>
        <div className="gallery-actions">
          <a className="button button-ghost button-small" href={imageSrc} download>
            Download
          </a>
          <a className="button button-outline button-small" href="/generator">
            Try again
          </a>
        </div>
      </div>
    </article>
  );
}