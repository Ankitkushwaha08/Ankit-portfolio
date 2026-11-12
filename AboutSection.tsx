import React, { useState } from 'react';
import { ArrowUpRight, Film } from 'lucide-react';
import { motion } from 'motion/react';

export const AboutSection: React.FC = () => {
  const [portraitBroken, setPortraitBroken] = useState(false);

  const skills = [
    {
      index: '01',
      name: 'Short-form video editing',
      detail: 'High-retention pacing, visual hooks, speed ramping & vertical storytelling for Reels, Shorts & TikTok.',
    },
    {
      index: '02',
      name: 'Cinematic editing',
      detail: 'Narrative assembly, emotional rhythm, anamorphic color grading & documentary-grade visual flow.',
    },
    {
      index: '03',
      name: 'Sound design',
      detail: 'Multi-layered foley, custom sub-bass impacts, spatial risers, dialogue mastering & atmospheric scoring.',
    },
    {
      index: '04',
      name: 'Motion graphics',
      detail: 'Bespoke 2D/3D kinetic typography, UI choreography, animated callouts & brand motion systems.',
    },
    {
      index: '05',
      name: 'AI video generation',
      detail: 'Next-gen neural video synthesis, temporal consistency workflows, custom style pipelines & 4K upscaling.',
    },
    {
      index: '06',
      name: 'VFX and CGI',
      detail: '3D camera tracking, rotoscoping, CGI object compositing, clean-plating & seamless visual transitions.',
    },
    {
      index: '07',
      name: 'Promotional advertisements',
      detail: 'Conversion-focused commercial cuts, product hero films & multi-ratio social campaign suites.',
    },
  ];

  const softwareStack = [
    'Adobe After Effects',
    'Adobe Premiere Pro',
    'DaVinci Resolve Studio',
    'Cinema 4D & Blender',
    'Runway Gen-3 & ComfyUI',
    'Mocha Pro & Soundly',
  ];

  return (
    <section
      id="about"
      className="py-20 md:py-28 border-b border-white/[0.08] bg-[#080808]"
    >
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Portrait & Creative Identity */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="rounded-2xl overflow-hidden bg-[#121212] border border-white/10">
              {/* Portrait Image with Resilient Fallback */}
              <div className="relative aspect-[3/4] w-full bg-[#121212] overflow-hidden">
                {!portraitBroken ? (
                  <img
                    src="/src/assets/images/about_editor_portrait_1794402285383.jpg"
                    alt="Ankit — Professional Video Editor and AI Content Creator in color grading studio"
                    referrerPolicy="no-referrer"
                    onError={() => setPortraitBroken(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#121212] via-[#181424] to-[#080808]">
                    <Film className="w-12 h-12 text-[#A78BFA] mb-4" />
                    <span className="font-display text-2xl font-bold text-white">
                      ANKIT
                    </span>
                    <span className="text-xs font-mono text-[#999999] mt-1">
                      VIDEO EDITOR & AI CREATOR
                    </span>
                  </div>
                )}

                {/* Bottom Measured Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="text-xs font-mono text-[#A78BFA] mb-1">
                    CREATIVE DIRECTOR & POST-PRODUCTION
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white tracking-tight">
                    Ankit
                  </h3>
                  <p className="text-sm text-white/80">
                    Professional Video Editor & AI Content Creator
                  </p>
                </div>
              </div>

              {/* Studio Software & Pipeline Footer */}
              <div className="p-6 border-t border-white/[0.08] bg-[#121212]">
                <div className="text-xs font-mono text-[#999999] mb-2.5">
                  PRODUCTION PIPELINE & TOOLING
                </div>
                <p className="text-xs text-white/85 leading-relaxed">
                  {softwareStack.join(' · ')}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Biography & 7 Core Skills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-[#999999] mb-3">
              <span>03. ABOUT ME</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A78BFA]">CRAFT & PHILOSOPHY</span>
            </div>

            <h2
              className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Ankit — Professional Video Editor & AI Content Creator
            </h2>

            <p className="text-base text-[#999999] leading-relaxed mb-6">
              Great editing is invisible when it needs to be and unforgettable when it counts. I
              bridge traditional cinema post-production with modern AI visual workflows—turning raw
              concepts into high-performing stories that command attention across every screen.
            </p>

            <p className="text-sm text-[#999999] leading-relaxed mb-10">
              From split-second rhythmic cuts for viral Instagram Reels to photorealistic AI VFX
              compositing and bespoke brand commercials, every frame is engineered around narrative
              clarity, acoustic impact, and audience retention.
            </p>

            {/* Core Disciplines / Skills List */}
            <div className="mb-8">
              <div className="text-xs font-mono text-[#999999] pb-4 border-b border-white/[0.08]">
                CORE CAPABILITIES & SPECIALIZATIONS
              </div>

              <div className="divide-y divide-white/[0.08]">
                {skills.map((skill) => (
                  <div
                    key={skill.index}
                    className="py-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 group"
                  >
                    <div className="flex items-baseline gap-3 shrink-0">
                      <span className="text-xs font-mono text-[#A78BFA] tabular-nums">
                        {skill.index}.
                      </span>
                      <h3 className="font-display text-base font-bold text-white group-hover:text-[#A78BFA] transition-colors">
                        {skill.name}
                      </h3>
                    </div>
                    <p className="text-xs text-[#999999] sm:text-right max-w-md leading-relaxed">
                      {skill.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#A78BFA] hover:text-white transition-colors"
              >
                <span>Discuss a project or retainer with Ankit</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
