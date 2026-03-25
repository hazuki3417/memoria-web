"use client"
import { Box } from "@mantine/core"
import { forwardRef } from "react"

export interface IntersectionProps {}

export const Intersection = forwardRef<HTMLDivElement, IntersectionProps>(
  (props, ref) => {
    return (
      <Box
        ref={ref}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "160px",
          width: "160px",
          userSelect: "none",
        }}
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
