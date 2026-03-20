# Chess Climb Challenge

A live leaderboard web app for tracking a chess rating climb challenge with friends using Chess.com stats.

## Features

- Live leaderboard ranked by rating gain since challenge start
- Current rating, gain/loss (color-coded), games played, win rate
- Win/draw/loss breakdown by color (White and Black)
- Rating-over-time chart per player using recent game archives
- Progress bar toward a configurable target rating
- Current streak, best win, last active timestamp
- Auto-refresh every 5 minutes with manual refresh button
- Admin panel to manage players, set target rating, start date, and format
- Dark chess-themed UI, mobile-friendly

## Quick Start (Local Dev)

```bash
cd chess-climb
npm install
npm run dev
```

Open http://localhost:5173

## How to Use

### Adding Players

1. Click the **gear icon** (bottom-right corner)
2. Enter the admin PIN (default: `1234`)
3. Type a Chess.com username and click **Add**
4. Click **Save & Refresh**

### Setting Challenge Start Date & Target Rating

1. Open the admin panel (gear icon → enter PIN)
2. Set the **Target Rating** (e.g., 1500)
3. Set the **Challenge Start Date** — rating gain is calculated from this date
4. Choose the **Game Format** (Rapid, Blitz, or Bullet)
5. Click **Save & Refresh**

### Changing the Admin PIN

The default PIN is `1234`. Change it in the admin panel under **Admin PIN**.

## Deploy to Vercel (Under 5 Minutes)

1. **Push to GitHub**: Push this project to a GitHub repository
2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub
3. Click **"Add New..." → Project**
4. **Import** your GitHub repository
5. Vercel auto-detects Vite — just click **Deploy**
6. Wait ~30 seconds for the build to complete
7. **Copy the URL** and share it with your friends!

That's it. Everyone who opens the URL sees the same live leaderboard. Each person's browser fetches data directly from Chess.com's public API.

### Important: Shared Config

Config (players, target, start date) is stored in each browser's **localStorage**. To share the same setup:

- One person configures everything via the admin panel
- Share the URL — other users will need to set up the same config on their device, OR
- Pre-configure the defaults in `src/config.js` before deploying

## Tech Stack

- React + Vite
- Tailwind CSS v4
- Recharts (rating charts)
- Chess.com Public API (no auth needed)
- Vercel (static hosting)

## Chess.com API Endpoints Used

- `GET /pub/player/{username}/stats` — current ratings, win/loss/draw
- `GET /pub/player/{username}/games/archives` — list of monthly archive URLs
- `GET /pub/player/{username}/games/{YYYY}/{MM}` — games for a specific month

No API key required. All requests go directly from the browser.
