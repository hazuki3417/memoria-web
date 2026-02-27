import { MantineProvider, type MantineProviderProps } from "@mantine/core"

export interface ThemeProviderProps extends MantineProviderProps {}

export const ThemeProvider = (props: ThemeProviderProps) => {
  const { children, ...rest } = props
  return <MantineProvider {...rest}>{children}</MantineProvider>
}
