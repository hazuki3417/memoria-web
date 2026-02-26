import { useCallback, useEffect, useState } from "react";

export type UseLocalStorageState<T> = {
  value: T;
};

export type UseLocalStorageOption<T> = {
  key: string;
  init: T;
};

export interface UseLocalStorageHandler<T> {
  set: (value: T) => void;
  get: () => T;
  reset: () => void;
}

export interface UseLocalStorage<T> {
  state: UseLocalStorageState<T>;
  handler: UseLocalStorageHandler<T>;
}

export const useLocalStorage = <T>(
  option: UseLocalStorageOption<T>,
): UseLocalStorage<T> => {
  if (typeof window === "undefined") {
    throw new Error(
      "useLocalStorage must be used in a client-side environment.",
    );
  }

  const { key, init } = option;
  const [storage, setStorage] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : init;
    } catch (error) {
      console.warn(`[useLocalStorage] failed to load key "${key}"`, error);
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storage));
    } catch (err) {
      console.error(`[useLocalStorage] Failed to save key "${key}"`, err);
    }
  }, [key, storage]);

  const set = useCallback((value: T) => setStorage(value), []);
  const get = useCallback(() => storage, [storage]);
  const reset = useCallback(() => setStorage(init), [init]);

  return {
    state: { value: storage },
    handler: {
      set,
      get,
      reset,
    },
  };
};
