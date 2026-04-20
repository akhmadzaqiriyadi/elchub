/**
 * Footer content configuration
 * Organized into columns with links and metadata
 */

import type { FooterColumn, FooterSocialLink } from './footer.types';

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Learning & Events',
    links: [
      { label: 'Katalog Kelas', href: '/catalog' },
      { label: 'Webinar Gratis', href: '/webinar' },
      { label: 'Mentoring Eksklusif', href: '/mentoring' },
      { label: 'Jadwal Event', href: '/schedule' },
    ],
  },
  {
    title: 'Support & Help',
    links: [
      { label: 'Konfirmasi Pembayaran', href: '/payment-confirmation' },
      { label: 'Pusat Bantuan / FAQ', href: '/faq' },
      { label: 'Hubungi Admin', href: 'https://wa.me/your-number' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
    ],
  },
  {
    title: 'Partnership',
    links: [
      { label: 'Be a Mentor', href: '/mentor-signup' },
      { label: 'Kerjasama Instansi', href: '/partnership' },
    ],
  },
];

export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    icon: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/uchconnection',
    ariaLabel: 'Follow us on Instagram',
  },
  {
    icon: 'linkedin',
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/uchconnection',
    ariaLabel: 'Connect with us on LinkedIn',
  },
  {
    icon: 'youtube',
    label: 'YouTube',
    href: 'https://youtube.com/@uchconnection',
    ariaLabel: 'Subscribe to our YouTube channel',
  },
];

export const FOOTER_BRAND = {
  name: 'UCH Connection',
  tagline: 'Jembatan Karir & Skill melalui Koneksi Terpercaya.',
  copyright: '© 2026 UCH Connection. Built with ❤️ for the Community.',
  verificationMessage: 'All system verifications are processed within 1x24 hours.',
};

export const FOOTER_CONFIG = {
  bgColor: 'bg-slate-50 dark:bg-slate-950',
  borderColor: 'border-t border-slate-200 dark:border-slate-800',
  textColor: 'text-slate-700 dark:text-slate-300',
};
