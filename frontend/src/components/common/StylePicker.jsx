import { stylePresets } from '../../data/stylePresets';

export default function StylePicker({ value, onChange }) {
  return (
    <div className="style-grid">
      {stylePresets.map((preset) => {
        const active = preset.id === value;
        return (
          <button
            key={preset.id}
            type="button"
            className={`style-card ${active ? 'active' : ''}`}
            onClick={() => onChange(preset.id)}
            aria-pressed={active}
          >
            <span className={`style-chip tone-${preset.tone}`}>{preset.badge}</span>
            <strong>{preset.title}</strong>
            <p>{preset.description}</p>
          </button>
        );
      })}
    </div>
  );
}