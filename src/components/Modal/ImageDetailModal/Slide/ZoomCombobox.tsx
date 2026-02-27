import { Combobox, InputBase, useCombobox } from "@mantine/core"
import {
  ChangeEvent,
  useCallback,
  useMemo,
  useState,
  KeyboardEvent,
  FocusEvent,
  useEffect,
} from "react"

export interface ZoomComboboxHandler {
  onOptionSubmit?: (value: number) => void
  onBlur?: (value: number) => void
}

export interface ZoomComboboxProps {
  value: number
  config: {
    step: number
    min: number
    max: number
  }
  handler?: ZoomComboboxHandler
}

export const ZoomCombobox = (props: ZoomComboboxProps) => {
  const { value, config, handler } = props

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const [zoomLevel, setZoomLevel] = useState(`${value}%`)
  const [changed, setChanged] = useState(false)

  const options = useMemo(() => {
    const levels = createZoomLevel(config)
    return levels.map((level) => {
      return (
        <Combobox.Option value={level.toString()} key={level}>
          {`${level}%`}
        </Combobox.Option>
      )
    })
  }, [config])

  const clampZoomLevel = (value: number) => {
    if (value < config.min) return config.min
    if (value > config.max) return config.max
    return value
  }

  const onOptionSubmit = useCallback(
    (value: string) => {
      combobox.closeDropdown()
      setZoomLevel(`${value}%`)
      handler?.onOptionSubmit?.(Number(value))
    },
    [combobox, handler?.onOptionSubmit],
  )

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      combobox.openDropdown()
      combobox.updateSelectedOptionIndex()

      const input = normalizeInput(event.currentTarget.value)

      setChanged(true)
      setZoomLevel(input)
    },
    [combobox, config],
  )

  const onBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      combobox.closeDropdown()
      if (!changed) return

      setChanged(false)
      setZoomLevel((prev) => {
        const next = clampZoomLevel(Number(prev))
        handler?.onBlur?.(next)
        return `${next}%`
      })
    },
    [combobox, handler?.onBlur],
  )

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget?.blur()
    }
  }, [])

  useEffect(() => {
    setZoomLevel(`${value.toString()}%`)
  }, [value])

  return (
    <Combobox
      size="xs"
      store={combobox}
      withinPortal={false}
      onOptionSubmit={onOptionSubmit}
    >
      <Combobox.Target>
        <InputBase
          size={"xs"}
          w={100}
          rightSection={<Combobox.Chevron />}
          value={zoomLevel}
          pattern="\d{3}"
          maxLength={3}
          onChange={onChange}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          rightSectionPointerEvents="none"
        />
      </Combobox.Target>

      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {options}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

const createZoomLevel = (config: {
  step: number
  min: number
  max: number
}): number[] => {
  const level: number[] = []

  for (let i = config.min; i <= config.max; i += config.step) {
    level.push(i)
  }

  return level
}

const normalizeInput = (input: string) => {
  input = input.replace(/[^0-9]/g, "").slice(0, 3)
  return input
}
