export interface User {
  id: string; // Internal unique ID or UUID
  userId: string; // Unique username (3-20 chars, letters, numbers, _)
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  picture?: string;
  socialLinks?: Record<string, string>;
  role: 'user' | 'administrator';
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface UserPublicProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  picture?: string;
  socialLinks?: Record<string, string>;
  role: 'user' | 'administrator';
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: UserPublicProfile;
  expiresAt: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  picture: string;
  category?: string;
  createdAt: string;
}

export interface LoginAttemptRecord {
  email: string;
  attempts: number[]; // timestamps of failed attempts
  lockedUntil?: number; // timestamp when unlock occurs
}

export interface AlertNotification {
  id: string;
  type: 'success' | 'error';
  message: string;
  timestamp: number;
}

export interface Project {
  id: string;
  title: string;
  ownerId: string;
  ownerName?: string;
  teamId?: string;
  canvasData: Record<string, any> | string;
  status: 'draft' | 'published';
  address?: string;
  visibility: 'private' | 'public';
  price: number;
  updatedAt: string;
  createdAt: string;
}

