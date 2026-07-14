# Budgerr App — Mobile Client

## 1. What this is

The mobile client for [Budgerr](https://github.com/aayushpokhrel1/Budgerr) — a personal budgeting app with sports betting baked in as a first-class category. This repo is the phone-in-your-hand surface: check your betting allowance, log a bet in the moment, see which card to use, glance at net win/loss.

It's a pure frontend. All the actual logic — Plaid sync, bet settlement, budgeting math, reward-rate lookups — lives in the [Budgerr backend](https://github.com/aayushpokhrel1/Budgerr) (FastAPI + Postgres). This app just renders it and lets you log/settle bets.

Scope for now: **you, personally**, same as the backend. No auth, no multi-user support — see the backend README's Section 13 for what changes if that ever expands.

---

## 2. Architecture

```
Budgerr backend (FastAPI, localhost:8001 in dev)
        ▲
        │  REST — fetch + React Query
        │
Budgerr App (this repo)
  Expo Router (navigation) ── React Query (server state) ── React Native components
```

- No local database, no offline cache beyond what React Query keeps in memory — this app is a thin client over the backend's API
- A second, independent frontend — [`budgerr-web`](https://github.com/aayushpokhrel1/budgerr-web), a full Next.js mirror — hits the same backend; see the backend README's Section 9
- The Log-a-bet form also calls a second, unrelated API directly: [playstat](https://github.com/aayushpokhrel1/Playstat)'s `GET /edges`, for the "Tonight's edges" pre-fill panel (see Section 5) — read-only, no shared backend or database with Budgerr

---

## 3. Tech stack

- **Expo** (TypeScript) — chosen over bare React Native for the personal-project ergonomics: fast refresh, `expo start --web` for a browser preview without a simulator, and EAS/`expo export` for eventually producing a side-loadable APK (see backend README Section 11 — no Play Store listing needed for personal use)
- **Expo Router** — file-based navigation (`app/` directory), built on React Navigation under the hood. Chosen over hand-rolled React Navigation setup since it's now Expo's default and scaffolds a working tab bar + modal pattern immediately
- **React Query** (`@tanstack/react-query`) — server state (fetching, caching, invalidation) for every screen. No Redux/Zustand — there's no meaningful client-only state yet beyond form drafts

---

## 4. Project structure

```
app/
  (tabs)/
    _layout.tsx     — tab bar definition (currently just "Budget")
    index.tsx       — the Budget screen
  _layout.tsx       — root stack (wraps everything in QueryClientProvider)
  modal.tsx         — "Log a bet" form, opened via the header + button

components/
  budget/           — screen-specific pieces (allowance card, category tiles,
                      recent bets list, best-card tip, trend stats)
  Themed.tsx, StyledText.tsx, useColorScheme.ts, ...  — template-provided
                      light/dark theming helpers

constants/
  Colors.ts         — light/dark palette, extended with the semantic colors
                      (success/warning/danger) the budget UI needs

lib/
  api.ts            — typed fetch client + response types for every backend
                      endpoint this app calls
  queries.ts        — React Query hooks wrapping api.ts (useBudgetPeriods,
                      useBets, useBetsTrend, useBestCard, useCreateBet, ...)
```

---

## 5. What's built

**Budget tab** (`app/(tabs)/index.tsx`):
- Betting allowance card — spent / limit / remaining for the current month, with a status badge and progress bar that shifts color at 80%/100% (matching the backend's alert thresholds)
- Category tiles — other budget categories (groceries, dining, etc.) at a glance
- Recent bets — last 5 logged bets with status (pending/won/lost), tapping "+ Log a bet" opens the quick-entry modal
- Best-card tip — "best card for [category] right now," pulled from the rewards tracker's proactive lookup
- Trend stats — net bet profit vs. bank net cash flow for the current month, shown side by side since the backend deliberately keeps these as two separate numbers (they can diverge — see backend README Section 3.2)

**Log a bet** (`app/modal.tsx`): sportsbook, bet type (single/parlay), stake, potential payout, and a dynamic list of per-leg detail (player, stat type, line, side, odds) — matches the backend's quick-entry design goal of under 15 seconds per bet. A "Tonight's edges (from playstat)" panel lists today's positive-edge legs from the [playstat](https://github.com/aayushpokhrel1/Playstat) project's `/edges` endpoint (player, stat, line, side, odds) — tapping "+ Add" pre-fills a leg instead of typing it by hand.

**Log as paper bet** (`components/tonight/ParlayCard.tsx`, on the Tonight tab): one tap logs a recommended parlay as a hypothetical bet (`sportsbook: "paper"`, `is_paper: true`, $10 default stake) without leaving the card, carrying each leg's `model_prob` from the playstat edge for later accuracy tracking. Paper bets auto-settle like real ones but are excluded from real-money P/L on the backend, and show a "PAPER" badge in the Recent bets list.

**Not built yet**:
- Bet settlement (won/lost/push) from the app — currently only doable via the backend API directly
- A Stats tab (ties into the separate basketball analytics project once that's further along)

---

## 6. Running it

### Prerequisites
- The [Budgerr backend](https://github.com/aayushpokhrel1/Budgerr) running locally (`uvicorn app.main:app --port 8001`), with its `CORS_ORIGINS` including wherever this app is served from
- Optional: the [playstat](https://github.com/aayushpokhrel1/Playstat) API running locally (`:8000`) for the "Tonight's edges" panel — the app works fine without it, that panel just stays empty
- Node.js 18+

### Setup

```
npm install
cp .env.example .env   # defaults to http://localhost:8001 — edit if your backend runs elsewhere
```

### Run

```
npm run web       # browser preview — fastest loop for UI work, no simulator needed
npm run ios       # iOS simulator
npm run android   # Android emulator
```

First bundle on `web` can take 60-100s (Reanimated/worklets are slow to cold-compile) — this is normal, not a hang.

---

## 7. Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | Base URL of the Budgerr backend | `http://localhost:8001` in `.env.example` — update if the backend runs elsewhere |
| `EXPO_PUBLIC_PLAYSTAT_API_URL` | Base URL of the playstat API (for the Tonight's edges panel) | `http://localhost:8000` in `.env.example` |

Note: on a physical device or Android emulator, `localhost` refers to the device itself, not your dev machine — use your machine's LAN IP or `10.0.2.2` (Android emulator) instead.
