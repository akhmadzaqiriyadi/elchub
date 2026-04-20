/**
 * Main Footer component
 * Complete footer with brand info, navigation columns, social links, and footnote
 * Follows atomic component pattern with clear layer separation
 */

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { FooterColumn } from './footer-column';
import { FooterSocial } from './footer-social';
import { FooterFootnote } from './footer-footnote';
import {
  FOOTER_COLUMNS,
  FOOTER_SOCIAL_LINKS,
  FOOTER_BRAND,
  FOOTER_CONFIG,
} from './footer.constants';
import type { FooterProps } from './footer.types';

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(FOOTER_CONFIG.bgColor, FOOTER_CONFIG.borderColor, className)}
    >
      <div className="mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 mb-8 sm:mb-10">
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              {/* Logo Image */}
              <Image
                src="/images/navbar/uch (1).webp"
                alt="UCH Connection Logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8"
              />
              <h2 className="text-lg font-bold text-[#2E417B] dark:text-slate-100">
                {FOOTER_BRAND.name}
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              {FOOTER_BRAND.tagline}
            </p>

            {/* Social Media */}
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2 uppercase tracking-wide">
                Follow Us
              </p>
              <FooterSocial links={FOOTER_SOCIAL_LINKS} />
            </div>
          </div>

          {/* Columns 2-4: Navigation Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
        </div>

        {/* Footnote with border */}
        <FooterFootnote
          copyright={FOOTER_BRAND.copyright}
          verificationMessage={FOOTER_BRAND.verificationMessage}
        />
      </div>
    </footer>
  );
}
