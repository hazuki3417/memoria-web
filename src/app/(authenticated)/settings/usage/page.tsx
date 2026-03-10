"use client"
import { useGetUsageQuery } from "@/graphql"
import { Box, Flex, Stack } from "@mantine/core"
import { useMemo } from "react"
import { SettingSectionDivider, SettingSectionTitle } from "../_components"
import {
  FileCountInfoPanel,
  FileSizeInfoPanel,
  StorageInfoPanel,
  UploadInfoPanel,
} from "./_components"

const Page = () => {
  const getUsage = useGetUsageQuery()

  const upload = getUsage.data?.me.limit.upload
  const storage = getUsage.data?.me.usage.storage
  const fileStats = getUsage.data?.me.usage.fileStats

  const fileInfo = useMemo(() => {
    if (getUsage.data === undefined) {
      return {
        count: [],
        size: [],
      }
    }

    const data = getUsage.data?.me.usage.fileStats.byType

    return {
      count: data.map((item) => {
        return { type: item.fileType, value: item.fileCount }
      }),
      size: data.map((item) => {
        return { type: item.fileType, value: item.fileSize }
      }),
    }
  }, [getUsage.data?.me.usage.fileStats])

  return (
    <>
      <SettingSectionTitle>Limits</SettingSectionTitle>
      <SettingSectionDivider />

      <Flex gap="lg" mb="lg">
        <Box flex="1">
          <Stack gap="md">
            <UploadInfoPanel
              payload={{
                limitFiles: upload?.maxCount,
                limitSize: upload?.maxSize,
                allowType: upload?.allowedFileType,
              }}
            />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md"></Stack>
        </Box>
      </Flex>

      <SettingSectionTitle>Usage</SettingSectionTitle>
      <SettingSectionDivider />

      <Flex gap="lg" mb="lg">
        <Box flex="1">
          <Stack gap="md">
            <FileCountInfoPanel
              payload={{
                total: fileStats?.totalCount,
                files: fileInfo.count,
              }}
            />
            <StorageInfoPanel
              payload={{
                used: storage?.used,
                capacity: storage?.total,
              }}
            />
          </Stack>
        </Box>
        <Box flex="1">
          <Stack gap="md">
            <FileSizeInfoPanel
              payload={{
                total: fileStats?.totalSize,
                files: fileInfo.size,
              }}
            />
          </Stack>
        </Box>
      </Flex>
    </>
  )
}

export default Page
