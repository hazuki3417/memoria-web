"use client"
import { Box, Flex, Stack } from "@mantine/core"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"
import {
  FileCountInfoPanel,
  FileSizeInfoPanel,
  StorageInfoPanel,
  UploadInfoPanel,
} from "./_components"

const Page = () => {

  return (
    <>
      <SettingSectionTitle>Usage</SettingSectionTitle>
      <SettingSectionDivider />
      <Flex gap="lg">
        <Box flex="1">
          <Stack gap="md">
            <UploadInfoPanel mih={152} />
            <FileCountInfoPanel />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md">
            <StorageInfoPanel mih={152} />
            <FileSizeInfoPanel />
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
