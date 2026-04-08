# Project Structure

```text
KnowYourCity/
├── AGENTS.md
├── DEPLOYMENT.md
├── FUTURE_PLAN.md
├── PROJECT_STRUCTURE.md
├── know-your-chennai-game-idea.md
├── public/
│   ├── icons/
│   └── images/
├── src/
│   ├── app/
│   │   ├── (home)/
│   │   ├── daily-challenge/
│   │   ├── direction-mode/
│   │   ├── map-pin-mode/
│   │   └── route-builder/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── game/
│   ├── data/
│   ├── features/
│   │   ├── daily-challenge/
│   │   ├── direction-mode/
│   │   ├── map-pin-mode/
│   │   └── route-builder/
│   ├── lib/
│   │   ├── game/
│   │   ├── map/
│   │   └── storage/
│   ├── styles/
│   ├── types/
│   └── utils/
└── tests/
    ├── fixtures/
    └── helpers/
```

## Notes
- `src/app/` is for route-level pages and app entry files.
- `src/components/` is for reusable UI shared across features.
- `src/features/` keeps mode-specific logic grouped by feature.
- `src/data/` holds local JSON for the MVP.
- `src/lib/` is for reusable business logic and service helpers.
- `src/styles/` contains the design tokens and shared typography system.
- `tests/` is only for shared test helpers and fixtures. Component tests stay next to their `.tsx` files.
