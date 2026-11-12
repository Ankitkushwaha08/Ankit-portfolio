import React, { useEffect, useState } from 'react';
import { Edit3, Upload, X } from 'lucide-react';
import { PortfolioProject } from '../types/portfolio';
import { resolveVideoUrl } from '../services/videoStorage';

interface VideoLightboxModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
  onEditProject?: (project: PortfolioProject) => void;
  onQuickUploadFile?: (file: File) => Promise<void>;
}

export const VideoLightboxModal: React.FC<VideoLightboxModalProps> = ({
  project,
  onClose,
  onEditProject,
  onQuickUploadFile,
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');

  useEffect(() => {
    if (!project) return;
    let active = true;
    resolveVideoUrl(project.videoUrl).then((url) => {
      if (active) setResolvedSrc(url);
    });
    return () => {
      active = false;
    };
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl rounded-2xl bg-[#121212] border border-white/15 overflow-hidden shadow-2xl my-auto"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.08] bg-[#080808]">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-[#999999]">
              <span className="text-[#A78BFA]">{project.category}</span>
              <span>·</span>
              <span>{project.client}</span>
              <span>·</span>
              <span className="tabular-nums">{project.year}</span>
            </div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white truncate">
              {project.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onEditProject && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEditProject(project);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#A78BFA]" />
                <span>Edit / Replace MP4</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close theater view"
              className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.15] text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="relative bg-black flex items-center justify-center max-h-[72vh] aspect-video w-full">
          {resolvedSrc ? (
            <video
              src={resolvedSrc}
              controls
              autoPlay
              loop
              playsInline
              className="w-full h-full max-h-[72vh] object-contain"
            />
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-[#999999] mb-4">
                No MP4 video is attached to this project slot yet.
              </p>
              {onQuickUploadFile && (
                <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-[#080808] text-xs font-bold cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Select MP4 File</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onQuickUploadFile(file);
                    }}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Bottom Metadata Details */}
        <div className="px-6 py-4 bg-[#121212] border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-[#999999] max-w-2xl leading-relaxed">
            {project.description}
          </p>
          <div className="text-xs font-mono text-white/80 shrink-0">
            {project.tools.join(' · ')}
          </div>
        </div>
      </div>
    </div>
  );
};
