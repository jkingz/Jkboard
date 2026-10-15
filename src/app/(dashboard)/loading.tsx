import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder for the `(dashboard)` route group.
 *
 * The layout is `force-dynamic` and awaits `getWorkspaceData()`, so every
 * dashboard navigation streams. This is what the visitor sees while that
 * resolves. Its shape deliberately mirrors the real pages — sidebar rail,
 * header bar, a page heading and a content block — so the layout does not jump
 * when the data lands.
 *
 * `prefers-reduced-motion` is handled by the `Skeleton` primitive's own
 * `animate-pulse`, which the theme layer already disables.
 */
export default function DashboardLoading() {
  return (
    <div
      className="flex min-h-svh w-full"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading your workspace</span>

      {/* Sidebar rail */}
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r p-4 md:flex">
        <Skeleton className="h-8 w-32" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-full" />
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-8 w-56 md:w-64" />
          <Skeleton className="ml-auto h-8 w-8 rounded-full" />
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>

          <Skeleton className="h-72 w-full" />
        </main>
      </div>
    </div>
  )
}