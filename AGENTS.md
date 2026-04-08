# Project Conventions

These rules apply to this repository unless the user explicitly overrides them.

## Frontend Rules
- Use `TypeScript` for all React components.
- Use `SCSS` for styling.
- Every `.tsx` component file should have its own paired SCSS file.
- Every `.tsx` component file should have its own paired test file.
- Prefer colocated files for clarity.
- Do not hardcode user-facing UI copy inside components when it belongs to app content.
- Store user-facing UI copy in locale JSON files and access it through the shared i18n helper.

## Internationalization Rules
- Store translatable text in locale JSON files under `src/locales/`.
- Use the shared helper in `src/lib/i18n.ts` to read messages and interpolate dynamic values.
- Prefer passing translated content into components as props instead of importing locale JSON directly inside many leaf components.
- Keep validation messages, labels, button text, headings, empty states, and helper text in locale files.
- Avoid hardcoded English strings in app UI unless they are temporary debugging text.
- If new UI is added, update the locale JSON in the same change.

### Component File Pattern
For a component named `LocationCard`:
- `LocationCard.tsx`
- `LocationCard.module.scss`
- `LocationCard.test.tsx`

## Styling Rules
- Use shared SCSS variables for colors, spacing, radius, typography, and sizing.
- Use shared typography mixins for font size, line height, weight, and letter spacing.
- Do not hardcode repeated color or size values inside component styles.
- Do not hardcode typography values inside component styles.
- Component-level SCSS must consume design tokens only from the shared style files.
- Prefer semantic variable names such as `$color-primary`, `$space-md`, `$radius-lg`.
- Keep components mobile-first by default, then layer larger breakpoints only where needed.

### Required Shared Style Sources
- `src/styles/_variables.scss`
- `src/styles/_typography.scss`

### Strict Usage Rule
- Colors must come only from `src/styles/_variables.scss`.
- Spacing, radius, shadows, and breakpoints must come only from `src/styles/_variables.scss`.
- Font sizes, line heights, font weights, and letter spacing must be applied through mixins in `src/styles/_typography.scss`.
- Component SCSS files should not introduce new design tokens unless the user explicitly asks for a design-system update.

## Testing Rules
- Add a test file alongside each component.
- Prefer behavior-focused tests over implementation-detail tests.
- Test the default render path, primary interactions, and important edge states.

## Architecture Preference
- Keep the first version simple and mobile-first.
- Favor small, colocated components over deeply nested abstractions.
- Start with static/local data before adding backend complexity.

## Folder Responsibilities

### `public/`
- Store static assets served as-is.
- Use `public/icons/` for app icons, UI icons, and favicons.
- Use `public/images/` for illustrations, banners, and non-code image assets.

### `src/app/`
- Store route-level files and app entry files only.
- Put page-level route files, route layouts, loading states, and error states here.
- Keep route files thin; route files should compose feature modules rather than hold heavy business logic.
- One folder per route or route group.

### `src/components/`
- Store reusable presentational UI shared across multiple routes or features.
- Use `src/components/common/` for generic UI such as buttons, cards, badges, modals, and loaders.
- Use `src/components/layout/` for headers, footers, wrappers, nav, and shell layout pieces.
- Use `src/components/game/` for reusable game UI shared by multiple modes, such as score bars, question cards, timers, and answer controls.
- Every component must follow the colocated file pattern:
  - `ComponentName.tsx`
  - `ComponentName.module.scss`
  - `ComponentName.test.tsx`

### `src/features/`
- Store feature-specific logic grouped by game mode or domain area.
- Each feature owns its own components, hooks, helpers, tests, and view models when they are not shared outside that feature.
- Keep code here when it is specific to one mode such as `direction-mode` or `map-pin-mode`.
- If a piece becomes shared across features, move it to `src/components/`, `src/lib/`, `src/types/`, or `src/utils/` as appropriate.

### `src/data/`
- Store static MVP data sources.
- Use for local JSON, seed content, curated place lists, question banks, and mock datasets.
- Do not place business logic here.

### `src/lib/`
- Store reusable business logic and integration helpers.
- Use `src/lib/game/` for scoring, question generation, progression, and quiz logic.
- Use `src/lib/map/` for map adapters, coordinate helpers, and location calculations.
- Use `src/lib/storage/` for local storage persistence, cache helpers, and later backend adapters.
- Code here should be framework-light and reusable.

### `src/styles/`
- Store global design-system files only.
- Shared tokens belong in `src/styles/_variables.scss`.
- Shared typography utilities and classes belong in `src/styles/_typography.scss`.
- Global app styles, resets, and base element styles should live in app-level stylesheet files such as `globals.scss`.
- Component-specific styles must not be placed here; keep them next to the component.

### `src/locales/`
- Store locale JSON files for app content and translatable UI strings.
- Keep keys grouped by page, feature, or shared domain such as `common`, `home`, or `directionMode`.
- Prefer stable, descriptive keys over positional or ambiguous names.

### `src/types/`
- Store shared TypeScript types, interfaces, and domain models.
- Keep reusable types here when they are shared across features or layers.
- Feature-local types can stay inside the feature until reused elsewhere.

### `src/utils/`
- Store small shared pure helpers that do not belong to a specific feature or domain service.
- Examples: formatting, array transforms, value guards, generic math helpers.
- Do not place feature-specific logic here.

### `tests/`
- Store shared test infrastructure only.
- Use `tests/fixtures/` for reusable sample data and mock payloads.
- Use `tests/helpers/` for test render utilities, setup helpers, and shared mocks.
- Component and feature tests should stay colocated with the code they test unless the test asset is broadly shared.

## Placement Rules
- Put route rendering concerns in `src/app/`.
- Put reusable UI in `src/components/`.
- Put feature-specific logic in `src/features/`.
- Put domain/business logic in `src/lib/`.
- Put static content and seed data in `src/data/`.
- Put shared types in `src/types/`.
- Put generic helper functions in `src/utils/`.
- Put design tokens and global style primitives in `src/styles/`.
- Put shared test infrastructure in `tests/`.

## When To Move Code
- Start code in the most local place that fits.
- If code is reused across multiple features, promote it to a shared folder.
- Do not create shared abstractions too early.
- Prefer refactoring into shared modules only after a second real use case appears.
