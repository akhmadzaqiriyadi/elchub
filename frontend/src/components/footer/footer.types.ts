/**
 * Type definitions for Footer component
 */

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterSocialLink {
  icon: string;
  label: string;
  href: string;
  ariaLabel: string;
}

export interface FooterProps {
  className?: string;
}
