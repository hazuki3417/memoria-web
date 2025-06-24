import type { Meta, StoryObj } from "@storybook/react";
import { ImageFrame } from "./ImageFrame";
import { ImageTile } from "../ImageTile";
import { fn, userEvent, within } from "@storybook/test";

const meta = {
  title: "Image/ImageFrame",
  component: ImageFrame,
} satisfies Meta<typeof ImageFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const children = <ImageTile src="sample/v.png" alt="example" />;

export const Default: Story = {
  args: {
    children,
    ui: {},
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};

export const Selected: Story = {
  args: {
    children,
    ui: {
      selected: true,
    },
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};

export const Selectable: Story = {
  args: {
    children,
    ui: {
      selectable: true,
    },
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};

export const ValidAccept: Story = {
  args: {
    children,
    ui: {
      valid: "accept",
    },
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};

export const ValidReject: Story = {
  args: {
    children,
    ui: {
      valid: "reject",
    },
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};

export const ValidWarning: Story = {
  args: {
    children,
    ui: {
      valid: "warning",
    },
    handler: {
      onClick: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("click-image-frame"));
  },
};
