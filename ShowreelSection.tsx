import React, { useRef, useState } from 'react';
import { Film, HardDrive, Maximize2, SlidersHorizontal, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { ShowreelConfig } from '../types/portfolio';
import { SmartVideoPlayer } from './SmartVideoPlayer';

interface ShowreelSectionProps {
  showreel: ShowreelConfig;
  onQuickUploadShowreel: (file: File) => Promise<void>;
  onOpenShowreelModal: () => void;
  onOpenDriveLibrary: () => void;
  onExpandShowreel: () => void;
}

export const ShowreelSection: React.FC<ShowreelSectionProps> = ({
  showreel,
  onQuickUploadShowreel,
  onOpenShowreelModal,
  onOpenDriveLibrary,
  onExpandShowreel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await onQuickUploadShowreel(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <section
      id="showreel"
      className="py-20 md:py-28 border-b border-white/[0.08] bg-[#080808]"
    >
      <div className="max-w-[1360px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#999999] mb-3">
              <span>01. FEATURED SHOWREEL</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A78BFA]">{showreel.resolution}</span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {showreel.title}
            </h2>
            <p className="text-sm sm:text-base text-[#999999] mt-2 max-w-2xl">
              {showreel.subtitle}
            </p>
          </div>

          {/* Direct Showreel Controls for Ankit */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/15 hover:border-[#A78BFA]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>{isUploading ? 'Uploading MP4...' : 'Upload Showreel MP4'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenDriveLibrary}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-white text-xs font-semibold border border-white/15 hover:border-[#A78BFA]/50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Google Drive</span>
            </button>

            <button
              type="button"
              onClick={onOpenShowreelModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-[#999999] hover:text-white text-xs font-medium border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Edit Reel Settings</span>
            </button>
          </div>
        </div>

        {/* Large Responsive 16:9 Cinema Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden bg-[#121212] border border-white/10 shadow-2xl"
        >
          <div className="aspect-video w-full">
            <SmartVideoPlayer
              videoUrl={showreel.videoUrl}
              title={showreel.title}
              category="Official Showreel"
              aspectRatio="16:9"
              customFileName={showreel.customFileName}
              isHeroOrShowreel={true}
              showControlsOnHover={true}
              onQuickUploadFile={onQuickUploadShowreel}
              onOpenLightbox={onExpandShowreel}
              onOpenEditModal={onOpenShowreelModal}
              className="w-full h-full"
            />
          </div>

          {/* Subtle Cinema Footer Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#121212] border-t border-white/[0.07] text-xs text-[#999999]">
            <div className="flex flex-wrap items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span className="text-white font-medium">Autoplay Muted · Continuous Loop</span>
              <span aria-hidden="true">·</span>
              <span>Hover player to unmute audio, scrub timeline, or drop a new .mp4 file</span>
            </div>

            <button
              type="button"
              onClick={onExpandShowreel}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-white hover:text-[#A78BFA] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Watch in Theater Mode</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
