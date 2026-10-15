# UI Context

This file is the source of truth for identity, palette, typography, radius, motion and imagery. It
was transcribed from the owner's decisions on 2026-10-15, and `DESIGN.md` has been folded into it —
there is no second document to keep in sync.

Dials in force: **ENERGY 2 / RHYTHM 2 / MOTION 2**.

---

## Identity

Jkboard is an operational tool. It answers questions about work in flight: what is due, who is
blocked, what slipped. It is not a lifestyle product and does not pretend to be one.

The test: a visitor should be able to look at a screenshot for five seconds and know this is a tool
someone runs, not a concept someone pitched.

## Personality

Precise. Dense where density helps (tables, task lists, numbers). Calm elsewhere. It does not perform
enthusiasm, and it does not use the vocabulary of enterprise software.

## Mood

Operational. Closer to a well-made instrument than to a lifestyle brand.

## Palette

**Monochrome, with one accent.**

- Core: near-black and white, carried by the shadcn neutral `oklch` base in `src/app/globals.css`.
- Accent: **one.** `--primary` is the only chromatic colour permitted to carry meaning. It marks the
  single most important element on a screen and nothing else.
- Status colours (`--success`, `--warning`, `--info`, `--destructive`) are functional, never
  decorative. They appear only where the state is real.
- **Why:** the product's identity is precision, and precision is monochrome. A saturated colour that
  decorates rather than informs contradicts the thing being sold.

**No blue-to-purple, blue-to-cyan or purple-to-pink gradient as a primary treatment.** No radial orbs,
no coloured glow backgrounds, no neon.

## Radius

`--radius: 0.625rem` is the base defined in `globals.css`. Derived steps (`sm`, `md`, `lg`, `xl`) come
from it.

Applied deliberately: cards and inputs use `md`. Pill shapes are reserved for genuinely small,
fully-rounded elements such as status dots and avatar chips. Not every element is a pill.

**Why:** a tool where every corner is round reads as decoration rather than as structure.

## Typography

Inter, exposed as `--font-inter`. Monospace is permitted only for values that are literal strings (a
reference like `TSK-0042`, a credential, a code identifier). It is **not** a heading or body face.

No uppercase wide-tracked labels. Section headings are set in sentence case at real sizes.

## Texture

**No dot grid, no blueprint pattern, no graph paper.** Identity comes from typography, spacing and
the real product preview, not from a texture applied to empty space.

## Imagery

**The product's own UI is the imagery.** There are no illustrations, no 3D blobs, no stock
photography, no fake terminal window. `src/app/landing/components/product-preview.tsx` renders real
dashboard components and is the primary visual, because it cannot drift from what the app does.

No generated avatars or profile photos anywhere. People appear as initials, which the app already
does via `initialsFromName`.

Remote images are restricted to `ui.shadcn.com` and `images.unsplash.com` (`next.config.ts`). Do not
widen that list to add stock photography — the ban above is a product decision, not a technical one.

---

## Design direction

### Motion

`src/components/reveal.tsx` is the scroll-reveal primitive, the only motion primitive on the landing
page. It fires once on intersection, disconnects after firing, and never re-hides on scroll-out.

**Do not branch on `typeof window` inside a `useState` initializer here.** `Reveal` reads the
environment through `useSyncExternalStore` with a `getServerSnapshot` that returns `false`, so the
server render and the hydration render are identical and React has nothing to patch. A lazy
initializer that tests `typeof window` gives the server `shown = true` and the client `false`, which
is a hydration mismatch on every `Reveal` on the page — 26 of them on `/landing`. The same rule
applies to anything else that reads the environment during render: decide it after mount, or give it
a server snapshot.

Reduced motion and a missing `IntersectionObserver` both resolve through the client snapshot, so
those readers get the content visible rather than stuck at `opacity-0`.

Permitted motion: scroll-reveal, hover/focus feedback, and one transition on the hero product preview.
**No parallax, no pinning, no floating or pulsing loops, no scroll-jacking.** An element that moves
forever competes with the content and never lets the reader rest. Adding a scroll-animation library
for effect is out of scope for this direction — ask the owner first.

### Interaction states

- **Mutating buttons** use `src/components/async-button.tsx` (`AsyncButton`) with `useTransition` in
  the caller. It disables and shows a spinner for the duration. Server actions here have no
  idempotency key, so an unguarded second click writes a duplicate row.
- **Failures** are toasted in `src/data/jkboard-store.tsx`, the single choke point all twelve
  mutations pass through. Success toasts stay at the call sites, which have the created row's name.
  Do not add a second error toast at a call site.
- **Loading:** `src/app/(dashboard)/loading.tsx` is the route-group skeleton; `ContentArea` in
  `dashboard-shell.tsx` wraps children in `Suspense` so the shell is interactive before page data
  lands.

### Removed from the landing page

These were deleted because the direction above forbids them, and each was verified unused first:

- `src/components/dot-pattern.tsx` — deleted. Zero importers after the landing page stopped using it.
- The eyebrow badge above the H1, the `Badge` kicker pills on each feature block, and the
  `TrendingUp` badge in the CTA. All restated text already present (R-09).
- The gradient headline phrase. Permitted as a hierarchy device, but it was paired with an
  underline bar and a second gradient in the CTA, which pushed it over into decoration.
- Every image in `public/` — 12 PNGs and 5 SVGs, 4.3 MB, all verified unreferenced. The favicon is
  `src/app/favicon.ico`, not `public/favicon.png`.

### Honesty constraints

These are not style preferences; they are correctness rules and they bind every future change.

- **No invented numbers.** Every figure on the page comes from the seeded database.
- **No unbuilt features.** CSV import, project templates, digest emails, Starter/Team plans, plan
  cancellation, guest collaborators: none of these exist. The pricing and FAQ sections describe only
  what is built, and say plainly that the product is early (R-28, R-38). "Early stage" is itself a
  permitted claim: it is true, and more useful to a reader than a price table would be. What is not
  permitted is dressing an early build as a finished one.
- **No fake testimonials.** There is no testimonials section and none may be added without real,
  verifiable quotes.
- **No security or performance claims.** Nothing about SOC 2, uptime, encryption, or speed.
- **No third-party logo marquees.** A "trusted by" strip is a claim about who uses the product. There
  are no customers, so there is nothing truthful to put there.

The following were **false** and are now corrected:

| Claimed | Reality |
| --- | --- |
| 94% on-time rate, 11h saved weekly, 48 tasks completed | Fabricated. The stats section now reads real counts from the seeded workspace and says so. |
| Starter / Team / Business plans at 0/12/29 per month | No payment provider exists. The pricing section is titled "It is free, and early", lists what exists and what is still being built, and states plainly that no payment details are collected. Early stage is a true claim; a price table would not be. |
| Bulk CSV import, project templates | Not built. |
| Daily progress digest email | Not built. |
| Guest collaborators, task comments, saved views | Not built. Replaced with what exists. |
| Privacy, Terms, Security footer links | No such pages. Removed rather than pointed at the FAQ. |
| Newsletter subscription form | Resolved `Promise.resolve(email)` and toasted success without storing anything. Removed. |

### Unset — do not invent

*(unset)* — no decision recorded. Do not invent: specific brand colour beyond the neutral base, a
display typeface, an illustration style, a logo mark, testimonial content, pricing tiers.

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
- **Inter is vendored**, not fetched. `src/lib/fonts.ts` uses `next/font/local` against
  `src/lib/fonts/inter-latin-variable.woff2` (latin subset, variable weight 100–900), with
  `OFL.txt` beside it. The build is **hermetic** — verified:
  ```bash
  rm -rf .next && NODE_USE_ENV_PROXY=1 HTTPS_PROXY=http://127.0.0.1:9 pnpm build   # exits 0
  ```
  Keep it that way: reintroducing `next/font/google` breaks any runner without egress.
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