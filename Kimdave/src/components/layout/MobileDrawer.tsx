import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight, MessageCircle, Sun, Moon } from 'lucide-react';
import { siteSettings } from '../../data/siteSettings';
import { useTheme } from '../../context/useTheme';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose, triggerRef }) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  // Close on route change
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname, isOpen, onClose]);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerRef?.current?.focus();
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  return (
    <div
      className={`mobile-drawer-backdrop ${isOpen ? 'open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          triggerRef?.current?.focus();
        }
      }}
      aria-hidden={!isOpen}
    >
      <div
        id="mobile-navigation"
        className="mobile-drawer-content"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
      >
        <div className="drawer-header">
          <span className="brand-wordmark">
            <span>{siteSettings.brandName}</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              className="theme-toggle-btn touch-target"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            <button
              type="button"
              ref={closeBtnRef}
              className="menu-toggle touch-target"
              onClick={() => {
                onClose();
                triggerRef?.current?.focus();
              }}
              aria-label="Close navigation menu"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
        </div>

        <nav className="drawer-links" aria-label="Mobile Navigation Links">
          <Link to="/" className="drawer-link" onClick={onClose}>
            <span>Home</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/work" className="drawer-link" onClick={onClose}>
            <span>Work</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/about" className="drawer-link" onClick={onClose}>
            <span>About</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link to="/enquire" className="drawer-link" onClick={onClose}>
            <span>Enquire</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </nav>

        <div className="drawer-footer">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={toggleTheme}
            style={{ width: '100%', marginBottom: '0.25rem' }}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={16} aria-hidden="true" />
                <span>Switch to Light Theme</span>
              </>
            ) : (
              <>
                <Moon size={16} aria-hidden="true" />
                <span>Switch to Dark Theme</span>
              </>
            )}
          </button>
          <Link to="/enquire" className="btn btn-primary" onClick={onClose}>
            Book a Shoot
          </Link>
          <a
            href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(siteSettings.whatsappPrefillText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
            aria-label="Chat with Kim Dave on WhatsApp"
          >
            <MessageCircle size={18} aria-hidden="true" />
            <span>WhatsApp Chat</span>
          </a>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '0.5rem' }}>
            {siteSettings.serviceArea}
          </p>
        </div>
      </div>
    </div>
  );
};
