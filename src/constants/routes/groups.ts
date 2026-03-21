import { RouteNodes } from "@/types/routes"

export const groups = {
  groups: {
    segment: "groups",
    title: "グループ一覧",
    breadcrumb: "グループ一覧",
    tags: [],
    children: {
      new: {
        segment: "new",
        title: "グループ登録",
        breadcrumb: "グループ登録",
        tags: [],
      },
      ":id": {
        segment: ":id",
        title: "グループ詳細",
        breadcrumb: "グループ詳細",
        tags: [],
        children: {
          edit: {
            segment: "edit",
            title: "グループ編集",
            breadcrumb: "グループ編集",
            tags: [],
          },
        }
      },
    },
  },
} as const satisfies RouteNodes
