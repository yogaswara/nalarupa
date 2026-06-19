export default function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`section-heading align-${align}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}