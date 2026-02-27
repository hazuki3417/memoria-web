import { UnitType } from "@/lib"

type ViewConfig = {
  file: {
    size: {
      decimals: number
      unit: UnitType
    }
  }
}

export const viewConfig: ViewConfig = {
  file: {
    size: {
      decimals: 2,
      unit: "si",
    },
  },
}
