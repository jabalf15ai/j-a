# j-a

Static single-page profile/assistant. Prepared for Vercel deployment with a serverless proxy to Gemini.

## Deploying to Vercel
1) In the Vercel project settings, add environment variable `GEMINI_API_KEY` with your Gemini key.
2) Deploy the repo root (the entry file is `index.html`). The frontend calls `/api/gemini`, which is served by `api/gemini.js`.
3) After deployment, open the Vercel URL; the chat and tools will use the serverless function without exposing the key to the client codebase.

For local testing with Vercel CLI:
```bash
vercel dev
```
