"use client"
import { createNotificationTypeData } from "@/lib/notifications"
import { ApolloError } from "@apollo/client"
import { notifications } from "@mantine/notifications"
import "client-only"
import { useEffect, useRef } from "react"

export type UseMutationNotifierOption = {
  loading: boolean
  error?: ApolloError
}

export const useMutationNotifier = (option: UseMutationNotifierOption) => {
  const { loading, error } = option
  const hasExecuted = useRef(false) // mutation実行フラグ

  useEffect(() => {
    if (loading) {
      hasExecuted.current = true
      return
    }

    if (!hasExecuted.current) {
      return
    }

    if (error === undefined) {
      // 成功
      notifications.show(
        createNotificationTypeData("success", {
          title: "成功",
          message: "処理が完了しました。",
        }),
      )
    } else {
      // 失敗
      notifications.show(
        createNotificationTypeData("error", {
          title: "失敗",
          message: error.message,
        }),
      )
    }

    // 通知を出したらフラグをリセット
    hasExecuted.current = false
  }, [loading, error])
}
