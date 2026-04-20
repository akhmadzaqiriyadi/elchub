# Navbar & Footer Components - Architecture & Usage Guide

## Overview

Navbar dan Footer adalah komponen global yang mengikuti **feature-based architecture** dengan **atomic component pattern**. Keduanya telah diintegrasikan ke dalam root layout dan dioptimalkan untuk reusability dan maintainability.

## Folder Structure

```
src/components/
├── navbar/
│   ├── navbar.tsx                 # Main component
│   ├── navbar-menu.tsx            # Menu dengan dropdown
│   ├── navbar-search.tsx          # Search input field
│   ├── navbar-actions.tsx         # Login/Register buttons
│   ├── navbar-link.tsx            # Atomic link component
│   ├── navbar.types.ts            # Type definitions
│   ├── navbar.constants.ts        # Configuration & menu items
│   └── index.ts                   # Barrel export
└── footer/
    ├── footer.tsx                 # Main component
    ├── footer-column.tsx          # Column wrapper
    ├── footer-link.tsx            # Atomic link component
    ├── footer-social.tsx          # Social media links
    ├── footer-footnote.tsx        # Copyright section
    ├── footer.types.ts            # Type definitions
    ├── footer.constants.ts        # Configuration & content
    └── index.ts                   # Barrel export
```

## Layer Separation Pattern

Mengikuti feature-based guide, setiap komponen memiliki pemisahan layer yang jelas:

### 1. **Types Layer** (`*.types.ts`)
- Type definitions untuk props dan data structures
- Interface untuk eksternal data sources
- Reusable type exports

### 2. **Constants Layer** (`*.constants.ts`)
- Configuration values
- Menu items, footer content, social links
- Style constants
- String literals

### 3. **Components Layer** (`*.tsx`)
- Atomic components (small, single responsibility)
- UI rendering only
- Props dari parent atau hooks
- No business logic

### 4. **Main Component** (e.g., `navbar.tsx`, `footer.tsx`)
- Orchestration dari sub-components
- Integration dengan constants
- Styling dan layout management

## Navbar Components

### Main Navbar Component

**File:** `src/components/navbar/navbar.tsx`

Sticky navigation bar dengan 3 sections: brand + menu, search, dan actions.

**Props:**
```typescript
interface NavbarProps {
  className?: string;  // Optional custom className
}
```

**Usage:**
```tsx
import { Navbar } from '@/components/navbar';

export default function Layout() {
  return (
    <div>
      <Navbar />
      {/* Content */}
    </div>
  );
}
```

**Features:**
- Sticky positioning (z-index: 40)
- Responsive: Desktop menu hidden pada lg breakpoint
- Dark mode support
- Backdrop blur effect
- Max-width container (7xl)

### NavbarMenu Component

**File:** `src/components/navbar/navbar-menu.tsx`

Navigation menu dengan dropdown support.

**Props:**
```typescript
interface NavbarMenuProps {
  items: NavItem[];
  className?: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: NavItem[];
  isDropdown?: boolean;
}
```

**Features:**
- Dropdown menu dengan hover activation
- ChevronDown icon untuk dropdown indicator
- Click handling untuk mobile compatibility
- Transition animations

**Customization:**
Edit `navbar.constants.ts` untuk mengubah menu items:

```typescript
export const NAVBAR_MENU_ITEMS: NavItem[] = [
  {
    label: 'Event',
    children: [
      { label: 'Webinar', href: '/events/webinar' },
      { label: 'Workshop', href: '/events/workshop' },
    ],
    isDropdown: true,
  },
  // ... more items
];
```

### NavbarSearch Component

**File:** `src/components/navbar/navbar-search.tsx`

Search input dengan icon dan clear button.

**Props:**
```typescript
interface NavbarSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}
```

**Features:**
- Icon + input field
- Clear button (X icon)
- Keyboard events support
- Focus ring untuk accessibility
- Dark mode support

**Default Placeholder:** "Cari kelas atau event..."

**Usage dengan handler:**
```tsx
<NavbarSearch onSearch={(query) => {
  // Handle search query
  console.log(query);
}} />
```

### NavbarActions Component

**File:** `src/components/navbar/navbar-actions.tsx`

Login link dan Register/Join button di sidebar kanan.

**Features:**
- Login: Text link (Navy color)
- Register: Styled button (#2E417B background)
- Responsive: Hidden pada mobile (sm breakpoint)

### NavbarLink Component

**File:** `src/components/navbar/navbar-link.tsx`

Atomic navigation link dengan hover states.

**Props:**
```typescript
interface NavbarLinkProps {
  href: string;
  label: string;
  className?: string;
  isActive?: boolean;
}
```

## Footer Components

### Main Footer Component

**File:** `src/components/footer/footer.tsx`

Professional footer dengan 4 kolom, social links, dan footnote.

**Props:**
```typescript
interface FooterProps {
  className?: string;
}
```

**Layout:**
- Column 1: Brand info + social media
- Column 2-4: Navigation columns (Learning, Support, Partnership)
- Footnote: Copyright + verification message

**Features:**
- Responsive grid (1 col mobile, 2 col tablet, 5 col desktop)
- Dark mode support
- Accessibility-friendly links
- External links open di tab baru

### Footer Configuration

Semua konten footer dapat dikustomisasi di `footer.constants.ts`:

```typescript
// Kolom navigasi
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Learning & Events',
    links: [
      { label: 'Katalog Kelas', href: '/catalog' },
      // ...
    ],
  },
  // ... more columns
];

// Social media links
export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    icon: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com/uchconnection',
    ariaLabel: 'Follow us on Instagram',
  },
  // ...
];

// Brand info
export const FOOTER_BRAND = {
  name: 'UCH Connection',
  tagline: 'Jembatan Karir & Skill melalui Koneksi Terpercaya.',
  copyright: '© 2026 UCH Connection. Built with ❤️ for the Community.',
  verificationMessage: 'All system verifications are processed within 1x24 hours.',
};
```

### FooterColumn Component

**File:** `src/components/footer/footer-column.tsx`

Reusable column dengan title dan link list.

**Props:**
```typescript
interface FooterColumnProps {
  title: string;
  links: FooterLink[];
  className?: string;
}
```

### FooterLink Component

**File:** `src/components/footer/footer-link.tsx`

Atomic footer link dengan internal/external handling.

**Features:**
- Auto-detects external URLs (http/https)
- External links: opens di tab baru
- Hover state: Navy color (#2E417B)
- Dark mode support

### FooterSocial Component

**File:** `src/components/footer/footer-social.tsx`

Social media icons dengan links.

**Supported Icons:**
- Instagram
- LinkedIn
- YouTube

**Features:**
- Lucide icons
- Hover state dengan color change
- ARIA labels untuk accessibility

### FooterFootnote Component

**File:** `src/components/footer/footer-footnote.tsx`

Bottom section dengan copyright dan micro-copy tentang payment verification.

**Props:**
```typescript
interface FooterFootnoteProps {
  copyright: string;
  verificationMessage: string;
  className?: string;
}
```

## Integration dengan Layout

Navbar dan Footer sudah terintegrasi di `src/app/layout.tsx`:

```tsx
export default function RootLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

**Layout Structure:**
- `flex flex-col min-h-screen`: Full height layout
- `flex-1` di main: Push footer ke bawah kalau content tipis
- Navbar sticky di atas
- Footer selalu di bawah

## Styling & Theming

### Brand Colors
```
Primary Navy: #2E417B
Hover Navy: #1f2a52
Dark Mode Blue: blue-600, blue-400
```

### Responsive Breakpoints
- **Mobile:** Default (full width)
- **Tablet (md):** Search visible, menu tersembunyi
- **Desktop (lg):** Full navigation, search center, all actions visible

### Dark Mode
Semua komponen punya dark mode support dengan `dark:` prefix Tailwind.

## Customization Guide

### 1. Update Menu Items

Edit `src/components/navbar/navbar.constants.ts`:

```typescript
export const NAVBAR_MENU_ITEMS: NavItem[] = [
  {
    label: 'Your New Item',
    href: '/new-path',
    // or untuk dropdown:
    children: [{ label: 'Child', href: '/child' }],
    isDropdown: true,
  },
];
```

### 2. Update Footer Content

Edit `src/components/footer/footer.constants.ts`:

```typescript
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Your Column',
    links: [{ label: 'Your Link', href: '/path' }],
  },
];

// Update brand info
export const FOOTER_BRAND = {
  name: 'Your Name',
  tagline: 'Your tagline',
  // ...
};
```

### 3. Update Social Links

Edit social links di `footer.constants.ts`:

```typescript
export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  {
    icon: 'instagram', // Supported: instagram, linkedin, youtube
    label: 'Instagram',
    href: 'https://instagram.com/yourprofile',
    ariaLabel: 'Follow us on Instagram',
  },
];
```

### 4. Styling Customization

Warna dan spacing defined dalam komponen. Untuk mengubah:

1. Edit Tailwind classes di komponen files
2. Atau override dengan className prop:

```tsx
<Navbar className="bg-gray-100" />
<Footer className="bg-blue-900" />
```

## Testing

### Component Tests

```tsx
import { render } from '@testing-library/react';
import { Navbar } from '@/components/navbar';

test('Navbar renders with logo', () => {
  const { getByText } = render(<Navbar />);
  expect(getByText('UCH Connection')).toBeInTheDocument();
});
```

### Integration Tests

```tsx
test('Navigation menu items are clickable', () => {
  const { getByText } = render(<Navbar />);
  const event = getByText('Event');
  expect(event).toHaveAttribute('href', '/events');
});
```

## Accessibility

### Navbar
- Semantic `<header>` dan `<nav>` tags
- ARIA labels on search input
- Keyboard navigation support
- Focus states untuk keyboard users

### Footer
- Semantic `<footer>` tag
- External link indicators (`target="_blank"`, `rel="noopener noreferrer"`)
- ARIA labels pada social links
- Proper heading hierarchy

## Performance Considerations

1. **No JavaScript by default** - Navbar dan footer mostly static
2. **Minimal re-renders** - Sub-components are memoizable
3. **CSS-in-JS** - Tailwind classes (no runtime overhead)
4. **Bundle size** - Atomic components = tree-shakeable

## Future Enhancements

1. **Mobile Menu** - Offcanvas menu untuk mobile navigation
2. **Search Integration** - Connect dengan search functionality
3. **Dynamic Menu Items** - Load dari CMS atau API
4. **Analytics** - Track navigation clicks
5. **Newsletter Signup** - Footer newsletter form
6. **Sticky Footer** - Option untuk sticky footer

## Troubleshooting

### Navbar extends beyond viewport width
- Check if max-width container is applied
- Verify no horizontal overflow in child elements

### Footer links not working
- Ensure href is correct
- Check if link is internal (starts with /) or external (http/https)

### Dark mode not working
- Verify ThemeProvider is in layout
- Check if dark class is applied to `<html>` element

### Mobile menu not showing
- Mobile button implemented di navbar (TODO)
- Menu need to be converted to offcanvas drawer

## File Exports

### Navbar Exports (`src/components/navbar/index.ts`)
```tsx
export { Navbar } from './navbar';
export { NavbarMenu, NavbarSearch, NavbarActions, NavbarLink };
export type { NavbarProps, NavItem };
export { NAVBAR_MENU_ITEMS, NAVBAR_CONFIG };
```

### Footer Exports (`src/components/footer/index.ts`)
```tsx
export { Footer } from './footer';
export { FooterColumn, FooterLink, FooterSocial, FooterFootnote };
export type { FooterProps, FooterColumn, FooterLink, FooterSocialLink };
export { FOOTER_COLUMNS, FOOTER_SOCIAL_LINKS, FOOTER_BRAND, FOOTER_CONFIG };
```

## Quick Reference

### Import Navbar
```tsx
import { Navbar } from '@/components/navbar';
```

### Import Footer
```tsx
import { Footer } from '@/components/footer';
```

### Import Sub-components
```tsx
import { 
  NavbarMenu, 
  NavbarSearch,
  NavbarActions,
  NavbarLink 
} from '@/components/navbar';

import {
  FooterColumn,
  FooterLink,
  FooterSocial,
  FooterFootnote
} from '@/components/footer';
```

### Customize Configuration
```tsx
import { NAVBAR_MENU_ITEMS } from '@/components/navbar';
import { FOOTER_COLUMNS, FOOTER_BRAND } from '@/components/footer';
```
