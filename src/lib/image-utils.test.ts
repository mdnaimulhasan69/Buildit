import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateAndProcessImage } from './image-utils.ts';

describe('Image upload validation and sanitization (Requirement 7.6 & 28.5)', () => {
  it('accepts valid small PNG image', async () => {
    const pngBytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    const file = new File([pngBytes], 'diagram.png', { type: 'image/png' });
    const result = await validateAndProcessImage(file);
    assert.strictEqual(result.valid, true);
    assert.ok(result.dataUrl?.startsWith('data:image/png'));
  });

  it('rejects unsupported file type (e.g. PDF or GIF) with exact required error message', async () => {
    const file = new File(['%PDF-1.4'], 'document.pdf', { type: 'application/pdf' });
    const result = await validateAndProcessImage(file);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'Use a JPG, PNG, WebP or SVG image under 5 MB.');
  });

  it('rejects file larger than 5 MB with exact required error message', async () => {
    // 5MB + 1 byte
    const largeBuffer = new Uint8Array(5 * 1024 * 1024 + 10);
    const file = new File([largeBuffer], 'giant.jpg', { type: 'image/jpeg' });
    const result = await validateAndProcessImage(file);
    assert.strictEqual(result.valid, false);
    assert.strictEqual(result.error, 'Use a JPG, PNG, WebP or SVG image under 5 MB.');
  });

  it('sanitizes SVG files and strips script tags (Requirement 28.5)', async () => {
    const maliciousSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <circle cx="50" cy="50" r="40" fill="red" />
        <script>alert("xss")</script>
      </svg>
    `;
    const file = new File([maliciousSvg], 'icon.svg', { type: 'image/svg+xml' });
    const result = await validateAndProcessImage(file);
    assert.strictEqual(result.valid, true);
    assert.ok(result.dataUrl);

    // Decode URL and ensure no <script> exists
    const decoded = decodeURIComponent(result.dataUrl.replace('data:image/svg+xml;charset=utf-8,', ''));
    assert.strictEqual(decoded.includes('<script>'), false);
    assert.strictEqual(decoded.includes('alert('), false);
    assert.ok(decoded.includes('<circle'));
  });
});
