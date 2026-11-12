import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ShowreelSection } from './components/ShowreelSection';
import { PortfolioSection } from './components/PortfolioSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import {
  ManagerTab,
  ProjectManagerModal,
} from './components/ProjectManagerModal';
import { VideoLightboxModal } from './components/VideoLightboxModal';
import {
  ContactConfig,
  PortfolioCategory,
  PortfolioProject,
  ShowreelConfig,
} from './types/portfolio';
import {
  DEFAULT_PROJECTS,
  DEFAULT_SHOWREEL,
  deleteVideoFromIDB,
  loadContactFromStorage,
  loadProjectsFromStorage,
  loadShowreelFromStorage,
  saveContactToStorage,
  saveProjectsToStorage,
  saveShowreelToStorage,
  saveVideoFileToIDB,
} from './services/videoStorage';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<PortfolioProject[]>(() =>
    loadProjectsFromStorage()
  );
  const [showreel, setShowreel] = useState<ShowreelConfig>(() =>
    loadShowreelFromStorage()
  );
  const [contact, setContact] = useState<ContactConfig>(() =>
    loadContactFromStorage()
  );

  const [activeCategory, setActiveCategory] = useState<'All' | PortfolioCategory>('All');
  const [selectedServiceInquiry, setSelectedServiceInquiry] = useState<string>('');

  // Studio Manager Modal State
  const [managerOpen, setManagerOpen] = useState<boolean>(false);
  const [managerTab, setManagerTab] = useState<ManagerTab>('list');
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [defaultNewCategory, setDefaultNewCategory] = useState<
    PortfolioCategory | undefined
  >(undefined);

  // Lightbox Theater State
  const [lightboxProject, setLightboxProject] = useState<PortfolioProject | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Persist changes to localStorage
  useEffect(() => {
    saveProjectsToStorage(projects);
  }, [projects]);

  useEffect(() => {
    saveShowreelToStorage(showreel);
  }, [showreel]);

  useEffect(() => {
    saveContactToStorage(contact);
  }, [contact]);

  // Quick Upload MP4 for Master Showreel
  const handleQuickUploadShowreel = async (file: File) => {
    if (showreel.videoUrl.startsWith('idb://')) {
      await deleteVideoFromIDB(showreel.videoUrl);
    }
    const idbUri = await saveVideoFileToIDB(file);
    setShowreel((prev) => ({
      ...prev,
      videoUrl: idbUri,
      customFileName: file.name,
      customFileSize: file.size,
    }));
    triggerToast(`Showreel MP4 updated: ${file.name}`);
  };

  // Quick Upload MP4 directly onto a Portfolio Project Card
  const handleQuickUploadProjectVideo = async (projectId: string, file: File) => {
    const existing = projects.find((p) => p.id === projectId);
    if (existing?.videoUrl.startsWith('idb://')) {
      await deleteVideoFromIDB(existing.videoUrl);
    }
    const idbUri = await saveVideoFileToIDB(file);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              videoUrl: idbUri,
              customFileName: file.name,
              customFileSize: file.size,
            }
          : p
      )
    );
    triggerToast(`Uploaded "${file.name}" to project`);
  };

  // Save Project (Create or Update)
  const handleSaveProject = (saved: PortfolioProject) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) {
        return prev.map((p) => (p.id === saved.id ? saved : p));
      }
      return [saved, ...prev];
    });
    setEditingProject(null);
    triggerToast(`Saved project "${saved.title}"`);
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (target?.videoUrl.startsWith('idb://')) {
      await deleteVideoFromIDB(target.videoUrl);
    }
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (editingProject?.id === projectId) {
      setEditingProject(null);
    }
    triggerToast('Project removed from portfolio');
  };

  // Switch all default demo videos to empty Upload Slates
  const handleClearAllDemoVideos = () => {
    setProjects((prev) =>
      prev.map((p) =>
        p.videoUrl.startsWith('idb://')
          ? p
          : {
              ...p,
              videoUrl: '',
              customFileName: undefined,
              customFileSize: undefined,
            }
      )
    );
    triggerToast('Switched demo videos to Cinema Upload Placeholders');
  };

  // Restore Default Demo Projects
  const handleRestoreDefaults = () => {
    setProjects(DEFAULT_PROJECTS);
    setShowreel(DEFAULT_SHOWREEL);
    triggerToast('Restored default demo portfolio');
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      {/* Sticky 3-Zone Top Bar */}
      <Navbar
        projectCount={projects.length}
        onOpenManager={() => {
          setEditingProject(null);
          setManagerTab('list');
          setManagerOpen(true);
        }}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <HeroSection
          showreel={showreel}
          onQuickUploadShowreel={handleQuickUploadShowreel}
          onOpenShowreelModal={() => {
            setManagerTab('showreel');
            setManagerOpen(true);
          }}
        />

        {/* Editorial Section Marquee Divider */}
        <div
          aria-hidden="true"
          className="py-3.5 bg-[#121212] border-b border-white/[0.08] overflow-hidden select-none"
        >
          <div className="animate-marquee flex items-center gap-8 text-xs font-mono tracking-widest text-[#999999] uppercase">
            <span>INSTAGRAM REELS EDITING</span>
            <span className="text-[#A78BFA]">·</span>
            <span>BRAND ADVERTISEMENTS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>AI VFX &amp; CGI</span>
            <span className="text-[#A78BFA]">·</span>
            <span>CINEMATIC EDITS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>MOTION GRAPHICS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>SOUND DESIGN &amp; COLOR GRADING</span>
            <span className="text-[#A78BFA]">·</span>
            <span>INSTAGRAM REELS EDITING</span>
            <span className="text-[#A78BFA]">·</span>
            <span>BRAND ADVERTISEMENTS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>AI VFX &amp; CGI</span>
            <span className="text-[#A78BFA]">·</span>
            <span>CINEMATIC EDITS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>MOTION GRAPHICS</span>
            <span className="text-[#A78BFA]">·</span>
            <span>SOUND DESIGN &amp; COLOR GRADING</span>
          </div>
        </div>

        {/* 2. SHOWREEL SECTION */}
        <ShowreelSection
          showreel={showreel}
          onQuickUploadShowreel={handleQuickUploadShowreel}
          onOpenShowreelModal={() => {
            setManagerTab('showreel');
            setManagerOpen(true);
          }}
          onOpenDriveLibrary={() => {
            setManagerTab('drive');
            setManagerOpen(true);
          }}
          onExpandShowreel={() =>
            setLightboxProject({
              id: 'master-showreel',
              title: showreel.title,
              category: 'Cinematic Edits',
              client: 'ANKIT SHOWREEL',
              year: '2026',
              duration: showreel.duration,
              aspectRatio: '16:9',
              description: showreel.subtitle,
              tools: ['DaVinci Resolve', 'After Effects', 'Premiere Pro', 'AI VFX'],
              videoUrl: showreel.videoUrl,
              customFileName: showreel.customFileName,
              createdAt: Date.now(),
            })
          }
        />

        {/* 3. MY WORK / PORTFOLIO SECTION */}
        <PortfolioSection
          projects={projects}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddProject={(cat) => {
            setEditingProject(null);
            setDefaultNewCategory(cat);
            setManagerTab('form');
            setManagerOpen(true);
          }}
          onEditProject={(project) => {
            setEditingProject(project);
            setManagerTab('form');
            setManagerOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
          onQuickUploadProjectVideo={handleQuickUploadProjectVideo}
          onOpenLightbox={(project) => setLightboxProject(project)}
          onOpenManager={() => {
            setEditingProject(null);
            setManagerTab('list');
            setManagerOpen(true);
          }}
          onOpenDriveLibrary={() => {
            setEditingProject(null);
            setManagerTab('drive');
            setManagerOpen(true);
          }}
        />

        {/* 4. ABOUT ME SECTION */}
        <AboutSection />

        {/* 5. SERVICES SECTION */}
        <ServicesSection
          onSelectServiceInquiry={(serviceTitle) => {
            setSelectedServiceInquiry(serviceTitle);
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onFilterPortfolioByCategory={(cat) => setActiveCategory(cat)}
        />

        {/* 6. CONTACT SECTION */}
        <ContactSection
          contact={contact}
          selectedServiceForInquiry={selectedServiceInquiry}
          onOpenContactSettings={() => {
            setManagerTab('contact');
            setManagerOpen(true);
          }}
        />
      </main>

      {/* Professional Footer */}
      <Footer
        contact={contact}
        onOpenManager={() => {
          setEditingProject(null);
          setManagerTab('list');
          setManagerOpen(true);
        }}
      />

      {/* Project & Video Studio Management Modal */}
      <ProjectManagerModal
        isOpen={managerOpen}
        initialTab={managerTab}
        editingProject={editingProject}
        defaultCategory={defaultNewCategory}
        projects={projects}
        showreel={showreel}
        contact={contact}
        onClose={() => setManagerOpen(false)}
        onSaveProject={handleSaveProject}
        onDeleteProject={handleDeleteProject}
        onSelectEditProject={(proj) => setEditingProject(proj)}
        onStartNewProject={(cat) => {
          setEditingProject(null);
          setDefaultNewCategory(cat);
        }}
        onClearAllDemoVideos={handleClearAllDemoVideos}
        onRestoreDefaults={handleRestoreDefaults}
        onSaveShowreel={(cfg) => {
          setShowreel(cfg);
          triggerToast('Showreel updated');
        }}
        onSaveContact={(cfg) => {
          setContact(cfg);
          triggerToast('Contact links updated');
        }}
        onRestoreBackupData={(data) => {
          if (Array.isArray(data.projects)) setProjects(data.projects);
          if (data.showreel) setShowreel(data.showreel);
          if (data.contact) setContact(data.contact);
        }}
        onStatusToast={triggerToast}
      />

      {/* Fullscreen Theater Lightbox */}
      <VideoLightboxModal
        project={lightboxProject}
        onClose={() => setLightboxProject(null)}
        onEditProject={(proj) => {
          if (proj.id === 'master-showreel') {
            setManagerTab('showreel');
          } else {
            setEditingProject(proj);
            setManagerTab('form');
          }
          setManagerOpen(true);
        }}
        onQuickUploadFile={
          lightboxProject
            ? async (file) => {
                if (lightboxProject.id === 'master-showreel') {
                  await handleQuickUploadShowreel(file);
                } else {
                  await handleQuickUploadProjectVideo(lightboxProject.id, file);
                }
                setLightboxProject(null);
              }
            : undefined
        }
      />

      {/* Non-Intrusive Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#121212] border border-[#A78BFA]/50 text-xs font-medium text-white shadow-2xl"
        >
          <CheckCircle2 className="w-4 h-4 text-[#A78BFA] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
