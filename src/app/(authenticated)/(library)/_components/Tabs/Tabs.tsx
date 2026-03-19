"use client"
import { defineFieldObject } from "@/lib/field"
import { resolveUri } from "@/lib/url"
import { Tabs as Base, TabsProps as BaseProps } from "@mantine/core"
import { useRouter } from "next/navigation"
import { TabsList } from "./TabsList"
import { TabsPanel } from "./TabsPanel"

const TAB_ID_LIST = ["list", "group"] as const
export const TAB_FIELDS = defineFieldObject(TAB_ID_LIST)

const mapRouteTab: Record<string, string> = {
  [TAB_FIELDS.list]: resolveUri("/images"),
  [TAB_FIELDS.group]: resolveUri("/groups"),
}

export interface TabsProps extends BaseProps {}

export const Tabs = (props: TabsProps) => {
  const { children, ...rest } = props
  const router = useRouter()
  const handleChange = (value: string | null) => {
    switch (value) {
      case TAB_FIELDS.group:
      case TAB_FIELDS.list:
        router.push(mapRouteTab[value])
        return
      default:
        console.error("not found routing page.")
    }
  }

  return (
    <Base
      {...rest}
      color="gray"
      variant="pills"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
      onChange={handleChange}
    >
      {children}
    </Base>
  )
}
Tabs.List = TabsList
Tabs.Panel = TabsPanel
