export interface UnitOption {
  value: string;
  label: string;
  abbreviation: string;
  category: string;
  baseUnit: string;   // canonical unit for conversion within a category
  toBase: number;     // multiply by this to convert to baseUnit
}

export const UNIT_OPTIONS: UnitOption[] = [
  // ─── Volume ────────────────────────────────────────────
  { value: 'tsp',     label: 'Teaspoon',      abbreviation: 'tsp',  category: 'Volume', baseUnit: 'ml',  toBase: 4.92892   },
  { value: 'tbsp',    label: 'Tablespoon',    abbreviation: 'tbsp', category: 'Volume', baseUnit: 'ml',  toBase: 14.7868   },
  { value: 'fl oz',   label: 'Fluid Ounce',   abbreviation: 'fl oz',category: 'Volume', baseUnit: 'ml',  toBase: 29.5735   },
  { value: 'cup',     label: 'Cup',           abbreviation: 'cup',  category: 'Volume', baseUnit: 'ml',  toBase: 236.588   },
  { value: 'pint',    label: 'Pint',          abbreviation: 'pt',   category: 'Volume', baseUnit: 'ml',  toBase: 473.176   },
  { value: 'quart',   label: 'Quart',         abbreviation: 'qt',   category: 'Volume', baseUnit: 'ml',  toBase: 946.353   },
  { value: 'gallon',  label: 'Gallon',        abbreviation: 'gal',  category: 'Volume', baseUnit: 'ml',  toBase: 3785.41   },
  { value: 'ml',      label: 'Millilitre',    abbreviation: 'ml',   category: 'Volume', baseUnit: 'ml',  toBase: 1         },
  { value: 'l',       label: 'Litre',         abbreviation: 'L',    category: 'Volume', baseUnit: 'ml',  toBase: 1000      },

  // ─── Weight ────────────────────────────────────────────
  { value: 'oz',      label: 'Ounce',         abbreviation: 'oz',   category: 'Weight', baseUnit: 'g',   toBase: 28.3495   },
  { value: 'lb',      label: 'Pound',         abbreviation: 'lb',   category: 'Weight', baseUnit: 'g',   toBase: 453.592   },
  { value: 'g',       label: 'Gram',          abbreviation: 'g',    category: 'Weight', baseUnit: 'g',   toBase: 1         },
  { value: 'kg',      label: 'Kilogram',      abbreviation: 'kg',   category: 'Weight', baseUnit: 'g',   toBase: 1000      },

  // ─── Count / Other ─────────────────────────────────────
  { value: 'piece',   label: 'Piece',         abbreviation: 'pc',   category: 'Count', baseUnit: 'piece', toBase: 1       },
  { value: 'pinch',   label: 'Pinch',         abbreviation: 'pinch',category: 'Other', baseUnit: 'pinch', toBase: 1       },
  { value: 'dash',    label: 'Dash',          abbreviation: 'dash', category: 'Other', baseUnit: 'dash',  toBase: 1       },
  { value: 'can',     label: 'Can',           abbreviation: 'can',  category: 'Count', baseUnit: 'can',   toBase: 1       },
  { value: 'stick',   label: 'Stick',         abbreviation: 'stick',category: 'Count', baseUnit: 'stick', toBase: 1       },
  { value: 'slice',   label: 'Slice',         abbreviation: 'slice',category: 'Count', baseUnit: 'slice', toBase: 1       },
  { value: 'clove',   label: 'Clove',         abbreviation: 'clove',category: 'Count', baseUnit: 'clove', toBase: 1       },
  { value: '',        label: 'No unit',       abbreviation: '',     category: 'Other', baseUnit: '',       toBase: 1       },
];

export const UNIT_CATEGORIES = ['Volume', 'Weight', 'Count', 'Other'] as const;

export function getUnitOption(value: string): UnitOption | undefined {
  return UNIT_OPTIONS.find(u => u.value === value);
}

/**
 * Given a known base unit and a target known-amount in the target unit,
 * compute the scale factor relative to the original recipe amount.
 *
 * Returns `null` if units are incompatible or amounts are zero/undefined.
 */
export function computeScaleFromAmount(
  originalAmount: number,
  originalUnit: string,
  targetAmount: number,
  targetUnit: string,
): number | null {
  if (!originalAmount || !targetAmount) return null;

  const orig = getUnitOption(originalUnit);
  const tgt  = getUnitOption(targetUnit);

  if (!orig || !tgt) return null;

  // Must share the same base unit to be comparable
  if (orig.baseUnit !== tgt.baseUnit) return null;

  const originalInBase = originalAmount * orig.toBase;
  const targetInBase   = targetAmount   * tgt.toBase;

  return targetInBase / originalInBase;
}
