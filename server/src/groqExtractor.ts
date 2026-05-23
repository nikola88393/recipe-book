import Groq from 'groq-sdk';

const VALID_UNITS = [
  'tsp', 'tbsp', 'fl oz', 'cup', 'pint', 'quart', 'gallon', 'ml', 'l',
  'oz', 'lb', 'g', 'kg', 'piece', 'pinch', 'dash', 'can', 'stick', 'slice', 'clove', '',
];

export interface Ingredient {
  amount: number | null;
  unit: string;
  name: string;
  part: string;
}

export interface ExtractedRecipe {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
}

function buildPrompt(pageText: string): string {
  return `You are a recipe data extraction API. Extract the recipe from the page text below and return ONLY a valid JSON object — no markdown, no explanation.

Schema:
{
  "title": string,
  "description": string,
  "ingredients": [{ "amount": number | null, "unit": string, "name": string, "part": string }],
  "instructions": [string]
}

Rules:
- "amount" is a number (e.g. 2, 0.5) or null if not specified.
- "unit" must be one of: ${VALID_UNITS.map(u => u ? `"${u}"` : '""').join(', ')}.
- "part" is the section or part of the recipe the ingredient belongs to (e.g. "Dough", "Sauce", "Topping", "Main"). If the ingredients are grouped under headers in the text, extract those headers as the "part". If there are no distinct sections or if a recipe has a single flat list, use an empty string "" or "Main".
- Each instruction is a single complete step.
- If no recipe is found, return: {"error": "No recipe found"}

PAGE TEXT:
${pageText}`;
}

function parseResponse(raw: string): ExtractedRecipe {
  const stripped = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Groq did not return a JSON object.');

  const json = JSON.parse(stripped.slice(start, end + 1)) as Record<string, unknown>;
  if (json.error) throw new Error(String(json.error));

  const ingredients: Ingredient[] = Array.isArray(json.ingredients)
    ? (json.ingredients as Record<string, unknown>[]).map(i => {
        const rawUnit = String(i.unit ?? '').trim().toLowerCase();
        const unit = VALID_UNITS.includes(rawUnit) ? rawUnit : '';
        const rawAmount = i.amount;
        const amount: number | null =
          typeof rawAmount === 'number' && isFinite(rawAmount) && rawAmount > 0
            ? rawAmount : null;
        const part = String(i.part ?? '').trim();
        return { amount, unit, name: String(i.name ?? '').trim(), part };
      })
    : [];

  const instructions: string[] = Array.isArray(json.instructions)
    ? (json.instructions as unknown[]).map(s => String(s).trim()).filter(Boolean)
    : [];

  return {
    title: String(json.title ?? 'Imported Recipe').trim(),
    description: String(json.description ?? '').trim(),
    ingredients,
    instructions,
  };
}

export async function extractRecipeWithGroq(
  pageText: string,
  apiKey: string,
): Promise<ExtractedRecipe> {
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL ?? '';
  const workerSecret = process.env.CLOUDFLARE_WORKER_SECRET ?? '';

  const groqOptions: any = { apiKey };

  if (workerUrl && workerSecret) {
    const cleanUrl = workerUrl.endsWith('/') ? workerUrl.slice(0, -1) : workerUrl;
    groqOptions.baseURL = `${cleanUrl}/groq`;
    groqOptions.defaultHeaders = {
      'X-Custom-Proxy-Key': workerSecret,
    };
  }

  const groq = new Groq(groqOptions);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: buildPrompt(pageText) }],
    temperature: 0,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  if (!raw.trim()) throw new Error('Groq returned an empty response.');
  return parseResponse(raw);
}
