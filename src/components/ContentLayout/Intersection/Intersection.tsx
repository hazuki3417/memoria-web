import { Box } from "@mantine/core"
import { forwardRef } from "react"

export interface IntersectionProps {
  visible: boolean
}

export const Intersection = forwardRef<HTMLDivElement, IntersectionProps>(
  (props, ref) => {
    const { visible } = props

    return (
      <Box
        style={(theme) => ({
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "160px",
          width: "160px",
          borderRadius: theme.radius.sm,
          userSelect: "none",
        })}
        ref={ref}
      >
        {/* <LoadingOverlay
        visible={visible}
        style={(theme) => ({
          borderRadius: theme.radius.sm,
        })}
        loaderProps={{ children: "Loading..." }}
      /> */}
      </Box>
    )
  },
)
