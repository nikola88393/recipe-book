import { Router, type Request, type Response } from 'express';
import { checkAuth } from '../middleware/auth';
import { cleanHtml } from '../htmlCleaner';
import { extractRecipeWithGroq } from '../groqExtractor';

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const WORKER_URL = process.env.CLOUDFLARE_WORKER_URL ?? '';
const WORKER_SECRET = process.env.CLOUDFLARE_WORKER_SECRET ?? '';

// ── POST /api/import ─────────────────────────────────────────────────────────
// Requires a valid Firebase ID token (enforced by checkAuth middleware).
// Flow:
//   1. Validate request body
//   2. Fetch raw HTML via Cloudflare Worker (authenticated with shared secret)
//   3. Clean HTML → plain text
//   4. Extract recipe structure via Groq and return it
router.post('/', checkAuth, async (req: Request, res: Response) => {
  // ── 1. Validate input ────────────────────────────────────────────────────
  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Request body must include a "url" string.' });
    return;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL.' });
    return;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: 'Only http/https URLs are allowed.' });
    return;
  }

  // ── Guard: required env vars ─────────────────────────────────────────────
  if (!GROQ_API_KEY) {
    res.status(500).json({ error: 'Server is missing GROQ_API_KEY configuration.' });
    return;
  }
  if (!WORKER_URL || !WORKER_SECRET) {
    res.status(500).json({ error: 'Server is missing Cloudflare Worker configuration.' });
    return;
  }

  const uid = req.user!.uid; // guaranteed by checkAuth

  try {
    // ── 2. Fetch raw HTML from Cloudflare Worker ─────────────────────────
    const workerRes = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Custom-Proxy-Key': WORKER_SECRET,
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!workerRes.ok) {
      const workerError = await workerRes.json().catch(() => ({})) as { error?: string };
      res.status(502).json({
        error: `Cloudflare Worker error (${workerRes.status}): ${workerError.error ?? 'Unknown'}`,
      });
      return;
    }

    const { html } = await workerRes.json() as { html: string };
    if (!html) {
      res.status(502).json({ error: 'Cloudflare Worker returned empty HTML.' });
      return;
    }

    // ── 3. Clean HTML → plain text ───────────────────────────────────────
    const pageText = cleanHtml(html);

    // ── 4. Extract recipe via Groq ───────────────────────────────────────
    const recipe = await extractRecipeWithGroq(pageText, GROQ_API_KEY);

    res.status(200).json(recipe);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[import] uid=${uid} error:`, message);
    res.status(500).json({ error: message });
  }
});

export default router;
