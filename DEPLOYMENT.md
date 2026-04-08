# Deployment Guide (Vercel)

This app should be deployed to Vercel (not GitHub Pages) because it uses Next.js API routes.

## Current Status

- Deployment target: `Vercel`
- Status: `Live and working`
- Environment variables: `Configured in Vercel`
- Routing mode: `Real route API enabled via /api/routes`

## 1. Pre-check (local)

Run:

```bash
npm install
npm run build
```

Expected:
- Build succeeds.
- API routes appear as dynamic (`ƒ`) in build output.

## 2. Required environment variables (Vercel Project Settings)

Add these in `Vercel -> Project -> Settings -> Environment Variables` for `Production` (and `Preview` if needed):

```bash
OPENROUTESERVICE_API_KEY
APP_CONTACT_EMAIL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

Notes:
- `OPENROUTESERVICE_API_KEY` stays server-side (no `NEXT_PUBLIC_` prefix).
- Firebase `NEXT_PUBLIC_*` values are safe to expose, but still keep them in env vars (not hardcoded in repo).

## 3. Deploy

### Option A: Vercel UI (recommended)
1. Import GitHub repo in Vercel.
2. Framework preset: `Next.js`.
3. Add env vars above.
4. Click `Deploy`.

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

## 4. Post-deploy smoke tests

After deployment, verify:
1. `/auth` allows sign up, sign in, forgot password.
2. First login shows city selection modal.
3. City-specific behavior works:
   - Chennai and Bangalore produce city-scoped places.
   - Route Mode connector options change by city.
4. API endpoints return JSON and not HTML errors:
   - `GET /api/places/search?q=Adyar&city=Chennai`
   - `GET /api/places/nearby?lat=13.0&lng=80.2&city=Chennai`
   - `POST /api/routes` returns `route.distanceMeters`, `route.durationSeconds`, and `route.geometry`
5. Firestore profile/stats update after finishing a round.

## 5. Common issues

- `CONFIGURATION_NOT_FOUND` during auth:
  - Enable Email/Password provider in Firebase Authentication.
- Firestore `PERMISSION_DENIED`:
  - Firestore security rules are blocking writes; allow authenticated user access to their own document path.
- 504/timeout for nearby places:
  - Overpass endpoint can be slow; retries/fallbacks are already implemented, but occasional delays are expected.
- Route API `406`/`502`:
  - Confirm `OPENROUTESERVICE_API_KEY` is set in Vercel and redeploy.
