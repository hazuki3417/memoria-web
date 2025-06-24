import type { Meta, StoryObj } from "@storybook/react";
import { IntersectionTile } from "./IntersectionTile";

const meta = {
  title: "Image/IntersectionTile",
  component: IntersectionTile,
} satisfies Meta<typeof IntersectionTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    visible: true,
  },
};
