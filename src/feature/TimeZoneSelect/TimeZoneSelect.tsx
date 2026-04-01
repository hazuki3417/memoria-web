import { TIME_ZONES } from "@/constants/date"
import { Select, SelectProps } from "@mantine/core"
import { useMemo } from "react"

export interface TimeZoneSelectProps extends Omit<SelectProps, "data"> {}

export const TimeZoneSelect = (props: TimeZoneSelectProps) => {
  const { searchable = true, ...rest } = props

  const options = useMemo(() => {
    return TIME_ZONES.map((tz) => {
      return {
        value: tz,
        label: tz,
      }
    })
  }, [])

  return <Select data={options} searchable={searchable} {...rest} />
}
