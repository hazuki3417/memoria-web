import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within } from "@storybook/test";
import { Info } from "./Info";

const meta = {
  title: "Modal/ImageDetailModal/Info",
  component: Info,
} satisfies Meta<typeof Info>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payload: {
      file: {
        name: "example.png",
        size: "24.5MB",
        date: "2025/01/01",
      },
      image: {
        width: 1200,
        height: 1000,
      },
      tags: ["SAO", "ジークアクス", "Fate"],
    },
    handler: {
      onClose: fn(),
      onDelete: fn(),
      onEdit: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("close-info"));
    await userEvent.click(canvas.getByTestId("edit-info"));
    await userEvent.click(canvas.getByTestId("delete-image"));
  },
};
