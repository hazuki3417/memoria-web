import "@/lib/i18n";
import i18n from "@/lib/i18n";
import { I18nextProvider } from "react-i18next";

export interface LangProviderProps {
  children: React.ReactNode;
}

export const LangProvider = (props: LangProviderProps) => {
  const { children, ...rest } = props;
  return (
    <I18nextProvider i18n={i18n} {...rest}>
      {children}
    </I18nextProvider>
  );
};
