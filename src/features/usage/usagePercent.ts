export function usagePercent(bytes: number, limitBytes: number): number {
  if (limitBytes <= 0) return 0
  return Math.round((bytes / limitBytes) * 1000) / 10
}
