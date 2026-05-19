# Recipe Book Proxy — Cloudflare Worker

A minimal Cloudflare Worker that fetches any public recipe URL server-side and returns cleaned text content, bypassing CORS restrictions in the browser.

## Deploy in 3 steps

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Deploy

```bash
cd cloudflare-worker
npm install
npx wrangler deploy
```

Wrangler will print the deployed URL, e.g.:
```
https://recipe-book-proxy.<your-subdomain>.workers.dev
```

### 3. Configure the PWA

Create a `.env.local` file in the project root (copy from `.env.local.example`):

```
VITE_WORKER_URL=https://recipe-book-proxy.<your-subdomain>.workers.dev
```

Then restart the dev server (`npm run dev`).

## How it works

- Accepts `GET /?url=<encoded-url>`  
- Fetches the page with a browser-like User-Agent  
- Strips `<script>`, `<style>`, `<nav>`, `<footer>` and all HTML tags  
- Returns `{ "content": "cleaned readable text..." }` with CORS headers  
- Truncates output to 30 000 chars to fit model context

## Local development

```bash
npx wrangler dev
```

Then set `VITE_WORKER_URL=http://localhost:8787` in `.env.local`.
