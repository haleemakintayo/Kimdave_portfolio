import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { siteSettings } from '../data/siteSettings';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="section-py" style={{ minHeight: '80vh' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            to="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Return to Home</span>
          </Link>
        </div>

        <header style={{ marginBottom: '3rem' }}>
          <span className="section-label">Legal Notice</span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', marginBottom: '1rem' }}>
            Privacy Notice
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Last updated: October 2026 • {siteSettings.businessName}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              1. Information We Collect
            </h2>
            <p>
              When you submit a shoot enquiry through this website, we collect your name, email address, optional phone/WhatsApp number, preferred shoot date, location, and the project brief you provide. We do not collect credit card numbers, payment credentials, or personal identity documents on this platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              2. How Your Information is Used
            </h2>
            <p>
              Your contact details and creative brief are used strictly to communicate with you regarding your photoshoot enquiry, prepare proposals, schedule dates, and coordinate your shoot. We do not sell, rent, or share your personal details with third-party advertising networks. You are never automatically enrolled in marketing newsletters.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              3. Image Rights & Client Privacy
            </h2>
            <p>
              All client photographs published on this portfolio are displayed solely with explicit prior authorization. Private event coverage, family celebrations, and confidential commercial campaigns will never be published publicly without express client consent. Unnecessary GPS location metadata is stripped from all web derivatives.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              4. Direct Inquiries & Contact
            </h2>
            <p>
              If you have any questions regarding how your data is handled or wish to have your details removed from our records, please contact Kim Dave directly at{' '}
              <a href={`mailto:${siteSettings.email}`} style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                {siteSettings.email}
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
