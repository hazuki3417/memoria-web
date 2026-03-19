import { Tabs as Base, TabsPanelProps as BaseProps } from "@mantine/core"

export interface TabsPanelProps extends BaseProps {}

export const TabsPanel = (props: TabsPanelProps) => {
  const { ...rest } = props
  return <Base.Panel {...rest} />
}
