import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanHtmlString,
  sanitizeNode,
  validateAndCleanProjectData,
  canUserSaveProject,
  MAX_PROJECT_SIZE_BYTES
} from './sanitizer.ts';

test('cleanHtmlString removes script tags and on* event handlers', () => {
  const dirty = '<div><h1>Title</h1><script>alert("hack")</script><p onclick="doEvil()">Text</p></div>';
  const clean = cleanHtmlString(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('alert("hack")'), false);
  assert.equal(clean.includes('onclick'), false);
  assert.equal(clean.includes('<h1>Title</h1>'), true);
  assert.equal(clean.includes('<p>Text</p>'), true);
});

test('cleanHtmlString neutralizes javascript: links without touching legitimate links', () => {
  const dirty = '<a href="javascript:stealCookie()">Click me</a><a href="https://portcity.edu">PCIU</a>';
  const clean = cleanHtmlString(dirty);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('href="#"'), true);
  assert.equal(clean.includes('https://portcity.edu'), true);
});

test('cleanHtmlString preserves styles, classes, ids, images, and form fields (Requirement 8)', () => {
  const preserved = '<div id="box-1" class="container-box" style="padding: 24px; color: #1e293b;"><img src="https://example.com/pic.jpg" alt="Photo" /><input type="text" name="fullName" placeholder="Enter name" /><button type="submit" class="btn-primary" style="background: blue;">Submit</button></div>';
  const result = cleanHtmlString(preserved);
  assert.equal(result.includes('id="box-1"'), true);
  assert.equal(result.includes('class="container-box"'), true);
  assert.equal(result.includes('style="padding: 24px; color: #1e293b;"'), true);
  assert.equal(result.includes('src="https://example.com/pic.jpg"'), true);
  assert.equal(result.includes('input type="text"'), true);
  assert.equal(result.includes('button type="submit"'), true);
});

test('sanitizeNode cleans GrapesJS JSON tree structure', () => {
  const projectTree = {
    pages: [
      {
        id: 'p1',
        frames: [
          {
            component: {
              type: 'wrapper',
              components: [
                {
                  tagName: 'script',
                  content: 'console.log("bad");'
                },
                {
                  tagName: 'button',
                  content: 'Click here',
                  attributes: {
                    onclick: 'alert(1)',
                    id: 'btn-1',
                    class: 'btn-blue',
                    style: 'color: white;'
                  }
                },
                {
                  tagName: 'a',
                  content: 'Link',
                  attributes: {
                    href: 'javascript:void(0)',
                    class: 'nav-link'
                  }
                }
              ]
            }
          }
        ]
      }
    ],
    styles: [
      {
        selectors: ['.btn-blue'],
        style: { background: '#2563eb' }
      }
    ]
  };

  const cleaned = sanitizeNode(projectTree);
  const wrapper = cleaned.pages[0].frames[0].component;

  // Script component dropped
  assert.equal(wrapper.components.length, 2);

  // Button attributes cleaned: onclick gone, id, class, style kept
  const btn = wrapper.components[0];
  assert.equal(btn.attributes.onclick, undefined);
  assert.equal(btn.attributes.id, 'btn-1');
  assert.equal(btn.attributes.class, 'btn-blue');
  assert.equal(btn.attributes.style, 'color: white;');

  // Link href neutralized
  const link = wrapper.components[1];
  assert.equal(link.attributes.href, '#');
  assert.equal(link.attributes.class, 'nav-link');

  // Styles kept
  assert.equal(cleaned.styles[0].style.background, '#2563eb');
});

test('validateAndCleanProjectData rejects payloads exceeding 5 MB with exact error', () => {
  // Generate a payload exceeding 5 MB
  const largeChunk = 'x'.repeat(1024 * 1024); // 1 MB string
  const oversizedData = {
    pages: [
      { c1: largeChunk, c2: largeChunk, c3: largeChunk, c4: largeChunk, c5: largeChunk, c6: largeChunk }
    ]
  };

  const result = validateAndCleanProjectData(oversizedData);
  assert.equal(result.valid, false);
  assert.equal(result.error, 'This project is too large to save. Remove some images or elements.');
});

test('canUserSaveProject enforces permissions correctly (Requirement 8.7 & 28.4)', () => {
  // 1. Owner can save
  assert.equal(canUserSaveProject('10', { ownerId: '10' }), true);
  assert.equal(canUserSaveProject(10, { ownerId: 10 }), true);

  // 2. Non-owner without team role cannot save
  assert.equal(canUserSaveProject('99', { ownerId: '10' }), false);

  // 3. Team host and editor can save
  assert.equal(canUserSaveProject('99', { ownerId: '10', teamRole: 'host' }), true);
  assert.equal(canUserSaveProject('99', { ownerId: '10', teamRole: 'editor' }), true);

  // 4. Team viewer cannot save
  assert.equal(canUserSaveProject('99', { ownerId: '10', teamRole: 'viewer' }), false);

  // 5. Collaborators list
  const teamProject = {
    ownerId: '10',
    collaborators: [
      { userId: '20', role: 'editor' },
      { userId: '30', role: 'viewer' }
    ]
  };
  assert.equal(canUserSaveProject('20', teamProject), true);
  assert.equal(canUserSaveProject('30', teamProject), false);
  assert.equal(canUserSaveProject('40', teamProject), false);
});
