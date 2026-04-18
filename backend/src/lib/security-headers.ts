import { Elysia } from 'elysia';

export const securityHeaders = new Elysia({ name: 'security-headers' }).onBeforeHandle(({ set }) => {
  set.headers['X-Content-Type-Options'] = 'nosniff';
  set.headers['X-Frame-Options'] = 'DENY';
  set.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  set.headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';
  set.headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  set.headers['Cross-Origin-Resource-Policy'] = 'same-origin';

  if (Bun.env.NODE_ENV === 'production') {
    set.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
  }
});