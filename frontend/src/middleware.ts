import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const authTokenCookieKey = 'elchub_access_token';

const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];
const protectedPages = ['/dashboard', '/profile', '/settings'];
const managementPages = ['/management'];
const managementRoles = new Set(['ADMIN', 'ORGANIZER']);

function readRoleFromJwt(token: string | undefined) {
  if (!token) return '';

  const parts = token.split('.');
  if (parts.length < 2) return '';

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const decoded = atob(padded);
    const payload = JSON.parse(decoded) as { role?: unknown };
    return typeof payload.role === 'string' ? payload.role : '';
  } catch {
    return '';
  }
}

function startsWithPath(pathname: string, candidates: string[]) {
  return candidates.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authTokenCookieKey)?.value;
  const isAuthenticated = Boolean(token);
  const userRole = readRoleFromJwt(token);

  if (!isAuthenticated && startsWithPath(pathname, protectedPages)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && startsWithPath(pathname, authPages)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (startsWithPath(pathname, managementPages)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!managementRoles.has(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
