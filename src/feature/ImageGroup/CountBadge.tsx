import { Badge, Box } from "@mantine/core"
import { IconBoxMultipleFilled } from "@tabler/icons-react"

export interface CountBadgeProps {
  value?: number
}

export const CountBadge = (props: CountBadgeProps) => {
  const { value = 0, ...rest } = props
  return (
    <Box
      style={(theme) => ({
        position: "absolute",
        top: 8,
        right: 12,
      })}
      size={20}
      {...rest}
    >
      <Badge
        color=""
        size="sm"
        leftSection={<IconBoxMultipleFilled size={10} />}
      >
        {value}
      </Badge>
    </Box>
  )
}
CountBadge.displayName = "ImageGroup.CountBadge"
