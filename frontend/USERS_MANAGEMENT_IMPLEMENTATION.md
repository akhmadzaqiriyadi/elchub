# Users Management Frontend Implementation

## Overview
Implementasi lengkap User Management untuk frontend berdasarkan API documentation dari backend. Mengikuti atomic component pattern dan feature-based architecture.

## File Structure

### Types & API (`frontend/src/features/management/`)
- **types.ts** - TypeScript types untuk Users Management
  - `UserRole` - User roles (USER, ORGANIZER, MENTOR, ADMIN)
  - `UserListItem` - User data model
  - `UserListPayload` - API response untuk list users
  - `UserDetailPayload` - API response untuk single user
  - `CreateUserInput` - Input untuk create user
  - `UpdateUserInput` - Input untuk update user
  - `UserMutationPayload` - Response untuk mutation (create/update/delete)

- **api.ts** - API client functions
  - `getManagementUsers()` - List users dengan filter & pagination
  - `getManagementUserById()` - Get single user
  - `createManagementUser()` - Create user
  - `updateManagementUser()` - Update user
  - `deleteManagementUser()` - Delete user

### Validation (`frontend/src/features/management/validation/`)
- **user-form.ts** - Zod validation schemas
  - `userFormSchema` - Validation untuk create user (termasuk password confirmation)
  - `userUpdateFormSchema` - Validation untuk edit user (password optional)
  - TypeScript types: `UserFormInput`, `UserUpdateFormInput`

### Hooks (`frontend/src/features/management/hooks/`)
- **use-management-users.ts** - Hook untuk list management
  - Search, role filter, status filter
  - Pagination
  - Reset filters functionality
  - React Query integration

- **use-management-user-crud.ts** - Hook untuk create, update, delete
  - `createMutation` - Create user mutation
  - `updateMutation` - Update user mutation
  - `deleteMutation` - Delete user mutation
  - Toast notifications untuk success/error

### Atomic Components (`frontend/src/features/management/components/`)

#### 1. UserTableRow
- **File**: `user-table-row.tsx`
- **Props**: user data, onEdit callback, onDelete callback
- **Features**:
  - Display user info (name, email, role, status, created date)
  - Role badge dengan color coding
  - Status badge (Active/Inactive)
  - Edit dan Delete action buttons

#### 2. UserFormModal
- **File**: `user-form-modal.tsx`
- **Props**: isOpen, onClose, onSubmit, isLoading, editingUser, mode ('create'|'edit')
- **Features**:
  - Modal dialog untuk create/edit user
  - Form fields: name, email, password (create only), role, isActive
  - Password confirmation untuk create mode
  - Optional password update untuk edit mode
  - Form validation dengan Zod schemas
  - React Hook Form integration

#### 3. UserDeleteConfirmModal
- **File**: `user-delete-confirm-modal.tsx`
- **Props**: isOpen, user, onConfirm, onCancel, isLoading
- **Features**:
  - Confirmation modal untuk delete user
  - Display user email & name
  - Warning message about permanent deletion
  - Confirm dan Cancel buttons

#### 4. UserFilters
- **File**: `user-filters.tsx`
- **Props**: search, role filter, status filter, callbacks, reset function
- **Features**:
  - Search by name atau email
  - Filter by role (User, Organizer, Mentor, Admin)
  - Filter by status (Active/Inactive)
  - Reset all filters button
  - Mobile responsive layout

#### 5. ManagementUsersPanel
- **File**: `management-users-panel.tsx`
- **Features**:
  - Main component yang menggabungkan semua atomic components
  - Summary cards (total users, active, inactive, admins)
  - Filter section dengan UserFilters component
  - Users table dengan UserTableRow components
  - Pagination
  - Modal management untuk create/edit/delete
  - Loading dan empty states
  - Integration dengan hooks dan mutations

### Page (`frontend/src/app/management/users/`)
- **page.tsx** - Users Management page
  - Protected dengan ManagementAccessGuard
  - Render ManagementUsersPanel
  - Responsive layout dengan proper spacing

## Features

### List Users
- Search by name atau email (case-insensitive)
- Filter by role
- Filter by active/inactive status
- Pagination support (default 10 items per page)
- Summary statistics (total, active, inactive, admins)
- Loading dan empty states

### Create User
- Modal form dengan validation
- Required fields: email, password
- Optional fields: name, role, isActive
- Password confirmation untuk security
- Role selection dengan dropdown
- Success/error toast notifications

### Edit User
- Modal form untuk edit existing user
- Can update: name, email, role, status
- Can change password (optional)
- Password confirmation jika password diubah
- Pre-filled form dengan user data saat lalu

### Delete User
- Confirmation modal dengan user details
- Warning tentang permanent deletion
- Toast notification setelah success

## Atomic Component Pattern

Setiap component dirancang dengan single responsibility principle:

1. **UserTableRow** - Render single row dalam table
2. **UserFormModal** - Handle form input dengan validation
3. **UserDeleteConfirmModal** - Confirmation dialog
4. **UserFilters** - Filter controls
5. **ManagementUsersPanel** - Orchestrate semua atomic components

## API Integration

### Query Parameters
```
GET /api/management/users
  ?q=search_term          # Search by name atau email
  &role=ADMIN             # Filter by role
  &isActive=true          # Filter by status
  &page=1                 # Page number (default: 1)
  &limit=10               # Items per page (default: 10, max: 50)
```

### Request Examples

**Create User**
```json
POST /api/management/users
{
  "name": "Admin Baru",
  "email": "admin2@elchub.local",
  "password": "SuperSecretPassword123!",
  "role": "ADMIN",
  "isActive": true
}
```

**Update User**
```json
PATCH /api/management/users/:id
{
  "role": "ORGANIZER",
  "isActive": false
}
```

**Delete User**
```
DELETE /api/management/users/:id
```

## State Management

- **React Query** - Server state management (useQuery, useMutation)
- **React Hook Form** - Form state management
- **Zustand** - Auth store untuk access token
- **Sonner** - Toast notifications

## Styling

- **Tailwind CSS** - Utility-first CSS
- **Dark mode** - Full dark mode support dengan `dark:` prefix
- **Responsive** - Mobile-first responsive design

## Error Handling

- Form validation errors ditampilkan di bawah input fields
- API errors ditampilkan sebagai toast notifications
- Network errors handled gracefully
- Disabled state untuk buttons saat loading/saving

## Example Usage

```tsx
// Page component
import { ManagementUsersPanel } from '@/features/management/components/management-users-panel';

export default function UsersPage() {
  return <ManagementUsersPanel />;
}
```

## Next Steps

1. Test dengan backend API
2. Verify token authentication works properly
3. Test create/edit/delete operations
4. Test search dan filters
5. Test pagination
6. Verify error handling
7. Test dark mode

## Notes

- Semua components adalah client components (`'use client'`)
- Protected dengan ManagementAccessGuard (admin only)
- Real-time updates setelah mutations dengan query invalidation
- Optimistic UI updates dengan React Query
- Mobile responsive design
- Accessible form components dengan proper labels
