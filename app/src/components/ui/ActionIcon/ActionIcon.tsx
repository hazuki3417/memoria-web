import {
  ActionIcon as OActionIcon,
  ActionIconProps as OActionIconProps,
} from "@mantine/core";

export interface ActionIconProps
  extends Omit<OActionIconProps, "variant" | "color"> {}

export const ActionIcon = (props: ActionIconProps) => {
  return <OActionIcon variant="subtle" color="gray" {...props} />;
};
