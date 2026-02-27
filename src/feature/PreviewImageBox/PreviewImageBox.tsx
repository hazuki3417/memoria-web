import {
  ActionIcon,
  Box,
  HoverCard,
  Image,
  Paper,
  Stack,
  Text,
} from "@mantine/core"
import classes from "./PreviewImageBox.module.css"
import React, { useCallback } from "react"
import { IconAlertTriangle, IconX } from "@tabler/icons-react"

export type PreviewImageBoxPayload = {
  src?: string
  alt?: string
}

export type PreviewImageBoxUi = {
  error?: string
  selected: boolean
  selectable: boolean
  supported: boolean
  valid?: "idle" | "accept" | "warning" | "reject"
}

export type PreviewImageBoxHandler = {
  onSelect?: (index: number, id: string) => void
  onRemove?: (index: number, id: string) => void
}

export interface PreviewImageBoxProps {
  index: number // 要素番号
  id: string // 要素値のid
  payload: PreviewImageBoxPayload
  handler?: PreviewImageBoxHandler
  ui: PreviewImageBoxUi
}

export const PreviewImageBox = (props: PreviewImageBoxProps) => {
  const { index, id, payload, ui, handler } = props

  const select = useCallback(() => {
    handler?.onSelect?.(index, id)
  }, [index, id])

  const remove = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      handler?.onRemove?.(index, id)
    },
    [index, id],
  )

  return (
    <HoverCard>
      <HoverCard.Target>
        <Paper
          className={classes.box}
          onClick={ui.supported ? select : undefined}
          data-selected={ui.supported ? ui.selected : false}
          data-selectable={ui.supported ? ui.selectable : false}
          data-supported={ui.supported}
          data-valid={ui.supported ? ui.valid : undefined}
          data-testid="select-file"
        >
          <ActionIcon
            className={classes.actionIcon}
            size={20}
            onClick={remove}
            data-testid="remove-file"
          >
            <IconX />
          </ActionIcon>
          {ui.supported === true && (
            <Image
              className={classes.image}
              src={payload.src}
              alt={payload.alt}
              draggable={false}
            />
          )}
          {ui.supported === false && (
            <Stack
              gap={8}
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <IconAlertTriangle
                size={60}
                style={{ color: "var(--mantine-color-red-6)" }}
              />
              <Text size="xs">{ui.error}</Text>
            </Stack>
          )}
          {payload.alt && (
            <Box className={classes.labelBox}>
              <Text className={classes.label} size="xs">
                {payload.alt}
              </Text>
            </Box>
          )}
        </Paper>
      </HoverCard.Target>
      {ui.supported === true && ui.valid === "reject" && (
        <HoverCard.Dropdown>
          <Text size="xs">{ui.error}</Text>
        </HoverCard.Dropdown>
      )}
    </HoverCard>
  )
}
