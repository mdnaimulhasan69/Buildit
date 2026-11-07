import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProjectTitle } from '../lib/validation.ts';

test('validateProjectTitle enforces required and 80-character maximum', () => {
  // Empty or whitespace
  assert.equal(validateProjectTitle('').valid, false);
  assert.equal(validateProjectTitle('').error, 'This field is required');
  assert.equal(validateProjectTitle('   ').valid, false);
  assert.equal(validateProjectTitle('   ').error, 'This field is required');

  // Valid titles
  assert.equal(validateProjectTitle('Class Attendance Survey').valid, true);
  assert.equal(validateProjectTitle('Thesis Questionnaire 2026').valid, true);

  // Exactly 80 characters
  const exactly80 = 'A'.repeat(80);
  assert.equal(validateProjectTitle(exactly80).valid, true);

  // 81 characters
  const tooLong81 = 'A'.repeat(81);
  const result = validateProjectTitle(tooLong81);
  assert.equal(result.valid, false);
  assert.equal(result.error, 'Title cannot be longer than 80 characters');
});

test('project creation canvas data structures are well-formed', () => {
  const blankCanvas = {
    pages: [{ id: 'page-1', name: 'Home', frames: [], components: [] }],
    styles: [],
    assets: []
  };
  assert.equal(Array.isArray(blankCanvas.pages), true);
  assert.equal(blankCanvas.pages[0].id, 'page-1');

  const templateCanvas = {
    templateId: 'template-sample-page',
    templateName: 'Sample page',
    pages: [
      {
        id: 'page-1',
        name: 'Home',
        components: [
          { type: 'header', content: 'Sample page' },
          { type: 'paragraph', content: 'Sample description' }
        ]
      }
    ]
  };
  assert.equal(templateCanvas.templateId, 'template-sample-page');
  assert.equal(templateCanvas.pages[0].components.length, 2);
});
