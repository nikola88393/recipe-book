import { useState, useEffect } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, getDoc, getDocFromCache } from 'firebase/firestore';
import { db as firestoreDb } from './lib/firebase';

export interface Ingredient {
  amount: number | '';
  unit: string;
  name: string;
  part?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Hook to subscribe to a user's recipes in real-time.
 * Automatically utilizes Firestore's offline cache.
 */
export function useRecipes(uid: string | undefined): { recipes: Recipe[] | undefined; loading: boolean } {
  const [recipes, setRecipes] = useState<Recipe[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) {
      setRecipes(undefined);
      setLoading(false);
      return;
    }

    const q = query(
      collection(firestoreDb, `users/${uid}/recipes`),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Recipe[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Recipe);
      });
      setRecipes(data);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching recipes:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  return { recipes, loading };
}

/**
 * Fetch a single recipe (useful for editing or viewing).
 */
export async function getRecipe(uid: string, recipeId: string): Promise<Recipe | null> {
  const docRef = doc(firestoreDb, `users/${uid}/recipes/${recipeId}`);
  
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Recipe;
    }
    return null;
  } catch (error) {
    // If the client is offline (e.g. disableNetwork is called), getDoc will throw.
    // We catch the error and explicitly attempt to read from the offline cache.
    console.warn('Network unavailable, attempting to read recipe from cache...');
    try {
      const snap = await getDocFromCache(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Recipe;
      }
    } catch (cacheError) {
      console.error('Failed to read recipe from cache:', cacheError);
    }
    return null;
  }
}

/**
 * Add or update a recipe.
 * Uses setDoc so we can specify the ID (or let UUID handle it).
 * We fire-and-forget the setDoc promise so that if the user is offline,
 * the UI does not hang waiting for network confirmation.
 * The local cache will update immediately.
 */
export async function saveRecipe(uid: string, recipeId: string, recipe: Omit<Recipe, 'id'>): Promise<void> {
  const docRef = doc(firestoreDb, `users/${uid}/recipes/${recipeId}`);
  setDoc(docRef, recipe).catch(err => console.error("Background sync failed:", err));
}

/**
 * Delete a recipe.
 * Fire-and-forget for instant offline UI updates.
 */
export async function deleteRecipe(uid: string, recipeId: string): Promise<void> {
  const docRef = doc(firestoreDb, `users/${uid}/recipes/${recipeId}`);
  deleteDoc(docRef).catch(err => console.error("Background delete failed:", err));
}
