import { IconCheck } from "@tabler/icons-react"
import { BaseIcon, BaseIconProps } from "./BaseIcon"

export interface SelectedIconProps extends BaseIconProps {}

export const SelectedIcon = (props: SelectedIconProps) => {
  const { ...rest } = props
  return (
    <BaseIcon color="gray" {...rest}>
      <IconCheck />
    </BaseIcon>
  )
}
SelectedIcon.displayName = "ThumbnailBox.SelectedIcon"
