# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A bakery showcase website built as a **static site** with Next.js 16 App Router. Supports three languages (Spanish default, English, Catalan) and light/dark themes. Deployed to Vercel as a static export.

## Commands

- `pnpm dev` — Start development server
- `pnpm build` — Build static export (outputs to `/out`)
- `pnpm lint` — Run Biome linter
- `pnpm lint:fix` — Auto-fix lint and format issues
- `pnpm format` — Format code with Biome
- `pnpm start` — Serve production build

No test framework is configured.

## Tech Stack

- **Next.js 16.1.6** (App Router, Turbopack default, static export via `output: 'export'`)
- **React 19**, **TypeScript 5**
- **pnpm** as package manager
- **Biome 2** for linting and formatting (replaces ESLint + Prettier)
- **Tailwind CSS 4** (new `@theme` directive in `globals.css`, no separate config file)
- **Zustand 5** with persist middleware (language store)
- **next-themes** for dark/light mode
- **@svgr/webpack** — SVGs imported as React components (`import Icon from '@/icons/name.svg'`)
- Images use **AVIF** format, `unoptimized: true` required for static export

## Architecture

```
app/                        → Next.js App Router pages (compose views inside Layout)
src/
  core/                     → Domain/business logic (placeholder, unused)
  presentation/
    assets/icons/           → SVG icons (imported as React components)
    assets/images/          → AVIF product/brand images
    components/
      atoms/                → Button (4 variants), Card (5 variants)
      molecules/            → BakeryAnimate, OvenAnimate
      organisms/            → Header, Footer, SwitchTheme, SelectLanguage
    layout/Layout.tsx       → Main layout wrapper (header + footer + scroll effects)
    views/                  → Page-level section components
      HomePage/             → Home, Products, About, Contact sections
      ProductsPage/         → Products listing
    shared/
      defaults/             → Static data (menu items)
      enums/                → ELanguage, ETheme
      hooks/                → useTranslation, useClickOutside
      interface/            → TypeScript interfaces
      language/{es,en,ca}/  → i18n JSON translation files
      stores/               → Zustand stores (languageStore)
```

**Page composition pattern** — App Router pages compose view sections:
```tsx
// app/page.tsx
<Layout>
  <Home />
  <Products />
  <About />
  <Contact />
</Layout>
```

## Path Aliases (tsconfig.paths.json)

- `@/icons/*` → `src/presentation/assets/icons/*`
- `@/images/*` → `src/presentation/assets/images/*`
- `@/components/*` → `src/presentation/components/*`
- `@/views/*` → `src/presentation/views/*`
- `@/shared/*` → `src/presentation/shared/*`
- `@/presentation/*` → `src/presentation/*`
- `@/app/*` → `app/*`

## Code Conventions

- **Atomic Design**: atoms → molecules → organisms for components
- **All components use `'use client'`** directive and `FC` type with `displayName`
- **Biome import sorting**: side-effects → external libs → `@/` aliases → relative
- **Internationalization**: custom `useTranslation` hook with dot-notation keys (`t('home.title')`), JSON files per language
- **Theming**: Tailwind `dark:` prefix + extensive CSS custom properties in `globals.css`
- **Animations**: Intersection Observer for scroll-triggered animations with staggered delays via inline styles
- **Static data only**: No API calls or data fetching — all content is hardcoded or in translation files

## Important Config Notes

- `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `removeConsole: true` in production, `typedRoutes: true`
- Turbopack SVGR rules in `turbopack.rules` + webpack fallback config for SVGR
- `biome.json`: single quotes, no trailing commas, semicolons, 2-space indent, 100-char line width
- Tailwind 4 theme defined entirely in `app/globals.css` using `@theme` blocks with responsive `clamp()` values
- No `.env` files — no environment variables needed
