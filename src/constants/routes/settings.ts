import { RouteNodes } from "@/types/routes"

export const settings = {
  settings: {
    segment: "settings",
    title: "settings",
    breadcrumb: "settings",
    tags: [],
    children: {
      profile: {
        segment: "profile",
        title: "profile",
        breadcrumb: "profile",
        tags: [],
      },
      notifications: {
        segment: "notifications",
        title: "notifications",
        breadcrumb: "notifications",
        tags: [],
      },
      preferences: {
        segment: "preferences",
        title: "preferences",
        breadcrumb: "preferences",
        tags: [],
      },
      usage: {
        segment: "usage",
        title: "usage",
        breadcrumb: "usage",
        tags: [],
      },
    },
  },
} as const satisfies RouteNodes
