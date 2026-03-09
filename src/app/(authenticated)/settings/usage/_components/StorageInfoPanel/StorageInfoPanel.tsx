import {
  Box,
  Divider,
  Flex,
  Group,
  Paper,
  PaperProps,
  Progress,
  Text,
  Title,
} from "@mantine/core"
import { IconDatabase } from "@tabler/icons-react"
import { useMemo } from "react"
import { ColorSwatchText } from "../ColorSwatchText"

export type StorageInfoPanelPayload = {
  used?: number
  total?: number
}

export interface StorageInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {
  payload?: StorageInfoPanelPayload
}

export const StorageInfoPanel = (props: StorageInfoPanelProps) => {
  const { payload, ...rest } = props
  const { total = 0, used = 0 } = payload ?? {}

  const info = useMemo(() => {
    const byte = {
      used,
      free: Math.max(total - used, 0),
      total,
    }
    const percent = (() => {
      if (total <= 0) {
        return {
          used: 0,
          free: 0,
        }
      }

      const usedPercent = (used / total) * 100
      const safeUsed = Math.min(Math.max(usedPercent, 0), 100)

      return {
        used: safeUsed,
        free: 100 - safeUsed,
      }
    })()

    return {
      byte,
      percent,
    }
  }, [total, used])

  return (
    <Paper shadow="xs" withBorder {...rest}>
      <Group gap={4} p="xs">
        <IconDatabase size={16} />
        <Title order={6}>ストレージ</Title>
      </Group>
      <Divider />
      <Box
        p="xs"
        style={(theme) => ({
          display: "grid",
          gridTemplateColumns: "auto auto auto 1fr",
        })}
      >
        <Box
          style={{
            gridColumn: "span 4",
          }}
        >
          <Box mb="xs">
            <Flex justify="flex-end">
              <Text size="xs">
                {info.byte.used} / {info.byte.total} （ {info.percent.used} % ）
              </Text>
            </Flex>
            <Progress.Root radius="xs">
              <Progress.Section value={info.percent.used} color="blue" />
            </Progress.Root>
          </Box>
        </Box>
        <Box>
          <Text size="xs">・容量</Text>
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box style={{ gridColumn: "span 2" }}>
          <Text size="xs">{info.byte.total}</Text>
        </Box>

        <Box>
          <ColorSwatchText
            color="var(--mantine-color-blue-filled)"
            label="使用領域"
          />
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">{info.byte.used}</Text>
        </Box>
        <Box>
          <Text size="xs">（ {info.percent.used} % ）</Text>
        </Box>

        <Box>
          <ColorSwatchText
            color="var(--mantine-color-dark-4)"
            label="空き領域"
          />
        </Box>
        <Box>
          <Text size="xs">：</Text>
        </Box>
        <Box>
          <Text size="xs">{info.byte.free}</Text>
        </Box>
        <Box>
          <Text size="xs">（ {info.percent.free} % ）</Text>
        </Box>
      </Box>
    </Paper>
  )
}
