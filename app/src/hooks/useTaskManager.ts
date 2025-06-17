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
  process: (task: Task<D>) => Promise<void>;
  failOnError: boolean;
};

export interface UseTaskManagerHandler<D = undefined> {
  append: (task: Task<D>[]) => void;
  remove: (key: string[]) => void;
  reset: () => void;
  submit: () => Promise<void>;
}
export interface UseTaskManager<D = undefined> {
  state: UseTaskManagerState<D>;
  handler: UseTaskManagerHandler<D>;
}

export const useTaskManager = <D = undefined>(
  option: UseTaskManagerOption<D>,
): UseTaskManager<D> => {
  const [task, dispatch] = useReducer(taskReducer<D>, {
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

  const execute = async (
    task: Task<D>,
    process: UseTaskManagerOption<D>["process"],
    failOnError: boolean,
  ) => {
    setRunning(task.id);
    try {
      await process(task);
      setSuccess(task.id);
    } catch (err: any) {
      setError(task.id, err.message || "Unknown error");
      if (failOnError) throw new Error(`Task ${task.id} failed`);
    }
  };

  const serial = async (tasks: Task<D>[]) => {
    for (const task of tasks) {
      if (task.status === "success") continue;
      await execute(task, option.process, option.failOnError);
    }
  };

  const parallel = async (tasks: Task<D>[]) => {
    const promises = tasks.map(async (task) => {
      if (task.status === "success") return;
      await execute(task, option.process, option.failOnError);
    });

    return await Promise.all(promises);
  };

  const submit = async () => {
    setAction("submit");
    try {
      if (option.mode === "serial") {
        await serial(task.current.tasks);
      } else if (option.mode === "parallel") {
        await parallel(task.current.tasks);
      } else {
        throw new Error(`Unknown execution mode: ${option.mode}`);
      }
    } catch (e) {
      throw e;
    }
  };

  return {
    state: { tasks: task.current.tasks, meta: { action } },
    handler: {
      append,
      remove,
      reset,
      submit,
    },
  };
};
