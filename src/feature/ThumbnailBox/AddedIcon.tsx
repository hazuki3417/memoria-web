import { IconCheck } from "@tabler/icons-react"
import { BaseIcon, BaseIconProps } from "./BaseIcon"

export interface AddedIconProps extends BaseIconProps {}

export const AddedIcon = (props: AddedIconProps) => {
  const { ...rest } = props
  return (
    <BaseIcon color="green" {...rest}>
      <IconCheck />
    </BaseIcon>
  )
}
AddedIcon.displayName = "ThumbnailBox.AddedIcon"
