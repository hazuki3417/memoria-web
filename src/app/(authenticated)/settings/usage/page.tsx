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
      <SettingSectionTitle>Limits</SettingSectionTitle>
      <SettingSectionDivider />

      <Flex gap="lg" mb="lg">
        <Box flex="1">
          <Stack gap="md">
            <UploadInfoPanel />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md">
          </Stack>
        </Box>
      </Flex>

      <SettingSectionTitle>Usage</SettingSectionTitle>
      <SettingSectionDivider />

      <Flex gap="lg" mb="lg">
        <Box flex="1">
          <Stack gap="md">
            <FileCountInfoPanel />
            <StorageInfoPanel />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md">
            <FileSizeInfoPanel />
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
