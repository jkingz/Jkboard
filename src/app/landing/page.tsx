import type { Metadata } from "next"
import { LandingPageContent } from "./landing-page-content"

// Metadata for the landing page
export const metadata: Metadata = {
  title: "Jkboard - Project & Task Management for Small Teams",
  description:
    "Jkboard helps individuals and small teams organize projects, manage tasks, track progress, and monitor upcoming deadlines from a single workspace.",
  keywords: [
    "project management",
    "task tracking",
    "team collaboration",
    "progress analytics",
    "deadline tracking",
    "kanban",
  ],
  openGraph: {
    title: "Jkboard - Project & Task Management for Small Teams",
    description:
      "Organize projects, manage tasks, track progress, and never miss a deadline.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jkboard - Project & Task Management for Small Teams",
    description:
      "Organize projects, manage tasks, track progress, and never miss a deadline.",
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}