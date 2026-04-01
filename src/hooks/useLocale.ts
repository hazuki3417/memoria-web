import { Locale } from "@/constants/locale"
import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

export type UseLocaleValue = Locale

export interface UseLocaleAction {
  set: (value: Locale) => void
}

export interface UseLocale {
  value: UseLocaleValue
  action: UseLocaleAction
}

export const useLocale = (): UseLocale => {
  const { i18n } = useTranslation()

  const set = useCallback(
    async (value: Locale) => {
      i18n.changeLanguage(value)
      // NOTE: next.js側に実装されているAPI
      await fetch("/api/locale", {
        method: "POST",
        body: JSON.stringify({ locale: value }),
      })
    },
    [i18n],
  )

  const lang = useMemo(() => {
    return i18n.language as Locale
  }, [i18n.language])

  return {
    value: lang,
    action: {
      set,
    },
  }
}
