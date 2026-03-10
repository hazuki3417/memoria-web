import { transform } from "@/lib/transform"
import { DonutChart } from "@mantine/charts"
import {
  Box,
  Divider,
  Group,
  Paper,
  PaperProps,
  Text,
  Title,
} from "@mantine/core"
import { IconFile } from "@tabler/icons-react"
import React, { useMemo } from "react"
import { ColorSwatchText } from "../ColorSwatchText"
import { FILE_TYPE_COLOR } from "../constants"

export type FileCountInfo = {
  type: string
  value: number
}

export type FileCountInfoPanelPayload = {
  total?: number
  files?: FileCountInfo[]
}

export interface FileCountInfoPanelProps
  extends Omit<PaperProps, "shadow" | "withBorder"> {
  payload?: FileCountInfoPanelPayload
}

export const FileCountInfoPanel = (props: FileCountInfoPanelProps) => {
  const { payload, ...rest } = props
  const { total = 0, files = [] } = payload ?? {}

  const items = useMemo(() => {
    return files.map((file) => {
      const persent = 0 < file.value ? (file.value / total) * 100 : 0
      return {
        ...file,
        color: FILE_TYPE_COLOR[file.type.toLowerCase()],
        size: transform.num.en({ value: file.value }),
        persent: Math.round(persent),
      }
    })
  }, [files, total])

  const data = items.map((item) => {
    return {
      name: item.type,
      value: item.value,
      color: item.color,
    }
  })

  const totalSize = transform.num.en({ value: total })

  return (
    <Paper shadow="xs" withBorder {...rest}>
      <Group gap={4} p="xs">
        <IconFile size={16} />
        <Title order={6}>ファイル数</Title>
      </Group>
      <Divider />
      <Group p="xs" display="flex" align="start">
        <Box>
          <DonutChart
            size={140}
            startAngle={90}
            endAngle={-270}
            withTooltip={false}
            chartLabel={`${totalSize} 件`}
            data={data}
          />
        </Box>
        <Box
          style={(theme) => ({
            display: "grid",
            gridTemplateColumns: "auto auto auto 1fr",
          })}
        >
          {items.map((item) => (
            <React.Fragment key={item.type}>
              <Box>
                <ColorSwatchText
                  color={item.color}
                  label={item.type.toLowerCase()}
                />
              </Box>
              <Box>
                <Text size="xs">：</Text>
              </Box>
              <Box style={{ display: "flex", justifyContent: "end" }}>
                <Text size="xs">{`${item.size} 件`}</Text>
              </Box>
              <Box>
                <Text size="xs">{`（ ${item.persent} % ）`}</Text>
              </Box>
            </React.Fragment>
          ))}
        </Box>
      </Group>
    </Paper>
  )
}
