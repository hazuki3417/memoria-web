import { useTranslation } from "react-i18next";
import { LinkButton, LinkButtonProps } from "../LinkButton";

export interface SiginInButtonProps extends Omit<LinkButtonProps, "href"> {}

export const SiginInButton = (props: SiginInButtonProps) => {
  const { ...rest } = props;
  const { t } = useTranslation();
  return (
    <LinkButton
      style={{
        minWidth: "90px",
      }}
      {...rest}
      href="/auth/login"
    >
      <span>{t("auth.signIn")}</span>
    </LinkButton>
  );
};
