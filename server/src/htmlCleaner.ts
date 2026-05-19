/**
 * Strips HTML to readable plain text suitable for sending to an LLM.
 * Uses keyword-based extraction to isolate the recipe section,
 * keeping the output well within Groq's context limits.
 */

const BLOCK_REMOVE_TAGS = [
  'script', 'style', 'noscript', 'svg', 'iframe', 'video', 'audio',
  'canvas', 'picture', 'source', 'link', 'meta',
  'nav', 'footer', 'header', 'aside', 'form',
];

const RECIPE_KEYWORDS = [
  'ingredient', 'instruction', 'direction', 'method', 'step', 'preparation',
  'cup', 'tbsp', 'tsp', 'tablespoon', 'teaspoon', 'ounce', 'gram', 'pound',
  'preheat', 'bake', 'cook', 'stir', 'mix', 'chop', 'simmer', 'boil',
  'add', 'combine', 'heat', 'season', 'serve', 'yield', 'serves',
];

const RECIPE_KW_RE = new RegExp(RECIPE_KEYWORDS.join('|'), 'i');

// ~15 000 chars ≈ 3 750 tokens, well within Groq's 8k-128k context windows
const MAX_CHARS = 15_000;
const RECIPE_SECTION_MIN = 400;

function stripBlockTags(html: string): string {
  let s = html;
  for (const tag of BLOCK_REMOVE_TAGS) {
    s = s.replace(new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, 'gi'), ' ');
    s = s.replace(new RegExp(`<${tag}[^>]*\\/?>`, 'gi'), ' ');
  }
  return s;
}

function htmlToText(html: string): string {
  const BLOCK_TAGS = ['p', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'br', 'tr', 'dt', 'dd', 'section', 'article'];
  let s = html;
  for (const tag of BLOCK_TAGS) {
    s = s.replace(new RegExp(`<\\/?${tag}[^>]*>`, 'gi'), '\n');
  }
  s = s.replace(/<[^>]+>/g, ' ');
  s = s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/gi, ' ');
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

function extractRecipeSection(fullText: string): string {
  const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const relevant = new Set<number>();

  lines.forEach((line, i) => {
    if (RECIPE_KW_RE.test(line)) {
      for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) {
        relevant.add(j);
      }
    }
  });

  if (relevant.size === 0) return '';

  const sorted = [...relevant].sort((a, b) => a - b);
  const chunks: string[] = [];
  let prev = -2;
  for (const idx of sorted) {
    if (idx !== prev + 1) chunks.push('');
    chunks.push(lines[idx]);
    prev = idx;
  }
  return chunks.join('\n').trim();
}

export function cleanHtml(html: string): string {
  const stripped = stripBlockTags(html);
  const fullText = htmlToText(stripped);

  const recipeSection = extractRecipeSection(fullText);
  const source = recipeSection.length >= RECIPE_SECTION_MIN ? recipeSection : fullText;

  return source.length <= MAX_CHARS ? source : source.slice(0, MAX_CHARS) + '\n[...truncated]';
}
