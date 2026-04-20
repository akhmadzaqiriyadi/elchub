# UCH Connection Auth Pages - Refactoring Documentation

## Overview

The auth pages have been refactored to follow the **feature-based architecture** with professional styling matching the landing page design. The monolithic `AuthPanel` component has been decomposed into four dedicated form components, each with its own dedicated page route.

## Architecture

### Folder Structure

```
src/features/auth/
├── components/
│   ├── auth-layout.tsx              # Professional layout wrapper
│   ├── login-form.tsx               # Login form component
│   ├── register-form.tsx            # Registration form component
│   ├── forgot-password-form.tsx     # Forgot password form
│   ├── reset-password-form.tsx      # Password reset form
│   ├── auth-panel.tsx               # (Legacy - to be removed)
│   └── auth-shell.tsx               # (Legacy - replaced by AuthLayout)
├── hooks/
│   ├── use-auth-panel.ts            # Main auth state management hook
│   └── use-auth-form-animation.ts   # Form entrance animations
├── api.ts                            # Backend API calls
├── types.ts                          # TypeScript types
└── auth-panel.constants.ts, auth-panel.types.ts, auth-panel.utils.ts
```

### Page Routes

Each auth flow now has a **dedicated page route**:

```
src/app/auth/
├── page.tsx                 # Redirects to /login
├── login/
│   └── page.tsx            # Login page
├── register/
│   └── page.tsx            # Registration page
├── forgot-password/
│   └── page.tsx            # Forgot password page
└── reset-password/
    └── page.tsx            # Password reset page
```

## Key Components

### 1. AuthLayout

**File:** `components/auth-layout.tsx`

Professional layout wrapper for all auth pages with:
- **Sticky header** with UCH Connection logo and theme toggle
- **Back button** for navigation
- **Title and description** sections with proper spacing
- **Professional footer** with privacy and home links
- **Gradient background** matching landing page aesthetic
- **Brand colors** (#2E417B primary blue) throughout
- **Dark mode support** with proper contrasts

**Usage:**
```tsx
<AuthLayout
  title="Login ke Akun"
  description="Masukkan email dan password"
>
  <LoginForm />
</AuthLayout>
```

**Features:**
- Responsive design (mobile-first)
- Consistent brand identity
- Accessible navigation
- Theme persistence

### 2. Form Components

#### LoginForm
- **File:** `components/login-form.tsx`
- **Fields:** Email, Password
- **Actions:** Login button, forgot password link, register link
- **Validation:** Form-level error handling
- **States:** Loading state with spinner

#### RegisterForm
- **File:** `components/register-form.tsx`  
- **Fields:** Full Name, Email, Password, Confirm Password
- **Actions:** Register button, login link
- **Validation:** Password confirmation validation
- **States:** Loading state with spinner

#### ForgotPasswordForm
- **File:** `components/forgot-password-form.tsx`
- **Fields:** Email
- **Actions:** Send reset link button, back to login
- **Success State:** Green success message after submission
- **Validation:** Email format validation

#### ResetPasswordForm
- **File:** `components/reset-password-form.tsx`
- **Fields:** Reset Token, New Password, Confirm Password
- **Actions:** Reset button, navigation to login on success
- **Success State:** Green success message with next steps
- **Validation:** Token and password validation

### 3. Animation Hook

**File:** `hooks/use-auth-form-animation.ts`

Custom hook for form entrance animations on mount:

```tsx
const formRef = useAuthFormAnimation({ delay: 0.2 });

return <div ref={formRef}><LoginForm /></div>;
```

**Animation Details:**
- **Type:** Fade-up entrance animation
- **Initial State:** Opacity 0, translateY 30px
- **Final State:** Opacity 1, translateY 0
- **Duration:** 0.8 seconds (customizable)
- **Easing:** power2.out (smooth deceleration)
- **Delay:** Configurable per page
- **Library:** GSAP 3.15.0

**Configuration Options:**
```tsx
interface UseAuthFormAnimationOptions {
  delay?: number;        // Animation delay in seconds (default: 0)
  duration?: number;     // Animation duration (default: 0.8)
}
```

## Styling

### Brand Colors

All auth pages use consistent brand colors:

```css
/* Primary Blue */
.bg-[#2E417B]         /* Dark blue backgrounds */
.text-[#2E417B]       /* Dark blue text */
.text-[#2E417B]/70    /* Dark blue with opacity */

/* Button States */
.bg-[#1f2a52]         /* Darker shade for hover */
.hover:bg-[#1f2a52]   /* Hover state */

/* Dark Mode */
.dark:bg-blue-600     /* Blue-600 in dark mode */
.dark:text-blue-400   /* Blue-400 text in dark mode */
```

### Component Classes

**Input Fields:**
- Brand blue borders and focus states
- Proper spacing and typography
- Dark mode support with slate colors

**Buttons:**
- Primary: Brand blue (#2E417B) background
- Secondary: Outline style (light backgrounds)
- Disabled state with reduced opacity
- Loading state with spinner icon

**Error Messages:**
- Red text color for accessibility
- Small font size for distinction
- User-friendly error descriptions

**Success Messages:**
- Green background with proper contrast
- Icon + text for visual clarity
- Full width on forms
- Automatic hide on form change

## State Management

### useAuthPanel Hook

All forms use the centralized `useAuthPanel` hook for state management:

```tsx
const {
  // Login/Register states
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  name, setName,
  
  // Forgot password states
  forgotEmail, setForgotEmail,
  
  // Reset password states
  resetTokenInput, setResetTokenInput,
  resetPasswordInput, setResetPasswordInput,
  resetConfirmPasswordInput, setResetConfirmPasswordInput,
  
  // Error states
  errors, setErrors,
  recoveryErrors, setRecoveryErrors,
  
  // Loading states
  isSubmitting,
  isSubmittingForgot,
  isSubmittingReset,
  
  // Handlers
  onSubmit,
  onForgotPasswordSubmit,
  onResetPasswordSubmit,
} = useAuthPanel();
```

## Benefits of Refactoring

### 1. **Single Responsibility Principle**
- Each form component handles only one auth flow
- Reduced complexity (each form ~100 lines vs. monolithic 200+ line component)
- Easier to test and maintain

### 2. **Improved User Experience**
- Dedicated pages for each flow (no mode switching)
- Professional layout with consistent branding
- Smooth entrance animations
- Success/error states for better feedback

### 3. **Feature-Based Architecture**
- Clear separation of concerns
- Layer structure: components → hooks → api → types → constants
- Consistent with landing page design patterns
- Easier to scale and maintain

### 4. **Type Safety**
- Full TypeScript support across all components
- Proper typing for form data and errors
- Better IDE autocomplete and error detection

### 5. **Accessibility**
- Proper ARIA labels on form fields
- Semantic HTML structure
- Clear focus states
- Keyboard navigation support

## Navigation Flow

```
Login Page
  ├── Register Link → /register
  └── Forgot Password Link → /forgot-password

Register Page
  └── Login Link → /login

Forgot Password Page
  ├── Back Button → /login
  └── Reset Token from Email → /reset-password

Reset Password Page
  ├── Back Button → /login
  └── Success → Navigate to /login
```

## Form Validation

### LoginForm
- Email: Required, valid email format
- Password: Required, minimum 8 characters

### RegisterForm
- Name: Required, minimum 2 characters
- Email: Required, valid email format
- Password: Required, minimum 8 characters
- Confirm Password: Must match password

### ForgotPasswordForm
- Email: Required, valid email format

### ResetPasswordForm
- Token: Required, non-empty
- Password: Required, minimum 8 characters
- Confirm Password: Must match password

## Implementation Details

### Error Handling

1. **Form Validation Errors**
   - Shown below each field
   - Red text with `FieldError` component
   - Cleared on user input

2. **Backend Errors**
   - Parsed from API response
   - Assigned to appropriate fields
   - User-friendly error messages with Sonner toast notifications

3. **Success States**
   - Green success banner for password recovery flows
   - Automatic form reset after successful submission
   - Toast notifications for confirmation

### Loading States

- **isSubmitting:** For login/register forms
- **isSubmittingForgot:** For forgot password form
- **isSubmittingReset:** For reset password form
- All buttons disabled during submission
- Spinner icon shown with loading text

## Future Improvements

1. **Individual Hooks per Form**
   - Decompose `useAuthPanel` into form-specific hooks
   - Reduce hook size and improve maintainability

2. **Email Verification**
   - Add optional email verification step after registration
   - Implement resend email logic

3. **Multi-factor Authentication**
   - Add 2FA support (TOTP, SMS, email)
   - Dedicated MFA flow page

4. **Social Authentication**
   - Add OAuth providers (Google, GitHub, etc.)
   - Social login buttons on all pages

5. **Enhanced Error Handling**
   - Rate limiting feedback
   - Network error retry logic
   - Offline mode detection

## Testing

### Component Tests
```tsx
// Test login form submission
test('LoginForm submits with valid credentials', async () => {
  const { getByAltText, getByRole } = render(<LoginForm />);
  // ... test implementation
});
```

### Page Tests
```tsx
// Test page renders with proper layout
test('LoginPage renders with AuthLayout', () => {
  const { getByText } = render(<LoginPage />);
  expect(getByText('Login ke Akun')).toBeInTheDocument();
});
```

### Integration Tests
```tsx
// Test full auth flow
test('User can login and navigate to dashboard', async () => {
  // ... test implementation
});
```

## Migration Checklist

- [x] Create individual form components
- [x] Create dedicated page routes
- [x] Create AuthLayout wrapper
- [x] Add form animations with GSAP
- [x] Update styling to match landing page
- [x] Update navigation links between pages
- [ ] Remove legacy AuthPanel component (after testing)
- [ ] Remove legacy AuthShell component (after testing)
- [ ] Add unit tests for form components
- [ ] Add integration tests for auth flows
- [ ] Update backend API documentation
- [ ] Deploy and monitor auth usage metrics

## Quick Reference

### To Add a New Auth Flow

1. Create form component: `components/new-flow-form.tsx`
2. Create page route: `src/app/auth/new-flow/page.tsx`
3. Import AuthLayout and form component in page
4. Add animation wrapper in page
5. Update navigation links in other forms
6. Add form validation in hooks (if needed)

### To Modify Form Styling

1. Edit the form component file
2. Update Tailwind classes
3. Ensure brand colors (#2E417B) consistency
4. Test dark mode support
5. Verify mobile responsiveness

### To Change Animation Behavior

Edit `hooks/use-auth-form-animation.ts`:
- Adjust `delay` parameter in pages
- Modify `duration` in hook options
- Change `ease` function (default: "power2.out")
- Update initial state values (opacity, transform)
