# Deploying Social Stakes

Two services: an Express + socket.io backend (long-lived process, can't be
serverless) and a Create-React-App frontend (static build).

## Architecture

```
Vercel (frontend/, static CRA build)
    ├── REACT_APP_BACKEND_PROD_URL → points at Render
    └── socket.io-client + REST connect to backend
                        ↓
Render (backend/, web service running ./bin/www)
    └── Render Postgres (managed)
```

socket.io requires sticky long-lived TCP connections, so Vercel serverless
functions / edge are **not** an option for the backend. Render's free web
service tier works; Railway and Fly.io are equivalent alternatives.

## One-time prep (do this once)

1. **Rotate the AWS keys.** They've been sitting in `backend/.env` on the
   dev machine. Even though the file was never committed
   (`git ls-files | grep env` returns empty), rotate them in the AWS
   console before going public.
2. **Generate a strong JWT_SECRET.** The local dev value is weak.
   `openssl rand -base64 48` is fine.
3. Copy `backend/.env.example` → `backend/.env` and fill in real values
   for local dev.
4. Copy `frontend/.env.example` → `frontend/.env` only when you're ready
   to test prod backend from a local frontend.

## Deploy the backend (Render)

This repo already has the right scripts (`backend/package.json` uses
`per-env`, so `npm start` runs `bin/www` via `start:production` when
`NODE_ENV=production`).

1. Push the current branch to GitHub.
2. In Render dashboard → **New +** → **Web Service** → connect the repo.
3. Settings:
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
     (`build` runs `psql-setup-script.js` which creates the schema +
     runs migrations + seeds — safe to re-run.)
   - Start command: `npm start`
   - Environment: `Node 18`
4. Add a Render Postgres database in the same dashboard, attach it to
   the web service — Render will set `DATABASE_URL` automatically.
5. Set env vars on the web service:
   - `NODE_ENV=production`
   - `JWT_SECRET=<the new strong secret>`
   - `JWT_EXPIRES_IN=604800`
   - `SCHEMA=socialstake_schema`
   - `REACT_APP_BACKEND_PROD_URL=<your Vercel URL — fill in step 2 of frontend>`
     (yes, the name is misleading — it's used as the allowed socket.io
     CLIENT origin)
   - `AWS_ACCESS_KEY_ID=<rotated>`
   - `AWS_SECRET_ACCESS_KEY=<rotated>`
6. Deploy. First boot will run migrations + seed the demo users.
7. After it's up, hit `https://<your-service>.onrender.com/` — should
   return `Welcome to Dcraderdev's Social Stakes!`.

> The existing Render service `socialstakes.onrender.com` is currently
> *suspended-by-user*. You can resume that one instead of creating a
> fresh service — env vars are already configured, just rotate the
> secrets first.

## Deploy the frontend (Vercel)

1. In Vercel → **Add New** → **Project** → import the same repo.
2. Settings:
   - Root directory: `frontend`
   - Framework preset: **Create React App**
   - Build command: `npm run build` (default)
   - Output directory: `build` (default)
3. Add env var:
   - `REACT_APP_BACKEND_PROD_URL=https://<your-render-backend>.onrender.com`
4. Deploy.
5. Go back to the Render service and update its
   `REACT_APP_BACKEND_PROD_URL` to the new Vercel URL (this is the CORS
   origin variable). Trigger a Render redeploy.

## Verify the live site

1. Open the Vercel URL.
2. Click **Demo** in the nav → **Demo 1** → you should be logged in
   as `bigtree` with $89k.
3. Click **Multi Player Blackjack** → first table (Eureka).
4. Take a seat, click a chip, watch a hand deal.
5. Open the chat icon (top-left of the table) — chat events should
   appear in real time as the hand progresses.

If sockets aren't connecting:
- Open browser devtools → Network → WS tab → check the websocket
  upgrade request.
- 99% of the time it's the misnamed env var: the **backend** wants
  `REACT_APP_BACKEND_PROD_URL` set to the **frontend** URL.

## Demo user one-click login

Already built into the nav. Top-right shows **Demo** → dropdown reveals
Demo 1 / Demo 2 / Demo 3. Each calls `sessionActions.login()` with
seeded credentials:

- Demo 1 → `bigtree / password`
- Demo 2 → `Pine / password2`
- Demo 3 → `Spruce / password`

Those users are created during the seed step on first Render boot.

## What's not deployed-ready and why

- **Stats page** still says "coming soon" — replaced by **History** on
  the new nav. See `HistoryPage` component.
- **Verify hand** page is a stub describing the provably-fair scheme;
  the actual interactive re-derivation isn't implemented client-side.
- **Coin Flip / Hi Lo / Acey Duecey / Texas Hold'em / Single-Player
  Blackjack** were stubbed out in the original DB seeds but had no
  client UI. Coin Flip, Hi Lo, and Acey Duecey have light single-player
  client-side implementations in `frontend/src/components/games/` —
  they use `Math.random()`, not the provably-fair RNG. Multi-player
  blackjack remains the server-authoritative, provably-fair flagship.
