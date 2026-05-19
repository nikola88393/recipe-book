import type { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase';

/**
 * Express middleware that verifies a Firebase ID token sent as a Bearer token
 * in the Authorization header.
 *
 * On success:  attaches the decoded token to `req.user` and calls `next()`.
 * On failure:  responds with 401 and a descriptive JSON error — never calls next().
 *
 * Usage:
 *   router.post('/protected', checkAuth, handler);
 */

// Extend Express Request so TypeScript knows about req.user
declare global {
  namespace Express {
    interface Request {
      user?: import('firebase-admin').auth.DecodedIdToken;
    }
  }
}

export async function checkAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const idToken = authHeader.slice(7); // strip "Bearer "

  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded;
    next();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    // Firebase throws specific error codes — surface them cleanly
    if (message.includes('expired')) {
      res.status(401).json({ error: 'Firebase ID token has expired. Please sign in again.' });
    } else if (message.includes('invalid')) {
      res.status(401).json({ error: 'Firebase ID token is invalid.' });
    } else {
      res.status(401).json({ error: `Authentication failed: ${message}` });
    }
  }
}
