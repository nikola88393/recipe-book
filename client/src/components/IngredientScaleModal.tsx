import { useState, useRef, useEffect } from 'react';
import { X, RefreshCw } from 'lucide-react';
import { UNIT_OPTIONS, UNIT_CATEGORIES, getUnitOption, computeScaleFromAmount, type UnitOption } from '../lib/measurements';
import type { Ingredient } from '../db';

interface IngredientScaleModalProps {
  ingredient: Ingredient;
  index: number;
  onClose: () => void;
  onScale: (scale: number) => void;
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? n.toString() : parseFloat(n.toFixed(3)).toString();
}

export function IngredientScaleModal({ ingredient, onClose, onScale }: IngredientScaleModalProps) {
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState<string>(ingredient.unit);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const origUnit = getUnitOption(ingredient.unit);
  const tgtUnit = getUnitOption(targetUnit);
  const sameCategory = origUnit && tgtUnit && origUnit.baseUnit === tgtUnit.baseUnit;

  const computedScale = sameCategory && ingredient.amount !== '' && targetAmount
    ? computeScaleFromAmount(Number(ingredient.amount), ingredient.unit, Number(targetAmount), targetUnit)
    : null;

  const handleApply = () => {
    if (computedScale && computedScale > 0) {
      onScale(computedScale);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleApply();
    if (e.key === 'Escape') onClose();
  };

  const compatibleUnits: UnitOption[] = origUnit
    ? UNIT_OPTIONS.filter(u => u.baseUnit === origUnit.baseUnit || u.value === '')
    : UNIT_OPTIONS;

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(20,20,19,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-ivory border border-border-cream rounded-[24px] shadow-[rgba(0,0,0,0.12)_0px_16px_48px] w-full max-w-md mx-4 p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[12px] uppercase tracking-[0.5px] text-stone-gray mb-1">Scale by ingredient</p>
            <h3 className="font-serif text-[22px] font-medium text-foreground leading-[1.20]">{ingredient.name}</h3>
          </div>
          <button onClick={onClose} className="text-stone-gray hover:text-foreground transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        {/* Original amount reference */}
        {ingredient.amount !== '' && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-background border border-border-cream">
            <RefreshCw size={14} className="text-stone-gray shrink-0" />
            <p className="font-sans text-[14px] text-olive-gray">
              Original: <span className="font-medium text-foreground">{formatNum(Number(ingredient.amount))} {ingredient.unit}</span>
            </p>
          </div>
        )}

        {/* "I have…" input */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-[12px] uppercase tracking-[0.5px] text-stone-gray">
            I have…
          </label>
          <div className="flex gap-2 md:flex-row flex-col">
            <input
              ref={inputRef}
              type="number"
              step="any"
              min="0"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-background border border-border-cream focus:border-focus focus:ring-1 focus:ring-focus rounded-[12px] px-4 py-3 font-sans text-[20px] text-foreground outline-none transition-shadow"
              placeholder="0"
            />
            <select
              value={targetUnit}
              onChange={e => setTargetUnit(e.target.value)}
              className="w-28 bg-background border border-border-cream focus:border-focus focus:ring-1 focus:ring-focus rounded-[12px] px-3 py-3 font-sans text-[15px] text-foreground outline-none transition-shadow cursor-pointer"
            >
              {UNIT_CATEGORIES.map(cat => {
                const units = compatibleUnits.filter(u => u.category === cat);
                if (units.length === 0) return null;
                return (
                  <optgroup key={cat} label={cat}>
                    {units.map(u => (
                      <option key={u.value} value={u.value}>{u.abbreviation || u.label}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Incompatibility hint */}
          {targetAmount && origUnit && tgtUnit && !sameCategory && origUnit.baseUnit !== '' && tgtUnit.baseUnit !== '' && (
            <p className="font-sans text-[13px] text-error mt-1">
              Units are incompatible — choose a {origUnit.category.toLowerCase()} unit.
            </p>
          )}
        </div>

        {/* Computed scale preview */}
        {computedScale && computedScale > 0 && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-celadon/10 border border-celadon/30">
            <span className="font-sans text-[14px] text-olive-gray">Recipe scales to</span>
            <span className="font-serif text-[18px] font-medium text-foreground ml-auto">×{formatNum(computedScale)}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="flex-1 btn-secondary justify-center py-3">
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!computedScale || computedScale <= 0}
            className="flex-1 btn-primary justify-center py-3 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Apply Scale
          </button>
        </div>
      </div>
    </div>
  );
}
