import React from 'react';
import { ArrowUp, FolderKanban } from 'lucide-react';
import { ContactConfig } from '../types/portfolio';

interface FooterProps {
  contact: ContactConfig;
  onOpenManager: () => void;
}

export const Footer: React.FC<FooterProps> = ({ contact, onOpenManager }) => {
  return (
    <footer className="bg-[#080808] py-14 text-xs text-[#999999]">
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/[0.08]">
          <div>
            <a
              href="#top"
              className="font-display text-2xl font-extrabold tracking-tight text-white hover:text-[#A78BFA] transition-colors"
            >
              ANKIT
            </a>
            <p className="mt-2 text-xs text-[#999999] max-w-md">
              Video Editor · AI Creator · Visual Storyteller. Crafting high-retention reels,
              commercial advertisements, and CGI visual experiences.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-white/80">
            <a href="#showreel" className="hover:text-[#A78BFA] transition-colors">
              Showreel
            </a>
            <a href="#work" className="hover:text-[#A78BFA] transition-colors">
              Portfolio
            </a>
            <a href="#about" className="hover:text-[#A78BFA] transition-colors">
              About
            </a>
            <a href="#services" className="hover:text-[#A78BFA] transition-colors">
              Services
            </a>
            <a href="#contact" className="hover:text-[#A78BFA] transition-colors">
              Contact
            </a>
            <button
              type="button"
              onClick={onOpenManager}
              className="inline-flex items-center gap-1.5 text-[#A78BFA] hover:text-white transition-colors cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Studio Manager</span>
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© {new Date().getFullYear()} Ankit. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <span>{contact.email}</span>
          </div>

          <a
            href="#top"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-[#A78BFA] transition-colors"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
