import { useNavLink } from "@/hooks"
import { resolveUri } from "@/lib/url"
import { Box, BoxProps, NavLink, Stack } from "@mantine/core"
import {
  IconActivity,
  IconAdjustments,
  IconBell,
  IconUser,
} from "@tabler/icons-react"

export interface SettingMenuProps extends Omit<BoxProps, "component"> {
  current: string
}

export const SettingMenu = (props: SettingMenuProps) => {
  const { current, ...rest } = props

  const userMenu = useNavLink({
    current,
    items: [
      {
        label: "Profile",
        href: resolveUri("/settings/profile"),
        leftSection: <IconUser size={20} />,
      },
      {
        label: "Notifications",
        href: resolveUri("/settings/notifications"),
        leftSection: <IconBell size={20} />,
      },
      {
        label: "Preferences",
        href: resolveUri("/settings/preferences"),
        leftSection: <IconAdjustments size={20} />,
      },
      {
        label: "Usage",
        href: resolveUri("/settings/usage"),
        leftSection: <IconActivity size={20} />,
      },
    ],
  })

  return (
    <Box component="aside" {...rest}>
      <Stack gap={0}>
        <Box
          component="ul"
          style={(theme) => ({
            listStyle: "none",
            margin: 0,
            padding: 0,
          })}
        >
          {userMenu.map((item) => {
            const { href, ...less } = item
            return (
              <Box
                key={href}
                component="li"
                style={(theme) => ({
                  margin: 0,
                  padding: 0,
                })}
              >
                <NavLink
                  href={href}
                  style={(theme) => ({ padding: "4px 8px" })}
                  {...less}
                />
              </Box>
            )
          })}
        </Box>
      </Stack>
    </Box>
  )
}
