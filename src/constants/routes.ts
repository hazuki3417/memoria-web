import { RouteNodes } from "@/types/routes"
import { groups, images, settings } from "./routes/index"

export const routes = {
  auth: {
    segment: "auth",
    title: "",
    breadcrumb: "",
    tags: [],
    children: {
      login: {
        segment: "login",
        title: "ログイン",
        breadcrumb: "ログイン",
        tags: [],
      },
      logout: {
        segment: "logout",
        title: "ログアウト",
        breadcrumb: "ログアウト",
        tags: [],
      },
    },
  },
  dashboard: {
    segment: "dashboard",
    title: "ダッシュボード",
    breadcrumb: "ダッシュボード",
    tags: [],
  },
  ...images,
  ...groups,
  ...settings,
} as const satisfies RouteNodes
