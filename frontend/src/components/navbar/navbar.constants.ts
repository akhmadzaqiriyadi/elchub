/**
 * Navigation menu items and configuration
 */

import type { NavItem } from './navbar.types';

export const NAVBAR_MENU_ITEMS: NavItem[] = [
  {
    label: 'Event',
    href: '/events',
    children: [
      { label: 'Webinar', href: '/events/webinar' },
      { label: 'Workshop', href: '/events/workshop' },
      { label: 'Seminar', href: '/events/seminar' },
    ],
    isDropdown: true,
  },
  {
    label: 'Mentoring Eksklusif',
    href: '/mentoring',
  },
  {
    label: 'Library',
    href: '/library',
  },
  {
    label: 'Community',
    href: '/community',
  },
];

export const DASHBOARD_MENU_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'My Course',
    href: '/dashboard/courses',
  },
  {
    label: 'My Mentorship',
    href: '/dashboard/mentorship',
  },
  {
    label: 'Wishlist',
    href: '/dashboard/wishlist',
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
  },
];

export const MANAGEMENT_MENU_ITEMS: NavItem[] = [
  {
    label: 'Management',
    href: '/management',
  },
  {
    label: 'Master Data',
    href: '/management/master-data',
  },
  {
    label: 'Event Manager',
    href: '/management/events',
  },
  {
    label: 'Users',
    href: '/management/users',
  },
];

export const NAVBAR_CONFIG = {
  brandName: 'UCH Connection',
  brandLogo: '/logo-uch.svg', // Update sesuai path logo asset
  height: 'h-16',
  bgColor: 'bg-white dark:bg-slate-950',
  borderColor: 'border-b border-slate-200 dark:border-slate-800',
};
