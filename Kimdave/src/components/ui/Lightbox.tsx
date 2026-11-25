import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProjectImage } from '../../data/types';
import { ResponsivePhoto } from './ResponsivePhoto';

interface LightboxProps {
  images: ProjectImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  triggerElement?: HTMLElement | null;
}

export const Lightbox: React.FC<LightboxProps> = ({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
  triggerElement,
}) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentImage = images[currentIndex];

  const handlePrev = useCallback(() => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onNavigate]);

  // Keyboard navigation & focus management
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on mount
    setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        triggerElement?.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }

      // Focus trap within lightbox
      if (e.key === 'Tab' && containerRef.current) {
        const focusables = containerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleNext, handlePrev, onClose, triggerElement]);

  // Preload adjacent frames for crisp prev/next Lightbox transitions
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const nextIdx = (currentIndex + 1) % images.length;
    const prevIdx = (currentIndex - 1 + images.length) % images.length;

    [images[nextIdx], images[prevIdx]].forEach((candidate) => {
      if (!candidate) return;
      const preloader = new window.Image();
      preloader.src = candidate.lightboxWebp || candidate.src;
    });
  }, [isOpen, currentIndex, images]);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    // Minimum swipe threshold 50px
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  if (!isOpen || !currentImage) return null;

  return (
    <div
      className="lightbox-backdrop open"
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Image gallery viewer"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
          triggerElement?.focus();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="lightbox-controls">
        <span className="lightbox-counter" aria-live="polite">
          {currentIndex + 1} / {images.length}
        </span>
        <button
          type="button"
          ref={closeBtnRef}
          className="lightbox-btn"
          onClick={() => {
            onClose();
            triggerElement?.focus();
          }}
          aria-label="Close image viewer"
        >
          <X size={22} aria-hidden="true" />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="lightbox-btn lightbox-nav-btn lightbox-prev"
            onClick={handlePrev}
            aria-label="Previous photograph"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="lightbox-btn lightbox-nav-btn lightbox-next"
            onClick={handleNext}
            aria-label="Next photograph"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </>
      )}

      <div className="lightbox-image-container">
        <ResponsivePhoto
          image={currentImage}
          mode="lightbox"
          className="lightbox-img"
          loading="eager"
          decoding="async"
        />
        {currentImage.caption && (
          <p className="lightbox-caption">{currentImage.caption}</p>
        )}
      </div>
    </div>
  );
};
