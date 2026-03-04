"use client"
import { ActionPanel } from "@/components"
import { FeedbackKind, useConfirmContext } from "@/providers"
import { useFeedbackContext } from "@/providers/FeedbackProvider"
import { Box, Button, Divider, Modal } from "@mantine/core"
import {
  NotificationData,
  notifications,
  Notifications,
} from "@mantine/notifications"
import "client-only"
import { useEffect } from "react"

const mapKindColor: Record<FeedbackKind, NotificationData["color"]> = {
  success: "green",
  info: "blue",
  warning: "yellow",
  error: "red",
}

export interface AppGlobalProps {}

export const AppGlobal = (props: AppGlobalProps) => {
  const feedback = useFeedbackContext()
  const confirm = useConfirmContext()

  useEffect(() => {
    const unsubscribe = feedback.control.subscribe((event) => {
      notifications.show({
        color: mapKindColor[event.kind],
        title: event.payload?.title,
        message: event.payload?.body,
      })
    })

    return unsubscribe
  }, [feedback])

  return (
    <>
      {/* feedback context*/}
      <Notifications position="top-right" limit={3} autoClose={3000} />
      {/* confirm context */}
      <Modal
        title={confirm.value.payload?.title}
        opened={confirm.value.payload !== null}
        onClose={confirm.control.dismiss}
        centered
      >
        <Divider />
        <Box py="lg">{confirm.value.payload?.body}</Box>
        <Divider mb={"md"} />
        <ActionPanel>
          <ActionPanel.Left></ActionPanel.Left>
          <ActionPanel.Center>
            <Button onClick={confirm.control.confirm}>OK</Button>
          </ActionPanel.Center>
          <ActionPanel.Right></ActionPanel.Right>
        </ActionPanel>
      </Modal>
    </>
  )
}
