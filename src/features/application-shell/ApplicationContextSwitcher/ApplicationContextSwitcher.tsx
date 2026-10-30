"use client"

import { Button, Text } from "@mantine/core"
import { useMediaQuery } from "@mantine/hooks"
import { useState } from "react"
import { ContextSwitcherMenu } from "./ContextSwitcherMenu"
import { ContextSwitcherDialog } from "./ContextSwitcherDialog"
import type { ApplicationContextOption } from "../types"

export function ApplicationContextSwitcher({
  currentContext,
  contexts,
  onSelect,
  onCreateCommunity,
  onOpen,
  onRetry,
  loading = false,
  error = false,
}: {
  currentContext: ApplicationContextOption
  contexts: ApplicationContextOption[]
  onSelect: (contextId: string) => void
  onCreateCommunity?: () => void
  onOpen?: () => void
  onRetry?: () => void
  loading?: boolean
  error?: boolean
}) {
  const compact = useMediaQuery("(max-width: 48em)")
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState("")

  const changeOpened = (next: boolean) => {
    if (next && !opened) onOpen?.()
    setOpened(next)
    if (!next) setSearch("")
  }
  const trigger = (
    <Button
      variant="subtle"
      color="gray"
      size="compact-sm"
      px="xs"
      aria-label="コンテキストを切り替える"
      maw={{ base: 144, sm: 240 }}
      onClick={compact ? () => changeOpened(true) : undefined}
    >
      <Text size="xs" mr={6} aria-hidden="true">
        ▾
      </Text>
      <Text size="sm" truncate>
        {currentContext.label}
      </Text>
    </Button>
  )

  return (
    <>
      <ContextSwitcherMenu
        opened={opened && !compact}
        onOpenedChange={changeOpened}
        trigger={trigger}
        currentContext={currentContext}
        contexts={contexts}
        search={search}
        onSearchChange={setSearch}
        onSelect={onSelect}
        onCreateCommunity={onCreateCommunity}
        onRetry={onRetry}
        loading={loading}
        error={error}
      />
      <ContextSwitcherDialog
        opened={opened && !!compact}
        onClose={() => changeOpened(false)}
        currentContext={currentContext}
        contexts={contexts}
        search={search}
        onSearchChange={setSearch}
        onSelect={onSelect}
        onCreateCommunity={onCreateCommunity}
        onRetry={onRetry}
        loading={loading}
        error={error}
      />
    </>
  )
}
