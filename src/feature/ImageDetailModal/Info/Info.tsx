import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Grid,
  Paper,
  type PaperProps,
  Text,
} from "@mantine/core"
import { IconEdit, IconTrash, IconX } from "@tabler/icons-react"
import type React from "react"
import { Body } from "./Body"
import { Footer } from "./Footer"
import { Header } from "./Header"

export type InfoPayload = {
  file: {
    name: string
    size: string
    date: string
  }
  image: {
    width: number
    height: number
  }
  tags: string[]
}

export type InfoHandler = {
  onClose?: React.MouseEventHandler<HTMLButtonElement>
  onEdit?: React.MouseEventHandler<HTMLButtonElement>
  onDelete?: React.MouseEventHandler<HTMLButtonElement>
}

export interface InfoProps extends PaperProps {
  payload: InfoPayload
  handler?: InfoHandler
}

export const Info = (props: InfoProps) => {
  const { payload, handler } = props

  return (
    <Paper
      data-testid="info"
      p={0}
      radius={0}
      style={(theme) => ({
        display: "flex",
        flexDirection: "column",
        width: "340px",
        height: "100%",
      })}
    >
      <Header
        style={(theme) => ({
          display: "flex",
          height: "40px",
          flexShrink: 0,
          justifyContent: "space-between",
          padding: "0px 8px",
        })}
      >
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
          })}
        >
          <Text>情報</Text>
        </Box>
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ActionIcon
            color="gray"
            size="input-xs"
            variant="subtle"
            data-testid="close-info"
            onClick={handler?.onClose}
          >
            <IconX />
          </ActionIcon>
        </Box>
      </Header>
      <Divider />
      <Body
        style={(theme) => ({
          flexGrow: 1,
          padding: "8px 8px",
        })}
      >
        <Grid>
          <Grid.Col span={4}>
            <Text size="xs">ファイル名</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text size="xs">{payload.file.name}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="xs">ファイルサイズ</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text size="xs">{payload.file.size}</Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="xs">サイズ</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text size="xs">
              {payload.image.width} (w) x {payload.image.height} (h)
            </Text>
          </Grid.Col>
          <Grid.Col span={4}>
            <Text size="xs">日付</Text>
          </Grid.Col>
          <Grid.Col span={8}>
            <Text size="xs">{payload.file.date}</Text>
          </Grid.Col>
          {/* タグの特殊行 */}
          <Grid.Col span={12}>
            <Text size="xs">タグ</Text>
          </Grid.Col>
          <Grid.Col
            span={12}
            style={{
              display: "flex",
              gap: "4px",
            }}
          >
            {payload.tags.map((tag) => (
              <Badge key={tag} variant="light" size="sm" radius="sm">
                {tag}
              </Badge>
            ))}
          </Grid.Col>
        </Grid>
      </Body>
      <Divider />
      <Footer
        style={(theme) => ({
          height: "40px",
          flexShrink: 0,
          padding: "0px 8px",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        })}
      >
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ActionIcon
            color="gray"
            size="input-xs"
            variant="subtle"
            data-testid="edit-info"
            onClick={handler?.onEdit}
          >
            <IconEdit />
          </ActionIcon>
        </Box>
        <Box
          style={(theme) => ({
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <ActionIcon
            color="gray"
            size="input-xs"
            variant="subtle"
            data-testid="delete-image"
            onClick={handler?.onDelete}
          >
            <IconTrash />
          </ActionIcon>
        </Box>
      </Footer>
    </Paper>
  )
}
