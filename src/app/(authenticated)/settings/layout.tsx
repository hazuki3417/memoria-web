"use client"
import { Container, Flex } from "@mantine/core"
import { usePathname } from "next/navigation"
import { SettingMenu } from "./_components"
import { SettingSection } from "./_components/SettingSection"

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
        <SettingSection flex={1}>{children}</SettingSection>
      </Flex>
    </Container>
  )
}

export default Layout
