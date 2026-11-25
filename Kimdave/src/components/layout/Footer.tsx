import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, Mail, MessageCircle } from 'lucide-react';
import { siteSettings } from '../../data/siteSettings';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="brand-wordmark">
              <span>{siteSettings.brandName}</span>
              <span className="subtitle">PHOTOGRAPHY</span>
            </Link>
            <p className="footer-tagline">
              {siteSettings.tagline}
            </p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-light-secondary)' }}>
              {siteSettings.serviceArea}
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-links-title">Navigation</h4>
            <Link to="/work" className="footer-link">Selected Work</Link>
            <Link to="/about" className="footer-link">About Kim Dave</Link>
            <Link to="/enquire" className="footer-link">Shoot Enquiries</Link>
            <Link to="/privacy" className="footer-link">Privacy & Terms</Link>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-links-title">Direct Inquiries</h4>
            <a
              href={`mailto:${siteSettings.email}`}
              className="footer-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Mail size={16} aria-hidden="true" />
              <span>{siteSettings.email}</span>
            </a>
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(siteSettings.whatsappPrefillText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>WhatsApp: {siteSettings.whatsappFormatted}</span>
            </a>
            <a
              href={siteSettings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>Instagram: {siteSettings.instagramHandle}</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {currentYear} {siteSettings.businessName}. All rights reserved.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/privacy" className="footer-link" style={{ fontSize: '0.85rem' }}>
              Privacy Notice
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="footer-link"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', background: 'none', border: 'none', color: '#AAAAAA' }}
              aria-label="Back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
