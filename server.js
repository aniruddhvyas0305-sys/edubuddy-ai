require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

if (!API_KEY) {
  console.error('Missing GEMINI_API_KEY in your .env file. See .env.example.');
  process.exit(1);
}

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Very basic per-IP rate limiting (in-memory, resets on restart) ---
// Protects your API key from runaway costs when many people use the link.
const REQUESTS_PER_WINDOW = 20;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + WINDOW_MS;
  }
  entry.count += 1;
  hits.set(ip, entry);
  return entry.count > REQUESTS_PER_WINDOW;
}

app.post('/api/chat', async (req, res) => {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Whoa, slow down! Try again in a bit.' });
  }

  const { systemPrompt, history } = req.body;
  if (!systemPrompt || !Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'Bad request.' });
  }

  try {
    // Gemini uses roles "user" / "model" instead of "user" / "assistant"
    const contents = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API error:', response.status, errText);
      return res.status(502).json({ error: 'Tutor is unavailable right now.' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n') || '';

    if (!text) {
      return res.status(502).json({ error: "Tutor couldn't come up with an answer — try rephrasing." });
    }

    res.json({ text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

app.listen(PORT, () => {
  console.log(`EduBuddy AI running at http://localhost:${PORT}`);
});
