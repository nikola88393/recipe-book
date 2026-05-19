import { useState } from 'react';
import { useRecipes, saveRecipe } from '../db';
import { Link } from 'react-router-dom';
import { Plus, Link2, WifiOff, ShoppingCart, BookOpen } from 'lucide-react';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { ShoppingListModal } from '../components/ShoppingListModal';
import { v4 as uuidv4 } from 'uuid';
import type { ImportedRecipe } from '../lib/recipeImporter';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import type { User } from 'firebase/auth';

interface Props {
  currentUser: User | null;
}

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'];

export function Dashboard({ currentUser }: Props) {
  const { recipes, loading } = useRecipes(currentUser?.uid);
  const [showImport, setShowImport] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const isOnline = useOnlineStatus();

  const handleImport = async (imported: ImportedRecipe) => {
    if (!currentUser) return;
    const now = Date.now();
    const recipeId = uuidv4();
    await saveRecipe(currentUser.uid, recipeId, {
      title: imported.title,
      description: imported.description,
      ingredients: imported.ingredients,
      instructions: imported.instructions,
      createdAt: now,
      updatedAt: now,
    });
  };

  return (
    <div className="flex flex-col gap-10">
      {showImport && (
        <ImportRecipeModal
          currentUser={currentUser}
          onImport={handleImport}
          onClose={() => setShowImport(false)}
        />
      )}
      {showShoppingList && (
        <ShoppingListModal
          recipes={recipes ?? []}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b"
        style={{ borderColor: '#f0eee6' }}
      >
        <div>
          <span
            className="block mb-2 uppercase tracking-widest"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#87867f',
              letterSpacing: '0.1em',
            }}
          >
            My Collection
          </span>
          <h1
            style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#1b1c18',
            }}
          >
            My Cookbook
          </h1>
          <p
            className="mt-2"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '16px',
              color: '#5e5d59',
            }}
          >
            {(recipes ?? []).length > 0
              ? `${(recipes ?? []).length} recipe${(recipes ?? []).length !== 1 ? 's' : ''} in your collection`
              : 'Your curated collection of culinary delights.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="open-shopping-list"
            onClick={() => setShowShoppingList(true)}
            disabled={(recipes ?? []).length === 0}
            title={(recipes ?? []).length === 0 ? 'Add some recipes first' : 'Create a shopping list'}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={15} />
            Shopping List
          </button>
          <button
            onClick={() => isOnline && setShowImport(true)}
            disabled={!isOnline}
            title={!isOnline ? 'You are offline' : undefined}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isOnline ? <Link2 size={15} /> : <WifiOff size={15} />}
            Import from Web
          </button>
          <Link to="/book/recipe/new" className="btn-primary">
            <Plus size={16} />
            Add Recipe
          </Link>
        </div>
      </div>

      {/* ── Category Filter Row ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="inline-flex items-center px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              backgroundColor: activeCategory === cat ? '#94c595' : '#e8e6dc',
              color: activeCategory === cat ? '#26522d' : '#5e5d59',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div
          className="text-center py-24"
          style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
        >
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: '#94c595', borderTopColor: 'transparent' }}
          />
          Loading your collection...
        </div>
      ) : recipes === undefined || recipes.length === 0 ? (
        /* ── Empty State ── */
        <div
          className="rounded-2xl ring-shadow text-center flex flex-col items-center gap-6"
          style={{ backgroundColor: '#faf9f5', padding: 'clamp(48px, 8vw, 96px) 40px' }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#e8e6dc' }}
          >
            <BookOpen size={32} style={{ color: '#87867f' }} />
          </div>
          <div>
            <h2
              className="mb-3"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '28px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              Your book is empty
            </h2>
            <p
              className="max-w-md mx-auto"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '16px',
                lineHeight: 1.6,
                color: '#5e5d59',
              }}
            >
              Begin your culinary journey by writing a recipe or importing one from the web.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setShowImport(true)} className="btn-secondary">
              <Link2 size={15} /> Import from Web
            </button>
            <Link to="/book/recipe/new" className="btn-primary">
              <Plus size={15} /> Write a Recipe
            </Link>
          </div>
        </div>
      ) : (
        /* ── Recipe Grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(recipes ?? []).map(recipe => (
            <Link key={recipe.id} to={`/book/recipe/${recipe.id}`} className="group block">
              <article
                className="h-full flex flex-col gap-4 rounded-lg ring-shadow p-6 transition-all duration-300 cursor-pointer"
                style={{ backgroundColor: '#faf9f5' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0px 0px 0px 1px #c2c0b6, 0 12px 32px -4px rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0px 0px 0px 1px #d1cfc5';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {/* Card header accent */}
                <div
                  className="w-full h-1 rounded-full"
                  style={{ backgroundColor: '#94c595', opacity: 0.5 }}
                />

                <div className="flex-1">
                  <h3
                    className="mb-2 group-hover:text-primary transition-colors duration-200"
                    style={{
                      fontFamily: 'Literata, Georgia, serif',
                      fontSize: '21px',
                      fontWeight: 500,
                      lineHeight: 1.25,
                      color: '#1b1c18',
                    }}
                  >
                    {recipe.title}
                  </h3>
                  <p
                    className="line-clamp-3"
                    style={{
                      fontFamily: 'Libre Franklin, Arial, sans-serif',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: '#5e5d59',
                    }}
                  >
                    {recipe.description || 'No description provided.'}
                  </p>
                </div>

                {/* Meta row */}
                <div
                  className="flex items-center gap-4 pt-4 border-t"
                  style={{ borderColor: '#f0eee6' }}
                >
                  <span
                    className="uppercase tracking-widest"
                    style={{
                      fontFamily: 'Libre Franklin, Arial, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#87867f',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {recipe.ingredients.length} Ingredients
                  </span>
                  <span
                    className="uppercase tracking-widest"
                    style={{
                      fontFamily: 'Libre Franklin, Arial, sans-serif',
                      fontSize: '10px',
                      fontWeight: 500,
                      color: '#87867f',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {new Date(recipe.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
