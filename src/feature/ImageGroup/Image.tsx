import { Image as Base, ImageProps as BaseProps } from "@mantine/core"

export interface ImageProps
  extends Omit<BaseProps, "w" | "h" | "mah" | "maw" | "draggable"> {
  alt?: string
}

export const Image = (props: ImageProps) => {
  const { ...rest } = props
  return (
    <Base {...rest} w="auto" h="auto" mah="100%" maw="100%" draggable={false} />
  )
}
Image.displayName = "ImageGroup.Image"
