const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 — Page Not Found</h1><p><a href="/">Go Home</a></p>');
      return;
    }

    const headers = { 'Content-Type': mime };

    // Cache static assets (images, css, js) for 1 year
    if (['.png','.jpg','.jpeg','.gif','.svg','.webp','.css','.js','.woff','.woff2'].includes(ext)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'public, max-age=0, must-revalidate';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0].split('#')[0];

  // Decode URI
  url = decodeURIComponent(url);

  // Root serves index.html
  if (url === '/') {
    return serveFile(res, path.join(ROOT, 'index.html'));
  }

  // Try exact file
  let filePath = path.join(ROOT, url);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      return serveFile(res, filePath);
    }

    // If no extension, try .html
    if (!path.extname(url)) {
      const htmlPath = filePath + '.html';
      fs.stat(htmlPath, (err2, stats2) => {
        if (!err2 && stats2.isFile()) {
          return serveFile(res, htmlPath);
        }
        // Try index.html in directory
        const indexPath = path.join(filePath, 'index.html');
        fs.stat(indexPath, (err3, stats3) => {
          if (!err3 && stats3.isFile()) {
            return serveFile(res, indexPath);
          }
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>404 — Page Not Found</h1><p><a href="/">Go Home</a></p>');
        });
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404 — Page Not Found</h1><p><a href="/">Go Home</a></p>');
    }
  });
});

server.listen(PORT, () => {
  console.log(`SkyGuard website running on http://localhost:${PORT}`);
});
