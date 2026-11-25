import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="section-py" style={{ minHeight: '75vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
        <span className="section-label" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          404 — Page Not Found
        </span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', marginBottom: '1.25rem', lineHeight: '1.1' }}>
          Frame Out of Focus
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          The page or photograph you are searching for does not exist or has been relocated within the archive.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} aria-hidden="true" />
            <span>Return to Homepage</span>
          </Link>
          <Link to="/work" className="btn btn-outline">
            <span>Explore Portfolio</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
