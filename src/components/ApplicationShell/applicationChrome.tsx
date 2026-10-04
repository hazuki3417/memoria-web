import type { ReactNode } from "react"

export type ApplicationChromeVariant = "authenticated" | "pre-registration"
export type ApplicationChromeFeature =
  | "navigation"
  | "context-switcher"
  | "account-menu"

const visibility: Record<
  ApplicationChromeVariant,
  Record<ApplicationChromeFeature, boolean>
> = {
  authenticated: {
    navigation: true,
    "context-switcher": true,
    "account-menu": true,
  },
  "pre-registration": {
    navigation: false,
    "context-switcher": false,
    "account-menu": false,
  },
}

export function isApplicationChromeFeatureVisible(
  variant: ApplicationChromeVariant,
  feature: ApplicationChromeFeature,
) {
  return visibility[variant][feature]
}

export function ApplicationChromeFeature({
  variant,
  feature,
  children,
}: {
  variant: ApplicationChromeVariant
  feature: ApplicationChromeFeature
  children: ReactNode
}) {
  return isApplicationChromeFeatureVisible(variant, feature) ? children : null
}
