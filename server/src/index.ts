import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import importRouter from './routes/import';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
}));

app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    groqConfigured: !!process.env.GROQ_API_KEY,
    workerConfigured: !!process.env.CLOUDFLARE_WORKER_URL && !!process.env.CLOUDFLARE_WORKER_SECRET,
    firebaseConfigured: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/import', importRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`✓ Recipe Book server on http://localhost:${PORT}`);

  const missing: string[] = [];
  if (!process.env.GROQ_API_KEY) missing.push('GROQ_API_KEY');
  if (!process.env.CLOUDFLARE_WORKER_URL) missing.push('CLOUDFLARE_WORKER_URL');
  if (!process.env.CLOUDFLARE_WORKER_SECRET) missing.push('CLOUDFLARE_WORKER_SECRET');
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) missing.push('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (missing.length) console.warn('⚠  Missing env vars:', missing.join(', '));
});
