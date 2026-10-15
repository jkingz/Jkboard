import localFont from "next/font/local"

/**
 * Inter, vendored.
 *
 * `next/font/google` fetches at build time, which makes a cold build fail on
 * any runner without egress — a sealed CI runner included. `next/font/local`
 * reads a file from the repo, so the build is hermetic.
 *
 * The file is the latin subset of Inter v20, variable weight 100–900, from
 * `fonts.gstatic.com`. SIL Open Font License 1.1 — see `./OFL.txt`.
 */
export const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "sans-serif"],
})