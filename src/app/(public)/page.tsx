"use client"
import { Auth } from "@/components/Auth/Csr"
import { Box } from "@mantine/core"
import { useTranslation } from "react-i18next"

const Page = () => {
  const { t } = useTranslation()
  return (
    <Box>
      <Auth>
        <Auth.SignedIn>sign in</Auth.SignedIn>
        <Auth.SignedOut>sign out</Auth.SignedOut>
      </Auth>
      <p>Next.js検証用リポジトリ</p>
      <h1>{t("hello")}</h1>
    </Box>
  )
}
export default Page
