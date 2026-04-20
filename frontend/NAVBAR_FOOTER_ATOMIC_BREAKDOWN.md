# Navbar & Footer - Atomic Component Breakdown

## Navbar Component Tree

```
Navbar (Main Component)
├── Brand Logo & Name (Link)
│   └── Hardcoded Logo Circle
├── NavbarMenu
│   └── NavItem (Map)
│       ├── NavbarLink (Direct)
│       └── Dropdown Menu (Conditional)
│           ├── NavbarLink (Child items)
│           ├── NavbarLink (Child items)
│           └── ...
├── NavbarSearch
│   ├── Search Icon (Lucide)
│   ├── Input Field
│   └── Clear Button (X Icon)
├── NavbarActions
│   ├── Login NavbarLink
│   └── Register Button
└── ThemeToggle
    └── (From @/components/ui/theme-toggle)
```

## Footer Component Tree

```
Footer (Main Component)
└── Grid Layout (md:2 lg:5)
    ├── Brand Section
    │   ├── Logo & Name (Link)
    │   ├── Tagline Text
    │   └── FooterSocial
    │       ├── Instagram Link + Icon
    │       ├── LinkedIn Link + Icon
    │       └── YouTube Link + Icon
    ├── FooterColumn (Learning & Events)
    │   ├── Title
    │   └── Link List
    │       ├── FooterLink
    │       ├── FooterLink
    │       └── ...
    ├── FooterColumn (Support & Help)
    │   ├── Title
    │   └── Link List
    │       ├── FooterLink
    │       ├── FooterLink
    │       └── ...
    ├── FooterColumn (Partnership)
    │   ├── Title
    │   └── Link List
    │       ├── FooterLink
    │       └── FooterLink
    └── FooterFootnote
        ├── Verification Message
        └── Copyright Text
```

## Atomic Components Breakdown

### Single Responsibility Principle

Setiap komponen punya satu tanggung jawab utama:

| Component | Responsibility | Lines |
|-----------|------------------|-------|
| **NavbarLink** | Render single link dengan styling | ~25 |
| **NavbarMenu** | Render menu items + dropdown logic | ~60 |
| **NavbarSearch** | Render search field + clear functionality | ~55 |
| **NavbarActions** | Render action buttons (login/register) | ~20 |
| **Navbar** | Orchestrate all sections + layout | ~70 |
| **FooterLink** | Render single footer link | ~35 |
| **FooterColumn** | Render column title + link list | ~25 |
| **FooterSocial** | Render social media icons | ~30 |
| **FooterFootnote** | Render copyright + verification message | ~25 |
| **Footer** | Orchestrate all sections + layout | ~65 |

### Reusability Matrix

```
┌─────────────────────────────────────────┐
│         REUSABILITY LEVELS              │
├─────────────────────────────────────────┤
│ HIGH (Used in multiple places)          │
├─────────────────────────────────────────┤
│ • NavbarLink (menu items, actions)      │
│ • FooterLink (all foot columns)         │
│ • Button (from ui)                      │
│ • ThemeToggle (layout + navbar)         │
├─────────────────────────────────────────┤
│ MEDIUM (Composed from small components) │
├─────────────────────────────────────────┤
│ • NavbarMenu (uses NavbarLink)          │
│ • FooterColumn (uses FooterLink)        │
│ • Navbar (uses all navbar components)   │
│ • Footer (uses all footer components)   │
├─────────────────────────────────────────┤
│ LOW (Single use in parent)              │
├─────────────────────────────────────────┤
│ • NavbarSearch (only in Navbar)         │
│ • NavbarActions (only in Navbar)        │
│ • FooterSocial (only in Footer)         │
│ • FooterFootnote (only in Footer)       │
└─────────────────────────────────────────┘
```

## Layer Separation Architecture

### Constants Layer
```
navbar.constants.ts:
├── NAVBAR_MENU_ITEMS (Static menu data)
└── NAVBAR_CONFIG (Style & config values)

footer.constants.ts:
├── FOOTER_COLUMNS (Content structure)
├── FOOTER_SOCIAL_LINKS (Social data)
├── FOOTER_BRAND (Brand information)
└── FOOTER_CONFIG (Style & config values)
```

### Types Layer
```
navbar.types.ts:
├── NavItem (Menu item structure)
└── NavbarProps (Component props)

footer.types.ts:
├── FooterLink (Link structure)
├── FooterColumn (Column structure)
├── FooterSocialLink (Social link structure)
└── FooterProps (Component props)
```

### Components Layer (Atomic)
```
Components WITHOUT state/logic:
├── NavbarLink (Pure rendering)
├── FooterLink (Pure rendering)
└── FooterColumn (Pure rendering)

Components WITH minimal state/logic:
├── NavbarSearch (Local input state)
├── NavbarMenu (Dropdown state)
└── FooterSocial (Pure rendering)

Components WITH composition:
├── Navbar (Composes all navbar sub-components)
└── Footer (Composes all footer sub-components)
```

## Data Flow Diagram

### Navbar Data Flow

```
navbar.constants.ts (NAVBAR_MENU_ITEMS)
           ↓
       Navbar.tsx
           ↓
    NavbarMenu.tsx
           ↓
    NavbarLink.tsx (rendered for each item)
```

### Footer Data Flow

```
footer.constants.ts
     ↓
  ├─→ FOOTER_COLUMNS → Footer.tsx → FooterColumn.tsx → FooterLink.tsx
     ├─→ FOOTER_BRAND
     ├─→ FOOTER_SOCIAL_LINKS → FooterSocial.tsx
     └─→ FOOTER_CONFIG
```

## Styling Architecture

### Color Tokens

```
src/components/navbar:
├── Primary: #2E417B (navy)
├── Hover: #1f2a52 (darker navy)
└── Dark mode: blue-600, blue-400

src/components/footer:
├── Primary: #2E417B (navy)
├── Text: slate-600/700 (medium gray)
├── Text hover: #2E417B (navy)
└── Dark mode: slate-300/400
```

### Class Strategy

```
Utility-first (Tailwind):
├── Layout: flex, grid, gap-*, px-*, py-*
├── Spacing: flex-1, flex-col, items-center
├── Sizing: h-*, w-*, max-w-7xl
├── Typography: text-sm, font-medium, font-bold
├── Colors: text-[#2E417B], dark:text-slate-300
├── Effects: hover:color, transition-colors
└── Responsive: hidden sm:flex lg:block
```

## State Management

### Navbar States

```
NavbarSearch:
├── query (string) - Search input value
└── isFocused (boolean) - Input focus state

NavbarMenu:
└── openDropdown (string | null) - Currently open dropdown

Navbar (Parent):
└── No state (composition only)
```

### Footer States

```
Footer:
└── No state (static rendering)

All footer components:
└── Pure functional components (no state)
```

## Performance Characteristics

### Rendering

```
STATIC COMPONENTS (Pure rendering):
├── NavbarLink - Never re-render (no state/props changes expected)
├── NavbarActions - Never re-render
├── FooterLink - Never re-render
├── FooterColumn - Re-render only if FOOTER_COLUMNS changes
└── FooterSocial - Re-render only if FOOTER_SOCIAL_LINKS changes

DYNAMIC COMPONENTS (May have state changes):
├── NavbarSearch - Re-render on query/focus changes
├── NavbarMenu - Re-render on dropdown toggle
├── Navbar - Re-render if children change
└── Footer - Re-render if constants change
```

### Bundle Size Estimate

```
navbar.tsx (all files):
├── navbar.tsx: ~70 lines
├── navbar-menu.tsx: ~60 lines
├── navbar-search.tsx: ~55 lines
├── navbar-actions.tsx: ~20 lines
├── navbar-link.tsx: ~25 lines
├── navbar.types.ts: ~15 lines
├── navbar.constants.ts: ~40 lines
└── Total: ~285 lines (~4KB minified)

footer.tsx (all files):
├── footer.tsx: ~65 lines
├── footer-column.tsx: ~25 lines
├── footer-link.tsx: ~35 lines
├── footer-social.tsx: ~30 lines
├── footer-footnote.tsx: ~25 lines
├── footer.types.ts: ~20 lines
├── footer.constants.ts: ~55 lines
└── Total: ~255 lines (~3.5KB minified)

Combined: ~8.5KB minified (gzip: ~3KB)
```

## Accessibility Features

### Navbar
```
✓ Semantic HTML: <header>, <nav>
✓ Link elements: Proper <a> tags for navigation
✓ Button elements: Proper <button> for interactive
✓ Icons: Decorative (no aria-label duplicating text)
✓ Focus states: Visible ring styling
✓ Color contrast: WCAG AA compliant
✓ Mobile menu: Button with aria-label (TODO)
```

### Footer
```
✓ Semantic HTML: <footer>
✓ Link elements: Proper <a> tags with href
✓ Headings: Proper <h3> for section titles
✓ External links: target="_blank", rel="noopener noreferrer"
✓ Social icons: ARIA labels for each link
✓ Color contrast: WCAG AA compliant
✓ Focus states: Visible on keyboard navigation
```

## Testing Strategy

### Unit Tests (Component Level)

```
NavbarLink.test.tsx:
├── ✓ Should render link with correct href
├── ✓ Should apply active styles when isActive=true
└── ✓ Should apply custom className

NavbarSearch.test.tsx:
├── ✓ Should update query on input change
├── ✓ Should clear input when clear button clicked
├── ✓ Should call onSearch callback

NavbarMenu.test.tsx:
├── ✓ Should render all menu items
├── ✓ Should toggle dropdown on button click
└── ✓ Should render dropdown children

FooterLink.test.tsx:
├── ✓ Should render internal link with Link component
├── ✓ Should render external link with <a> tag
└── ✓ Should open external in new tab

FooterColumn.test.tsx:
├── ✓ Should render column title
└── ✓ Should render all column links
```

### Integration Tests

```
Navbar.test.tsx:
├── ✓ Should render all sections (brand, menu, search, actions)
├── ✓ Should display mobile button on small screens
└── ✓ Should apply sticky positioning

Footer.test.tsx:
├── ✓ Should render all columns
├── ✓ Should render social links
└── ✓ Should display copyright and verification message
```

## Customization Points

### Adding New Menu Item

```typescript
// Edit: navbar.constants.ts
export const NAVBAR_MENU_ITEMS = [
  // ... existing items
  {
    label: 'New Item',
    href: '/new-path',
    // or dropdown:
    children: [{ label: 'Submenu', href: '/submenu' }],
    isDropdown: true,
  }
];
```

### Adding New Footer Column

```typescript
// Edit: footer.constants.ts
export const FOOTER_COLUMNS = [
  // ... existing columns
  {
    title: 'New Column',
    links: [
      { label: 'Link 1', href: '/path1' },
      { label: 'Link 2', href: '/path2' },
    ],
  }
];
```

### Changing Colors

```typescript
// Update in component files:
// Change: 'text-[#2E417B]' to your color
// Change: 'hover:text-[#1f2a52]' to your hover color
// Change: 'dark:text-slate-300' to your dark mode color
```

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Dropdown not appearing | CSS specificity or display issues | Check z-index and overflow properties |
| Search not clearing | Clear button onClick not working | Verify handleClear function is connected |
| Footer links not styled | Class not applied | Check if FooterLink wrapper is rendering |
| Dark mode not working | Dark class not on html | Verify ThemeProvider in layout |
| Mobile menu missing | Not implemented yet | TODO: Add mobile drawer |

## Future Enhancements

### Phase 1 (MVP - Completed)
- ✅ Navbar dengan menu & search
- ✅ Footer dengan 4 kolom
- ✅ Dark mode support
- ✅ Responsive design

### Phase 2 (Enhancement)
- [ ] Mobile offcanvas menu
- [ ] Search functionality integration
- [ ] Dynamic menu from API/CMS
- [ ] Newsletter signup footer form

### Phase 3 (Advanced)
- [ ] Mega menu untuk kategori kompleks
- [ ] Breadcrumb navigation
- [ ] Sticky footer newsletter
- [ ] Analytics tracking

## File Organization Best Practices

```
✓ Types → Components → Constants pattern
✓ Barrel exports (index.ts) untuk cleaner imports
✓ CSS-in-JS dengan Tailwind (no separate CSS files)
✓ Atomic sizing (~25-70 lines per component)
✓ Reusable within constraints
✓ Dark mode consideration in every component
✓ Accessibility built-in (semantic HTML, ARIA)
```

## Maintenance Checklist

- [ ] Update menu items in navbar.constants.ts
- [ ] Update footer content in footer.constants.ts
- [ ] Verify all links are correct and up-to-date
- [ ] Test responsive design on multiple devices
- [ ] Test dark mode functionality
- [ ] Check accessibility with keyboard navigation
- [ ] Update social media links in FOOTER_SOCIAL_LINKS
- [ ] Verify brand colors are consistent with brand guidelines
