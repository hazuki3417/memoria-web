import type { Meta, StoryObj } from "@storybook/react"
import { Box, Paper, Text } from "@mantine/core"
import { SettingsSectionLayout } from "./SettingsSectionLayout"
const meta = { title: "Components/SettingsSectionLayout", component: SettingsSectionLayout, args: { compact: false, navigation: <Paper p="sm" withBorder><Text>設定ナビゲーション</Text></Paper>, children: <Box p="md"><Text>設定項目</Text></Box> } } satisfies Meta<typeof SettingsSectionLayout>
export default meta
type Story = StoryObj<typeof meta>
export const Desktop: Story = { tags: ["visual"] }
export const Compact: Story = { args: { compact: true }, tags: ["visual"] }
