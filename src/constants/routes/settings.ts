import { RouteNodes } from "@/types/routes"

export const settings = {
  settings: {
    segment: "settings",
    title: "設定",
    breadcrumb: "設定",
    tags: [],
    children: {
      profile: {
        segment: "profile",
        title: "プロファイル",
        breadcrumb: "プロファイル",
        tags: [],
      },
      notifications: {
        segment: "notifications",
        title: "通知",
        breadcrumb: "通知",
        tags: [],
      },
    },
  },
} as const satisfies RouteNodes
