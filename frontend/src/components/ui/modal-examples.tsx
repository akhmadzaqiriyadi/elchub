/**
 * Modal Components - Quick Reference & Examples
 * 
 * This file contains example implementations of each modal type.
 * Copy and adapt the code for your use cases.
 * 
 * NOTE: These are example functions and not used in production.
 */

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { AgreeModal } from '@/components/ui/agree-modal';
import { DeclineModal } from '@/components/ui/decline-modal';
import { WarningModal } from '@/components/ui/warning-modal';
import { LogoutConfirmModal } from '@/components/ui/logout-confirm-modal';
import { BaseModal } from '@/components/ui/modal';

// Placeholder async functions for examples
const acceptTerms = async () => console.log('Terms accepted');
const rejectOffer = async () => console.log('Offer rejected');
const dangerousOperation = async () => console.log('Operation completed');

// ============================================================
// 1. AGREE MODAL - For positive confirmations
// ============================================================

function TermsAcceptance() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAccept = async () => {
    setIsLoading(true);
    try {
      // Call API
      await acceptTerms();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Accept Terms</button>

      <AgreeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onAgree={handleAccept}
        title="Terms & Conditions"
        description="Please read carefully"
        message="Do you agree to our terms and conditions?"
        agreeText="Accept"
        declineText="Decline"
        isLoading={isLoading}
      />
    </>
  );
}

// ============================================================
// 2. DECLINE MODAL - For negative actions
// ============================================================

function RejectOffer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    setIsLoading(true);
    try {
      await rejectOffer();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Reject</button>

      <DeclineModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onDecline={handleReject}
        title="Reject Offer"
        description="Are you sure?"
        message="Rejecting this offer means you cannot revisit it later. Are you sure?"
        declineText="Reject Anyway"
        cancelText="Keep Offer"
        isLoading={isLoading}
      />
    </>
  );
}

// ============================================================
// 3. WARNING MODAL - For alerts and warnings
// ============================================================

// Example 1: Info-only warning (no actions needed)
function StorageWarning() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Check Storage</button>

      <WarningModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Storage Almost Full"
        message="You are using 95% of your storage. Please delete some files to continue."
        showActions={true}
        confirmText="Delete Files"
      />
    </>
  );
}

// Example 2: Warning that requires confirmation
function DangerousAction() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await dangerousOperation();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Delete All</button>

      <WarningModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleContinue}
        title="Permanent Deletion"
        description="This cannot be undone"
        message="This action will permanently delete all items. There is no way to recover them."
        confirmText="Delete All"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </>
  );
}

// ============================================================
// 4. LOGOUT CONFIRM MODAL - Already integrated in navbar
// ============================================================

function LogoutButton() {
  const { user, logout, isLoading } = useAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsLogoutOpen(true)}>Logout</button>

      <LogoutConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={logout}
        isLoading={isLoading}
        userName={user?.name || user?.email}
      />
    </>
  );
}

// ============================================================
// 5. USING BASE MODAL - For custom content
// ============================================================

function CustomModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Custom Modal</button>

      <BaseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Custom Content"
        description="Add any content you want"
      >
        <div className="space-y-4">
          <p>Any React content goes here</p>
          <input
            type="text"
            placeholder="Custom input field"
            className="w-full px-3 py-2 border rounded"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Close
          </button>
        </div>
      </BaseModal>
    </>
  );
}

// ============================================================
// IMPORTING COMPONENTS
// ============================================================

// All components are already imported at the top:
// import { AgreeModal } from '@/components/ui/agree-modal';
// import { DeclineModal } from '@/components/ui/decline-modal';
// import { WarningModal } from '@/components/ui/warning-modal';
// import { LogoutConfirmModal } from '@/components/ui/logout-confirm-modal';
// import { BaseModal } from '@/components/ui/modal';

// Or use barrel export:
// import {
//   AgreeModal,
//   DeclineModal,
//   WarningModal,
//   LogoutConfirmModal,
//   BaseModal,
// } from '@/components/ui/modals';

// ============================================================
// MODAL PATTERNS & BEST PRACTICES
// ============================================================

/*
PATTERN 1: Simple Confirmation
- Ag
User initiates action (button click)
- Show confirmation modal
- User confirms or cancels
- If confirmed, execute action
*/

/*
PATTERN 2: Warning + Action
- Show warning about consequences
- User must explicitly confirm to proceed
- May disable button during loading
*/

/*
PATTERN 3: Info Modal
- Show information (no callback needed)
- User acknowledges by closing
- Good for alerts, tips, warnings
*/

/*
PATTERN 4: Custom Modal
- Use BaseModal for unique layouts
- Fill with custom content
- Handle state manually
*/

// ============================================================
// STATE MANAGEMENT TIPS
// ============================================================

/*
Use custom hook to manage modal state:

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  
  const handle = async (fn: () => Promise<void>) => {
    setIsLoading(true);
    try {
      await fn();
      close();
    } finally {
      setIsLoading(false);
    }
  };

  return { isOpen, isLoading, open, close, handle };
};

// Usage:
const { isOpen, isLoading, open, close, handle } = useModal();

<AgreeModal
  isOpen={isOpen}
  onClose={close}
  onAgree={() => handle(myAsyncFunction)}
  isLoading={isLoading}
  // ... other props
/>
*/
