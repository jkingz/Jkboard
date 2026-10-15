# 06 — A test tier that renders the interface

Unblocked, except that it needs permission to install devDependencies.

## Goal

`pnpm test` fails when a component is broken, not only when a function or a source-text pattern is.
Today it cannot: `vitest.config.mts` defines two projects, `unit` and `integration`, and
`tests/README.md` states there is no `e2e/` tier.

## Why it is open

Two recent defects were only provable by clicking:

- The uncontrolled-Collapsible warning fixed in `src/components/nav-main.tsx`, where the group is
  keyed on its derived `open` state so Base UI never re-reads `defaultOpen`. The mechanism was
  confirmed by reading `useControlled` in `@base-ui/utils`, and the fix was verified by watching the
  browser console. There is **no regression test for it** — reverting the `key` breaks nothing that
  `pnpm test` runs.
- The hydration mismatch class of defect on `/settings/*`, which `docs/verification-standards.md`
  says is only distinguishable from a real bug in a production build. A DOM tier catches neither
  without a build, which is why the browser check stays in the gate chain either way.

## First increment

1. Install `jsdom` and `@testing-library/react` (plus whatever React 19.3 peer versions they need) —
   **this is a package install, so it needs explicit approval.**
2. Add a third Vitest project in `vitest.config.mts` for `tests/**/*.dom.test.ts`, `environment:
   "jsdom"`, in the `unit` lane of CI so it gates by default.
3. Write the one test that proves the tier works: render `NavMain` twice under two different
   `usePathname()` values and fail if the console logs Base UI's "changing the default open state"
   warning. Show it red by reverting `nav-main.tsx`'s `key` to `item.title`, then green.

## Later increments

- A Playwright project for whole-page flows. It lands after specs 03 and 04 because it needs a seeded,
  disposable database — the `playwright-cli` tooling is already in use for live verification, so the
  harness exists even though no test does.
- Move the structural assertions that only exist because nothing renders — the `revalidatePath` text
  check in `tests/platform/unit/action-revalidation.unit.test.ts` — behind a behavioural test once
  something can invoke an action.

## Deferred / open questions

- Whether Base UI primitives need polyfills under jsdom (`ResizeObserver`, `matchMedia`) is
  **unverified**; that determines whether increment 1 is two packages or five.
- Whether the DOM tier gates in CI or runs locally is a spec 04-style decision, not a technical one.

## Security / permissions

None — a test tier changes no permissions. Its job is to make the permissions work in specs 01 and 02
provable: a guard that refuses a sessionless call is only visible at the seam that renders the form.

## Verification

- `pnpm test` → report the three tiers separately and say which ran.
- The red/green proof in increment 3, with the reverted-file diff quoted, per the rule in
  `docs/verification-standards.md` that a test which never went red proves nothing.
- What remains unverified: real browser layout, animation, and anything a build does that jsdom does
  not — the live gate in `/verification-gates` step 5 stays mandatory after this.
