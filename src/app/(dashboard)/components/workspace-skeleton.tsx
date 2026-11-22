import { Skeleton } from "@/components/ui/skeleton"

export function WorkspaceContentSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <p role="status" className="sr-only">Loading your workspace</p>
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-8 w-52 max-w-full" />
        <Skeleton className="h-4 w-72 max-w-full" />
        <div className="grid gap-2 lg:grid-cols-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-56" />
          <Skeleton className="h-28 lg:h-56" />
        </div>
      </div>
    </div>
  )
}

export function WorkspaceSkeleton() {
  return (
    <div className="workspace flex min-h-svh bg-background">
      <aside aria-hidden="true" className="hidden w-52 shrink-0 flex-col gap-3 border-r bg-sidebar p-4 md:flex">
        <Skeleton className="mb-4 h-8 w-32" />
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-7" />
        ))}
        <Skeleton className="mt-auto h-9" />
      </aside>
      <div className="min-w-0 flex-1">
        <div aria-hidden="true" className="flex h-14 items-center justify-between gap-3 border-b px-4 lg:px-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-28 sm:w-48" />
        </div>
        <div className="py-4 md:py-6">
          <WorkspaceContentSkeleton />
        </div>
      </div>
    </div>
  )
}
