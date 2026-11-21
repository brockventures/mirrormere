/**
 * server.test.js - Unit tests for HTTP request hardening and CDP timeout recovery.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const net = require('node:net');

const { createServer } = require('../src/server');
const {
  CaptureService,
  DEFAULT_CDP_HTTP_TIMEOUT_MS,
  DEFAULT_CAPTURE_TIMEOUT_MS,
} = require('../src/capture');

// Minimal valid 1x1 8-bit RGBA PNG (red pixel)
const ONE_BY_ONE_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

function sendRawHttp(port, rawRequest) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
      socket.write(rawRequest);
    });
    let response = '';
    socket.setEncoding('utf8');
    socket.on('data', (chunk) => { response += chunk; });
    socket.on('end', () => resolve(response));
    socket.on('error', reject);
  });
}

function httpGet(port, path) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}${path}`, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks),
      }));
    });
    req.on('error', reject);
  });
}

function withTestServer(options, fn) {
  return new Promise((resolve, reject) => {
    const { server, captureService } = createServer({ port: 0, ...options });
    server.listen(0, '127.0.0.1', async () => {
      const port = server.address().port;
      try {
        await fn({ port, server, captureService });
        server.close(() => resolve());
      } catch (err) {
        server.close(() => reject(err));
      }
    });
  });
}

function withRawHttpServer(handler, fn) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(handler);
    server.listen(0, '127.0.0.1', async () => {
      const port = server.address().port;
      try {
        await fn(`http://127.0.0.1:${port}`);
        server.closeAllConnections();
        server.close(() => resolve());
      } catch (err) {
        server.closeAllConnections();
        server.close(() => reject(err));
      }
    });
  });
}

function installFakeWebSocket(onConnect) {
  const OriginalWebSocket = globalThis.WebSocket;
  const instances = [];

  class FakeWebSocket {
    constructor(url) {
      this.url = url;
      this.closed = false;
      this.sent = [];
      instances.push(this);
      queueMicrotask(() => {
        if (onConnect) onConnect(this);
      });
    }

    send(raw) {
      const msg = JSON.parse(raw);
      this.sent.push(msg);
      if (this._onSend) this._onSend(msg);
    }

    reply(id, result = {}) {
      if (this.closed) return;
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify({ id, result }) });
      }
    }

    emitEvent(method, params = {}) {
      if (this.closed) return;
      if (this.onmessage) {
        this.onmessage({ data: JSON.stringify({ method, params }) });
      }
    }

    close() {
      if (this.closed) return;
      this.closed = true;
      if (this.onclose) this.onclose({});
    }
  }

  globalThis.WebSocket = FakeWebSocket;
  return {
    instances,
    restore() {
      globalThis.WebSocket = OriginalWebSocket;
    },
  };
}

describe('eink-renderer HTTP server hardening', () => {
  it('returns 400 Bad Request on malformed Host header without crashing the server', async () => {
    await withTestServer({}, async ({ port }) => {
      const raw = await sendRawHttp(
        port,
        'GET /eink.png HTTP/1.1\r\nHost: bad:host:header\r\nConnection: close\r\n\r\n'
      );
      assert.match(raw, /^HTTP\/1\.1 400 Bad Request\r\n/);
      assert.match(raw, /"status":"error"/);

      // Server must remain healthy and serve subsequent valid requests
      const health = await httpGet(port, '/healthz');
      assert.strictEqual(health.statusCode, 200);
      assert.deepStrictEqual(JSON.parse(health.body.toString('utf8')), { status: 'ok' });
    });
  });

  it('returns 400 Bad Request on malformed request URL without crashing the server', async () => {
    await withTestServer({}, async ({ port }) => {
      const raw = await sendRawHttp(
        port,
        'GET http://[::1 HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n'
      );
      assert.match(raw, /^HTTP\/1\.1 400 Bad Request\r\n/);

      const health = await httpGet(port, '/healthz');
      assert.strictEqual(health.statusCode, 200);
    });
  });
});

describe('eink-renderer CDP timeout and deadlock recovery', () => {
  it('exposes expected default timeout constants (5s HTTP, 30s capture)', () => {
    assert.strictEqual(DEFAULT_CDP_HTTP_TIMEOUT_MS, 5000);
    assert.strictEqual(DEFAULT_CAPTURE_TIMEOUT_MS, 30000);
  });

  it('aborts hung /json/list requests after cdpHttpTimeoutMs', async () => {
    await withRawHttpServer((_req, _res) => {
      // Intentionally never respond to simulate hung Chromium DevTools endpoint
    }, async (cdpURL) => {
      const svc = new CaptureService({ cdpURL, cdpHttpTimeoutMs: 60 });
      await assert.rejects(
        () => svc.getOrCreateTarget(),
        /\/json\/list request timed out/
      );
    });
  });

  it('aborts hung /json/new requests after cdpHttpTimeoutMs', async () => {
    await withRawHttpServer((req, res) => {
      if (req.url.startsWith('/json/list')) {
        res.end('[]');
        return;
      }
      // Intentionally never respond to /json/new
    }, async (cdpURL) => {
      const svc = new CaptureService({ cdpURL, cdpHttpTimeoutMs: 60 });
      await assert.rejects(
        () => svc.getOrCreateTarget(),
        /\/json\/new request timed out/
      );
    });
  });

  it('times out a hung captureViaCDP, closes ws, resets inFlightPromise, and recovers on next capture', async () => {
    let attempt = 0;
    const fake = installFakeWebSocket((ws) => {
      attempt++;
      if (attempt === 1) {
        // First capture opens the socket, then hangs forever without replying to CDP commands
        ws._onSend = () => {};
        if (ws.onopen) ws.onopen({});
        return;
      }
      // Second capture responds normally
      ws._onSend = (msg) => {
        if (msg.method === 'Page.navigate') {
          ws.emitEvent('Page.loadEventFired', {});
          ws.reply(msg.id, {});
        } else if (msg.method === 'Runtime.evaluate') {
          if (msg.params && msg.params.expression && msg.params.expression.includes('.dither')) {
            ws.reply(msg.id, { result: { value: [] } });
          } else {
            ws.reply(msg.id, { result: { value: true } });
          }
        } else if (msg.method === 'Page.captureScreenshot') {
          ws.reply(msg.id, { data: ONE_BY_ONE_PNG_B64 });
        } else {
          ws.reply(msg.id, {});
        }
      };
      if (ws.onopen) ws.onopen({});
    });

    try {
      const svc = new CaptureService({
        width: 1,
        height: 1,
        captureTimeoutMs: 80,
        loadEventTimeoutMs: 5000,
        settleTimeoutMs: 5000,
        debounceWindowMs: 0,
        sleep: () => Promise.resolve(),
      });
      svc.getOrCreateTarget = async () => ({ webSocketDebuggerUrl: 'ws://127.0.0.1:9222/devtools/page/1' });

      await withTestServer({ captureService: svc }, async ({ port }) => {
        // First HTTP request hits the hung CDP session -> 503 after hard capture timeout
        const firstRes = await httpGet(port, '/eink.png');
        assert.strictEqual(firstRes.statusCode, 503);
        assert.match(firstRes.body.toString('utf8'), /CDP capture timed out/);

        // Hung WebSocket must have been closed and inFlightPromise must be cleared
        assert.strictEqual(fake.instances[0].closed, true);
        assert.strictEqual(svc.inFlightPromise, null);

        // Second HTTP request must NOT be deadlocked and must succeed with a fresh PNG
        const secondRes = await httpGet(port, '/eink.png');
        assert.strictEqual(secondRes.statusCode, 200);
        assert.strictEqual(secondRes.headers['content-type'], 'image/png');
        assert.ok(secondRes.body.length > 0);
        assert.strictEqual(svc.inFlightPromise, null);
      });
    } finally {
      fake.restore();
    }
  });
});
