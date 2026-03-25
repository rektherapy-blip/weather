# NE Plains WeatherScope — Deployment Guide

## What's in this project

```
weatherscope/
├── vercel.json          ← Tells Vercel how to route requests
├── api/
│   ├── tiles.js         ← Serverless proxy: fetches NOAA/IEM tiles (fixes CORS)
│   └── meta.js          ← Serverless proxy: fetches latest model run time
└── public/
    └── index.html       ← The full frontend app
```

## How it works

The browser cannot directly fetch tiles from Iowa State IEM due to CORS restrictions.
The two files in /api/ run as Vercel "serverless functions" — they fetch the data
server-side and pass it to your browser. This is the key that makes everything work.

---

## Step-by-step deployment

### Step 1 — Create a GitHub repository

1. Go to https://github.com and sign in (create a free account if needed)
2. Click the green "New" button (top left)
3. Name it: `weatherscope`
4. Leave it Public (required for Vercel free tier)
5. Click "Create repository"

### Step 2 — Upload the project files

Option A — GitHub web interface (easiest, no coding needed):
1. On your new repo page, click "uploading an existing file"
2. Drag the entire `weatherscope` folder contents into the upload area
3. Make sure you upload the folder structure exactly as-is:
   - vercel.json (at root)
   - api/tiles.js
   - api/meta.js
   - public/index.html
4. Click "Commit changes"

Option B — GitHub Desktop app:
1. Download GitHub Desktop from desktop.github.com
2. Clone your new repo to your computer
3. Copy the weatherscope files into the cloned folder
4. Commit and push

### Step 3 — Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Click "Import" next to your `weatherscope` GitHub repo
4. Vercel will auto-detect the settings — don't change anything
5. Click "Deploy"
6. Wait ~60 seconds

### Step 4 — Your app is live!

Vercel will give you a URL like:
  https://weatherscope-abc123.vercel.app

That's your live app! Open it on any device — phone, tablet, computer.

---

## How updates work

- Any time you push a change to GitHub, Vercel auto-redeploys in ~30 seconds
- The app itself auto-refreshes model data every 15 minutes while open
- New HRRR runs (every hour) are picked up automatically

---

## Troubleshooting

**Radar tiles not showing:**
- Wait 30 seconds and refresh — the serverless functions need a "warm up" on first load
- Check Vercel dashboard → your project → "Functions" tab for any errors

**"Failed to load" error:**
- IEM occasionally has downtime. Try again in a few minutes.
- The app falls back to a clock-calculated run time automatically

**Blank map (black screen):**
- Make sure vercel.json is at the ROOT of the repo, not inside a subfolder

---

## Costs

- Vercel Hobby plan: FREE for personal/non-commercial use
- Iowa State IEM data: FREE (public service)
- NOAA data: FREE (public)
- Total monthly cost: $0

If you ever want to charge for access or go commercial: upgrade to Vercel Pro ($20/month)

---

## Data sources

- HRRR Simulated Reflectivity: Iowa State IEM
  https://mesonet.agron.iastate.edu/GIS/model.phtml
- NEXRAD Live Radar: Iowa State IEM / NOAA
- NWS Warnings: Iowa State IEM / National Weather Service
- Base maps: CartoDB, OpenTopoMap, ESRI

---

Questions? The app was built to be extended — ask Claude to add new features anytime!
