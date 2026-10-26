export type DashboardVariant = { url: string; width: number }

// Match the Media Browser's square thumbnail selection contract.
export function selectDashboardThumbnail(
  variants: readonly DashboardVariant[] = [],
): string {
  const sorted = [...variants]
    .filter((item) => item.url)
    .sort((a, b) => a.width - b.width)
  return (
    sorted.find((item) => item.width >= 320)?.url ?? sorted.at(-1)?.url ?? ""
  )
}
