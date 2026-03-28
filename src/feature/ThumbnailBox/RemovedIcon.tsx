import { IconX } from "@tabler/icons-react"
import { BaseIcon, BaseIconProps } from "./BaseIcon"

export interface RemovedIconProps extends BaseIconProps {}

export const RemovedIcon = (props: RemovedIconProps) => {
  const { ...rest } = props
  return (
    <BaseIcon color="orange" {...rest}>
      <IconX />
    </BaseIcon>
  )
}
RemovedIcon.displayName = "ThumbnailBox.RemovedIcon"
