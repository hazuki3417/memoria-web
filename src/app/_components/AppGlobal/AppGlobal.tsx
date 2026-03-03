"use client"
import { ActionPanel } from "@/components"
import { useConfirmContext } from "@/providers"
import { Box, Button, Divider, Modal } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import "client-only"

export interface AppGlobalProps {}

export const AppGlobal = (props: AppGlobalProps) => {
  const confirm = useConfirmContext()

  return (
    <>
      <Notifications position="top-right" limit={3} autoClose={3000} />
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
