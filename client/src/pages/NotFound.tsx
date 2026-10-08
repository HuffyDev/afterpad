import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="wrap py-28 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-500">› 404 · nobody’s here</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tightest">The dev already left.</h1>
      <Link to="/" className="btn-ghost mt-8">
        Go home
      </Link>
    </div>
  );
}
