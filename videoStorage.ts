import {
  ContactConfig,
  PortfolioProject,
  ServiceItem,
  ShowreelConfig,
} from '../types/portfolio';

const DB_NAME = 'ankit_portfolio_media_db_v1';
const STORE_NAME = 'video_files';
const PROJECTS_STORAGE_KEY = 'ankit_portfolio_projects_v1';
const SHOWREEL_STORAGE_KEY = 'ankit_portfolio_showreel_v1';
const CONTACT_STORAGE_KEY = 'ankit_portfolio_contact_v1';

// Cache in-memory object URLs for IndexedDB blobs
const blobUrlCache = new Map<string, string>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves an uploaded MP4/video File into IndexedDB and returns an `idb://...` URI.
 */
export async function saveVideoFileToIDB(file: File): Promise<string> {
  const db = await openMediaDB();
  const id = `idb://video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(file, id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  const objectUrl = URL.createObjectURL(file);
  blobUrlCache.set(id, objectUrl);
  return id;
}

const FALLBACK_VIDEO_STREAM =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

/**
 * Resolves an `idb://...` URI to a playable browser Object URL.
 * Never removes videos; falls back to a valid MP4 stream if a local blob is unavailable.
 */
export async function resolveVideoUrl(videoUrl: string): Promise<string> {
  if (!videoUrl) return FALLBACK_VIDEO_STREAM;
  if (!videoUrl.startsWith('idb://')) {
    return videoUrl;
  }
  if (blobUrlCache.has(videoUrl)) {
    return blobUrlCache.get(videoUrl)!;
  }
  try {
    const db = await openMediaDB();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(videoUrl);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    if (blob) {
      const objectUrl = URL.createObjectURL(blob);
      blobUrlCache.set(videoUrl, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn('Could not resolve video from IndexedDB:', err);
  }
  return FALLBACK_VIDEO_STREAM;
}

/**
 * Retains uploaded video files in IndexedDB so videos are never removed.
 */
export async function deleteVideoFromIDB(_videoUrl: string): Promise<void> {
  // Intentionally preserved: uploaded videos are never removed from storage.
  return Promise.resolve();
}

export const DEFAULT_SHOWREEL: ShowreelConfig = {
  title: 'ANKIT — MASTER COMMERCIAL & AI VFX SHOWREEL',
  subtitle: 'A curated 60-second montage of high-retention edits, CGI brand films, and kinetic visual storytelling.',
  duration: '01:04',
  resolution: '4K UHD · 60 FPS · REC.709',
  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
};

export const DEFAULT_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-reels-1',
    title: 'Velocity Streetwear — High-Retention Viral Reel',
    category: 'Instagram Reels',
    client: 'KINETIX APPAREL',
    year: '2026',
    duration: '00:28',
    aspectRatio: '9:16',
    description:
      'Hyper-synced speed ramps, custom SFX risers, rhythmic typography hooks, and match-cut transitions engineered for 85%+ 3-second hook retention.',
    tools: ['Premiere Pro', 'After Effects', 'Soundly SFX'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    featured: true,
    createdAt: 1760000001000,
  },
  {
    id: 'proj-brand-1',
    title: 'Chronos Obsidian — Luxury Timepiece Launch Film',
    category: 'Brand Advertisements',
    client: 'AETHER HOROLOGY',
    year: '2026',
    duration: '00:45',
    aspectRatio: '16:9',
    description:
      'Macro product cinematography grade, custom sub-bass sound design, and razor-sharp editorial pacing for a global flagship campaign.',
    tools: ['DaVinci Resolve', 'After Effects', 'Cinema 4D'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    featured: true,
    createdAt: 1760000002000,
  },
  {
    id: 'proj-aivfx-1',
    title: 'Cybernetic Bloom — Generative AI & 3D CGI Spec Ad',
    category: 'AI VFX & CGI',
    client: 'NOVA LABS',
    year: '2026',
    duration: '00:36',
    aspectRatio: '16:9',
    description:
      'Seamless fusion of live-action plates, 3D camera tracking, neural style transfers, and photorealistic CGI fluid simulations.',
    tools: ['Runway Gen-3', 'ComfyUI', 'After Effects', 'Blender'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoy.mp4',
    featured: true,
    createdAt: 1760000003000,
  },
  {
    id: 'proj-cinema-1',
    title: 'Midnight in Tokyo — Anamorphic Documentary Cut',
    category: 'Cinematic Edits',
    client: 'NOMAD COLLECTIVE',
    year: '2026',
    duration: '01:15',
    aspectRatio: '16:9',
    description:
      'Narrative storytelling driven by atmospheric foley, film halation emulation, custom 2.39:1 color pipeline, and emotional musical crescendos.',
    tools: ['DaVinci Resolve Studio', 'Dehancer Pro', 'Pro Tools'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    featured: false,
    createdAt: 1760000004000,
  },
  {
    id: 'proj-motion-1',
    title: 'Pulse Fintech — 3D Kinetic UI & Motion Identity',
    category: 'Motion Graphics',
    client: 'PULSE PAY',
    year: '2026',
    duration: '00:40',
    aspectRatio: '16:9',
    description:
      'Bespoke glassmorphic UI animations, 3D isometric card choreography, and tactile kinetic typography for a Series-B product launch.',
    tools: ['After Effects', 'Cinema 4D', 'Redshift'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    featured: false,
    createdAt: 1760000005000,
  },
  {
    id: 'proj-reels-2',
    title: 'Creator Mastery — Dynamic Split-Screen Documentary Reel',
    category: 'Instagram Reels',
    client: 'CREATOR FOUNDRY',
    year: '2026',
    duration: '00:34',
    aspectRatio: '9:16',
    description:
      'Custom motion-tracked callouts, 3D depth-map background separation, and punchy storytelling pacing that generated 4.2M organic views.',
    tools: ['After Effects', 'Premiere Pro', 'Mocha Pro'],
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
    featured: false,
    createdAt: 1760000006000,
  },
];

export const DEFAULT_CONTACT: ContactConfig = {
  instagramHandle: '@ankit.visuals',
  instagramUrl: 'https://instagram.com/',
  whatsappNumber: '919876543210',
  whatsappDisplay: '+91 98765 43210',
  email: 'ankitkushwaha082007@gmail.com',
  location: 'India · Working Worldwide (Remote)',
  availabilityText: 'Accepting Q4 Commissions & Retainers',
};

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'srv-reels',
    index: '01',
    title: 'Instagram Reels Editing',
    categoryMatch: 'Instagram Reels',
    tagline: 'Engineered for retention, algorithmic reach, and visual authority.',
    description:
      'Transform raw talking-head or lifestyle footage into scroll-stopping vertical cinema. Complete with dynamic motion-tracked captions, custom SFX layering, speed ramps, and B-roll compositing.',
    deliverables: [
      'Hook engineering within first 2.5 seconds',
      'Bespoke kinetic typography & depth masking',
      'Multi-layered sound design & audio mastering',
      '9:16 1080p/4K 60fps high-bitrate MP4 delivery',
    ],
    turnaround: '24 – 48 Hours',
    formats: '9:16 Vertical (Reels / Shorts / TikTok)',
  },
  {
    id: 'srv-brand',
    index: '02',
    title: 'Brand Promotional Videos',
    categoryMatch: 'Brand Advertisements',
    tagline: 'Flagship commercial storytelling that elevates brand perception.',
    description:
      'High-impact product launches, founder stories, and performance ad creatives built to convert cold traffic into loyal customers across web, social, and broadcast channels.',
    deliverables: [
      'Narrative pacing & commercial script structuring',
      'Studio-grade color grading & skin-tone balancing',
      'Licensed commercial score & foley enhancement',
      'Multi-aspect ratio cutdowns (16:9, 1:1, 9:16)',
    ],
    turnaround: '3 – 5 Business Days',
    formats: '16:9 Widescreen · 4:5 Social · 9:16 Vertical',
  },
  {
    id: 'srv-ai-ad',
    index: '03',
    title: 'AI Advertisement Creation',
    categoryMatch: 'AI VFX & CGI',
    tagline: 'Impossible visuals produced at a fraction of traditional set costs.',
    description:
      'Harnessing cutting-edge generative AI video pipelines combined with professional compositing and color grading to build surreal, cinema-grade commercials without physical studio constraints.',
    deliverables: [
      'Custom AI concept environments & product integration',
      'Temporal consistency & frame upscaling to 4K',
      'Professional compositing, relighting & film grain',
      'Bespoke voiceover synthesis & spatial soundscape',
    ],
    turnaround: '3 – 6 Business Days',
    formats: '16:9 Cinema & 9:16 Social Cutdowns',
  },
  {
    id: 'srv-vfx',
    index: '04',
    title: 'VFX & CGI',
    categoryMatch: 'AI VFX & CGI',
    tagline: 'Seamless visual effects, 3D tracking, and CGI mixed-reality hooks.',
    description:
      'Elevate live-action shots with 3D camera tracking, CGI object integration, sky/environment replacements, clean-plating, and viral mixed-reality visual hooks.',
    deliverables: [
      '3D camera match-moving & planar rotoscoping',
      'CGI product / asset integration & shadow catching',
      'Particle simulations, energy FX & seamless transitions',
      '16-bit ACES / Rec.709 color-matched final renders',
    ],
    turnaround: '4 – 7 Business Days',
    formats: '4K UHD ProRes / High-Bitrate H.264 MP4',
  },
  {
    id: 'srv-motion',
    index: '05',
    title: 'Motion Graphics',
    categoryMatch: 'Motion Graphics',
    tagline: 'Tactile 2D/3D animation for SaaS launches, explainers, and brand systems.',
    description:
      'Precision-keyframed UI walkthroughs, kinetic typography sequences, animated logo stingers, and data visualizations crafted with custom easing curves.',
    deliverables: [
      'Custom UI/UX SaaS product choreography',
      'Bespoke 2D & 3D motion graphic systems',
      'Animated lower thirds, title cards & logo stingers',
      'Project source files or reusable MOGRT templates',
    ],
    turnaround: '3 – 5 Business Days',
    formats: '16:9 · 1:1 · 9:16 (60 FPS Smooth Motion)',
  },
];

export function loadProjectsFromStorage(): PortfolioProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROJECTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((proj: PortfolioProject, idx: number) => {
        const defaultMatch =
          DEFAULT_PROJECTS.find((d) => d.id === proj.id) ||
          DEFAULT_PROJECTS[idx % DEFAULT_PROJECTS.length];
        return {
          ...proj,
          videoUrl:
            proj.videoUrl && proj.videoUrl.trim() !== ''
              ? proj.videoUrl
              : defaultMatch.videoUrl,
        };
      });
    }
  } catch (e) {
    console.warn('Failed to read projects from localStorage:', e);
  }
  return DEFAULT_PROJECTS;
}

export function saveProjectsToStorage(projects: PortfolioProject[]): void {
  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save projects to localStorage:', e);
  }
}

export function loadShowreelFromStorage(): ShowreelConfig {
  try {
    const raw = localStorage.getItem(SHOWREEL_STORAGE_KEY);
    if (!raw) return DEFAULT_SHOWREEL;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SHOWREEL,
      ...parsed,
      videoUrl:
        parsed?.videoUrl && parsed.videoUrl.trim() !== ''
          ? parsed.videoUrl
          : DEFAULT_SHOWREEL.videoUrl,
    };
  } catch (e) {
    console.warn('Failed to read showreel from localStorage:', e);
  }
  return DEFAULT_SHOWREEL;
}

export function saveShowreelToStorage(config: ShowreelConfig): void {
  try {
    localStorage.setItem(SHOWREEL_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save showreel to localStorage:', e);
  }
}

export function loadContactFromStorage(): ContactConfig {
  try {
    const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACT;
    return { ...DEFAULT_CONTACT, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to read contact from localStorage:', e);
  }
  return DEFAULT_CONTACT;
}

export function saveContactToStorage(config: ContactConfig): void {
  try {
    localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save contact to localStorage:', e);
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}
