"use client"

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  createPersonalPreferencesSession,
  type PreferencesSessionSnapshot,
} from "./personalPreferencesSession"

type Controller = ReturnType<typeof createPersonalPreferencesSession>

const Context = createContext<Controller | null>(null)
const empty: PreferencesSessionSnapshot = {
  confirmed: null,
  draftPatch: {},
  accentDraft: null,
  saveStatus: "idle",
  failure: null,
  inspected: false,
  observedMatches: false,
  discardRevision: 0,
}

export function PersonalPreferencesSessionProvider({ children }: { children: ReactNode }) {
  const controllerRef = useRef<Controller | null>(null)
  if (!controllerRef.current) controllerRef.current = createPersonalPreferencesSession()
  return <Context.Provider value={controllerRef.current}>{children}</Context.Provider>
}

/** Outside Application Shell (e.g. Storybook), no session owner is required. */
export function usePersonalPreferencesSession() {
  const controller = useContext(Context)
  const subscribe = useCallback(
    (listener: () => void) => controller?.subscribe(listener) ?? (() => undefined),
    [controller],
  )
  const getSnapshot = useCallback(
    () => controller?.getSnapshot() ?? empty,
    [controller],
  )
  return {
    controller,
    snapshot: useSyncExternalStore(subscribe, getSnapshot, getSnapshot),
  }
}
