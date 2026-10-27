import type { Meta, StoryObj } from "@storybook/react"
import { fn } from "storybook/test"
import { CommunityNameSection } from "./CommunityNameSection"

const meta = {
  title: "Features/Community Settings/CommunityNameSection",
  component: CommunityNameSection,
  args: {
    isAdmin: true,
    draft: "Memoria Community",
    setDraft: fn(),
    invalid: false,
    dirty: false,
    savingName: false,
    saveName: fn(),
  },
} satisfies Meta<typeof CommunityNameSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { tags: ["visual"] }
export const Edited: Story = { args: { draft: "新しいCommunity名", dirty: true }, tags: ["visual"] }
export const Invalid: Story = { args: { draft: "", invalid: true, dirty: true }, tags: ["visual"] }
export const Saving: Story = { args: { dirty: true, savingName: true }, tags: ["visual"] }
export const ReadOnly: Story = { args: { isAdmin: false }, tags: ["visual"] }
