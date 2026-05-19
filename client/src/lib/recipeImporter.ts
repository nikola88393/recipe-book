import type { Ingredient } from '../db';
import type { User } from 'firebase/auth';

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? 'http://localhost:3001';

export interface ImportedRecipe {
  id?: string;            // Firestore doc ID, present after successful save
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
}

/**
 * Import a recipe from a public URL.
 *
 * Retrieves a fresh Firebase ID token (so we never send a stale one),
 * then POSTs to the Express server which:
 *   1. Verifies the token with Firebase Admin
 *   2. Fetches the page HTML via the authenticated Cloudflare Worker
 *   3. Extracts the recipe with Groq
 *   4. Persists it to Firestore under users/{uid}/recipes
 *   5. Returns the structured recipe JSON
 */
export async function importRecipeFromUrl(
  url: string,
  currentUser: User,
): Promise<ImportedRecipe> {
  // Always fetch a fresh token — avoids 401s from cached/expired tokens
  let idToken: string;
  try {
    idToken = await currentUser.getIdToken(/* forceRefresh */ true);
  } catch {
    throw new Error('Could not retrieve authentication token. Please sign in again.');
  }

  const res = await fetch(`${SERVER_URL}/api/import`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ url }),
  });

  const json = await res.json() as ImportedRecipe & { error?: string };

  if (!res.ok || json.error) {
    // Surface auth errors distinctly so the UI can react appropriately
    if (res.status === 401) {
      throw new Error(`Authentication error: ${json.error ?? 'Unauthorized'}`);
    }
    throw new Error(json.error ?? `Server returned ${res.status}`);
  }

  return json;
}
