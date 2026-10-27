import type { Meta, StoryObj } from "@storybook/react"
import { Button, Loader } from "@mantine/core"
import { IconInfoCircle } from "@tabler/icons-react"
import { fn } from "storybook/test"
import { StateDisplay } from "./StateDisplay"
const meta = { title: "Components/StateDisplay", component: StateDisplay, args: { title: "データがありません", description: "コンテンツを追加してください。", icon: <IconInfoCircle size={24} /> } } satisfies Meta<typeof StateDisplay>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { tags: ["visual"] }
export const Inline: Story = { args: { variant: "inline" }, tags: ["visual"] }
export const WithAction: Story = { args: { action: <Button onClick={fn()}>追加</Button> }, tags: ["visual"] }
export const Loading: Story = { args: { loading: true, title: "読み込み中", icon: <Loader /> }, tags: ["visual"] }
export const InlineLoading: Story = { args: { variant: "inline", loading: true, title: "読み込み中", icon: <Loader size="sm" /> }, tags: ["visual"] }
