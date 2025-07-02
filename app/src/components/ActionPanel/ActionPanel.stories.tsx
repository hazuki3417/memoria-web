import type { Meta, StoryObj } from "@storybook/react";
import { ActionPanel } from "./ActionPanel";

const meta = {
  title: "ActionPanel",
  component: ActionPanel,
} satisfies Meta<typeof ActionPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const LeftOnly: Story = {
  args: {
    left: <>left</>,
  },
};

export const CenterOnly: Story = {
  args: {
    center: <>center</>,
  },
};

export const RightOnly: Story = {
  args: {
    right: <>right</>,
  },
};

export const LeftCenterRight: Story = {
  args: {
    left: <>left</>,
    center: <>center</>,
    right: <>right</>,
  },
};
