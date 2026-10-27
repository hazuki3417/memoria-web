"use client"

import type { ReactNode } from "react"
import { IconFolderPlus, IconPhoto, IconSearch, IconTags } from "@tabler/icons-react"
import { StateDisplay } from "@/components/StateDisplay"

type EmptyStateProps = {
  variant?: "full" | "inline"
  kind: "media" | "group" | "search" | "tags"
  title: string
  description?: ReactNode
  action?: ReactNode
}

const icons = {
  media: IconPhoto,
  group: IconFolderPlus,
  search: IconSearch,
  tags: IconTags,
}

export function EmptyState({
  variant = "full",
  kind,
  title,
  description,
  action,
}: EmptyStateProps) {
  const Icon = icons[kind]
  return (
    <StateDisplay
      variant={variant}
      icon={<Icon size={variant === "full" ? 24 : 14} />}
      iconColor={kind === "search" || kind === "tags" ? "gray" : undefined}
      title={title}
      description={description}
      action={action}
    />
  )
}
