export interface ProjectImage {
  id: string;
  src: string;
  thumbSrc?: string;
  webpSrcSet?: string;
  jpgSrcSet?: string;
  lightboxWebp?: string;
  lightboxJpg?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  focalPoint?: string;
  isCover?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: 'Portraits' | 'Birthday & Milestones' | 'Editorial' | 'Events' | 'Commercial';
  summary: string;
  coverImage: ProjectImage;
  images: ProjectImage[];
  details?: {
    date?: string;
    location?: string;
    client?: string;
    credits?: string[];
  };
  featured: boolean;
  published: boolean;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  categoryTag: string;
  description: string;
  targetAudience: string;
  whatToExpect: string;
  startingPrice?: string;
  inclusions: string[];
  displayOrder: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  shootType: string;
  displayOrder: number;
  permissionApproved: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export interface SiteSettings {
  brandName: string;
  businessName: string;
  tagline: string;
  baseCity: string;
  serviceArea: string;
  email: string;
  whatsappNumber: string;
  whatsappFormatted: string;
  whatsappPrefillText: string;
  instagramHandle: string;
  instagramUrl: string;
  responseExpectation: string;
  availabilityDisclaimer: string;
}
