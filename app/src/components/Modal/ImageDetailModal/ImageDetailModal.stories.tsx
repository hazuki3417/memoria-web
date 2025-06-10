import type { Meta, StoryObj } from "@storybook/react";
import { ImageDetailModal } from "./ImageDetailModal";

const meta = {
  title: "Modal/ImageDetailModal",
  component: ImageDetailModal,
} satisfies Meta<typeof ImageDetailModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payload: {
      slide: {
        current: 1,
        limit: 20,
      },
      info: {
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
  },
};
