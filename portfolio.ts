export type PortfolioCategory =
  | 'Instagram Reels'
  | 'Brand Advertisements'
  | 'AI VFX & CGI'
  | 'Cinematic Edits'
  | 'Motion Graphics';

export const PORTFOLIO_CATEGORIES: PortfolioCategory[] = [
  'Instagram Reels',
  'Brand Advertisements',
  'AI VFX & CGI',
  'Cinematic Edits',
  'Motion Graphics',
];

export interface PortfolioProject {
  id: string;
  title: string;
  category: PortfolioCategory;
  client: string;
  year: string;
  duration: string;
  aspectRatio: '16:9' | '9:16';
  description: string;
  tools: string[];
  /**
   * Supports:
   * - Direct MP4/WebM URL (https://...)
   * - IndexedDB persisted local MP4 file (idb://...)
   * - Real-time procedural cinema stream (synth://...)
   * - Empty string ("") when awaiting custom MP4 upload (renders beautiful placeholder)
   */
  videoUrl: string;
  customFileName?: string;
  customFileSize?: number;
  featured?: boolean;
  createdAt: number;
}

export interface ShowreelConfig {
  title: string;
  subtitle: string;
  duration: string;
  resolution: string;
  videoUrl: string;
  customFileName?: string;
  customFileSize?: number;
}

export interface ContactConfig {
  instagramHandle: string;
  instagramUrl: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  location: string;
  availabilityText: string;
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  categoryMatch: PortfolioCategory;
  tagline: string;
  description: string;
  deliverables: string[];
  turnaround: string;
  formats: string;
}
