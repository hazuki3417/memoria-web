import { Tabs } from "@mantine/core"
import { t } from "i18next"
import { TAB_FIELDS } from "./Tabs"

export interface TabsListProps {}

export const TabsList = (props: TabsListProps) => {
  const {} = props
  return (
    <>
      <Tabs.Tab value={TAB_FIELDS.list}>{t("label.list")}</Tabs.Tab>
      <Tabs.Tab value={TAB_FIELDS.group}>{t("label.group")}</Tabs.Tab>
    </>
  )
}
