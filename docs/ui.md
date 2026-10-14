# UI Context

---

## Design direction

`DESIGN.md` at the project root is the source of truth for identity, palette, typography, mood and
the three dials. Read it before changing any UI. It is transcribed from the owner's decisions, so
do not fill its unset fields on your own.

Dials in force: **ENERGY 2 / RHYTHM 2 / MOTION 2**.

### Motion

`src/components/reveal.tsx` is the scroll-reveal primitive, the only motion primitive on the landing
page. It fires once on intersection, disconnects after firing, and never re-hides on scroll-out.

The reduced-motion decision is made **during render**, not inside the effect. Deciding it in the
effect calls `setState` synchronously inside an effect body, which trips
`react-hooks/set-state-in-effect` and causes the cascading render React warns about.

Permitted motion, per DESIGN.md: scroll-reveal, hover/focus feedback, and one transition on the hero
product preview. **No parallax, no pinning, no floating or pulsing loops.**

### Removed from the landing page

These were deleted because DESIGN.md forbids them, and each was verified unused first:

- `src/components/dot-pattern.tsx` — deleted. Zero importers after the landing page stopped using it.
  DESIGN.md → Texture forbids dot grids.
- The eyebrow badge above the H1, the `Badge` kicker pills on each feature block, and the
  `TrendingUp` badge in the CTA. All restated text already present (R-09).
- The gradient headline phrase. Permitted as a hierarchy device, but it was paired with an
  underline bar and a second gradient in the CTA, which pushed it over into decoration.

### Honesty constraints

DESIGN.md → Honesty constraints binds every future change to this page. The following were **false**
and are now corrected:

| Claimed | Reality |
| --- | --- |
| 94% on-time rate, 11h saved weekly, 48 tasks completed | Fabricated. The stats section now reads real counts from the seeded workspace and says so. |
| Starter / Team / Business plans at 0/12/29 per month | No payment provider exists. The pricing section now states there is no billing. |
| Bulk CSV import, project templates | Not built. |
| Daily progress digest email | Not built. |
| Guest collaborators, task comments, saved views | Not built. Replaced with what exists. |
| Privacy, Terms, Security footer links | No such pages. Removed rather than pointed at the FAQ. |
| Newsletter subscription form | Resolved `Promise.resolve(email)` and toasted success without storing anything. Removed. |

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

**Six `jsx-a11y` rules ship as warnings, not errors.** They arrive with `eslint-config-next`, so
there is no separate a11y dependency to add. Measured, not assumed — the active set on a TSX file is
`alt-text`, `aria-props`, `aria-proptypes`, `aria-unsupported-elements`,
`role-has-required-aria-props`, `role-supports-aria-props`, every one at severity `1` (warn).

Verified by linting a probe file containing a bare `img` with no `alt`: both `jsx-a11y/alt-text` and
`@next/next/no-img-element` reported **`warning`**, and `pnpm lint` **exited 0**.

So: a11y regressions are a **review rule, not a gate**. Treat these six as advisory — read the
warnings, but nothing will fail a build over them. No axe, no Lighthouse gate, no
`eslint-plugin-jsx-a11y` in the project's own dependency list.

No automated check covers any of the following. All are left to review:

- Contrast of the custom `--success` / `--warning` / `--info` palette against their backgrounds.
- Keyboard traversal of dnd-kit drag targets on the kanban board
  (`app/(dashboard)/projects/[id]/components/project-board.tsx`).
- Whether dialogs trap focus and restore it on close — `jsx-a11y` says nothing about focus order.
- Status conveyed by colour alone (project status, task priority) with no text or icon equivalent.

What the stack does give you, beyond the lint warnings:

- shadcn/Base UI primitives ship semantic roles and keyboard handling by default — using the
  primitive rather than a raw `div` is the main lever available today.
- Focus rings exist as a token (`ring-ring`).