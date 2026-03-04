"use client"
import { useUriQuery } from "@/hooks"
import { Box } from "@mantine/core"

const Page = () => {
  const query = useUriQuery<{ targets: string[] }>()
  console.debug("query", query)

  return <Box>編集</Box>
}

export default Page
