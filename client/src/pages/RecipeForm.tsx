import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRecipe, saveRecipe, type Ingredient } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { UNIT_OPTIONS, UNIT_CATEGORIES } from '../lib/measurements';
import { useCurrentUser } from '../hooks/useCurrentUser';

export function RecipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  interface IngredientSection {
    id: string;
    name: string;
    ingredients: Ingredient[];
  }

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientSections, setIngredientSections] = useState<IngredientSection[]>([
    { id: uuidv4(), name: '', ingredients: [{ amount: '', unit: '', name: '' }] }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id && user) {
      getRecipe(user.uid, id).then(recipe => {
        if (recipe) {
          setTitle(recipe.title);
          setDescription(recipe.description);
          setInstructions(recipe.instructions.length ? recipe.instructions : ['']);

          // Group ingredients by part for the UI editor sections
          const sectionsMap = new Map<string, Ingredient[]>();
          const sectionOrder: string[] = [];

          const recipeIngredients = recipe.ingredients || [];
          recipeIngredients.forEach(ing => {
            const partName = ing.part || '';
            if (!sectionsMap.has(partName)) {
              sectionsMap.set(partName, []);
              sectionOrder.push(partName);
            }
            sectionsMap.get(partName)!.push(ing);
          });

          if (sectionOrder.length === 0) {
            setIngredientSections([
              { id: uuidv4(), name: '', ingredients: [{ amount: '', unit: '', name: '' }] }
            ]);
          } else {
            setIngredientSections(
              sectionOrder.map(name => ({
                id: uuidv4(),
                name,
                ingredients: sectionsMap.get(name)!.length ? sectionsMap.get(name)! : [{ amount: '', unit: '', name: '' }]
              }))
            );
          }
        } else {
          navigate('/book', { replace: true });
        }
        setLoading(false);
      });
    }
  }, [id, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const now = Date.now();
    const flatIngredients: Ingredient[] = [];
    ingredientSections.forEach(section => {
      section.ingredients.forEach(ing => {
        if (ing.name.trim() || String(ing.amount).trim() || ing.unit.trim()) {
          flatIngredients.push({
            ...ing,
            part: section.name.trim()
          });
        }
      });
    });
    const validInstructions = instructions.filter(i => i.trim());

    if (!title.trim()) return alert('Title is required');

    const recipeId = id || uuidv4();
    await saveRecipe(user.uid, recipeId, {
      title,
      description,
      ingredients: flatIngredients,
      instructions: validInstructions,
      createdAt: id ? (await getRecipe(user.uid, id))?.createdAt || now : now,
      updatedAt: now,
    });

    navigate('/book');
  };

  const updateInstruction = (index: number, value: string) => {
    const newArray = [...instructions];
    newArray[index] = value;
    setInstructions(newArray);
  };

  const removeInstruction = (index: number) => {
    const newArray = instructions.filter((_, i) => i !== index);
    if (newArray.length === 0) newArray.push('');
    setInstructions(newArray);
  };

  const addInstruction = () => setInstructions([...instructions, '']);

  const addIngredientSection = () => {
    setIngredientSections([
      ...ingredientSections,
      { id: uuidv4(), name: '', ingredients: [{ amount: '', unit: '', name: '' }] }
    ]);
  };

  const removeIngredientSection = (sectionId: string) => {
    const newSections = ingredientSections.filter(s => s.id !== sectionId);
    if (newSections.length === 0) {
      newSections.push({ id: uuidv4(), name: '', ingredients: [{ amount: '', unit: '', name: '' }] });
    }
    setIngredientSections(newSections);
  };

  const updateSectionName = (sectionId: string, name: string) => {
    setIngredientSections(
      ingredientSections.map(s => s.id === sectionId ? { ...s, name } : s)
    );
  };

  const addIngredientToSection = (sectionId: string) => {
    setIngredientSections(
      ingredientSections.map(s =>
        s.id === sectionId
          ? { ...s, ingredients: [...s.ingredients, { amount: '', unit: '', name: '' }] }
          : s
      )
    );
  };

  const removeIngredientFromSection = (sectionId: string, ingIndex: number) => {
    setIngredientSections(
      ingredientSections.map(s => {
        if (s.id !== sectionId) return s;
        const newIngs = s.ingredients.filter((_, i) => i !== ingIndex);
        return {
          ...s,
          ingredients: newIngs.length ? newIngs : [{ amount: '', unit: '', name: '' }]
        };
      })
    );
  };

  const updateIngredientInSection = (
    sectionId: string,
    ingIndex: number,
    field: keyof Ingredient,
    value: string | number
  ) => {
    setIngredientSections(
      ingredientSections.map(s => {
        if (s.id !== sectionId) return s;
        const newIngs = s.ingredients.map((ing, i) =>
          i === ingIndex ? { ...ing, [field]: value } : ing
        );
        return { ...s, ingredients: newIngs };
      })
    );
  };

  if (loading) {
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

  const inputStyle = {
    fontFamily: 'Libre Franklin, Arial, sans-serif',
    backgroundColor: '#faf9f5',
    borderColor: '#f0eee6',
    color: '#1b1c18',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = '#3b6840';
      e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 104, 64, 0.12)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.borderColor = '#f0eee6';
      e.currentTarget.style.boxShadow = 'none';
    },
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-5 text-sm font-medium transition-colors duration-200"
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
          Cancel
        </button>
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
          {id ? 'Editing Recipe' : 'New Recipe'}
        </span>
        <h1
          style={{
            fontFamily: 'Literata, Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 500,
            lineHeight: 1.2,
            color: '#1b1c18',
          }}
        >
          {id ? 'Edit Your Recipe' : 'Add a Recipe'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* ── Basic Info Card ────────────────────────────────────────────── */}
        <div
          className="rounded-xl ring-shadow overflow-hidden"
          style={{ backgroundColor: '#faf9f5' }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{
              backgroundColor: '#f5f4ed',
              borderColor: '#f0eee6',
            }}
          >
            <h2
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              About This Recipe
            </h2>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-widest"
                style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f', letterSpacing: '0.08em' }}
              >
                Recipe Title *
              </label>
              <input
                autoFocus
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Grandmother's Apple Pie"
                className="w-full border rounded-md px-4 py-3"
                style={{
                  ...inputStyle,
                  fontFamily: 'Literata, Georgia, serif',
                  fontSize: '22px',
                }}
                {...focusHandlers}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label
                className="text-xs font-medium uppercase tracking-widest"
                style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f', letterSpacing: '0.08em' }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A brief story or description of this dish..."
                className="w-full border rounded-md px-4 py-3 resize-y"
                style={{
                  ...inputStyle,
                  fontSize: '15px',
                  minHeight: '100px',
                }}
                {...focusHandlers}
              />
            </div>
          </div>
        </div>

        {/* ── Ingredients Card ───────────────────────────────────────────── */}
        <div
          className="rounded-xl ring-shadow overflow-hidden"
          style={{ backgroundColor: '#faf9f5' }}
        >
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ backgroundColor: '#f5f4ed', borderColor: '#f0eee6' }}
          >
            <h2
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              Ingredients
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                backgroundColor: '#efeee7',
                color: '#5e5d59',
              }}
            >
              {ingredientSections.reduce((acc, s) => acc + s.ingredients.filter(i => i.name.trim()).length, 0)} ingredients
            </span>
          </div>

          <div className="p-6 flex flex-col gap-6">
            {ingredientSections.map((section) => (
              <div
                key={section.id}
                className="border border-border-cream rounded-xl p-4 bg-ivory shadow-sm flex flex-col gap-4"
                style={{ backgroundColor: '#faf9f5' }}
              >
                {/* Section Header (Editable Name) */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-cream pb-3">
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className="text-xs font-medium uppercase tracking-widest"
                      style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f' }}
                    >
                      Part:
                    </span>
                    <input
                      type="text"
                      value={section.name}
                      onChange={e => updateSectionName(section.id, e.target.value)}
                      placeholder="e.g. Dough, Sauce, Topping (optional)"
                      className="bg-transparent border-b border-transparent hover:border-border-cream focus:border-celadon py-0.5 px-2 font-serif text-[16px] font-medium text-foreground outline-none transition-all flex-1"
                      {...focusHandlers}
                    />
                  </div>
                  {ingredientSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredientSection(section.id)}
                      className="text-xs transition-colors font-medium py-1 px-2.5 rounded border"
                      style={{
                        fontFamily: 'Libre Franklin, Arial, sans-serif',
                        color: '#ba1a1a',
                        borderColor: 'transparent',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0';
                        (e.currentTarget as HTMLElement).style.borderColor = '#ffdad6';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                      }}
                    >
                      Remove Part
                    </button>
                  )}
                </div>

                {/* Column headers — desktop */}
                <div
                  className="hidden md:grid gap-2 px-1"
                  style={{ gridTemplateColumns: '6rem 9rem 1fr 2.5rem' }}
                >
                  {['Amount', 'Unit', 'Ingredient', ''].map(h => (
                    <span
                      key={h}
                      className="uppercase tracking-widest text-xs"
                      style={{ fontFamily: 'Libre Franklin, Arial, sans-serif', color: '#87867f', letterSpacing: '0.08em' }}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                {/* Ingredients inside this section */}
                <div className="flex flex-col gap-2">
                  {section.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap md:flex-nowrap gap-2"
                      style={{ borderTop: index > 0 ? '1px solid #f0eee6' : 'none', paddingTop: index > 0 ? '8px' : '0' }}
                    >
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={ingredient.amount}
                        onChange={e => updateIngredientInSection(section.id, index, 'amount', e.target.value ? Number(e.target.value) : '')}
                        className="border rounded-md px-3 py-2.5"
                        style={{ ...inputStyle, width: '96px', fontSize: '15px' }}
                        placeholder="0"
                        {...focusHandlers}
                      />
                      <select
                        value={ingredient.unit}
                        onChange={e => updateIngredientInSection(section.id, index, 'unit', e.target.value)}
                        className="border rounded-md px-3 py-2.5 cursor-pointer"
                        style={{ ...inputStyle, width: '144px', fontSize: '14px' }}
                        {...focusHandlers}
                      >
                        {UNIT_CATEGORIES.map(cat => {
                          const units = UNIT_OPTIONS.filter(u => u.category === cat);
                          return (
                            <optgroup key={cat} label={cat}>
                              {units.map(u => (
                                <option key={u.value} value={u.value}>
                                  {u.label}{u.abbreviation && u.abbreviation !== u.label ? ` (${u.abbreviation})` : ''}
                                </option>
                              ))}
                            </optgroup>
                          );
                        })}
                      </select>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={e => updateIngredientInSection(section.id, index, 'name', e.target.value)}
                        className="flex-1 min-w-32 border rounded-md px-3 py-2.5"
                        style={{ ...inputStyle, fontSize: '15px' }}
                        placeholder="Ingredient name"
                        {...focusHandlers}
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredientFromSection(section.id, index)}
                        className="p-2.5 rounded-md transition-colors duration-200"
                        style={{ color: '#87867f' }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0';
                          (e.currentTarget as HTMLElement).style.color = '#ba1a1a';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.color = '#87867f';
                        }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addIngredientToSection(section.id)}
                  className="btn-secondary self-start mt-2"
                >
                  <Plus size={15} />
                  Add Ingredient
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addIngredientSection}
              className="btn-secondary self-start mt-2 border-dashed"
              style={{ borderColor: '#c8c6be', backgroundColor: 'transparent' }}
            >
              <Plus size={15} />
              Add Recipe Part (e.g. Sauce, Dough)
            </button>
          </div>
        </div>

        {/* ── Instructions Card ──────────────────────────────────────────── */}
        <div
          className="rounded-xl ring-shadow overflow-hidden"
          style={{ backgroundColor: '#faf9f5' }}
        >
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{ backgroundColor: '#f5f4ed', borderColor: '#f0eee6' }}
          >
            <h2
              style={{
                fontFamily: 'Literata, Georgia, serif',
                fontSize: '18px',
                fontWeight: 500,
                color: '#1b1c18',
              }}
            >
              Instructions
            </h2>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                fontFamily: 'Libre Franklin, Arial, sans-serif',
                backgroundColor: '#efeee7',
                color: '#5e5d59',
              }}
            >
              {instructions.filter(i => i.trim()).length} steps
            </span>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex gap-4 items-start">
                {/* Step number badge */}
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mt-1"
                  style={{
                    fontFamily: 'Libre Franklin, Arial, sans-serif',
                    backgroundColor: '#efeee7',
                    color: '#5e5d59',
                    boxShadow: '0px 0px 0px 1px #e8e6dc',
                  }}
                >
                  {index + 1}
                </div>
                <textarea
                  value={instruction}
                  onChange={e => updateInstruction(index, e.target.value)}
                  className="flex-1 border rounded-md px-4 py-3 resize-y"
                  style={{
                    ...inputStyle,
                    fontFamily: 'Literata, Georgia, serif',
                    fontSize: '16px',
                    minHeight: '80px',
                  }}
                  placeholder="Describe this step..."
                  {...focusHandlers}
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className="p-2.5 mt-1 rounded-md transition-colors duration-200"
                  style={{ color: '#87867f' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#fff0f0';
                    (e.currentTarget as HTMLElement).style.color = '#ba1a1a';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = '#87867f';
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              className="btn-secondary self-start mt-2 ml-12"
            >
              <Plus size={15} />
              Add Step
            </button>
          </div>
        </div>

        {/* ── Submit ──────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2 gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-base px-8 py-3"
          >
            Save Recipe
          </button>
        </div>
      </form>
    </div>
  );
}
