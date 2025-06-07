import type { Meta, StoryObj } from "@storybook/react";
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
  },
};
