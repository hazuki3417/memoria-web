import type { Meta, StoryObj } from "@storybook/react";
import { AddImageBox } from "./AddImageBox";
import { imageConfig } from "@/config";
import { fn, userEvent, within } from "@storybook/test";

const meta = {
  title: "ImageDropForm/AddImageBox",
  component: AddImageBox,
} satisfies Meta<typeof AddImageBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    config: imageConfig,
    handler: {
      onFileSelect: fn(),
    },
  },
};

export const Disabled: Story = {
  args: {
    config: imageConfig,
    handler: {
      onFileSelect: fn(),
    },
    ui: {
      disabled: true,
    },
  },
};

export const ValidAccept: Story = {
  args: {
    config: imageConfig,
    handler: {
      onFileSelect: fn(),
    },
    ui: {
      valid: "accept",
    },
  },
};

export const ValidReject: Story = {
  args: {
    config: imageConfig,
    handler: {
      onFileSelect: fn(),
    },
    ui: {
      valid: "reject",
    },
  },
};

export const ValidWarning: Story = {
  args: {
    config: imageConfig,
    handler: {
      onFileSelect: fn(),
    },
    ui: {
      valid: "warning",
    },
  },
};
