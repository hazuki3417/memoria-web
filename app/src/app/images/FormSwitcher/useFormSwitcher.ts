import { useCallback, useState } from "react";

export const MODE = {
  TYPE: {
    SINGLE: "single",
    ALL: "all",
  },
};

export type UseFormSwitcherState = {
  mode: string;
};

export interface UseFormSwitcherHandler {
  single: () => void;
  all: () => void;
  set: (value: string) => void;
}

export interface UseFormSwitcher {
  state: UseFormSwitcherState;
  handler: UseFormSwitcherHandler;
}

export const useFormSwitcher = (): UseFormSwitcher => {
  const [mode, setMode] = useState<string>(MODE.TYPE.ALL);

  const single = useCallback(() => {
    setMode(MODE.TYPE.SINGLE);
  }, []);

  const all = useCallback(() => {
    setMode(MODE.TYPE.ALL);
  }, []);

  return {
    state: { mode },
    handler: {
      single,
      all,
      set: setMode,
    },
  };
};
