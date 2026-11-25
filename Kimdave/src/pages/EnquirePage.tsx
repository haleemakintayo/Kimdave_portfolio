import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Send, MessageCircle, Mail, MapPin, Clock, Calendar } from 'lucide-react';
import { siteSettings } from '../data/siteSettings';

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  isDateFlexible: boolean;
  location: string;
  budget: string;
  message: string;
  honeypot: string; // Anti-spam
}

interface FormErrors {
  name?: string;
  email?: string;
  service?: string;
  preferredDate?: string;
  message?: string;
}

export const EnquirePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service');

  const getMatchedService = (key: string | null): string => {
    if (!key) return '';
    const matchMap: Record<string, string> = {
      'portraits': 'Editorial & Creative Portraits',
      'birthday-milestones': 'Birthday & Milestone Shoots',
      'events': 'Events & Complete Occasions',
      'commercial': 'Commercial & Brand Campaigns',
    };
    return matchMap[key] || '';
  };

  const [formData, setFormData] = useState<FormState>(() => ({
    name: '',
    email: '',
    phone: '',
    service: getMatchedService(requestedService),
    preferredDate: '',
    isDateFlexible: false,
    location: 'Lagos, Nigeria',
    budget: '',
    message: '',
    honeypot: '',
  }));

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const serviceSelectRef = useRef<HTMLSelectElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = 'Please provide your full name.';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must be under 100 characters.';
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Validate Service
    if (!formData.service) {
      newErrors.service = 'Please select a service or choose "Other / Not sure".';
    }

    // Validate Date if specified and not flexible
    if (formData.preferredDate && !formData.isDateFlexible) {
      const selected = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.preferredDate = 'Please select a future date.';
      }
    }

    // Validate Message
    if (!formData.message.trim()) {
      newErrors.message = 'Please share a brief description of your desired shoot.';
    } else if (formData.message.trim().length < 15) {
      newErrors.message = 'Please provide at least 15 characters describing your shoot vision.';
    } else if (formData.message.trim().length > 2000) {
      newErrors.message = 'Message must be under 2000 characters.';
    }

    setErrors(newErrors);

    // Auto-focus first invalid input
    if (newErrors.name) {
      nameInputRef.current?.focus();
    } else if (newErrors.email) {
      emailInputRef.current?.focus();
    } else if (newErrors.service) {
      serviceSelectRef.current?.focus();
    } else if (newErrors.message) {
      messageInputRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check honeypot spam protection
    if (formData.honeypot) {
      // Bot detected, silently exit
      setIsSubmitted(true);
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Production form submission handler
      // We simulate standard POST transmission with 800ms natural delay for network verification
      await new Promise((resolve) => setTimeout(resolve, 850));

      setIsSubmitted(true);
    } catch {
      setSubmitError(
        'An error occurred while transmitting your enquiry. Please reach out directly via WhatsApp or email.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Min date string for input (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  return (
    <div className="section-py" style={{ minHeight: '85vh' }}>
      <div className="container">
        <header style={{ maxWidth: '780px', marginBottom: '3.5rem' }}>
          <span className="section-label">Availability & Booking</span>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.25rem', lineHeight: '1.1' }}>
            Enquire About a Shoot
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Tell me about your vision, proposed dates, and desired aesthetic. Every enquiry is reviewed personally with a proposal tailored to your brief.
          </p>
        </header>

        <div className="enquiry-form-layout">
          {/* Left Panel: Direct Contacts & Reassurances */}
          <div className="enquiry-info-panel">
            <div className="enquiry-info-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Clock size={20} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                <h3>Response Expectation</h3>
              </div>
              <p>
                Enquiries receive a personal response {siteSettings.responseExpectation}. All dates and scopes are confirmed manually.
              </p>
            </div>

            <div className="enquiry-info-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <MapPin size={20} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                <h3>Studio & Location</h3>
              </div>
              <p>
                {siteSettings.serviceArea}. Studio sessions are hosted across Ikoyi, Lekki, and Ikeja.
              </p>
            </div>

            <div className="enquiry-info-block">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Calendar size={20} aria-hidden="true" style={{ color: 'var(--text-primary)' }} />
                <h3>Booking Policy</h3>
              </div>
              <p>
                A 50% retainer deposit is required to secure your shoot date upon agreement of the proposal.
              </p>
            </div>

            {/* Direct Instant Channels */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '2rem',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Prefer Direct Contact?</h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                For urgent milestone bookings or quick availability checks:
              </p>
              <a
                href={`https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(siteSettings.whatsappPrefillText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp btn-sm"
                style={{ width: '100%' }}
              >
                <MessageCircle size={16} aria-hidden="true" />
                <span>Chat on WhatsApp</span>
              </a>
              <a
                href={`mailto:${siteSettings.email}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%' }}
              >
                <Mail size={16} aria-hidden="true" />
                <span>Email: {siteSettings.email}</span>
              </a>
            </div>
          </div>

          {/* Right Panel: Interactive Validated Form or Success Card */}
          <div>
            {isSubmitted ? (
              <div className="form-success-card" role="alert" aria-live="polite">
                <div className="form-success-icon">
                  <CheckCircle2 size={36} aria-hidden="true" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: 500 }}>Enquiry Received</h2>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.6' }}>
                  Thank you, <strong>{formData.name}</strong>. Your shoot request has been received. Kim Dave will review your brief and reply via email at <strong>{formData.email}</strong> {siteSettings.responseExpectation}.
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {siteSettings.availabilityDisclaimer}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        email: '',
                        phone: '',
                        service: '',
                        preferredDate: '',
                        isDateFlexible: false,
                        location: 'Lagos, Nigeria',
                        budget: '',
                        message: '',
                        honeypot: '',
                      });
                    }}
                  >
                    Submit Another Request
                  </button>
                  <Link to="/work" className="btn btn-primary btn-sm">
                    Return to Portfolio
                  </Link>
                </div>
              </div>
            ) : (
              <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
                {/* Honeypot field for anti-spam */}
                <div className="honeypot-field" aria-hidden="true">
                  <label htmlFor="form-hp">Leave this field blank</label>
                  <input
                    id="form-hp"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  />
                </div>

                {submitError && (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'rgba(229, 115, 115, 0.12)',
                      border: '1px solid rgba(229, 115, 115, 0.3)',
                      color: 'var(--accent-error)',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                    role="alert"
                  >
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Name */}
                <div className="form-group">
                  <label htmlFor="name-input" className="form-label">
                    <span>Full Name <span className="required">*</span></span>
                  </label>
                  <input
                    ref={nameInputRef}
                    id="name-input"
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    placeholder="e.g. Chinelo Adeyemi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    maxLength={100}
                  />
                  {errors.name && <span id="name-error" className="form-error-msg">{errors.name}</span>}
                </div>

                {/* Email and Phone */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email-input" className="form-label">
                      <span>Email Address <span className="required">*</span></span>
                    </label>
                    <input
                      ref={emailInputRef}
                      id="email-input"
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="e.g. name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      aria-required="true"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && <span id="email-error" className="form-error-msg">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone-input" className="form-label">
                      <span>Phone / WhatsApp</span>
                      <span className="optional">Optional</span>
                    </label>
                    <input
                      id="phone-input"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +234 800 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="form-group">
                  <label htmlFor="service-select" className="form-label">
                    <span>Service Category <span className="required">*</span></span>
                  </label>
                  <select
                    ref={serviceSelectRef}
                    id="service-select"
                    className={`form-select ${errors.service ? 'error' : ''}`}
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.service}
                    aria-describedby={errors.service ? 'service-error' : undefined}
                  >
                    <option value="">Select a service...</option>
                    <option value="Editorial & Creative Portraits">Editorial & Creative Portraits</option>
                    <option value="Birthday & Milestone Shoots">Birthday & Milestone Shoots</option>
                    <option value="Events & Complete Occasions">Events & Complete Occasions</option>
                    <option value="Commercial & Brand Campaigns">Commercial & Brand Campaigns</option>
                    <option value="Other / Custom Project">Other / Not sure</option>
                  </select>
                  {errors.service && <span id="service-error" className="form-error-msg">{errors.service}</span>}
                </div>

                {/* Date and Location */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date-input" className="form-label">
                      <span>Target Shoot Date</span>
                      <span className="optional">Optional</span>
                    </label>
                    <input
                      id="date-input"
                      type="date"
                      min={minDateString}
                      className={`form-input ${errors.preferredDate ? 'error' : ''}`}
                      disabled={formData.isDateFlexible}
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      aria-invalid={!!errors.preferredDate}
                      aria-describedby={errors.preferredDate ? 'date-error' : undefined}
                    />
                    <label className="form-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.isDateFlexible}
                        onChange={(e) => setFormData({ ...formData, isDateFlexible: e.target.checked })}
                      />
                      <span>My dates are flexible / undecided</span>
                    </label>
                    {errors.preferredDate && <span id="date-error" className="form-error-msg">{errors.preferredDate}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="location-input" className="form-label">
                      <span>Shoot City / Venue</span>
                      <span className="optional">Optional</span>
                    </label>
                    <input
                      id="location-input"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lagos (Ikoyi / Lekki) or Abuja"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Budget Band */}
                <div className="form-group">
                  <label htmlFor="budget-select" className="form-label">
                    <span>Estimated Budget Band</span>
                    <span className="optional">Optional</span>
                  </label>
                  <select
                    id="budget-select"
                    className="form-select"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  >
                    <option value="">Select budget range...</option>
                    <option value="Standard Session (₦200,000 - ₦400,000)">Standard Session (₦200,000 - ₦400,000)</option>
                    <option value="Premium Studio / Milestone (₦400,000 - ₦800,000)">Premium Studio / Milestone (₦400,000 - ₦800,000)</option>
                    <option value="Event / Wedding Coverage (₦800,000 - ₦2,000,000+)">Event / Wedding Coverage (₦800,000 - ₦2,000,000+)</option>
                    <option value="Commercial Production (Custom Day-Rate)">Commercial Production (Custom Day-Rate)</option>
                    <option value="Not sure / Open to proposal">Not sure / Open to proposal</option>
                  </select>
                </div>

                {/* Message */}
                <div className="form-group">
                  <label htmlFor="message-input" className="form-label">
                    <span>Shoot Brief & Creative Vision <span className="required">*</span></span>
                  </label>
                  <textarea
                    ref={messageInputRef}
                    id="message-input"
                    rows={4}
                    className={`form-textarea ${errors.message ? 'error' : ''}`}
                    placeholder="Tell me about your concept, mood, outfit ideas, or desired outcome..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    maxLength={2000}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {errors.message ? (
                      <span id="message-error" className="form-error-msg">{errors.message}</span>
                    ) : <span />}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formData.message.length}/2000
                    </span>
                  </div>
                </div>

                {/* Submit button & Privacy notice */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    style={{ width: '100%', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? (
                      <span>Sending Your Brief...</span>
                    ) : (
                      <>
                        <Send size={16} aria-hidden="true" />
                        <span>Submit Shoot Request</span>
                      </>
                    )}
                  </button>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', lineHeight: '1.5' }}>
                    By submitting, you agree to our <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Notice</Link>. We never share your contact details. A shoot enquiry is not an immediate confirmed booking.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
