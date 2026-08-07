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

// ---------------------------------------------------------------------------
// Lead forwarding
// ---------------------------------------------------------------------------
// The contact and careers forms POST here (same origin, so no CORS involved).
// This handler forwards the submission to the SkyGuard CRM API, which owns the
// Gmail OAuth credentials and does the actual sending. The shared token lives
// only in this server's environment — it is never shipped to the browser.
const LEAD_API_URL = process.env.LEAD_API_URL
  || 'https://diligent-optimism-production-efa0.up.railway.app/api/public/website-lead';
const LEAD_API_TOKEN = process.env.LEAD_API_TOKEN;

function sendJson(res, status, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
    'Cache-Control': 'no-store',
  });
  res.end(data);
}

function handleLead(req, res) {
  let raw = '';
  let tooLarge = false;

  req.on('data', (chunk) => {
    raw += chunk;
    // Reject oversized bodies rather than buffering them indefinitely.
    if (raw.length > 64 * 1024) {
      tooLarge = true;
      req.destroy();
    }
  });

  req.on('end', async () => {
    if (tooLarge) return;

    if (!LEAD_API_TOKEN) {
      // Fail loudly instead of pretending the message went through — a form
      // that reports success while dropping the lead is the bug we are fixing.
      console.error('LEAD_API_TOKEN is not set — cannot forward lead');
      return sendJson(res, 503, { error: 'Form is temporarily unavailable' });
    }

    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return sendJson(res, 400, { error: 'Invalid request' });
    }

    // Honeypot: a hidden field only a bot would fill in. Accept and discard so
    // the bot sees success and does not retry with a different shape.
    if (body.payload && String(body.payload.company || '').trim()) {
      return sendJson(res, 202, { ok: true });
    }

    try {
      const upstream = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-website-token': LEAD_API_TOKEN,
        },
        body: JSON.stringify({ formType: body.formType, payload: body.payload }),
        signal: AbortSignal.timeout(15000),
      });

      if (!upstream.ok) {
        const detail = await upstream.text().catch(() => '');
        console.error('Lead forward failed:', upstream.status, detail);
        return sendJson(res, 502, { error: 'Could not send your message' });
      }

      sendJson(res, 202, { ok: true });
    } catch (err) {
      console.error('Lead forward error:', err);
      sendJson(res, 502, { error: 'Could not send your message' });
    }
  });
}

const server = http.createServer((req, res) => {
  let url = req.url.split('?')[0].split('#')[0];

  if (url === '/api/lead') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Allow': 'POST' });
      return res.end('Method Not Allowed');
    }
    return handleLead(req, res);
  }

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
