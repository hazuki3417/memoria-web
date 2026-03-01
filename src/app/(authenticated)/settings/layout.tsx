"use client"
import { Box, Container, Flex } from "@mantine/core"
import { usePathname } from "next/navigation"
import { SettingMenu } from "./_components"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children } = props

  const pathname = usePathname()

  return (
    <Container size="xl" p="lg">
      <Flex align="flex-start" gap="xl">
        <SettingMenu current={pathname} w={220} />
        <Box component="section" flex={1}>
          {children}
        </Box>
      </Flex>
    </Container>
  )
}

export default Layout
