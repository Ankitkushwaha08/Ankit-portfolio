import React from 'react';
import { ArrowUpRight, Check, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { PortfolioCategory, ServiceItem } from '../types/portfolio';
import { SERVICES_DATA } from '../services/videoStorage';

interface ServicesSectionProps {
  onSelectServiceInquiry: (serviceTitle: string) => void;
  onFilterPortfolioByCategory: (category: PortfolioCategory) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectServiceInquiry,
  onFilterPortfolioByCategory,
}) => {
  return (
    <section
      id="services"
      className="py-20 md:py-28 border-b border-white/[0.08] bg-[#080808]"
    >
      <div className="max-w-[1360px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#999999] mb-3">
              <span>04. PRODUCTION SERVICES</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#A78BFA]">END-TO-END POST & AI STUDIO</span>
            </div>
            <h2
              className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Tailored Video Production & Visual Engineering
            </h2>
          </div>

          <p className="text-sm text-[#999999] max-w-md leading-relaxed">
            Available for per-project commissions, monthly creator retainers, and agency white-label
            partnerships.
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service: ServiceItem, idx: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.4,
                delay: idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`flex flex-col justify-between rounded-2xl bg-[#121212] border border-white/[0.08] hover:border-[#A78BFA]/45 p-7 transition-colors ${
                idx === 0 ? 'lg:col-span-2' : ''
              }`}
            >
              <div>
                {/* Unboxed Top Index & Turnaround */}
                <div className="flex items-center justify-between gap-2 text-xs font-mono text-[#999999] mb-4">
                  <span className="text-[#A78BFA] font-semibold">
                    {service.index}. SERVICE SPECIFICATION
                  </span>
                  <span className="tabular-nums">EST. {service.turnaround.toUpperCase()}</span>
                </div>

                {/* Title */}
                <h3 className="font-display text-2xl font-bold text-white tracking-tight mb-2">
                  {service.index}. {service.title}
                </h3>

                {/* Tagline */}
                <p className="text-sm font-medium text-white/85 mb-3">
                  {service.tagline}
                </p>

                {/* Description */}
                <p className="text-sm text-[#999999] leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Deliverables List */}
                <div className="pt-5 border-t border-white/[0.07] mb-6">
                  <div className="text-xs font-mono text-[#999999] mb-3">
                    INCLUDED DELIVERABLES
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.deliverables.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-white/85 leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-[#A78BFA] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer: Formats & Actions */}
              <div className="pt-5 border-t border-white/[0.07] flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-[#999999]">
                  {service.formats}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onFilterPortfolioByCategory(service.categoryMatch);
                      document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-[#999999] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Samples</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectServiceInquiry(service.title)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A78BFA] hover:bg-[#b9a2fb] text-[#080808] text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Book Service</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
