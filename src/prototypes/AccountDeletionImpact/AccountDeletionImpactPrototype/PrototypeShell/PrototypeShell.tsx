"use client"

import { Box as ScrollPaddingBox, ScrollArea as PageScrollArea } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { getApplicationNavigation } from "@/features/application-shell"
import { PrototypeApplicationShell } from "@/prototypes/PrototypeApplicationShell"

const personalContext = {
  id: "personal",
  kind: "personal" as const,
  label: "Personal",
  accentColor: "var(--mantine-color-blue-6)",
}

export function PrototypeShell({ children }: PropsWithChildren) {
  return (
    <PrototypeApplicationShell
      currentContext={personalContext}
      contexts={[personalContext]}
      navigationItems={getApplicationNavigation({ contextKind: "personal" })}
    >
      <PageScrollArea
        type="hover"
        h="100%"
        w="100%"
        style={{ overscrollBehavior: "contain" }}
      >
        <ScrollPaddingBox pt="lg">{children}</ScrollPaddingBox>
      </PageScrollArea>
    </PrototypeApplicationShell>
  )
}

