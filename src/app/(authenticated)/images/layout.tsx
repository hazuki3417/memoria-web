"use client"

import { Container } from "@mantine/core"

type LayoutProps = {
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { children } = props

  return (
    <Container p="lg" m={0} fluid>
      {children}
    </Container>
  )
}

export default Layout
