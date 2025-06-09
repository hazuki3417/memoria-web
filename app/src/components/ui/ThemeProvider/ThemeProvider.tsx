import { MantineProvider, type MantineProviderProps } from "@mantine/core";
import { theme } from "@/lib/theme";

export interface ThemeProviderProps
  extends Omit<MantineProviderProps, "theme"> {}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { children, ...rest } = props;
  return (
    <MantineProvider theme={theme} {...rest}>
      {children}
    </MantineProvider>
  );
};
