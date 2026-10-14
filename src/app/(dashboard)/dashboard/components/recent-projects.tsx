"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useFlowBoard } from "@/data/flowboard-store"
import {
  formatDate,
  getProjectStatus,
  projectStatusClasses,
} from "@/data/flowboard"

export function RecentProjects() {
  const { projects, memberById, projectProgress } = useFlowBoard()

  const recent = [...projects]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Recent projects</CardTitle>
        <CardDescription>Progress against the next due date</CardDescription>
        <CardAction>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/projects" />}
          >
            View all
            <ArrowRight data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {recent.map((project) => {
          const status = getProjectStatus(project.status)
          const { completed, total, progress } = projectProgress(project.id)

          return (
            <div key={project.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <Link
                  href={`/projects/${project.id}`}
                  className="truncate font-medium hover:underline"
                >
                  {project.name}
                </Link>
                <Badge
                  variant="outline"
                  className={cn("ml-auto", projectStatusClasses[project.status])}
                >
                  <status.icon />
                  {status.label}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Progress value={progress} className="flex-1" />
                <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  {completed}/{total} tasks
                </span>
                <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums">
                  {progress}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>Due {formatDate(project.dueDate)}</span>
                <AvatarGroup>
                  {project.memberIds.slice(0, 4).map((memberId) => {
                    const member = memberById(memberId)
                    if (!member) return null
                    return (
                      <Avatar key={memberId} size="sm" className="size-6">
                        <AvatarFallback className="text-[10px]">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                    )
                  })}
                </AvatarGroup>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}