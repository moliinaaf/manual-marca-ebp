import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from './build.mjs';

const root = resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.zip': 'application/zip', '.ai': 'application/postscript',
  '.json': 'application/json; charset=utf-8', '.ico': 'image/x-icon',
};

/** Start the same built output used by Vercel. Dev refresh regenerates on each page request. */
export function startServer({ dev = false } = {}) {
  build();
  const port = Number(process.env.PORT) || (dev ? 5173 : 4173);
  const server = createServer((request, response) => {
    try {
      let pathname;
      try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
      catch { response.writeHead(400); response.end('Invalid path'); return; }
      if (dev && (pathname === '/' || pathname === '/index.html')) build();
      const target = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (target !== root && !target.startsWith(root + sep)) {
        response.writeHead(403); response.end('Forbidden'); return;
      }
      if (!existsSync(target) || !statSync(target).isFile()) {
        response.writeHead(404); response.end('Not Found'); return;
      }
      response.writeHead(200, {
        'Content-Type': mime[extname(target).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': dev ? 'no-store' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
      });
      if (request.method === 'HEAD') { response.end(); return; }
      response.end(readFileSync(target));
    } catch (error) {
      response.writeHead(500); response.end('Internal server error');
      console.error(error);
    }
  });
  server.listen(port, 'localhost', () => {
    console.log(`✓ Manual da Marca em http://localhost:${port}`);
    if (dev) console.log('Edite src/pages, src/styles ou src/scripts e atualize a página.');
  });
  return server;
}
