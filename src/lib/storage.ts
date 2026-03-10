export type Metric = {
  byte: number
  percent: number
}

export type StorageUsage = {
  used: Metric
  availabled: Metric
  capacity: Metric
}

export const calcStorageUsage = (args: {
  used: number
  capacity: number
}): StorageUsage => {
  const { used, capacity } = args

  if (capacity <= 0) {
    return {
      used: { byte: 0, percent: 0 },
      availabled: { byte: 0, percent: 0 },
      capacity: { byte: 0, percent: 0 },
    }
  }

  const availabled = Math.max(capacity - used, 0)
  const percent = (used / capacity) * 100
  const safe = Math.min(Math.max(percent, 0), 100)

  return {
    used: { byte: used, percent: safe },
    availabled: { byte: availabled, percent: 100 - safe },
    capacity: { byte: capacity, percent: 100 },
  }
}
