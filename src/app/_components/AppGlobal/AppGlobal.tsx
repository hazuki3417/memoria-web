"use client"
import { ActionPanel } from "@/components"
import { useConfirmContext } from "@/providers"
import { Box, Button, Flex, Modal } from "@mantine/core"
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
        <Box>{confirm.value.payload?.body}</Box>
        <ActionPanel>
          <ActionPanel.Left></ActionPanel.Left>
          <ActionPanel.Center>
            <Flex gap="xs">
              <Button onClick={confirm.control.cancel}>キャンセル</Button>
              <Button onClick={confirm.control.confirm}>OK</Button>
            </Flex>
          </ActionPanel.Center>
          <ActionPanel.Right></ActionPanel.Right>
        </ActionPanel>
      </Modal>
    </>
  )
}
