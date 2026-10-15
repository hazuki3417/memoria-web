"use client"

import { Combobox, InputBase } from "@mantine/core"
import { useEffect, useState } from "react"
import { useCombobox } from "@mantine/core"

export function ZoomInput({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })
  const [input, setInput] = useState(`${value}%`)
  useEffect(() => setInput(`${value}%`), [value])
  const commit = () => {
    const parsed = Number(input.replace(/[^0-9]/g, ""))
    const next = Math.min(
      300,
      Math.max(50, Number.isFinite(parsed) ? parsed : 100),
    )
    onChange(next)
    setInput(`${next}%`)
  }
  return (
    <Combobox
      store={combobox}
      onOptionSubmit={(option) => {
        onChange(Number(option))
        combobox.closeDropdown()
      }}
    >
      <Combobox.Target>
        <InputBase
          size="xs"
          w={76}
          aria-label="拡大率"
          value={input}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          onChange={(event) => {
            setInput(
              event.currentTarget.value.replace(/[^0-9%]/g, "").slice(0, 4),
            )
            combobox.openDropdown()
          }}
          onFocus={() => combobox.openDropdown()}
          onClick={() => combobox.openDropdown()}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options mah={200} style={{ overflowY: "auto" }}>
          {Array.from({ length: 26 }, (_, index) => 50 + index * 10).map(
            (level) => (
              <Combobox.Option key={level} value={String(level)}>
                {level}%
              </Combobox.Option>
            ),
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}

