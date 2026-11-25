import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, MessageCircle } from 'lucide-react';
import { projects } from '../data/projects';
import { services } from '../data/services';
import { testimonials } from '../data/testimonials';
import { faqs } from '../data/faqs';
import { siteSettings } from '../data/siteSettings';
import { ProjectCard } from '../components/work/ProjectCard';
import { Accordion } from '../components/ui/Accordion';
import { ResponsivePhoto } from '../components/ui/ResponsivePhoto';
import { toProjectImage } from '../data/generated/curatedAssets';
import hero800Webp from '../assets/hero/hero-editorial-portrait-800.webp';
import hero1400Webp from '../assets/hero/hero-editorial-portrait-1400.webp';
import hero2000Webp from '../assets/hero/hero-editorial-portrait-2000.webp';
import hero800Jpg from '../assets/hero/hero-editorial-portrait-800.jpg';
import hero1400Jpg from '../assets/hero/hero-editorial-portrait-1400.jpg';
import hero2000Jpg from '../assets/hero/hero-editorial-portrait-2000.jpg';

const HERO_SIZES = '(min-width: 1200px) 840px, (min-width: 960px) 58vw, 100vw';

const aboutPreviewPortrait = toProjectImage('about-main', {
  alt: 'Studio portrait of Ayinde David Oluwatimileyin (Kim Dave), Lagos portrait and editorial photographer',
  focalPoint: '50% 18%',
});

export const HomePage: React.FC = () => {
  const featuredProjects = projects.filter((p) => p.featured && p.published).slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" aria-label="Hero Introduction">
        <div className="hero-bg-wrapper">
          <picture className="hero-picture">
            <source
              type="image/webp"
              srcSet={`${hero800Webp} 800w, ${hero1400Webp} 1400w, ${hero2000Webp} 2000w`}
              sizes={HERO_SIZES}
            />
            <img
              src={hero1400Jpg}
              srcSet={`${hero800Jpg} 800w, ${hero1400Jpg} 1400w, ${hero2000Jpg} 2000w`}
              sizes={HERO_SIZES}
              alt="Editorial studio group portrait of four subjects in tailored attire photographed by Kim Dave against a dark charcoal backdrop"
              className="hero-bg-img"
              width={2000}
              height={2500}
              decoding="sync"
              fetchPriority="high"
            />
          </picture>
          <div className="hero-overlay-gradient"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <p className="hero-location">
              <span>{siteSettings.baseCity}</span>
              <span className="hero-location-sep" aria-hidden="true">·</span>
              <span>Available Worldwide</span>
            </p>
            <h1 className="hero-title">{siteSettings.tagline}</h1>
            <p className="hero-subtitle">
              Editorial portraiture, celebratory milestones, and documentary stories crafted with cinematic lighting and quiet intention.
            </p>
            <div className="hero-actions">
              <Link to="/work" className="btn btn-primary">
                <span>View Selected Work</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/enquire" className="btn btn-outline">
                <span>Enquire About a Shoot</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work Section */}
      <section className="section-py" aria-labelledby="selected-work-title">
        <div className="container">
          <div className="section-header with-action">
            <div>
              <span className="section-label">Portfolio</span>
              <h2 id="selected-work-title" className="section-title">Selected Work</h2>
            </div>
            <Link to="/work" className="btn btn-outline btn-sm">
              <span>Explore All Projects</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className="projects-grid">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }} aria-labelledby="services-title">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Services & Offerings</span>
            <h2 id="services-title" className="section-title">Tailored Photographic Experiences</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>
              Whether commemorating personal milestones or executing commercial briefs, every session is approached with collaborative creative direction and meticulous attention to detail.
            </p>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article key={service.id} className="service-card">
                <div>
                  <span className="service-card-tag">{service.categoryTag}</span>
                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.description}</p>

                  <div className="service-card-meta">
                    <h4>Who It Is For</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{service.targetAudience}</p>
                  </div>

                  <div className="service-card-meta" style={{ marginTop: '1rem' }}>
                    <h4>What to Expect</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{service.whatToExpect}</p>
                  </div>

                  <div className="service-card-meta" style={{ marginTop: '1rem' }}>
                    <h4>Includes</h4>
                    <ul className="service-card-inclusions">
                      {service.inclusions.map((inc, idx) => (
                        <li key={idx}>
                          <Check size={16} aria-hidden="true" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {service.startingPrice}
                  </span>
                  <Link
                    to={`/enquire?service=${service.slug}`}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Enquire About This Service</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="section-py" aria-labelledby="about-preview-title">
        <div className="container">
          <div className="about-teaser">
            <div className="about-teaser-img-wrapper">
              <ResponsivePhoto
                image={aboutPreviewPortrait}
                sizes="(min-width: 1024px) 560px, (min-width: 840px) 46vw, 94vw"
                className="about-teaser-img"
                loading="lazy"
                style={{ objectPosition: aboutPreviewPortrait.focalPoint }}
              />
            </div>

            <div className="about-teaser-content">
              <span className="section-label">About the Photographer</span>
              <h2 id="about-preview-title" className="section-title">
                Meet Ayinde David Oluwatimileyin
              </h2>
              <p className="about-teaser-text">
                Based in Lagos, Nigeria, Ayinde David Oluwatimileyin photographs editorial portraits, milestone birthdays, commercial campaigns, and live events under the name Kim Dave.
              </p>
              <p className="about-teaser-text">
                Clients work with him for calm, clear direction on set and colour grading that respects natural skin texture and wardrobe detail. From a focused studio headshot to a full-day celebration, every brief is planned and confirmed with David directly.
              </p>
              <div>
                <Link to="/about" className="btn btn-primary">
                  <span>Read David’s Story & Approach</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process & Client Proof */}
      <section className="section-py" style={{ backgroundColor: 'var(--bg-elevated)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }} aria-labelledby="process-title">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How We Work</span>
            <h2 id="process-title" className="section-title">The Three-Step Experience</h2>
          </div>

          <div className="process-grid">
            <div className="process-card">
              <span className="process-step-number">01</span>
              <h3 className="process-title">Send a Brief</h3>
              <p className="process-desc">
                Submit an initial enquiry with your desired shoot type, date, and visual inspiration. We discuss your aesthetic and confirm availability personally.
              </p>
            </div>

            <div className="process-card">
              <span className="process-step-number">02</span>
              <h3 className="process-title">Agree the Details</h3>
              <p className="process-desc">
                We finalize your moodboard, location or studio booking in Lagos, wardrobe direction, and session timeline with a transparent formal proposal.
              </p>
            </div>

            <div className="process-card">
              <span className="process-step-number">03</span>
              <h3 className="process-title">Attend the Shoot</h3>
              <p className="process-desc">
                Enjoy a guided, music-infused session with natural coaching. Preview selections arrive in 48 hours, followed by master-retouched finals.
              </p>
            </div>
          </div>

          {/* Testimonials */}
          <div style={{ marginTop: '5rem' }}>
            <div className="section-header">
              <span className="section-label">Client Stories</span>
              <h3 className="section-title" style={{ fontSize: '2rem' }}>Words from Past Shoots</h3>
            </div>
            <div className="testimonials-grid">
              {testimonials.map((test) => (
                <div key={test.id} className="testimonial-card">
                  <p className="testimonial-quote">“{test.quote}”</p>
                  <div className="testimonial-author">
                    <span className="testimonial-name">{test.clientName}</span>
                    <span className="testimonial-type">{test.shootType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-py" aria-labelledby="faq-title">
        <div className="container" style={{ maxWidth: '960px' }}>
          <div className="section-header">
            <span className="section-label">Questions & Details</span>
            <h2 id="faq-title" className="section-title">Frequently Asked Questions</h2>
          </div>
          <Accordion items={faqs} />
        </div>
      </section>

      {/* Final Prompt / CTA */}
      <section className="section-py section-dark" aria-label="Book your session">
        <div className="container" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <span className="hero-badge" style={{ margin: '0 auto 1.5rem', display: 'inline-flex' }}>
            <Sparkles size={14} aria-hidden="true" />
            <span>Begin Your Creative Journey</span>
          </span>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', marginBottom: '1.25rem' }}>
            Ready to create something memorable?
          </h2>
          <p style={{ color: 'var(--text-light-secondary)', fontSize: '1.15rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
            Accepting commissions for editorial portraits, birthday celebrations, weddings, and commercial campaigns in Lagos and worldwide.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/enquire" className="btn btn-light">
              <span>Submit Shoot Enquiry</span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(siteSettings.whatsappPrefillText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-light"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>Direct WhatsApp Chat</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};
