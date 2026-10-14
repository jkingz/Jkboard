# UI Context

---

## Design tokens

Tailwind v4, `@theme inline` in `src/app/globals.css` maps `--color-*` to the shadcn variables.
Reference these in JSX — all verified present in the stylesheet:

- Surfaces: `bg-background` `bg-card` `bg-popover` `bg-sidebar`
- Text: `text-foreground` `text-muted-foreground` `text-card-foreground` `text-sidebar-foreground`
- Intent: `bg-primary` `bg-secondary` `bg-muted` `bg-accent` `bg-destructive` and each `-foreground`
  pair
- **Project-specific, not part of the shadcn base palette:** `bg-success` `bg-warning` `bg-info` plus
  their foregrounds
- Lines: `border-border` `border-input` `ring-ring`
- Charts: `chart-1` … `chart-5` — stored as the literal string `var(--chart-1)` in `project.color`
- Radius: `--radius: 0.625rem`, with `sm`/`md`/`lg`/`xl` derived
- Font: `--font-sans` → `var(--font-inter)`

A token name that generates no CSS fails silently: the page renders with the browser default and
nobody notices. Check `globals.css` before introducing a name.

---

## Per-component conventions

- UI primitives in `src/components/ui/` follow shadcn `base-nova` on **Base UI**. Their APIs are
  Base UI's — do not port Radix prop names from memory.
- Aliases (`components.json`): `@/components`, `@/lib/utils`, `@/components/ui`, `@/lib`, `@/hooks`.
- Feature components live beside their route in a `components/` subfolder.
- Icons: `lucide-react`, tree-shaken via `optimizePackageImports` in `next.config.ts`.
- Two theme systems coexist: a runtime **theme customizer** (`src/components/theme-customizer/`,
  View Transitions circular wipe) and **theme presets** (`src/config/theme-data.ts`,
  `src/utils/{shadcn-ui,tweakcn}-theme-presets.ts`). Editing a preset changes the customizer's
  starting point.

---

## Styling rules

- Everything colour-related is a token. No raw hex, no `oklch()` in JSX.
- Radius utilities only — no arbitrary pixel values.
- `cn()` from `@/lib/utils` for every conditional class list.

---

## Images and assets

- `next/image` for raster content; remote hosts allowed are `ui.shadcn.com` and
  `images.unsplash.com` only (`next.config.ts`).
- **Inter is fetched from Google at build time** via `next/font/google` (`src/lib/fonts.ts`), so the
  build is **not hermetic**. Proven both ways: with a warm `.next` a blackholed-egress build exits 0
  and looks fine; after `rm -rf .next` the same command exits 1 with
  `Error while requesting resource … fonts.googleapis.com/css2?family=Inter`. Always test cold:
  ```bash
  rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build
  ```
  A sealed CI runner has no egress, so it will fail until the font is vendored or the fallback is
  tolerated. Tracked in [target-state.md](./target-state.md).
- Security headers are set globally in `next.config.ts`: `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: origin-when-cross-origin`.

---

## Accessibility

**Nothing is enforced by a machine.** No axe, no `eslint-plugin-jsx-a11y`, no Lighthouse gate — the
ESLint config is `core-web-vitals` + `typescript` and nothing else, and `pnpm lint` exits 0 with no
a11y rule present. So treat every item below as review guidance, not a gate that will catch a
regression.

What the stack does give you:

- shadcn/Base UI primitives ship semantic roles and keyboard handling by default — using the
  primitive rather than a raw `div` is the main lever available today.
- Focus rings exist as a token (`ring-ring`).

Left entirely to review:

- Contrast of the custom `--success` / `--warning` / `--info` palette against their backgrounds.
- Keyboard traversal of dnd-kit drag targets on the kanban board (`src/components/` and
  `projects/[id]/components/project-board.tsx`).
- Whether dialogs trap focus and restore it on close.
- Any status conveyed by colour alone (project status, task priority) without a text or icon
  equivalent.