import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Edit3,
  FolderKanban,
  HardDrive,
  Link2,
  Plus,
  RotateCcw,
  Save,
  Upload,
  X,
} from 'lucide-react';
import {
  ContactConfig,
  PORTFOLIO_CATEGORIES,
  PortfolioCategory,
  PortfolioProject,
  ShowreelConfig,
} from '../types/portfolio';
import {
  DEFAULT_PROJECTS,
  formatBytes,
  resolveVideoUrl,
  saveVideoFileToIDB,
} from '../services/videoStorage';
import { GoogleDrivePanel } from './GoogleDrivePanel';

export type ManagerTab = 'form' | 'list' | 'drive' | 'showreel' | 'contact';

interface ProjectManagerModalProps {
  isOpen: boolean;
  initialTab: ManagerTab;
  editingProject: PortfolioProject | null;
  defaultCategory?: PortfolioCategory;
  projects: PortfolioProject[];
  showreel: ShowreelConfig;
  contact: ContactConfig;
  onClose: () => void;
  onSaveProject: (project: PortfolioProject) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectEditProject: (project: PortfolioProject) => void;
  onStartNewProject: (category?: PortfolioCategory) => void;
  onClearAllDemoVideos: () => void;
  onRestoreDefaults: () => void;
  onSaveShowreel: (config: ShowreelConfig) => void;
  onSaveContact: (config: ContactConfig) => void;
  onRestoreBackupData: (data: {
    projects?: PortfolioProject[];
    showreel?: ShowreelConfig;
    contact?: ContactConfig;
  }) => void;
  onStatusToast: (msg: string) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  initialTab,
  editingProject,
  defaultCategory,
  projects,
  showreel,
  contact,
  onClose,
  onSaveProject,
  onSelectEditProject,
  onStartNewProject,
  onRestoreDefaults,
  onSaveShowreel,
  onSaveContact,
  onRestoreBackupData,
  onStatusToast,
}) => {
  const [activeTab, setActiveTab] = useState<ManagerTab>(initialTab);

  // Project Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PortfolioCategory>('Instagram Reels');
  const [client, setClient] = useState('');
  const [year, setYear] = useState('2026');
  const [duration, setDuration] = useState('00:30');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [description, setDescription] = useState('');
  const [toolsText, setToolsText] = useState(
    'After Effects, Premiere Pro, DaVinci Resolve'
  );
  const [videoUrl, setVideoUrl] = useState(DEFAULT_PROJECTS[0].videoUrl);
  const [customFileName, setCustomFileName] = useState<string | undefined>(
    undefined
  );
  const [customFileSize, setCustomFileSize] = useState<number | undefined>(
    undefined
  );
  const [previewSrc, setPreviewSrc] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Showreel Form State
  const [reelTitle, setReelTitle] = useState(showreel.title);
  const [reelSubtitle, setReelSubtitle] = useState(showreel.subtitle);
  const [reelResolution, setReelResolution] = useState(showreel.resolution);
  const [reelDuration, setReelDuration] = useState(showreel.duration);
  const [reelVideoUrl, setReelVideoUrl] = useState(showreel.videoUrl);
  const [reelFileName, setReelFileName] = useState<string | undefined>(
    showreel.customFileName
  );
  const [reelFileSize, setReelFileSize] = useState<number | undefined>(
    showreel.customFileSize
  );
  const [reelSavedBanner, setReelSavedBanner] = useState(false);

  // Contact Form State
  const [igHandle, setIgHandle] = useState(contact.instagramHandle);
  const [igUrl, setIgUrl] = useState(contact.instagramUrl);
  const [waNumber, setWaNumber] = useState(contact.whatsappNumber);
  const [waDisplay, setWaDisplay] = useState(contact.whatsappDisplay);
  const [emailAddr, setEmailAddr] = useState(contact.email);
  const [locationText, setLocationText] = useState(contact.location);
  const [availabilityText, setAvailabilityText] = useState(
    contact.availabilityText
  );
  const [contactSavedBanner, setContactSavedBanner] = useState(false);

  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const showreelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  // Populate Project Form when editingProject or defaultCategory changes
  useEffect(() => {
    if (editingProject) {
      setTitle(editingProject.title);
      setCategory(editingProject.category);
      setClient(editingProject.client);
      setYear(editingProject.year);
      setDuration(editingProject.duration);
      setAspectRatio(editingProject.aspectRatio);
      setDescription(editingProject.description);
      setToolsText(editingProject.tools.join(', '));
      setVideoUrl(editingProject.videoUrl || DEFAULT_PROJECTS[0].videoUrl);
      setCustomFileName(editingProject.customFileName);
      setCustomFileSize(editingProject.customFileSize);
    } else {
      const cat = defaultCategory || 'Instagram Reels';
      setTitle('');
      setCategory(cat);
      setClient('COMMERCIAL CLIENT');
      setYear('2026');
      setDuration('00:35');
      setAspectRatio(cat === 'Instagram Reels' ? '9:16' : '16:9');
      setDescription('');
      setToolsText('After Effects, Premiere Pro, DaVinci Resolve');
      setVideoUrl(DEFAULT_PROJECTS[0].videoUrl);
      setCustomFileName(undefined);
      setCustomFileSize(undefined);
    }
  }, [editingProject, defaultCategory, isOpen]);

  // Sync Showreel state
  useEffect(() => {
    setReelTitle(showreel.title);
    setReelSubtitle(showreel.subtitle);
    setReelResolution(showreel.resolution);
    setReelDuration(showreel.duration);
    setReelVideoUrl(showreel.videoUrl);
    setReelFileName(showreel.customFileName);
    setReelFileSize(showreel.customFileSize);
  }, [showreel]);

  // Sync Contact state
  useEffect(() => {
    setIgHandle(contact.instagramHandle);
    setIgUrl(contact.instagramUrl);
    setWaNumber(contact.whatsappNumber);
    setWaDisplay(contact.whatsappDisplay);
    setEmailAddr(contact.email);
    setLocationText(contact.location);
    setAvailabilityText(contact.availabilityText);
  }, [contact]);

  // Resolve preview video URL for project form
  useEffect(() => {
    let active = true;
    resolveVideoUrl(videoUrl).then((url) => {
      if (active) setPreviewSrc(url);
    });
    return () => {
      active = false;
    };
  }, [videoUrl]);

  if (!isOpen) return null;

  /**
   * Saves an uploaded or Drive-imported video to IndexedDB AND immediately persists the project
   * so that the video is never lost even if the modal is closed immediately.
   */
  const applyVideoFileToProjectForm = async (file: File) => {
    setIsUploadingFile(true);
    try {
      const idbUri = await saveVideoFileToIDB(file);
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ');
      const nextTitle = title.trim() || cleanName || 'Visual Production';

      setVideoUrl(idbUri);
      setCustomFileName(file.name);
      setCustomFileSize(file.size);
      if (!title.trim()) {
        setTitle(nextTitle);
      }

      const tools = toolsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const autoSavedProject: PortfolioProject = {
        id: editingProject ? editingProject.id : `proj_${Date.now()}`,
        title: nextTitle,
        category,
        client: client.trim() || 'STUDIO CLIENT',
        year: year.trim() || '2026',
        duration: duration.trim() || '00:30',
        aspectRatio,
        description:
          description.trim() ||
          'High-retention visual edit with custom sound design, color grading, and seamless transitions.',
        tools: tools.length > 0 ? tools : ['After Effects', 'Premiere Pro'],
        videoUrl: idbUri,
        customFileName: file.name,
        customFileSize: file.size,
        createdAt: editingProject ? editingProject.createdAt : Date.now(),
      };

      onSaveProject(autoSavedProject);
      onSelectEditProject(autoSavedProject);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const applyVideoFileToShowreelForm = async (file: File) => {
    setIsUploadingFile(true);
    try {
      const idbUri = await saveVideoFileToIDB(file);
      setReelVideoUrl(idbUri);
      setReelFileName(file.name);
      setReelFileSize(file.size);
      onSaveShowreel({
        title: reelTitle.trim() || 'ANKIT — OFFICIAL SHOWREEL',
        subtitle: reelSubtitle.trim(),
        resolution: reelResolution.trim() || '4K UHD · 60 FPS',
        duration: reelDuration.trim() || '01:00',
        videoUrl: idbUri,
        customFileName: file.name,
        customFileSize: file.size,
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleProjectFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await applyVideoFileToProjectForm(file);
  };

  const handleShowreelFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await applyVideoFileToShowreelForm(file);
  };

  const handleSaveProjectForm = (e: React.FormEvent) => {
    e.preventDefault();
    const tools = toolsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newProject: PortfolioProject = {
      id: editingProject ? editingProject.id : `proj_${Date.now()}`,
      title: title.trim() || 'Untitled Visual Edit',
      category,
      client: client.trim() || 'STUDIO CLIENT',
      year: year.trim() || '2026',
      duration: duration.trim() || '00:30',
      aspectRatio,
      description:
        description.trim() ||
        'High-retention visual edit with custom sound design, color grading, and seamless transitions.',
      tools: tools.length > 0 ? tools : ['After Effects', 'Premiere Pro'],
      videoUrl: videoUrl.trim() || DEFAULT_PROJECTS[0].videoUrl,
      customFileName,
      customFileSize,
      createdAt: editingProject ? editingProject.createdAt : Date.now(),
    };

    onSaveProject(newProject);
    setActiveTab('list');
  };

  const handleSaveShowreelForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveShowreel({
      title: reelTitle.trim() || 'ANKIT — OFFICIAL SHOWREEL',
      subtitle: reelSubtitle.trim(),
      resolution: reelResolution.trim() || '4K UHD · 60 FPS',
      duration: reelDuration.trim() || '01:00',
      videoUrl: reelVideoUrl.trim() || showreel.videoUrl,
      customFileName: reelFileName,
      customFileSize: reelFileSize,
    });
    setReelSavedBanner(true);
    setTimeout(() => setReelSavedBanner(false), 3000);
  };

  const handleSaveContactForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveContact({
      instagramHandle: igHandle.trim() || '@ankit.visuals',
      instagramUrl: igUrl.trim() || 'https://instagram.com/',
      whatsappNumber: waNumber.trim() || '919876543210',
      whatsappDisplay: waDisplay.trim() || '+91 98765 43210',
      email: emailAddr.trim() || 'ankitkushwaha082007@gmail.com',
      location: locationText.trim() || 'India · Remote Worldwide',
      availabilityText: availabilityText.trim() || 'Accepting Commissions',
    });
    setContactSavedBanner(true);
    setTimeout(() => setContactSavedBanner(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Project & Portfolio Studio Manager"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl rounded-2xl bg-[#121212] border border-white/15 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#080808] border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA]">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Ankit Studio — Video, Google Drive &amp; Portfolio Manager
              </h2>
              <p className="text-xs text-[#999999]">
                Upload MP4 files, import directly from Google Drive, or manage portfolio categories
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close manager"
            className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.14] text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 px-6 py-3 bg-[#0c0c0e] border-b border-white/[0.08] overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-[#A78BFA] text-[#080808]'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            All Portfolio Projects ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'form'
                ? 'bg-[#A78BFA] text-[#080808]'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            {editingProject
              ? `Edit: ${editingProject.title.slice(0, 18)}...`
              : '+ Add / Upload Project'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-[#A78BFA] text-[#080808]'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Google Drive Library</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('showreel')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'showreel'
                ? 'bg-[#A78BFA] text-[#080808]'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Master Showreel MP4
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'contact'
                ? 'bg-[#A78BFA] text-[#080808]'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Contact Links
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: ALL PROJECTS LIST */}
          {activeTab === 'list' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onStartNewProject();
                      setActiveTab('form');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Video Project</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('drive')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span>Import from Google Drive</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onRestoreDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] text-[#999999] hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Default Projects</span>
                </button>
              </div>

              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-[#080808] border border-white/[0.08] hover:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#999999] mb-1">
                        <span className="text-[#A78BFA]">{proj.category}</span>
                        <span>·</span>
                        <span>{proj.aspectRatio}</span>
                        <span>·</span>
                        <span>{proj.duration}</span>
                        <span>·</span>
                        <span>
                          {proj.customFileName
                            ? `MP4: ${proj.customFileName}`
                            : 'Active Video Stream'}
                        </span>
                      </div>
                      <h4 className="font-display text-base font-bold text-white truncate">
                        {proj.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectEditProject(proj);
                          setActiveTab('form');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit / Update MP4</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD / EDIT PROJECT FORM */}
          {activeTab === 'form' && (
            <form onSubmit={handleSaveProjectForm} className="space-y-5">
              {/* Direct MP4 File Upload Box + Google Drive Picker + URL Input */}
              <div className="p-5 rounded-xl bg-[#080808] border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      1. Video Source (Device MP4, Google Drive, or Video URL)
                    </h3>
                    <p className="text-xs text-[#999999]">
                      Uploaded or Drive-imported MP4 files are automatically saved and cached in
                      IndexedDB for continuous looping playback.
                    </p>
                  </div>

                  <input
                    ref={projectFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleProjectFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => projectFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>
                        {isUploadingFile ? 'Saving MP4...' : 'Choose Local MP4'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('drive')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 text-[#A78BFA]" />
                      <span>Pick from Google Drive</span>
                    </button>
                  </div>
                </div>

                {customFileName && (
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-xs">
                    <span className="text-white font-mono truncate">
                      Active MP4: {customFileName}{' '}
                      {customFileSize ? `(${formatBytes(customFileSize)})` : ''}
                    </span>
                    <span className="text-[#A78BFA] font-semibold shrink-0">
                      Saved to Portfolio
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#999999] mb-1.5">
                    Or Paste Direct MP4 / WebM Video URL:
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-[#999999] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={videoUrl.startsWith('idb://') ? '' : videoUrl}
                      onChange={(e) => {
                        setVideoUrl(e.target.value);
                        setCustomFileName(undefined);
                        setCustomFileSize(undefined);
                      }}
                      placeholder="https://example.com/my-project-render.mp4"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* Live Video Preview inside Form */}
                {previewSrc && (
                  <div className="pt-2">
                    <div className="text-xs font-mono text-[#999999] mb-1.5">
                      LIVE VIDEO PREVIEW
                    </div>
                    <div className="rounded-xl overflow-hidden bg-black border border-white/10 max-h-48 aspect-video">
                      <video
                        src={previewSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        controls
                        className="w-full h-full max-h-48 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Project Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nike Air Max — AI CGI Spec Commercial"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const cat = e.target.value as PortfolioCategory;
                      setCategory(cat);
                      if (cat === 'Instagram Reels') setAspectRatio('9:16');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  >
                    {PORTFOLIO_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Client / Brand
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="APEX BRAND"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Year
                  </label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="00:45"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) =>
                      setAspectRatio(e.target.value as '16:9' | '9:16')
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  >
                    <option value="16:9">16:9 Widescreen</option>
                    <option value="9:16">9:16 Vertical Reel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/85 mb-1.5">
                  Creative Breakdown &amp; Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the editing pacing, sound design, VFX pipeline, or retention results..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/85 mb-1.5">
                  Software &amp; AI Tools Used (comma-separated)
                </label>
                <input
                  type="text"
                  value={toolsText}
                  onChange={(e) => setToolsText(e.target.value)}
                  placeholder="After Effects, DaVinci Resolve, Runway Gen-3, Blender"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {editingProject
                      ? 'Save Project Changes'
                      : 'Save Project to Portfolio'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GOOGLE DRIVE LIBRARY & SYNC */}
          {activeTab === 'drive' && (
            <GoogleDrivePanel
              projects={projects}
              showreel={showreel}
              contact={contact}
              onImportVideoForProject={async (file) => {
                await applyVideoFileToProjectForm(file);
                setActiveTab('form');
                onStatusToast(`Added "${file.name}" from Google Drive to your portfolio`);
              }}
              onImportVideoForShowreel={async (file) => {
                await applyVideoFileToShowreelForm(file);
                setActiveTab('showreel');
                onStatusToast(`Set "${file.name}" from Google Drive as Master Showreel`);
              }}
              onRestoreBackupData={onRestoreBackupData}
              onStatusToast={onStatusToast}
            />
          )}

          {/* TAB 4: MASTER SHOWREEL SETTINGS */}
          {activeTab === 'showreel' && (
            <form onSubmit={handleSaveShowreelForm} className="space-y-5">
              <div className="p-5 rounded-xl bg-[#080808] border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Master Showreel MP4 Video
                    </h3>
                    <p className="text-xs text-[#999999]">
                      Upload your main 16:9 showreel MP4, pick from Google Drive, or paste a direct
                      video URL.
                    </p>
                  </div>

                  <input
                    ref={showreelFileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleShowreelFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => showreelFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Showreel MP4</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('drive')}
                      className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
                    >
                      <HardDrive className="w-4 h-4 text-[#A78BFA]" />
                      <span>Pick from Google Drive</span>
                    </button>
                  </div>
                </div>

                {reelFileName && (
                  <div className="px-3.5 py-2 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-xs text-white font-mono">
                    Active Showreel File: {reelFileName}{' '}
                    {reelFileSize ? `(${formatBytes(reelFileSize)})` : ''}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#999999] mb-1.5">
                    Or Direct Showreel MP4 URL:
                  </label>
                  <input
                    type="text"
                    value={reelVideoUrl.startsWith('idb://') ? '' : reelVideoUrl}
                    onChange={(e) => {
                      setReelVideoUrl(e.target.value);
                      setReelFileName(undefined);
                      setReelFileSize(undefined);
                    }}
                    placeholder="https://example.com/ankit-showreel-2026.mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121212] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Showreel Headline
                  </label>
                  <input
                    type="text"
                    value={reelTitle}
                    onChange={(e) => setReelTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Resolution &amp; Frame Rate Spec
                  </label>
                  <input
                    type="text"
                    value={reelResolution}
                    onChange={(e) => setReelResolution(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/85 mb-1.5">
                  Showreel Subtitle
                </label>
                <input
                  type="text"
                  value={reelSubtitle}
                  onChange={(e) => setReelSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                />
              </div>

              {reelSavedBanner && (
                <div className="p-3 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/40 text-xs text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#A78BFA]" />
                  <span>Showreel configuration updated!</span>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-white/[0.08]">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Showreel Settings</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: CONTACT LINKS SETTINGS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveContactForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Instagram Handle Display
                  </label>
                  <input
                    type="text"
                    value={igHandle}
                    onChange={(e) => setIgHandle(e.target.value)}
                    placeholder="@ankit.visuals"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Instagram Profile URL
                  </label>
                  <input
                    type="url"
                    value={igUrl}
                    onChange={(e) => setIgUrl(e.target.value)}
                    placeholder="https://instagram.com/ankit.visuals"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    WhatsApp Display Number
                  </label>
                  <input
                    type="text"
                    value={waDisplay}
                    onChange={(e) => setWaDisplay(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    WhatsApp Country Code + Number (digits only for wa.me link)
                  </label>
                  <input
                    type="text"
                    value={waNumber}
                    onChange={(e) => setWaNumber(e.target.value)}
                    placeholder="919876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Direct Email Address
                  </label>
                  <input
                    type="email"
                    value={emailAddr}
                    onChange={(e) => setEmailAddr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-1.5">
                    Availability Status Note
                  </label>
                  <input
                    type="text"
                    value={availabilityText}
                    onChange={(e) => setAvailabilityText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white"
                  />
                </div>
              </div>

              {contactSavedBanner && (
                <div className="p-3 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/40 text-xs text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#A78BFA]" />
                  <span>Contact details updated!</span>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-white/[0.08]">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Contact Details</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
