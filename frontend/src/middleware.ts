import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const authTokenCookieKey = 'elchub_access_token';

const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/auth'];
const protectedPages = ['/dashboard', '/profile', '/settings'];

function startsWithPath(pathname: string, candidates: string[]) {
  return candidates.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(authTokenCookieKey)?.value;
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated && startsWithPath(pathname, protectedPages)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && startsWithPath(pathname, authPages)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
