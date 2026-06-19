import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="section">
      <div className="container empty-page">
        <p className="eyebrow">404</p>
        <h1>That page is not here.</h1>
        <p>Return to the generator or gallery to continue building classroom visuals.</p>
        <Link className="button button-primary" to="/generator">
          Back to generator
        </Link>
      </div>
    </section>
  );
}