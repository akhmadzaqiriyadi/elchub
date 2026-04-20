# Modal Components - Visual Reference

## Modal Anatomy

```
┌─────────────────────────────────┐
│ Modal Title                  [×] │  ← Header (title, close button)
│ Optional Description            │
├─────────────────────────────────┤
│                                 │
│ Modal Content Area              │  ← Children / Custom content
│ This is where your message      │
│ or custom content goes          │
│                                 │
│ [Secondary Button] [Primary Button] │  ← Action Buttons (if applicable)
└─────────────────────────────────┘
```

---

## Modal Types & Visual Appearance

### 1. AGREE MODAL (Positive / Confirmations)
```
┌─────────────────────────────────┐
│ ✓ Accept Terms & Conditions     │
│ Please read carefully           │
├─────────────────────────────────┤
│                                 │
│ Do you agree to our terms       │
│ and conditions?                 │
│                                 │
│ [Cancel]  [✓ Accept]            │
└─────────────────────────────────┘

Button Colors:
- Cancel: Secondary (White/Slate background)
- Accept: Green (#16a34a)

Use When:
✓ Accepting terms/privacy policy
✓ Confirming positive actions
✓ Agreeing to conditions
✓ Opt-in confirmations
```

**Example Scenarios:**
- Subscribe to newsletter
- Accept license agreement
- Confirm purchase
- Enable feature

---

### 2. DECLINE MODAL (Negative / Refusals)
```
┌─────────────────────────────────┐
│ ✗ Reject Offer                  │
│ Are you sure?                   │
├─────────────────────────────────┤
│                                 │
│ Rejecting this offer means you  │
│ cannot revisit it later.        │
│                                 │
│ [Keep Offer] [✗ Reject]         │
└─────────────────────────────────┘

Button Colors:
- Keep Offer: Secondary (White/Slate background)
- Reject: Orange (#ea580c)

Use When:
✗ Rejecting offers/invitations
✗ Declining permissions
✗ Refusing actions
✗ Opt-out confirmations
```

**Example Scenarios:**
- Reject job offer
- Decline feature invitation
- Deny permission request
- Cancel subscription

---

### 3. WARNING MODAL (Caution / Alert)
```
┌─────────────────────────────────┐
│ ⚠ Storage Almost Full           │
│ Important notice                │
├─────────────────────────────────┤
│                                 │
│ ⚠ You are using 95% of your     │
│ storage. Please delete some     │
│ files to continue.              │
│                                 │
│ [Close]  [Delete Files]         │
└─────────────────────────────────┘

Icon: Yellow warning symbol (#ca8a04)
Button Colors:
- Close: Secondary (White/Slate background)
- Confirm: Yellow (#ca8a04)

Use When:
⚠ Warning about consequences
⚠ Storage/quota alerts
⚠ Dangerous actions
⚠ Important notifications
⚠ System warnings
```

**Example Scenarios:**
- Storage limit warning
- Password expiration notice
- Data loss warning
- Maintenance alert
- Version deprecation

---

### 4. LOGOUT CONFIRM MODAL (Special / Logout)
```
┌─────────────────────────────────┐
│ → Logout Confirmation           │
│ Confirm your action             │
├─────────────────────────────────┤
│                                 │
│ → Apakah kamu yakin ingin       │
│ logout, Ahmad?                  │
│                                 │
│ Anda akan keluar dari akun      │
│ dan perlu login ulang.          │
│                                 │
│ [Cancel]  [Yes, Logout]         │
└─────────────────────────────────┘

Icon: Red logout/exit symbol (#dc2626)
Button Colors:
- Cancel: Secondary (White/Slate background)  
- Yes, Logout: Red (#dc2626)

Use When:
→ Confirming logout action
→ Account security measures
→ Session termination

Features:
- Displays user name for personalization
- Shows warning about re-login required
```

**Where Used:**
- Integrated in UserAvatarMenu
- Click avatar → Click Logout button → Shows this modal

---

## Color Palette

| Type | Color | Hex | Usage |
|------|-------|-----|-------|
| **Agree** | Green | #16a34a | Positive confirmations |
| **Decline** | Orange | #ea580c | Negative actions |
| **Warning** | Yellow | #ca8a04 | Caution notices |
| **Logout** | Red | #dc2626 | Logout confirmation |

### Background Colors (Dark Mode)
| Type | Light Mode | Dark Mode |
|------|-----------|----------|
| **Backdrop** | rgba(0,0,0,0.5) | rgba(0,0,0,0.7) |
| **Modal** | White (#fff) | Slate-800 (#1e293b) |
| **Headers** | Slate-100 (#f1f5f9) | Slate-700 (#334155) |

---

## Modal States

### Default State
```
┌────────────────────┐
│ Title              │
├────────────────────┤
│ Content area       │
│ [Cancel] [Action]  │
└────────────────────┘
```

### Loading State
```
┌────────────────────┐
│ Title              │
├────────────────────┤
│ Content area       │
│ [Cancel] [Loading...]
└────────────────────┘
```
- Action button disabled
- Button text changes to "Loading..."
- Cursor becomes "not-allowed"

### Disabled State
```
┌────────────────────┐
│ Title              │
├────────────────────┤
│ Content area       │
│ [Cancel] [Action]  │  (both buttons appear faded)
└────────────────────┘
```
- All interactive elements disabled
- Reduced opacity
- No hover effects

---

## Interaction Flow Diagrams

### Agree Modal Flow
```
User clicks action
        ↓
    Modal opens
        ↓
    User chooses:
    ├─ Cancel: Modal closes (no action)
    └─ Agree: 
        ├─ Loading state
        └─ Execute onAgree() callback
           └─ Modal auto-closes (if no error)
```

### Warning Modal Flow
```
System detects issue
        ↓
    Modal opens
        ↓
    User chooses:
    ├─ Close: Modal closes (no action)
    └─ Confirm (if available):
        ├─ Loading state
        └─ Execute onConfirm() callback
           └─ Modal auto-closes (if no error)
```

### Logout Modal Flow
```
User clicks avatar
        ↓
    Dropdown opens
        ↓
    User clicks Logout button
        ↓
    Dropdown closes
        ↓
    Logout Modal opens
        ↓
    User chooses:
    ├─ Cancel: Modal closes
    └─ Yes, Logout:
        ├─ Loading state
        ├─ Call logout()
        ├─ Token cleared
        ├─ User redirected (if configured)
        └─ Modal auto-closes
```

---

## Responsive Behavior

### Desktop (≥768px)
```
Centered on screen
Width: max-width sm (384px)
Positioned: fixed inset-0
```

### Tablet (480px - 767px)
```
Centered on screen  
Width: 100% - padding (16px sides)
Positioned: fixed inset-0
```

### Mobile (<480px)
```
Centered on screen
Width: 100% - padding (16px sides)
May show in full-screen mode
Positioned: fixed inset-0
```

---

## Dark Mode Variations

### Light Mode
```
┌─────────────────────┐ ← White background
│ #2E417B Title       │ ← Navy text
│ Gray description    │ ← Gray
├─────────────────────┤ ← Light border
│ Light content       │ ← Gray text
│                     │
│ [Gray] [Color]      │ ← Buttons
└─────────────────────┘
```

### Dark Mode
```
┌─────────────────────┐ ← Slate-800 background
│ Light text          │ ← Slate-100 text
│ Gray description    │ ← Slate-400
├─────────────────────┤ ← Dark border
│ Light content       │ ← Slate-300
│                     │
│ [Dark] [Color]      │ ← Buttons
└─────────────────────┘
```

---

## Usage Decision Tree

```
Do you need a modal?
│
├─ Yes → What kind of action?
│   │
│   ├─ Positive confirmation?
│   │  └─→ Use AgreeModal (Green button)
│   │
│   ├─ Negative action?
│   │  └─→ Use DeclineModal (Orange button)
│   │
│   ├─ Warning/Alert?
│   │  └─→ Use WarningModal (Yellow button)
│   │
│   ├─ Logout?
│   │  └─→ Use LogoutConfirmModal (Red button)
│   │
│   └─ Custom content?
│      └─→ Use BaseModal + custom content
│
└─ No → Don't use modal
```

---

## Accessibility Features

✓ **Keyboard Navigation**
  - Escape key closes modal
  - Tab moves between buttons
  - Enter triggers focused button

✓ **Screen Reader Support**
  - Proper ARIA roles
  - Semantic HTML
  - Button labels

✓ **Focus Management**
  - Focus locked within modal
  - Auto-focus to primary button (optional)
  - Restore focus on close

✓ **Color Contrast**
  - WCAG AA compliant
  - High contrast text
  - Color-blind friendly

---

## Performance Considerations

- **Lazy Loading**: Modals render conditionally (only when `isOpen = true`)
- **Event Handling**: Click outside closes modal (backdrop)
- **Focus Trap**: Prevents tabbing outside modal
- **Backdrop Click**: Only works when modal is open

---

## Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Latest 2 versions |
| Firefox | ✅ Full | Latest 2 versions |
| Safari | ✅ Full | Latest 2 versions |
| Edge | ✅ Full | Latest 2 versions |
| Mobile Chrome | ✅ Full | iOS 12+ |
| Mobile Safari | ✅ Full | iOS 12+ |

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Use modal for every confirmation (can be annoying)
- Override the color scheme without reason
- Add too much content (modals are modal for a reason)
- Hide important information in small text
- Use multiple modals at once

✅ **DO:**
- Use modals for important decisions
- Keep messages clear and concise
- Provide clear action labels
- Test on mobile devices
- Ensure accessibility compliance
