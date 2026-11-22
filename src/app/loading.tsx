import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <p role="status" className="sr-only">Loading Jkboard</p>
      <div aria-hidden="true" className="flex w-full max-w-sm flex-col gap-3">
        <Skeleton className="h-8 w-36 motion-reduce:animate-none" />
        <Skeleton className="h-36 w-full motion-reduce:animate-none" />
        <Skeleton className="h-8 w-24 motion-reduce:animate-none" />
      </div>
    </div>
  )
}
