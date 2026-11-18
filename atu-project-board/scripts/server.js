'use strict';

// Tiny static web server for the website (no npm packages needed).
// Used by `npm start` to preview the site and by the integration tests.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const SITE_DIR = path.join(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};
// Folders that are part of the project but are not website content
const BLOCKED = ['test', 'scripts', 'node_modules', '.github', '.git'];

function resolveFile(urlPath) {
  let relative;
  try {
    relative = decodeURIComponent(urlPath.split('?')[0]);
  } catch {
    return null; // malformed URL
  }
  if (relative === '/' || relative === '') relative = '/index.html';

  const filePath = path.normalize(path.join(SITE_DIR, relative));
  if (!filePath.startsWith(SITE_DIR + path.sep)) return null; // blocks ../ tricks

  const firstFolder = path.relative(SITE_DIR, filePath).split(path.sep)[0];
  if (BLOCKED.includes(firstFolder)) return null;
  if (!MIME[path.extname(filePath)]) return null; // only website file types
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  return filePath;
}

function createServer() {
  return http.createServer((req, res) => {
    const filePath = req.method === 'GET' ? resolveFile(req.url) : null;
    if (!filePath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] });
    fs.createReadStream(filePath).pipe(res);
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, () => {
    console.log(`ATU Project Board running at http://localhost:${port} (press Ctrl+C to stop)`);
  });
}

module.exports = { createServer, resolveFile };
