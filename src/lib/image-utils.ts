import DOMPurify from 'dompurify';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  dataUrl?: string;
  filename?: string;
}

/**
 * Validates and processes an uploaded image according to Requirement 7.6 and 28.5:
 * - Formats allowed: JPG, PNG, WebP, SVG
 * - Maximum size: 5 MB (5 * 1024 * 1024 bytes)
 * - Error message: "Use a JPG, PNG, WebP or SVG image under 5 MB."
 * - SVG files have all <script> tags and event handlers stripped before use.
 */
export async function validateAndProcessImage(file: File): Promise<ImageValidationResult> {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

  const isTypeValid = allowedMimeTypes.includes(file.type) || allowedExts.includes(ext);
  const isSizeValid = file.size > 0 && file.size <= 5 * 1024 * 1024; // 5 MB max

  if (!isTypeValid || !isSizeValid) {
    return {
      valid: false,
      error: 'Use a JPG, PNG, WebP or SVG image under 5 MB.'
    };
  }

  try {
    if (file.type === 'image/svg+xml' || ext === 'svg') {
      const rawSvg = await file.text();

      // Clean SVG using DOMPurify if in DOM environment
      let sanitizedSvg = rawSvg;
      if (typeof DOMPurify !== 'undefined' && typeof (DOMPurify as any).sanitize === 'function') {
        sanitizedSvg = (DOMPurify as any).sanitize(rawSvg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
          FORBID_ATTR: [
            'onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout',
            'onmouseenter', 'onmouseleave', 'onfocus', 'onblur', 'href'
          ]
        });
      }

      // Enforce strict stripping of script tags and inline handlers (Requirement 28.5)
      const safeSvg = sanitizedSvg
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\bon[a-zA-Z]+\s*=\s*(["']).*?\1/gi, '')
        .replace(/\bon[a-zA-Z]+\s*=[^"'\s>]+/gi, '')
        .replace(/javascript\s*:/gi, '');

      if (!safeSvg.trim().startsWith('<svg') && !safeSvg.includes('<svg')) {
        return {
          valid: false,
          error: 'Use a JPG, PNG, WebP or SVG image under 5 MB.'
        };
      }

      const encoded = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(safeSvg);
      return {
        valid: true,
        dataUrl: encoded,
        filename: file.name
      };
    }

    // For JPG, PNG, WebP: convert arrayBuffer to base64
    const buffer = await file.arrayBuffer();
    let base64 = '';
    if (typeof Buffer !== 'undefined') {
      base64 = Buffer.from(buffer).toString('base64');
    } else {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64 = btoa(binary);
    }

    const mime = file.type || (ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : 'image/png');
    return {
      valid: true,
      dataUrl: `data:${mime};base64,${base64}`,
      filename: file.name
    };
  } catch (err) {
    console.error('Image processing error:', err);
    return {
      valid: false,
      error: 'Use a JPG, PNG, WebP or SVG image under 5 MB.'
    };
  }
}
