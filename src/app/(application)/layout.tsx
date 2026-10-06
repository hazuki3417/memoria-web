import { ApplicationShellContainer } from "@/features/application-shell/ApplicationShellContainer"

export default function ApplicationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ApplicationShellContainer>{children}</ApplicationShellContainer>
}
