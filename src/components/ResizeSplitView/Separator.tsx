import { Box, BoxProps, Divider } from "@mantine/core"
import { IconTallymark2 } from "@tabler/icons-react"

export interface SeparatorProps extends BoxProps {
  visible?: boolean
}

export const Separator = (props: SeparatorProps) => {
  const { visible = true, style, ...rest } = props

  return (
    <Box
      style={{
        position: "relative",
        display: "flex",
        visibility: visible ? "visible" : "hidden",
        ...style,
      }}
      {...rest}
    >
      <Divider style={{ position: "relative" }} orientation="vertical" />
      <IconTallymark2
        size={25}
        color="var(--mantine-color-dark-4)"
        style={{ position: "absolute", top: "50%", left: -12 }}
      />
    </Box>
  )
}
Separator.displayName = "ResizeSplitView.Separator"
