"use client"
import { useUriQuery } from "@/hooks"
import { Box } from "@mantine/core"

const Page = () => {
  const query = useUriQuery<{ targets: string[] }>()

  return <Box>編集</Box>
}

export default Page
