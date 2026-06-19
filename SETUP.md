# School Test Bank — Setup Guide

No terminal, no npm. Just edit one file and push to GitHub.

---

## Step 1 — Edit config.js

Open `config.js` in Notepad and fill in your two Supabase values:

```js
const SUPABASE_URL      = 'https://YOUR-PROJECT-ID.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGci...'
```

Get these from: **Supabase → Settings → API**
- Project URL → `SUPABASE_URL`
- anon / public key → `SUPABASE_ANON_KEY`

Leave `AI_WORKER_URL` as-is for now (set it up in Step 4).

---

## Step 2 — Update Supabase Auth settings

In your Supabase project go to **Authentication → URL Configuration**:

- **Site URL** → `https://YOUR-GITHUB-USERNAME.github.io/testbank`
- **Redirect URLs** → add `https://YOUR-GITHUB-USERNAME.github.io/testbank/**`

Also make sure **Authentication → Providers → Google** is toggled on with your Client ID and Secret.

---

## Step 3 — Push to GitHub Pages

1. Create a new GitHub repository called `testbank` (make it **public**)
2. Upload all files in this folder to that repository
   - You can drag and drop them at github.com/YOUR-USERNAME/testbank
3. Go to **Settings → Pages**
4. Under **Source** select **Deploy from a branch → main → / (root)**
5. Click Save — GitHub gives you a URL like:
   `https://YOUR-USERNAME.github.io/testbank`
6. Open that URL — the login page should appear

---

## Step 4 — Set up AI Question Generation (Cloudflare Worker)

This takes about 5 minutes and is free.

1. Go to [workers.cloudflare.com](https://workers.cloudflare.com) → sign up (free)
2. Click **Create a Worker**
3. Delete the default code and paste in the contents of `worker.js`
4. Click **Deploy**
5. Go to **Settings → Variables → Add variable**:
   - Variable name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...` (your Anthropic key)
   - Click **Encrypt** then **Save**
6. Copy your Worker URL (looks like `https://testbank-ai.your-name.workers.dev`)
7. Open `config.js` and paste it as `AI_WORKER_URL`
8. Commit and push the updated `config.js` to GitHub

---

## Step 5 — Run the SQL in Supabase

If you haven't already, go to **Supabase → SQL Editor → New query**, paste the contents of `../school-testbank/supabase/migrations/001_initial.sql` and click **Run**.

---

## Files in this folder

| File | Purpose |
|------|---------|
| `config.js` | Your Supabase URL, anon key, and AI Worker URL |
| `index.html` | Login page |
| `dashboard.html` | Dashboard with stats and recent questions |
| `questions.html` | Question bank — search, filter, browse |
| `question-form.html` | Add a new question OR edit an existing one |
| `generate.html` | AI question generator |
| `worker.js` | Cloudflare Worker code (paste into Cloudflare, don't upload to GitHub) |

---

## What teachers need to do

Just open the GitHub Pages URL and sign in with their school Google account. That's it — no app to install.
