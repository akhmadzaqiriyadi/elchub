import { describe, expect, test } from 'bun:test';

import { comparePassword, createAccessToken, hashPassword, verifyAccessToken } from '../../../src/lib/auth';

describe('pre-integration auth rules', () => {
  test('hashPassword + comparePassword should validate the same password', async () => {
    const rawPassword = 'StrongPass123!';
    const passwordHash = await hashPassword(rawPassword);

    expect(passwordHash).not.toBe(rawPassword);

    const valid = await comparePassword(rawPassword, passwordHash);
    const invalid = await comparePassword('WrongPassword123!', passwordHash);

    expect(valid).toBe(true);
    expect(invalid).toBe(false);
  });

  test('createAccessToken + verifyAccessToken should preserve user claims', async () => {
    const token = await createAccessToken({
      userId: 'user_test_001',
      email: 'tester@elchub.local',
      role: 'ADMIN',
    });

    const verified = await verifyAccessToken(token);

    expect(verified.payload.sub).toBe('user_test_001');
    expect(verified.payload.email).toBe('tester@elchub.local');
    expect(verified.payload.role).toBe('ADMIN');
  });
});