"use client"
import { Box, BoxProps } from "@mantine/core"
import { forwardRef } from "react"

export interface IntersectionProps extends BoxProps { }

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
          userSelect: "none",
        }}
        {...props}
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
