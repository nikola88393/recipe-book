/**
 * Firebase Admin SDK initialiser — singleton pattern.
 * Supports two credential strategies:
 *   1. FIREBASE_SERVICE_ACCOUNT_JSON env var (JSON string of the service account key)
 *   2. Application Default Credentials (for GCP-hosted environments)
 */
import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // Fallback: Application Default Credentials (works on Cloud Run, GCE, etc.)
    admin.initializeApp();
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();
export default admin;
