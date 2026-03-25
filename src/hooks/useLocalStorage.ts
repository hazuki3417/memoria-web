"use client"
import "client-only"
import { useCallback, useEffect, useState } from "react"

export type UseLocalStorageValue<T> = T

export type UseLocalStorageOption<T> = {
  key: string
  init: T
}

export interface UseLocalStorageControl<T> {}

export interface UseLocalStorageAction<T> {
  set: (value: T) => void
  get: () => T
  reset: () => void
}

export interface UseLocalStorage<T> {
  value: UseLocalStorageValue<T>
  // control: UseLocalStorageControl<T>
  action: UseLocalStorageAction<T>
}

export const useLocalStorage = <T>(
  option: UseLocalStorageOption<T>,
): UseLocalStorage<T> => {
  const { key, init } = option

  const [storage, setStorage] = useState<T>(() => {
    if (typeof window === "undefined") {
      return init
    }

    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : init
    } catch {
      return init
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storage))
    } catch (err) {
      console.error(`Failed to save key "${key}"`, err)
    }
  }, [key, storage])

  const set = useCallback((value: T) => setStorage(value), [])
  const get = useCallback(() => storage, [storage])
  const reset = useCallback(() => setStorage(init), [init])

  return {
    value: storage,
    action: {
      set,
      get,
      reset,
    },
  }
}
