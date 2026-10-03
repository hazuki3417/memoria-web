import { Select, Switch } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { SettingRow } from "./SettingRow"

const meta = {
  title: "Components/Setting Row",
  component: SettingRow,
  args: {
    label: "日付形式",
    description: "日付の表示形式を選びます。",
    compact: false,
    children: (
      <Select
        aria-label="日付形式"
        value="YYYY-MM-DD"
        data={["YYYY-MM-DD"]}
        allowDeselect={false}
      />
    ),
  },
} satisfies Meta<typeof SettingRow>

export default meta
type Story = StoryObj<typeof meta>

export const Wide: Story = {}

export const Compact: Story = {
  args: {
    compact: true,
  },
}

export const SwitchControl: Story = {
  args: {
    label: "繰り返し表示",
    description: "最後まで進んだら最初のMediaに戻ります。",
    children: <Switch checked label="オン" readOnly />,
  },
}
