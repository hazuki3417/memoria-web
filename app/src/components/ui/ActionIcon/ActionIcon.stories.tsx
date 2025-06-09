import type { Meta, StoryObj } from "@storybook/react";
import { ActionIcon } from "./ActionIcon";
import { IconX } from "@tabler/icons-react";

const meta = {
  title: "ui/ActionIcon",
  component: ActionIcon,
} satisfies Meta<typeof ActionIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <IconX />,
  },
};
