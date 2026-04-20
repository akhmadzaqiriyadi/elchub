# Modal Components - Atomic UI Library

## Overview

A complete set of atomic modal components for displaying confirmations, warnings, and dialogs. All modals follow the same design pattern with consistent styling, animations, and behavior.

## Components

### 1. BaseModal
The foundation component for all other modals. Provides the basic modal structure with backdrop and container.

**Props:**
```tsx
type BaseModalProps = {
  isOpen: boolean;           // Controls modal visibility
  onClose: () => void;       // Called when modal should close
  title: string;             // Modal header title
  description?: string;      // Optional subtitle
  children: React.ReactNode; // Modal content
  className?: string;        // Custom styling
  backdrop?: boolean;        // Show/hide backdrop (default: true)
};
```

**Usage:**
```tsx
<BaseModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Simple Modal"
  description="This is a basic modal"
>
  <p>Your custom content here</p>
</BaseModal>
```

---

### 2. AgreeModal
Modal for positive confirmations (agree, accept, confirm).

**Features:**
- Green "Agree" button (primary action)
- Cancel button (secondary action)
- Loading state support
- Async operation handling

**Props:**
```tsx
type AgreeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void | Promise<void>;  // Called when user agrees
  title: string;
  description?: string;
  message: string;                    // Main message content
  agreeText?: string;                 // Agree button text (default: "Agree")
  declineText?: string;               // Cancel button text (default: "Cancel")
  isLoading?: boolean;                // Show loading state
};
```

**Usage:**
```tsx
const [isOpen, setIsOpen] = useState(false);

<AgreeModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onAgree={async () => {
    await acceptTerms();
  }}
  title="Accept Terms"
  message="Do you agree to our terms and conditions?"
  agreeText="Accept"
  declineText="Decline"
/>
```

**Color Scheme:**
- Agree Button: Green (#16a34a)
- Cancel Button: Secondary (white/slate)

---

### 3. DeclineModal
Modal for negative actions or refusals.

**Features:**
- Orange "Decline" button (negative action)
- Cancel button (secondary action)
- Loading state support
- Async operation handling

**Props:**
```tsx
type DeclineModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDecline: () => void | Promise<void>;  // Called when user declines
  title: string;
  description?: string;
  message: string;
  declineText?: string;              // Decline button text (default: "Decline")
  cancelText?: string;               // Cancel button text (default: "Cancel")
  isLoading?: boolean;
};
```

**Usage:**
```tsx
<DeclineModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onDecline={async () => {
    await rejectOffer();
  }}
  title="Reject Offer"
  message="Are you sure you want to reject this offer?"
  declineText="Reject"
  cancelText="Go Back"
/>
```

**Color Scheme:**
- Decline Button: Orange (#ea580c)
- Cancel Button: Secondary (white/slate)

---

### 4. WarningModal
Modal for warning/caution messages.

**Features:**
- Yellow warning icon
- Warning styling
- Optional confirmation button
- Optional action (can be info-only)
- Loading state support

**Props:**
```tsx
type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void | Promise<void>;  // Called when user confirms
  title: string;
  description?: string;
  message: string;
  confirmText?: string;              // Confirm button text (default: "Understand")
  cancelText?: string;               // Close button text (default: "Close")
  isLoading?: boolean;
  showActions?: boolean;             // Show action buttons (default: true)
};
```

**Usage:**
```tsx
// Info-only warning
<WarningModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Storage Warning"
  message="Your storage is almost full (95%). Please delete some files to continue."
  showActions={true}
/>

// Warning with confirmation
<WarningModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async () => {
    await continueWithWarning();
  }}
  title="Action Required"
  message="This action cannot be undone. Click 'Understand' to continue."
  confirmText="Yes, Continue"
/>
```

**Color Scheme:**
- Warning Icon: Yellow (#ca8a04)
- Confirm Button: Yellow (#ca8a04)
- Close Button: Secondary (white/slate)

---

### 5. LogoutConfirmModal
Specialized modal for logout confirmation with logout-specific messaging.

**Features:**
- Red logout icon
- User-specific messaging
- Logout warning text
- Loading state support
- Displays user name in message

**Props:**
```tsx
type LogoutConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;  // Called when user confirms logout
  isLoading?: boolean;
  userName?: string;                      // User name for personalized message
};
```

**Usage:**
```tsx
const { user, logout, isLoading } = useAuth();
const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

<LogoutConfirmModal
  isOpen={isLogoutModalOpen}
  onClose={() => setIsLogoutModalOpen(false)}
  onConfirm={logout}
  isLoading={isLoading}
  userName={user?.name || user?.email}
/>
```

**Color Scheme:**
- Icon: Red (#dc2626)
- Logout Button: Red (#dc2626)
- Cancel Button: Secondary (white/slate)

---

## Design Patterns

### Responsive Layout
- Mobile: Full width with padding (max-width: 24rem)
- Desktop: Centered on screen
- Content: Scrollable if exceeds screen height

### Dark Mode Support
All modals include full dark mode support:
- Light mode: White background, slate borders
- Dark mode: Slate-800 background, slate-700 borders
- Text colors adapt automatically

### Animations
- Backdrop: Fade effect (opacity)
- Modal: Smooth scale and opacity
- Buttons: Hover/focus transitions

### Accessibility
- Keyboard: Escape key closes modal
- Focus: Trapped within modal
- ARIA: Proper button roles
- Backdrop: Click to close pattern

---

## Common Usage Examples

### 1. Delete Confirmation
```tsx
const [isDeleteOpen, setIsDeleteOpen] = useState(false);

return (
  <>
    <button onClick={() => setIsDeleteOpen(true)}>
      Delete Item
    </button>
    
    <AgreeModal
      isOpen={isDeleteOpen}
      onClose={() => setIsDeleteOpen(false)}
      onAgree={async () => {
        await deleteItem();
      }}
      title="Delete Item?"
      message="This action cannot be undone. Are you sure?"
      agreeText="Delete"
      declineText="Cancel"
    />
  </>
);
```

### 2. Logout Confirmation
```tsx
// Already integrated in UserAvatarMenu
// Just use LogoutConfirmModal as shown above
```

### 3. Update Warning
```tsx
<WarningModal
  isOpen={isUpdateOpen}
  onClose={() => setIsUpdateOpen(false)}
  onConfirm={async () => {
    await proceedWithUpdate();
  }}
  title="System Update"
  message="An update is available. Updating will require a restart."
  confirmText="Update Now"
/>
```

### 4. Permission Decline
```tsx
<DeclineModal
  isOpen={isDeclineOpen}
  onClose={() => setIsDeclineOpen(false)}
  onDecline={async () => {
    await rejectPermission();
  }}
  title="Deny Permission"
  message="Denying this permission may limit functionality."
  declineText="Deny Anyway"
/>
```

---

## Styling & Customization

### Color Variants

| Modal Type | Button Color | Hex Code |
|-----------|------------|----------|
| Agree | Green | #16a34a |
| Decline | Orange | #ea580c |
| Warning | Yellow | #ca8a04 |
| Logout | Red | #dc2626 |

### Custom Styling

Pass `className` prop to BaseModal for custom styles:

```tsx
<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Custom Modal"
  className="max-w-lg" // Custom width
>
  Content
</BaseModal>
```

---

## Integration Checklist

- [x] Base modal with backdrop
- [x] Agree modal (green button)
- [x] Decline modal (orange button)
- [x] Warning modal (yellow button)
- [x] Logout confirm modal (red button)
- [x] Dark mode support
- [x] Loading states
- [x] Responsive design
- [x] User avatar menu integration

---

## File Structure

```
src/components/ui/
├── modal.tsx                    # Base modal component
├── agree-modal.tsx              # Agree modal variant
├── decline-modal.tsx            # Decline modal variant
├── warning-modal.tsx            # Warning modal variant
├── logout-confirm-modal.tsx     # Logout confirmation modal
└── modals.ts                    # Barrel export

src/components/navbar/
└── user-avatar-menu.tsx         # Updated with logout modal
```

---

## Future Enhancements

1. **Animation Library**: Add GSAP animations for modals
2. **Custom Icons**: Allow custom icon prop in modals
3. **Action Variants**: More button variants (danger, success)
4. **Form Modals**: Modal with form inputs
5. **Stacking**: Support for multiple modals
6. **Animations**: Add slide-in or fade animations
7. **Sound Effects**: Optional notification sounds
8. **Accessibility**: Enhanced screen reader support
