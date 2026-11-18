'use strict';

// UNIT TESTS
// Test the contact form rules (js/validation.js) on their own, without a browser.

const test = require('node:test');
const assert = require('node:assert/strict');
const { validateContact } = require('../../js/validation');

const valid = { name: 'Aoife Murphy', email: 'aoife@example.com', message: 'I like the project board!' };

test('a complete, valid contact form has no errors', () => {
  assert.deepEqual(validateContact(valid), {});
});

test('name, email and message are all required', () => {
  const errors = validateContact({});
  assert.equal(errors.name, 'Name is required');
  assert.equal(errors.email, 'Email is required');
  assert.equal(errors.message, 'Message is required');
});

test('no input at all is handled safely', () => {
  assert.equal(Object.keys(validateContact()).length, 3);
  assert.equal(Object.keys(validateContact(null)).length, 3);
});

test('spaces only count as empty', () => {
  const errors = validateContact({ name: '   ', email: '  ', message: '    ' });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name']);
});

test('invalid email addresses are rejected', () => {
  for (const email of ['aoife', 'aoife@', '@example.com', 'aoife@example', 'ao ife@example.com']) {
    assert.equal(validateContact({ ...valid, email }).email, 'Enter a valid email address', `"${email}" should be invalid`);
  }
});

test('valid email addresses are accepted', () => {
  for (const email of ['a@b.ie', 'first.last@atu.ie', 'name+tag@mail.example.com']) {
    assert.equal(validateContact({ ...valid, email }).email, undefined, `"${email}" should be valid`);
  }
});

test('message must be between 10 and 1000 characters', () => {
  assert.equal(validateContact({ ...valid, message: 'too short' }).message, 'Message must be at least 10 characters');
  assert.equal(validateContact({ ...valid, message: 'x'.repeat(10) }).message, undefined);
  assert.equal(validateContact({ ...valid, message: 'x'.repeat(1001) }).message, 'Message must be 1000 characters or fewer');
});

test('name must be 80 characters or fewer', () => {
  assert.equal(validateContact({ ...valid, name: 'x'.repeat(81) }).name, 'Name must be 80 characters or fewer');
  assert.equal(validateContact({ ...valid, name: 'x'.repeat(80) }).name, undefined);
});

test('non-text values are rejected', () => {
  const errors = validateContact({ name: 42, email: true, message: ['hello world'] });
  assert.equal(Object.keys(errors).length, 3);
});
