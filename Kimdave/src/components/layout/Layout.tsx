import React, { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { MobileDrawer } from './MobileDrawer';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <Header
        onOpenMobileMenu={handleOpenMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
      />
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        triggerRef={menuTriggerRef}
      />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};
