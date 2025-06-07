import type { Meta, StoryObj } from "@storybook/react";
import { Slide } from "./Slide";

const meta = {
  title: "Modal/ImageDetailModal/Slide",
  component: Slide,
} satisfies Meta<typeof Slide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    payload: {
      footer: {
        current: 1,
        limit: 20,
      },
    },
    children: (
      <>
        imageimage
        <br />
        imageimage
        <br />
        imageimage
        <br />
        imageimage
        <br />
        imageimage
        <br />
      </>
    ),
  },
};
