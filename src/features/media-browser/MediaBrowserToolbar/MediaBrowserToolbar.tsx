"use client"

import { Box, Center, Group, SegmentedControl } from "@mantine/core"
import { IconCheckbox, IconEye } from "@tabler/icons-react"
import { MediaBrowserSelectionActions, MediaBrowserSelectionCount } from "./MediaBrowserSelectionActions"
import { MediaBrowserViewActions, MediaBrowserViewSearch } from "./MediaBrowserViewActions"

type MediaBrowserToolbarProps = {
  compact: boolean
  selecting: boolean
  selected: Set<string>
  tags: string[]
  setTags: (tags: string[]) => void
  onSubmitTags: () => void
  tagOptions?: string[]
  context: "personal" | "community"
  communityId: string
  hasRemoteItems: boolean
  navigate: (path: string) => void
  onSelectionDialog: (dialog: "group" | "share" | "delete") => void
  onStartSelection: () => void
  onEndSelection: () => void
}

export function MediaBrowserToolbar({
  compact, selecting, selected, tags, setTags, onSubmitTags,
  tagOptions, context, communityId, hasRemoteItems, navigate,
  onSelectionDialog, onStartSelection, onEndSelection,
}: MediaBrowserToolbarProps) {
  return (
    <Box
      pb="xs"
      style={{
        display: "grid",
        gridTemplateColumns: compact
          ? "minmax(0, 1fr)"
          : "minmax(0, 1fr) auto",
        alignItems: "center",
        gap: "var(--mantine-spacing-xs)",
      }}
    >
      <Box style={{ minWidth: 0 }}>
        {selecting ? (
          <MediaBrowserSelectionCount count={selected.size} />
        ) : (
          <MediaBrowserViewSearch
            compact={compact}
            tags={tags}
            onTagsChange={setTags}
            onSubmitTags={onSubmitTags}
            tagOptions={tagOptions}
          />
        )}
      </Box>
      <Group
        gap="xs"
        justify="flex-end"
        wrap="nowrap"
        style={{ gridColumn: compact ? "1" : undefined }}
      >
        {selecting ? (
          <MediaBrowserSelectionActions
            selected={selected}
            context={context}
            communityId={communityId}
            hasRemoteItems={hasRemoteItems}
            navigate={navigate}
            onSelectionDialog={onSelectionDialog}
          />
        ) : (
          <MediaBrowserViewActions
            context={context}
            communityId={communityId}
            navigate={navigate}
          />
        )}
        <SegmentedControl
          size="xs"
          value={selecting ? "select" : "view"}
          onChange={(value) => {
            if (value === "select") {
              onStartSelection()
              return
            }
            onEndSelection()
          }}
          data={[
            {
              value: "view",
              label: (
                <Center style={{ gap: 6 }}>
                  <IconEye size={15} />
                  <span>View</span>
                </Center>
              ),
            },
            {
              value: "select",
              label: (
                <Center style={{ gap: 6 }}>
                  <IconCheckbox size={15} />
                  <span>Select</span>
                </Center>
              ),
            },
          ]}
        />
      </Group>
    </Box>
  )
}
