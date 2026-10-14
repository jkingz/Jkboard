import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-muted-foreground">
          The project, task or setting you were looking for does not exist.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            Go to overview
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            Browse projects
          </Button>
        </div>
      </div>
    </div>
  )
}
