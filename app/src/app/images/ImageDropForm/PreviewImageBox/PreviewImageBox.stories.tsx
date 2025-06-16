import type { Meta, StoryObj } from "@storybook/react";
import { PreviewImageBox } from "./PreviewImageBox";
import { fn, userEvent, within } from "@storybook/test";

const meta = {
  title: "ImageDropForm/PreviewImageBox",
  component: PreviewImageBox,
} satisfies Meta<typeof PreviewImageBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const payload = { src: "sample/h.png", alt: "example.png" };

export const Default: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: true,
      supported: true,
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const Selected: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: true,
      selectable: true,
      supported: true,
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const NonSelectable: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: false,
      supported: true,
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const UnSupported: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: false,
      supported: false,
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const ValidAccept: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "accept",
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const ValidReject: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "warning",
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};

export const ValidWarning: Story = {
  args: {
    id: 0,
    payload,
    ui: {
      selected: false,
      selectable: true,
      supported: true,
      valid: "reject",
    },
    handler: {
      onSelect: fn(),
      onRemove: fn(),
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId("select-file"));
    await userEvent.click(canvas.getByTestId("remove-file"));
  },
};
