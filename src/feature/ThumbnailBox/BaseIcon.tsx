import { ThemeIcon, ThemeIconProps } from "@mantine/core"

export interface BaseIconProps extends ThemeIconProps {}

export const BaseIcon = (props: BaseIconProps) => {
  const { children, ...rest } = props
  return (
    <ThemeIcon
      styles={{
        root: {
          position: "absolute",
          bottom: 8,
          right: 8,
        },
      }}
      radius="xl"
      variant="filled"
      size="xs"
      {...rest}
    >
      {children}
    </ThemeIcon>
  )
}
BaseIcon.displayName = "ThumbnailBox.BaseIcon"
