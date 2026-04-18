import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google';

import { QueryProvider } from '@/components/providers/query-provider';
import { SonnerProvider } from '@/components/providers/sonner-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';

import '@/styles/globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Elchub Frontend',
  description: 'Boilerplate frontend based on the reference Next.js app.',
};

const themeInitScript = `
(() => {
  const storageKey = 'elchub-theme';
  const storedTheme = localStorage.getItem(storageKey);
  const theme =
    storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${plusJakartaSans.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <SonnerProvider />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}