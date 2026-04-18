import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

import { env } from '../config/env';

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export type JwtUserPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function createAccessToken(payload: JwtUserPayload) {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_TTL)
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string) {
  return jwtVerify(token, accessSecret);
}