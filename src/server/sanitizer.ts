/**
 * BuildIt Data Sanitizer (Requirement 8.5 & 28.5)
 * Recursively cleans project data before storing in the database.
 * 
 * Rules:
 * - Walks through the JSON tree.
 * - Removes script elements / tags.
 * - Removes attributes that start with "on" (e.g. onclick, onerror, onload).
 * - Removes links that start with "javascript:".
 * - Cleans HTML text stored in the data without removing style attributes,
 *   classes, ids, images, or form fields.
 * - Refuses data exceeding 5 MB.
 * - Safe for server-side execution (no browser DOMPurify dependency).
 */

export const MAX_PROJECT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface SanitizeResult {
  valid: boolean;
  error?: string;
  data?: any;
  sizeBytes?: number;
}

/**
 * Checks if a string starts with "javascript:" (ignoring whitespace and case).
 */
export function isJavascriptUrl(val: string): boolean {
  if (typeof val !== 'string') return false;
  return /^\s*javascript\s*:/i.test(val);
}

/**
 * Checks if an attribute name is an event handler (starts with "on").
 */
export function isEventHandlerAttribute(name: string): boolean {
  if (typeof name !== 'string') return false;
  return /^on[a-z0-9_-]/i.test(name);
}

/**
 * Strips script tags, on* handlers, and javascript: links from raw HTML strings
 * while strictly keeping style, class, id, img, and form elements intact.
 */
export function cleanHtmlString(html: string): string {
  if (typeof html !== 'string' || !html) return html;

  let cleaned = html;

  // 1. Remove <script ...> ... </script> blocks completely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove isolated <script ... /> or <script ...> tags
  cleaned = cleaned.replace(/<script\b[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/script>/gi, '');

  // 3. Remove on* event handler attributes like onclick="..." or onfocus='...' or onerror=...
  cleaned = cleaned.replace(/\s+on[a-z0-9_-]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 4. Neutralize javascript:... in href or src
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');
  cleaned = cleaned.replace(/(href|src|action)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');

  return cleaned;
}

/**
 * Recursively cleans any value or JSON node in a GrapesJS project data structure.
 */
export function sanitizeNode(node: any): any {
  if (node === null || node === undefined) {
    return node;
  }

  // Handle primitives
  if (typeof node === 'string') {
    return cleanHtmlString(node);
  }

  if (typeof node !== 'object') {
    return node;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    const cleanedArray: any[] = [];
    for (const item of node) {
      // If array item is a component representing a script tag, discard it
      if (item && typeof item === 'object') {
        const tagName = String(item.tagName || item.tag || '').toLowerCase();
        const type = String(item.type || '').toLowerCase();
        if (tagName === 'script' || type === 'script') {
          continue;
        }
      }
      cleanedArray.push(sanitizeNode(item));
    }
    return cleanedArray;
  }

  // Handle objects
  const tagName = String(node.tagName || node.tag || '').toLowerCase();
  const type = String(node.type || '').toLowerCase();
  if (tagName === 'script' || type === 'script') {
    return null;
  }

  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(node)) {
    // Check attributes dictionary
    if (key === 'attributes' && value && typeof value === 'object' && !Array.isArray(value)) {
      const cleanAttrs: Record<string, any> = {};
      for (const [attrName, attrVal] of Object.entries(value)) {
        // Strip on* attributes
        if (isEventHandlerAttribute(attrName)) {
          continue;
        }
        // Strip javascript: URLs
        if (typeof attrVal === 'string' && isJavascriptUrl(attrVal)) {
          cleanAttrs[attrName] = '#';
          continue;
        }
        cleanAttrs[attrName] = typeof attrVal === 'string' ? cleanHtmlString(attrVal) : attrVal;
      }
      result[key] = cleanAttrs;
    } else if (key === 'content' && typeof value === 'string') {
      result[key] = cleanHtmlString(value);
    } else {
      result[key] = sanitizeNode(value);
    }
  }

  return result;
}

/**
 * Validates project payload size and cleans project data tree.
 */
export function validateAndCleanProjectData(canvasData: any): SanitizeResult {
  if (!canvasData || typeof canvasData !== 'object') {
    return {
      valid: false,
      error: 'Invalid project data'
    };
  }

  const rawJson = JSON.stringify(canvasData);
  const sizeBytes = Buffer.byteLength(rawJson, 'utf8');

  // Exact requirement: "A project can hold up to 5 MB of data. The system refuses a larger one and says that the project is too large."
  if (sizeBytes > MAX_PROJECT_SIZE_BYTES) {
    return {
      valid: false,
      error: 'This project is too large to save. Remove some images or elements.',
      sizeBytes
    };
  }

  const cleaned = sanitizeNode(canvasData);

  return {
    valid: true,
    data: cleaned,
    sizeBytes
  };
}

/**
 * Permission checker (Requirement 8.7 & 28.4)
 * "Only the project owner, the team host and editors can save. For a viewer, the “Save” button is switched off.
 * (Only owners exist for now. Teams come in Part 3. Write the permission check so it can grow:
 * the owner, the team host and editors can save, a viewer cannot.)"
 */
export function canUserSaveProject(
  userId: string | number,
  project: { ownerId: string | number; teamRole?: string; collaborators?: Array<{ userId: string | number; role: string }> }
): boolean {
  if (!userId || !project) return false;

  const uid = String(userId);
  const ownerId = String(project.ownerId);

  // 1. Owner always can save
  if (uid === ownerId) {
    return true;
  }

  // 2. Team host or editor can save
  if (project.teamRole === 'host' || project.teamRole === 'editor') {
    return true;
  }

  // 3. Viewers cannot save
  if (project.teamRole === 'viewer') {
    return false;
  }

  // 4. Check collaborator list if present
  if (Array.isArray(project.collaborators)) {
    const member = project.collaborators.find((c) => String(c.userId) === uid);
    if (member) {
      if (member.role === 'host' || member.role === 'editor') {
        return true;
      }
      return false; // viewer or unknown role
    }
  }

  return false;
}
