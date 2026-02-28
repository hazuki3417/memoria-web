import { ActionIcon } from "@mantine/core"
import {
  IconRotate,
  IconRotate2,
  IconRotateClockwise2,
} from "@tabler/icons-react"

export interface RotateButtonGroupProps {
  onLeft?: React.MouseEventHandler<HTMLButtonElement>
  onRight?: React.MouseEventHandler<HTMLButtonElement>
  onReset?: React.MouseEventHandler<HTMLButtonElement>
}

export const RotateButtonGroup = (props: RotateButtonGroupProps) => (
  <ActionIcon.Group>
    <ActionIcon
      size={"input-xs"}
      variant="default"
      onClick={props.onLeft}
      data-testid="rotate-left"
    >
      <IconRotate2 />
    </ActionIcon>
    <ActionIcon
      size={"input-xs"}
      variant="default"
      onClick={props.onReset}
      data-testid="rotate-reset"
    >
      <IconRotate />
    </ActionIcon>
    <ActionIcon
      size={"input-xs"}
      variant="default"
      onClick={props.onRight}
      data-testid="rotate-right"
    >
      <IconRotateClockwise2 />
    </ActionIcon>
  </ActionIcon.Group>
)
