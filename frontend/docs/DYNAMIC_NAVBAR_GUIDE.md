# Dynamic Navbar - User Authentication UI

## Overview

The navbar is now dynamic and responds to the user's authentication state:
- **Not logged in**: Shows "Login" link and "Daftar / Join" button
- **Logged in**: Shows user avatar with dropdown menu

## Architecture

### Components

#### 1. **AuthProvider & useAuth Hook** (`src/features/auth/auth-context.tsx`)
- Global authentication context using React Context API
- Manages:
  - User data (`AuthUser` object)
  - Authentication token (stored in localStorage & cookie)
  - Loading state
  - Authentication status (`isAuthenticated`)
  - Logout functionality
- Wraps the entire app in `src/app/layout.tsx`

#### 2. **UserAvatarMenu Component** (`src/components/navbar/user-avatar-menu.tsx`)
- Shows user's initials in a circular avatar button
- Dropdown menu displaying:
  - User name and email
  - Profile link
  - Settings link
  - Logout button (red)
- Responsive and dark mode enabled
- Closes menu when clicking outside (backdrop)

#### 3. **Updated NavbarActions** (`src/components/navbar/navbar-actions.tsx`)
- Now a client component with `'use client'`
- Conditionally renders:
  - Login/Register buttons when NOT authenticated
  - User avatar menu when authenticated
- Uses `useAuth()` hook to check authentication status

## How It Works

### Authentication Flow

```
1. User logs in via /login page
   ↓
2. useAuthPanel() hook persists token to:
   - localStorage (key: 'elchub-auth-token')
   - Cookie ('elchub-auth-token')
   ↓
3. AuthProvider detects token and fetches user data via getMe() API
   ↓
4. NavbarActions detects isAuthenticated = true
   ↓
5. Navbar switches to show UserAvatarMenu instead of login buttons
```

### Token Management

The `AuthProvider` handles:
- Restoring token from localStorage/cookie on app load
- Automatic user data fetching when token exists
- Persisting new tokens when user logs in
- Clearing token and user data on logout
- Using React Query for efficient data fetching and caching

## User Experience

### States

**Unauthenticated:**
```
[Login] [Daftar / Join] [🌙]
```

**Authenticated:**
```
[AB] [🌙]  // AB = user initials
    ↓
    ┌─────────────────┐
    │ Ahmad Burhan    │
    │ a@example.com   │
    ├─────────────────┤
    │ My Profile      │
    │ Settings        │
    ├─────────────────┤
    │ Logout          │
    └─────────────────┘
```

## Integration Points

### In Root Layout (`src/app/layout.tsx`)

```tsx
<ThemeProvider>
  <QueryProvider>
    <AuthProvider>
      <LayoutWrapper>{children}</LayoutWrapper>
      <SonnerProvider />
    </AuthProvider>
  </QueryProvider>
</ThemeProvider>
```

The `AuthProvider` must wrap `LayoutWrapper` to provide auth context to all child components including the navbar.

### In NavbarActions (`src/components/navbar/navbar-actions.tsx`)

```tsx
const { isAuthenticated } = useAuth();

if (isAuthenticated) {
  return <UserAvatarMenu />;
}
// else show login/register buttons
```

## Styling

- **Avatar**: Navy background (#2E417B) with white text
- **Avatar Hover**: Opacity change for feedback
- **Dropdown Menu**: 
  - Light mode: White background with primary/15 border
  - Dark mode: Slate-800 background with slate-700 border
  - Menu items: Hover state with primary/5 background
- **Logout Button**: Red (#EF4444) with hover state
- **Theme Support**: Full dark mode support via Tailwind dark prefix

## API Integration

The navbar doesn't make API calls directly. Instead:
1. `AuthProvider` calls `getMe(token)` API to fetch user data
2. User data cached by React Query
3. Navbar reads data from context (already loaded)

When user logs out:
1. `UserAvatarMenu` calls `logout(token)` API
2. `AuthProvider` clears token and user data
3. Navbar automatically switches to login/register buttons

## Dark Mode

All components support light/dark mode:
- Text colors use Tailwind dark prefix
- Background colors adapt to theme
- Borders have dark mode variants
- Avatar button changes via `dark:bg-blue-600`

## Performance Considerations

- **React Query Caching**: User data cached for 2 minutes
- **Lazy Loading**: UserAvatarMenu only renders when authenticated
- **Minimal Re-renders**: Context updates only relevant components
- **SSR Safe**: Token hydration handled client-side

## Future Enhancements

1. **Avatar Image**: Replace initials with actual user avatar image
2. **Notifications**: Add notification badge to avatar
3. **User Menu Items**: Add more options (Billing, Help, etc.)
4. **Admin Panel**: Add admin-only options based on user role
5. **Theme Toggle**: Move theme toggle inside user menu
6. **Language Switcher**: Add language selection

## Directory Structure

```
src/features/auth/
├── auth-context.tsx          # AuthProvider & useAuth hook
├── components/
│   └── reset-password-card.tsx # Updated (removed token)
├── hooks/
│   └── use-auth-panel.ts      # Existing hook (unchanged)
├── api.ts                     # API functions
├── types.ts                   # Auth types
├── auth-panel.constants.ts    # Constants
└── index.ts                   # Exports

src/components/navbar/
├── navbar.tsx                 # Main navbar
├── navbar-actions.tsx         # Updated (dynamic)
├── user-avatar-menu.tsx       # New (user avatar dropdown)
├── navbar-menu.tsx            # Navigation menu
├── navbar-search.tsx          # Search box
├── navbar-link.tsx            # Link component
├── navbar.types.ts            # Types
└── navbar.constants.ts        # Constants
```

## Testing

To test the dynamic navbar:

1. **Test Unauthenticated State**:
   - Fresh browser (clear localStorage)
   - Navigate to app
   - Verify Login/Register buttons visible

2. **Test Login Flow**:
   - Click "Login" button
   - Enter credentials and submit
   - Verify user avatar appears with initials

3. **Test Avatar Dropdown**:
   - Click avatar
   - Verify dropdown shows user info
   - Click MyProfile/Settings (navigates but pages not implemented)

4. **Test Logout**:
   - Click avatar dropdown
   - Click "Logout"
   - Verify Login/Register buttons return
   - Verify token cleared from storage

5. **Test Dark Mode**:
   - Toggle theme
   - Verify colors adapt correctly
   - Check avatar and dropdown in both modes

## Common Issues & Solutions

**Avatar not showing after login:**
- Check if token is saved in localStorage
- Verify `getMe()` API returns user data
- Check React Query cache in browser DevTools

**Dropdown menu not closing:**
- Verify backdrop click handler attached
- Check z-index layering (backdrop z-40, menu z-50)
- Ensure isOpen state updates correctly

**Dark mode colors incorrect:**
- Verify `dark:` prefix in Tailwind classes
- Check root html has `dark` class applied
- Run `npm run build` and check compiled CSS

**useAuth hook throws error:**
- Ensure AuthProvider wraps component in layout
- Check that component is imported correctly
- Verify context initialization before use
