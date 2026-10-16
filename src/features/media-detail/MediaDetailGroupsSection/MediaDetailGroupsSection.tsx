"use client"

import {
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Text,
} from "@mantine/core"
import { IconChevronDown } from "@tabler/icons-react"
import type { MediaDetailViewerProps } from "../MediaDetailViewer/MediaDetailViewer"

export type MediaDetailGroupsSectionProps = Pick<
  MediaDetailViewerProps,
  | "detailValues"
  | "detailSectionsExpanded"
  | "toggleDetailSection"
  | "openDetailEditor"
>

export function MediaDetailGroupsSection({
  detailValues,
  detailSectionsExpanded,
  toggleDetailSection,
  openDetailEditor,
}: MediaDetailGroupsSectionProps) {
  const values = detailValues.groups
  return (
    <Box>
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Group gap={6}>
          <Text size="xs" c="dimmed">
            Groups
          </Text>
          <Text size="xs" c="dimmed">
            ({values.length})
          </Text>
        </Group>
        <Button
          size="compact-xs"
          variant="subtle"
          onClick={() => openDetailEditor("groups")}
        >
          編集
        </Button>
      </Group>
      <Group gap={6}>
        {values.length === 0 ? (
          <Text size="xs" c="dimmed">
            未設定
          </Text>
        ) : (
          values.slice(0, 6).map((value) => (
            <Badge
              key={value}
              variant="outline"
              style={{
                maxWidth: "100%",
                overflowWrap: "anywhere",
                height: "auto",
                whiteSpace: "normal",
              }}
            >
              {value}
            </Badge>
          ))
        )}
      </Group>
      {values.length > 6 && (
        <>
          <Collapse in={detailSectionsExpanded.groups} transitionDuration={200}>
            <Group gap={6} mt="xs">
              {values.slice(6).map((value) => (
                <Badge
                  key={value}
                  variant="outline"
                  style={{
                    maxWidth: "100%",
                    overflowWrap: "anywhere",
                    height: "auto",
                    whiteSpace: "normal",
                  }}
                >
                  {value}
                </Badge>
              ))}
            </Group>
          </Collapse>
          <Group justify="center" mt="xs">
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              fw={400}
              onClick={() => toggleDetailSection("groups")}
              aria-expanded={detailSectionsExpanded.groups}
              rightSection={
                <IconChevronDown
                  size={14}
                  style={{
                    transform: detailSectionsExpanded.groups
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 200ms ease",
                  }}
                />
              }
            >
              {detailSectionsExpanded.groups
                ? "折りたたむ"
                : `ほか${values.length - 6}件を表示`}
            </Button>
          </Group>
        </>
      )}
      <Divider
        mt="md"
        style={{ marginInline: "calc(-1 * var(--mantine-spacing-md))" }}
      />
    </Box>
  )
}
