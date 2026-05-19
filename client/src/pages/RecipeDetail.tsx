import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, deleteRecipe, type Ingredient, type Recipe } from '../db';
import { ArrowLeft, Edit, Trash2, Minus, Plus } from 'lucide-react';
import { IngredientScaleModal } from '../components/IngredientScaleModal';
import { useCurrentUser } from '../hooks/useCurrentUser';

function formatAmount(amount: number | '', scale: number): string {
  if (amount === '') return '';
  const scaled = Number(amount) * scale;
  return Number.isInteger(scaled) ? scaled.toString() : parseFloat(scaled.toFixed(3)).toString();
}

export function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [scale, setScale] = useState(1);
  const [activeIngredient, setActiveIngredient] = useState<{ ingredient: Ingredient; index: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      getRecipe(user.uid, id).then(r => {
        if (!r) navigate('/book', { replace: true });
        else setRecipe(r);
        setLoading(false);
      });
    }
  }, [id, user, navigate]);

  const handleDelete = async () => {
    if (id && user && confirm('Are you sure you want to delete this recipe?')) {
      await deleteRecipe(user.uid, id);
      navigate('/book');
    }
  };

  const handleScaleDecrease = () => setScale(s => Math.max(0.5, parseFloat((s - 0.5).toFixed(2))));
  const handleScaleIncrease = () => setScale(s => parseFloat((s + 0.5).toFixed(2)));

  const handleIngredientScale = (newScale: number) => {
    setScale(parseFloat(newScale.toFixed(3)));
  };

  if (loading || !recipe) {
    return (
      <div
        className="text-center py-24 flex flex-col items-center gap-4"
        style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
      >
        <div
          className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: '#94c595', borderTopColor: 'transparent' }}
        />
        Loading recipe...
      </div>
    );
  }

  const scaleLabel = `${scale}×`;

  // Group ingredients by their part / section
  const groupedIngredients: { part: string; items: Ingredient[] }[] = [];
  recipe.ingredients.forEach((ing) => {
    const partName = ing.part || '';
    let group = groupedIngredients.find(g => g.part === partName);
    if (!group) {
      group = { part: partName, items: [] };
      groupedIngredients.push(group);
    }
    group.items.push(ing);
  });

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {/* Ingredient scale modal */}
      {activeIngredient && (
        <IngredientScaleModal
          ingredient={activeIngredient.ingredient}
          index={activeIngredient.index}
          onClose={() => setActiveIngredient(null)}
          onScale={handleIngredientScale}
        />
      )}

      {/* ── Action Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/book')}
          className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{
            fontFamily: 'Libre Franklin, Arial, sans-serif',
            color: '#5e5d59',
            background: 'none',
            border: 'none',
            padding: '8px 0',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#1b1c18')}
          onMouseLeave={e => (e.currentTarget.style.color = '#5e5d59')}
        >
          <ArrowLeft size={16} />
          Back to Cookbook
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/book/recipe/${id}/edit`)}
            className="btn-secondary"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded text-sm font-medium ring-shadow transition-all duration-200"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              backgroundColor: '#fff0f0',
              color: '#ba1a1a',
            }}
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* ── Article ──────────────────────────────────────────────────────── */}
      <article
        className="rounded-2xl ring-shadow overflow-hidden"
        style={{ backgroundColor: '#faf9f5' }}
      >
        {/* ── Recipe Header ── */}
        <header style={{ padding: 'clamp(32px, 5vw, 48px) clamp(24px, 4vw, 48px) 0' }}>
          <span
            className="block mb-3 uppercase tracking-widest"
            style={{
              fontFamily: 'Libre Franklin, Arial, sans-serif',
              fontSize: '11px',
              fontWeight: 500,
              color: '#87867f',
              letterSpacing: '0.1em',
            }}
          >
            Recipe
          </span>
          <h1
            className="mb-4"
            style={{
              fontFamily: 'Literata, Georgia, serif',
              fontSize: 'clamp(28px, 5vw, 48px)',
              fontWeight: 500,
              lineHeight: 1.15,
              color: '#1b1c18',
            }}
          >
            {recipe.title}
          </h1>
          {recipe.description && (
            <p
              className="mb-6"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                fontSize: '18px',
                lineHeight: 1.6,
                color: '#5e5d59',
              }}
            >
              {recipe.description}
            </p>
          )}
        </header>

        {/* ── Meta Bar ── */}
        <div
          className="flex flex-wrap items-center gap-8 border-t border-b"
          style={{
            borderColor: '#f0eee6',
            padding: '16px clamp(24px, 4vw, 48px)',
            backgroundColor: '#fbf9f2',
          }}
        >
          <div className="flex flex-col gap-0.5">
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
              Ingredients
            </span>
            <span
              className="font-medium"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '15px', color: '#1b1c18' }}
            >
              {recipe.ingredients.length}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
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
              Steps
            </span>
            <span
              className="font-medium"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '15px', color: '#1b1c18' }}
            >
              {recipe.instructions.length}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
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
              Last Updated
            </span>
            <span
              className="font-medium"
              style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', fontSize: '15px', color: '#1b1c18' }}
            >
              {new Date(recipe.updatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* ── Body ── */}
        <div
          className="flex flex-col md:flex-row gap-10"
          style={{ padding: 'clamp(24px, 4vw, 48px)' }}
        >
          {/* ── Ingredients column ── */}
          <div className="md:w-5/12 shrink-0">
            <h2
              className="mb-5"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '24px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              Ingredients
            </h2>

            {/* Portion scaler */}
            <div
              className="inline-flex items-center gap-2 mb-6 rounded-xl"
              style={{
                backgroundColor: '#f5f4ed',
                padding: '8px 12px',
                boxShadow: '0px 0px 0px 1px #f0eee6',
              }}
            >
              <button
                onClick={handleScaleDecrease}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Decrease portions"
                style={{ color: '#4d4c48' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e8e6dc')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Minus size={14} />
              </button>
              <span
                className="font-medium text-center tabular-nums"
                style={{
                  fontFamily: 'Libre Franklin, Arial, sans-serif',
                  fontSize: '14px',
                  minWidth: '2.5rem',
                  color: '#1b1c18',
                }}
              >
                {scaleLabel}
              </span>
              <button
                onClick={handleScaleIncrease}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-200"
                aria-label="Increase portions"
                style={{ color: '#4d4c48' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e8e6dc')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Plus size={14} />
              </button>
              {scale !== 1 && (
                <button
                  onClick={() => setScale(1)}
                  className="ml-1 text-xs transition-colors"
                  style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
                >
                  Reset
                </button>
              )}
            </div>

            {/* Grouped Ingredient lists with headers and hairline separators */}
            <div className="flex flex-col gap-6">
              {groupedIngredients.map((group, gIndex) => (
                <div key={gIndex} className="flex flex-col">
                  {group.part && (
                    <h3
                      className="font-serif italic font-medium mb-2 text-[15px]"
                      style={{
                        color: '#3b6840',
                        fontFamily: 'Literata, Georgia, serif',
                      }}
                    >
                      For the {group.part}
                    </h3>
                  )}
                  <ul className="flex flex-col">
                    {group.items.map((ingredient: Ingredient, index: number) => {
                      const hasAmount = ingredient.amount !== '' && ingredient.amount !== 0 && ingredient.amount !== null;
                      const isClickable = hasAmount && ingredient.unit;
                      const originalIndex = recipe.ingredients.indexOf(ingredient);
                      return (
                        <li
                          key={index}
                          className="flex gap-3 items-baseline py-3"
                          style={{
                            borderTop: index === 0 ? 'none' : '1px solid #f0eee6',
                            fontFamily: 'Libre Franklin, Arial, sans-serif',
                            fontSize: '15px',
                            color: '#1b1c18',
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: '#94c595', marginTop: '0.5em' }}
                          />
                          <span style={{ lineHeight: 1.5 }}>
                            {hasAmount && (
                              <button
                                onClick={() => isClickable ? setActiveIngredient({ ingredient, index: originalIndex }) : undefined}
                                title={isClickable ? `Scale recipe by ${ingredient.name} amount` : undefined}
                                className={[
                                  'font-medium inline-flex items-center gap-0.5 mr-0.5 rounded px-1 -mx-1 transition-colors',
                                  isClickable ? 'hover:bg-[#94c595]/15 hover:text-[#3b6840] cursor-pointer group' : 'cursor-default',
                                ].join(' ')}
                              >
                                <span>{formatAmount(ingredient.amount, scale)}</span>
                                {ingredient.unit && (
                                  <span style={{ color: '#5e5d59' }}>{ingredient.unit} </span>
                                )}
                              </button>
                            )}{' '}
                            {ingredient.name}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ── Instructions column ── */}
          <div className="md:flex-1">
            <h2
              className="mb-6"
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '24px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              Instructions
            </h2>

            <div className="flex flex-col gap-8">
              {recipe.instructions.map((step: string, index: number) => (
                <div key={index} className="flex gap-5">
                  {/* Step number */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{
                      fontFamily: 'Libre Franklin, Arial, sans-serif',
                      backgroundColor: '#efeee7',
                      color: '#5e5d59',
                      boxShadow: '0px 0px 0px 1px #e8e6dc',
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    className="pt-1 flex-1"
                    style={{
                      fontFamily: 'Literata, Georgia, serif',
                      fontSize: '17px',
                      lineHeight: 1.7,
                      color: '#1b1c18',
                    }}
                  >
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
