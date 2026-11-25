import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Calendar, MapPin, User, Sparkles } from 'lucide-react';
import { projects } from '../data/projects';
import { Lightbox } from '../components/ui/Lightbox';
import { ResponsivePhoto } from '../components/ui/ResponsivePhoto';
import { ProjectCard } from '../components/work/ProjectCard';

export const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTriggerElement, setActiveTriggerElement] = useState<HTMLElement | null>(null);

  const project = projects.find((p) => p.slug === slug && p.published);

  if (!project) {
    return <Navigate to="/work" replace />;
  }

  // Related projects (same category or others, max 2)
  const relatedProjects = projects
    .filter((p) => p.id !== project.id && p.published)
    .slice(0, 2);

  const foundCoverIdx = project.images.findIndex(
    (img) => img.id === project.coverImage.id || img.src === project.coverImage.src
  );
  const coverImageIndex = foundCoverIdx >= 0 ? foundCoverIdx : 0;

  const handleOpenLightbox = (index: number, e: React.MouseEvent<HTMLElement>) => {
    setActiveTriggerElement(e.currentTarget);
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };

  return (
    <article className="section-py" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Back navigation */}
        <div style={{ marginBottom: '2.5rem' }}>
          <Link
            to="/work"
            className="btn-outline-link"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Back to All Work</span>
          </Link>
        </div>

        {/* Project Header */}
        <header style={{ maxWidth: '900px', marginBottom: '3rem' }}>
          <span className="section-label" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
            {project.category}
          </span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.25rem', lineHeight: '1.1' }}>
            {project.title}
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '2rem' }}>
            {project.summary}
          </p>

          {/* Metadata Block */}
          {project.details && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem 2.5rem',
                padding: '1.25rem 0',
                borderTop: '1px solid var(--border-subtle)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
              }}
            >
              {project.details.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                  <span>{project.details.location}</span>
                </div>
              )}
              {project.details.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={16} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                  <span>{project.details.date}</span>
                </div>
              )}
              {project.details.client && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={16} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                  <span>{project.details.client}</span>
                </div>
              )}
            </div>
          )}

          {/* Credits if available */}
          {project.details?.credits && project.details.credits.length > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {project.details.credits.join(' • ')}
            </div>
          )}
        </header>

        {/* Hero Cover Image */}
        <div
          className="gallery-item gallery-item--hero"
          style={{ marginBottom: '2rem' }}
          onClick={(e) => handleOpenLightbox(coverImageIndex, e)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleOpenLightbox(coverImageIndex, e as unknown as React.MouseEvent<HTMLElement>);
            }
          }}
          aria-label={`Open cover photo: ${project.coverImage.alt}`}
        >
          <ResponsivePhoto
            image={project.coverImage}
            sizes="(min-width: 1280px) 1200px, 94vw"
            loading="eager"
            style={{ width: '100%', maxHeight: '78vh', objectFit: 'cover', objectPosition: project.coverImage.focalPoint || '50% 50%' }}
          />
        </div>

        {/* Narrative Photo Sequence (Preserving Natural Aspect Ratios) */}
        <section aria-label="Project photograph sequence">
          <div className="project-gallery-sequence">
            {project.images.map((img, idx) => {
              const isDuplicateCover =
                project.images.length > 1 &&
                (img.id === project.coverImage.id || img.src === project.coverImage.src);
              if (isDuplicateCover) return null;

              const isLandscape = img.width > img.height;

              return (
                <figure
                  key={img.id}
                  className={`gallery-item ${isLandscape ? 'gallery-item--landscape' : 'gallery-item--portrait'}`}
                  onClick={(e) => handleOpenLightbox(idx, e)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenLightbox(idx, e as unknown as React.MouseEvent<HTMLElement>);
                    }
                  }}
                  aria-label={`Open photograph ${idx + 1} of ${project.images.length}: ${img.alt}`}
                >
                  <ResponsivePhoto
                    image={img}
                    sizes={isLandscape ? '(min-width: 1280px) 1200px, 94vw' : '(min-width: 768px) 580px, 94vw'}
                    loading="lazy"
                    includeDimensions
                  />
                  {img.caption && (
                    <figcaption className="gallery-caption">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              );
            })}
          </div>
        </section>

        {/* Next Action / Project CTA */}
        <section
          style={{
            margin: '4rem 0',
            padding: '3rem 2rem',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <span className="hero-badge" style={{ margin: '0 auto 1rem', display: 'inline-flex' }}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Commission a Similar Session</span>
          </span>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Interested in a similar vision?</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.75rem', lineHeight: '1.6' }}>
            Let’s discuss your upcoming milestone, editorial brief, or celebration. Dates are confirmed individually.
          </p>
          <Link to={`/enquire?service=${project.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`} className="btn btn-primary">
            <span>Enquire About a Shoot</span>
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section style={{ marginTop: '5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '4rem' }}>
            <div className="section-header">
              <span className="section-label">More Work</span>
              <h2 className="section-title">Related Projects</h2>
            </div>
            <div className="projects-grid">
              {relatedProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Lightbox
        images={project.images}
        currentIndex={activeImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setActiveImageIndex}
        triggerElement={activeTriggerElement}
      />
    </article>
  );
};
