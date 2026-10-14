# DESIGN.md — Jkboard

Direction for the design of this product. The agent transcribes the owner's answers here and applies
them. Where a field is marked *(unset)*, the owner has not decided it, and nothing may be invented
to fill it.

**Owner decisions transcribed:** 2026-10-15.

---

## Identity

Jkboard is an operational tool. It is used to answer questions about work in flight: what is due,
who is blocked, what slipped. It is not a lifestyle product and does not pretend to be one.

The test: a visitor should be able to look at a screenshot for five seconds and know this is a tool
someone runs, not a concept someone pitched.

## Personality

Precise. Dense where density helps (tables, task lists, numbers). Calm elsewhere. It does not
perform enthusiasm, and it does not use the vocabulary of enterprise software.

Nothing on a Jkboard page may claim a capability that the app does not have.

## Mood

Operational. Closer to a well-made instrument than to a lifestyle brand.

---

## Palette

**Monochrome, with one accent.**

- Core: near-black and white, carried by the existing shadcn neutral base in
  `src/app/globals.css`. The base is already neutral `oklch`, so this costs nothing to keep.
- Accent: **one.** `--primary` is the only chromatic colour permitted to carry meaning. It marks the
  single most important element on any given screen and nothing else.
- Status colours (`--success`, `--warning`, `--info`, `--destructive`) are functional, never
  decorative. They appear only where the state is real.
- **Why:** the product's identity is precision, and precision is monochrome. A saturated colour that
  decorates rather than informs contradicts the thing being sold.

**No blue-to-purple, blue-to-cyan or purple-to-pink gradient as a primary treatment.** No radial
orbs, no coloured glow backgrounds, no neon.

The hero headline currently applies a gradient to one phrase. That is permitted as a hierarchy
device (it separates the emphasised phrase from the sentence around it) and the reason is written
here so the next agent does not extend it to the rest of the page.

## Typography

Inter, already loaded via `next/font/google` in `src/lib/fonts.ts` and exposed as `--font-inter`.

**Why:** it is already the product's font, it is a UI face rather than a display face, and it suits
dense operational reading. Retaining it is a decision, not a default: the point is legibility in
tables and task lists, not personality in a headline.

Monospace is permitted only for values that are literal strings (a reference like `TSK-0042`, a
credential, a code identifier). It is **not** a heading or body face.

No uppercase wide-tracked labels. Section headings are set in sentence case at real sizes.

## Radius

`--radius: 0.625rem` is the base already defined in `globals.css`. Derived steps (`sm`, `md`, `lg`,
`xl`) come from it.

Applied deliberately: cards and inputs use `md`. Pill shapes are reserved for genuinely small,
fully-rounded elements such as status dots and avatar chips. Not every element is a pill.

**Why:** a tool where every corner is round reads as decoration rather than as structure.

## Motion

**MOTION dial = 2 (scroll-reveal).**

Permitted, each with its purpose written down:

1. **Scroll-triggered reveal** on section entry. Purpose: signals that the page continues below the
   fold, and gives sections an order of reading. Fires once, on intersection, and never loops.
2. **Hover and focus feedback** on every interactive element. Purpose: confirms what is clickable.
3. **One transition on the hero product preview.** Purpose: draws the eye to the one piece of
   evidence on the page, which is that the product is real and running.

**Forbidden:** parallax, pinned sections, floating or pulsing loops, scroll-jacking. An element that
moves forever competes with the content and never lets the reader rest.

`prefers-reduced-motion` disables all of the above and leaves the page fully usable.

## Texture

**No dot grid, no blueprint pattern, no graph paper.**

The existing `<DotPattern>` in the hero and stats sections is removed. **Why:** the pattern reads as
"technical" without expressing anything about a project-management tool specifically, and it adds
visual noise behind the exact content the visitor came to read.

Identity comes from typography, spacing, and the real product preview, not from a texture applied to
empty space.

## Imagery

**The product's own UI is the imagery.** There are no illustrations, no 3D blobs, no stock
photography, no fake terminal window.

The `<ProductPreview>` component already renders real dashboard components and is the primary visual.
That is more persuasive than any illustration, because it cannot drift from what the app does.

No generated avatars or profile photos anywhere. People appear as initials, which the app already
does in `getMemberId()` / `initialsFromName`.

---

## Dials

| Dial | Value |
| --- | --- |
| ENERGY | 2 |
| RHYTHM | 2 |
| MOTION | 2 |

**Read as:** a working tool's landing page, for people deciding whether to try it, in a monochrome
operational language.

**ENERGY 2** — the page states what it is and shows it working. Not sterile (that would be ENERGY 1
and would fail the liveliness bar), not loud (ENERGY 3 would not suit the product).

**RHYTHM 2** — sections differ in composition. The default order is
hero, stats, features, pricing, FAQ, CTA. Section composition varies within it: the hero is
centred and text-led, the feature section is a list, the pricing section is a comparison, the FAQ is
an accordion. No two consecutive sections share a layout.

**MOTION 2** — as listed above.

---

## Honesty constraints

These are not style preferences; they are correctness rules and they bind every future change.

- **No invented numbers.** Every figure on the page comes from the seeded database or is marked
  `[REAL DATA]`. The current stats section (`6`, `48`, `94%`, `11h`) is fabricated and must go.
- **No unbuilt features.** CSV import, project templates, digest emails, Starter/Team plans, plan
  cancellation, guest collaborators: none of these exist. The pricing and FAQ sections currently
  describe them and must be rewritten or removed (R-28, R-38).
- **No fake testimonials.** There is no testimonials section and none may be added without real,
  verifiable quotes.
- **No security or performance claims.** Nothing about SOC 2, uptime, encryption, or speed.

## Unset

*(unset)* — no decision recorded. Do not invent: specific brand colour beyond the neutral base, a
display typeface, an illustration style, a logo mark, testimonial content, pricing tiers.