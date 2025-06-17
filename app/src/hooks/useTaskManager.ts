import { Task, taskReducer } from "@/reducers";
import { ActionType } from "@/reducers/util";
import { useCallback, useReducer, useState } from "react";

export type UseTaskManagerAction = ActionType<
  "append" | "remove" | "reset" | "submit"
>;

export type UseTaskManagerState<D = undefined> = {
  tasks: Task<D>[];
  meta: {
    action: UseTaskManagerAction;
  };
};

export type UseTaskManagerOption<D = undefined> = {
  mode: "serial" | "parallel";
  failOnError: boolean;
};

export type Process<D> = (task: Task<D>, index: number) => Promise<void>;
export interface UseTaskManagerHandler<D = undefined> {
  append: (task: Task<D>[]) => void;
  remove: (key: string[]) => void;
  reset: () => void;
  submit: (process: Process<D>) => Promise<void>;
}
export interface UseTaskManager<D = undefined> {
  state: UseTaskManagerState<D>;
  handler: UseTaskManagerHandler<D>;
}

export const useTaskManager = <D = undefined>(
  option: UseTaskManagerOption<D>,
): UseTaskManager<D> => {
  const [state, dispatch] = useReducer(taskReducer<D>, {
    current: { tasks: [] },
    meta: { action: "idle" },
  });

  const [action, setAction] = useState<UseTaskManagerAction>("idle");

  const append = useCallback((task: Task<D>[]) => {
    setAction("append");
    dispatch({ type: "append", payload: task });
  }, []);

  const remove = useCallback((key: string[]) => {
    setAction("remove");
    dispatch({ type: "remove", key });
  }, []);

  const reset = useCallback(() => {
    setAction("reset");
    dispatch({ type: "reset" });
  }, []);

  const setRunning = useCallback((key: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "running",
      },
    });
  }, []);

  const setSuccess = useCallback((key: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "success",
      },
    });
  }, []);

  const setError = useCallback((key: string, error?: string) => {
    dispatch({
      type: "update",
      key,
      payload: {
        status: "error",
        error,
      },
    });
  }, []);

  const runner = async (task: Task<D>, index: number, callback: Process<D>) => {
    setRunning(task.id);
    try {
      await callback(task, index);
      setSuccess(task.id);
    } catch (err: any) {
      setError(task.id, err.message || "Unknown error");
      if (option.failOnError) throw new Error(`Task ${task.id} failed`);
    }
  };

  const serial = async (callback: Process<D>) => {
    const tasks = state.current.tasks;
    for (const [index, task] of tasks.entries()) {
      if (task.status === "success") continue;
      await runner(task, index, callback);
    }
  };

  const parallel = async (callback: Process<D>) => {
    const tasks = state.current.tasks;
    const promises = tasks.map(async (task, index) => {
      if (task.status === "success") return;
      await runner(task, index, callback);
    });
    return await Promise.all(promises);
  };

  const submit = async (process: Process<D>) => {
    setAction("submit");
    try {
      if (option.mode === "serial") {
        await serial(process);
      } else if (option.mode === "parallel") {
        await parallel(process);
      } else {
        throw new Error(`Unknown execution mode: ${option.mode}`);
      }
    } catch (e) {
      throw e;
    }
  };

  return {
    state: { tasks: state.current.tasks, meta: { action } },
    handler: {
      append,
      remove,
      reset,
      submit,
    },
  };
};
