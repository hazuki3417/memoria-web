"use client"
import { Box } from "@mantine/core"
import { useTranslation } from "react-i18next"

const Page = () => {
  const { t } = useTranslation()
  return (
    <Box>
      <p>Next.js検証用リポジトリ</p>
      <h1>{t("hello")}</h1>
    </Box>
  )
}
export default Page
