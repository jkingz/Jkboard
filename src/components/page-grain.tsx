/**
 * Page grain, adapted from the technique inngest.com uses for its own
 * background (`v1-page-bg`): a fine monochrome film-grain noise over a flat
 * canvas, rather than a gradient or a dot grid.
 *
 * Why it works where a gradient does not: a gradient is a shape the eye can
 * resolve, so it reads as decoration sitting on top of the page. Grain has no
 * resolvable structure, so it reads as the surface the page is printed on. It
 * also stops large empty regions from looking flat without adding an edge
 * anywhere.
 *
 * The noise is an inline SVG `feTurbulence`, not a bitmap. That keeps it in the
 * CSS payload rather than a 700 KB request, and it scales to any viewport
 * without resampling blur.
 *
 * Generated rather than copied: no third-party asset or brand colour is used,
 * and the tint comes from the project's own tokens, so it follows light and
 * dark mode automatically.
 */

export function PageGrain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "pointer-events-none fixed inset-0 -z-10",
        // Two layers: a soft vertical lift so the page is not uniformly flat,
        // and the grain on top of it.
        "bg-gradient-to-b from-background via-background to-muted/40",
        className ?? "",
      ].join(" ")}
    >
      {/* Blend mode is per-theme, and this was measured rather than guessed:
          `mix-blend-overlay` over a white canvas produces stdev 0.000, so the
          grain is literally invisible in light mode. Multiplying darkens a
          light page and screening lightens a dark one, so each theme needs the
          one that moves away from its own background. */}
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-multiply dark:mix-blend-screen dark:opacity-[0.045]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />
    </div>
  )
}