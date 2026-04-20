/**
 * Auth Layout
 * Nested layout for auth pages (login, register, forgot-password, reset-password)
 * Navbar and footer are hidden by LayoutWrapper at root level based on pathname
 */

import { Suspense } from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {children}
    </Suspense>
  );
}
