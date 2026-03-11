"use client"
import { AnchorButton, LinkButtonProps } from "@/components"
import { Text } from "@mantine/core"
import { useTranslation } from "react-i18next"

export interface SignInButtonProps extends Omit<LinkButtonProps, "href"> {}

export const SignInButton = (props: SignInButtonProps) => {
  const { ...rest } = props
  const { t } = useTranslation()
  return (
    <AnchorButton
      style={{
        minWidth: "90px",
      }}
      {...rest}
      href={"/auth/login?returnTo=/dashboard"}
    >
      <Text>{t("auth.signIn")}</Text>
    </AnchorButton>
  )
}
