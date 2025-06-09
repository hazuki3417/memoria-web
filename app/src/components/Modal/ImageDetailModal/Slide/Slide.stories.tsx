import type { Meta, StoryObj } from "@storybook/react";
import { Slide } from "./Slide";
import { fn, userEvent, within } from "@storybook/test";

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
    handler: {
      onClose: fn(),
      onDownload: fn(),
      onInfo: fn(),
      onNext: fn(),
      onPrev: fn(),
      onZoomChange: fn(),
      onZoomIn: fn(),
      onZoomOut: fn(),
      onZoomReset: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("close-slide"));
    await userEvent.click(canvas.getByTestId("download-image"));
    await userEvent.click(canvas.getByTestId("open-info"));
    await userEvent.click(canvas.getByTestId("next-image"));
    await userEvent.click(canvas.getByTestId("prev-image"));
    // NOTE:　onChangeのテストはしない
    await userEvent.click(canvas.getByTestId("zoom-in"));
    await userEvent.click(canvas.getByTestId("zoom-out"));
    await userEvent.click(canvas.getByTestId("zoom-reset"));
  },
};
