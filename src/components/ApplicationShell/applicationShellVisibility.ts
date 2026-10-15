export type ApplicationShellMode =
  | "authenticated"
  | "pre-registration"
  | "restricted-flow"
export type ApplicationShellFeature =
  | "navigation"
  | "context-switcher"
  | "account-menu"

const visibility: Record<
  ApplicationShellMode,
  Record<ApplicationShellFeature, boolean>
> = {
  authenticated: {
    navigation: true,
    "context-switcher": true,
    "account-menu": true,
  },
  "restricted-flow": {
    navigation: false,
    "context-switcher": false,
    "account-menu": false,
  },
  "pre-registration": {
    navigation: false,
    "context-switcher": false,
    "account-menu": false,
  },
}

export function isApplicationShellFeatureVisible(
  variant: ApplicationShellMode,
  feature: ApplicationShellFeature,
) {
  return visibility[variant][feature]
}

