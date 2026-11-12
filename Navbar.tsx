import React, { useState } from 'react';
import { FolderKanban, Menu, X } from 'lucide-react';

interface NavbarProps {
  onOpenManager: () => void;
  projectCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenManager }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Showreel', href: '#showreel' },
    { label: 'Work', href: '#work' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080808]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-6 h-16">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="font-display text-xl font-extrabold tracking-tight text-white hover:text-[#A78BFA] transition-colors whitespace-nowrap shrink-0"
        >
          ANKIT
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#999999]"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-white transition-colors whitespace-nowrap shrink-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#A78BFA] hover:after:w-full after:transition-all after:duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenManager}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#080808] bg-[#A78BFA] hover:bg-[#b9a2fb] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Manage Portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#121212] border border-white/10 text-white hover:border-[#A78BFA]/50 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121212] border-b border-white/10 px-6 py-5">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-base font-medium text-white/90 hover:text-[#A78BFA] transition-colors border-b border-white/[0.05] last:border-none"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};
