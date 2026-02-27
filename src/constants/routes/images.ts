import { RouteNodes } from "@/types/routes"

export const images = {
  images: {
    segment: "images",
    title: "画像一覧",
    breadcrumb: "画像一覧",
    tags: [],
    children: {
      new: {
        segment: "new",
        title: "画像登録",
        breadcrumb: "画像登録",
        tags: [],
      },
    },
  },
} as const satisfies RouteNodes
