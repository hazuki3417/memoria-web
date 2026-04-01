"use client"
import { Locale, SUPPORTED_LOCALES } from "@/constants/locale"
import { useLocale } from "@/hooks"
import { Combobox, InputBase, Text, useCombobox } from "@mantine/core"
import { IconLanguage } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { useCallback, useMemo } from "react"

export interface LangSelectProps {}

export const LangSelect = (props: LangSelectProps) => {
  const {} = props

  const router = useRouter()
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  })

  const lang = useLocale()

  const options = useMemo(() => {
    return SUPPORTED_LOCALES.map((locale) => (
      <Combobox.Option
        value={locale}
        key={locale}
        active={locale === lang.value}
      >
        <Text size="xs">{locale.toLocaleUpperCase()}</Text>
      </Combobox.Option>
    ))
  }, [SUPPORTED_LOCALES])

  const onOptionSubmit = useCallback(
    (value: string) => {
      const locale = value.toLocaleLowerCase() as Locale
      lang.action.set(locale)
      combobox.closeDropdown()
      router.refresh()
    },
    [combobox],
  )

  return (
    <Combobox size="xs" store={combobox} onOptionSubmit={onOptionSubmit}>
      <Combobox.Target>
        <InputBase
          size="xs"
          w={60}
          pointer
          leftSection={<IconLanguage />}
          rightSectionPointerEvents="none"
          value={lang.value.toLocaleUpperCase()}
          onClick={() => combobox.toggleDropdown()}
          readOnly
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
