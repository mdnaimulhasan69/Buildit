import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateProfileName,
  validateProfileBio,
  validateSocialLink,
  validateProfilePicture
} from '../lib/validation.ts';

test('validateProfileName enforces required and 50 characters max', () => {
  assert.equal(validateProfileName('').valid, false);
  assert.equal(validateProfileName('   ').valid, false);
  assert.equal(validateProfileName('Valid Name').valid, true);
  assert.equal(validateProfileName('A'.repeat(50)).valid, true);
  assert.equal(validateProfileName('A'.repeat(51)).valid, false);
  assert.equal(validateProfileName('A'.repeat(51)).error, 'Name cannot be longer than 50 characters');
});

test('validateProfileBio allows up to 300 characters', () => {
  assert.equal(validateProfileBio('').valid, true);
  assert.equal(validateProfileBio(undefined).valid, true);
  assert.equal(validateProfileBio('A'.repeat(300)).valid, true);
  assert.equal(validateProfileBio('A'.repeat(301)).valid, false);
  assert.equal(validateProfileBio('A'.repeat(301)).error, 'Bio cannot be longer than 300 characters');
});

test('validateSocialLink enforces http:// or https://', () => {
  assert.equal(validateSocialLink('').valid, true);
  assert.equal(validateSocialLink('https://github.com/user').valid, true);
  assert.equal(validateSocialLink('http://twitter.com/user').valid, true);
  assert.equal(validateSocialLink('javascript:alert(1)').valid, false);
  assert.equal(validateSocialLink('ftp://example.com').valid, false);
  assert.equal(validateSocialLink('github.com/user').valid, false);
});

test('validateProfilePicture enforces JPG, PNG or WebP up to 2 MB', () => {
  assert.equal(validateProfilePicture('image/jpeg', 1024 * 1024).valid, true);
  assert.equal(validateProfilePicture('image/png', 2 * 1024 * 1024).valid, true);
  assert.equal(validateProfilePicture('image/webp', 500 * 1024).valid, true);

  // Invalid type (e.g. gif or pdf)
  const invalidType = validateProfilePicture('image/gif', 100);
  assert.equal(invalidType.valid, false);
  assert.equal(invalidType.error, 'Use a JPG, PNG or WebP picture of up to 2 MB.');

  // Over 2 MB
  const tooLarge = validateProfilePicture('image/png', 2 * 1024 * 1024 + 1);
  assert.equal(tooLarge.valid, false);
  assert.equal(tooLarge.error, 'Use a JPG, PNG or WebP picture of up to 2 MB.');
});
