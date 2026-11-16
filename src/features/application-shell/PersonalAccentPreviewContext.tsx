"use client"

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react"

/** 画面の有効Accent選択のみをShellへ伝える。古い画面Ownerは新しいPreviewを解放できない。 */
type PreviewValue = { color: string; owner: number }
type Preview = {
  color: string | null
  owner: number | null
  setPreview: (color: string) => number
  clearPreview: (owner: number) => void
}
const Context = createContext<Preview | null>(null)

export const PersonalAccentPreviewProvider = ({ children }: { children: ReactNode }) => {
  const [preview, setCurrentPreview] = useState<PreviewValue | null>(null)
  const nextOwner = useRef(0)
  const setPreview = useCallback((color: string) => {
    const owner = ++nextOwner.current
    setCurrentPreview({ color, owner })
    return owner
  }, [])
  const clearPreview = useCallback((owner: number) => {
    setCurrentPreview(current => current?.owner === owner ? null : current)
  }, [])
  const value = useMemo(() => ({
    color: preview?.color ?? null,
    owner: preview?.owner ?? null,
    setPreview,
    clearPreview,
  }), [preview, setPreview, clearPreview])
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const usePersonalAccentPreview = () => useContext(Context)
