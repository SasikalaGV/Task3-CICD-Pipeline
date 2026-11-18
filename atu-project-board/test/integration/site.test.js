'use strict';

// INTEGRATION TESTS
// Start the real web server on a free port and request the pages over HTTP,
// the same way a browser does. Checks that the pages, links, styles, scripts
// and the contact form all work together.

const test = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../../scripts/server');

const PAGES = [
  { file: 'index.html', h1: 'ATU Project Board', title: 'Home' },
  { file: 'about.html', h1: 'About', title: 'About' },
  { file: 'project.html', h1: 'Project Details', title: 'Project Details' },
  { file: 'contact.html', h1: 'Contact', title: 'Contact' },
];

let server;
let base;

test.before(async () => {
  server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

async function getPage(file) {
  const res = await fetch(`${base}/${file}`);
  return { res, html: await res.text() };
}

// ---------- Every page loads ----------
for (const page of PAGES) {
  test(`${page.file} loads with the right title and heading`, async () => {
    const { res, html } = await getPage(page.file);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(html, new RegExp(`<title>${page.title} \\| ATU Project Board</title>`));
    assert.match(html, new RegExp(`<h1>${page.h1}</h1>`));
  });

  test(`${page.file} has basic HTML quality checks`, async () => {
    const { html } = await getPage(page.file);
    assert.match(html, /^<!DOCTYPE html>/i, 'missing doctype');
    assert.match(html, /<html lang="en">/, 'missing language');
    assert.match(html, /<meta name="viewport"/, 'missing mobile viewport');
    assert.equal((html.match(/<h1>/g) || []).length, 1, 'page should have exactly one <h1>');
  });

  test(`${page.file} has the menu with all four pages`, async () => {
    const { html } = await getPage(page.file);
    for (const target of ['index.html', 'about.html', 'project.html', 'contact.html']) {
      assert.ok(html.includes(`href="${target}"`), `menu link to ${target} missing`);
    }
  });

  test(`${page.file} has no broken internal links, styles or scripts`, async () => {
    const { html } = await getPage(page.file);
    const refs = [...html.matchAll(/(?:href|src)="([^"#]+)"/g)]
      .map((m) => m[1])
      .filter((ref) => !/^(https?:|mailto:)/.test(ref));
    assert.ok(refs.length > 0);
    for (const ref of new Set(refs)) {
      const res = await fetch(`${base}/${ref}`);
      assert.equal(res.status, 200, `${page.file} links to missing file: ${ref}`);
    }
  });
}

// ---------- Home page ----------
test('/ serves the home page', async () => {
  const res = await fetch(`${base}/`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /<h1>ATU Project Board<\/h1>/);
});

test('home page shows the project board with three columns', async () => {
  const { html } = await getPage('index.html');
  for (const column of ['To do', 'In progress', 'Done']) {
    assert.match(html, new RegExp(`<h3>${column} <span class="count">\\d+</span></h3>`));
  }
});

test('project board column counts match the number of cards', async () => {
  const { html } = await getPage('index.html');
  const columns = html.split('<div class="column">').slice(1);
  assert.equal(columns.length, 3);
  for (const column of columns) {
    const count = Number(column.match(/<span class="count">(\d+)<\/span>/)[1]);
    const cards = (column.match(/<article class="task">/g) || []).length;
    assert.equal(cards, count, `column says ${count} but has ${cards} cards`);
  }
});

// ---------- Contact page ----------
test('contact form has name, email and message fields', async () => {
  const { html } = await getPage('contact.html');
  assert.match(html, /<form id="contact-form"/);
  assert.match(html, /<input id="name" name="name" type="text"/);
  assert.match(html, /<input id="email" name="email" type="email"/);
  assert.match(html, /<textarea id="message" name="message"/);
  assert.match(html, /<button type="submit"/);
});

test('every contact form field has a label and an error area', async () => {
  const { html } = await getPage('contact.html');
  for (const field of ['name', 'email', 'message']) {
    assert.match(html, new RegExp(`<label for="${field}">`), `label for ${field} missing`);
    assert.match(html, new RegExp(`data-error-for="${field}"`), `error area for ${field} missing`);
  }
});

test('contact page loads the validation script before the main script', async () => {
  const { html } = await getPage('contact.html');
  const validation = html.indexOf('src="js/validation.js"');
  const main = html.indexOf('src="js/main.js"');
  assert.ok(validation > 0 && main > validation);
});

// ---------- Styles and scripts ----------
test('CSS and JavaScript are served with the right content types', async () => {
  const css = await fetch(`${base}/css/style.css`);
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /text\/css/);
  for (const js of ['js/main.js', 'js/validation.js']) {
    const res = await fetch(`${base}/${js}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /javascript/);
  }
});

// ---------- Errors and security ----------
test('a missing page returns 404', async () => {
  assert.equal((await fetch(`${base}/no-such-page.html`)).status, 404);
});

test('project files outside the website are not served', async () => {
  for (const file of ['package.json', 'README.md', 'scripts/server.js', 'test/unit/validation.test.js']) {
    assert.equal((await fetch(`${base}/${file}`)).status, 404, `${file} should not be public`);
  }
});

test('path traversal and malformed URLs are blocked', async () => {
  assert.equal((await fetch(`${base}/..%2F..%2Fetc%2Fpasswd`)).status, 404);
  assert.equal((await fetch(`${base}/%E0%A4%A`)).status, 404);
});

test('only GET requests are allowed', async () => {
  assert.equal((await fetch(`${base}/index.html`, { method: 'POST' })).status, 404);
});
