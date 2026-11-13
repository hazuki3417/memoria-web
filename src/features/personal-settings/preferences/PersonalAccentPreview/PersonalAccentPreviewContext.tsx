"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

/** 画面内の有効なAccent選択のみをShellへ伝える。保存DraftやRetry情報は保持しない。 */
type Preview = {
  color: string | null
  setColor: (color: string | null) => void
}
const Context = createContext<Preview | null>(null)

export const PersonalAccentPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [color, setColor] = useState<string | null>(null)
  return <Context.Provider value={{ color, setColor }}>{children}</Context.Provider>
}

export const usePersonalAccentPreview = () => useContext(Context)
