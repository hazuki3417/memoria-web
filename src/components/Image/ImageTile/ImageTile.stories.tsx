import type { Meta, StoryObj } from "@storybook/react";
import { ImageTile } from "./ImageTile";

const meta = {
  title: "Image/ImageTile",
  component: ImageTile,
} satisfies Meta<typeof ImageTile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    src: "sample/v.png",
    alt: "default",
  },
};

export const VerticalImage: Story = {
  args: {
    src: "sample/v.png",
    alt: "vertical image",
  },
};

export const HorizontalImage: Story = {
  args: {
    src: "sample/h.png",
    alt: "horizontal image",
  },
};
