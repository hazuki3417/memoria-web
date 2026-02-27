"use client"
import { useTranslation } from "react-i18next"
import { AnchorButton, LinkButtonProps } from "@/components/Button"
import { Text } from "@mantine/core"

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
