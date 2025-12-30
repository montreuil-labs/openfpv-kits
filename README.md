# OpenFPV Kits

Community curated starter kits for getting into FPV. Static Astro site with Tailwind v4, React islands for the builder, and YAML-backed data for catalog/packs/checklists/notes.

## Quick start

```sh
pnpm install
pnpm dev
```

## Scripts

- `pnpm dev` — run the dev server
- `pnpm build` — production build
- `pnpm preview` — preview the built site
- `pnpm lint` — ESLint (Astro + TS + React)
- `pnpm format` — Prettier check (Tailwind plugin)
- `pnpm test` — Vitest (unit-ready; no tests added yet)

## Structure

- `src/layouts/BaseLayout.astro` — nav/footer shell, global styles
- `src/styles/global.css` — Tailwind v4 entry + light theme tokens
- `src/data/` — YAML data for catalog items, packs, checklists, notes
- `src/lib/schema.ts` — Zod schemas for data contracts
- `src/lib/data.ts` — YAML loaders + referential checks
- `src/lib/derived.ts` — helpers for ranges/requirements
- `src/components/BuilderIsland.tsx` — React builder island (URL-as-state)
- `src/pages/` — routes (`/`, `/kits`, `/kits/[id]`, `/builder`, `/catalog`, `/catalog/[id]`, `/compare`, `/contribute`)

## Contribute

The repo is structured for community edits via GitHub UI: edit YAML/MD or open Issues/Discussions. Translation (folder-per-locale) will layer on once copy stabilizes.
