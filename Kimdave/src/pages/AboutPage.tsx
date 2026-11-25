import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Camera, Sparkles, MessageCircle } from 'lucide-react';
import { siteSettings } from '../data/siteSettings';
import { ResponsivePhoto } from '../components/ui/ResponsivePhoto';
import { toProjectImage } from '../data/generated/curatedAssets';

const mainPortrait = toProjectImage('about-main', {
  alt: 'Studio portrait of Ayinde David Oluwatimileyin (Kim Dave) wearing a deep crimson suit and grey patterned tie against a dark espresso backdrop',
  focalPoint: '50% 18%',
  isCover: true,
});

const studioBtsPhoto = toProjectImage('about-studio-bts', {
  alt: 'Ayinde David Oluwatimileyin smiling candidly during a studio lighting check beneath an overhead softbox',
  focalPoint: '50% 22%',
});

const galleryPortraitPhoto = toProjectImage('about-gallery-bw', {
  alt: 'Black-and-white photograph of Ayinde David Oluwatimileyin standing in profile studying a mosaic exhibition wall of Nigerian portraits',
  focalPoint: '50% 42%',
});

export const AboutPage: React.FC = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About Ayinde David Oluwatimileyin (Kim Dave) | Kim Dave Photography';
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="section-py" style={{ minHeight: '80vh' }}>
      <div className="container">
        {/* Editorial Introduction Header */}
        <header style={{ maxWidth: '840px', marginBottom: '3.5rem' }}>
          <span className="section-label">About Kim Dave</span>
          <h1 style={{ fontSize: 'clamp(2.4rem, 5vw, 4.1rem)', marginBottom: '1.5rem', lineHeight: '1.08' }}>
            Ayinde David Oluwatimileyin, the eye behind Kim Dave Photography.
          </h1>
          <p style={{ fontSize: '1.22rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Based in Lagos, Nigeria, David shoots editorial portraits, milestone sessions, brand campaigns, and live events. Every shoot pairs calm direction on set with natural, true-to-life colour grading.
          </p>
        </header>

        {/* Main Portrait and Biography */}
        <div className="about-teaser" style={{ marginBottom: '5rem' }}>
          <div className="about-teaser-img-wrapper">
            <ResponsivePhoto
              image={mainPortrait}
              sizes="(min-width: 1024px) 560px, (min-width: 840px) 46vw, 94vw"
              className="about-teaser-img"
              loading="eager"
              style={{ objectPosition: mainPortrait.focalPoint }}
            />
          </div>

          <div className="about-teaser-content">
            <h2 style={{ fontSize: '2rem', lineHeight: '1.2' }}>
              Direction that puts you at ease in front of the camera
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.7' }}>
              <p>
                Most people walk onto a set unsure how to stand or what to do with their hands. Ayinde David Oluwatimileyin, known professionally as Kim Dave, starts every session by taking that pressure off. Before a single shutter clicks, he talks through your wardrobe, lighting mood, and references so you know how the shoot will unfold.
              </p>
              <p>
                Working out of Lagos, David moves comfortably between controlled studio photography and fast-moving live occasions. His studio calendar spans editorial portraiture, birthday shoots, corporate headshots, family milestones, and commercial campaigns. Outside the studio, he documents weddings, concerts, graduations, and cultural celebrations with the same attention to posture, expression, and light.
              </p>
              <p>
                Spending time around portrait archives and exhibition spaces keeps his eye anchored on photographs that hold up years later. Skin texture, woven fabrics, sharp tailoring, and monochrome contrast keep their depth cleanly across prints and screens. Every enquiry is scoped and confirmed personally with David before a date is locked in.
              </p>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <Link to="/enquire" className="btn btn-primary">
                <span>Check Date Availability</span>
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>

        {/* Studio, Sessions & Finishing Approach */}
        <div className="about-pillars-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <MapPin size={20} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Location & Travel</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Based in Lagos, Nigeria, with studio and on-location sessions across the city. Available for commissioned travel across Nigeria and internationally by arrangement.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Camera size={20} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Guided Sessions</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Pre-shoot planning on wardrobe and visual references, straightforward posing cues during the shoot, and real-time review so you stay relaxed from the first frame to the last.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} style={{ color: 'var(--text-primary)' }} aria-hidden="true" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>True-to-Life Finishing</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Every selected photograph is individually colour-graded and retouched to preserve natural skin texture, shadow depth, and faithful wardrobe tones. Deliverables and turnaround are confirmed personally with each brief.
            </p>
          </div>
        </div>

        {/* Behind the Brand: Studio & Visual Roots */}
        <section aria-label="In the Studio and Beyond">
          <div className="section-header">
            <span className="section-label">Behind the Brand</span>
            <h2 className="section-title">In the Studio and Beyond</h2>
          </div>

          <div className="about-story-grid">
            <figure className="about-story-card">
              <div className="about-story-media">
                <ResponsivePhoto
                  image={studioBtsPhoto}
                  sizes="(min-width: 768px) 580px, 94vw"
                  className="about-story-img"
                  loading="lazy"
                  style={{ objectPosition: studioBtsPhoto.focalPoint }}
                />
              </div>
              <figcaption className="about-story-caption">
                Between lighting checks under the studio softbox, keeping the atmosphere light before stepping behind the camera.
              </figcaption>
            </figure>

            <figure className="about-story-card">
              <div className="about-story-media">
                <ResponsivePhoto
                  image={galleryPortraitPhoto}
                  sizes="(min-width: 768px) 580px, 94vw"
                  className="about-story-img"
                  loading="lazy"
                  style={{ objectPosition: galleryPortraitPhoto.focalPoint }}
                />
              </div>
              <figcaption className="about-story-caption">
                Studying a mosaic wall of classic Nigerian portraits. Looking closely at archival portraiture informs David’s framing and black-and-white work.
              </figcaption>
            </figure>
          </div>
        </section>

        {/* Final CTA */}
        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Planning a portrait session, campaign, or upcoming event?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Share your shoot type, preferred date, and city. David reviews every enquiry personally and replies within 24 to 48 hours.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/enquire" className="btn btn-primary">
              <span>Send Your Shoot Brief</span>
            </Link>
            <a
              href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(siteSettings.whatsappPrefillText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
            >
              <MessageCircle size={16} aria-hidden="true" />
              <span>Message David on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
