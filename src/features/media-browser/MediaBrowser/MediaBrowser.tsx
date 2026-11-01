"use client"

import { useRouter } from "next/navigation"
import { MediaBrowserController } from "./MediaBrowserController"

/** Route integration for the Media listing. */
export function MediaBrowser(
  props: Omit<Parameters<typeof MediaBrowserController>[0], "navigate">,
) {
  const router = useRouter()
  return (
    <MediaBrowserController {...props} navigate={(path) => router.push(path)} />
  )
}
