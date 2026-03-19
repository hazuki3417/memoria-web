import { RouteNodes } from "@/types/routes"

export const groups = {
  groups: {
    segment: "groups",
    title: "グループ一覧",
    breadcrumb: "グループ一覧",
    tags: [],
  },
} as const satisfies RouteNodes
