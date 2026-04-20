/**
 * Layout wrapper component
 * Conditionally shows/hides navbar and footer based on current route
 */

'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  // Check if current route is an auth page
  const isAuthPage = pathname.startsWith('/auth');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar - Hidden on auth pages */}
      {!isAuthPage && <Navbar />}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Hidden on auth pages */}
      {!isAuthPage && <Footer />}
    </div>
  );
}
