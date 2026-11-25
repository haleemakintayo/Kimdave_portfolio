import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon } from 'lucide-react';
import { siteSettings } from '../../data/siteSettings';
import { useTheme } from '../../context/useTheme';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, isMobileMenuOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="brand-wordmark" aria-label="Kim Dave Photography Homepage">
            <span>{siteSettings.brandName}</span>
            <span className="subtitle">PHOTOGRAPHY</span>
          </Link>

          <nav className="nav-desktop" aria-label="Main Navigation">
            <Link to="/work" className={`nav-link ${isActive('/work') ? 'active' : ''}`}>
              Work
            </Link>
            <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
              About
            </Link>
            <Link to="/enquire" className="btn btn-primary btn-sm">
              Enquire
            </Link>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="theme-toggle-btn touch-target"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? (
                <Sun size={19} aria-hidden="true" />
              ) : (
                <Moon size={19} aria-hidden="true" />
              )}
            </button>

            <Link to="/enquire" className="btn btn-primary btn-sm mobile-enquire-btn" style={{ display: 'none' }}>
              Enquire
            </Link>
            <button
              type="button"
              className="menu-toggle touch-target"
              onClick={onOpenMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
