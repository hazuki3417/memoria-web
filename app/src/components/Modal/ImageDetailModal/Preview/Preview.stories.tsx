import type { Meta, StoryObj } from "@storybook/react";
import { Preview } from "./Preview";

const meta = {
  title: "Modal/ImageDetailModal/Preview",
  component: Preview,
} satisfies Meta<typeof Preview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
