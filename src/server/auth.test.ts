import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUserId, validateEmail, validatePassword, sanitizeText } from '../lib/validation.ts';
import {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  checkLockout,
  recordFailedAttempt,
  MAX_ATTEMPTS
} from './auth-logic.ts';

test('validateUserId enforces requirements', () => {
  // Empty
  assert.equal(validateUserId('').valid, false);
  assert.equal(validateUserId('').error, 'This field is required');

  // Too short (< 3)
  assert.equal(validateUserId('ab').valid, false);

  // Too long (> 20)
  assert.equal(validateUserId('a'.repeat(21)).valid, false);

  // Invalid characters
  assert.equal(validateUserId('user-name').valid, false);
  assert.equal(validateUserId('user@123').valid, false);
  assert.equal(validateUserId('user name').valid, false);

  // Valid cases
  assert.equal(validateUserId('naimul_123').valid, true);
  assert.equal(validateUserId('user_name').valid, true);
  assert.equal(validateUserId('admin123').valid, true);
});

test('validateEmail validates format correctly', () => {
  assert.equal(validateEmail('').valid, false);
  assert.equal(validateEmail('').error, 'This field is required');
  assert.equal(validateEmail('notanemail').valid, false);
  assert.equal(validateEmail('test@').valid, false);
  assert.equal(validateEmail('student@portcity.edu').valid, true);
});

test('validatePassword requires at least 8 chars, 1 letter, 1 number', () => {
  assert.equal(validatePassword('').valid, false);
  assert.equal(validatePassword('').error, 'This field is required');
  assert.equal(validatePassword('short1A').valid, false); // 7 chars
  assert.equal(validatePassword('onlyletters').valid, false); // no number
  assert.equal(validatePassword('12345678').valid, false); // no letter
  assert.equal(validatePassword('Password123').valid, true);
  assert.equal(validatePassword('pcuCSE322!').valid, true);
});

test('sanitizeText neutralizes XSS characters', () => {
  const dirty = '<script>alert("hack")</script>';
  const clean = sanitizeText(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean, '&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;');
});

test('hashPassword and comparePassword work with bcrypt', async () => {
  const pass = 'SecretPass123';
  const hash = await hashPassword(pass);
  assert.notEqual(hash, pass);
  assert.equal(await comparePassword(pass, hash), true);
  assert.equal(await comparePassword('WrongPass123', hash), false);
});

test('generateToken and verifyToken work with 7-day token payload', () => {
  const payload = { id: 'user-1', userId: 'student_1', role: 'user', email: 'student@example.com' };
  const token = generateToken(payload);
  const result = verifyToken(token);
  assert.equal(result.valid, true);
  assert.equal(result.payload.userId, 'student_1');
});

test('checkLockout blocks after 5 failed attempts within 15 minutes', () => {
  const now = 10000000;
  let record: any = undefined;

  // 4 failed attempts should not lock
  for (let i = 0; i < 4; i++) {
    const res = recordFailedAttempt(record, 'student@example.com', now + i * 1000);
    record = res.record;
    assert.equal(res.locked, false);
  }

  assert.equal(checkLockout(record, now + 5000).locked, false);

  // 5th failed attempt should trigger lockout
  const res5 = recordFailedAttempt(record, 'student@example.com', now + 5000);
  record = res5.record;
  assert.equal(res5.locked, true);

  // checkLockout should return locked
  const lockStatus = checkLockout(record, now + 6000);
  assert.equal(lockStatus.locked, true);
  assert.ok(lockStatus.remainingMs > 0);
});
