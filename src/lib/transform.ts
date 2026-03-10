import { filesize } from "filesize"
import { StorageUsage } from "./storage"

export const FILE_SIZE_PREFIX = {
  SI: "SI",
  BINARY: "BINARY",
} as const
export type FileSizePrefix =
  (typeof FILE_SIZE_PREFIX)[keyof typeof FILE_SIZE_PREFIX]
export const DEFAULT_FILE_SIZE_PREFIX = FILE_SIZE_PREFIX.SI

const transformEnNumber = (args: { value: number }) => {
  const { value } = args
  const formatter = new Intl.NumberFormat("en-US")
  return formatter.format(value)
}

const transformFileSize = (args: {
  bytes: number
  prefix?: FileSizePrefix
}) => {
  const { bytes, prefix = DEFAULT_FILE_SIZE_PREFIX } = args
  const result = filesize(bytes, {
    base: prefix === FILE_SIZE_PREFIX.BINARY ? 2 : 10,
    standard: prefix === FILE_SIZE_PREFIX.BINARY ? "iec" : "jedec",
    output: "object",
  })

  return {
    value: result.value,
    unit: result.unit,
  }
}

const transformStorageUsage = (args: {
  values: StorageUsage
  prefix?: FileSizePrefix
}) => {
  const { values, prefix = DEFAULT_FILE_SIZE_PREFIX } = args
  return {
    used: {
      ...values.used,
      percent: Math.round(values.used.percent),
      size: transformFileSize({ bytes: values.used.byte, prefix }),
    },
    availabled: {
      ...values.availabled,
      percent: Math.round(values.availabled.percent),
      size: transformFileSize({ bytes: values.availabled.byte, prefix }),
    },
    capacity: {
      ...values.capacity,
      percent: Math.round(values.capacity.percent),
      size: transformFileSize({ bytes: values.capacity.byte, prefix }),
    },
  }
}

export const transform = {
  num: {
    en: transformEnNumber,
  },
  storage: transformStorageUsage,
  file: {
    size: transformFileSize,
  },
}
