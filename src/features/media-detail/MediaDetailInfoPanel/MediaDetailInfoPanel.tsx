"use client"

import { Box, Button, Divider, Group } from "@mantine/core"
import { IconTrash } from "@tabler/icons-react"
import { MediaDetailInfoPanelFrame } from "./MediaDetailInfoPanelFrame"
import { MediaDetailCommunitySection } from "../MediaDetailCommunitySection"
import { MediaDetailGroupsSection } from "../MediaDetailGroupsSection"
import { MediaDetailMetadata } from "../MediaDetailMetadata"
import { MediaDetailTagsSection } from "../MediaDetailTagsSection"
import type { MediaDetailViewerProps } from "../MediaDetailViewer/MediaDetailViewer"
import type { DetailReadState, CollectionReadState } from "../mediaDetailReadState"
import { DetailMetadataStatus, DetailCollectionStatus } from "../MediaDetailReadFeedback"

export type MediaDetailInfoPanelProps = Pick<
  MediaDetailViewerProps,
  | "compact"
  | "detailInfoOpened"
  | "detailValues"
  | "detailSectionsExpanded"
  | "toggleDetailSection"
  | "openDetailEditor"
  | "setUnshareTarget"
  | "setShareTarget"
  | "setDetailEditor"
  | "context"
  | "downloadMock"
  | "onRequestDelete"
> & {
  detailReadState?: DetailReadState
  groupsReadState?: CollectionReadState
  tagsReadState?: CollectionReadState
  onRetryDetail?: () => void
  readOnly?: boolean
}

export function MediaDetailInfoPanel({
  compact,
  detailInfoOpened,
  detailValues,
  detailSectionsExpanded,
  toggleDetailSection,
  openDetailEditor,
  setUnshareTarget,
  setShareTarget,
  setDetailEditor,
  context: contextKind,
  downloadMock,
  onRequestDelete,
  detailReadState,
  groupsReadState,
  tagsReadState,
  onRetryDetail,
  readOnly = false,
}: MediaDetailInfoPanelProps) {
  return (
    <MediaDetailInfoPanelFrame
      compact={compact}
      opened={detailInfoOpened}
      footer={!readOnly && !detailReadState && (
        <Box
          p="md"
          style={{
            borderTop: "1px solid var(--mantine-color-default-border)",
            flexShrink: 0,
          }}
        >
          <Group justify="flex-end">
            <Button size="xs" variant="subtle" color="red" leftSection={<IconTrash size={15} />} onClick={onRequestDelete}>
              削除
            </Button>
          </Group>
        </Box>
      )}
    >
              {detailReadState ? (
                <DetailMetadataStatus state={detailReadState} onRetry={onRetryDetail} />
              ) : (
                <MediaDetailMetadata downloadMock={downloadMock} />
              )}
              <Divider
                style={{
                  marginInline: "calc(-1 * var(--mantine-spacing-md))",
                }}
              />
              {detailReadState && !groupsReadState ? (
                <DetailCollectionStatus title="Groups" state={{ kind: "pending" }} />
              ) : groupsReadState && groupsReadState.kind !== "ready" ? (
                <DetailCollectionStatus title="Groups" state={groupsReadState} />
              ) : detailReadState && detailReadState.kind !== "ready" ? (
                <DetailCollectionStatus title="Groups" state={{ kind: "pending" }} />
              ) : (
              <MediaDetailGroupsSection
                detailValues={groupsReadState?.kind === "ready" ? { ...detailValues, groups: groupsReadState.values.map((item) => item.name) } : detailValues}
                detailSectionsExpanded={detailSectionsExpanded}
                toggleDetailSection={toggleDetailSection}
                openDetailEditor={openDetailEditor}
                readOnly={readOnly}
              />
              )}
              {detailReadState && !tagsReadState ? (
                <DetailCollectionStatus title="Tags" state={{ kind: "pending" }} />
              ) : tagsReadState && tagsReadState.kind !== "ready" ? (
                <DetailCollectionStatus title="Tags" state={tagsReadState} />
              ) : detailReadState && detailReadState.kind !== "ready" ? (
                <DetailCollectionStatus title="Tags" state={{ kind: "pending" }} />
              ) : (
              <MediaDetailTagsSection
                detailValues={tagsReadState?.kind === "ready" ? { ...detailValues, tags: tagsReadState.values.map((item) => item.name) } : detailValues}
                detailSectionsExpanded={detailSectionsExpanded}
                toggleDetailSection={toggleDetailSection}
                openDetailEditor={openDetailEditor}
              />
              )}
              <Divider
                style={{
                  marginInline: "calc(-1 * var(--mantine-spacing-md))",
                }}
              />
              {!readOnly && !detailReadState && <MediaDetailCommunitySection
                detailValues={detailValues}
                detailSectionsExpanded={detailSectionsExpanded}
                toggleDetailSection={toggleDetailSection}
                setUnshareTarget={setUnshareTarget}
                setShareTarget={setShareTarget}
                setDetailEditor={setDetailEditor}
                context={contextKind}
              />}
    </MediaDetailInfoPanelFrame>
  )
}
