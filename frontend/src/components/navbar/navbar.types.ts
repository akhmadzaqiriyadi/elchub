/**
 * Type definitions for Navbar component
 */

export interface NavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  isDropdown?: boolean;
}

export interface NavbarProps {
  className?: string;
}
