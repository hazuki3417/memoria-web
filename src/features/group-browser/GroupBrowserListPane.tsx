"use client"

import type { ComponentProps, Ref } from "react"
import { Box, Divider, ScrollArea } from "@mantine/core"
import { GroupBrowserToolbar } from "./GroupBrowserToolbar"
import { GroupBrowserListContent } from "./GroupBrowserListContent"

type GroupBrowserListPaneProps = Omit<
  ComponentProps<typeof GroupBrowserListContent>,
  "compact"
> & {
  compact: boolean
  query: string
  onQueryChange: (query: string) => void
  onSearch: () => void
  searchRef?: Ref<HTMLInputElement>
}

export function GroupBrowserListPane({
  compact,
  query,
  onQueryChange,
  onSearch,
  searchRef,
  hideManagementActions,
  canManage,
  onCreate,
  ...contentProps
}: GroupBrowserListPaneProps) {
  return (
    <Box
      h={compact ? "100%" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        height: compact ? undefined : "100%",
        minHeight: 0,
      }}
    >
      <GroupBrowserToolbar
        compact={compact}
        query={query}
        onQueryChange={onQueryChange}
        onSearch={onSearch}
        searchRef={searchRef}
        hideManagementActions={hideManagementActions}
        canManage={canManage}
        onCreate={onCreate}
      />
      <Divider />
      <ScrollArea flex={1}>
        <GroupBrowserListContent
          compact={compact}
          hideManagementActions={hideManagementActions}
          canManage={canManage}
          onCreate={onCreate}
          {...contentProps}
        />
      </ScrollArea>
    </Box>
  )
}
