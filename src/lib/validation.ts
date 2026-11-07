/**
 * Validation and sanitization rules for BuildIt
 */

export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateUserId(userId: string): { valid: boolean; error?: string } {
  if (!userId || !userId.trim()) {
    return { valid: false, error: 'This field is required' };
  }
  const trimmed = userId.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return { valid: false, error: 'User ID must be between 3 and 20 characters' };
  }
  const regex = /^[a-zA-Z0-9_]+$/;
  if (!regex.test(trimmed)) {
    return { valid: false, error: 'User ID can only contain letters, numbers, and the "_" character' };
  }
  return { valid: true };
}

export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || !email.trim()) {
    return { valid: false, error: 'This field is required' };
  }
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'This field is required' };
  }
  if (password.length < 8) {
    return { valid: false, error: 'Password must have at least 8 characters' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return { valid: false, error: 'Password must include at least one letter and one number' };
  }
  return { valid: true };
}

export function validateRequired(value: string): { valid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { valid: false, error: 'This field is required' };
  }
  return { valid: true };
}

export function validateProjectTitle(title: string): { valid: boolean; error?: string } {
  if (!title || !title.trim()) {
    return { valid: false, error: 'This field is required' };
  }
  const trimmed = title.trim();
  if (trimmed.length > 80) {
    return { valid: false, error: 'Title cannot be longer than 80 characters' };
  }
  return { valid: true };
}

export function validateProfileName(name: string): { valid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { valid: false, error: 'This field is required' };
  }
  const trimmed = name.trim();
  if (trimmed.length > 50) {
    return { valid: false, error: 'Name cannot be longer than 50 characters' };
  }
  return { valid: true };
}

export function validateProfileBio(bio?: string | null): { valid: boolean; error?: string } {
  if (!bio) return { valid: true };
  if (bio.length > 300) {
    return { valid: false, error: 'Bio cannot be longer than 300 characters' };
  }
  return { valid: true };
}

export function validateSocialLink(url: string): { valid: boolean; error?: string } {
  if (!url || !url.trim()) return { valid: true };
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return { valid: false, error: 'Social link must start with https:// or http://' };
  }
  return { valid: true };
}

export function validateProfilePicture(fileType: string, sizeBytes: number): { valid: boolean; error?: string } {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(fileType.toLowerCase())) {
    return { valid: false, error: 'Use a JPG, PNG or WebP picture of up to 2 MB.' };
  }
  if (sizeBytes > 2 * 1024 * 1024) {
    return { valid: false, error: 'Use a JPG, PNG or WebP picture of up to 2 MB.' };
  }
  return { valid: true };
}


