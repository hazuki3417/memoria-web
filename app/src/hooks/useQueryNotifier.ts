import { createNotificationTypeData } from "@/lib/notifications";
import { ApolloError } from "@apollo/client";
import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";

export type UseQueryNotifierOption = {
  loading: boolean;
  error?: ApolloError;
};

export const useQueryNotifier = (option: UseQueryNotifierOption) => {
  const { loading, error } = option;
  const hasExecuted = useRef(false); // query実行フラグ

  useEffect(() => {
    if (loading) {
      hasExecuted.current = true;
      return;
    }

    if (!hasExecuted.current) {
      return;
    }

    if (error === undefined) {
      // 成功
      // NOTE: queryのときは通知をださない
      return;
    } else {
      // 失敗
      notifications.show(
        createNotificationTypeData("error", {
          title: "失敗",
          message: error.message,
        }),
      );
    }

    // 通知を出したらフラグをリセット
    hasExecuted.current = false;
  }, [loading, error]);
};
