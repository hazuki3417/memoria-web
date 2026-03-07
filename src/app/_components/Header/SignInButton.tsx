"use client"
import { AnchorButton, LinkButtonProps } from "@/components"
import { Text } from "@mantine/core"
import { useTranslation } from "react-i18next"

export interface SiginInButtonProps extends Omit<LinkButtonProps, "href"> {}

export const SiginInButton = (props: SiginInButtonProps) => {
  const { ...rest } = props
  const { t } = useTranslation()
  return (
    <AnchorButton
      style={{
        minWidth: "90px",
      }}
      {...rest}
      href="/auth/login"
    >
      <Text>{t("auth.signIn")}</Text>
    </AnchorButton>
  )
}
