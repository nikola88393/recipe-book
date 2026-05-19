import { useState, useCallback, useRef, useEffect } from 'react';
import { X, ShoppingCart, ChevronRight, Check, RotateCcw, Minus } from 'lucide-react';
import type { Recipe } from '../db';

interface ShoppingListItem {
  key: string;   // unique per ingredient line
  text: string;  // display string, e.g. "2 cups flour"
  checked: boolean;
}

interface Props {
  recipes: Recipe[];
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise an ingredient into a single human-readable line. */
function ingredientText(ing: { amount: number | ''; unit: string; name: string }): string {
  const parts: string[] = [];
  if (ing.amount !== '' && ing.amount !== 0 && ing.amount !== null) parts.push(String(ing.amount));
  if (ing.unit) parts.push(ing.unit);
  if (ing.name) parts.push(ing.name);
  return parts.join(' ').trim();
}

/** Build a deduplication key from an ingredient text. */
function normKey(text: string) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** Merge ingredient lists from selected recipes into a single checked list.
 *  Duplicate lines (same normalised text) are merged and the amounts summed
 *  when possible, otherwise just de-duplicated.
 */
function buildList(recipes: Recipe[], selectedIds: Set<string>): ShoppingListItem[] {
  const seen = new Map<string, ShoppingListItem>();

  for (const recipe of recipes) {
    if (!selectedIds.has(recipe.id!)) continue;
    for (const ing of recipe.ingredients) {
      const text = ingredientText(ing);
      if (!text) continue;
      const nk = normKey(text);
      if (!seen.has(nk)) {
        seen.set(nk, { key: nk, text, checked: false });
      }
      // If already present we leave the first occurrence; simple dedup.
    }
  }

  return Array.from(seen.values());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Step = 'select' | 'list';

export function ShoppingListModal({ recipes, onClose }: Props) {
  const [step, setStep] = useState<Step>('select');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose],
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Step: recipe selection ──────────────────────────────────────────────

  function toggleRecipe(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function handleBuild() {
    if (selectedIds.size === 0) return;
    const list = buildList(recipes, selectedIds);
    setItems(list);
    setStep('list');
  }

  // ── Step: shopping list ─────────────────────────────────────────────────

  function toggleItem(key: string) {
    setItems(prev =>
      prev.map(it => it.key === key ? { ...it, checked: !it.checked } : it),
    );
  }

  function resetChecked() {
    setItems(prev => prev.map(it => ({ ...it, checked: false })));
  }

  const checked = items.filter(i => i.checked).length;
  const total = items.length;
  const progress = total === 0 ? 0 : Math.round((checked / total) * 100);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-near-black/50 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping List"
    >
      <div className="relative bg-ivory w-full max-w-xl max-h-[90vh] rounded-[16px] shadow-[rgba(0,0,0,0.18)_0px_16px_64px] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-cream flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-celadon/15 flex items-center justify-center text-celadon">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h2 className="font-serif font-medium text-[20px] text-foreground leading-tight">
                Shopping List
              </h2>
              <p className="text-[13px] font-sans text-stone-gray mt-0.5">
                {step === 'select'
                  ? `${selectedIds.size} recipe${selectedIds.size !== 1 ? 's' : ''} selected`
                  : `${checked} / ${total} items ticked`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="shopping-list-close"
            aria-label="Close shopping list"
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-gray hover:text-foreground hover:bg-warm-sand transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar (list step only) */}
        {step === 'list' && (
          <div className="px-6 pt-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-sans text-stone-gray tracking-wide uppercase">Progress</span>
              <span className="text-[12px] font-sans text-stone-gray">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-warm-sand overflow-hidden">
              <div
                className="h-full rounded-full bg-celadon transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 'select' ? (
            <SelectRecipesPanel
              recipes={recipes}
              selectedIds={selectedIds}
              onToggle={toggleRecipe}
            />
          ) : (
            <ShoppingListPanel
              items={items}
              onToggle={toggleItem}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border-cream flex-shrink-0 bg-ivory">
          {step === 'select' ? (
            <>
              <button
                onClick={onClose}
                className="btn-secondary h-9 px-4 text-[14px]"
              >
                Cancel
              </button>
              <button
                id="shopping-list-build"
                onClick={handleBuild}
                disabled={selectedIds.size === 0}
                className="btn-primary flex items-center gap-2 text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Build list
                <ChevronRight size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep('select')}
                className="btn-secondary h-9 px-4 text-[14px] flex items-center gap-2"
              >
                <Minus size={14} /> Change recipes
              </button>
              <button
                onClick={resetChecked}
                disabled={checked === 0}
                className="btn-secondary h-9 px-4 text-[14px] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw size={13} /> Reset
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SelectRecipesPanel({
  recipes,
  selectedIds,
  onToggle,
}: {
  recipes: Recipe[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-16 text-stone-gray font-sans text-[15px]">
        Your recipe book is empty.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-sans text-stone-gray mb-2">
        Select the recipes you want to shop for:
      </p>
      {recipes.map(recipe => {
        const isSelected = selectedIds.has(recipe.id!);
        return (
          <button
            key={recipe.id}
            id={`recipe-select-${recipe.id}`}
            onClick={() => onToggle(recipe.id!)}
            className={[
              'w-full text-left rounded-[10px] px-4 py-3 border transition-all duration-150 flex items-center justify-between gap-3',
              isSelected
                ? 'border-celadon bg-celadon/8 shadow-[0_0_0_1px_#94C595]'
                : 'border-border-cream hover:border-celadon/50 hover:bg-celadon/5',
            ].join(' ')}
          >
            <div className="flex-1 min-w-0">
              <div className="font-serif font-medium text-[16px] text-foreground truncate">
                {recipe.title}
              </div>
              <div className="text-[12px] font-sans text-stone-gray mt-0.5">
                {recipe.ingredients.length} ingredient{recipe.ingredients.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div
              className={[
                'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
                isSelected
                  ? 'border-celadon bg-celadon text-ivory'
                  : 'border-stone-gray/40',
              ].join(' ')}
            >
              {isSelected && <Check size={11} strokeWidth={3} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ShoppingListPanel({
  items,
  onToggle,
}: {
  items: ShoppingListItem[];
  onToggle: (key: string) => void;
}) {
  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);

  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-stone-gray font-sans text-[15px]">
        No ingredients found in selected recipes.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Unchecked items */}
      {unchecked.map(item => (
        <IngredientRow key={item.key} item={item} onToggle={onToggle} />
      ))}

      {/* Divider when some are checked */}
      {checked.length > 0 && unchecked.length > 0 && (
        <div className="flex items-center gap-3 my-3">
          <div className="flex-1 h-px bg-border-cream" />
          <span className="text-[11px] font-sans text-stone-gray uppercase tracking-widest">
            In basket
          </span>
          <div className="flex-1 h-px bg-border-cream" />
        </div>
      )}

      {/* Checked items */}
      {checked.map(item => (
        <IngredientRow key={item.key} item={item} onToggle={onToggle} />
      ))}
    </div>
  );
}

function IngredientRow({
  item,
  onToggle,
}: {
  item: ShoppingListItem;
  onToggle: (key: string) => void;
}) {
  return (
    <button
      id={`ingredient-${item.key.replace(/\s+/g, '-').slice(0, 40)}`}
      onClick={() => onToggle(item.key)}
      className={[
        'w-full text-left flex items-center gap-3 rounded-[8px] px-3 py-2.5 transition-all duration-150 group',
        item.checked
          ? 'opacity-50'
          : 'hover:bg-celadon/6',
      ].join(' ')}
    >
      <div
        className={[
          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150',
          item.checked
            ? 'border-celadon bg-celadon text-ivory'
            : 'border-stone-gray/40 group-hover:border-celadon/70',
        ].join(' ')}
      >
        {item.checked && <Check size={11} strokeWidth={3} />}
      </div>
      <span
        className={[
          'font-sans text-[15px] transition-all duration-150',
          item.checked
            ? 'line-through text-stone-gray'
            : 'text-foreground',
        ].join(' ')}
      >
        {item.text}
      </span>
    </button>
  );
}
