import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  Copy,
  Instagram,
  Mail,
  MessageSquare,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ContactConfig } from '../types/portfolio';
import { SERVICES_DATA } from '../services/videoStorage';

interface ContactSectionProps {
  contact: ContactConfig;
  selectedServiceForInquiry: string;
  onOpenContactSettings: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  selectedServiceForInquiry,
  onOpenContactSettings,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [serviceType, setServiceType] = useState(
    selectedServiceForInquiry || SERVICES_DATA[0].title
  );
  const [timeline, setTimeline] = useState('Within 1 Week');
  const [projectNotes, setProjectNotes] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  useEffect(() => {
    if (selectedServiceForInquiry) {
      setServiceType(selectedServiceForInquiry);
    }
  }, [selectedServiceForInquiry]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formattedMessage = `Hi Ankit! I'm ${clientName || 'interested in collaborating'}${
    clientEmail ? ` (${clientEmail})` : ''
  }. I'd love to discuss a project for: ${serviceType} (Timeline: ${timeline}). ${
    projectNotes ? `Details: ${projectNotes}` : ''
  }`;

  const cleanWaNumber = contact.whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappHref = `https://wa.me/${cleanWaNumber}?text=${encodeURIComponent(
    formattedMessage
  )}`;
  const mailtoHref = `mailto:${contact.email}?subject=${encodeURIComponent(
    `Project Inquiry: ${serviceType} — ${clientName || 'Collaboration'}`
  )}&body=${encodeURIComponent(formattedMessage)}`;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigator.clipboard?.writeText(formattedMessage);
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 4500);
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-28 border-b border-white/[0.08] bg-[#080808]"
    >
      <div className="max-w-[1360px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column: Collaboration CTA & Direct Channel Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#999999] mb-3">
              <div>
                <span>05. CONTACT & COLLABORATION</span>
                <span className="mx-2">·</span>
                <span className="text-[#A78BFA]">DIRECT STUDIO LINE</span>
              </div>
              <button
                type="button"
                onClick={onOpenContactSettings}
                className="inline-flex items-center gap-1 text-xs text-[#999999] hover:text-white transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Edit Links</span>
              </button>
            </div>

            <h2
              className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              Let’s Build Your Next Visual Experience.
            </h2>

            <p className="text-base text-[#999999] leading-relaxed mb-8">
              Ready to scale your content with high-retention reels, commercial brand edits, or AI
              VFX? Reach out directly via Instagram, WhatsApp, or Email.
            </p>

            {/* 3 Direct Contact Placeholder Cards */}
            <div className="space-y-4">
              {/* Instagram Profile Link Placeholder */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#A78BFA]/40 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#999999]">
                      INSTAGRAM PROFILE
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                      {contact.instagramHandle}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(contact.instagramHandle, 'ig')}
                    aria-label="Copy Instagram handle"
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#999999] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedField === 'ig' ? (
                      <Check className="w-4 h-4 text-[#A78BFA]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Open Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* WhatsApp Contact Placeholder */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#A78BFA]/40 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#999999]">
                      WHATSAPP DIRECT
                    </div>
                    <div className="text-sm font-bold text-white font-mono tabular-nums truncate">
                      {contact.whatsappDisplay}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(contact.whatsappDisplay, 'wa')}
                    aria-label="Copy WhatsApp number"
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#999999] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedField === 'wa' ? (
                      <Check className="w-4 h-4 text-[#A78BFA]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Message</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Email Contact Placeholder */}
              <div className="p-5 rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#A78BFA]/40 transition-colors flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#A78BFA] shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#999999]">
                      EMAIL INQUIRIES
                    </div>
                    <div className="text-sm font-bold text-white truncate">
                      {contact.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopy(contact.email, 'email')}
                    aria-label="Copy Email address"
                    className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#999999] hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-[#A78BFA]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={mailtoHref}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-[#A78BFA] text-white hover:text-[#080808] text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Send Email</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 text-xs font-mono text-[#999999]">
              <span>{contact.location}</span>
              <span className="mx-2">·</span>
              <span className="text-white/80">{contact.availabilityText}</span>
            </div>
          </motion.div>

          {/* Right Column: Interactive Collaboration Brief Builder */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <form
              onSubmit={handleFormSubmit}
              className="rounded-2xl bg-[#121212] border border-white/10 p-7 sm:p-9"
            >
              <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#999999] mb-2">
                <span>PROJECT BRIEF BUILDER</span>
                <span className="text-[#A78BFA]">FAST RESPONSE (&lt; 12 HRS)</span>
              </div>
              <h3 className="font-display text-2xl font-bold text-white tracking-tight mb-6">
                Start a Collaboration with Ankit
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-2">
                    Your Name or Brand
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Aryan / Apex Studios"
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white placeholder:text-[#999999]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-2">
                    Your Email or Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="name@brand.com or @handle"
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white placeholder:text-[#999999]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-medium text-white/85 mb-2">
                    Service Required
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white transition-colors"
                  >
                    {SERVICES_DATA.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                    <option value="Monthly Retainer / Custom Package">
                      Monthly Retainer / Custom Package
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/85 mb-2">
                    Target Delivery Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white transition-colors"
                  >
                    <option value="Urgent (24–48 Hours)">Urgent (24–48 Hours)</option>
                    <option value="Within 1 Week">Within 1 Week</option>
                    <option value="2–4 Weeks Campaign">2–4 Weeks Campaign</option>
                    <option value="Ongoing Monthly Retainer">Ongoing Monthly Retainer</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-medium text-white/85 mb-2">
                  Project Vision & Deliverables
                </label>
                <textarea
                  rows={4}
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  placeholder="Tell me about your footage, style references, number of videos, or campaign goals..."
                  className="w-full px-4 py-3 rounded-xl bg-[#080808] border border-white/10 focus:border-[#A78BFA] focus:outline-none text-sm text-white placeholder:text-[#999999]/50 transition-colors resize-none"
                />
              </div>

              {submittedNotice && (
                <div className="mb-5 p-3.5 rounded-xl bg-[#A78BFA]/15 border border-[#A78BFA]/40 text-xs text-white flex items-center justify-between gap-3">
                  <span>
                    Project brief copied to clipboard! Click WhatsApp or Email below to send
                    directly.
                  </span>
                  <Check className="w-4 h-4 text-[#A78BFA] shrink-0" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Brief via WhatsApp</span>
                </a>

                <a
                  href={mailtoHref}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-white text-xs font-semibold border border-white/15 transition-colors whitespace-nowrap shrink-0"
                >
                  <Mail className="w-4 h-4 text-[#A78BFA]" />
                  <span>Send via Email</span>
                </a>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-transparent hover:bg-white/[0.05] text-[#999999] hover:text-white text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Copy Formatted Brief</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
