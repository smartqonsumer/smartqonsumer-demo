#!/usr/bin/env node
/**
 * Local reverse proxy for testing the demo from a phone through ONE ngrok tunnel.
 * Everything is served from a single origin, so the session cookie stays first-party
 * (no CORS / SameSite issue):
 *
 *   /api/*                          → API       (localhost:8010)
 *   /01/*, /gtin/*, /.well-known/*  → resolver  (localhost:8091)
 *   everything else                 → site      (localhost:3010, Next dev, incl. HMR websocket)
 *
 *   node scripts/dev-proxy.mjs            # listens on :8088
 *   ngrok http 8088
 *
 * Development only: no dependency, no TLS (ngrok terminates HTTPS).
 */
import http from 'node:http';
import net from 'node:net';

const PORT = Number(process.env.PROXY_PORT ?? 8088);
const API = Number(process.env.API_PORT ?? 8010);
const RESOLVER = Number(process.env.RESOLVER_PORT ?? 8091);
const WEB = Number(process.env.WEB_PORT ?? 3010);

function target(url = '/') {
  if (url.startsWith('/api/')) return API;
  if (/^\/(01|gtin)\//.test(url) || url.startsWith('/.well-known/gs1resolver')) return RESOLVER;
  return WEB;
}

const server = http.createServer((req, res) => {
  const port = target(req.url);
  const upstream = http.request(
    {
      host: '127.0.0.1',
      port,
      method: req.method,
      path: req.url,
      headers: { ...req.headers, 'x-forwarded-proto': 'https', 'x-forwarded-host': req.headers.host },
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    },
  );
  upstream.on('error', () => {
    if (!res.headersSent) res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(`Service local indisponible (port ${port}).`);
  });
  req.pipe(upstream);
});

// WebSocket upgrades (Next.js hot reload) are tunnelled as raw TCP.
server.on('upgrade', (req, socket, head) => {
  const upstream = net.connect(target(req.url), '127.0.0.1', () => {
    const headers = Object.entries(req.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n');
    upstream.write(`${req.method} ${req.url} HTTP/1.1\r\n${headers}\r\n\r\n`);
    upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on('error', () => socket.destroy());
  socket.on('error', () => upstream.destroy());
});

server.listen(PORT, () => {
  console.log(`dev proxy on http://localhost:${PORT} → api :${API} · resolver :${RESOLVER} · web :${WEB}`);
});
