import { RouteNodes } from "@/types/routes"
import { images, settings } from "./routes/index"

export const routes = {
  dashboard: {
    segment: "dashboard",
    title: "ダッシュボード",
    breadcrumb: "ダッシュボード",
    tags: [],
  },
  ...images,
  ...settings,
} as const satisfies RouteNodes
