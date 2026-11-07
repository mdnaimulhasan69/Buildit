import { describe, it } from 'node:test';
import assert from 'node:assert';
import { EDITOR_BLOCKS } from './blockDefinitions.ts';

describe('Editor Block Definitions (Requirement 7.3, 7.4, 7.5)', () => {
  it('includes all 7.3 basic elements', () => {
    const labels = EDITOR_BLOCKS.filter(b => b.category === 'Elements').map(b => b.label.toLowerCase());
    assert.ok(labels.includes('heading'));
    assert.ok(labels.includes('text'));
    assert.ok(labels.includes('image'));
    assert.ok(labels.includes('button'));
    assert.ok(labels.includes('link'));
    assert.ok(labels.includes('container'));
    assert.ok(labels.includes('columns'));
    assert.ok(labels.includes('table'));
  });

  it('includes all 7.4 form fields and a Form container block with Submit button', () => {
    const formBlocks = EDITOR_BLOCKS.filter(b => b.category === 'Form fields');
    const labels = formBlocks.map(b => b.label.toLowerCase());
    
    assert.ok(labels.includes('form container'));
    assert.ok(labels.includes('short text'));
    assert.ok(labels.includes('long text'));
    assert.ok(labels.includes('email'));
    assert.ok(labels.includes('number'));
    assert.ok(labels.includes('dropdown'));
    assert.ok(labels.includes('checkbox'));
    assert.ok(labels.includes('radio buttons'));
    assert.ok(labels.includes('date'));
    assert.ok(labels.includes('file upload'));

    // Check that form container contains a Submit button
    const formContainer = formBlocks.find(b => b.label.toLowerCase() === 'form container');
    assert.ok(formContainer?.content.includes('Submit'));

    // Check visible labels on every form field (Requirement 31.3)
    formBlocks.forEach(block => {
      assert.ok(block.content.includes('<label'), `Block ${block.label} must have a visible label`);
    });
  });

  it('includes all 7.5 ready-made widgets', () => {
    const widgets = EDITOR_BLOCKS.filter(b => b.category === 'Widgets').map(b => b.label.toLowerCase());
    assert.ok(widgets.includes('sign-up form'));
    assert.ok(widgets.includes('survey'));
    assert.ok(widgets.includes('booking'));
    assert.ok(widgets.includes('tracker or log'));
    assert.ok(widgets.includes('research showcase'));
  });
});
