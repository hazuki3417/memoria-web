import { Overlay as Base, OverlayProps as BaseProps } from "@mantine/core"

export interface OverlayProps extends BaseProps {}

export const Overlay = (props: OverlayProps) => {
  const { ...rest } = props
  return <Base {...rest} />
}
