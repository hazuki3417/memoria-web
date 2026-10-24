import type { Meta, StoryObj } from "@storybook/react"
import { waitFor } from "storybook/test"
import { DashboardPrototype } from "./DashboardPrototype"

const meta = {
  title: "Design Prototypes/Dashboard",
  component: DashboardPrototype,
  parameters: { layout: "fullscreen", applicationShellOwnsPortal: true },
} satisfies Meta<typeof DashboardPrototype>

export default meta
type Story = StoryObj<typeof meta>

export const Personal: Story = {
  name: "Personal",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
}
export const Community: Story = {
  name: "Community",
  tags: ["visual"],
  args: {
    initialContext: "community",
    initialState: "default",
    communityId: "storybook-community",
  },
}
export const Empty: Story = {
  name: "Empty",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "empty" },
}
export const CommunityEmpty: Story = {
  name: "Community Empty",
  tags: ["visual"],
  args: {
    initialContext: "community",
    initialState: "empty",
    communityId: "storybook-community",
  },
}
export const Compact: Story = {
  name: "Compact",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const CompactEmpty: Story = {
  name: "Compact Empty",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "empty" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
}
export const Medium: Story = {
  name: "Medium",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
  parameters: { viewport: { defaultViewport: "tablet" } },
}

export const MiddlePage: Story = {
  name: "Middle Page",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
  play: async ({ canvasElement }) => {
    canvasElement
      .querySelector<HTMLButtonElement>('button[aria-label="次のMediaへ"]')
      ?.click()
  },
}

export const LastPage: Story = {
  name: "Last Page",
  tags: ["visual"],
  args: { initialContext: "personal", initialState: "default" },
  play: async ({ canvasElement }) => {
    const next = () =>
      canvasElement.querySelector<HTMLButtonElement>(
        'button[aria-label="次のMediaへ"]',
      )

    while (next()) {
      const button = next()
      if (!button) break
      button.click()
      await waitFor(() => {
        if (button.isConnected && button.disabled) {
          throw new Error("Carousel is still sliding")
        }
      })
    }
  },
}
