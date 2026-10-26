export type BrowserVariant = { width: number; url: string }

// Choose the smallest variant that meets the minimum grid thumbnail width.
// Do not rely on the API returning variants in a particular order.
export function selectBrowserThumbnail(
  variants: readonly BrowserVariant[],
): string {
  const sorted = [...variants]
    .filter((v) => v.url)
    .sort((a, b) => a.width - b.width)
  return sorted.find((v) => v.width >= 320)?.url ?? sorted.at(-1)?.url ?? ""
}
