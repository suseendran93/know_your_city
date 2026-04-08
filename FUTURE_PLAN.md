# Future Plan

## Repository Strategy
- Keep a single repository.
- Evolve this repo into a monorepo when mobile work starts.
- Target layout:
  - `apps/web` for Next.js web app
  - `apps/mobile` for Expo React Native app
  - `packages/core` for shared game logic, types, and i18n data
  - `packages/api-client` for shared API client code

## Mobile App Plan (iOS + Android)
1. Create `apps/mobile` using Expo.
2. Implement auth, city selection popup, and settings with city switch.
3. Rebuild Direction Mode and Route Mode in mobile UI.
4. Reuse city-aware APIs and shared logic from packages.
5. Add QA, beta rollout (TestFlight + Play Internal), then public release.

## Gameplay Roadmap
1. Add streak and daily challenge persistence.
2. Add XP and level progression with simple rewards.
3. Add city-specific leaderboard.
4. Add first-play onboarding and tutorial.
5. Add sound and micro-feedback for correct and incorrect answers.

## Product Constraints To Preserve
- Every feature must stay city-aware.
- All user-facing text must be production-ready.
- City choices remain `Chennai` and `Bangalore` until expanded intentionally.
