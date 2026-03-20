import { Box } from "@mantine/core"
import type { Meta, StoryObj } from "@storybook/react"
import { Slide } from "./Slide"

const meta = {
  title: "ContentLayout/Slide",
  component: Slide,
} satisfies Meta<typeof Slide>

export default meta
type Story = StoryObj<typeof meta>

const Image = () => (
  <Box
    style={(theme) => ({
      minWidth: "160px",
      minHeight: "160px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.colors.blue[9],
    })}
  >
    image
  </Box>
)

const children = (
  <>
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
    <Image />
  </>
)

export const Default: Story = {
  args: {
    children,
  },
}
