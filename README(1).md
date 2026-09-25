# EduBuddy AI

A Socratic AI tutor for Class 7–10 students (CBSE, ICSE, State Board, IB). Runs as a small Node.js server + a single-page frontend, so once it's deployed, anyone with the link can use it — no login needed. Runs on **Google Gemini's free API tier** — no billing required.

## 1. Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account.
3. Click "Create API key" — no credit card needed.
4. Copy the key.

The free tier resets daily and has generous limits for a small project like this — genuinely free, not a trial.

## 2. Run it locally (to test)
```bash
npm install
cp .env.example .env
# open .env and paste your real key in place of "your-gemini-api-key-here"
npm start
```
Visit `http://localhost:3000` — you should see EduBuddy AI running.

## 3. Deploy it so friends worldwide can use it
The easiest free option is **Render**:

1. Push this folder to a GitHub repo (create one on github.com, then `git init`, `git add .`, `git commit -m "init"`, `git remote add origin <your-repo-url>`, `git push -u origin main`).
2. Go to https://render.com → New → Web Service → connect your GitHub repo.
3. Build command: `npm install`. Start command: `npm start`.
4. Under Environment, add a variable: `GEMINI_API_KEY` = your real key.
5. Deploy. Render gives you a public URL like `https://edubuddy-ai.onrender.com` — that's the link you send to friends.

Railway (https://railway.app) and Fly.io work the same way if you'd rather use those.

## 4. Cost & fair use
- Gemini's free tier is genuinely free — no card, no bill — but it has daily/per-minute request limits shared across everyone using your key.
- `server.js` includes a basic rate limit (20 messages per IP per hour) so one person can't burn through the whole daily quota. Adjust `REQUESTS_PER_WINDOW` in `server.js` if needed.
- If your friend group is large and you hit Gemini's daily cap, requests will fail until it resets the next day — that's expected on the free tier, not a bug.
- Never commit your real `.env` file or API key to a public GitHub repo — `.gitignore` handles this.

## Files
- `server.js` — Express backend, proxies chat requests to the Anthropic API
- `public/index.html` — the frontend chat UI
- `.env.example` — template for your API key (copy to `.env`, never commit `.env`)
