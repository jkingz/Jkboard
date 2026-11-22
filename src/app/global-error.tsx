"use client"

import "./globals.css"

import { RouteFailure } from "@/components/route-failure"
import { inter } from "@/lib/fonts"

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <RouteFailure retry={retry} />
      </body>
    </html>
  )
}
