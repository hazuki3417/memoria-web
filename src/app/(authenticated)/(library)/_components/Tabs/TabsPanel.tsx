import { Tabs as Base, TabsPanelProps as BaseProps } from "@mantine/core"

export interface TabsPanelProps extends BaseProps {
  children: React.ReactNode
}

export const TabsPanel = (props: TabsPanelProps) => {
  const { children, ...rest } = props
  return (
    <Base.Panel
      {...rest}
      style={{
        display: "flex",
        flex: "1",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {children}
    </Base.Panel>
  )
}
