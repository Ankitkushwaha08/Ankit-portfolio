import React from 'react';
import {
  Edit3,
  FolderKanban,
  HardDrive,
  Maximize2,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  PORTFOLIO_CATEGORIES,
  PortfolioCategory,
  PortfolioProject,
} from '../types/portfolio';
import { SmartVideoPlayer } from './SmartVideoPlayer';
import { formatBytes } from '../services/videoStorage';

interface PortfolioSectionProps {
  projects: PortfolioProject[];
  activeCategory: 'All' | PortfolioCategory;
  onSelectCategory: (cat: 'All' | PortfolioCategory) => void;
  onAddProject: (defaultCategory?: PortfolioCategory) => void;
  onEditProject: (project: PortfolioProject) => void;
  onDeleteProject: (projectId: string) => void;
  onQuickUploadProjectVideo: (projectId: string, file: File) => Promise<void>;
  onOpenLightbox: (project: PortfolioProject) => void;
  onOpenManager: () => void;
  onOpenDriveLibrary: () => void;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  projects,
  activeCategory,
  onSelectCategory,
  onAddProject,
  onEditProject,
  onQuickUploadProjectVideo,
  onOpenLightbox,
  onOpenManager,
  onOpenDriveLibrary,
}) => {

  const filteredProjects =
    activeCategory === 'All'
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  return (
    <section
      id="work"
      className="py-20 md:py-28 border-b border-white/[0.08] bg-[#080808]"
    >
      <div className="max-w-[1360px] mx-auto px-6">
        {/* Section Header + Management Actions */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#999999] mb-3">
              <span>02. SELECTED WORKS & ARCHIVE</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A78BFA] tabular-nums">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'PROJECT' : 'PROJECTS'}
              </span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Curated Visual Productions
            </h2>
            <p className="text-sm sm:text-base text-[#999999] mt-2 max-w-2xl">
              Every project plays real looping MP4 video automatically when in view. Hover any
              project to unmute, scrub, drop a local MP4 file, or import directly from Google Drive.
            </p>
          </div>

          {/* Add Project, Google Drive & Studio Manager Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                onAddProject(activeCategory === 'All' ? undefined : activeCategory)
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Video Project</span>
            </button>

            <button
              type="button"
              onClick={onOpenDriveLibrary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/15 hover:border-[#A78BFA]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Import from Google Drive</span>
            </button>

            <button
              type="button"
              onClick={onOpenManager}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/15 hover:border-[#A78BFA]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Project Studio Manager</span>
            </button>
          </div>
        </div>

        {/* Interactive Category Filter Controls (Functional Segmented Buttons) */}
        <div
          role="tablist"
          aria-label="Portfolio categories"
          className="flex items-center gap-1.5 p-1.5 bg-[#121212] border border-white/[0.08] rounded-xl overflow-x-auto mb-12"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'All'}
            onClick={() => onSelectCategory('All')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-[#A78BFA] text-[#080808] shadow-sm'
                : 'text-[#999999] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            All Works ({projects.length})
          </button>

          {PORTFOLIO_CATEGORIES.map((category) => {
            const count = projects.filter((p) => p.category === category).length;
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#A78BFA] text-[#080808] shadow-sm'
                    : 'text-[#999999] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>

        {/* Empty State if category has no projects */}
        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl bg-[#121212] border border-white/10 p-12 text-center max-w-xl mx-auto my-8">
            <h3 className="font-display text-xl font-bold text-white mb-2">
              No projects in {activeCategory} yet
            </h3>
            <p className="text-sm text-[#999999] mb-6">
              Upload an MP4 file or paste a video URL to showcase your work in this category.
            </p>
            <button
              type="button"
              onClick={() =>
                onAddProject(activeCategory === 'All' ? undefined : activeCategory)
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A78BFA] text-[#080808] text-xs font-bold hover:bg-[#b9a2fb] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First {activeCategory === 'All' ? '' : activeCategory} Project</span>
            </button>
          </div>
        ) : (
          /* Media-First Portfolio Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((project, idx) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.4,
                  delay: (idx % 2) * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group/card flex flex-col rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-white/20 overflow-hidden transition-colors"
              >
                {/* Video Viewport Container */}
                <div className="relative w-full aspect-video bg-[#080808] border-b border-white/[0.06]">
                  <SmartVideoPlayer
                    videoUrl={project.videoUrl}
                    title={project.title}
                    category={project.category}
                    aspectRatio={project.aspectRatio}
                    customFileName={project.customFileName}
                    onQuickUploadFile={(file) =>
                      onQuickUploadProjectVideo(project.id, file)
                    }
                    onOpenLightbox={() => onOpenLightbox(project)}
                    onOpenEditModal={() => onEditProject(project)}
                    className="w-full h-full"
                  />
                </div>

                {/* Card Details & Actions */}
                <div className="flex-1 flex flex-col justify-between p-6">
                  <div>
                    {/* Clean Unboxed Metadata Row (Zero Pill Discipline) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#999999] mb-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[#A78BFA] font-medium">
                          {project.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{project.client}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{project.year}</span>
                      </div>
                      <span className="tabular-nums text-white/70">
                        {project.duration} · {project.aspectRatio}
                      </span>
                    </div>

                    {/* Project Title */}
                    <h3 className="font-display text-xl font-bold text-white tracking-tight group-hover/card:text-[#A78BFA] transition-colors mb-2">
                      {project.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-[#999999] leading-relaxed mb-4">
                      {project.description}
                    </p>
                  </div>

                  {/* Footer Metadata & Quick Edit / Delete / Theater Actions */}
                  <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
                    {/* Tools Used (Unboxed Inline Text with separators) */}
                    <div className="text-xs text-[#999999] truncate max-w-[60%]">
                      {project.customFileName ? (
                        <span className="text-white/85 font-mono">
                          MP4: {project.customFileName}{' '}
                          {project.customFileSize
                            ? `(${formatBytes(project.customFileSize)})`
                            : ''}
                        </span>
                      ) : (
                        <span>{project.tools.join(' · ')}</span>
                      )}
                    </div>

                    {/* Card Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenLightbox(project)}
                        title="Open in Theater View"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-[#A78BFA]" />
                        <span>Watch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditProject(project)}
                        title="Edit project details or update MP4"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-xs font-medium text-[#999999] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
