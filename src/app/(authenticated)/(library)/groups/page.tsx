"use client"
import { ActionPanel } from "@/components"
import { TAB_FIELDS, Tabs } from "../_components"

const Page = () => {
  return (
    <Tabs value={TAB_FIELDS.group}>
      <ActionPanel mb="xs">
        <ActionPanel.Left>
          <Tabs.List />
        </ActionPanel.Left>
        <ActionPanel.Center></ActionPanel.Center>
        <ActionPanel.Right></ActionPanel.Right>
      </ActionPanel>
      <Tabs.Panel value={TAB_FIELDS.group}>group page</Tabs.Panel>
    </Tabs>
  )
}

export default Page
