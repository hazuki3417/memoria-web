import { Box, Text } from "@mantine/core"

export interface LabelProps {
  alt?: string
}

export const Label = (props: LabelProps) => {
  const { alt } = props
  return (
    <Box
      pos="absolute"
      bottom={0}
      left={0}
      w="100%"
      px={4}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        borderEndStartRadius: "var(--mantine-radius-sm)",
        borderEndEndRadius: "var(--mantine-radius-sm)",
      }}
    >
      <Text
        size="xs"
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {alt}
      </Text>
    </Box>
  )
}
Label.displayName = "ThumbnailImage.Label"
