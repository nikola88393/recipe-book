/**
 * Recipe Book – Cloudflare Worker (HTML Proxy)
 *
 * Accepts POST requests from the trusted Express server only.
 * Validates the shared secret in X-Custom-Proxy-Key, then fetches
 * the target URL and returns the raw HTML to the server for parsing.
 *
 * Deploy:
 *   npx wrangler secret put AUTH_SECRET_KEY   ← set via wrangler, not wrangler.toml
 *   npx wrangler deploy
 *
 * Environment variables (set as Wrangler secrets):
 *   AUTH_SECRET_KEY  — shared secret between Express and this Worker
 */

export interface Env {
  AUTH_SECRET_KEY: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const urlObj = new URL(request.url);
    const { pathname } = urlObj;

    // ── Groq API Proxy ──────────────────────────────────────────────────────
    if (pathname.startsWith('/groq')) {
      const incomingSecret = request.headers.get('X-Custom-Proxy-Key');
      if (!incomingSecret || !env.AUTH_SECRET_KEY) {
        return jsonError(401, 'Unauthorized: missing proxy key.');
      }
      if (incomingSecret !== env.AUTH_SECRET_KEY) {
        return jsonError(401, 'Unauthorized: invalid proxy key.');
      }

      // Build target URL (e.g. /groq/chat/completions -> https://api.groq.com/openai/v1/chat/completions)
      const targetPath = pathname.slice('/groq'.length);
      const targetUrl = new URL(`https://api.groq.com/${targetPath}${urlObj.search}`);

      // Clone and clean headers
      const headers = new Headers(request.headers);
      headers.delete('X-Custom-Proxy-Key');
      headers.set('Host', 'api.groq.com');

      try {
        const response = await fetch(targetUrl.toString(), {
          method: request.method,
          headers,
          body: request.body,
        });

        const resHeaders = new Headers(response.headers);
        resHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: resHeaders,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return jsonError(502, `Failed to proxy Groq: ${msg}`);
      }
    }

    // ── Only POST is accepted ─────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (request.method !== 'POST') {
      return jsonError(405, 'Method not allowed. Use POST.');
    }

    // ── 1. Validate shared secret ────────────────────────────────────────
    const incomingSecret = request.headers.get('X-Custom-Proxy-Key');

    if (!incomingSecret || !env.AUTH_SECRET_KEY) {
      return jsonError(401, 'Unauthorized: missing proxy key.');
    }

    // Constant-time comparison to prevent timing attacks
    const encoder = new TextEncoder();
    const a = encoder.encode(incomingSecret);
    const b = encoder.encode(env.AUTH_SECRET_KEY);

    // crypto.subtle.timingSafeEqual requires same length — pad & compare
    if (a.length !== b.length) {
      return jsonError(401, 'Unauthorized: invalid proxy key.');
    }

    let mismatch = 0;
    for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
    if (mismatch !== 0) {
      return jsonError(401, 'Unauthorized: invalid proxy key.');
    }

    // ── 2. Parse and validate request body ──────────────────────────────
    let body: { url?: string };
    try {
      body = await request.json() as { url?: string };
    } catch {
      return jsonError(400, 'Request body must be valid JSON.');
    }

    const { url } = body;
    if (!url || typeof url !== 'string') {
      return jsonError(400, 'Request body must include a "url" string.');
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return jsonError(400, 'Invalid URL.');
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return jsonError(400, 'Only http/https URLs are allowed.');
    }

    // ── 3. Fetch raw HTML from the target site ───────────────────────────
    try {
      const upstream = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/124.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        redirect: 'follow',
      });

      if (!upstream.ok) {
        return jsonError(502, `Target site returned HTTP ${upstream.status}.`);
      }

      const html = await upstream.text();

      return new Response(JSON.stringify({ html }), {
        status: 200,
        headers: JSON_HEADERS,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return jsonError(502, `Failed to fetch target URL: ${msg}`);
    }
  },
};
