import React, { useState } from 'react';
import { ArrowDownRight, Mail, Play, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { SmartVideoPlayer } from './SmartVideoPlayer';
import { ShowreelConfig } from '../types/portfolio';

interface HeroSectionProps {
  showreel: ShowreelConfig;
  onQuickUploadShowreel: (file: File) => Promise<void>;
  onOpenShowreelModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  showreel,
  onQuickUploadShowreel,
  onOpenShowreelModal,
}) => {
  const [bgBroken, setBgBroken] = useState(false);

  const metrics = [
    {
      value: '450+',
      label: 'Commercial & Short-Form Edits',
      detail: 'Delivered for creators & global D2C brands',
    },
    {
      value: '85M+',
      label: 'Organic Views Generated',
      detail: 'Across Instagram Reels, Shorts & ad campaigns',
    },
    {
      value: '4K / 60fps',
      label: 'Cinema Color & AI VFX Pipeline',
      detail: 'DaVinci Resolve, After Effects & Generative CGI',
    },
    {
      value: '24–48h',
      label: 'High-Retention Turnaround',
      detail: 'Precision pacing engineered for scroll retention',
    },
  ];

  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-white/[0.08] pt-12 pb-16 md:pt-20 md:pb-24"
    >
      {/* Subtle Studio Backdrop Image + Anamorphic Ambient Glow */}
      <div className="pointer-events-none select-none absolute inset-0 overflow-hidden">
        {!bgBroken && (
          <img
            src="/src/assets/images/hero_studio_backdrop_1794402285014.jpg"
            alt="Cinema post-production suite background"
            referrerPolicy="no-referrer"
            onError={() => setBgBroken(true)}
            className="w-full h-full object-cover opacity-[0.16] scale-105"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 18% 22%, rgba(167, 139, 250, 0.14), transparent 45%), radial-gradient(circle at 82% 65%, rgba(167, 139, 250, 0.09), transparent 50%), linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, #080808 92%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-[1360px] mx-auto px-6">
        {/* 2-Column Split Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Column: Typographic Hierarchy & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col justify-between py-2"
          >
            <div>
              {/* Unboxed Editorial Kicker with Name: ANKIT */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono tracking-wider text-[#999999] mb-6">
                <span className="text-white font-semibold">ANKIT</span>
                <span aria-hidden="true">·</span>
                <span>PORTFOLIO & COMMERCIAL ARCHIVE</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#A78BFA]">AVAILABLE FOR PROJECTS</span>
              </div>

              {/* Main Display Headline */}
              <h1
                className="font-display text-4xl sm:text-5xl xl:text-[3.65rem] font-extrabold tracking-tight text-white leading-[1.06] mb-6"
                style={{ textWrap: 'balance' }}
              >
                I TURN IDEAS INTO{' '}
                <span className="text-[#A78BFA]">VISUAL EXPERIENCES.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl font-medium text-white/90 tracking-tight mb-4">
                Video Editor <span className="text-[#A78BFA] mx-1.5">|</span> AI Creator{' '}
                <span className="text-[#A78BFA] mx-1.5">|</span> Visual Storyteller
              </p>

              {/* Supporting Editorial Lead Copy */}
              <p className="text-base text-[#999999] leading-relaxed max-w-2xl mb-9">
                Crafting high-retention Instagram Reels, commercial brand films, generative AI VFX,
                and kinetic motion graphics that hold attention from the very first frame.
              </p>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#work"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-sm font-bold tracking-tight transition-all duration-150 whitespace-nowrap shrink-0"
              >
                <span>Explore My Work</span>
                <ArrowDownRight className="w-4 h-4" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#121212] hover:bg-white/[0.08] text-white text-sm font-semibold border border-white/15 hover:border-[#A78BFA]/50 transition-all duration-150 whitespace-nowrap shrink-0"
              >
                <Mail className="w-4 h-4 text-[#A78BFA]" />
                <span>Contact Me</span>
              </a>

              <a
                href="#showreel"
                className="inline-flex items-center gap-2 px-4 py-3.5 text-sm font-medium text-[#999999] hover:text-white transition-colors whitespace-nowrap shrink-0"
              >
                <Play className="w-3.5 h-3.5 text-[#A78BFA] fill-current" />
                <span>Watch Showreel</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Live Studio Preview Monitor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col"
          >
            <div className="relative flex-1 flex flex-col rounded-2xl bg-[#121212] border border-white/10 overflow-hidden">
              {/* Top Cinema Monitor Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] text-xs font-mono text-[#999999]">
                <span>DIRECTOR MONITOR · REC.709</span>
                <span className="text-white/80">ANKIT STUDIO CUT</span>
              </div>

              {/* Live Looping Video Container */}
              <div className="relative flex-1 min-h-[260px] sm:min-h-[300px] aspect-video lg:aspect-auto">
                <SmartVideoPlayer
                  videoUrl={showreel.videoUrl}
                  title={showreel.title}
                  category="Showreel Preview"
                  aspectRatio="16:9"
                  customFileName={showreel.customFileName}
                  isHeroOrShowreel={true}
                  onQuickUploadFile={onQuickUploadShowreel}
                  onOpenEditModal={onOpenShowreelModal}
                  className="w-full h-full"
                />
              </div>

              {/* Bottom Monitor Metadata Bar */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-white/[0.07] bg-[#0c0c0e]">
                <div className="text-xs text-[#999999] truncate">
                  <span className="text-white font-medium">Master Reel</span>
                  <span className="mx-2">·</span>
                  <span>{showreel.resolution}</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenShowreelModal}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#A78BFA] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Customize Reel</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Full-Width 4-Column Metric Row Below Hero Split */}
        <div className="mt-14 pt-10 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {metrics.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight font-mono tabular-nums mb-1.5">
                {item.value}
              </span>
              <span className="text-sm font-semibold text-white/90 mb-1">
                {item.label}
              </span>
              <span className="text-xs text-[#999999] leading-relaxed">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
