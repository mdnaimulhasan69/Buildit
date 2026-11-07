import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginAttemptRecord } from '../types/index.ts';

import crypto from 'node:crypto';

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  jwtSecret = crypto.randomBytes(32).toString('hex');
  console.warn('[BuildIt Security Warning] JWT_SECRET environment variable is missing. Generated an ephemeral runtime secret.');
}

export function getJwtSecret(): string {
  return jwtSecret!;
}

const TOKEN_EXPIRY = '7d'; // 7 days as required by Requirement 3.5

export const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export const MAX_ATTEMPTS = 5;

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: { id: string; userId: string; role: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): { valid: boolean; payload?: any; expired?: boolean; error?: string } {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { valid: true, payload: decoded };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return { valid: false, expired: true, error: 'Your login has expired. Please log in again.' };
    }
    return { valid: false, error: 'Invalid token' };
  }
}

/**
 * Check if an email is currently locked out due to >= 5 failed attempts in 15 minutes.
 */
export function checkLockout(record: LoginAttemptRecord | undefined, now: number = Date.now()): { locked: boolean; remainingMs: number } {
  if (!record) return { locked: false, remainingMs: 0 };
  
  if (record.lockedUntil && record.lockedUntil > now) {
    return { locked: true, remainingMs: record.lockedUntil - now };
  }

  // Filter out attempts older than 15 minutes
  const recentAttempts = (record.attempts || []).filter(ts => now - ts < ATTEMPT_WINDOW_MS);
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const lockoutUntil = recentAttempts[recentAttempts.length - 1] + LOCKOUT_DURATION_MS;
    if (lockoutUntil > now) {
      return { locked: true, remainingMs: lockoutUntil - now };
    }
  }

  return { locked: false, remainingMs: 0 };
}

/**
 * Record a failed attempt and determine if lockout should trigger.
 */
export function recordFailedAttempt(record: LoginAttemptRecord | undefined, email: string, now: number = Date.now()): { record: LoginAttemptRecord; locked: boolean } {
  const currentAttempts = (record?.attempts || []).filter(ts => now - ts < ATTEMPT_WINDOW_MS);
  currentAttempts.push(now);

  let lockedUntil: number | undefined = undefined;
  let locked = false;

  if (currentAttempts.length >= MAX_ATTEMPTS) {
    locked = true;
    lockedUntil = now + LOCKOUT_DURATION_MS;
  }

  const updatedRecord: LoginAttemptRecord = {
    email: email.toLowerCase(),
    attempts: currentAttempts,
    lockedUntil
  };

  return { record: updatedRecord, locked };
}

import { OAuth2Client } from 'google-auth-library';

export async function verifyGoogleIdToken(token: string): Promise<{
  valid: boolean;
  payload?: { email: string; name: string; picture?: string; sub: string };
  error?: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return {
      valid: false,
      error: 'Google Sign-In is not configured. Please add GOOGLE_CLIENT_ID to your environment (see SETUP_STEPS.md step 1).'
    };
  }

  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: clientId
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return { valid: false, error: 'Invalid Google token payload' };
    }

    return {
      valid: true,
      payload: {
        email: payload.email.toLowerCase(),
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        sub: payload.sub
      }
    };
  } catch (err: any) {
    console.error('Google token verification failed:', err.message);
    return {
      valid: false,
      error: 'Google sign-in token could not be verified. Please try again.'
    };
  }
}

